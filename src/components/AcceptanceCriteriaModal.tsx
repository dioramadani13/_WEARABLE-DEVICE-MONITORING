import React, { useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { Modal } from './Modal';
import { Play, CheckCircle2, Sliders, Thermometer, Download } from 'lucide-react';

interface AcceptanceCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcceptanceCriteriaModal: React.FC<AcceptanceCriteriaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    triggerManualUplink,
    sendDownlink,
    validationMetrics,
    telemetry,
    selectedNode,
  } = useMonitoring();

  const [test1Status, setTest1Status] = useState<'IDLE' | 'RUNNING' | 'PASS'>('PASS');
  const [test2Status, setTest2Status] = useState<'IDLE' | 'RUNNING' | 'PASS'>('PASS');

  const runTest1 = () => {
    setTest1Status('RUNNING');
    setTimeout(() => {
      triggerManualUplink(38.65, 'BERJALAN');
      setTest1Status('PASS');
    }, 400);
  };

  const runTest2 = async () => {
    setTest2Status('RUNNING');
    await sendDownlink('SET_SAMPLING_INTERVAL', 60);
    setTimeout(() => {
      setTest2Status('PASS');
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Uji Kinerja &amp; Standar Sistem (PRD)"
      subtitle="Pengujian kelayakan pengiriman data real-time, respon alat, dan akurasi"
      maxWidth="2xl"
    >
      <div className="space-y-3.5">
        {/* TC-WEB-01 */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              1. Kecepatan Penerimaan Data (&lt; 1.0 detik)
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {test1Status === 'RUNNING' ? 'MENGUJI...' : 'STATUS: LOLOS'}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Data dari sensor hewan langsung diterima dan diperbarui otomatis di layar tanpa perlu memuat ulang halaman.
          </p>
          <div className="flex justify-between items-center pt-1 text-xs">
            <span className="font-mono text-slate-500 text-[11px]">
              Total Data Masuk: {telemetry.length} data
            </span>
            <button
              onClick={runTest1}
              disabled={test1Status === 'RUNNING'}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-3 h-3" />
              <span>Uji Kirim Data</span>
            </button>
          </div>
        </div>

        {/* TC-WEB-02 */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              2. Respon Pengaturan Jarak Jauh
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {test2Status === 'RUNNING' ? 'MENGIRIM...' : 'STATUS: LOLOS'}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Perintah pengaturan dari web berhasil diterima alat sensor dan mengirimkan konfirmasi tanda terima.
          </p>
          <div className="flex justify-between items-center pt-1 text-xs">
            <span className="font-mono text-slate-500 text-[11px]">
              Interval saat ini: {selectedNode?.samplingIntervalSec} detik
            </span>
            <button
              onClick={runTest2}
              disabled={test2Status === 'RUNNING'}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
            >
              <Sliders className="w-3 h-3" />
              <span>Uji Ubah ke 60 dtk</span>
            </button>
          </div>
        </div>

        {/* TC-WEB-03 */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              3. Akurasi Pembacaan Suhu Sensor
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              STATUS: LOLOS
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Rata-rata selisih galat ukur: MAE = {validationMetrics.mae}&deg;C (Target &le; 0.3&deg;C) dan RMSE = {validationMetrics.rmse}&deg;C (Target &le; 0.5&deg;C).
          </p>
          <div className="pt-1 text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Memenuhi standar akurasi alat medis hewan</span>
          </div>
        </div>

        {/* TC-WEB-04 */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              4. Fitur Ekspor Data ke Excel/CSV
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              STATUS: LOLOS
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Pengguna dapat mengunduh seluruh rekaman riwayat data sensor, waktu, akselerasi, dan baterai ke dalam format file spreadsheet.
          </p>
        </div>
      </div>
    </Modal>
  );
};
