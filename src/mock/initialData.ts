import { AnimalProfile, WearableNode, TelemetryPacket, DownlinkCommand, AlertItem, TemperatureValidationPair } from '../types';

export const INITIAL_ANIMALS: AnimalProfile[] = [
  {
    id: 'ANM-001',
    name: 'Bima (Sapi Perah #01)',
    species: 'Sapi Perah (Friesian Holstein)',
    tagNumber: 'EAR-TAG-FH-8821',
    ageYears: 3.5,
    weightKg: 545,
    medicalNotes: 'Kondisi laktasi periode ke-2. Nafsu makan prima, siklus estrus terpantau stabil.',
    assignedNodeId: 'NODE-WL-01',
  },
  {
    id: 'ANM-002',
    name: 'Citra (Sapi Perah #02)',
    species: 'Sapi Perah (Friesian Holstein)',
    tagNumber: 'EAR-TAG-FH-8822',
    ageYears: 4.2,
    weightKg: 520,
    medicalNotes: 'Riwayat mastitis ringan bulan lalu, dalam masa pemantauan suhu intensif.',
    assignedNodeId: 'NODE-WL-02',
  },
  {
    id: 'ANM-003',
    name: 'Baron (Domba Garut)',
    species: 'Domba Garut Unggul',
    tagNumber: 'EAR-TAG-DG-1044',
    ageYears: 2.1,
    weightKg: 78,
    medicalNotes: 'Aktivitas fisik tinggi, pejantan bibit unggul.',
    assignedNodeId: 'NODE-WL-03',
  },
  {
    id: 'ANM-004',
    name: 'Srikandi (Kambing Boer)',
    species: 'Kambing Boer Betina',
    tagNumber: 'EAR-TAG-KB-3309',
    ageYears: 1.8,
    weightKg: 62,
    medicalNotes: 'Dalam observasi post-vaksinasi antraks.',
    assignedNodeId: 'NODE-WL-04',
  },
];

export const INITIAL_NODES: WearableNode[] = [
  {
    id: 'NODE-WL-01',
    devEui: '70B3D57ED005C8A1',
    appKey: '2B7E151628AED2A6ABF7158809CF4F3C',
    firmwareVersion: 'v2.4.1-STM32WL55-Stop2',
    calibrationDate: '2026-10-15',
    batteryCapacityMah: 1000,
    batteryVoltage: 3.92,
    batteryPercent: 84,
    currentMicroAmps: 18.5,
    powerMode: 'STOP2',
    mcuState: 'LOW_POWER_SLEEP',
    samplingIntervalSec: 10,
    txIntervalSec: 60,
    lastUplinkTimestamp: new Date(Date.now() - 15000).toISOString(),
    rssiDbm: -85,
    snrDb: 9.5,
    status: 'ONLINE',
    assignedAnimalId: 'ANM-001',
  },
  {
    id: 'NODE-WL-02',
    devEui: '70B3D57ED005C8A2',
    appKey: '5B8E291728AFD3B7BCF8269910DF5E4D',
    firmwareVersion: 'v2.4.1-STM32WL55-Stop2',
    calibrationDate: '2026-10-16',
    batteryCapacityMah: 1000,
    batteryVoltage: 4.05,
    batteryPercent: 92,
    currentMicroAmps: 18.5,
    powerMode: 'STOP2',
    mcuState: 'LOW_POWER_SLEEP',
    samplingIntervalSec: 30,
    txIntervalSec: 120,
    lastUplinkTimestamp: new Date(Date.now() - 45000).toISOString(),
    rssiDbm: -92,
    snrDb: 7.8,
    status: 'ONLINE',
    assignedAnimalId: 'ANM-002',
  },
  {
    id: 'NODE-WL-03',
    devEui: '70B3D57ED005C8A3',
    appKey: '9A7D141527AEC1A5AAE6147708BE3F2B',
    firmwareVersion: 'v2.3.9-STM32WL55-Run',
    calibrationDate: '2026-10-10',
    batteryCapacityMah: 1000,
    batteryVoltage: 3.76,
    batteryPercent: 62,
    currentMicroAmps: 6500,
    powerMode: 'RUN',
    mcuState: 'SAMPLING',
    samplingIntervalSec: 5,
    txIntervalSec: 30,
    lastUplinkTimestamp: new Date(Date.now() - 8000).toISOString(),
    rssiDbm: -102,
    snrDb: 4.2,
    status: 'ONLINE',
    assignedAnimalId: 'ANM-003',
  },
  {
    id: 'NODE-WL-04',
    devEui: '70B3D57ED005C8A4',
    appKey: '1A6C0304169DB09499D5036697AD2E1A',
    firmwareVersion: 'v2.4.1-STM32WL55-Stop2',
    calibrationDate: '2026-10-02',
    batteryCapacityMah: 1000,
    batteryVoltage: 3.42,
    batteryPercent: 16,
    currentMicroAmps: 18.5,
    powerMode: 'STOP2',
    mcuState: 'LOW_POWER_SLEEP',
    samplingIntervalSec: 30,
    txIntervalSec: 120,
    lastUplinkTimestamp: new Date(Date.now() - 72000).toISOString(),
    rssiDbm: -110,
    snrDb: 1.5,
    status: 'DEGRADED',
    assignedAnimalId: 'ANM-004',
  },
];

