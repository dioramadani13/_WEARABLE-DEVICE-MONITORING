import React from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { Thermometer, Activity, Battery, Cpu } from 'lucide-react';
import { formatDurationHours } from '../utils/powerMath';

export const MetricCards: React.FC = () => {
  const { latestTelemetry, selectedNode, powerStats } = useMonitoring();

  const temp = latestTelemetry?.temperatureC ?? 38.45;
  const accelX = latestTelemetry?.accelX ?? 0.04;
  const accelY = latestTelemetry?.accelY ?? 0.11;
  const accelZ = latestTelemetry?.accelZ ?? 0.98;
  const activityClass = latestTelemetry?.activityClass ?? 'DIAM';
  const mcuState = latestTelemetry?.mcuState ?? selectedNode?.mcuState ?? 'LOW_POWER_SLEEP';
  const powerMode = selectedNode?.powerMode ?? 'STOP2';
  const batteryPercent = selectedNode?.batteryPercent ?? 84;
  const batteryVoltage = selectedNode?.batteryVoltage ?? 3.92;
  const currentUa = selectedNode?.currentMicroAmps ?? 18.5;

  let tempStatus = 'Normal';
  let tempColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (temp > 39.5) {
    tempStatus = 'Demam Tinggi';
    tempColor = 'text-rose-700 bg-rose-50 border-rose-200';
  } else if (temp < 36.0) {
    tempStatus = 'Hipotermia';
    tempColor = 'text-rose-700 bg-rose-50 border-rose-200';
  } else if (temp >= 39.2 || temp <= 37.0) {
    tempStatus = 'Waspada';
    tempColor = 'text-amber-700 bg-amber-50 border-amber-200';
  }

  const accelMag = Math.sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ).toFixed(2);

  // Friendly power mode label
  const modeFriendly =
    powerMode === 'STOP2'
      ? 'Hemat Maksimal'
      : powerMode === 'SLEEP'
      ? 'Hemat Standar'
      : powerMode === 'RUN'
      ? 'Mode Aktif'
      : 'Siaga Ekstrem';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
      {/* 1. Suhu Tubuh */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium truncate">Suhu Tubuh</span>
          <Thermometer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-3xl font-bold font-mono text-slate-900">
              {temp.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-500 font-mono">&deg;C</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${tempColor}`}>
              {tempStatus}
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">38-39.2&deg;C</span>
          </div>
        </div>
      </div>

      {/* 2. Gerakan & Aktivitas */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium truncate">Perilaku Hewan</span>
          <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
        </div>
        <div>
          <div className="text-lg sm:text-2xl font-bold font-mono text-slate-900 truncate">
            {activityClass}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
            <span>|a|: {accelMag}g</span>
            <span className="text-slate-300">&middot;</span>
            <span className="text-slate-600">Z: {accelZ.toFixed(2)}g</span>
          </div>
        </div>
      </div>

      {/* 3. Baterai & Daya */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium truncate">Sisa Baterai</span>
          <Battery className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-bold font-mono text-slate-900">
              {batteryPercent}%
            </span>
            <span className="text-xs font-mono text-slate-500 font-medium">
              ({batteryVoltage.toFixed(2)}V)
            </span>
          </div>
          <div className="mt-1 text-[11px] font-mono text-emerald-700 font-semibold truncate">
            &asymp; {formatDurationHours(powerStats.optimizedBatteryHours)}
          </div>
        </div>
      </div>

      {/* 4. Mode Alat */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium truncate">Mode Baterai Alat</span>
          <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
        </div>
        <div>
          <div className="text-base sm:text-xl font-bold font-mono text-slate-900 truncate">
            {modeFriendly}
          </div>
          <div className="mt-1 text-[11px] font-mono flex items-center gap-1 truncate">
            <span className={mcuState === 'ACTIVE_TX' ? 'text-amber-600 font-bold' : 'text-blue-600 font-medium'}>
              {mcuState === 'ACTIVE_TX' ? 'Kirim Data' : 'Tertidur (Sleep)'}
            </span>
            <span className="text-slate-300">&middot;</span>
            <span className="text-slate-500 font-mono">TX {selectedNode?.txIntervalSec}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
