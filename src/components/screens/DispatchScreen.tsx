import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  Plus,
  MessageSquare,
  PackageCheck,
  Clock,
  Calendar,
  Share2,
} from 'lucide-react';

interface Props {
  onOpenAddDispatch: () => void;
}

export const DispatchScreen: React.FC<Props> = ({ onOpenAddDispatch }) => {
  const { dispatches, orders, t } = useApp();

  const awaitingDispatch = orders.filter((o) => o.status === 'ready_for_dispatch' || o.status === 'processing');

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            {t('dispatchTitle')}
          </h2>
          <p className="text-[11px] text-slate-500">
            Transport & logistics tracking
          </p>
        </div>

        <button
          onClick={onOpenAddDispatch}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs text-xs font-bold flex items-center space-x-1 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record Dispatch</span>
        </button>
      </div>

      {/* Awaiting Dispatch Notice */}
      {awaitingDispatch.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="font-bold text-indigo-950 block">
                {awaitingDispatch.length} orders awaiting dispatch
              </span>
              <span className="text-[10px] text-indigo-700">
                Packed and ready for transporter handover.
              </span>
            </div>
          </div>
          <button
            onClick={onOpenAddDispatch}
            className="text-[10px] font-bold bg-white text-indigo-800 px-2 py-1 rounded-lg border border-indigo-300 shadow-2xs hover:bg-indigo-100 transition shrink-0"
          >
            Dispatch Now
          </button>
        </div>
      )}

      {/* Dispatch List */}
      <div className="space-y-2.5 pb-6">
        {dispatches.length === 0 ? (
          <p className="text-center py-8 text-slate-400 text-xs">No dispatches recorded yet.</p>
        ) : (
          dispatches.map((d) => (
            <div
              key={d.id}
              className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-xs text-slate-900">
                      {d.orderNumber}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 uppercase">
                      {d.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{d.customerName}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block">{d.dispatchDate}</span>
                  {d.lrNumber && (
                    <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      LR: {d.lrNumber}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-2 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span className="text-[11px] font-semibold">{d.transporterName}</span>
                  <span className="text-[11px] font-bold text-slate-900">{d.parcelCount} Parcels ({d.weightKg || 25} kg)</span>
                </div>
                {d.notes && <p className="text-[10px] text-slate-500">{d.notes}</p>}
              </div>

              <div className="pt-1 flex items-center justify-end space-x-2">
                <a
                  href={`https://wa.me/?text=Hello,%20your%20order%20${encodeURIComponent(
                    d.orderNumber
                  )}%20has%20been%20dispatched%20via%20${encodeURIComponent(
                    d.transporterName
                  )}.%20LR%20Bilty%20Number:%20${encodeURIComponent(d.lrNumber || 'N/A')}.`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center space-x-1"
                >
                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                  <span>Share LR on WhatsApp</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