export function generateInitialTelemetry(nodeId: string, animalId: string): TelemetryPacket[] {
  const packets: TelemetryPacket[] = [];
  const count = 30;
  const now = Date.now();

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * 12000).toISOString();
    // Normal bovine temp 38.2 to 38.9 C
    const tempNoise = Math.sin(i * 0.4) * 0.35 + (Math.random() - 0.5) * 0.15;
    const temperatureC = Number((38.45 + tempNoise).toFixed(2));

    // Accelerometer simulation: mainly standing/walking
    const isMoving = i % 8 === 0 || i % 8 === 1;
    const isRunning = i === 12;

    let accelX = 0.04 + (Math.random() - 0.5) * 0.06;
    let accelY = 0.11 + (Math.random() - 0.5) * 0.08;
    let accelZ = 0.98 + (Math.random() - 0.5) * 0.05;
    let activityClass: 'DIAM' | 'BERJALAN' | 'BERLARI' = 'DIAM';

    if (isRunning) {
      activityClass = 'BERLARI';
      accelX = 0.62;
      accelY = 0.74;
      accelZ = 1.45;
    } else if (isMoving) {
      activityClass = 'BERJALAN';
      accelX = 0.28;
      accelY = 0.35;
      accelZ = 1.08;
    }

    const mcuState = i === 0 ? 'LOW_POWER_SLEEP' : i % 5 === 0 ? 'ACTIVE_TX' : 'LOW_POWER_SLEEP';
    const currentMicroAmps = mcuState === 'ACTIVE_TX' ? 14200 : 18.5;

    // Encode sample hex payload: [Temp (2B), AccX (2B), AccY (2B), AccZ (2B), Batt (2B)]
    const tempHex = Math.round(temperatureC * 100).toString(16).padStart(4, '0').toUpperCase();
    const battHex = '0F50'; // 3920 mV
    const payloadHex = `01${tempHex}0028006E03D4${battHex}`;

    packets.push({
      id: `pkt-${nodeId}-${3000 + (count - i)}`,
      nodeId,
      animalId,
      timestamp,
      fcnt: 3000 + (count - i),
      temperatureC,
      accelX: Number(accelX.toFixed(3)),
      accelY: Number(accelY.toFixed(3)),
      accelZ: Number(accelZ.toFixed(3)),
      activityClass,
      batteryVoltage: 3.92,
      batteryPercent: 84,
      currentMicroAmps,
      mcuState,
      powerMode: 'STOP2',
      rssiDbm: -85 + Math.round((Math.random() - 0.5) * 4),
      snrDb: Number((9.5 + (Math.random() - 0.5) * 1.2).toFixed(1)),
      payloadHex,
    });
  }

  return packets;
}

