import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { X, PackagePlus, Save, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { addProduct, updateProduct, t } = useApp();

  const [name, setName] = useState(productToEdit?.name || '');
  const [sku, setSku] = useState(productToEdit?.sku || '');
  const [unit, setUnit] = useState(productToEdit?.unit || 'pcs');
  const [costPrice, setCostPrice] = useState(productToEdit?.costPrice || 200);
  const [sellingPrice, setSellingPrice] = useState(productToEdit?.sellingPrice || 350);
  const [stockQuantity, setStockQuantity] = useState(productToEdit?.stockQuantity || 50);
  const [minStockAlert, setMinStockAlert] = useState(productToEdit?.minStockAlert || 15);
  const [taxRate, setTaxRate] = useState(productToEdit?.taxRate || 5);
  const [aliasesText, setAliasesText] = useState(productToEdit?.aliases?.join(', ') || '');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      setErrorMsg('Product name and SKU are required.');
      return;
    }

    const aliases = aliasesText
      .split(',')
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean);

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        name,
        sku,
        unit,
        costPrice,
        sellingPrice,
        taxRate,
        minStockAlert,
        aliases,
      });
    } else {
      addProduct({
        name,
        sku,
        unit,
        costPrice,
        sellingPrice,
        taxRate,
        stockQuantity,
        minStockAlert,
        aliases,
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
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">
                {productToEdit ? 'Edit Product' : t('addProduct')}
              </h2>
              <p className="text-[11px] text-slate-400">Wholesale catalogue & inventory control</p>
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
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rayon Anarkali Kurti Blue"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                SKU Code *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. KURTI-RAY-BLU"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Unit of Measure
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-semibold"
              >
                <option value="pcs">pcs (Pieces)</option>
                <option value="meters">meters</option>
                <option value="sets">sets</option>
                <option value="boxes">boxes</option>
                <option value="rolls">rolls</option>
                <option value="thaan">thaan (Fold)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Cost / Mill Price (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Wholesale Price (₹) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold text-teal-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {!productToEdit && (
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Initial Stock
                </label>
                <input
                  type="number"
                  min={0}
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold"
                />
              </div>
            )}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Min Stock Alert
              </label>
              <input
                type="number"
                min={0}
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(Number(e.target.value))}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold text-rose-700"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                GST Rate (%)
              </label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
              >
                <option value={5}>5% (Textiles/Yarn)</option>
                <option value={12}>12% (Apparel &gt; ₹1000)</option>
                <option value={18}>18% (Synthetic/Services)</option>
              </select>
            </div>
          </div>

          {/* AI WhatsApp Aliases / Keywords */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              WhatsApp Aliases / Abbreviations for AI Matching
            </label>
            <input
              type="text"
              value={aliasesText}
              onChange={(e) => setAliasesText(e.target.value)}
              placeholder="e.g. blue kurti, rayon blue, blue anarkali (comma separated)"
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              When a buyer mentions these keywords in WhatsApp chats, OrderSaathi AI will automatically match this product.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{productToEdit ? 'Save Product Changes' : 'Add to Catalogue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
