import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../i18n/translations';
import {
  Calendar,
  Plus,
  MessageSquare,
  CheckCircle2,
  Clock,
  Phone,
  Trash2,
} from 'lucide-react';

export const FollowUpsScreen: React.FC = () => {
  const { reminders, toggleReminder, addReminder, customers, business, t } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !customerId) return;

    const cust = customers.find((c) => c.id === customerId);

    addReminder({
      customerId,
      customerName: cust?.businessName || cust?.name || 'Customer',
      customerPhone: cust?.phone || '',
      reminderType: 'payment_due',
      title,
      dueDate,
      notes,
    });

    setTitle('');
    setNotes('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-3.5 pb-6 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            Follow-ups & Reminders
          </h2>
          <p className="text-[11px] text-slate-500">
            Payment collections and reorder alerts
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs text-xs font-bold flex items-center space-x-1 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
          <h3 className="font-bold text-xs text-slate-800">New Customer Follow-up</h3>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Reminder Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Call regarding overdue balance of ₹38,450"
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention bilty received"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs"
            >
              Save Follow-up
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reminders List */}
      <div className="space-y-2">
        {reminders.length === 0 ? (
          <p className="text-center py-8 text-slate-400">No active follow-ups scheduled.</p>
        ) : (
          reminders.map((r) => {
            const cleanPhone = r.customerPhone.replace(/\D/g, '');
            const cust = customers.find((c) => c.id === r.customerId);

            return (
              <div
                key={r.id}
                className={`p-3 rounded-2xl border transition shadow-2xs space-y-2 ${
                  r.isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">{r.customerName}</span>
                    <span className="text-[11px] font-medium text-slate-700 block mt-0.5">{r.title}</span>
                    <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                      Due Date: {r.dueDate}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleReminder(r.id)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                      r.isCompleted
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-teal-50 text-teal-800 border border-teal-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>{r.isCompleted ? 'Completed' : 'Mark Done'}</span>
                  </button>
                </div>

                {r.notes && <p className="text-[10px] text-slate-500 italic">{r.notes}</p>}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Balance: {formatINR(cust?.currentBalance || 0)}</span>

                  <div className="flex items-center space-x-1.5">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="p-1 bg-slate-100 rounded-md text-slate-700 hover:bg-slate-200 flex items-center space-x-0.5 text-[10px] font-bold"
                    >
                      <Phone className="w-3 h-3 text-blue-600" />
                      <span>Call</span>
                    </a>

                    <a
                      href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
                        r.customerName
                      )},%20gentle%20reminder%20from%20${encodeURIComponent(business.name)}%20regarding%20${encodeURIComponent(
                        r.title
                      )}.`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 bg-emerald-50 rounded-md text-emerald-800 hover:bg-emerald-100 flex items-center space-x-0.5 text-[10px] font-bold"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                      <span>Send WhatsApp</span>
                    </a>
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
