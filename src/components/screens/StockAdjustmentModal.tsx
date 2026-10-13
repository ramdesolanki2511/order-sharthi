import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { X, ArrowDownRight, ArrowUpRight, AlertCircle, Save } from 'lucide-react';

interface Props {
  product: Product | null;
  onClose: () => void;
}

export const StockAdjustmentModal: React.FC<Props> = ({ product, onClose }) => {
  const { adjustStock, business, t } = useApp();

  const [movementType, setMovementType] = useState<'stock_in' | 'stock_out'>('stock_in');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState<string>('Purchase from Mill / Factory');
  const [errorMsg, setErrorMsg] = useState('');

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setErrorMsg('Quantity must be greater than 0');
      return;
    }

    const delta = movementType === 'stock_in' ? quantity : -quantity;
    const success = adjustStock(product.id, delta, reason);

    if (!success) {
      setErrorMsg(t('backorderWarning'));
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-150">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold">{t('adjustStock')}</h2>
            <p className="text-[11px] text-slate-400">{product.name} ({product.sku})</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {errorMsg && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Stock Indicator */}
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
            <span className="text-slate-600 font-medium">Current Stock on Hand:</span>
            <span className="font-extrabold text-sm text-slate-900">
              {product.stockQuantity} {product.unit}
            </span>
          </div>

          {/* Movement Type Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setMovementType('stock_in');
                setReason('Purchase / Factory Mill Stock-in');
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                movementType === 'stock_in'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-emerald-600" />
              <span>Stock In (+)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMovementType('stock_out');
                setReason('Manual Sale / Sample / Damage');
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                movementType === 'stock_out'
                  ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              <span>Stock Out (-)</span>
            </button>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Quantity to {movementType === 'stock_in' ? 'Add' : 'Deduct'} ({product.unit})
            </label>
            <input
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full text-sm font-bold p-2 bg-white border border-slate-300 rounded-lg text-center"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Reason / Reference
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Surat weaver delivery, physical count adjustment"
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>Update Inventory Stock</span>
          </button>
        </form>
      </div>
    </div>
  );
};
