import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../i18n/translations';
import {
  X,
  Phone,
  MessageSquare,
  CreditCard,
  ShoppingBag,
  FileText,
  Plus,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface Props {
  customerId: string | null;
  onClose: () => void;
  onOpenCreateOrder: (customerId: string) => void;
  onOpenRecordPayment: (customerId: string) => void;
  onSelectOrder: (orderId: string) => void;
}

export const CustomerProfileModal: React.FC<Props> = ({
  customerId,
  onClose,
  onOpenCreateOrder,
  onOpenRecordPayment,
  onSelectOrder,
}) => {
  const { customers, orders, ledger, products, t } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'orders' | 'ai_suggestions'>('ledger');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  if (!customerId) return null;
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) return null;

  const customerOrders = orders.filter((o) => o.customerId === customer.id);
  const customerLedger = ledger.filter((l) => l.customerId === customer.id);

  const cleanPhone = customer.phone.replace(/\D/g, '');
  const cleanWa = (customer.whatsappNumber || customer.phone).replace(/\D/g, '');

  const handleFetchReorderSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch('/api/ai/suggest-reorders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          customerName: customer.businessName || customer.name,
          previousOrders: customerOrders,
          productCatalog: products,
        }),
      });
      const data = await response.json();
      setAiSuggestions(data.suggestions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-extrabold tracking-tight">
                {customer.businessName}
              </h2>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded-full uppercase">
                {customer.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {customer.name} • {customer.city}, Gujarat
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions & Financial Stats Strip */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2.5 shrink-0 text-xs">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold block">Outstanding</span>
              <span
                className={`text-sm font-black ${
                  customer.currentBalance > 0 ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                {formatINR(customer.currentBalance)}
              </span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold block">Credit Limit</span>
              <span className="text-sm font-black text-slate-900">
                {formatINR(customer.creditLimit)}
              </span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold block">Total Sales</span>
              <span className="text-sm font-black text-teal-800">
                {formatINR(customer.totalSales || 0)}
              </span>
            </div>
          </div>

          {/* Quick Buttons: Call, WhatsApp, Receive Payment, New Order */}
          <div className="flex items-center space-x-1.5">
            <a
              href={`tel:${cleanPhone}`}
              className="flex-1 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-xl flex items-center justify-center space-x-1 transition shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('oneTapCall')}</span>
            </a>

            <a
              href={`https://wa.me/${cleanWa}?text=Hello%20${encodeURIComponent(customer.name)},%20greetings%20from%20Ambika%20Textiles%20Surat.`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center space-x-1 transition shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t('oneTapWhatsApp')}</span>
            </a>

            <button
              onClick={() => {
                onClose();
                onOpenRecordPayment(customer.id);
              }}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl flex items-center justify-center space-x-1 transition shadow-2xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payment</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenCreateOrder(customer.id);
              }}
              className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center justify-center space-x-1 transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Order</span>
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white text-xs font-bold text-slate-500 px-3">
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`py-2 px-3 border-b-2 transition ${
              activeSubTab === 'ledger'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            Ledger ({customerLedger.length})
          </button>
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`py-2 px-3 border-b-2 transition ${
              activeSubTab === 'orders'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            Orders ({customerOrders.length})
          </button>
          <button
            onClick={() => {
              setActiveSubTab('ai_suggestions');
              if (aiSuggestions.length === 0) handleFetchReorderSuggestions();
            }}
            className={`py-2 px-3 border-b-2 transition flex items-center space-x-1 ${
              activeSubTab === 'ai_suggestions'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>AI Reorders</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-3 overflow-y-auto flex-1 space-y-2 text-xs">
          {activeSubTab === 'ledger' && (
            <div className="space-y-1.5">
              {customerLedger.length === 0 ? (
                <p className="text-center py-6 text-slate-400">No ledger entries yet</p>
              ) : (
                customerLedger.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{entry.description}</p>
                      <p className="text-[10px] text-slate-400">
                        {entry.entryDate} {entry.referenceNumber ? `• Ref: ${entry.referenceNumber}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      {entry.debit > 0 && (
                        <p className="font-bold text-rose-700">+{formatINR(entry.debit)}</p>
                      )}
                      {entry.credit > 0 && (
                        <p className="font-bold text-emerald-700">-{formatINR(entry.credit)}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeSubTab === 'orders' && (
            <div className="space-y-1.5">
              {customerOrders.length === 0 ? (
                <p className="text-center py-6 text-slate-400">No orders for this customer yet</p>
              ) : (
                customerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      onClose();
                      onSelectOrder(ord.id);
                    }}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-teal-500 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-900">{ord.orderNumber}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {ord.createdAt} • {ord.items.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">{formatINR(ord.grandTotal)}</p>
                      <p className="text-[10px] font-bold text-rose-600">
                        Due: {formatINR(ord.balanceDue)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeSubTab === 'ai_suggestions' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">
                  Reorder Suggestions based on Purchase Cycles
                </span>
                <button
                  type="button"
                  onClick={handleFetchReorderSuggestions}
                  disabled={loadingSuggestions}
                  className="text-[10px] text-teal-700 font-bold hover:underline"
                >
                  {loadingSuggestions ? 'Analyzing...' : 'Refresh'}
                </button>
              </div>

              {aiSuggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-950 text-xs">{sug.productName}</span>
                    <span className="text-[10px] font-extrabold bg-teal-600 text-white px-2 py-0.5 rounded-full">
                      Qty: {sug.suggestedQty} {sug.unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{sug.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
