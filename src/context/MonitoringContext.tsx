import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  AnimalProfile,
  WearableNode,
  TelemetryPacket,
  DownlinkCommand,
  AlertItem,
  TemperatureValidationPair,
  ValidationMetrics,
  PowerComparisonStats,
  PowerMode,
  McuState,
  ActivityClass,
} from '../types';
import {
  INITIAL_ANIMALS,
  INITIAL_NODES,
  generateInitialTelemetry,
  INITIAL_DOWNLINKS,
  INITIAL_ALERTS,
  INITIAL_VALIDATION_PAIRS,
} from '../mock/initialData';
import { calculatePowerStats, POWER_MODE_SPECS } from '../utils/powerMath';
import { calculateValidationMetrics, parseCsvValidationData } from '../utils/validationMath';

interface MonitoringContextType {
  animals: AnimalProfile[];
  nodes: WearableNode[];
  selectedAnimalId: string;
  setSelectedAnimalId: (id: string) => void;
  selectedAnimal?: AnimalProfile;
  selectedNode?: WearableNode;
  telemetry: TelemetryPacket[];
  latestTelemetry?: TelemetryPacket;
  isLiveStreaming: boolean;
  setIsLiveStreaming: (live: boolean) => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  downlinks: DownlinkCommand[];
  sendDownlink: (
    commandType: 'SET_SAMPLING_INTERVAL' | 'SET_TX_INTERVAL' | 'SWITCH_POWER_MODE',
    value: number | PowerMode
  ) => Promise<{ success: boolean; commandId: string }>;
  alerts: AlertItem[];
  unreadAlertCount: number;
  acknowledgeAlert: (id: string) => void;
  dismissAlert: (id: string) => void;
  clearAllAlerts: () => void;
  validationPairs: TemperatureValidationPair[];
  validationMetrics: ValidationMetrics;
  addValidationPair: (wearableTemp: number, referenceTemp: number, timestamp?: string) => void;
  removeValidationPair: (id: string) => void;
  importValidationCsv: (csvContent: string) => number;
  resetValidationData: () => void;
  powerStats: PowerComparisonStats;
  addAnimal: (animal: Omit<AnimalProfile, 'id'>) => void;
  updateAnimal: (id: string, animal: Partial<AnimalProfile>) => void;
  deleteAnimal: (id: string) => void;
  addNode: (node: Omit<WearableNode, 'id'>) => void;
  updateNode: (id: string, node: Partial<WearableNode>) => void;
  deleteNode: (id: string) => void;
  triggerManualUplink: (customTemp?: number, customActivity?: ActivityClass) => void;
  activeTab: 'monitoring' | 'analytics' | 'assets' | 'logs' | 'tests';
  setActiveTab: (tab: 'monitoring' | 'analytics' | 'assets' | 'logs' | 'tests') => void;
}

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined);

