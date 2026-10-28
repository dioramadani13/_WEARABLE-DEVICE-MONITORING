import React, { useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { PowerMode } from '../types';
import { Send, CheckCircle2, AlertCircle, Clock, Zap, HelpCircle } from 'lucide-react';
import { calculatePowerStats, formatDurationHours } from '../utils/powerMath';

export const DownlinkControlPanel: React.FC = () => {
  const { selectedNode, sendDownlink, downlinks } = useMonitoring();

  // Sampling state
  const [samplingSeconds, setSamplingSeconds] = useState<number>(selectedNode?.samplingIntervalSec || 10);
  const [samplingUnit, setSamplingUnit] = useState<'sec' | 'min'>('sec');

  // TX state
  const [txSeconds, setTxSeconds] = useState<number>(selectedNode?.txIntervalSec || 60);
  const [txUnit, setTxUnit] = useState<'sec' | 'min'>('sec');

  // Mode state
  const [modeInput, setModeInput] = useState<PowerMode>(selectedNode?.powerMode || 'STOP2');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  React.useEffect(() => {
    if (selectedNode) {
      setSamplingSeconds(selectedNode.samplingIntervalSec);
      setTxSeconds(selectedNode.txIntervalSec);
      setModeInput(selectedNode.powerMode);
    }
  }, [selectedNode]);

  // Projected impact
  const projectedStats = calculatePowerStats(
    samplingSeconds,
    txSeconds,
    modeInput,
    selectedNode?.batteryCapacityMah || 1000
  );

  const handleApplySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (samplingSeconds < 1) {
      setFeedbackMsg({ text: 'Interval sensor minimal 1 detik.', type: 'error' });
      return;
    }
    if (txSeconds < samplingSeconds) {
      setFeedbackMsg({
        text: 'Jadwal kirim data sebaiknya sama atau lebih besar dari interval baca sensor.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      if (samplingSeconds !== selectedNode?.samplingIntervalSec) {
        await sendDownlink('SET_SAMPLING_INTERVAL', samplingSeconds);
      }
      if (txSeconds !== selectedNode?.txIntervalSec) {
        await sendDownlink('SET_TX_INTERVAL', txSeconds);
      }
      if (modeInput !== selectedNode?.powerMode) {
        await sendDownlink('SWITCH_POWER_MODE', modeInput);
      }

      setFeedbackMsg({
        text: 'Pengaturan berhasil dikirimkan ke alat sensor!',
        type: 'success',
      });
    } catch {
      setFeedbackMsg({
        text: 'Gagal mengirim pengaturan ke alat. Periksa koneksi gateway.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  return (
    <div className="space-y-5">
      {/* Target Node Info */}
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600">Alat Target:</span>
          <strong className="text-slate-900 font-mono">{selectedNode?.id}</strong>
        </div>
        <span className="text-slate-500 font-mono text-[11px]">
          Baterai: {selectedNode?.batteryPercent}% ({selectedNode?.batteryVoltage}V)
        </span>
      </div>

      <form onSubmit={handleApplySettings} className="space-y-4">
        {/* PENGATURAN 1: INTERVAL SENSOR (FLEKSIBEL) */}
        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <label className="text-xs sm:text-sm font-bold text-slate-900">
              1. Frekuensi Alat Membaca Sensor
            </label>
            <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {samplingSeconds >= 60
                ? `${(samplingSeconds / 60).toFixed(1)} menit (${samplingSeconds} detik)`
                : `${samplingSeconds} detik`}
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            Ketik waktu bebas atau geser slider. Seberapa sering alat mengukur suhu &amp; gerakan hewan.
          </p>

          {/* Flexible Input & Unit Selector */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min="1"
                max="86400"
                value={samplingUnit === 'min' ? Math.round(samplingSeconds / 60) : samplingSeconds}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  setSamplingSeconds(samplingUnit === 'min' ? val * 60 : val);
                }}
                className="w-full text-sm font-mono font-bold border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Ketik angka bebas..."
              />
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setSamplingUnit('sec')}
                className={`px-3 py-1.5 font-medium rounded-md cursor-pointer transition-colors ${
                  samplingUnit === 'sec'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Detik
              </button>
              <button
                type="button"
                onClick={() => setSamplingUnit('min')}
                className={`px-3 py-1.5 font-medium rounded-md cursor-pointer transition-colors ${
                  samplingUnit === 'min'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Menit
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 mr-1">Pilihan Cepat:</span>
            {[
              { label: '1 dtk', val: 1 },
              { label: '5 dtk', val: 5 },
              { label: '10 dtk', val: 10 },
              { label: '30 dtk', val: 30 },
              { label: '1 mnt', val: 60 },
              { label: '5 mnt', val: 300 },
              { label: '15 mnt', val: 900 },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => setSamplingSeconds(p.val)}
                className={`text-[11px] font-mono px-2 py-1 rounded-md border cursor-pointer transition-colors ${
                  samplingSeconds === p.val
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Slider */}
          <input
            type="range"
            min="1"
            max="300"
            value={Math.min(300, samplingSeconds)}
            onChange={(e) => setSamplingSeconds(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
          />
        </div>

        {/* PENGATURAN 2: JADWAL TRANSMISI LORA (FLEKSIBEL) */}
        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <label className="text-xs sm:text-sm font-bold text-slate-900">
              2. Jadwal Kirim Data ke Dashboard
            </label>
            <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {txSeconds >= 60
                ? `${(txSeconds / 60).toFixed(1)} menit (${txSeconds} detik)`
                : `${txSeconds} detik`}
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            Seberapa sering alat memancarkan sinyal radio LoRa untuk mengirim data terkumpul ke web.
          </p>

          {/* Flexible Input & Unit Selector */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min="5"
                max="86400"
                value={txUnit === 'min' ? Math.round(txSeconds / 60) : txSeconds}
                onChange={(e) => {
                  const val = Math.max(5, parseInt(e.target.value) || 5);
                  setTxSeconds(txUnit === 'min' ? val * 60 : val);
                }}
                className="w-full text-sm font-mono font-bold border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Ketik angka bebas..."
              />
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setTxUnit('sec')}
                className={`px-3 py-1.5 font-medium rounded-md cursor-pointer transition-colors ${
                  txUnit === 'sec'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Detik
              </button>
              <button
                type="button"
                onClick={() => setTxUnit('min')}
                className={`px-3 py-1.5 font-medium rounded-md cursor-pointer transition-colors ${
                  txUnit === 'min'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Menit
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 mr-1">Pilihan Cepat:</span>
            {[
              { label: '10 dtk', val: 10 },
              { label: '30 dtk', val: 30 },
              { label: '1 mnt', val: 60 },
              { label: '5 mnt', val: 300 },
              { label: '10 mnt', val: 600 },
              { label: '30 mnt', val: 1800 },
              { label: '1 jam', val: 3600 },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => setTxSeconds(p.val)}
                className={`text-[11px] font-mono px-2 py-1 rounded-md border cursor-pointer transition-colors ${
                  txSeconds === p.val
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Slider */}
          <input
            type="range"
            min="10"
            max="600"
            step="10"
            value={Math.min(600, txSeconds)}
            onChange={(e) => setTxSeconds(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
          />
        </div>

        {/* PENGATURAN 3: MODE HEMAT DAYA */}
        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-slate-200 space-y-2">
          <label htmlFor="friendly-power-mode" className="text-xs sm:text-sm font-bold text-slate-900 block">
            3. Mode Hemat Baterai Alat
          </label>
          <select
            id="friendly-power-mode"
            value={modeInput}
            onChange={(e) => setModeInput(e.target.value as PowerMode)}
            className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="STOP2">Hemat Daya Maksimal / Stop2 (Paling Awet: ~18.5 µA) - Rekomendasi</option>
            <option value="SLEEP">Hemat Daya Standar / Sleep Mode (~1.2 mA)</option>
            <option value="RUN">Mode Selalu Aktif / Run Mode (Tanpa Tidur, Cepat Habis)</option>
            <option value="STANDBY">Mode Siaga Ekstrem / Standby (~1.2 µA)</option>
          </select>
          <p className="text-[11px] text-slate-500">
            Mode hemat daya mengatur mikrokontroler STM32WL tertidur pulas saat tidak ada pengukuran.
          </p>
        </div>

        {/* Prediksi Dampak Baterai */}
        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Estimasi Masa Pakai Baterai:</span>
          </div>
          <div className="font-mono font-bold text-emerald-800 text-sm">
            {formatDurationHours(projectedStats.optimizedBatteryHours)} ({projectedStats.optimizedAvgMa < 1 ? `${(projectedStats.optimizedAvgMa * 1000).toFixed(1)} µA` : `${projectedStats.optimizedAvgMa.toFixed(2)} mA`} rata-rata)
          </div>
        </div>

        {/* Feedback message */}
        {feedbackMsg && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Mengirim ke Alat...' : 'Kirim Pengaturan ke Alat Sekarang'}</span>
        </button>
      </form>

      {/* Riwayat Pengiriman Terakhir */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
          <span>Riwayat Pengaturan Terakhir</span>
          <Clock className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2 px-2.5">Waktu</th>
                <th className="py-2 px-2.5">Pengaturan</th>
                <th className="py-2 px-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {downlinks.slice(0, 4).map((cmd) => (
                <tr key={cmd.id}>
                  <td className="py-2 px-2.5 text-slate-500">{cmd.timestamp}</td>
                  <td className="py-2 px-2.5 text-slate-800 font-sans font-medium">
                    {cmd.paramSummary
                      .replace('Sampling:', 'Ukur:')
                      .replace('Mode:', 'Mode Baterai:')}
                  </td>
                  <td className="py-2 px-2.5 text-right font-sans">
                    {cmd.status === 'ACKED' ? (
                      <span className="text-emerald-700 font-semibold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                        Diterima Alat
                      </span>
                    ) : (
                      <span className="text-slate-500">Terkirim</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
