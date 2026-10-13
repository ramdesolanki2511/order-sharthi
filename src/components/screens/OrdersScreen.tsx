import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../i18n/translations';
import { OrderStatus } from '../../types';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Sparkles,
  Repeat,
  Printer,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Calendar,
} from 'lucide-react';

interface Props {
  onOpenCreateOrder: () => void;
  onOpenWhatsAppAI: () => void;
  onSelectOrder: (orderId: string) => void;
}

export const OrdersScreen: React.FC<Props> = ({
  onOpenCreateOrder,
  onOpenWhatsAppAI,
  onSelectOrder,
}) => {
  const { orders, repeatOrder, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerBusinessName && o.customerBusinessName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Delivered</span>;
      case 'dispatched':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Dispatched</span>;
      case 'ready_for_dispatch':
        return <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Ready for Dispatch</span>;
      case 'processing':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Processing</span>;
      case 'confirmed':
        return <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Confirmed</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Cancelled</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Pending</span>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-3.5 space-y-3.5">
      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-slate-900 tracking-tight">
            {t('ordersTitle')}
          </h1>
          <p className="text-[11px] text-slate-500">
            {orders.length} total orders recorded
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={onOpenWhatsAppAI}
            className="p-2 bg-gradient-to-r from-teal-700 to-emerald-700 text-white rounded-xl shadow-xs text-xs font-bold flex items-center space-x-1"
            title="Import WhatsApp Order"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">WhatsApp AI</span>
          </button>

          <button
            onClick={onOpenCreateOrder}
            className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs text-xs font-bold flex items-center space-x-1 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createOrder')}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order #, customer, firm..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs font-medium"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 -mx-1 px-1 text-xs">
        {[
          { id: 'all', label: 'All' },
          { id: 'confirmed', label: 'Confirmed' },
          { id: 'processing', label: 'Processing' },
          { id: 'ready_for_dispatch', label: 'Ready' },
          { id: 'dispatched', label: 'Dispatched' },
          { id: 'delivered', label: 'Delivered' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-2.5 py-1 rounded-lg shrink-0 text-[11px] font-semibold transition ${
              statusFilter === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-2.5 pb-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">No orders found</p>
            <p className="text-xs text-slate-400">
              Create a new order or extract one from a customer's WhatsApp message.
            </p>
            <button
              onClick={onOpenCreateOrder}
              className="mt-2 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              + Create First Order
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => onSelectOrder(order.id)}
              className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 cursor-pointer transition space-y-2 group"
            >
              {/* Top Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xs text-slate-900 group-hover:text-teal-700">
                    {order.orderNumber}
                  </span>
                  {getStatusBadge(order.status)}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {order.createdAt}
                </span>
              </div>

              {/* Middle Row */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-800">
                    {order.customerBusinessName || order.customerName}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {order.items.length} items (
                    {order.items.map((it) => `${it.quantity} ${it.unit} ${it.productName}`).slice(0, 2).join(', ')}
                    {order.items.length > 2 ? '...' : ''})
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs text-slate-900">
                    {formatINR(order.grandTotal)}
                  </p>
                  <p
                    className={`text-[10px] font-bold ${
                      order.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {order.balanceDue > 0 ? `Due: ${formatINR(order.balanceDue)}` : 'Paid'}
                  </p>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 flex items-center space-x-1">
                  <span className="capitalize text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                    {order.source.replace('_', ' ')}
                  </span>
                  {order.deliveryNotes && (
                    <span className="text-slate-400 truncate max-w-[140px] text-[10px]">
                      • {order.deliveryNotes}
                    </span>
                  )}
                </span>

                <div className="flex items-center space-x-2 text-teal-700 font-bold text-[11px] group-hover:translate-x-0.5 transition">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
