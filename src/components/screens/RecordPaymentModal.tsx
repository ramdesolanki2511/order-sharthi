import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../i18n/translations';
import { PaymentMethod } from '../../types';
import { X, CreditCard, Save, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialCustomerId?: string;
  initialOrderId?: string;
}

export const RecordPaymentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialCustomerId,
  initialOrderId,
}) => {
  const { customers, orders, recordPayment, t } = useApp();

  const [customerId, setCustomerId] = useState(initialCustomerId || customers[0]?.id || '');
  const [orderId, setOrderId] = useState(initialOrderId || '');
  const [amount, setAmount] = useState<number>(10000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Filter orders for the selected customer that have an open balance
  const customerOrders = orders.filter((o) => o.customerId === customerId && o.balanceDue > 0);
  const selectedCustomer = customers.find((c) => c.id === customerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setErrorMsg('Please select a customer.');
      return;
    }
    if (amount <= 0) {
      setErrorMsg('Payment amount must be greater than 0.');
      return;
    }

    recordPayment({
      customerId,
      orderId: orderId || undefined,
      amount,
      paymentMethod,
      referenceNumber: referenceNumber || undefined,
      notes: notes || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-150">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">{t('recordPaymentTitle')}</h2>
              <p className="text-[11px] text-slate-400">Ledger credit & receipt entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {errorMsg && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customer */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Select Customer / Party *
            </label>
            <select
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setOrderId('');
              }}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-semibold"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} (Dues: {formatINR(c.currentBalance)})
                </option>
              ))}
            </select>
          </div>

          {/* Link to specific order (optional) */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Apply to Specific Bill / Order (Optional)
            </label>
            <select
              value={orderId}
              onChange={(e) => {
                setOrderId(e.target.value);
                const ord = orders.find((o) => o.id === e.target.value);
                if (ord) setAmount(ord.balanceDue);
              }}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
            >
              <option value="">-- Apply to general party balance --</option>
              {customerOrders.map((ord) => (
                <option key={ord.id} value={ord.id}>
                  {ord.orderNumber} - Balance Due: {formatINR(ord.balanceDue)}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Amount Received (₹) *
            </label>
            <input
              type="number"
              min={1}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full text-base font-black p-2 bg-white border border-slate-300 rounded-lg text-center text-emerald-800"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Payment Method *
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'upi', label: 'UPI / GPay' },
                { id: 'cash', label: 'Cash (રોકડ)' },
                { id: 'bank_transfer', label: 'Bank (NEFT)' },
                { id: 'cheque', label: 'Cheque' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-2 rounded-lg border text-[11px] font-bold transition ${
                    paymentMethod === m.id
                      ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reference / UTR Number */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Reference / UTR / Cheque No.
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. UPI/42890123982 or CHQ-00213"
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Part payment against October fabric delivery"
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>Record Payment & Update Ledger</span>
          </button>
        </form>
      </div>
    </div>
  );
};
