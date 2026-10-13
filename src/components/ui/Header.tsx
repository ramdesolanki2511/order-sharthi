import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Language, UserRole } from '../../types';
import {
  Bell,
  Globe,
  Smartphone,
  Monitor,
  Shield,
  HelpCircle,
  X,
  Check,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    business,
    userProfile,
    switchUserRole,
    language,
    setLanguage,
    t,
    notifications,
    markNotificationRead,
    setActiveTab,
    deviceFrame,
    setDeviceFrame,
    setShowOnboardingTour,
  } = useApp();

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const languages: { code: Language; label: string; sub: string }[] = [
    { code: 'gu', label: 'ગુજરાતી', sub: 'Gujarati' },
    { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
    { code: 'en', label: 'English', sub: 'English' },
  ];

  const roles: { code: UserRole; label: string; desc: string }[] = [
    { code: 'owner', label: t('roleOwner'), desc: 'Full business & billing control' },
    { code: 'manager', label: t('roleManager'), desc: 'Manage orders, stock & payments' },
    { code: 'staff', label: t('roleStaff'), desc: 'Create orders & view catalog' },
  ];

  return (
    <header className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between shadow-md relative z-30 select-none">
      {/* Business & Brand */}
      <div className="flex items-center space-x-2.5 overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-slate-950 text-base shadow-sm shrink-0">
          OS
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-sm tracking-tight text-white truncate">
              {business.name}
            </span>
            <span className="text-[10px] bg-teal-900/80 text-teal-300 font-semibold px-1.5 py-0.5 rounded border border-teal-700/60 uppercase">
              {business.city}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <span>{business.gstin ? `GST: ${business.gstin}` : business.businessCategory}</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-1.5 shrink-0">
        {/* Mobile Viewport Toggle */}
        <button
          onClick={() => setDeviceFrame(!deviceFrame)}
          title={deviceFrame ? 'Switch to Full Web View' : 'Switch to Mobile Phone View'}
          className={`p-1.5 rounded-lg text-xs flex items-center transition ${
            deviceFrame
              ? 'bg-teal-600/30 text-teal-300 border border-teal-500/50'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {deviceFrame ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
        </button>

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded-lg border border-slate-700 transition"
          >
            <Shield className="w-3 h-3 text-teal-400" />
            <span className="capitalize font-medium text-[11px]">
              {userProfile.role === 'owner' ? 'Owner' : userProfile.role === 'manager' ? 'Manager' : 'Staff'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Simulate Role Access
              </div>
              {roles.map((r) => (
                <button
                  key={r.code}
                  onClick={() => {
                    switchUserRole(r.code);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                    userProfile.role === r.code ? 'font-bold text-teal-700 bg-teal-50/50' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <p>{r.label}</p>
                    <p className="text-[10px] text-slate-400 font-normal">{r.desc}</p>
                  </div>
                  {userProfile.role === r.code && <Check className="w-3.5 h-3.5 text-teal-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs px-2 py-1 rounded-lg border border-slate-700 transition"
          >
            <Globe className="w-3 h-3" />
            <span className="font-semibold text-[11px]">
              {language === 'gu' ? 'ગુજ' : language === 'hi' ? 'हिन्दी' : 'ENG'}
            </span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-40 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1 z-50">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                    language === l.code ? 'font-bold text-teal-700 bg-teal-50' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <span className="text-sm">{l.label}</span>
                    <span className="text-[10px] text-slate-400 block">{l.sub}</span>
                  </div>
                  {language === l.code && <Check className="w-3.5 h-3.5 text-teal-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 relative transition"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
              <div className="px-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Notifications ({unreadCount})</span>
                <button
                  onClick={() => setShowNotifMenu(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.linkTab) setActiveTab(n.linkTab as any);
                        setShowNotifMenu(false);
                      }}
                      className={`p-2.5 text-xs cursor-pointer hover:bg-slate-50 transition ${
                        !n.isRead ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <AlertTriangle
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                            n.type === 'low_stock' ? 'text-rose-500' : 'text-amber-500'
                          }`}
                        />
                        <div>
                          <p className="font-semibold text-slate-800">{n.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Product Tour Trigger */}
        <button
          onClick={() => setShowOnboardingTour(true)}
          title="Product Tour"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
