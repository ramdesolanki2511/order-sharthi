import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DispatchStatus } from '../../types';
import { X, Truck, Save, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DispatchModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { orders, addDispatch, t } = useApp();

  // Orders that are ready for dispatch or processing
  const dispatchableOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');

  const [orderId, setOrderId] = useState(dispatchableOrders[0]?.id || '');
  const [transporterName, setTransporterName] = useState('Surat Golden Transport Co.');
  const [lrNumber, setLrNumber] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [parcelCount, setParcelCount] = useState<number>(2);
  const [weightKg, setWeightKg] = useState<number>(30);
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [status, setStatus] = useState<DispatchStatus>('in_transit');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) {
      setErrorMsg('Please select an order to dispatch.');
      return;
    }
    if (!transporterName.trim()) {
      setErrorMsg('Transporter name is required.');
      return;
    }

    const ord = orders.find((o) => o.id === orderId);

    addDispatch({
      orderId,
      orderNumber: ord?.orderNumber || 'OS-1001',
      customerName: ord?.customerBusinessName || ord?.customerName || 'Customer',
      transporterName,
      lrNumber: lrNumber || undefined,
      trackingNumber: trackingNumber || undefined,
      parcelCount,
      weightKg: weightKg || undefined,
      dispatchDate: new Date().toISOString().split('T')[0],
      estimatedArrival: estimatedArrival || undefined,
      driverPhone: driverPhone || undefined,
      status,
      notes: notes || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-150">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">{t('addDispatch')}</h2>
              <p className="text-[11px] text-slate-400">Logistics & transporter bilty</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          {errorMsg && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Select Wholesale Order *
            </label>
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-semibold"
            >
              {dispatchableOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} - {o.customerBusinessName || o.customerName} ({o.items.length} items)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Transporter / Courier Name *
            </label>
            <input
              type="text"
              required
              value={transporterName}
              onChange={(e) => setTransporterName(e.target.value)}
              placeholder="e.g. Surat Golden Transport, VRL Logistics"
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                LR / Bilty Number
              </label>
              <input
                type="text"
                value={lrNumber}
                onChange={(e) => setLrNumber(e.target.value.toUpperCase())}
                placeholder="e.g. SGT-489912"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Parcels / Bales Count
              </label>
              <input
                type="number"
                min={1}
                value={parcelCount}
                onChange={(e) => setParcelCount(Number(e.target.value))}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg text-center font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Weight (KG)
              </label>
              <input
                type="number"
                min={0}
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg text-center"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Estimated Delivery
              </label>
              <input
                type="date"
                value={estimatedArrival}
                onChange={(e) => setEstimatedArrival(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Driver Phone / Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Driver Ramesh (+91 98251 12345), gate 2 delivery"
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>Confirm Dispatch & Update Order</span>
          </button>
        </form>
      </div>
    </div>
  );
};
