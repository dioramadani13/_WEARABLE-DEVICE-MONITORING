import { TemperatureValidationPair, ValidationMetrics } from '../types';

export function calculateValidationMetrics(
  pairs: TemperatureValidationPair[]
): ValidationMetrics {
  if (pairs.length === 0) {
    return {
      count: 0,
      mae: 0,
      rmse: 0,
      maxAbsoluteError: 0,
      meanDeviation: 0,
      maePass: false,
      rmsePass: false,
    };
  }

  let sumAbsoluteError = 0;
  let sumSquaredError = 0;
  let sumDeviation = 0;
  let maxAbs = 0;

  for (const pair of pairs) {
    const absErr = Math.abs(pair.wearableTemp - pair.referenceTemp);
    const sqErr = Math.pow(pair.wearableTemp - pair.referenceTemp, 2);
    const dev = pair.wearableTemp - pair.referenceTemp;

    sumAbsoluteError += absErr;
    sumSquaredError += sqErr;
    sumDeviation += dev;
    if (absErr > maxAbs) {
      maxAbs = absErr;
    }
  }

  const n = pairs.length;
  const mae = sumAbsoluteError / n;
  const rmse = Math.sqrt(sumSquaredError / n);
  const meanDeviation = sumDeviation / n;

  // PRD Section 7.2 Pass criteria: MAE <= 0.3°C, RMSE <= 0.5°C
  const maePass = mae <= 0.3;
  const rmsePass = rmse <= 0.5;

  return {
    count: n,
    mae: Number(mae.toFixed(3)),
    rmse: Number(rmse.toFixed(3)),
    maxAbsoluteError: Number(maxAbs.toFixed(3)),
    meanDeviation: Number(meanDeviation.toFixed(3)),
    maePass,
    rmsePass,
  };
}

export function parseCsvValidationData(csvContent: string): TemperatureValidationPair[] {
  const lines = csvContent.trim().split(/\r?\n/);
  const pairs: TemperatureValidationPair[] = [];

  // Look for headers like: timestamp, wearable_temp, reference_temp or similar
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    const parts = line.split(/[,;\t]/).map((p) => p.trim());
    if (parts.length < 2) continue;

    // Check if header line
    if (isNaN(parseFloat(parts[0])) && isNaN(parseFloat(parts[1]))) {
      continue;
    }

    let timestamp = new Date(Date.now() - (lines.length - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let wearableTemp = 0;
    let referenceTemp = 0;

    if (parts.length >= 3 && isNaN(parseFloat(parts[0]))) {
      // Format: Timestamp, Wearable, Reference
      timestamp = parts[0];
      wearableTemp = parseFloat(parts[1]);
      referenceTemp = parseFloat(parts[2]);
    } else {
      wearableTemp = parseFloat(parts[0]);
      referenceTemp = parseFloat(parts[1]);
      if (parts[2]) {
        timestamp = parts[2];
      }
    }

    if (!isNaN(wearableTemp) && !isNaN(referenceTemp)) {
      const absErr = Math.abs(wearableTemp - referenceTemp);
      const sqErr = Math.pow(wearableTemp - referenceTemp, 2);
      pairs.push({
        id: `val-${Date.now()}-${i}`,
        timestamp,
        wearableTemp: Number(wearableTemp.toFixed(2)),
        referenceTemp: Number(referenceTemp.toFixed(2)),
        absoluteError: Number(absErr.toFixed(3)),
        squaredError: Number(sqErr.toFixed(4)),
      });
    }
  }

  return pairs;
}
