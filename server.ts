import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'OrderSaathi Backend API',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// AI WhatsApp Message to Order Parser
app.post('/api/ai/parse-whatsapp-order', async (req: Request, res: Response) => {
  try {
    const { text, existingProducts = [], existingCustomers = [] } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text prompt is required' });
    }

    // Attempt Gemini parsing if available
    if (aiClient) {
      try {
        const prompt = `You are OrderSaathi AI, an intelligent order extraction engine specialized in Indian wholesale, textile, and B2B trade.
The user pasted an informal WhatsApp order message from a customer or trader.

WHATSAPP TEXT TO EXTRACT:
"""
${text}
"""

KNOWN PRODUCT CATALOGUE FOR THIS BUSINESS:
${JSON.stringify(
  existingProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    sellingPrice: p.sellingPrice,
    unit: p.unit,
    variants: p.variants?.map((v: any) => v.name) || [],
  })),
  null,
  2
)}

KNOWN CUSTOMERS:
${JSON.stringify(
  existingCustomers.map((c: any) => ({
    id: c.id,
    name: c.name,
    businessName: c.businessName,
    phone: c.phone,
  })),
  null,
  2
)}

EXTRACTION RULES:
1. Identify the customer: Look for business name, trader name, or contact clues. If matched to a known customer, return their customerId.
2. Extract all line items:
   - Identify product name and description.
   - Match to known catalogue product if possible (return matchedProductId and catalogue sellingPrice).
   - Quantity (number) and unit (e.g., pcs, meters, boxes, sets, rolls, thaan). Default to 'pcs' if not specified.
   - Variants / size / color if mentioned (e.g. "size M", "Maroon", "XL").
   - Explicit price if mentioned in message (or catalogue sellingPrice if matched).
   - Flag items:
     - status: "matched" (found in catalogue and price known)
     - "unknown_product" (not found in catalogue, user must verify)
     - "ambiguous_quantity" (quantity unclear or missing)
     - "missing_price" (price unknown and not in catalogue)
3. Extract delivery notes, requested dispatch date, or payment terms if mentioned.
4. Confidence score (0.0 to 1.0) on overall extraction quality.

Return strictly conforming JSON.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                detectedCustomerName: { type: Type.STRING },
                matchedCustomerId: { type: Type.STRING },
                deliveryNotes: { type: Type.STRING },
                requestedDeliveryDate: { type: Type.STRING },
                paymentTerms: { type: Type.STRING },
                confidenceScore: { type: Type.NUMBER },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      rawText: { type: Type.STRING },
                      productName: { type: Type.STRING },
                      matchedProductId: { type: Type.STRING },
                      sku: { type: Type.STRING },
                      quantity: { type: Type.NUMBER },
                      unit: { type: Type.STRING },
                      variant: { type: Type.STRING },
                      unitPrice: { type: Type.NUMBER },
                      status: {
                        type: Type.STRING,
                        description: 'matched | unknown_product | ambiguous_quantity | missing_price',
                      },
                      notes: { type: Type.STRING },
                    },
                    required: ['productName', 'quantity', 'unit', 'status'],
                  },
                },
              },
              required: ['detectedCustomerName', 'items'],
            },
          },
        });

        const parsedJson = JSON.parse(response.text || '{}');
        return res.json({
          source: 'gemini-ai',
          ...parsedJson,
        });
      } catch (geminiError: any) {
        console.warn('Gemini extraction failed, falling back to rule-based engine:', geminiError?.message);
      }
    }

    // High quality Rule-Based / Heuristic Fallback Engine
    const lines = text.split(/[\n,;]+/).map((l: string) => l.trim()).filter(Boolean);
    let detectedCustomerName = '';
    let matchedCustomerId = '';
    const items: any[] = [];
    let deliveryNotes = '';

    // Check first line for customer name
    const firstLine = lines[0] || '';
    if (firstLine.includes(':') || firstLine.toLowerCase().includes('order from') || firstLine.toLowerCase().includes('traders')) {
      const parts = firstLine.split(':');
      detectedCustomerName = parts[0].replace(/^(order from|order by|from)/i, '').trim();
    }

    // Match customer if exists
    if (detectedCustomerName) {
      const match = existingCustomers.find((c: any) =>
        c.name.toLowerCase().includes(detectedCustomerName.toLowerCase()) ||
        c.businessName?.toLowerCase().includes(detectedCustomerName.toLowerCase())
      );
      if (match) {
        matchedCustomerId = match.id;
        detectedCustomerName = match.businessName || match.name;
      }
    }

    // Parse items line by line
    for (const line of lines) {
      if (line === firstLine && detectedCustomerName && !firstLine.includes('pc') && !firstLine.includes('meter')) {
        continue;
      }

      // Check delivery instructions
      if (/delivery|dispatch|urgent|friday|monday|tuesday|wednesday|thursday|saturday|sunday|delv/i.test(line)) {
        deliveryNotes += (deliveryNotes ? ', ' : '') + line;
        continue;
      }

      // Match patterns like "20 blue shirts size M", "10 pcs Cotton Saree @ 450", "30 rayon kurti"
      const qtyMatch = line.match(/(\d+)\s*(pcs?|pieces?|mtrs?|meters?|boxes?|sets?|than|roll)?/i);
      const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
      const unit = qtyMatch && qtyMatch[2] ? qtyMatch[2].toLowerCase() : 'pcs';

      // Match price pattern like "@ 450", "rs 500", "500/-", "rate 450"
      const priceMatch = line.match(/(?:@|rs\.?|inr|rate|₹)\s*(\d+(?:\.\d{2})?)/i);
      const unitPrice = priceMatch ? parseFloat(priceMatch[1]) : 0;

      // Extract size / variant like "size M", "XL", "size 38"
      const sizeMatch = line.match(/\b(size\s*[smlx0-9]+|[smlx]{1,3}|[2-4][0-9])\b/i);
      const variant = sizeMatch ? sizeMatch[0] : '';

      // Clean line for product title
      let cleanTitle = line
        .replace(/(\d+)\s*(pcs?|pieces?|mtrs?|meters?|boxes?|sets?|than|roll)?/gi, '')
        .replace(/(?:@|rs\.?|inr|rate|₹)\s*(\d+(?:\.\d{2})?)/gi, '')
        .replace(/\b(size\s*[smlx0-9]+)\b/gi, '')
        .trim();

      if (!cleanTitle) cleanTitle = line;

      // Find matching product in catalogue
      const matchedProd = existingProducts.find((p: any) => {
        const pName = p.name.toLowerCase();
        const cTitle = cleanTitle.toLowerCase();
        return cTitle.includes(pName) || pName.includes(cTitle);
      });

      const finalPrice = unitPrice || (matchedProd ? matchedProd.sellingPrice : 0);
      let status = 'matched';
      if (!matchedProd) status = 'unknown_product';
      else if (!finalPrice) status = 'missing_price';
      else if (!qtyMatch) status = 'ambiguous_quantity';

      items.push({
        rawText: line,
        productName: matchedProd ? matchedProd.name : cleanTitle,
        matchedProductId: matchedProd ? matchedProd.id : '',
        sku: matchedProd ? matchedProd.sku : '',
        quantity,
        unit,
        variant,
        unitPrice: finalPrice,
        status,
        notes: '',
      });
    }

    res.json({
      source: 'heuristic-engine',
      detectedCustomerName: detectedCustomerName || 'Unassigned Customer',
      matchedCustomerId,
      deliveryNotes,
      requestedDeliveryDate: '',
      paymentTerms: 'Payment within 15 days',
      confidenceScore: 0.85,
      items: items.length > 0 ? items : [
        {
          rawText: text,
          productName: 'Sample Product from Order',
          matchedProductId: '',
          quantity: 10,
          unit: 'pcs',
          variant: '',
          unitPrice: 0,
          status: 'unknown_product',
          notes: 'Please review and select from catalogue',
        },
      ],
    });
  } catch (err: any) {
    console.error('Error in parse-whatsapp-order:', err);
    res.status(500).json({ error: err.message || 'Failed to parse order text' });
  }
});

// AI Order Summary Generator for Customer WhatsApp
app.post('/api/ai/generate-summary', async (req: Request, res: Response) => {
  try {
    const { order, customer, business, language = 'gu' } = req.body;

    const languageNames: Record<string, string> = {
      gu: 'Gujarati (ગુજરાતી)',
      hi: 'Hindi (हिन्दी)',
      en: 'English',
    };

    const targetLang = languageNames[language] || 'Gujarati';

    if (aiClient) {
      try {
        const prompt = `You are OrderSaathi AI. Generate a professional, polite, and clear order confirmation message ready to be sent to a wholesale customer via WhatsApp.
Target Language: ${targetLang}

Business Details:
Name: ${business?.name || 'Ambika Textiles'}
Phone: ${business?.phone || ''}
City: ${business?.city || 'Surat, Gujarat'}

Customer Details:
Name: ${customer?.name || ''}
Business: ${customer?.businessName || ''}

Order Details:
Order Number: ${order?.orderNumber || 'ORD-001'}
Date: ${order?.createdAt || new Date().toISOString().split('T')[0]}
Items:
${order?.items?.map((it: any) => `- ${it.productName} (${it.variant || ''}): ${it.quantity} ${it.unit} @ ₹${it.unitPrice} = ₹${it.total}`).join('\n')}
Subtotal: ₹${order?.subtotal || 0}
GST Tax: ₹${order?.taxAmount || 0}
Total Amount: ₹${order?.grandTotal || 0}
Advance Paid: ₹${order?.amountPaid || 0}
Balance Due: ₹${order?.balanceDue || 0}
Delivery Notes: ${order?.deliveryNotes || 'Standard Dispatch'}

Requirements:
- Polished Indian B2B trade tone (respectful, clear, professional).
- Use proper Gujarati/Hindi numerals and terms if target is Gujarati/Hindi, with clear Indian Rupee (₹) amounts.
- Include order number, itemized summary, total, balance due, and dispatch note.
- Output ONLY the ready-to-copy WhatsApp message with appropriate spacing and emojis (📦, 📝, 💰, 🚚).`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        if (response.text) {
          return res.json({ summary: response.text.trim() });
        }
      } catch (geminiError: any) {
        console.warn('Gemini summary generation failed, using template:', geminiError?.message);
      }
    }

    // Default template generation based on language
    let summary = '';
    const dateStr = new Date().toLocaleDateString('en-IN');
    if (language === 'gu') {
      summary = `🙏 *${business?.name || 'ઓર્ડરસાથી'} - ઓર્ડર કન્ફર્મેશન*

પ્રિય ${customer?.businessName || customer?.name || 'ગ્રાહકશ્રી'},
તમારો ઓર્ડર સફળતાપૂર્વક નોંધવામાં આવ્યો છે.

📋 *ઓર્ડર નં:* #${order?.orderNumber || 'OS-1001'}
📅 *તારીખ:* ${dateStr}

*આઇટમ વિગત:*
${order?.items?.map((it: any) => `• ${it.productName} ${it.variant ? `(${it.variant})` : ''} - ${it.quantity} ${it.unit || 'pcs'} x ₹${it.unitPrice} = ₹${it.total}`).join('\n')}

💵 *કુલ રકમ:* ₹${order?.grandTotal?.toLocaleString('en-IN') || 0}
💳 *જમા રકમ:* ₹${order?.amountPaid?.toLocaleString('en-IN') || 0}
⏳ *બાકી રકમ:* ₹${order?.balanceDue?.toLocaleString('en-IN') || 0}

🚚 *ડિસ્પેચ નોંધ:* ${order?.deliveryNotes || 'ટૂંક સમયમાં ટ્રાન્સપોર્ટ દ્વારા મોકલાશે.'}

વેપાર કરવા બદલ આભાર!
${business?.name} - ${business?.phone || ''}`;
    } else if (language === 'hi') {
      summary = `🙏 *${business?.name || 'OrderSaathi'} - आर्डर कन्फर्मेशन*

प्रिय ${customer?.businessName || customer?.name || 'व्यापारी मित्र'},
आपका आर्डर सफलतापूर्वक दर्ज कर लिया गया है।

📋 *आर्डर नं:* #${order?.orderNumber || 'OS-1001'}
📅 *दिनांक:* ${dateStr}

*सामान का विवरण:*
${order?.items?.map((it: any) => `• ${it.productName} ${it.variant ? `(${it.variant})` : ''} - ${it.quantity} ${it.unit || 'pcs'} x ₹${it.unitPrice} = ₹${it.total}`).join('\n')}

💵 *कुल राशि:* ₹${order?.grandTotal?.toLocaleString('en-IN') || 0}
💳 *जमा राशि:* ₹${order?.amountPaid?.toLocaleString('en-IN') || 0}
⏳ *बाकी राशि:* ₹${order?.balanceDue?.toLocaleString('en-IN') || 0}

🚚 *डिस्पैच निर्देश:* ${order?.deliveryNotes || 'जल्द ही ट्रांसपोर्ट से रवाना किया जाएगा।'}

धन्यवाद!
${business?.name} - ${business?.phone || ''}`;
    } else {
      summary = `🤝 *Order Confirmation - ${business?.name || 'OrderSaathi'}*

Dear ${customer?.businessName || customer?.name || 'Customer'},
Thank you for your order!

📋 *Order #:* ${order?.orderNumber || 'OS-1001'}
📅 *Date:* ${dateStr}

*Items:*
${order?.items?.map((it: any) => `• ${it.productName} ${it.variant ? `(${it.variant})` : ''} - ${it.quantity} ${it.unit || 'pcs'} @ ₹${it.unitPrice} = ₹${it.total}`).join('\n')}

💵 *Total Amount:* ₹${order?.grandTotal?.toLocaleString('en-IN') || 0}
💳 *Paid Amount:* ₹${order?.amountPaid?.toLocaleString('en-IN') || 0}
⏳ *Balance Due:* ₹${order?.balanceDue?.toLocaleString('en-IN') || 0}

🚚 *Dispatch Note:* ${order?.deliveryNotes || 'Will be dispatched via local transport.'}

Thank you for your business!
${business?.name} | Phone: ${business?.phone || ''}`;
    }

    res.json({ summary });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate summary' });
  }
});

// Suggest Reorders for Customer based on History
app.post('/api/ai/suggest-reorders', async (req: Request, res: Response) => {
  try {
    const { customerId, customerName, previousOrders = [], productCatalog = [] } = req.body;

    if (!previousOrders.length) {
      return res.json({
        suggestions: productCatalog.slice(0, 3).map((p: any) => ({
          productId: p.id,
          productName: p.name,
          suggestedQty: 25,
          unit: p.unit || 'pcs',
          reason: 'Popular high-volume wholesale item',
        })),
      });
    }

    if (aiClient) {
      try {
        const prompt = `Analyze previous wholesale order history for customer "${customerName}" (ID: ${customerId}) and suggest 3 high-probability reorder items.
Order History:
${JSON.stringify(previousOrders, null, 2)}

Product Catalog:
${JSON.stringify(productCatalog.map((p: any) => ({ id: p.id, name: p.name, unit: p.unit })), null, 2)}

Output JSON array of suggestions with: productId, productName, suggestedQty, unit, and reason.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '[]');
        return res.json({ suggestions: Array.isArray(parsed) ? parsed : [] });
      } catch (e: any) {
        console.warn('Gemini reorder suggestion fallback:', e?.message);
      }
    }

    // Heuristic frequent item aggregation
    const itemCounts: Record<string, { qty: number; count: number; name: string; unit: string }> = {};
    for (const ord of previousOrders) {
      for (const item of ord.items || []) {
        if (!itemCounts[item.productId || item.productName]) {
          itemCounts[item.productId || item.productName] = {
            qty: 0,
            count: 0,
            name: item.productName,
            unit: item.unit || 'pcs',
          };
        }
        itemCounts[item.productId || item.productName].count += 1;
        itemCounts[item.productId || item.productName].qty += item.quantity || 10;
      }
    }

    const suggestions = Object.entries(itemCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([id, info]) => ({
        productId: id,
        productName: info.name,
        suggestedQty: Math.round(info.qty / Math.max(1, info.count)),
        unit: info.unit,
        reason: `Ordered ${info.count} times previously; regular cycle due.`,
      }));

    res.json({ suggestions });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to suggest reorders' });
  }
});

// Configure Vite integration for dev server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OrderSaathi server is active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
