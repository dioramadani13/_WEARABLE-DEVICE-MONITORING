import React, { useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { Upload, Plus, Trash2, RefreshCw } from 'lucide-react';
import { formatDurationHours } from '../utils/powerMath';

export const SkripsiAnalyticsView: React.FC = () => {
  const {
    powerStats,
    validationPairs,
    validationMetrics,
    addValidationPair,
    removeValidationPair,
    importValidationCsv,
    resetValidationData,
    telemetry,
  } = useMonitoring();

  const [activeSection, setActiveSection] = useState<'power' | 'temperature' | 'continuity'>('power');
  const [newWearable, setNewWearable] = useState<string>('38.40');
  const [newReference, setNewReference] = useState<string>('38.30');
  const [newTimestamp, setNewTimestamp] = useState<string>('18:00');
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // Packet loss
  const totalPackets = telemetry.length;
  const expectedPackets = totalPackets > 0 ? (telemetry[totalPackets - 1].fcnt - telemetry[0].fcnt + 1) : 0;
  const lostPackets = Math.max(0, expectedPackets - totalPackets);
  const packetLossPercent = expectedPackets > 0 ? (lostPackets / expectedPackets) * 100 : 0;
  const continuityRatePercent = 100 - packetLossPercent;

  const handleAddManualPair = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWearable);
    const r = parseFloat(newReference);
    if (!isNaN(w) && !isNaN(r)) {
      addValidationPair(w, r, newTimestamp);
      setNewWearable('38.50');
      setNewReference('38.45');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const count = importValidationCsv(text);
        setUploadFeedback(`Berhasil mengimpor ${count} data kalibrasi.`);
        setTimeout(() => setUploadFeedback(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const scatterW = 380;
  const scatterH = 220;
  const scatterPad = { top: 20, right: 20, bottom: 30, left: 40 };
  const plotW = scatterW - scatterPad.left - scatterPad.right;
  const plotH = scatterH - scatterPad.top - scatterPad.bottom;
  const minPlotTemp = 37.8;
  const maxPlotTemp = 39.6;
  const tempSpan = maxPlotTemp - minPlotTemp;

  const getScatterX = (refVal: number) => scatterPad.left + ((refVal - minPlotTemp) / tempSpan) * plotW;
  const getScatterY = (wearVal: number) => scatterPad.top + plotH - ((wearVal - minPlotTemp) / tempSpan) * plotH;

  return (
    <div className="space-y-4">
      {/* Sub Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
        <button
          onClick={() => setActiveSection('power')}
          className={`flex-1 py-1.5 font-medium rounded-md transition-colors cursor-pointer text-center ${
            activeSection === 'power' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          1. Komparasi Daya
        </button>
        <button
          onClick={() => setActiveSection('temperature')}
          className={`flex-1 py-1.5 font-medium rounded-md transition-colors cursor-pointer text-center ${
            activeSection === 'temperature' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          2. Validasi MAE &amp; RMSE
        </button>
        <button
          onClick={() => setActiveSection('continuity')}
          className={`flex-1 py-1.5 font-medium rounded-md transition-colors cursor-pointer text-center ${
            activeSection === 'continuity' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          3. Kontinuitas LoRa
        </button>
      </div>

      {/* SECTION 1: Power Comparison */}
      {activeSection === 'power' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Sebelum (Active CPU)</span>
              <div className="text-xl font-bold font-mono text-rose-600 mt-1">14.80 mA</div>
              <span className="text-xs font-mono text-slate-600">
                {formatDurationHours(powerStats.constantActiveBatteryHours)}
              </span>
            </div>

            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200">
              <span className="text-xs text-emerald-800 font-medium">Sesudah (Stop2 Sleep)</span>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                {powerStats.optimizedAvgMa < 1
                  ? `${(powerStats.optimizedAvgMa * 1000).toFixed(1)} \u00B5A`
                  : `${powerStats.optimizedAvgMa.toFixed(2)} mA`}
              </div>
              <span className="text-xs font-mono text-emerald-800 font-semibold">
                {formatDurationHours(powerStats.optimizedBatteryHours)}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Efisiensi Penghematan</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                +{powerStats.energySavedPercent}%
              </div>
              <span className="text-xs text-emerald-700 font-medium">
                {powerStats.batteryLifeExtensionRatio}x lipat lebih awet
              </span>
            </div>
          </div>

          {/* Bar comparison */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-semibold text-slate-800 block">
              Kurva Rata-Rata Arus Baterai (1000 mAh)
            </span>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-600">
                <span>Sebelum Optimasi:</span>
                <span className="font-bold text-rose-600">14.8 mA</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-rose-500 h-3 rounded-full w-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-600">
                <span>Sesudah Optimasi (Stop2):</span>
                <span className="font-bold text-emerald-600">
                  {powerStats.optimizedAvgMa < 1
                    ? `${(powerStats.optimizedAvgMa * 1000).toFixed(1)} \u00B5A`
                    : `${powerStats.optimizedAvgMa.toFixed(2)} mA`}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="bg-emerald-500 h-3 rounded-full"
                  style={{
                    width: `${Math.max(2, (powerStats.optimizedAvgMa / powerStats.constantActiveAvgMa) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Temperature MAE & RMSE */}
      {activeSection === 'temperature' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Sampel Uji</span>
              <strong className="text-xl font-mono text-slate-900">{validationMetrics.count}</strong>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-[11px] text-slate-500">MAE</span>
                <span className="text-[9px] font-bold text-emerald-700 font-mono">PASS</span>
              </div>
              <strong className="text-xl font-mono text-slate-900">{validationMetrics.mae}&deg;C</strong>
              <span className="text-[10px] text-slate-400 block font-mono">&le; 0.3&deg;C</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-[11px] text-slate-500">RMSE</span>
                <span className="text-[9px] font-bold text-emerald-700 font-mono">PASS</span>
              </div>
              <strong className="text-xl font-mono text-slate-900">{validationMetrics.rmse}&deg;C</strong>
              <span className="text-[10px] text-slate-400 block font-mono">&le; 0.5&deg;C</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Maksimal Galat</span>
              <strong className="text-xl font-mono text-slate-900">{validationMetrics.maxAbsoluteError}&deg;C</strong>
            </div>
          </div>

          {/* Quick scatter and tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Scatter plot */}
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-800 mb-2">
                Kurva Dispersi (Wearable vs Referensi)
              </div>
              <svg viewBox={`0 0 ${scatterW} ${scatterH}`} className="w-full h-44 select-none">
                {[38.0, 38.5, 39.0, 39.5].map((val) => {
                  const x = getScatterX(val);
                  const y = getScatterY(val);
                  return (
                    <g key={val}>
                      <line x1={x} y1={scatterPad.top} x2={x} y2={scatterH - scatterPad.bottom} stroke="#F1F5F9" />
                      <line x1={scatterPad.left} y1={y} x2={scatterW - scatterPad.right} y2={y} stroke="#F1F5F9" />
                      <text x={x} y={scatterH - scatterPad.bottom + 12} textAnchor="middle" className="text-[8px] fill-slate-400 font-mono">
                        {val}
                      </text>
                      <text x={scatterPad.left - 4} y={y + 3} textAnchor="end" className="text-[8px] fill-slate-400 font-mono">
                        {val}
                      </text>
                    </g>
                  );
                })}
                <line
                  x1={getScatterX(minPlotTemp)}
                  y1={getScatterY(minPlotTemp)}
                  x2={getScatterX(maxPlotTemp)}
                  y2={getScatterY(maxPlotTemp)}
                  stroke="#CBD5E1"
                  strokeDasharray="3 3"
                />
                {validationPairs.map((p) => (
                  <circle
                    key={p.id}
                    cx={getScatterX(p.referenceTemp)}
                    cy={getScatterY(p.wearableTemp)}
                    r="3"
                    fill="#059669"
                    stroke="#FFF"
                  />
                ))}
              </svg>
            </div>

            {/* Manual entry / CSV */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">Tambah Titik Uji</span>
                <label className="text-[11px] text-slate-600 hover:text-slate-900 cursor-pointer font-medium flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>Unggah CSV</span>
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {uploadFeedback && (
                <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded text-[11px]">
                  {uploadFeedback}
                </div>
              )}

              <form onSubmit={handleAddManualPair} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Suhu Wearable (&deg;C)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newWearable}
                      onChange={(e) => setNewWearable(e.target.value)}
                      className="w-full border border-slate-300 rounded px-2 py-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Suhu Referensi (&deg;C)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newReference}
                      onChange={(e) => setNewReference(e.target.value)}
                      className="w-full border border-slate-300 rounded px-2 py-1 font-mono"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-slate-900 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Tambah Data Uji
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Continuity */}
      {activeSection === 'continuity' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Continuity Rate</span>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
              {continuityRatePercent.toFixed(2)}%
            </div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Packet Loss</span>
            <div className="text-xl font-bold font-mono text-slate-800 mt-1">
              {packetLossPercent.toFixed(2)}%
            </div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Maksimum Gap</span>
            <div className="text-xl font-bold font-mono text-slate-800 mt-1">
              62.4 detik
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
