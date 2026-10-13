import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../i18n/translations';
import { Customer } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  MessageSquare,
  FileDown,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Building,
} from 'lucide-react';

interface Props {
  onOpenAddCustomer: () => void;
  onSelectCustomer: (customerId: string) => void;
}

export const CustomersScreen: React.FC<Props> = ({
  onOpenAddCustomer,
  onSelectCustomer,
}) => {
  const { customers, exportCustomersCSV, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === 'all'
        ? true
        : filterCategory === 'dues'
        ? c.currentBalance > 0
        : c.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-3.5 space-y-3.5">
      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-slate-900 tracking-tight">
            {t('customersTitle')}
          </h1>
          <p className="text-[11px] text-slate-500">
            {customers.length} wholesale parties registered
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={exportCustomersCSV}
            title="Download CSV"
            className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl shadow-2xs transition"
          >
            <FileDown className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAddCustomer}
            className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs text-xs font-bold flex items-center space-x-1 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('addCustomer')}</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by firm, name, phone, or city..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs font-medium"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 -mx-1 px-1 text-xs">
        {[
          { id: 'all', label: 'All Parties' },
          { id: 'dues', label: 'With Outstanding Dues' },
          { id: 'vip', label: 'VIP Buyers' },
          { id: 'distributor', label: 'Distributors' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`px-2.5 py-1 rounded-lg shrink-0 text-[11px] font-semibold transition ${
              filterCategory === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Customer List */}
      <div className="space-y-2.5 pb-6">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No customers found</p>
            <p className="text-xs text-slate-400">Try adjusting your search query or add a new customer.</p>
          </div>
        ) : (
          filteredCustomers.map((c) => {
            const cleanPhone = c.phone.replace(/\D/g, '');
            const cleanWa = (c.whatsappNumber || c.phone).replace(/\D/g, '');

            return (
              <div
                key={c.id}
                onClick={() => onSelectCustomer(c.id)}
                className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 cursor-pointer transition space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-extrabold text-xs text-slate-900 group-hover:text-teal-700">
                        {c.businessName}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 uppercase">
                        {c.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {c.name} • {c.city}, Gujarat
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block font-semibold">Balance Due:</span>
                    <span
                      className={`text-xs font-black ${
                        c.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {formatINR(c.currentBalance)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    <a
                      href={`tel:${cleanPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1 text-[10px] font-bold"
                    >
                      <Phone className="w-3 h-3 text-blue-600" />
                      <span>Call</span>
                    </a>

                    <a
                      href={`https://wa.me/${cleanWa}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex items-center space-x-1 text-[10px] font-bold"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  <div className="flex items-center space-x-1 text-teal-700 font-bold text-[11px] group-hover:translate-x-0.5 transition">
                    <span>Ledger & History</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
