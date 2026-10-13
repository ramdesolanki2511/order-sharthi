import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../i18n/translations';
import { Product } from '../../types';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  ArrowDownUp,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface Props {
  onOpenAddProduct: () => void;
  onOpenAdjustStock: (product: Product) => void;
  onEditProduct: (product: Product) => void;
}

export const ProductsScreen: React.FC<Props> = ({
  onOpenAddProduct,
  onOpenAdjustStock,
  onEditProduct,
}) => {
  const { products, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.aliases && p.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesLowStock = filterLowStock ? p.stockQuantity <= p.minStockAlert : true;
    return matchesSearch && matchesLowStock;
  });

  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockAlert).length;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-3.5 space-y-3.5">
      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-slate-900 tracking-tight">
            {t('inventoryTitle')}
          </h1>
          <p className="text-[11px] text-slate-500">
            {products.length} products • {lowStockCount} low stock alerts
          </p>
        </div>

        <button
          onClick={onOpenAddProduct}
          className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs text-xs font-bold flex items-center space-x-1 transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addProduct')}</span>
        </button>
      </div>

      {/* Search Bar & Low Stock Filter Toggle */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU, or WhatsApp alias..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs font-medium"
          />
        </div>

        <button
          type="button"
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 border transition shrink-0 ${
            filterLowStock
              ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${filterLowStock ? 'text-rose-600' : 'text-slate-400'}`} />
          <span>Low Stock ({lowStockCount})</span>
        </button>
      </div>

      {/* Product List */}
      <div className="space-y-2.5 pb-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No products match</p>
            <p className="text-xs text-slate-400">Add wholesale items or adjust filters.</p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isLowStock = p.stockQuantity <= p.minStockAlert;
            const margin = p.sellingPrice - p.costPrice;

            return (
              <div
                key={p.id}
                className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-extrabold text-xs text-slate-900">
                        {p.name}
                      </span>
                      {isLowStock && (
                        <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>LOW</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      SKU: {p.sku} • GST: {p.taxRate}%
                    </p>
                    {p.aliases && p.aliases.length > 0 && (
                      <p className="text-[10px] text-teal-800 mt-0.5">
                        AI Aliases: {p.aliases.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block font-semibold">Stock on Hand:</span>
                    <span
                      className={`text-sm font-black ${
                        isLowStock ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {p.stockQuantity} <span className="text-xs font-semibold">{p.unit}</span>
                    </span>
                  </div>
                </div>

                {/* Price and Profit Row */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3 text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-400 block">Wholesale Rate:</span>
                      <span className="font-bold text-teal-800">{formatINR(p.sellingPrice)}/{p.unit}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Cost Price:</span>
                      <span className="font-semibold text-slate-600">{formatINR(p.costPrice)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Profit Margin:</span>
                      <span className="font-bold text-emerald-700">+{formatINR(margin)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenAdjustStock(p)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[10px] flex items-center space-x-1 transition"
                    >
                      <ArrowDownUp className="w-3 h-3 text-teal-600" />
                      <span>Adjust Stock</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditProduct(p)}
                      className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-[10px] transition"
                    >
                      Edit
                    </button>
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
