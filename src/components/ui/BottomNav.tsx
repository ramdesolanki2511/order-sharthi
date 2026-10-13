import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  ShoppingBag,
  Users,
  Package,
  Layers,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, t, orders, products } = useApp();

  const pendingCount = orders.filter((o) => o.status === 'pending_confirmation' || o.status === 'processing').length;
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockAlert).length;

  const navItems = [
    {
      id: 'dashboard',
      label: t('navDashboard'),
      icon: Home,
      badge: 0,
    },
    {
      id: 'orders',
      label: t('navOrders'),
      icon: ShoppingBag,
      badge: pendingCount,
    },
    {
      id: 'customers',
      label: t('navCustomers'),
      icon: Users,
      badge: 0,
    },
    {
      id: 'inventory',
      label: t('navInventory'),
      icon: Package,
      badge: lowStockCount,
    },
    {
      id: 'more',
      label: t('navMore'),
      icon: Layers,
      badge: 0,
    },
  ] as const;

  return (
    <nav className="bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg shrink-0 z-20 select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition relative ${
              isActive
                ? 'text-teal-700 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              {item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white font-bold text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center border-2 border-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
