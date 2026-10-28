import React from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { Bell, Play, Pause, LayoutGrid, Sliders, BarChart3 } from 'lucide-react';

interface HeaderProps {
  onOpenMenu: () => void;
  onOpenAlerts: () => void;
  onOpenDownlink: () => void;
  onOpenAnalytics: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMenu,
  onOpenAlerts,
  onOpenDownlink,
  onOpenAnalytics,
}) => {
  const {
    isLiveStreaming,
    setIsLiveStreaming,
    unreadAlertCount,
    animals,
    selectedAnimalId,
    setSelectedAnimalId,
  } = useMonitoring();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Menu Launcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenMenu}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Menu</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
              Monitor Hewan
            </span>
            <span className="hidden lg:inline text-[11px] text-slate-400 font-mono">
              STM32WL LoRa
            </span>
          </div>
        </div>

        {/* Quick Pop-up Launchers on Desktop / Tablets */}
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={onOpenDownlink}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium cursor-pointer transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Pengaturan Alat</span>
          </button>

          <button
            onClick={onOpenAnalytics}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium cursor-pointer transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Analisis Akurasi</span>
          </button>
        </div>

        {/* Right Actions: Animal Dropdown, Alerts, Live stream */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Animal Dropdown */}
          <select
            value={selectedAnimalId}
            onChange={(e) => setSelectedAnimalId(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 sm:px-2.5 py-1.5 text-slate-800 max-w-[110px] sm:max-w-[160px] truncate focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            {animals.map((anm) => (
              <option key={anm.id} value={anm.id}>
                {anm.name}
              </option>
            ))}
          </select>

          {/* Alert button */}
          <button
            onClick={onOpenAlerts}
            aria-label="Pemberitahuan Kesehatan"
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-600 text-white text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Live toggle */}
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              isLiveStreaming
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {isLiveStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Live Aktif</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mulai Live</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
