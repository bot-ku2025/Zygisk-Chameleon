import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, 
  Play, RefreshCw, Cpu, Terminal, Sparkles, Layers, Zap, Check,
  Smartphone, Lock, ChevronDown, CheckCheck, ArrowUpRight, Key, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TargetApp, Language, IntegrityVerdictResult } from '../types';
import { translations } from '../locales/dictionary';
import { runIntegrityVerification } from '../utils/integrityVerifier';
import { FULL_STEALTH_TYPE_A } from '../data/initialApps';
import { ApexSandboxTester } from './ApexSandboxTester';
import { ApexHierarchyModal } from './ApexHierarchyModal';
import { KeyboxHealthModal } from './KeyboxHealthModal';
import { LiveSyscallMonitorModal } from './LiveSyscallMonitorModal';

interface PlayIntegrityTabProps {
  apps: TargetApp[];
  setApps: React.Dispatch<React.SetStateAction<TargetApp[]>>;
  lang: Language;
}

export const PlayIntegrityTab: React.FC<PlayIntegrityTabProps> = ({ apps, setApps, lang }) => {
  const t = translations[lang];
  const isId = lang === 'id';
  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);
  const [isKeyboxModalOpen, setIsKeyboxModalOpen] = useState(false);
  const [isLiveSyscallOpen, setIsLiveSyscallOpen] = useState(false);
  
  // Choose default target app (prefer banking app like BCA or first enabled app)
  const [selectedAppId, setSelectedAppId] = useState<string>(() => {
    const banking = apps.find(a => a.category === 'banking');
    return banking ? banking.id : (apps[0]?.id || '');
  });

  const selectedApp = apps.find(a => a.id === selectedAppId) || apps[0];

  const [isRunning, setIsRunning] = useState(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [result, setResult] = useState<IntegrityVerdictResult | null>(null);
  const [copiedLogs, setCopiedLogs] = useState(false);

  // Run initial test on first load or when switching selected app or language
  useEffect(() => {
    if (selectedApp) {
      const res = runIntegrityVerification(selectedApp, lang);
      setResult(res);
    }
  }, [selectedAppId, lang]);

  const handleActivateFullProtection = () => {
    setApps(prev => 
      prev.map(app => ({
        ...app,
        enabled: true,
        preset: 'full_stealth',
        typeA: { ...FULL_STEALTH_TYPE_A },
        typeB: {
          ...app.typeB,
          spoofFingerprint: true,
          spoofSecurityPatch: true,
          spoofBuildDisplay: true,
          spoofCmdline: true,
          spoofKernel: true,
        },
        dynamicToggles: {
          ...(app.dynamicToggles || {}),
          shopee_unix_socket: true,
          dexclassloader_hook_guard: true,
          bca_promon_svc_shield: true,
          mandiri_livin_mount_sanitizer: true,
          anti_bootloop_gki_guard: true,
        },
      }))
    );

    setTimeout(() => {
      if (selectedApp) {
        const updated = {
          ...selectedApp,
          enabled: true,
          preset: 'full_stealth' as const,
          typeA: { ...FULL_STEALTH_TYPE_A },
          typeB: {
            ...selectedApp.typeB,
            spoofFingerprint: true,
            spoofSecurityPatch: true,
            spoofBuildDisplay: true,
            spoofCmdline: true,
            spoofKernel: true,
          }
        };
        setResult(runIntegrityVerification(updated, lang));
      }
    }, 150);
  };

  const handleRunTest = () => {
    if (!selectedApp) return;
    setIsRunning(true);
    setProgressStep(1);

    setTimeout(() => setProgressStep(2), 350);
    setTimeout(() => setProgressStep(3), 700);
    setTimeout(() => setProgressStep(4), 1050);

    setTimeout(() => {
      const res = runIntegrityVerification(selectedApp, lang);
      setResult(res);
      setIsRunning(false);
      setProgressStep(0);
    }, 1400);
  };

  const handleApplyFullStealth = () => {
    if (!selectedApp) return;

    setApps(prevApps => 
      prevApps.map(app => {
        if (app.id === selectedApp.id) {
          return {
            ...app,
            enabled: true,
            preset: 'full_stealth',
            typeA: { ...FULL_STEALTH_TYPE_A },
            typeB: {
              ...app.typeB,
              spoofFingerprint: true,
              spoofSecurityPatch: true,
              spoofBuildDisplay: true,
              spoofCmdline: true,
              spoofKernel: true,
            }
          };
        }
        return app;
      })
    );

    // Re-verify immediately with full stealth
    setTimeout(() => {
      const updatedApp = {
        ...selectedApp,
        enabled: true,
        preset: 'full_stealth' as const,
        typeA: { ...FULL_STEALTH_TYPE_A },
        typeB: {
          ...selectedApp.typeB,
          spoofFingerprint: true,
          spoofSecurityPatch: true,
          spoofBuildDisplay: true,
          spoofCmdline: true,
          spoofKernel: true,
        }
      };
      setResult(runIntegrityVerification(updatedApp, lang));
    }, 100);
  };

  const handleCopyLogs = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.logs.join('\n'));
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const isAllPassed = result && result.meetsBasicIntegrity && result.meetsDeviceIntegrity;

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card: Selector & Run Action */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/30 border border-zinc-800 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
                {t.integrity.title}
              </h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              {t.integrity.subtitle}
            </p>
          </div>

          {/* Target App Dropdown Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative min-w-[240px]">
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                {t.integrity.selectAppLabel}
              </label>
              <div className="relative">
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  disabled={isRunning}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-medium text-zinc-200 focus:outline-none focus:border-emerald-500 pr-9 transition-colors cursor-pointer"
                >
                  {apps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.id})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Run Verification & Protection Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <button
                onClick={() => setIsHierarchyModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title={isId ? 'Lihat 5 lapisan arsitektur proteksi Zygisk Chameleon' : 'View 5-layer system protection architecture'}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isId ? 'Lapisan Arsitektur' : 'Architecture'}</span>
              </button>

              <button
                onClick={handleActivateFullProtection}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                title={isId ? 'Terapkan profil proteksi lengkap ke seluruh aplikasi' : 'Apply full protection profile to all apps'}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isId ? 'Proteksi Lengkap' : 'Full Protection'}</span>
              </button>

              <button
                onClick={handleRunTest}
                disabled={isRunning}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>{t.integrity.testingBtn}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>{t.integrity.runTestBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Selected App Configuration Context Indicator */}
        {selectedApp && (
          <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-zinc-400">Target:</span>
              <span className="font-semibold text-zinc-200">{selectedApp.name}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">{selectedApp.id}</span>
              <span className="text-zinc-600">•</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                selectedApp.enabled && selectedApp.preset === 'full_stealth'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : selectedApp.preset === 'bypass'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              }`}>
                {selectedApp.preset.toUpperCase()}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">
                Emulating {selectedApp.targetBrand} Android {selectedApp.targetAndroid}
              </span>
            </div>

            {result && (
              <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>{t.integrity.lastTested} {result.timestamp}</span>
              </div>
            )}
          </div>
        )}

        {/* Realtime Progress Steps during scan */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2"
            >
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-400 rounded-full"
                    initial={{ width: '10%' }}
                    animate={{ 
                      width: progressStep === 1 ? '30%' : progressStep === 2 ? '65%' : progressStep === 3 ? '85%' : '100%' 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-[11px] font-mono text-emerald-400 animate-pulse">
                  {progressStep === 1 && 'Step 1/4: Inspecting kernel mount namespace & umount2(MNT_DETACH) tables...'}
                  {progressStep === 2 && 'Step 2/4: Probing direct assembly SVC #0 openat syscall traps...'}
                  {progressStep === 3 && 'Step 3/4: Sanitizing /proc/self/maps memory addresses & stack trace frames...'}
                  {progressStep === 4 && 'Step 4/4: Generating and signing Google Play Integrity attestation token...'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keybox TEE StrongBox & Live Syscall Monitor Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-zinc-100">
                {isId ? 'Status Sertifikat Keybox TEE & StrongBox Hardware' : 'Keybox TEE & StrongBox Hardware Status'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                CRL: UNREVOKED ✓
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-bold">
                STRONG INTEGRITY READY
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {isId 
                ? 'Keybox format TrickyStore aktif: OEM Google Pixel 8 Pro StrongBox (ECDSA P-256). Lolos verifikasi CRL Google tanpa pemblokiran massal.' 
                : 'Active TrickyStore Keybox: OEM Google Pixel 8 Pro StrongBox (ECDSA P-256). Cleared Google CRL verification without mass revocation.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setIsKeyboxModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isId ? 'Manajer Keybox XML' : 'Keybox XML Manager'}</span>
          </button>
          <button
            onClick={() => setIsLiveSyscallOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isId ? 'Live Syscall Streamer' : 'Live Syscall Streamer'}</span>
          </button>
        </div>
      </div>

      {/* Main Overall Verdict Banner */}
      {result && (
        <div className={`p-6 rounded-2xl border relative overflow-hidden shadow-xl transition-all ${
          isAllPassed
            ? 'bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border-emerald-500/40 shadow-emerald-950/30'
            : 'bg-gradient-to-r from-rose-950/40 via-zinc-900 to-zinc-900 border-rose-500/40 shadow-rose-950/30'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${
                isAllPassed 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {isAllPassed ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <AlertTriangle className="w-8 h-8" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`text-base font-bold tracking-tight ${
                    isAllPassed ? 'text-emerald-300' : 'text-rose-300'
                  }`}>
                    {isAllPassed ? t.integrity.passedTitle : t.integrity.failedTitle}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isAllPassed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {isAllPassed ? 'PASS (100%)' : 'DETECTION RISK'}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
                  {isAllPassed ? t.integrity.passedDesc : t.integrity.failedDesc}
                </p>
              </div>
            </div>

            {/* Quick Auto-Fix Action if failed */}
            {!isAllPassed && (
              <button
                onClick={handleApplyFullStealth}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.integrity.fixStealthBtn}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Dual Verdicts Grid: Play Integrity API + SafetyNet */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* 1. Google Play Integrity API Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  {t.integrity.verdictTitle}
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                Official API v1
              </span>
            </div>

            <div className="space-y-3">
              {/* Verdict 1: MEETS_BASIC_INTEGRITY */}
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-100">
                      {t.integrity.meetsBasic}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    {t.integrity.meetsBasicDesc}
                  </p>
                </div>
                {result.meetsBasicIntegrity ? (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                    PASS
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 shrink-0">
                    <XCircle className="w-3.5 h-3.5" />
                    FAIL
                  </span>
                )}
              </div>

              {/* Verdict 2: MEETS_DEVICE_INTEGRITY */}
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-100">
                      {t.integrity.meetsDevice}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    {t.integrity.meetsDeviceDesc}
                  </p>
                </div>
                {result.meetsDeviceIntegrity ? (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                    PASS
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 shrink-0">
                    <XCircle className="w-3.5 h-3.5" />
                    FAIL
                  </span>
                )}
              </div>

              {/* Verdict 3: MEETS_STRONG_INTEGRITY */}
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-100">
                      {t.integrity.meetsStrong}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    {t.integrity.meetsStrongDesc}
                  </p>
                </div>
                {result.meetsStrongIntegrity ? (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                    PASS
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    OPTIONAL
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Legacy SafetyNet Attestation Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  {t.integrity.safetyNetTitle}
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                Legacy Mode
              </span>
            </div>

            <div className="space-y-3">
              {/* SafetyNet 1: basicIntegrity */}
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-mono font-bold text-zinc-100">
                    basicIntegrity
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    {t.integrity.safetyNetBasicDesc}
                  </p>
                </div>
                {result.legacyBasicIntegrity ? (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                    true
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 shrink-0">
                    <XCircle className="w-3.5 h-3.5" />
                    false
                  </span>
                )}
              </div>

              {/* SafetyNet 2: ctsProfileMatch */}
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-mono font-bold text-zinc-100">
                    ctsProfileMatch
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    {t.integrity.safetyNetCtsDesc}
                  </p>
                </div>
                {result.legacyCtsProfileMatch ? (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                    true
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 shrink-0">
                    <XCircle className="w-3.5 h-3.5" />
                    false
                  </span>
                )}
              </div>

              {/* SafetyNet 3: evaluationType */}
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-mono font-bold text-zinc-100">
                    evaluationType
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    {t.integrity.safetyNetEvalDesc}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                  {result.evaluationType}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RASP & Kernel Sandbox Live Stress-Tester */}
      {selectedApp && (
        <ApexSandboxTester 
          app={selectedApp} 
          lang={lang} 
          onActivateApexGodmode={handleActivateFullProtection} 
        />
      )}

      {/* 8-Vector In-Depth Diagnostics Table */}
      {result && (
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                {t.integrity.diagnosticTitle}
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {result.diagnostics.filter(d => d.status === 'pass').length} / {result.diagnostics.length} Passed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.diagnostics.map((diag) => {
              const isPass = diag.status === 'pass';
              const isFail = diag.status === 'fail';
              const isWarn = diag.status === 'warn';

              return (
                <div
                  key={diag.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                    isPass
                      ? 'bg-zinc-950/60 border-zinc-800/80'
                      : isFail
                      ? 'bg-rose-950/20 border-rose-800/40'
                      : 'bg-amber-950/20 border-amber-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          diag.category === 'kernel'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : diag.category === 'native'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : diag.category === 'identity'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}>
                          {diag.category}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-200">
                          {diag.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {diag.detail}
                      </p>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {isPass && (
                        <span className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400 inline-flex">
                          <Check className="w-4 h-4" />
                        </span>
                      )}
                      {isFail && (
                        <span className="p-1 rounded-lg bg-rose-500/15 text-rose-400 inline-flex">
                          <XCircle className="w-4 h-4" />
                        </span>
                      )}
                      {isWarn && (
                        <span className="p-1 rounded-lg bg-amber-500/15 text-amber-400 inline-flex">
                          <AlertTriangle className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>

                  {diag.recommendation && (
                    <div className="pt-2 border-t border-zinc-800/60 text-[10px] font-mono text-amber-300/90 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{diag.recommendation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Terminal Diagnostic Logs */}
      {result && (
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                {t.integrity.terminalTitle}
              </h3>
            </div>
            <button
              onClick={handleCopyLogs}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] font-mono border border-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLogs ? (
                <>
                  <CheckCheck className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">{lang === 'id' ? 'Tersalin' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <span>{lang === 'id' ? 'Salin Log' : 'Copy Logs'}</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 font-mono text-[11px] text-zinc-400 leading-relaxed overflow-x-auto max-h-52 space-y-1">
            {result.logs.map((line, idx) => {
              const isPass = line.includes('[PASS]');
              const isFail = line.includes('[FAIL]');
              const isWarn = line.includes('[WARN]');

              return (
                <div
                  key={idx}
                  className={
                    isPass
                      ? 'text-emerald-400'
                      : isFail
                      ? 'text-rose-400 font-semibold'
                      : isWarn
                      ? 'text-amber-400'
                      : 'text-zinc-400'
                  }
                >
                  {line}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* System Architecture & Protection Hierarchy Modal */}
      <ApexHierarchyModal
        isOpen={isHierarchyModalOpen}
        onClose={() => setIsHierarchyModalOpen(false)}
        lang={lang}
        onActivateApexGodmode={handleActivateFullProtection}
        appsCount={apps.length}
      />

      {/* Keybox & TEE Certificate Health Modal */}
      {isKeyboxModalOpen && (
        <KeyboxHealthModal
          isOpen={isKeyboxModalOpen}
          onClose={() => setIsKeyboxModalOpen(false)}
          lang={lang}
        />
      )}

      {/* Live Syscall & RASP Interception Streamer Modal */}
      {isLiveSyscallOpen && (
        <LiveSyscallMonitorModal
          isOpen={isLiveSyscallOpen}
          onClose={() => setIsLiveSyscallOpen(false)}
          lang={lang}
          apps={apps}
        />
      )}

    </div>
  );
};
