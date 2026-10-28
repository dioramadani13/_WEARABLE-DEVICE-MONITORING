import React, { useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { TelemetryPacket } from '../types';

export const TelemetryCharts: React.FC = () => {
  const { telemetry, selectedNode } = useMonitoring();
  const [hoveredPoint, setHoveredPoint] = useState<TelemetryPacket | null>(null);
  const [activeChart, setActiveChart] = useState<'both' | 'temp' | 'accel'>('both');

  const width = 640;
  const height = 150;
  const padding = { top: 15, right: 15, bottom: 20, left: 40 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Temperature calculations
  const tempValues = telemetry.map((p) => p.temperatureC);
  const minTemp = Math.min(37.0, Math.floor(Math.min(...tempValues) * 10) / 10);
  const maxTemp = Math.max(40.0, Math.ceil(Math.max(...tempValues) * 10) / 10);
  const tempRange = Math.max(0.1, maxTemp - minTemp);

  const getTempY = (val: number) => {
    return padding.top + plotH - ((val - minTemp) / tempRange) * plotH;
  };

  const getX = (index: number, total: number) => {
    if (total <= 1) return padding.left;
    return padding.left + (index / (total - 1)) * plotW;
  };

  const tempPoints = telemetry
    .map((p, i) => `${getX(i, telemetry.length).toFixed(1)},${getTempY(p.temperatureC).toFixed(1)}`)
    .join(' ');

  const normalTopY = getTempY(39.2);
  const normalBottomY = getTempY(38.0);
  const normalBandH = Math.max(0, normalBottomY - normalTopY);

  // Accelerometer calculations
  const minAccel = -1.0;
  const maxAccel = 2.0;
  const accelRange = maxAccel - minAccel;

  const getAccelY = (val: number) => {
    const clamped = Math.max(minAccel, Math.min(maxAccel, val));
    return padding.top + plotH - ((clamped - minAccel) / accelRange) * plotH;
  };

  const accelXPoints = telemetry
    .map((p, i) => `${getX(i, telemetry.length).toFixed(1)},${getAccelY(p.accelX).toFixed(1)}`)
    .join(' ');

  const accelYPoints = telemetry
    .map((p, i) => `${getX(i, telemetry.length).toFixed(1)},${getAccelY(p.accelY).toFixed(1)}`)
    .join(' ');

  const accelZPoints = telemetry
    .map((p, i) => `${getX(i, telemetry.length).toFixed(1)},${getAccelY(p.accelZ).toFixed(1)}`)
    .join(' ');

  const zeroAccelY = getAccelY(0);
  const oneGAccelY = getAccelY(1.0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
      {/* Chart Switcher / Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">Grafik Telemetri Real-Time</span>
          <span className="text-xs text-slate-400 font-mono">
            {selectedNode?.rssiDbm} dBm &middot; {selectedNode?.snrDb} dB SNR
          </span>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveChart('both')}
            className={`px-2.5 py-1 font-medium rounded cursor-pointer transition-colors ${
              activeChart === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveChart('temp')}
            className={`px-2.5 py-1 font-medium rounded cursor-pointer transition-colors ${
              activeChart === 'temp' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Suhu
          </button>
          <button
            onClick={() => setActiveChart('accel')}
            className={`px-2.5 py-1 font-medium rounded cursor-pointer transition-colors ${
              activeChart === 'accel' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Akselerometer
          </button>
        </div>
      </div>

      {/* CHART 1: Suhu Tubuh */}
      {(activeChart === 'both' || activeChart === 'temp') && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
            <span className="font-semibold text-slate-700 font-sans">Suhu Tubuh (&deg;C)</span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-0.5 bg-emerald-600 inline-block"></span> Sensor
              </span>
              <span className="text-slate-400">Zona Normal 38.0–39.2&deg;C</span>
              {hoveredPoint && (
                <span className="text-slate-900 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                  {hoveredPoint.temperatureC}&deg;C
                </span>
              )}
            </div>
          </div>

          <div className="w-full bg-slate-50/60 rounded-lg border border-slate-100 p-1">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-36 cursor-crosshair select-none"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {/* Normal Band */}
              <rect
                x={padding.left}
                y={normalTopY}
                width={plotW}
                height={normalBandH}
                fill="rgba(16, 185, 129, 0.08)"
                stroke="rgba(16, 185, 129, 0.25)"
                strokeDasharray="3 3"
              />

              {/* Grid Lines */}
              {[minTemp, 38.0, 39.0, maxTemp].map((t) => {
                const y = getTempY(t);
                return (
                  <g key={t}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 5}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] fill-slate-400 font-mono"
                    >
                      {t.toFixed(1)}&deg;
                    </text>
                  </g>
                );
              })}

              {/* Line */}
              <polyline
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={tempPoints}
              />

              {/* Circles */}
              {telemetry.map((p, i) => {
                const cx = getX(i, telemetry.length);
                const cy = getTempY(p.temperatureC);
                const isHovered = hoveredPoint?.id === p.id;
                const isFever = p.temperatureC > 39.5;

                return (
                  <g key={p.id}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 4 : isFever ? 3 : 1.8}
                      fill={isFever ? '#DC2626' : '#059669'}
                      stroke="#FFFFFF"
                      strokeWidth="1"
                    />
                    <rect
                      x={cx - 7}
                      y={padding.top}
                      width={14}
                      height={plotH}
                      fill="transparent"
                      onMouseEnter={() => setHoveredPoint(p)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* CHART 2: Accelerometer */}
      {(activeChart === 'both' || activeChart === 'accel') && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
            <span className="font-semibold text-slate-700 font-sans">Akselerometer 3-Axis (g)</span>
            <div className="flex items-center gap-3">
              <span className="text-sky-600">X: {telemetry[telemetry.length - 1]?.accelX ?? 0}g</span>
              <span className="text-emerald-600">Y: {telemetry[telemetry.length - 1]?.accelY ?? 0}g</span>
              <span className="text-indigo-600">Z: {telemetry[telemetry.length - 1]?.accelZ ?? 0}g</span>
            </div>
          </div>

          <div className="w-full bg-slate-50/60 rounded-lg border border-slate-100 p-1">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 select-none">
              {/* 0g and 1g lines */}
              <line
                x1={padding.left}
                y1={zeroAccelY}
                x2={width - padding.right}
                y2={zeroAccelY}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
              <text x={padding.left - 5} y={zeroAccelY + 3} textAnchor="end" className="text-[9px] fill-slate-400 font-mono">
                0g
              </text>

              <line
                x1={padding.left}
                y1={oneGAccelY}
                x2={width - padding.right}
                y2={oneGAccelY}
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text x={padding.left - 5} y={oneGAccelY + 3} textAnchor="end" className="text-[9px] fill-slate-400 font-mono">
                1g
              </text>

              {/* Polyline X, Y, Z */}
              <polyline
                fill="none"
                stroke="#0284C7"
                strokeWidth="1.6"
                strokeLinecap="round"
                points={accelXPoints}
              />
              <polyline
                fill="none"
                stroke="#059669"
                strokeWidth="1.6"
                strokeLinecap="round"
                points={accelYPoints}
              />
              <polyline
                fill="none"
                stroke="#7C3AED"
                strokeWidth="1.8"
                strokeLinecap="round"
                points={accelZPoints}
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
