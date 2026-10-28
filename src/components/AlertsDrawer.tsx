import React from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { X, Check, Trash2, AlertTriangle, BatteryWarning, ThermometerSnowflake, Signal, CheckCircle2 } from 'lucide-react';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({ isOpen, onClose }) => {
  const { alerts, acknowledgeAlert, dismissAlert, clearAllAlerts } = useMonitoring();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer (Full screen on mobile, 420px on desktop) */}
      <div className="relative w-full sm:max-w-md bg-white shadow-2xl h-full flex flex-col z-10 border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Pemberitahuan Kesehatan Hewan
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Action ribbon */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-600 font-medium">
            {alerts.filter((a) => !a.acknowledged).length} Pemberitahuan Baru
          </span>
          {alerts.length > 0 && (
            <button
              onClick={clearAllAlerts}
              className="text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Semua</span>
            </button>
          )}
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
              <p className="font-semibold text-slate-700">Kondisi Hewan Normal</p>
              <p className="text-[11px] mt-1 text-slate-400">
                Tidak ada indikasi demam, inaktivitas berlebih, atau baterai lemah.
              </p>
            </div>
          ) : (
            alerts.map((alt) => {
              const isCrit = alt.severity === 'CRITICAL';
              const isWarn = alt.severity === 'WARNING';

              return (
                <div
                  key={alt.id}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    alt.acknowledged
                      ? 'bg-slate-50/70 border-slate-200 opacity-75'
                      : isCrit
                      ? 'bg-rose-50/60 border-rose-200'
                      : isWarn
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-blue-50/60 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      {alt.type === 'LOW_BATTERY' ? (
                        <BatteryWarning className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      ) : alt.type === 'FEVER' || alt.type === 'HYPOTHERMIA' ? (
                        <ThermometerSnowflake className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      ) : alt.type === 'SIGNAL_DEGRADED' ? (
                        <Signal className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {alt.title}
                        </span>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {alt.timestamp} &middot; Alat: {alt.nodeId}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!alt.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alt.id)}
                          title="Tandai Sudah Diperiksa"
                          className="p-1 text-slate-400 hover:text-emerald-700 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => dismissAlert(alt.id)}
                        title="Hapus"
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 text-slate-700 leading-relaxed text-[11px]">
                    {alt.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Friendly Reference Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
          <div className="font-bold text-slate-800">Panduan Batas Normal:</div>
          <div>&middot; Suhu Demam Hewan: &gt; 39.5&deg;C (Normal 38.0–39.2&deg;C)</div>
          <div>&middot; Peringatan Baterai: Sisa &lt; 20%</div>
          <div>&middot; Diam Berlebih: Hewan tidak bergerak &gt; 2 jam</div>
        </div>
      </div>
    </div>
  );
};