export const INITIAL_DOWNLINKS: DownlinkCommand[] = [
  {
    id: 'cmd-01',
    nodeId: 'NODE-WL-01',
    timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    commandType: 'SET_SAMPLING_INTERVAL',
    paramSummary: 'Sampling: 10s',
    payloadHex: '0x01 0x0A',
    status: 'ACKED',
    ackTimestamp: new Date(Date.now() - 3590000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: 'cmd-02',
    nodeId: 'NODE-WL-01',
    timestamp: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    commandType: 'SET_TX_INTERVAL',
    paramSummary: 'TX: 60s',
    payloadHex: '0x02 0x3C',
    status: 'ACKED',
    ackTimestamp: new Date(Date.now() - 1792000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: 'cmd-03',
    nodeId: 'NODE-WL-01',
    timestamp: new Date(Date.now() - 600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    commandType: 'SWITCH_POWER_MODE',
    paramSummary: 'Mode: Stop2',
    payloadHex: '0x03 0x02',
    status: 'ACKED',
    ackTimestamp: new Date(Date.now() - 594000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alt-01',
    nodeId: 'NODE-WL-04',
    animalId: 'ANM-004',
    type: 'LOW_BATTERY',
    severity: 'CRITICAL',
    title: 'Kapasitas Baterai Rendah (< 20%)',
    message: 'Node NODE-WL-04 (Srikandi) terdeteksi memiliki sisa daya 16% (3.42 V). Segera jadwalkan penggantian baterai.',
    timestamp: '10 menit yang lalu',
    acknowledged: false,
  },
  {
    id: 'alt-02',
    nodeId: 'NODE-WL-01',
    animalId: 'ANM-001',
    type: 'INACTIVITY',
    severity: 'WARNING',
    title: 'Peringatan Inaktivitas Normal / Istirahat',
    message: 'Bima terdeteksi dalam klasifikasi DIAM selama 85 menit berturut-turut pada kandang komunal.',
    timestamp: '42 menit yang lalu',
    acknowledged: true,
  },
  {
    id: 'alt-03',
    nodeId: 'NODE-WL-02',
    animalId: 'ANM-002',
    type: 'FEVER',
    severity: 'INFO',
    title: 'Pemeriksaan Ambang Batas Suhu',
    message: 'Suhu Citra terpantau 38.9°C (dalam ambang batas normal-waspada laktasi, threshold demam > 39.5°C).',
    timestamp: '1 jam yang lalu',
    acknowledged: true,
  },
];

// Realistic thesis validation dataset (20 points) for MAE & RMSE calculation
export const INITIAL_VALIDATION_PAIRS: TemperatureValidationPair[] = [
  { id: 'v-01', timestamp: '08:00', wearableTemp: 38.35, referenceTemp: 38.20, absoluteError: 0.15, squaredError: 0.0225 },
  { id: 'v-02', timestamp: '08:30', wearableTemp: 38.42, referenceTemp: 38.30, absoluteError: 0.12, squaredError: 0.0144 },
  { id: 'v-03', timestamp: '09:00', wearableTemp: 38.51, referenceTemp: 38.40, absoluteError: 0.11, squaredError: 0.0121 },
  { id: 'v-04', timestamp: '09:30', wearableTemp: 38.48, referenceTemp: 38.55, absoluteError: 0.07, squaredError: 0.0049 },
  { id: 'v-05', timestamp: '10:00', wearableTemp: 38.65, referenceTemp: 38.80, absoluteError: 0.15, squaredError: 0.0225 },
  { id: 'v-06', timestamp: '10:30', wearableTemp: 38.72, referenceTemp: 38.90, absoluteError: 0.18, squaredError: 0.0324 },
  { id: 'v-07', timestamp: '11:00', wearableTemp: 38.85, referenceTemp: 38.70, absoluteError: 0.15, squaredError: 0.0225 },
  { id: 'v-08', timestamp: '11:30', wearableTemp: 38.90, referenceTemp: 38.75, absoluteError: 0.15, squaredError: 0.0225 },
  { id: 'v-09', timestamp: '12:00', wearableTemp: 39.10, referenceTemp: 38.95, absoluteError: 0.15, squaredError: 0.0225 },
  { id: 'v-10', timestamp: '12:30', wearableTemp: 39.05, referenceTemp: 39.20, absoluteError: 0.15, squaredError: 0.0225 },
  { id: 'v-11', timestamp: '13:00', wearableTemp: 38.95, referenceTemp: 38.80, absoluteError: 0.15, squaredError: 0.0225 },
  { id: 'v-12', timestamp: '13:30', wearableTemp: 38.80, referenceTemp: 38.65, absoluteError: 0.15, squaredError: 0.0225 },
  { id: 'v-13', timestamp: '14:00', wearableTemp: 38.68, referenceTemp: 38.50, absoluteError: 0.18, squaredError: 0.0324 },
  { id: 'v-14', timestamp: '14:30', wearableTemp: 38.55, referenceTemp: 38.40, absoluteError: 0.15, squaredError: 0.0225 },
  { id: 'v-15', timestamp: '15:00', wearableTemp: 38.45, referenceTemp: 38.35, absoluteError: 0.10, squaredError: 0.0100 },
  { id: 'v-16', timestamp: '15:30', wearableTemp: 38.38, referenceTemp: 38.25, absoluteError: 0.13, squaredError: 0.0169 },
  { id: 'v-17', timestamp: '16:00', wearableTemp: 38.40, referenceTemp: 38.30, absoluteError: 0.10, squaredError: 0.0100 },
  { id: 'v-18', timestamp: '16:30', wearableTemp: 38.35, referenceTemp: 38.20, absoluteError: 0.15, squaredError: 0.0225 },
  { id: 'v-19', timestamp: '17:00', wearableTemp: 38.30, referenceTemp: 38.15, absoluteError: 0.15, squaredError: 0.0225 },
  { id: 'v-20', timestamp: '17:30', wearableTemp: 38.25, referenceTemp: 38.10, absoluteError: 0.15, squaredError: 0.0225 },
];
