import React from 'react';
import { Modal } from './Modal';
import {
  Sliders,
  BarChart3,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface MenuHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMenu: (menu: 'downlink' | 'analytics' | 'logs' | 'assets' | 'testplan') => void;
}

export const MenuHubModal: React.FC<MenuHubModalProps> = ({
  isOpen,
  onClose,
  onSelectMenu,
}) => {
  const menuItems = [
    {
      id: 'downlink' as const,
      title: 'Pengaturan Alat Nirkabel',
      desc: 'Atur jadwal pembacaan sensor, frekuensi kirim data, dan mode hemat baterai alat.',
      icon: Sliders,
      badge: 'Kontrol Jarak Jauh',
    },
    {
      id: 'analytics' as const,
      title: 'Analisis Daya & Akurasi Suhu',
      desc: 'Bandingkan penghematan baterai dan hitung galat akurasi sensor (MAE & RMSE).',
      icon: BarChart3,
      badge: 'Analisis Riset',
    },
    {
      id: 'logs' as const,
      title: 'Riwayat Data & Unduh Excel/CSV',
      desc: 'Lihat seluruh log data sensor masuk dan unduh ke format file Excel atau CSV.',
      icon: FileSpreadsheet,
      badge: 'Ekspor Data',
    },
    {
      id: 'assets' as const,
      title: 'Data Hewan & Alat Sensor',
      desc: 'Kelola informasi identitas hewan ternak dan pairing dengan alat wearable STM32WL.',
      icon: Layers,
      badge: 'Profil & Perangkat',
    },
    {
      id: 'testplan' as const,
      title: 'Uji Kinerja & Standar Sistem',
      desc: 'Simulasikan pengujian latensi data, respon pengaturan, dan kelayakan sistem.',
      icon: CheckCircle2,
      badge: 'Pengujian Sistem',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pilih Menu Aplikasi"
      subtitle="Pilih fitur yang ingin dibuka dalam jendela pop-up"
      maxWidth="xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectMenu(item.id);
                onClose();
              }}
              className="text-left p-3.5 sm:p-4 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center text-slate-700 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800 group-hover:text-slate-900">
                <span>Buka Menu Ini</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};
