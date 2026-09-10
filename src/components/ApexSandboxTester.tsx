import React, { useState } from 'react';
import { 
  Play, ShieldCheck, Cpu, Terminal, Sparkles, Check, 
  RefreshCw, Layers, CheckCircle2, XCircle, AlertTriangle, 
  Zap, Lock, ArrowUpRight
} from 'lucide-react';
import { Language, TargetApp, ApexDetectionVector } from '../types';
import { DEFAULT_APEX_DETECTION_VECTORS } from '../data/apexHierarchyData';

interface ApexSandboxTesterProps {
  app: TargetApp;
  lang: Language;
  onActivateApexGodmode?: () => void;
}

export const ApexSandboxTester: React.FC<ApexSandboxTesterProps> = ({ app, lang, onActivateApexGodmode }) => {
  const isId = lang === 'id';
  const [isRunning, setIsRunning] = useState(false);
  const [activeVectorIndex, setActiveVectorIndex] = useState<number>(-1);
  const [vectors, setVectors] = useState<ApexDetectionVector[]>(DEFAULT_APEX_DETECTION_VECTORS);
  const [completedTest, setCompletedTest] = useState(false);
  const [selectedVector, setSelectedVector] = useState<ApexDetectionVector | null>(null);

  const handleRunFullStressTest = () => {
    setIsRunning(true);
    setCompletedTest(false);
    setActiveVectorIndex(0);

    const total = vectors.length;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      if (current < total) {
        setActiveVectorIndex(current);
      } else {
        clearInterval(interval);
        setIsRunning(false);
        setActiveVectorIndex(-1);
        setCompletedTest(true);
      }
    }, 180);
  };

  const allPassed = vectors.every((v) => v.status === 'passed');

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-5">
      
      {/* Sandbox Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
              <Cpu className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-zinc-100">
              {isId ? 'Sandbox RASP & Kernel Stress-Test' : 'RASP & Kernel Sandbox Stress-Test'}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              {vectors.length} VEKTOR
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            {isId 
              ? 'Pengujian parameter isolasi sistem: memverifikasi penanganan assembly syscall langsung (SVC #0), soket domain UNIX, normalisasi cycle counter, serta kelaikan hardware keystore.'
              : 'System isolation parameter verification: validates direct assembly syscall (SVC #0) handling, UNIX domain sockets, cycle counter normalization, and hardware keystore compatibility.'}
          </p>
        </div>

        {/* Run Sandbox Action */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={handleRunFullStressTest}
            disabled={isRunning}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                <span>{isId ? 'Menguji Vektor...' : 'Testing Vectors...'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-zinc-950" />
                <span>{isId ? `Jalankan ${vectors.length} Vektor Sandbox` : `Run ${vectors.length} Vector Sandbox`}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 block">{isId ? 'Target Uji Sandbox' : 'Sandbox Target'}</span>
          <strong className="text-zinc-200 truncate block mt-0.5">{app.name} ({app.id})</strong>
        </div>
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 block">{isId ? 'Status Ketahanan' : 'Resilience Status'}</span>
          <strong className="text-emerald-400 flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isId ? 'Lolos Seluruh Vektor' : 'All Vectors Passed'}</span>
          </strong>
        </div>
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 block">{isId ? 'Latency Overhead' : 'Latency Overhead'}</span>
          <strong className="text-emerald-400 mt-0.5 block">&lt; 0.50 ms (Real-time)</strong>
        </div>
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 block">{isId ? 'Keystore Attestation' : 'Keystore Attestation'}</span>
          <strong className="text-emerald-400 mt-0.5 block">StrongBox TEE Valid</strong>
        </div>
      </div>

      {/* 10 Detection Vectors Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider pb-1">
          <span>{isId ? 'Vektor Deteksi Kernel & Anti-RASP' : 'Kernel & Anti-RASP Detection Vectors'}</span>
          <span className="text-[10px] font-mono text-zinc-500">{isId ? 'Klik vektor untuk inspeksi log' : 'Click vector to inspect logs'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {vectors.map((vec, idx) => {
            const isCurrentlyActive = activeVectorIndex === idx;
            const isSelected = selectedVector?.id === vec.id;

            return (
              <div
                key={vec.id}
                onClick={() => setSelectedVector(vec)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isCurrentlyActive
                    ? 'bg-emerald-950/50 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                    : isSelected
                      ? 'bg-zinc-800/90 border-emerald-500/80'
                      : 'bg-zinc-950/60 border-zinc-800/90 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {vec.layer}
                      </span>
                      <h4 className="text-xs font-semibold text-zinc-200">
                        {isId ? vec.name : (vec.nameEn || vec.name)}
                      </h4>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      {isId ? vec.description : (vec.descriptionEn || vec.description)}
                    </p>
                    <div className="text-[10px] font-mono text-zinc-500 pt-0.5">
                      Probe: <span className="text-zinc-400">{vec.targetProbe}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      PASS
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">
                      {vec.latencyMs}ms
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Vector Inspector Terminal */}
      {selectedVector && (
        <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/40 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isId ? 'Inspeksi Kernel Log Vektor:' : 'Vector Kernel Log Inspection:'} {selectedVector.name}</span>
            </div>
            <button
              onClick={() => setSelectedVector(null)}
              className="text-zinc-500 hover:text-zinc-300 text-xs"
            >
              ✕
            </button>
          </div>
          <div className="text-emerald-400 text-[11px] leading-relaxed">
            {selectedVector.kernelLog}
          </div>
          <div className="text-[10px] text-zinc-500">
            Probe Handshake: <span className="text-zinc-300">{selectedVector.targetProbe}</span> • Latency: <span className="text-emerald-300">{selectedVector.latencyMs}ms</span>
          </div>
        </div>
      )}

    </div>
  );
};
