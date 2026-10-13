import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../i18n/translations';
import { AIExtractedOrder, AIExtractedItem } from '../../types';
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  ArrowRight,
  X,
  FileText,
  Clock,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (orderId: string) => void;
}

export const WhatsAppImportModal: React.FC<Props> = ({ isOpen, onClose, onOrderCreated }) => {
  const { customers, products, createOrder, t, language } = useApp();

  const [inputText, setInputText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [extractedData, setExtractedData] = useState<AIExtractedOrder | null>(null);
  const [parseError, setParseError] = useState('');

  // Editable fields in review step
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [editableItems, setEditableItems] = useState<AIExtractedItem[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  if (!isOpen) return null;

  // Sample Gujarati/Hindi/English wholesale messages to test with 1-click
  const sampleMessages = [
    {
      title: 'Patel Traders (Surat)',
      text: 'Patel Traders Surat: 50 pcs Rayon Kurti Blue M size, 20 pcs Cotton Bandhani Saree Maroon, urgent dispatch to Sachin branch by Friday.',
    },
    {
      title: 'Balaji Emporium (Ahmedabad)',
      text: 'Balaji Cloth Emporium: 40 pcs Cotton Bandhani Saree Maroon, 30 sets Men Linen Kurta Pajama White. Send bilty on WhatsApp.',
    },
    {
      title: 'Krishna Sarees (Rajkot)',
      text: 'Krishna Sarees: 50 pcs Heavy Georgette Dupatta Gold Work @ 290, 10 pcs Rayon Kurti Blue. Dispatch tomorrow.',
    },
  ];

  const handleParse = async () => {
    if (!inputText.trim()) {
      setParseError('Please paste or enter WhatsApp order text first.');
      return;
    }

    setIsParsing(true);
    setParseError('');

    try {
      const response = await fetch('/api/ai/parse-whatsapp-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          existingProducts: products,
          existingCustomers: customers,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data: AIExtractedOrder = await response.json();
      setExtractedData(data);

      // Match customer
      if (data.matchedCustomerId) {
        setSelectedCustomerId(data.matchedCustomerId);
      } else {
        const found = customers.find(
          (c) =>
            c.businessName.toLowerCase().includes(data.detectedCustomerName.toLowerCase()) ||
            c.name.toLowerCase().includes(data.detectedCustomerName.toLowerCase())
        );
        setSelectedCustomerId(found ? found.id : customers[0]?.id || '');
      }

      setEditableItems(data.items || []);
      setDeliveryNotes(data.deliveryNotes || '');
      setDeliveryDate(data.requestedDeliveryDate || '');
    } catch (err: any) {
      console.error('Failed to parse:', err);
      setParseError(err.message || 'AI parsing failed. Please verify connection.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleItemProductChange = (index: number, newProductId: string) => {
    const prod = products.find((p) => p.id === newProductId);
    if (!prod) return;

    setEditableItems((prev) =>
      prev.map((it, i) =>
        i === index
          ? {
              ...it,
              matchedProductId: prod.id,
              productName: prod.name,
              sku: prod.sku,
              unit: prod.unit,
              unitPrice: prod.sellingPrice,
              status: 'matched',
            }
          : it
      )
    );
  };

  const handleItemQtyChange = (index: number, qty: number) => {
    setEditableItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, quantity: Math.max(1, qty) } : it))
    );
  };

  const handleItemPriceChange = (index: number, price: number) => {
    setEditableItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, unitPrice: Math.max(0, price) } : it))
    );
  };

  const handleItemRemove = (index: number) => {
    setEditableItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    const defaultProd = products[0];
    if (!defaultProd) return;
    setEditableItems((prev) => [
      ...prev,
      {
        productName: defaultProd.name,
        matchedProductId: defaultProd.id,
        sku: defaultProd.sku,
        quantity: 10,
        unit: defaultProd.unit,
        unitPrice: defaultProd.sellingPrice,
        status: 'matched',
      },
    ]);
  };

  // Calculations
  const subtotal = editableItems.reduce((acc, it) => acc + (it.quantity || 0) * (it.unitPrice || 0), 0);
  const taxAmount = Math.round(subtotal * 0.05); // 5% GST standard for textiles
  const grandTotal = subtotal + taxAmount;

  const handleConfirmOrder = () => {
    if (!selectedCustomerId) {
      setParseError('Please select a customer.');
      return;
    }
    if (editableItems.length === 0) {
      setParseError('Order must have at least one product.');
      return;
    }

    const cust = customers.find((c) => c.id === selectedCustomerId);

    const orderItems = editableItems.map((it) => ({
      id: 'item-' + Date.now() + Math.random(),
      productId: it.matchedProductId || products[0].id,
      productName: it.productName,
      sku: it.sku || '',
      variant: it.variant || '',
      quantity: it.quantity,
      unit: it.unit || 'pcs',
      unitPrice: it.unitPrice,
      discountPercent: 0,
      taxPercent: 5,
      total: it.quantity * it.unitPrice,
    }));

    const result = createOrder({
      customerId: selectedCustomerId,
      customerName: cust?.name || 'Customer',
      customerBusinessName: cust?.businessName,
      customerPhone: cust?.phone,
      status: 'pending_confirmation',
      items: orderItems,
      subtotal,
      discountAmount: 0,
      taxAmount,
      shippingCharges: 0,
      grandTotal,
      amountPaid: 0,
      balanceDue: grandTotal,
      source: 'whatsapp_ai',
      rawMessageText: inputText,
      deliveryNotes: deliveryNotes || 'Extracted via WhatsApp AI',
      expectedDeliveryDate: deliveryDate || undefined,
    });

    if (result.success && result.order) {
      onOrderCreated(result.order.id);
      onClose();
    } else {
      setParseError(result.error || 'Failed to create order');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-700 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-600/40 rounded-xl text-teal-200">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight flex items-center space-x-1.5">
                <span>{t('whatsappImportTitle')}</span>
              </h2>
              <p className="text-xs text-teal-100">{t('whatsappImportSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-teal-200 hover:text-white hover:bg-teal-600/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {parseError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{parseError}</span>
            </div>
          )}

          {!extractedData ? (
            /* Step 1: Input WhatsApp Text */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Paste WhatsApp Message Text
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t('pastePlaceholder')}
                  rows={4}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
                />
              </div>

              {/* Sample Chips */}
              <div>
                <p className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center space-x-1">
                  <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                  <span>Try Sample Gujarat Wholesale Chats:</span>
                </p>
                <div className="flex flex-col gap-1.5">
                  {sampleMessages.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInputText(sample.text)}
                      className="text-left text-xs bg-slate-50 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 p-2 rounded-lg transition"
                    >
                      <span className="font-bold text-teal-800 text-[11px] block">{sample.title}</span>
                      <span className="text-slate-600 text-[10px] line-clamp-1">{sample.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleParse}
                disabled={isParsing || !inputText.trim()}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition"
              >
                {isParsing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Extracting with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{t('parseButton')}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Step 2: Review and Verify Extracted Order */
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="bg-teal-50/70 border border-teal-200 p-2.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-teal-900 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>
                    AI Extracted {editableItems.length} items (Source: {extractedData.source})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setExtractedData(null)}
                  className="text-[11px] text-teal-700 font-bold hover:underline"
                >
                  Edit Message
                </button>
              </div>

              {/* Customer Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer / Wholesale Buyer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 font-medium"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.businessName} ({c.name} - {c.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Verification Table */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Extracted Line Items (Verify Rates & Quantity)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-[11px] text-teal-700 hover:text-teal-900 font-bold flex items-center space-x-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {editableItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 truncate text-[11px]">
                          Item #{idx + 1}: {item.rawText || item.productName}
                        </span>
                        <div className="flex items-center space-x-1">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              item.status === 'matched'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.status === 'matched' ? 'Catalogue Matched' : 'Verify Item'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleItemRemove(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Map to Catalogue Product */}
                      <select
                        value={item.matchedProductId || ''}
                        onChange={(e) => handleItemProductChange(idx, e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="">-- Choose Catalogue Match --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku}) - {formatINR(p.sellingPrice)}/{p.unit}
                          </option>
                        ))}
                      </select>

                      {/* Quantity, Unit, Price, and Total */}
                      <div className="grid grid-cols-3 gap-2 pt-0.5">
                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold block">Qty</span>
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleItemQtyChange(idx, Number(e.target.value))}
                              className="w-full text-xs p-1 bg-white border border-slate-300 rounded text-center font-bold"
                            />
                            <span className="text-[10px] text-slate-600 shrink-0">{item.unit || 'pcs'}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold block">Rate (₹)</span>
                          <input
                            type="number"
                            min={0}
                            value={item.unitPrice}
                            onChange={(e) => handleItemPriceChange(idx, Number(e.target.value))}
                            className="w-full text-xs p-1 bg-white border border-slate-300 rounded text-center font-bold"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold block">Total</span>
                          <div className="text-xs font-bold text-slate-800 pt-1 text-right">
                            {formatINR(item.quantity * item.unitPrice)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Delivery / Dispatch Instructions
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Surat Golden Transport, delivery by Friday"
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Order Totals Summary */}
              <div className="bg-slate-100 p-2.5 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST Tax (5%):</span>
                  <span className="font-semibold">{formatINR(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t border-slate-200 pt-1">
                  <span>Grand Total:</span>
                  <span className="text-teal-800">{formatINR(grandTotal)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleConfirmOrder}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('confirmDraftOrder')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