export const MonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [animals, setAnimals] = useState<AnimalProfile[]>(INITIAL_ANIMALS);
  const [nodes, setNodes] = useState<WearableNode[]>(INITIAL_NODES);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(INITIAL_ANIMALS[0].id);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'analytics' | 'assets' | 'logs' | 'tests'>('monitoring');

  // Find active node based on selected animal
  const selectedAnimal = useMemo(() => {
    return animals.find((a) => a.id === selectedAnimalId) || animals[0];
  }, [animals, selectedAnimalId]);

  const selectedNode = useMemo(() => {
    if (!selectedAnimal) return nodes[0];
    return nodes.find((n) => n.id === selectedAnimal.assignedNodeId) || nodes[0];
  }, [nodes, selectedAnimal]);

  // Telemetry packets buffer
  const [telemetry, setTelemetry] = useState<TelemetryPacket[]>(() => {
    return generateInitialTelemetry(INITIAL_NODES[0].id, INITIAL_ANIMALS[0].id);
  });

  const [downlinks, setDownlinks] = useState<DownlinkCommand[]>(INITIAL_DOWNLINKS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [validationPairs, setValidationPairs] = useState<TemperatureValidationPair[]>(INITIAL_VALIDATION_PAIRS);

  const latestTelemetry = telemetry[telemetry.length - 1];

  // Calculated power stats
  const powerStats = useMemo(() => {
    const sampling = selectedNode?.samplingIntervalSec || 10;
    const tx = selectedNode?.txIntervalSec || 60;
    const mode = selectedNode?.powerMode || 'STOP2';
    const capacity = selectedNode?.batteryCapacityMah || 1000;
    return calculatePowerStats(sampling, tx, mode, capacity);
  }, [selectedNode]);

  // Calculated validation metrics
  const validationMetrics = useMemo(() => {
    return calculateValidationMetrics(validationPairs);
  }, [validationPairs]);

  const unreadAlertCount = useMemo(() => {
    return alerts.filter((a) => !a.acknowledged).length;
  }, [alerts]);

  // Manual or automatic ingestion of an uplink packet
  const ingestTelemetryPacket = useCallback(
    (customTemp?: number, customActivity?: ActivityClass) => {
      if (!selectedNode || !selectedAnimal) return;

      const now = new Date();
      const lastFcnt = telemetry.length > 0 ? telemetry[telemetry.length - 1].fcnt : 3000;
      const nextFcnt = lastFcnt + 1;

      // Realistic temperature calculation with subtle wandering
      const baseTemp = 38.45;
      const noise = (Math.random() - 0.5) * 0.25;
      const temperatureC = customTemp !== undefined ? customTemp : Number((baseTemp + noise).toFixed(2));

      // Accelerometer & Activity determination
      let activityClass: ActivityClass = customActivity || 'DIAM';
      let accelX = 0.04 + (Math.random() - 0.5) * 0.05;
      let accelY = 0.11 + (Math.random() - 0.5) * 0.06;
      let accelZ = 0.98 + (Math.random() - 0.5) * 0.04;

      if (!customActivity) {
        const randActivity = Math.random();
        if (randActivity > 0.88) {
          activityClass = 'BERLARI';
          accelX = 0.55 + Math.random() * 0.25;
          accelY = 0.65 + Math.random() * 0.25;
          accelZ = 1.35 + Math.random() * 0.3;
        } else if (randActivity > 0.55) {
          activityClass = 'BERJALAN';
          accelX = 0.24 + Math.random() * 0.15;
          accelY = 0.32 + Math.random() * 0.15;
          accelZ = 1.05 + Math.random() * 0.1;
        }
      } else {
        if (customActivity === 'BERLARI') {
          accelX = 0.68;
          accelY = 0.72;
          accelZ = 1.48;
        } else if (customActivity === 'BERJALAN') {
          accelX = 0.28;
          accelY = 0.35;
          accelZ = 1.08;
        }
      }

      // STM32WL Mode and current consumption
      const mcuState: McuState = 'ACTIVE_TX';
      const currentMicroAmps = 14200; // 14.2 mA during TX burst

      // Construct hex payload according to PRD specs
      const tempHex = Math.round(temperatureC * 100).toString(16).padStart(4, '0').toUpperCase();
      const battMv = Math.round(selectedNode.batteryVoltage * 1000);
      const battHex = battMv.toString(16).padStart(4, '0').toUpperCase();
      const payloadHex = `01${tempHex}0024006E03D4${battHex}`;

      const newPacket: TelemetryPacket = {
        id: `pkt-${selectedNode.id}-${nextFcnt}`,
        nodeId: selectedNode.id,
        animalId: selectedAnimal.id,
        timestamp: now.toISOString(),
        fcnt: nextFcnt,
        temperatureC,
        accelX: Number(accelX.toFixed(3)),
        accelY: Number(accelY.toFixed(3)),
        accelZ: Number(accelZ.toFixed(3)),
        activityClass,
        batteryVoltage: selectedNode.batteryVoltage,
        batteryPercent: selectedNode.batteryPercent,
        currentMicroAmps,
        mcuState,
        powerMode: selectedNode.powerMode,
        rssiDbm: Math.max(-120, Math.min(-60, selectedNode.rssiDbm + Math.round((Math.random() - 0.5) * 3))),
        snrDb: Number((selectedNode.snrDb + (Math.random() - 0.5) * 0.6).toFixed(1)),
        payloadHex,
      };

      setTelemetry((prev) => {
        const next = [...prev, newPacket];
        // Keep last 60 packets for memory and smooth 60fps rendering
        if (next.length > 60) {
          return next.slice(next.length - 60);
        }
        return next;
      });

      // Update Node status & state machine:
      // Active TX for 250ms, then back to STOP2 sleep mode
      setNodes((prevNodes) =>
        prevNodes.map((n) => {
          if (n.id === selectedNode.id) {
            return {
              ...n,
              mcuState: 'ACTIVE_TX',
              currentMicroAmps: 14200,
              lastUplinkTimestamp: now.toISOString(),
            };
          }
          return n;
        })
      );

      // Transition to sleep mode after transmit airtime
      setTimeout(() => {
        setNodes((prevNodes) =>
          prevNodes.map((n) => {
            if (n.id === selectedNode.id) {
              const sleepUa = POWER_MODE_SPECS[n.powerMode].sleepCurrentUa;
              return {
                ...n,
                mcuState: 'LOW_POWER_SLEEP',
                currentMicroAmps: sleepUa,
              };
            }
            return n;
          })
        );
      }, 400);

      // Threshold check for automated alerts (FR-ALT-01 & FR-ALT-02)
      if (temperatureC > 39.5) {
        const alertId = `alt-fever-${Date.now()}`;
        setAlerts((prev) => [
          {
            id: alertId,
            nodeId: selectedNode.id,
            animalId: selectedAnimal.id,
            type: 'FEVER',
            severity: 'CRITICAL',
            title: 'Peringatan Demam Tinggi!',
            message: `Suhu ${selectedAnimal.name} terdeteksi ${temperatureC}°C (> ambang batas demam 39.5°C).`,
            timestamp: 'Baru saja',
            acknowledged: false,
          },
          ...prev,
        ]);
      } else if (temperatureC < 36.0) {
        const alertId = `alt-hypo-${Date.now()}`;
        setAlerts((prev) => [
          {
            id: alertId,
            nodeId: selectedNode.id,
            animalId: selectedAnimal.id,
            type: 'HYPOTHERMIA',
            severity: 'CRITICAL',
            title: 'Peringatan Hipotermia Hewan',
            message: `Suhu ${selectedAnimal.name} turun drastis ke ${temperatureC}°C (< 36.0°C).`,
            timestamp: 'Baru saja',
            acknowledged: false,
          },
          ...prev,
        ]);
      }
    },
    [selectedNode, selectedAnimal, telemetry]
  );

  // Live streaming timer simulation
  useEffect(() => {
    if (!isLiveStreaming) return;

    // Simulate LoRa TX Interval in real time (scaled by simulationSpeed)
    // Default: Every 4 seconds in UI simulates 1 TX uplink packet for rapid interactive inspection
    const intervalMs = Math.max(1000, 4000 / simulationSpeed);

    const timer = setInterval(() => {
      ingestTelemetryPacket();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isLiveStreaming, simulationSpeed, ingestTelemetryPacket]);

  // Send Downlink command (FR-CTL-01, FR-CTL-02, FR-CTL-03)
  const sendDownlink = useCallback(
    async (
      commandType: 'SET_SAMPLING_INTERVAL' | 'SET_TX_INTERVAL' | 'SWITCH_POWER_MODE',
      value: number | PowerMode
    ) => {
      if (!selectedNode) {
        return { success: false, commandId: '' };
      }

      const cmdId = `cmd-${Date.now()}`;
      let paramSummary = '';
      let payloadHex = '';

      if (commandType === 'SET_SAMPLING_INTERVAL') {
        const numVal = Number(value);
        paramSummary = `Sampling: ${numVal}s`;
        payloadHex = `0x01 0x${numVal.toString(16).padStart(2, '0').toUpperCase()}`;
      } else if (commandType === 'SET_TX_INTERVAL') {
        const numVal = Number(value);
        paramSummary = `TX: ${numVal}s`;
        payloadHex = `0x02 0x${numVal.toString(16).padStart(2, '0').toUpperCase()}`;
      } else if (commandType === 'SWITCH_POWER_MODE') {
        const modeVal = value as PowerMode;
        paramSummary = `Mode: ${modeVal}`;
        const modeCode = modeVal === 'RUN' ? '00' : modeVal === 'SLEEP' ? '01' : modeVal === 'STOP2' ? '02' : '03';
        payloadHex = `0x03 0x${modeCode}`;
      }

      const newCommand: DownlinkCommand = {
        id: cmdId,
        nodeId: selectedNode.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        commandType,
        paramSummary,
        payloadHex,
        status: 'QUEUED',
      };

      setDownlinks((prev) => [newCommand, ...prev]);

      // Simulate Gateway queueing & TX window dispatching (< 500ms as per NFR 4.1)
      setTimeout(() => {
        setDownlinks((prev) =>
          prev.map((c) => (c.id === cmdId ? { ...c, status: 'TRANSMITTED' } : c))
        );

        // Node receives downlink in RX window and replies with ACK
        setTimeout(() => {
          setDownlinks((prev) =>
            prev.map((c) =>
              c.id === cmdId
                ? {
                    ...c,
                    status: 'ACKED',
                    ackTimestamp: new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    }),
                  }
                : c
            )
          );

          // Apply updated configuration into the node state
          setNodes((prevNodes) =>
            prevNodes.map((n) => {
              if (n.id === selectedNode.id) {
                if (commandType === 'SET_SAMPLING_INTERVAL') {
                  return { ...n, samplingIntervalSec: Number(value) };
                }
                if (commandType === 'SET_TX_INTERVAL') {
                  return { ...n, txIntervalSec: Number(value) };
                }
                if (commandType === 'SWITCH_POWER_MODE') {
                  const mode = value as PowerMode;
                  return {
                    ...n,
                    powerMode: mode,
                    currentMicroAmps: POWER_MODE_SPECS[mode].sleepCurrentUa,
                  };
                }
              }
              return n;
            })
          );
        }, 600);
      }, 400);

      return { success: true, commandId: cmdId };
    },
    [selectedNode]
  );

  const triggerManualUplink = useCallback(
    (customTemp?: number, customActivity?: ActivityClass) => {
      ingestTelemetryPacket(customTemp, customActivity);
    },
    [ingestTelemetryPacket]
  );

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Temperature validation pairs management (FR-ANA-02)
  const addValidationPair = useCallback(
    (wearableTemp: number, referenceTemp: number, timestamp?: string) => {
      const ts =
        timestamp ||
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const absErr = Math.abs(wearableTemp - referenceTemp);
      const sqErr = Math.pow(wearableTemp - referenceTemp, 2);

      const newPair: TemperatureValidationPair = {
        id: `val-${Date.now()}`,
        timestamp: ts,
        wearableTemp: Number(wearableTemp.toFixed(2)),
        referenceTemp: Number(referenceTemp.toFixed(2)),
        absoluteError: Number(absErr.toFixed(3)),
        squaredError: Number(sqErr.toFixed(4)),
      };

      setValidationPairs((prev) => [...prev, newPair]);
    },
    []
  );

  const removeValidationPair = useCallback((id: string) => {
    setValidationPairs((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const importValidationCsv = useCallback((csvContent: string) => {
    const parsed = parseCsvValidationData(csvContent);
    if (parsed.length > 0) {
      setValidationPairs(parsed);
    }
    return parsed.length;
  }, []);

  const resetValidationData = useCallback(() => {
    setValidationPairs(INITIAL_VALIDATION_PAIRS);
  }, []);

  // Asset CRUD functions
  const addAnimal = useCallback((animalData: Omit<AnimalProfile, 'id'>) => {
    const newAnimal: AnimalProfile = {
      ...animalData,
      id: `ANM-${String(Date.now()).slice(-4)}`,
    };
    setAnimals((prev) => [...prev, newAnimal]);
  }, []);

  const updateAnimal = useCallback((id: string, updates: Partial<AnimalProfile>) => {
    setAnimals((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  }, []);

  const deleteAnimal = useCallback(
    (id: string) => {
      setAnimals((prev) => prev.filter((a) => a.id !== id));
      if (selectedAnimalId === id) {
        const remaining = animals.filter((a) => a.id !== id);
        if (remaining.length > 0) {
          setSelectedAnimalId(remaining[0].id);
        }
      }
    },
    [animals, selectedAnimalId]
  );

  const addNode = useCallback((nodeData: Omit<WearableNode, 'id'>) => {
    const newNode: WearableNode = {
      ...nodeData,
      id: `NODE-WL-${String(Date.now()).slice(-3)}`,
    };
    setNodes((prev) => [...prev, newNode]);
  }, []);

  const updateNode = useCallback((id: string, updates: Partial<WearableNode>) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <MonitoringContext.Provider
      value={{
        animals,
        nodes,
        selectedAnimalId,
        setSelectedAnimalId,
        selectedAnimal,
        selectedNode,
        telemetry,
        latestTelemetry,
        isLiveStreaming,
        setIsLiveStreaming,
        simulationSpeed,
        setSimulationSpeed,
        downlinks,
        sendDownlink,
        alerts,
        unreadAlertCount,
        acknowledgeAlert,
        dismissAlert,
        clearAllAlerts,
        validationPairs,
        validationMetrics,
        addValidationPair,
        removeValidationPair,
        importValidationCsv,
        resetValidationData,
        powerStats,
        addAnimal,
        updateAnimal,
        deleteAnimal,
        addNode,
        updateNode,
        deleteNode,
        triggerManualUplink,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
};
