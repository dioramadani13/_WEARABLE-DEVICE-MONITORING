import React, { useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { AnimalProfile, WearableNode } from '../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const AssetManagementView: React.FC = () => {
  const {
    animals,
    nodes,
    addAnimal,
    updateAnimal,
    deleteAnimal,
    addNode,
    updateNode,
    deleteNode,
    selectedAnimalId,
    setSelectedAnimalId,
  } = useMonitoring();

  const [activeSubTab, setActiveSubTab] = useState<'animals' | 'nodes'>('animals');
  const [isAddingAnimal, setIsAddingAnimal] = useState<boolean>(false);
  const [editingAnimalId, setEditingAnimalId] = useState<string | null>(null);
  const [animalForm, setAnimalForm] = useState<Omit<AnimalProfile, 'id'>>({
    name: '',
    species: 'Sapi Perah (Friesian Holstein)',
    tagNumber: 'EAR-TAG-001',
    ageYears: 3.0,
    weightKg: 500,
    medicalNotes: 'Kondisi sehat terpantau.',
    assignedNodeId: nodes[0]?.id || 'NODE-WL-01',
  });

  const [isAddingNode, setIsAddingNode] = useState<boolean>(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nodeForm, setNodeForm] = useState<Omit<WearableNode, 'id'>>({
    devEui: '70B3D57ED005C8A5',
    appKey: '2B7E151628AED2A6ABF7158809CF4F3C',
    firmwareVersion: 'v2.4.1-STM32WL55-Stop2',
    calibrationDate: new Date().toISOString().slice(0, 10),
    batteryCapacityMah: 1000,
    batteryVoltage: 4.1,
    batteryPercent: 95,
    currentMicroAmps: 18.5,
    powerMode: 'STOP2',
    mcuState: 'LOW_POWER_SLEEP',
    samplingIntervalSec: 10,
    txIntervalSec: 60,
    lastUplinkTimestamp: new Date().toISOString(),
    rssiDbm: -85,
    snrDb: 9.0,
    status: 'ONLINE',
    assignedAnimalId: animals[0]?.id || 'ANM-001',
  });

  const handleSaveAnimal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAnimalId) {
      updateAnimal(editingAnimalId, animalForm);
      setEditingAnimalId(null);
    } else {
      addAnimal(animalForm);
      setIsAddingAnimal(false);
    }
  };

  const handleSaveNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNodeId) {
      updateNode(editingNodeId, nodeForm);
      setEditingNodeId(null);
    } else {
      addNode(nodeForm);
      setIsAddingNode(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub Tabs */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveSubTab('animals')}
            className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'animals' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profil Hewan ({animals.length})
          </button>
          <button
            onClick={() => setActiveSubTab('nodes')}
            className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'nodes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hardware Node ({nodes.length})
          </button>
        </div>

        {activeSubTab === 'animals' ? (
          <button
            onClick={() => {
              setIsAddingAnimal(true);
              setEditingAnimalId(null);
              setAnimalForm({
                name: '',
                species: 'Sapi Perah',
                tagNumber: `TAG-00${animals.length + 1}`,
                ageYears: 3,
                weightKg: 500,
                medicalNotes: '',
                assignedNodeId: nodes[0]?.id || '',
              });
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Hewan</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setIsAddingNode(true);
              setEditingNodeId(null);
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Node</span>
          </button>
        )}
      </div>

      {/* Form Inline */}
      {(isAddingAnimal || editingAnimalId) && (
        <form onSubmit={handleSaveAnimal} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs">
          <span className="font-bold text-slate-900 block">
            {editingAnimalId ? 'Edit Hewan' : 'Daftarkan Hewan Baru'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              required
              placeholder="Nama Hewan"
              value={animalForm.name}
              onChange={(e) => setAnimalForm({ ...animalForm, name: e.target.value })}
              className="border border-slate-300 rounded px-2 py-1.5 bg-white"
            />
            <input
              type="text"
              required
              placeholder="Spesies"
              value={animalForm.species}
              onChange={(e) => setAnimalForm({ ...animalForm, species: e.target.value })}
              className="border border-slate-300 rounded px-2 py-1.5 bg-white"
            />
            <input
              type="text"
              required
              placeholder="Nomor Tag"
              value={animalForm.tagNumber}
              onChange={(e) => setAnimalForm({ ...animalForm, tagNumber: e.target.value })}
              className="border border-slate-300 rounded px-2 py-1.5 bg-white font-mono"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsAddingAnimal(false);
                setEditingAnimalId(null);
              }}
              className="px-2.5 py-1 border border-slate-300 rounded cursor-pointer"
            >
              Batal
            </button>
            <button type="submit" className="px-3 py-1 bg-slate-900 text-white rounded font-semibold cursor-pointer">
              Simpan
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 1: Animals */}
      {activeSubTab === 'animals' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {animals.map((anm) => (
            <div
              key={anm.id}
              className={`p-3.5 rounded-xl border text-xs ${
                selectedAnimalId === anm.id ? 'border-slate-900 bg-slate-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900">{anm.name}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {anm.tagNumber} &middot; {anm.species}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingAnimalId(anm.id);
                      setIsAddingAnimal(false);
                      setAnimalForm({ ...anm });
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteAnimal(anm.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-2 text-[11px] font-mono text-slate-600 flex justify-between">
                <span>{anm.weightKg} kg &middot; {anm.ageYears} Thn</span>
                <span className="text-blue-700 font-bold">{anm.assignedNodeId}</span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedAnimalId(anm.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${
                    selectedAnimalId === anm.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {selectedAnimalId === anm.id ? 'Aktif' : 'Pilih'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 2: Nodes */}
      {activeSubTab === 'nodes' && (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Device ID</th>
                <th className="py-2 px-3">DevEUI</th>
                <th className="py-2 px-3">Baterai</th>
                <th className="py-2 px-3">Mode</th>
                <th className="py-2 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {nodes.map((n) => (
                <tr key={n.id}>
                  <td className="py-2 px-3 font-bold text-slate-900">{n.id}</td>
                  <td className="py-2 px-3 text-slate-500">{n.devEui}</td>
                  <td className="py-2 px-3 text-slate-800">{n.batteryPercent}% ({n.batteryVoltage}V)</td>
                  <td className="py-2 px-3 text-blue-700 font-semibold">{n.powerMode}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => deleteNode(n.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
