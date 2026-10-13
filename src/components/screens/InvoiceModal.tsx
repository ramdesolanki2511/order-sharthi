import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../i18n/translations';
import { X, Printer, Share2, Download, Check } from 'lucide-react';

interface Props {
  orderId: string | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<Props> = ({ orderId, onClose }) => {
  const { orders, customers, business } = useApp();
  const printRef = useRef<HTMLDivElement>(null);

  if (!orderId) return null;
  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;

  const customer = customers.find((c) => c.id === order.customerId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-300 flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in duration-150">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm">Tax Invoice / Bill Preview</span>
            <span className="text-teal-400 text-xs font-mono">#{order.orderNumber}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div
          ref={printRef}
          className="p-6 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-0 print:m-0"
        >
          {/* Header & Logo */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                {business.name}
              </h1>
              <p className="text-xs text-slate-600 font-medium max-w-xs leading-relaxed">
                {business.addressLine1}, {business.addressLine2 ? `${business.addressLine2}, ` : ''}
                {business.city}, {business.state} - {business.pincode}
              </p>
              <p className="text-xs text-slate-700 mt-1 font-semibold">
                Phone: {business.phone} | GSTIN: <span className="font-mono">{business.gstin}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-slate-900 text-white font-extrabold text-xs px-2.5 py-1 rounded tracking-wider uppercase">
                Tax Invoice
              </span>
              <p className="text-xs font-bold text-slate-900 mt-2 font-mono">
                Bill No: {order.orderNumber}
              </p>
              <p className="text-[11px] text-slate-500">Date: {order.createdAt}</p>
            </div>
          </div>

          {/* Billed To / Buyer Info */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Billed To (Buyer):</p>
              <p className="font-extrabold text-slate-900 text-sm">
                {order.customerBusinessName || order.customerName}
              </p>
              <p className="text-slate-600">{customer?.billingAddress || order.deliveryAddress || 'Surat Market'}</p>
              <p className="text-slate-700 font-medium mt-1">Phone: {order.customerPhone}</p>
              {customer?.gstin && (
                <p className="text-slate-800 font-semibold font-mono">GSTIN: {customer.gstin}</p>
              )}
            </div>

            <div className="text-right space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Order Details:</p>
              <p className="text-slate-700">Source: <span className="capitalize font-semibold">{order.source.replace('_', ' ')}</span></p>
              <p className="text-slate-700">Payment Status: <span className="capitalize font-bold text-teal-800">{order.paymentStatus}</span></p>
              {order.deliveryNotes && (
                <p className="text-slate-600 italic text-[11px]">Dispatch Note: {order.deliveryNotes}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 text-[10px] uppercase text-slate-600 font-bold">
                  <th className="py-2">#</th>
                  <th className="py-2">Description of Goods</th>
                  <th className="py-2 text-center">HSN</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Rate</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, index) => (
                  <tr key={index} className="text-slate-800">
                    <td className="py-2.5 font-mono text-[11px]">{index + 1}</td>
                    <td className="py-2.5 font-semibold">
                      {item.productName}
                      {item.variant ? <span className="text-slate-500 font-normal block text-[10px]">{item.variant}</span> : null}
                    </td>
                    <td className="py-2.5 text-center font-mono text-[11px]">5407</td>
                    <td className="py-2.5 text-center font-bold">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2.5 text-right font-mono">{formatINR(item.unitPrice)}</td>
                    <td className="py-2.5 text-right font-bold font-mono">{formatINR(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Calculations */}
          <div className="border-t-2 border-slate-800 pt-3 flex justify-between items-start text-xs">
            {/* Bank & Payment Instructions */}
            <div className="max-w-xs space-y-1 text-[11px] text-slate-600">
              <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Payment Details:</p>
              <p>Bank: HDFC Bank Ltd, Ring Road Branch, Surat</p>
              <p className="font-mono">A/C: 50200012345678 | IFSC: HDFC0001234</p>
              <p className="font-mono font-semibold text-slate-800">UPI ID: ambikatex@okaxis</p>
            </div>

            {/* Price Breakdown */}
            <div className="w-48 space-y-1.5 font-sans">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold font-mono">{formatINR(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount:</span>
                  <span className="font-mono">-{formatINR(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>CGST (2.5%):</span>
                <span className="font-mono">{formatINR(order.taxAmount / 2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (2.5%):</span>
                <span className="font-mono">{formatINR(order.taxAmount / 2)}</span>
              </div>
              {order.shippingCharges > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Freight/Shipping:</span>
                  <span className="font-mono">{formatINR(order.shippingCharges)}</span>
                </div>
              )}
              <div className="flex justify-between border-t-2 border-slate-900 pt-1.5 text-slate-900 font-black text-sm">
                <span>Total Amount:</span>
                <span className="font-mono">{formatINR(order.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Amount Paid:</span>
                <span className="font-mono">{formatINR(order.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-black border-t border-slate-200 pt-1">
                <span>Balance Due:</span>
                <span className="font-mono">{formatINR(order.balanceDue)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Stamp */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
            <div className="space-y-0.5 max-w-xs">
              <p className="font-bold text-slate-700 uppercase">Terms & Conditions:</p>
              <p>1. Goods once sold will not be taken back or exchanged.</p>
              <p>2. Interest @ 18% p.a. will be charged if payment delayed past credit term.</p>
              <p>3. Subject to Surat jurisdiction only.</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-12 border border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 text-[9px] mb-1">
                Authorized Signatory
              </div>
              <p className="font-bold text-slate-800">For {business.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
