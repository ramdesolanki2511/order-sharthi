import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export const CustomerFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  customerToEdit,
}) => {
  const { addCustomer, updateCustomer, t } = useApp();

  const [name, setName] = useState(customerToEdit?.name || '');
  const [businessName, setBusinessName] = useState(customerToEdit?.businessName || '');
  const [phone, setPhone] = useState(customerToEdit?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(customerToEdit?.whatsappNumber || '');
  const [gstin, setGstin] = useState(customerToEdit?.gstin || '');
  const [city, setCity] = useState(customerToEdit?.city || 'Surat');
  const [billingAddress, setBillingAddress] = useState(customerToEdit?.billingAddress || '');
  const [category, setCategory] = useState<Customer['category']>(customerToEdit?.category || 'regular');
  const [creditLimit, setCreditLimit] = useState(customerToEdit?.creditLimit || 150000);
  const [paymentTermsDays, setPaymentTermsDays] = useState(customerToEdit?.paymentTermsDays || 15);
  const [openingBalance, setOpeningBalance] = useState(customerToEdit?.openingBalance || 0);
  const [notes, setNotes] = useState(customerToEdit?.notes || '');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !businessName.trim() || !phone.trim()) {
      setErrorMsg('Please enter customer contact person, firm name, and phone number.');
      return;
    }

    if (customerToEdit) {
      updateCustomer(customerToEdit.id, {
        name,
        businessName,
        phone,
        whatsappNumber: whatsappNumber || phone,
        gstin,
        city,
        billingAddress,
        category,
        creditLimit,
        paymentTermsDays,
        notes,
      });
    } else {
      addCustomer({
        name,
        businessName,
        phone,
        whatsappNumber: whatsappNumber || phone,
        gstin,
        billingAddress: billingAddress || `${city}, Gujarat`,
        city,
        state: 'Gujarat',
        category,
        creditLimit,
        paymentTermsDays,
        openingBalance,
        notes,
        status: 'active',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in duration-150">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">
                {customerToEdit ? 'Edit Customer' : t('addCustomer')}
              </h2>
              <p className="text-[11px] text-slate-400">Wholesale buyer profile & credit terms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1 space-y-3.5 text-xs">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Firm / Business Name *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Patel Traders Surat"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Contact Person *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dineshbhai Patel"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98790 55443"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="Same as phone if empty"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                GSTIN (Optional)
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="24AABCP1122C1ZR"
                maxLength={15}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                City / Market Hub
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Surat, Ahmedabad, Rajkot..."
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Billing & Delivery Address
            </label>
            <input
              type="text"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              placeholder="e.g. Shop 45, GIDC Sachin Textile Hub"
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
              >
                <option value="regular">Regular</option>
                <option value="vip">VIP Buyer</option>
                <option value="distributor">Distributor</option>
                <option value="bulk">Bulk Trader</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Credit Limit (₹)</label>
              <input
                type="number"
                min={0}
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Terms (Days)</label>
              <input
                type="number"
                min={0}
                value={paymentTermsDays}
                onChange={(e) => setPaymentTermsDays(Number(e.target.value))}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg text-center"
              />
            </div>
          </div>

          {!customerToEdit && (
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Opening Balance Due (₹)
              </label>
              <input
                type="number"
                min={0}
                value={openingBalance}
                onChange={(e) => setOpeningBalance(Number(e.target.value))}
                placeholder="0"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold text-rose-700"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Internal Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Referred by Suresh Mill, prefers Golden transport"
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{customerToEdit ? 'Save Changes' : 'Create Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
