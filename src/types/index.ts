export type ActivityClass = 'DIAM' | 'BERJALAN' | 'BERLARI';
export type McuState = 'ACTIVE_TX' | 'SAMPLING' | 'LOW_POWER_SLEEP';
export type PowerMode = 'RUN' | 'SLEEP' | 'STOP2' | 'STANDBY';
export type SignalRating = 'EXCELLENT' | 'FAIR' | 'POOR';
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type AlertType = 'FEVER' | 'HYPOTHERMIA' | 'INACTIVITY' | 'LOW_BATTERY' | 'SIGNAL_DEGRADED' | 'NODE_OFFLINE';

export interface AnimalProfile {
  id: string;
  name: string;
  species: string;
  tagNumber: string;
  ageYears: number;
  weightKg: number;
  medicalNotes: string;
  assignedNodeId: string;
}

export interface WearableNode {
  id: string;
  devEui: string;
  appKey: string;
  firmwareVersion: string;
  calibrationDate: string;
  batteryCapacityMah: number;
  batteryVoltage: number;
  batteryPercent: number;
  currentMicroAmps: number;
  powerMode: PowerMode;
  mcuState: McuState;
  samplingIntervalSec: number;
  txIntervalSec: number;
  lastUplinkTimestamp: string;
  rssiDbm: number;
  snrDb: number;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  assignedAnimalId: string;
}

export interface TelemetryPacket {
  id: string;
  nodeId: string;
  animalId: string;
  timestamp: string; // ISO
  fcnt: number; // frame counter
  temperatureC: number;
  accelX: number; // g
  accelY: number; // g
  accelZ: number; // g
  activityClass: ActivityClass;
  batteryVoltage: number; // V
  batteryPercent: number; // %
  currentMicroAmps: number; // uA
  mcuState: McuState;
  powerMode: PowerMode;
  rssiDbm: number;
  snrDb: number;
  payloadHex: string;
}

export interface DownlinkCommand {
  id: string;
  nodeId: string;
  timestamp: string;
  commandType: 'SET_SAMPLING_INTERVAL' | 'SET_TX_INTERVAL' | 'SWITCH_POWER_MODE';
  paramSummary: string;
  payloadHex: string;
  status: 'QUEUED' | 'TRANSMITTED' | 'ACKED';
  ackTimestamp?: string;
}

export interface AlertItem {
  id: string;
  nodeId: string;
  animalId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface TemperatureValidationPair {
  id: string;
  timestamp: string;
  wearableTemp: number;
  referenceTemp: number;
  absoluteError: number;
  squaredError: number;
}

export interface ValidationMetrics {
  count: number;
  mae: number;
  rmse: number;
  maxAbsoluteError: number;
  meanDeviation: number;
  maePass: boolean; // threshold <= 0.3°C
  rmsePass: boolean; // threshold <= 0.5°C
}

export interface PowerComparisonStats {
  samplingIntervalSec: number;
  txIntervalSec: number;
  activeCurrentMa: number;
  samplingCurrentMa: number;
  sleepCurrentUa: number;
  constantActiveAvgMa: number;
  optimizedAvgMa: number;
  constantActiveBatteryHours: number;
  optimizedBatteryHours: number;
  energySavedPercent: number;
  batteryLifeExtensionRatio: number;
}
