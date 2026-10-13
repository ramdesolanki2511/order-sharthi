export const theme = {
  colors: {
    primary: '#0D9488', // Gujarat trade trusted teal
    primaryDark: '#0F766E',
    primaryLight: '#CCFBF1',
    primaryHover: '#115E59',
    secondary: '#0284C7', // Sky Blue
    accent: '#F59E0B', // Amber for notifications & pending
    success: '#10B981', // Emerald for payments received
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444', // Red for overdue & low stock
    dangerLight: '#FEE2E2',
    background: '#F8FAFC', // Slate 50
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5F9',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    textMain: '#0F172A', // Slate 900
    textMuted: '#64748B', // Slate 500
    textSubtle: '#94A3B8', // Slate 400
  },
  statusColors: {
    draft: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
    pending_confirmation: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
    confirmed: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-300' },
    processing: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' },
    ready_for_dispatch: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-300' },
    dispatched: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300' },
    delivered: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
    cancelled: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300' },
    // Payment
    unpaid: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300' },
    partially_paid: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
    paid: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
    overdue: { bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-400' },
  },
};
