import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Language, UserRole } from '../../types';
import {
  Settings,
  Building,
  Globe,
  Shield,
  FileDown,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Save,
  CheckCircle2,
  Trash2,
  Phone,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    business,
    updateBusiness,
    userProfile,
    switchUserRole,
    language,
    setLanguage,
    exportCustomersCSV,
    exportOrdersCSV,
    exportLedgerCSV,
    t,
  } = useApp();

  const [businessName, setBusinessName] = useState(business.name);
  const [gstin, setGstin] = useState(business.gstin || '');
  const [phone, setPhone] = useState(business.phone);
  const [city, setCity] = useState(business.city);
  const [addressLine1, setAddressLine1] = useState(business.addressLine1);
  const [allowBackorders, setAllowBackorders] = useState(business.allowBackorders);
  const [invoicePrefix, setInvoicePrefix] = useState(business.invoicePrefix);
  const [orderPrefix, setOrderPrefix] = useState(business.orderPrefix);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness({
      name: businessName,
      gstin,
      phone,
      city,
      addressLine1,
      allowBackorders,
      invoicePrefix,
      orderPrefix,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-4 pb-8 text-xs">
      <div>
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          {t('settingsTitle')}
        </h2>
        <p className="text-[11px] text-slate-500">
          Configure business details, GST, and inventory preferences
        </p>
      </div>

      {saveSuccess && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center space-x-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Business settings updated successfully!</span>
        </div>
      )}

      {/* Language Preferences */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center space-x-1.5 font-bold text-slate-900 text-xs">
          <Globe className="w-4 h-4 text-teal-600" />
          <span>App Interface Language</span>
        </div>
        <p className="text-[11px] text-slate-500">Choose your preferred wholesale trading language:</p>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { code: 'gu' as Language, label: 'ગુજરાતી', sub: 'Gujarati' },
            { code: 'hi' as Language, label: 'हिन्दी', sub: 'Hindi' },
            { code: 'en' as Language, label: 'English', sub: 'English' },
          ].map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={`p-2 rounded-xl border text-center transition ${
                language === l.code
                  ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="block text-xs font-bold">{l.label}</span>
              <span className="text-[10px] text-slate-400 block">{l.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Business Profile Form */}
      <form onSubmit={handleSave} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center space-x-1.5 font-bold text-slate-900 text-xs mb-1">
          <Building className="w-4 h-4 text-teal-600" />
          <span>Firm / Business Profile</span>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Firm / Business Name</label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">GSTIN</label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Official Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">City / Trading Hub</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Order Prefix</label>
            <input
              type="text"
              value={orderPrefix}
              onChange={(e) => setOrderPrefix(e.target.value.toUpperCase())}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Market Shop Address</label>
          <input
            type="text"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
          />
        </div>

        {/* Backorders Toggle */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-800 text-xs block">Allow Backorders</span>
            <span className="text-[10px] text-slate-500 block">
              Allow creating orders even when stock quantity is insufficient
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAllowBackorders(!allowBackorders)}
            className={`p-1 transition text-teal-600`}
          >
            {allowBackorders ? (
              <ToggleRight className="w-8 h-8 text-teal-600" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-300" />
            )}
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1 shadow-sm transition"
        >
          <Save className="w-4 h-4" />
          <span>Save Business Settings</span>
        </button>
      </form>

      {/* Staff Roles & Permissions Simulator */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center space-x-1.5 font-bold text-slate-900 text-xs">
          <Shield className="w-4 h-4 text-teal-600" />
          <span>Active Role & Permission View</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Switch roles to simulate user experience as Owner, Manager, or Staff Member:
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {(['owner', 'manager', 'staff'] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => switchUserRole(r)}
              className={`p-2 rounded-xl border text-center transition capitalize ${
                userProfile.role === r
                  ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="block text-xs font-bold">{r}</span>
              <span className="text-[9px] text-slate-400 block">
                {r === 'owner' ? 'All Access' : r === 'manager' ? 'Ops Only' : 'Sales Only'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center space-x-1.5 font-bold text-slate-900 text-xs">
          <FileDown className="w-4 h-4 text-teal-600" />
          <span>Data Backup & Exports</span>
        </div>

        <div className="space-y-1.5 pt-1">
          <button
            onClick={exportCustomersCSV}
            className="w-full p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-xs font-semibold text-slate-700 flex justify-between items-center"
          >
            <span>Export Customers Master (CSV)</span>
            <span className="text-[10px] text-teal-700 font-bold">Download</span>
          </button>
          <button
            onClick={exportOrdersCSV}
            className="w-full p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-xs font-semibold text-slate-700 flex justify-between items-center"
          >
            <span>Export Orders History (CSV)</span>
            <span className="text-[10px] text-teal-700 font-bold">Download</span>
          </button>
          <button
            onClick={exportLedgerCSV}
            className="w-full p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-xs font-semibold text-slate-700 flex justify-between items-center"
          >
            <span>Export Customer Ledger Statements (CSV)</span>
            <span className="text-[10px] text-teal-700 font-bold">Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
