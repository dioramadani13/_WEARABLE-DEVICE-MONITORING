import { PowerMode, PowerComparisonStats } from '../types';

export const POWER_MODE_SPECS = {
  RUN: {
    label: 'Run Mode (Active)',
    sleepCurrentUa: 6500, // 6.5 mA
    description: 'CPU aktif clock penuh 48MHz, core & peripheral aktif terus menerus',
  },
  SLEEP: {
    label: 'Sleep Mode',
    sleepCurrentUa: 1200, // 1.2 mA
    description: 'CPU clock dihentikan, peripheral tetap beroperasi',
  },
  STOP2: {
    label: 'Stop2 Mode (Deep Sleep)',
    sleepCurrentUa: 18.5, // 18.5 uA
    description: 'Low-power ultra deep sleep, RTC & low-power timer bangunkan sistem',
  },
  STANDBY: {
    label: 'Standby Mode',
    sleepCurrentUa: 1.2, // 1.2 uA
    description: 'SRAM & register di-reset, daya terendah namun wake-up time lebih lama',
  },
};

export function calculatePowerStats(
  samplingIntervalSec: number,
  txIntervalSec: number,
  powerMode: PowerMode = 'STOP2',
  batteryCapacityMah: number = 1000
): PowerComparisonStats {
  const activeTxCurrentMa = 14.2; // STM32WL + LoRa TX at +14 dBm
  const txDurationSec = 0.12; // 120 ms LoRa frame airtime (SF7 / BW 125kHz)
  const samplingCurrentMa = 1.8; // Sensor TMP117 + LIS3DH I2C read
  const sampleDurationSec = 0.08; // 80 ms measurement window

  const sleepCurrentUa = POWER_MODE_SPECS[powerMode].sleepCurrentUa;
  const sleepCurrentMa = sleepCurrentUa / 1000;

  // Number of samples taken within one TX window
  const effectiveSamplingInterval = Math.max(1, samplingIntervalSec);
  const effectiveTxInterval = Math.max(effectiveSamplingInterval, txIntervalSec);
  const samplesPerTx = Math.max(1, Math.floor(effectiveTxInterval / effectiveSamplingInterval));

  const totalSamplingTimeSec = samplesPerTx * sampleDurationSec;
  const totalSleepTimeSec = Math.max(0, effectiveTxInterval - (txDurationSec + totalSamplingTimeSec));

  // Average current during 1 TX period
  const totalChargeMilliAmpSec =
    (activeTxCurrentMa * txDurationSec) +
    (samplingCurrentMa * totalSamplingTimeSec) +
    (sleepCurrentMa * totalSleepTimeSec);

  const optimizedAvgMa = totalChargeMilliAmpSec / effectiveTxInterval;

  // Baseline constant active mode without power management:
  // MCU runs constantly at 14.8 mA (polling continuously)
  const constantActiveAvgMa = 14.8;

  const constantActiveBatteryHours = batteryCapacityMah / constantActiveAvgMa;
  const optimizedBatteryHours = batteryCapacityMah / optimizedAvgMa;

  const energySavedPercent = ((constantActiveAvgMa - optimizedAvgMa) / constantActiveAvgMa) * 100;
  const batteryLifeExtensionRatio = optimizedBatteryHours / constantActiveBatteryHours;

  return {
    samplingIntervalSec: effectiveSamplingInterval,
    txIntervalSec: effectiveTxInterval,
    activeCurrentMa: activeTxCurrentMa,
    samplingCurrentMa,
    sleepCurrentUa,
    constantActiveAvgMa,
    optimizedAvgMa: Number(optimizedAvgMa.toFixed(4)),
    constantActiveBatteryHours: Number(constantActiveBatteryHours.toFixed(1)),
    optimizedBatteryHours: Number(optimizedBatteryHours.toFixed(1)),
    energySavedPercent: Number(energySavedPercent.toFixed(2)),
    batteryLifeExtensionRatio: Number(batteryLifeExtensionRatio.toFixed(1)),
  };
}

export function formatDurationHours(hours: number): string {
  if (hours < 48) {
    return `${hours.toFixed(1)} Jam`;
  }
  const days = hours / 24;
  if (days < 60) {
    return `${days.toFixed(1)} Hari`;
  }
  const months = days / 30;
  return `${months.toFixed(1)} Bulan (${Math.round(days)} Hari)`;
}
