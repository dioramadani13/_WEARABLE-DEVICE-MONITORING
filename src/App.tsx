import React, { useState } from 'react';
import { MonitoringProvider, useMonitoring } from './context/MonitoringContext';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { TelemetryCharts } from './components/TelemetryCharts';
import { DownlinkControlPanel } from './components/DownlinkControlPanel';
import { SkripsiAnalyticsView } from './components/SkripsiAnalyticsView';
import { RecentUplinkTable } from './components/RecentUplinkTable';
import { AssetManagementView } from './components/AssetManagementModal';
import { AlertsDrawer } from './components/AlertsDrawer';
import { AcceptanceCriteriaModal } from './components/AcceptanceCriteriaModal';
import { MenuHubModal } from './components/MenuHubModal';
import { Modal } from './components/Modal';
import {
  Sliders,
  BarChart3,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

type PopupType = 'none' | 'menu' | 'downlink' | 'analytics' | 'logs' | 'assets' | 'testplan' | 'alerts';

const DashboardContent: React.FC = () => {
  const {
    selectedAnimal,
    selectedNode,
    triggerManualUplink,
    telemetry,
  } = useMonitoring();

  const [activePopup, setActivePopup] = useState<PopupType>('none');

  const closePopup = () => setActivePopup('none');

  const latest = telemetry[telemetry.length - 1];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Header Mobile & Desktop */}
      <Header
        onOpenMenu={() => setActivePopup('menu')}
        onOpenAlerts={() => setActivePopup('alerts')}
        onOpenDownlink={() => setActivePopup('downlink')}
        onOpenAnalytics={() => setActivePopup('analytics')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5 space-y-3.5 sm:space-y-4">
        {/* Animal Overview & Menu Shortcuts Ribbon */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
          {/* Animal avatar & info */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
              {selectedAnimal?.name.slice(0, 2).toUpperCase() || 'AN'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {selectedAnimal?.name}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {selectedAnimal?.tagNumber}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono truncate">
                Node: <strong className="text-slate-800">{selectedNode?.id}</strong> &middot;{' '}
                {selectedAnimal?.species}
              </div>
            </div>
          </div>

          {/* Quick Pop-up Launchers (Friendly Names) */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => setActivePopup('downlink')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold cursor-pointer whitespace-nowrap transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Pengaturan Alat</span>
            </button>

            <button
              onClick={() => setActivePopup('analytics')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold cursor-pointer whitespace-nowrap transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Analisis Akurasi</span>
            </button>

            <button
              onClick={() => setActivePopup('logs')}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold cursor-pointer whitespace-nowrap transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Data &amp; Ekspor</span>
            </button>

            <button
              onClick={() => setActivePopup('assets')}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold cursor-pointer whitespace-nowrap transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Hewan &amp; Sensor</span>
            </button>

            <button
              onClick={() => setActivePopup('testplan')}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-semibold cursor-pointer whitespace-nowrap transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Uji Kinerja</span>
            </button>

            <button
              onClick={() => triggerManualUplink()}
              title="Kirim paket uji coba sekarang"
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Clean Metric Cards */}
        <MetricCards />

        {/* Live Charts (Responsive SVG for Mobile & PC) */}
        <TelemetryCharts />

        {/* Compact Live Data Ribbon */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs font-mono">
          <div className="flex items-center gap-2 sm:gap-3 text-slate-600 flex-wrap">
            <span className="font-semibold text-slate-800 font-sans">Data Masuk:</span>
            <span>FCnt #{latest?.fcnt}</span>
            <span className="text-slate-300">&middot;</span>
            <span className="font-bold text-slate-900">{latest?.temperatureC}&deg;C</span>
            <span className="text-slate-300">&middot;</span>
            <span>{latest?.activityClass}</span>
            <span className="text-slate-300 hidden sm:inline">&middot;</span>
            <span className="text-slate-400 truncate max-w-[120px] sm:max-w-xs hidden sm:inline">{latest?.payloadHex}</span>
          </div>

          <button
            onClick={() => setActivePopup('logs')}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            <span>Riwayat &amp; Unduh CSV</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </main>

      {/* POP-UP 1: Menu Hub Modal */}
      <MenuHubModal
        isOpen={activePopup === 'menu'}
        onClose={closePopup}
        onSelectMenu={(menu) => setActivePopup(menu)}
      />

      {/* POP-UP 2: Pengaturan Alat Nirkabel (Downlink) */}
      <Modal
        isOpen={activePopup === 'downlink'}
        onClose={closePopup}
        title="Pengaturan Alat Nirkabel"
        subtitle="Atur seberapa sering alat membaca sensor, mengirim data, dan mode hemat baterai"
        maxWidth="lg"
      >
        <DownlinkControlPanel />
      </Modal>

      {/* POP-UP 3: Analisis Akurasi & Daya */}
      <Modal
        isOpen={activePopup === 'analytics'}
        onClose={closePopup}
        title="Analisis Penghematan Daya &amp; Akurasi Suhu"
        subtitle="Kalkulasi otomatis perbandingan baterai dan galat akurasi sensor (MAE &amp; RMSE)"
        maxWidth="3xl"
      >
        <SkripsiAnalyticsView />
      </Modal>

      {/* POP-UP 4: Riwayat Data & Unduh File */}
      <Modal
        isOpen={activePopup === 'logs'}
        onClose={closePopup}
        title="Riwayat Data Sensor Masuk &amp; Ekspor"
        subtitle="Daftar rekaman data terkirim dari alat, dapat diunduh ke format Excel atau CSV"
        maxWidth="4xl"
      >
        <RecentUplinkTable />
      </Modal>

      {/* POP-UP 5: Data Hewan & Alat Sensor */}
      <Modal
        isOpen={activePopup === 'assets'}
        onClose={closePopup}
        title="Data Hewan Ternak &amp; Perangkat Sensor"
        subtitle="Kelola identitas hewan dan pemetaan perangkat keras wearable STM32WL"
        maxWidth="3xl"
      >
        <AssetManagementView />
      </Modal>

      {/* POP-UP 6: Uji Kinerja Sistem */}
      <AcceptanceCriteriaModal
        isOpen={activePopup === 'testplan'}
        onClose={closePopup}
      />

      {/* POP-UP 7: Pemberitahuan Kesehatan Hewan */}
      <AlertsDrawer
        isOpen={activePopup === 'alerts'}
        onClose={closePopup}
      />

      {/* Minimal Footer */}
      <footer className="py-3 sm:py-4 text-center text-[11px] sm:text-xs text-slate-400 font-mono">
        Sistem IoT Monitoring Wearable Hewan &middot; STM32WL LoRa Sub-GHz
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <MonitoringProvider>
      <DashboardContent />
    </MonitoringProvider>
  );
}
