import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../i18n/translations';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Plus,
  MessageSquare,
  Sparkles,
  UserPlus,
  PackagePlus,
  ChevronRight,
  Phone,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface Props {
  onOpenWhatsAppAI: () => void;
  onOpenCreateOrder: () => void;
  onOpenAddCustomer: () => void;
  onOpenAddProduct: () => void;
  onOpenRecordPayment: () => void;
  onSelectOrder: (orderId: string) => void;
  onSelectCustomer: (customerId: string) => void;
}

export const DashboardScreen: React.FC<Props> = ({
  onOpenWhatsAppAI,
  onOpenCreateOrder,
  onOpenAddCustomer,
  onOpenAddProduct,
  onOpenRecordPayment,
  onSelectOrder,
  onSelectCustomer,
}) => {
  const {
    orders,
    customers,
    products,
    reminders,
    toggleReminder,
    setActiveTab,
    setMoreSubTab,
    t,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');

  // Filter orders by date range
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredOrders = orders.filter((o) => {
    if (dateFilter === 'today') return o.createdAt === todayStr;
    if (dateFilter === 'week') {
      const orderDate = new Date(o.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return orderDate >= weekAgo;
    }
    if (dateFilter === 'month') {
      const orderDate = new Date(o.createdAt);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return orderDate >= monthAgo;
    }
    return true;
  });

  // Dynamic calculations from actual database state
  const totalSales = filteredOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'pending_confirmation' || o.status === 'processing' || o.status === 'ready_for_dispatch'
  ).length;

  const completedOrdersCount = orders.filter(
    (o) => o.status === 'delivered' || o.status === 'dispatched'
  ).length;

  const totalOutstanding = customers.reduce((sum, c) => sum + Math.max(0, c.currentBalance), 0);

  // Overdue payments (customers with outstanding balance where paymentTermsDays exceeded)
  const overdueReceivables = customers
    .filter((c) => c.currentBalance > 0 && c.paymentTermsDays <= 15)
    .reduce((sum, c) => sum + c.currentBalance, 0);

  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStockAlert);
  const activeReminders = reminders.filter((r) => !r.isCompleted);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-3.5 space-y-4">
      {/* Date Filter Pills */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            {t('appName')}
          </h1>
          <p className="text-xs text-slate-500 font-medium">{t('tagline')}</p>
        </div>

        <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-200 shadow-xs text-xs font-semibold">
          {(['today', 'week', 'month', 'all'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-2.5 py-1 rounded-lg transition capitalize text-[11px] ${
                dateFilter === filter
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filter === 'today'
                ? t('filterToday')
                : filter === 'week'
                ? t('filterThisWeek')
                : filter === 'month'
                ? t('filterThisMonth')
                : t('filterAllTime')}
            </button>
          ))}
        </div>
      </div>

      {/* Signature Feature: WhatsApp Order AI CTA Banner */}
      <div
        onClick={onOpenWhatsAppAI}
        className="cursor-pointer bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white p-3.5 rounded-2xl shadow-lg border border-teal-600/40 relative overflow-hidden group hover:shadow-xl transition"
      >
        <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 opacity-15">
          <MessageSquare className="w-28 h-28 text-white" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-slate-950" />
              <span>AI Wholesale Order</span>
            </div>
            <h2 className="text-sm font-extrabold text-white">
              {t('actionWhatsAppImport')}
            </h2>
            <p className="text-[11px] text-teal-100 max-w-[240px]">
              Paste WhatsApp chats to auto-extract items, quantities, & prices in seconds.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition">
            <ChevronRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Key Financial & Order Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Total Sales */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">{t('totalSales')}</span>
            <div className="p-1 rounded-lg bg-teal-50 text-teal-700">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base font-black text-slate-900 tracking-tight">
            {formatINR(totalSales)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
            {filteredOrders.length} orders in period
          </p>
        </div>

        {/* Total Outstanding Dues */}
        <div
          onClick={() => {
            setActiveTab('more');
            setMoreSubTab('payments');
          }}
          className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">{t('outstandingDues')}</span>
            <div className="p-1 rounded-lg bg-rose-50 text-rose-700">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base font-black text-rose-700 tracking-tight">
            {formatINR(totalOutstanding)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
            Overdue: {formatINR(overdueReceivables)}
          </p>
        </div>

        {/* Pending Orders */}
        <div
          onClick={() => setActiveTab('orders')}
          className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">{t('pendingOrders')}</span>
            <div className="p-1 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base font-black text-amber-800 tracking-tight">
            {pendingOrdersCount}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
            Completed: {completedOrdersCount}
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">{t('lowStockAlerts')}</span>
            <div className={`p-1 rounded-lg ${lowStockProducts.length > 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-500'}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className={`text-base font-black tracking-tight ${lowStockProducts.length > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {lowStockProducts.length} items
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
            {lowStockProducts.length > 0 ? 'Action required' : 'Stock healthy'}
          </p>
        </div>
      </div>

      {/* Quick Actions Scroll Bar */}
      <div>
        <h2 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
          {t('quickActions')}
        </h2>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={onOpenCreateOrder}
            className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200 hover:border-teal-500 rounded-xl shadow-xs transition active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mb-1">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-800 text-center leading-tight">
              {t('actionNewOrder')}
            </span>
          </button>

          <button
            onClick={onOpenAddCustomer}
            className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200 hover:border-teal-500 rounded-xl shadow-xs transition active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mb-1">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-800 text-center leading-tight">
              {t('actionAddCustomer')}
            </span>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200 hover:border-teal-500 rounded-xl shadow-xs transition active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center mb-1">
              <PackagePlus className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-800 text-center leading-tight">
              {t('actionAddProduct')}
            </span>
          </button>

          <button
            onClick={onOpenRecordPayment}
            className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200 hover:border-teal-500 rounded-xl shadow-xs transition active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-800 text-center leading-tight">
              {t('actionRecordPayment')}
            </span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Alert Strip if any */}
      {lowStockProducts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold text-rose-900 block">
                {lowStockProducts[0].name}
              </span>
              <span className="text-[11px] text-rose-700">
                Only {lowStockProducts[0].stockQuantity} {lowStockProducts[0].unit} left (Alert: {lowStockProducts[0].minStockAlert})
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="text-[11px] font-bold bg-white text-rose-800 px-2.5 py-1 rounded-lg border border-rose-300 shadow-xs hover:bg-rose-100 transition shrink-0"
          >
            Reorder Stock
          </button>
        </div>
      )}

      {/* Upcoming Follow-up Reminders */}
      {activeReminders.length > 0 && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('upcomingFollowUps')} ({activeReminders.length})</span>
            </h3>
            <button
              onClick={() => {
                setActiveTab('more');
                setMoreSubTab('followups');
              }}
              className="text-[11px] font-semibold text-teal-700 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-1.5">
            {activeReminders.slice(0, 2).map((rem) => (
              <div
                key={rem.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800 text-[11px]">{rem.customerName}</p>
                  <p className="text-[10px] text-slate-500">{rem.title}</p>
                </div>
                <div className="flex items-center space-x-1.5">
                  <a
                    href={`https://wa.me/${rem.customerPhone?.replace(/\D/g, '')}?text=Dear%20${encodeURIComponent(
                      rem.customerName
                    )},%20gentle%20reminder%20from%20Ambika%20Textiles%20regarding%20pending%20payment.`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-xs transition"
                    title="Send WhatsApp Reminder"
                  >
                    <MessageSquare className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => toggleReminder(rem.id)}
                    className="text-[10px] text-teal-700 font-bold px-1.5 py-1 bg-white rounded border border-slate-200"
                  >
                    Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {t('recentOrders')}
          </h2>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-[11px] font-semibold text-teal-700 hover:underline"
          >
            {t('all')} ({orders.length})
          </button>
        </div>

        <div className="space-y-2">
          {orders.slice(0, 4).map((order) => (
            <div
              key={order.id}
              onClick={() => onSelectOrder(order.id)}
              className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 cursor-pointer transition flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-slate-900">
                    {order.orderNumber}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      order.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'ready_for_dispatch'
                        ? 'bg-indigo-100 text-indigo-800'
                        : order.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700 truncate max-w-[200px]">
                  {order.customerBusinessName || order.customerName}
                </p>
                <p className="text-[10px] text-slate-400">
                  {order.items.length} items • {order.createdAt}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-black text-slate-900">
                  {formatINR(order.grandTotal)}
                </p>
                <p
                  className={`text-[10px] font-bold ${
                    order.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {order.balanceDue > 0 ? `Due: ${formatINR(order.balanceDue)}` : 'Paid in Full'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Wholesale Customers Strip */}
      <div className="space-y-2 pt-1 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {t('recentCustomers')}
          </h2>
          <button
            onClick={() => setActiveTab('customers')}
            className="text-[11px] font-semibold text-teal-700 hover:underline"
          >
            {t('all')} ({customers.length})
          </button>
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-1 -mx-1 px-1">
          {customers.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCustomer(c.id)}
              className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs shrink-0 w-36 cursor-pointer hover:border-teal-500 transition space-y-1"
            >
              <p className="font-bold text-[11px] text-slate-900 truncate">
                {c.businessName}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{c.city}</p>
              <div className="pt-0.5 border-t border-slate-100">
                <span className="text-[9px] text-slate-400 block">Balance:</span>
                <span
                  className={`text-[11px] font-bold ${
                    c.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {formatINR(c.currentBalance)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
