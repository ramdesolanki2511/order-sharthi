import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ShoppingBag,
  Users,
  Package,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  X,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingTourModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { setHasCompletedOnboarding, t } = useApp();
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Welcome to OrderSaathi (ઓર્ડરસાથી)',
      subtitle: 'The Smart Mobile App for Indian B2B Traders & Wholesalers',
      desc: 'Built specifically for textile traders, garment manufacturers, and distributors in Surat, Ahmedabad, and Gujarat hubs to manage bills, payments, inventory, and dispatches effortlessly.',
      icon: Sparkles,
      color: 'bg-teal-600',
    },
    {
      title: 'WhatsApp Message-to-Order AI',
      subtitle: 'Never retype customer WhatsApp orders manually',
      desc: 'Copy and paste informal WhatsApp orders directly into OrderSaathi. The built-in Gemini AI extracts product names, sizes, quantities, and matches your catalogue automatically for verification.',
      icon: MessageSquare,
      color: 'bg-emerald-600',
    },
    {
      title: 'Wholesale Customer Ledger (Khata)',
      subtitle: 'Real-time balances, credit limits, and reminders',
      desc: 'Track outstanding balances, payment terms, and 1-tap WhatsApp payment reminders so you collect dues on time without awkward phone calls.',
      icon: Users,
      color: 'bg-blue-600',
    },
    {
      title: 'Stock & Inventory Protection',
      subtitle: 'Zero stock-outs and backorder controls',
      desc: 'Monitor low stock alerts, log factory stock-in and sales stock-out movements, and prevent duplicate orders with real-time inventory checks.',
      icon: Package,
      color: 'bg-purple-600',
    },
  ];

  const current = tourSteps[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      setHasCompletedOnboarding(true);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden text-center flex flex-col">
        {/* Top Graphic */}
        <div className={`${current.color} p-6 text-white flex flex-col items-center justify-center relative transition-colors duration-300`}>
          <button
            onClick={() => {
              setHasCompletedOnboarding(true);
              onClose();
            }}
            className="absolute top-3 right-3 text-white/70 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-2 shadow-inner">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded-full">
            Step {step + 1} of {tourSteps.length}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 text-xs flex-1">
          <h3 className="text-base font-extrabold text-slate-900 leading-tight">
            {current.title}
          </h3>
          <p className="text-teal-700 font-bold text-[11px]">{current.subtitle}</p>
          <p className="text-slate-600 leading-relaxed text-[11px]">{current.desc}</p>
        </div>

        {/* Step Indicator & Button */}
        <div className="p-4 pt-0 space-y-3">
          <div className="flex justify-center space-x-1.5">
            {tourSteps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-teal-600' : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1 shadow-md transition"
          >
            <span>{step === tourSteps.length - 1 ? 'Get Started Now' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
