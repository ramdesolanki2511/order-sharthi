import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../i18n/translations';
import { Order, OrderStatus } from '../../types';
import {
  X,
  MessageSquare,
  Printer,
  Copy,
  Repeat,
  AlertTriangle,
  CheckCircle,
  Truck,
  CreditCard,
  Send,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface Props {
  orderId: string | null;
  onClose: () => void;
  onOpenInvoice: (orderId: string) => void;
  onOpenRecordPayment: (orderId: string, customerId: string) => void;
}

export const OrderDetailsModal: React.FC<Props> = ({
  orderId,
  onClose,
  onOpenInvoice,
  onOpenRecordPayment,
}) => {
  const {
    orders,
    customers,
    business,
    updateOrderStatus,
    cancelOrder,
    repeatOrder,
    language,
    t,
  } = useApp();

  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [reverseStock, setReverseStock] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!orderId) return null;
  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;

  const customer = customers.find((c) => c.id === order.customerId);

  const statuses: { code: OrderStatus; label: string }[] = [
    { code: 'draft', label: 'Draft' },
    { code: 'pending_confirmation', label: 'Pending' },
    { code: 'confirmed', label: 'Confirmed' },
    { code: 'processing', label: 'Processing' },
    { code: 'ready_for_dispatch', label: 'Ready for Dispatch' },
    { code: 'dispatched', label: 'Dispatched' },
    { code: 'delivered', label: 'Delivered' },
  ];

  const handleGenerateWhatsAppSummary = async () => {
    setIsGeneratingSummary(true);
    setSummaryText('');
    setCopySuccess(false);

    try {
      const response = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order,
          customer,
          business,
          language,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate summary');
      const data = await response.json();
      setSummaryText(data.summary);
    } catch (err: any) {
      console.error(err);
      setSummaryText(`Order #${order.orderNumber} Total: ₹${order.grandTotal}. Balance: ₹${order.balanceDue}.`);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summaryText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSendToWhatsApp = () => {
    const phone = (customer?.whatsappNumber || customer?.phone || '').replace(/\D/g, '');
    const encoded = encodeURIComponent(summaryText);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight">{order.orderNumber}</span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  order.status === 'delivered'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : order.status === 'dispatched'
                    ? 'bg-purple-500/20 text-purple-300'
                    : order.status === 'cancelled'
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-teal-500/20 text-teal-300'
                }`}
              >
                {order.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {order.customerBusinessName || order.customerName} • {order.createdAt}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Status Stepper / Selector */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block">
              Update Order Status
            </label>
            <div className="flex flex-wrap gap-1">
              {statuses.map((st) => (
                <button
                  key={st.code}
                  type="button"
                  onClick={() => updateOrderStatus(order.id, st.code)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                    order.status === st.code
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Snapshot */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <p className="font-bold text-slate-800 text-xs">
              {order.customerBusinessName}
            </p>
            <p className="text-slate-500 text-[11px]">Contact: {order.customerName} ({order.customerPhone})</p>
            {customer?.gstin && (
              <p className="text-slate-500 text-[11px]">GSTIN: {customer.gstin}</p>
            )}
            {order.deliveryNotes && (
              <div className="pt-1 mt-1 border-t border-slate-100 text-[11px] text-teal-800 font-medium">
                🚚 Note: {order.deliveryNotes}
              </div>
            )}
          </div>

          {/* Order Items Table */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Item Details ({order.items.length})
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-xs">
                      {item.productName}
                    </p>
                    <p className="text-slate-500 text-[10px]">
                      {item.quantity} {item.unit} @ {formatINR(item.unitPrice)}
                      {item.variant ? ` • ${item.variant}` : ''}
                    </p>
                  </div>
                  <div className="text-right font-black text-slate-900 text-xs">
                    {formatINR(item.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="bg-slate-100 p-3 rounded-xl space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatINR(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount:</span>
                <span>-{formatINR(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>GST Tax (5%):</span>
              <span className="font-semibold">{formatINR(order.taxAmount)}</span>
            </div>
            {order.shippingCharges > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Shipping Charges:</span>
                <span className="font-semibold">{formatINR(order.shippingCharges)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 font-black text-sm border-t border-slate-200 pt-1">
              <span>Grand Total:</span>
              <span className="text-teal-800">{formatINR(order.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Amount Paid:</span>
              <span>{formatINR(order.amountPaid)}</span>
            </div>
            <div className="flex justify-between text-rose-700 font-extrabold text-xs">
              <span>Balance Due:</span>
              <span>{formatINR(order.balanceDue)}</span>
            </div>
          </div>

          {/* AI WhatsApp Customer Summary Box */}
          <div className="bg-teal-50/80 border border-teal-200 p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-900 text-xs flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>WhatsApp Customer Summary</span>
              </span>
              <button
                type="button"
                onClick={handleGenerateWhatsAppSummary}
                disabled={isGeneratingSummary}
                className="text-[11px] font-bold text-teal-800 bg-teal-100 hover:bg-teal-200 px-2 py-0.5 rounded-lg transition"
              >
                {isGeneratingSummary ? 'Generating...' : summaryText ? 'Regenerate' : 'Generate Summary'}
              </button>
            </div>

            {summaryText && (
              <div className="space-y-2">
                <pre className="text-[11px] p-2 bg-white rounded-lg border border-teal-200 whitespace-pre-wrap font-sans text-slate-800 max-h-36 overflow-y-auto">
                  {summaryText}
                </pre>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="flex-1 py-1.5 bg-white hover:bg-slate-50 border border-teal-300 rounded-lg font-bold text-teal-800 flex items-center justify-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copySuccess ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSendToWhatsApp}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center justify-center space-x-1 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send on WhatsApp</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onOpenInvoice(order.id)}
              className="py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>{t('shareInvoice')}</span>
            </button>

            {order.balanceDue > 0 ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRecordPayment(order.id, order.customerId);
                }}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <CreditCard className="w-4 h-4" />
                <span>Receive Payment</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  repeatOrder(order.id);
                  onClose();
                }}
                className="py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <Repeat className="w-4 h-4" />
                <span>{t('repeatOrder')}</span>
              </button>
            )}
          </div>

          {/* Cancel Order Section with Stock Reversal Confirmation */}
          {order.status !== 'cancelled' && (
            <div className="pt-2 border-t border-slate-200">
              {!showCancelConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-rose-600 hover:text-rose-800 font-semibold text-[11px] block text-center w-full"
                >
                  Cancel this order
                </button>
              ) : (
                <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl space-y-2">
                  <div className="flex items-center space-x-1.5 text-rose-800 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>Confirm Order Cancellation?</span>
                  </div>
                  <label className="flex items-center space-x-1.5 text-[11px] text-slate-700">
                    <input
                      type="checkbox"
                      checked={reverseStock}
                      onChange={(e) => setReverseStock(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span>Revert inventory quantities back to stock</span>
                  </label>
                  <div className="flex space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        cancelOrder(order.id, reverseStock);
                        setShowCancelConfirm(false);
                        onClose();
                      }}
                      className="flex-1 py-1.5 bg-rose-600 text-white font-bold rounded-lg text-xs"
                    >
                      Yes, Cancel Order
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 py-1.5 bg-white text-slate-700 border border-slate-300 font-bold rounded-lg text-xs"
                    >
                      No, Keep Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
