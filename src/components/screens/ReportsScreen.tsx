import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../i18n/translations';
import {
  BarChart3,
  TrendingUp,
  FileDown,
  ShoppingBag,
  Users,
  Package,
  Clock,
  PieChart,
} from 'lucide-react';

export const ReportsScreen: React.FC = () => {
  const {
    orders,
    customers,
    products,
    exportOrdersCSV,
    exportCustomersCSV,
    exportLedgerCSV,
    t,
  } = useApp();

  // Metrics
  const totalGrossRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.grandTotal, 0);

  const totalCollected = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.amountPaid, 0);

  const totalReceivables = customers.reduce((acc, c) => acc + Math.max(0, c.currentBalance), 0);

  // Inventory valuation (Cost valuation vs Selling valuation)
  const inventoryCostValuation = products.reduce((acc, p) => acc + p.stockQuantity * p.costPrice, 0);
  const inventorySellingValuation = products.reduce((acc, p) => acc + p.stockQuantity * p.sellingPrice, 0);

  // Top products
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const ord of orders) {
    if (ord.status === 'cancelled') continue;
    for (const item of ord.items) {
      if (!productSalesMap[item.productId || item.productName]) {
        productSalesMap[item.productId || item.productName] = {
          name: item.productName,
          qty: 0,
          revenue: 0,
        };
      }
      productSalesMap[item.productId || item.productName].qty += item.quantity;
      productSalesMap[item.productId || item.productName].revenue += item.total;
    }
  }

  const topProducts = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-4 pb-6 text-xs">
      {/* Title & Exports */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            Wholesale Reports & Audits
          </h2>
          <p className="text-[11px] text-slate-500">
            GST sales, inventory valuation, and party ledgers
          </p>
        </div>

        <button
          onClick={exportOrdersCSV}
          className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl font-bold flex items-center space-x-1 shadow-2xs transition"
        >
          <FileDown className="w-3.5 h-3.5 text-teal-700" />
          <span>Export Orders</span>
        </button>
      </div>

      {/* Revenue & Gross Profit Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-3.5 rounded-2xl shadow-md space-y-2.5">
        <div className="flex justify-between items-center text-[11px] text-slate-400">
          <span>Gross Wholesale Sales (Revenue)</span>
          <span className="bg-teal-900/80 text-teal-300 px-2 py-0.5 rounded font-mono font-bold">
            {orders.length} Bills
          </span>
        </div>
        <p className="text-2xl font-black tracking-tight text-white">
          {formatINR(totalGrossRevenue)}
        </p>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Total Collected:</span>
            <span className="font-bold text-emerald-400">{formatINR(totalCollected)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Outstanding Dues:</span>
            <span className="font-bold text-rose-400">{formatINR(totalReceivables)}</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 italic">
          *Note: Metric represents wholesale turnover and receivables. Verify actual accounting net profit with your CA.
        </p>
      </div>

      {/* Inventory Valuation Card */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 text-xs flex items-center space-x-1">
            <Package className="w-3.5 h-3.5 text-teal-600" />
            <span>Inventory Valuation</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium">{products.length} Items</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 block">Cost Valuation (At Mill Cost):</span>
            <span className="font-extrabold text-sm text-slate-900">{formatINR(inventoryCostValuation)}</span>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 block">Expected Wholesale Value:</span>
            <span className="font-extrabold text-sm text-teal-800">{formatINR(inventorySellingValuation)}</span>
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <h3 className="font-bold text-slate-800 text-xs flex items-center space-x-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Top Selling Wholesale Items</span>
        </h3>

        <div className="space-y-1.5">
          {topProducts.slice(0, 4).map((p, idx) => (
            <div key={idx} className="p-2 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-xs">{p.name}</p>
                <p className="text-[10px] text-slate-500">{p.qty} units sold</p>
              </div>
              <p className="font-black text-teal-800 text-xs">{formatINR(p.revenue)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options for Tax & Accounts */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <h3 className="font-bold text-slate-800 text-xs">Accountant & CA Backup Exports</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={exportCustomersCSV}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition font-semibold text-slate-700"
          >
            <span className="block text-xs font-bold text-slate-900">Parties Master CSV</span>
            <span className="text-[10px] text-slate-400">All GSTIN & Balances</span>
          </button>
          <button
            onClick={exportLedgerCSV}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition font-semibold text-slate-700"
          >
            <span className="block text-xs font-bold text-slate-900">Ledger Statement CSV</span>
            <span className="text-[10px] text-slate-400">Debit / Credit breakdown</span>
          </button>
        </div>
      </div>
    </div>
  );
};
