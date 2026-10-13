import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../i18n/translations';
import {
  Sparkles,
  Check,
  ShieldCheck,
  Zap,
  Info,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const SubscriptionScreen: React.FC = () => {
  const { subscription, upgradeSubscription, t } = useApp();

  const plans = [
    {
      id: 'starter' as const,
      name: 'Starter Plan',
      price: 499,
      period: 'per month',
      description: 'Ideal for small retail-to-wholesale textile shops',
      features: [
        'Up to 150 orders / month',
        'Single staff user login',
        'Standard PDF invoice generator',
        'Customer ledger & outstanding balance',
        'Standard email/WhatsApp support',
      ],
      highlight: false,
    },
    {
      id: 'pro' as const,
      name: 'Pro Trader Plan',
      price: 999,
      period: 'per month',
      description: 'Targeted for Surat & Ahmedabad wholesale traders',
      features: [
        'Up to 500 orders / month',
        '5 staff members with role permissions',
        'AI WhatsApp Message-to-Order parsing',
        'AI Customer reorder suggestions',
        'Multi-transporter LR/Bilty dispatch tracking',
        'Priority Gujarati & Hindi WhatsApp support',
      ],
      highlight: true,
      badge: 'MOST POPULAR IN GUJARAT',
    },
    {
      id: 'business' as const,
      name: 'Enterprise / Mill Plan',
      price: 1499,
      period: 'per month',
      description: 'For large garment manufacturers & multi-branch distributors',
      features: [
        'Up to 2,500 orders / month',
        'Unlimited staff & manager logins',
        'Advanced GST & accountant ledger CSV exports',
        'Custom invoice branding with watermark',
        'Dedicated account manager in Ahmedabad/Surat',
      ],
      highlight: false,
    },
  ];

  return (
    <div className="space-y-4 pb-8 text-xs">
      <div>
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          {t('subscriptionTitle')}
        </h2>
        <p className="text-[11px] text-slate-500">
          Transparent pricing for Indian wholesale traders
        </p>
      </div>

      {/* Current Active Plan Status Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-3.5 rounded-2xl shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-teal-500/30 text-teal-300 rounded-lg">
              <Zap className="w-4 h-4 text-amber-300" />
            </span>
            <div>
              <p className="text-[10px] text-teal-200 uppercase font-bold tracking-wider">
                Current Plan
              </p>
              <h3 className="text-sm font-extrabold uppercase">
                {subscription.tier.replace('_', ' ')}
              </h3>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
            {subscription.trialDaysLeft} Days Remaining
          </span>
        </div>

        {/* Usage Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-300 font-medium">
            <span>Monthly Order Allowance:</span>
            <span className="font-bold text-white font-mono">
              {subscription.ordersThisMonth} / {subscription.maxOrdersPerMonth} orders
            </span>
          </div>
          <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-400 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (subscription.ordersThisMonth / subscription.maxOrdersPerMonth) * 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <p className="text-[10px] text-slate-400">
          Your Pro trial period ends on <span className="font-bold text-slate-200">{subscription.currentPeriodEnd}</span>.
        </p>
      </div>

      {/* Plans Comparison */}
      <div className="space-y-3">
        {plans.map((plan) => {
          const isCurrent = subscription.tier === plan.id;

          return (
            <div
              key={plan.id}
              className={`p-3.5 rounded-2xl border transition relative ${
                plan.highlight
                  ? 'bg-teal-50/40 border-teal-500 shadow-sm ring-1 ring-teal-500/50'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-2.5 right-4 bg-teal-700 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow-xs">
                  {plan.badge}
                </div>
              )}

              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-black text-sm text-slate-900">{plan.name}</h4>
                  <p className="text-[11px] text-slate-500">{plan.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-slate-900">
                    {formatINR(plan.price)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">/month</span>
                </div>
              </div>

              {/* Feature Bullets */}
              <ul className="space-y-1.5 py-2 border-t border-slate-100 text-[11px] text-slate-700">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => upgradeSubscription(plan.id)}
                disabled={isCurrent}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition mt-2 shadow-xs ${
                  isCurrent
                    ? 'bg-slate-200 text-slate-500 cursor-default'
                    : plan.highlight
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isCurrent ? (
                  <span>Current Active Plan</span>
                ) : (
                  <>
                    <span>Switch to {plan.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Compliance & Store Policies Note */}
      <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
        <div className="flex items-center space-x-1 font-bold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Google Play & Apple App Store Billing Compliance</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          OrderSaathi mobile builds are designed to use Google Play Billing & Apple In-App Purchases for digital subscriptions when distributed through app stores, adhering strictly to store policies.
        </p>
      </div>
    </div>
  );
};
