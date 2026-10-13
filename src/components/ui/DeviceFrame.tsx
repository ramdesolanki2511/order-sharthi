import React from 'react';
import { useApp } from '../../context/AppContext';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

export const DeviceFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { deviceFrame, setDeviceFrame } = useApp();

  if (!deviceFrame) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col w-full text-slate-900 font-sans antialiased">
        {children}
      </div>
    );
  }

  // Realistic Mobile Smartphone Viewport Frame
  return (
    <div className="min-h-screen bg-slate-950 py-4 px-2 sm:px-4 flex flex-col items-center justify-center font-sans">
      {/* Top Banner Notice */}
      <div className="mb-2 text-center text-xs text-slate-400 flex items-center space-x-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>OrderSaathi Mobile Preview</span>
        <span className="text-slate-600">|</span>
        <button
          onClick={() => setDeviceFrame(false)}
          className="text-teal-400 hover:underline font-medium text-xs"
        >
          Expand to Web View
        </button>
      </div>

      {/* Phone Casing */}
      <div className="relative w-full max-w-[420px] h-[860px] max-h-[92vh] bg-slate-900 rounded-[44px] p-2.5 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-800 flex flex-col overflow-hidden">
        {/* Dynamic Island / Speaker Notch & Status Bar */}
        <div className="bg-slate-900 pt-1 pb-1.5 px-6 flex items-center justify-between text-slate-300 text-[11px] font-semibold shrink-0 select-none">
          <span>9:41</span>
          <div className="w-24 h-4 bg-slate-950 rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500/70"></div>
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <BatteryMedium className="w-3.5 h-3.5 text-slate-300" />
          </div>
        </div>

        {/* Screen Content Wrapper */}
        <div className="flex-1 bg-slate-50 rounded-[34px] overflow-hidden flex flex-col relative shadow-inner">
          {children}

          {/* Bottom Home Indicator Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-400/40 rounded-full pointer-events-none z-40"></div>
        </div>
      </div>
    </div>
  );
};
