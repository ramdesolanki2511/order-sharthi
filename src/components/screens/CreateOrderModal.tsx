import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../i18n/translations';
import { OrderItem } from '../../types';
import {
  X,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (orderId: string) => void;
  initialCustomerId?: string;
}

export const CreateOrderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onOrderCreated,
  initialCustomerId,
}) => {
  const { customers, products, createOrder, business, t } = useApp();

  const [customerId, setCustomerId] = useState(initialCustomerId || customers[0]?.id || '');
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: 'it-1',
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      sku: products[0]?.sku || '',
      quantity: 20,
      unit: products[0]?.unit || 'pcs',
      unitPrice: products[0]?.sellingPrice || 450,
      discountPercent: 0,
      taxPercent: 5,
      total: (products[0]?.sellingPrice || 450) * 20,
    },
  ]);

  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    setItems((prev) =>
      prev.map((it, i) =>
        i === index
          ? {
              ...it,
              productId: prod.id,
              productName: prod.name,
              sku: prod.sku,
              unit: prod.unit,
              unitPrice: prod.sellingPrice,
              total: it.quantity * prod.sellingPrice,
            }
          : it
      )
    );
  };

  const handleQtyChange = (index: number, qty: number) => {
    setItems((prev) =>
      prev.map((it, i) =>
        i === index
          ? {
              ...it,
              quantity: Math.max(1, qty),
              total: Math.max(1, qty) * it.unitPrice,
            }
          : it
      )
    );
  };

  const handlePriceChange = (index: number, price: number) => {
    setItems((prev) =>
      prev.map((it, i) =>
        i === index
          ? {
              ...it,
              unitPrice: Math.max(0, price),
              total: it.quantity * Math.max(0, price),
            }
          : it
      )
    );
  };

  const handleAddItem = () => {
    const prod = products[0];
    if (!prod) return;
    setItems((prev) => [
      ...prev,
      {
        id: 'it-' + Date.now(),
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: 10,
        unit: prod.unit,
        unitPrice: prod.sellingPrice,
        discountPercent: 0,
        taxPercent: 5,
        total: prod.sellingPrice * 10,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + (it.total || 0), 0);
  const taxAmount = Math.round(Math.max(0, subtotal - discountAmount) * 0.05); // 5% GST
  const grandTotal = Math.max(0, subtotal - discountAmount + taxAmount + shippingCharges);
  const balanceDue = Math.max(0, grandTotal - advancePaid);

  const handleSubmit = () => {
    if (!customerId) {
      setErrorMsg('Please select a customer.');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('Order must have at least one product.');
      return;
    }

    const cust = customers.find((c) => c.id === customerId);

    const res = createOrder({
      customerId,
      customerName: cust?.name || 'Customer',
      customerBusinessName: cust?.businessName,
      customerPhone: cust?.phone,
      items,
      subtotal,
      discountAmount,
      taxAmount,
      shippingCharges,
      grandTotal,
      amountPaid: advancePaid,
      balanceDue,
      status: 'confirmed',
      deliveryNotes,
      expectedDeliveryDate: expectedDate || undefined,
    });

    if (res.success && res.order) {
      onOrderCreated(res.order.id);
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to create order');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">{t('createOrder')}</h2>
              <p className="text-[11px] text-slate-400">Ambika Textiles • GST 5%</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3.5">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customer Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Customer / Trader
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-teal-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.name} - {c.city}) - Balance: {formatINR(c.currentBalance)}
                </option>
              ))}
            </select>
          </div>

          {/* Products List */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Order Items</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-bold flex items-center space-x-0.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {items.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId);
                const isStockLow = prod ? prod.stockQuantity < item.quantity : false;

                return (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductSelect(idx, e.target.value)}
                        className="text-xs p-1.5 bg-white border border-slate-300 rounded-lg font-semibold flex-1 mr-2"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({formatINR(p.sellingPrice)}/{p.unit} • Stock: {p.stockQuantity})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isStockLow && !business.allowBackorders && (
                      <p className="text-[10px] text-rose-600 font-bold flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Available stock is only {prod?.stockQuantity} {prod?.unit}</span>
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">Quantity</span>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                            className="w-full text-xs p-1 bg-white border border-slate-300 rounded text-center font-bold"
                          />
                          <span className="text-[10px] text-slate-500">{item.unit}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">Rate (₹)</span>
                        <input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                          className="w-full text-xs p-1 bg-white border border-slate-300 rounded text-center font-bold"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">Total</span>
                        <div className="text-xs font-bold text-slate-900 pt-1 text-right">
                          {formatINR(item.total)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Adjustments */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Discount (₹)</label>
              <input
                type="number"
                min={0}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Shipping / Transport (₹)</label>
              <input
                type="number"
                min={0}
                value={shippingCharges}
                onChange={(e) => setShippingCharges(Number(e.target.value))}
                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Advance Paid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Advance Received (₹)</label>
              <input
                type="number"
                min={0}
                value={advancePaid}
                onChange={(e) => setAdvancePaid(Number(e.target.value))}
                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-lg font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Target Delivery Date</label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Delivery Notes */}
          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Transport & Dispatch Notes</label>
            <input
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Surat Golden Transport, delivery to Sachin shop"
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
            />
          </div>

          {/* Order Summary Calculation */}
          <div className="bg-slate-100 p-3 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatINR(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount:</span>
                <span>-{formatINR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>GST Tax (5%):</span>
              <span className="font-semibold">{formatINR(taxAmount)}</span>
            </div>
            {shippingCharges > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Transport / Shipping:</span>
                <span className="font-semibold">{formatINR(shippingCharges)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 font-black text-sm border-t border-slate-200 pt-1">
              <span>Grand Total:</span>
              <span className="text-teal-800">{formatINR(grandTotal)}</span>
            </div>
            <div className="flex justify-between text-rose-700 font-bold text-xs">
              <span>Balance Due:</span>
              <span>{formatINR(balanceDue)}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Confirm & Place Wholesale Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
