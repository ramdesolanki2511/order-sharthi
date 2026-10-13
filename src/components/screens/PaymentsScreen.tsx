import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../i18n/translations';
import {
  CreditCard,
  Plus,
  FileDown,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
} from 'lucide-react';

interface Props {
  onOpenRecordPayment: () => void;
}

export const PaymentsScreen: React.FC<Props> = ({ onOpenRecordPayment }) => {
  const { payments, ledger, customers, exportLedgerCSV, t } = useApp();

  const [activeTab, setActiveTab] = useState<'receipts' | 'ledger'>('receipts');
  const [searchQuery, setSearchQuery] = useState('');

  const totalOutstanding = customers.reduce((acc, c) => acc + Math.max(0, c.currentBalance), 0);
  const totalReceived = payments.reduce((acc, p) => acc + p.amount, 0);

  const filteredPayments = payments.filter((p) =>
    p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
    p.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLedger = ledger.filter((l) =>
    l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.referenceNumber && l.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-3.5">
      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            {t('paymentsTitle')}
          </h2>
          <p className="text-[11px] text-slate-500">
            Ledger & receivables management
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={exportLedgerCSV}
            title="Export Ledger CSV"
            className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl shadow-2xs transition"
          >
            <FileDown className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenRecordPayment}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs text-xs font-bold flex items-center space-x-1 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-semibold block">Total Outstanding Dues</span>
          <span className="text-base font-black text-rose-700 tracking-tight">
            {formatINR(totalOutstanding)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Across all wholesale parties</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-semibold block">Total Collections</span>
          <span className="text-base font-black text-emerald-700 tracking-tight">
            {formatINR(totalReceived)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">{payments.length} receipts recorded</span>
        </div>
      </div>

      {/* Tabs: Receipts vs Ledger */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
        <button
          onClick={() => setActiveTab('receipts')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            activeTab === 'receipts'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Payment Receipts ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            activeTab === 'ledger'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Customer Ledger Entries ({ledger.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by party, receipt #, or UTR..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
        />
      </div>

      {/* List */}
      <div className="space-y-2 pb-6">
        {activeTab === 'receipts' ? (
          filteredPayments.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-xs">No payment receipts found</p>
          ) : (
            filteredPayments.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-xs text-slate-900">{p.customerName}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 uppercase font-mono">
                      {p.paymentMethod}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    {p.receiptNumber} • {p.paymentDate}
                    {p.referenceNumber ? ` • Ref: ${p.referenceNumber}` : ''}
                  </p>
                  {p.notes && <p className="text-[10px] text-slate-400 mt-0.5">{p.notes}</p>}
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-700">
                    +{formatINR(p.amount)}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-medium">Recorded</span>
                </div>
              </div>
            ))
          )
        ) : (
          filteredLedger.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-xs">No ledger entries found</p>
          ) : (
            filteredLedger.map((l) => (
              <div
                key={l.id}
                className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-800">{l.description}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    {l.entryDate} {l.referenceNumber ? `• Ref: ${l.referenceNumber}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  {l.debit > 0 && (
                    <span className="font-black text-rose-700">+{formatINR(l.debit)}</span>
                  )}
                  {l.credit > 0 && (
                    <span className="font-black text-emerald-700">-{formatINR(l.credit)}</span>
                  )}
                  <span className="text-[9px] text-slate-400 block font-medium">
                    {l.entryType.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};
