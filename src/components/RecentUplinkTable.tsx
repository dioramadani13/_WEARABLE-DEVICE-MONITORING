import React, { useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { Download, Search, Filter } from 'lucide-react';

export const RecentUplinkTable: React.FC = () => {
  const { telemetry, selectedAnimal, selectedNode } = useMonitoring();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activityFilter, setActivityFilter] = useState<string>('ALL');

  const filteredPackets = telemetry.filter((pkt) => {
    const matchesSearch =
      pkt.payloadHex.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkt.fcnt.toString().includes(searchTerm) ||
      pkt.activityClass.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActivity = activityFilter === 'ALL' || pkt.activityClass === activityFilter;
    return matchesSearch && matchesActivity;
  });

  const handleExportCsv = () => {
    const headers = [
      'Timestamp',
      'Frame_Counter',
      'Node_ID',
      'Animal_Name',
      'Temperature_C',
      'Accel_X_g',
      'Accel_Y_g',
      'Accel_Z_g',
      'Activity_Class',
      'Battery_Voltage_V',
      'Battery_Percent',
      'Current_uA',
      'MCU_Mode',
      'LoRa_RSSI_dBm',
      'LoRa_SNR_dB',
      'Hex_Payload',
    ];

    const rows = filteredPackets.map((p) => [
      p.timestamp,
      p.fcnt,
      p.nodeId,
      `"${selectedAnimal?.name || 'Hewan'}"`,
      p.temperatureC,
      p.accelX,
      p.accelY,
      p.accelZ,
      p.activityClass,
      p.batteryVoltage,
      p.batteryPercent,
      p.currentMicroAmps,
      p.powerMode,
      p.rssiDbm,
      p.snrDb,
      p.payloadHex,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `lora_telemetri_${selectedNode?.id || 'node'}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      {/* Search & Export toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari fcnt / hex..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg w-36 sm:w-48 bg-white"
            />
          </div>

          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700"
          >
            <option value="ALL">Semua</option>
            <option value="DIAM">DIAM</option>
            <option value="BERJALAN">BERJALAN</option>
            <option value="BERLARI">BERLARI</option>
          </select>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-xs font-semibold cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 font-medium text-[11px] border-b border-slate-200 sticky top-0">
              <tr>
                <th className="py-2 px-3">FCnt</th>
                <th className="py-2 px-3">Waktu</th>
                <th className="py-2 px-3">Suhu</th>
                <th className="py-2 px-3">Akselerasi</th>
                <th className="py-2 px-3">Aktivitas</th>
                <th className="py-2 px-3">Baterai</th>
                <th className="py-2 px-3 text-right">Payload Hex</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredPackets.slice().reverse().map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="py-1.5 px-3 font-bold text-slate-600">{p.fcnt}</td>
                  <td className="py-1.5 px-3 text-slate-500">
                    {new Date(p.timestamp).toLocaleTimeString()}
                  </td>
                  <td className={`py-1.5 px-3 font-semibold ${p.temperatureC > 39.5 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {p.temperatureC.toFixed(2)}&deg;C
                  </td>
                  <td className="py-1.5 px-3 text-slate-600">
                    {p.accelX},{p.accelY},{p.accelZ}g
                  </td>
                  <td className="py-1.5 px-3 font-sans">
                    <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {p.activityClass}
                    </span>
                  </td>
                  <td className="py-1.5 px-3 text-slate-700">
                    {p.batteryPercent}% ({p.batteryVoltage}V)
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-400 text-[10px]">
                    {p.payloadHex}
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
