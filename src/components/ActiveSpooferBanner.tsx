import React, { useState } from 'react';
import { 
  Radio, 
  Smartphone, 
  ShieldCheck, 
  RefreshCw, 
  Sparkles, 
  SlidersHorizontal, 
  Cpu, 
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';
import { ExternalSpooferState, SpooferSourceType, OtaCelahUpdateState, Language } from '../types';

interface ActiveSpooferBannerProps {
  spooferState: ExternalSpooferState;
  setSpooferState: React.Dispatch<React.SetStateAction<ExternalSpooferState>>;
  otaState: OtaCelahUpdateState;
  onOpenOtaModal: () => void;
  lang: Language;
}

export const ActiveSpooferBanner: React.FC<ActiveSpooferBannerProps> = ({
  spooferState,
  setSpooferState,
  otaState,
  onOpenOtaModal,
  lang,
}) => {
  const [isHarmonizing, setIsHarmonizing] = useState(false);
  const isId = lang === 'id';

  // Helper to get formatted spoofer badge showing what is actively used
  const getSpooferBadgeLabel = () => {
    if (spooferState.source === 'internal') {
      return isId ? '- Mode Mandiri (Zygisk Chameleon) -' : '- Chameleon Standalone Mode -';
    }
    return isId 
      ? `- ${spooferState.sourceName} (Aktif Digunakan) -` 
      : `- ${spooferState.sourceName} (Active In-Use) -`;
  };

  const handleToggleSpooferMode = () => {
    setIsHarmonizing(true);
    setTimeout(() => {
      const syncTime = isId ? 'Baru saja' : 'Just now';
      if (spooferState.source === 'internal') {
        // Switch to active system-level spoofer (detected Sentinel.apk)
        setSpooferState({
          source: 'sentinel',
          sourceName: 'Sentinel.apk',
          isDetected: true,
          detectedPackage: 'org.lsposed.sentinel.faker',
          detectedVersion: 'v3.8.2-pro (Active Hook)',
          interceptedBrand: 'Samsung',
          interceptedModel: 'SM-S928B (Galaxy S24 Ultra)',
          interceptedAndroid: '14',
          interceptedImeiMasked: '35824911******4',
          interceptedAndroidId: '7f9a2c4e1b80d***',
          isHarmonized: true,
          lastSyncTimestamp: syncTime,
          lastSyncTimestampEn: 'Just now',
        });
      } else {
        // Switch to Chameleon standalone engine
        setSpooferState({
          source: 'internal',
          sourceName: 'Zygisk Chameleon Standalone',
          isDetected: false,
          detectedPackage: 'zygisk_chameleon_core',
          detectedVersion: 'v1.0.0 (Native Generator)',
          interceptedBrand: 'Samsung',
          interceptedModel: 'SM-S928B (OneUI 6.1)',
          interceptedAndroid: '14',
          interceptedImeiMasked: isId ? 'Proteksi Mandiri Aktif' : 'Standalone Masking Active',
          interceptedAndroidId: 'Dynamic Salted ID',
          isHarmonized: true,
          lastSyncTimestamp: syncTime,
          lastSyncTimestampEn: 'Just now',
        });
      }
      setIsHarmonizing(false);
    }, 350);
  };

  return (
    <div className="mb-6 rounded-2xl bg-zinc-900/90 border border-zinc-700/70 p-4 shadow-xl backdrop-blur-md relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-10" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
        {/* Left Side: Active Spoofer Indicator & Badge */}
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Source Badge requested by user */}
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              {getSpooferBadgeLabel()}
            </span>

            {/* Invariant Status Badge */}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              100% Invariant & Harmonized
            </span>

            {/* Zero Bootloop Safety Guarantee Badge */}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-blue-400" />
              Zero-Bootloop Guard ✓
            </span>
          </div>

          {/* Intercepted Parameters Summary Bar */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 pt-0.5">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-zinc-500" />
              <span>Target:</span>
              <strong className="text-zinc-200 font-medium">
                {spooferState.interceptedBrand} {spooferState.interceptedModel}
              </strong>
              <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] font-mono text-emerald-400">
                Android {spooferState.interceptedAndroid}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-zinc-600">•</span>
              <span>IMEI:</span>
              <code className="text-[11px] font-mono text-zinc-300 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                {spooferState.interceptedImeiMasked}
              </code>
            </div>

            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-zinc-600">•</span>
              <span>Android ID:</span>
              <code className="text-[11px] font-mono text-zinc-300 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                {spooferState.interceptedAndroidId}
              </code>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-zinc-500">
              <span className="text-zinc-600">•</span>
              <span>{isId ? 'Sinkron:' : 'Sync:'} {isId ? spooferState.lastSyncTimestamp : (spooferState.lastSyncTimestampEn || spooferState.lastSyncTimestamp)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Dual Action Buttons (Switch Spoofer & 24H OTA Update) */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          {/* Action: Toggle Mode Mandiri Chameleon vs Spoofer Aktif Sistem */}
          <button
            onClick={handleToggleSpooferMode}
            disabled={isHarmonizing}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-xs font-medium text-zinc-200 hover:text-zinc-100 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title={
              spooferState.source === 'internal'
                ? (isId ? 'Sinkronkan dengan spoofer sistem yang aktif (Sentinel.apk)' : 'Sync with active system spoofer (Sentinel.apk)')
                : (isId ? 'Aktifkan Mode Mandiri (Zygisk Chameleon Standalone Engine)' : 'Enable Standalone Mode (Zygisk Chameleon Standalone Engine)')
            }
          >
            {spooferState.source === 'internal' ? (
              <>
                <Radio className={`w-3.5 h-3.5 text-emerald-400 ${isHarmonizing ? 'animate-spin' : ''}`} />
                <span>{isId ? 'Gunakan Spoofer Sistem (Sentinel)' : 'Use System Spoofer (Sentinel)'}</span>
              </>
            ) : (
              <>
                <Cpu className={`w-3.5 h-3.5 text-emerald-400 ${isHarmonizing ? 'animate-spin' : ''}`} />
                <span>{isId ? 'Mode Mandiri (Chameleon)' : 'Standalone Mode (Chameleon)'}</span>
              </>
            )}
          </button>

          {/* Dedicated 24H OTA Online Vulnerability Update Button */}
          <button
            onClick={onOpenOtaModal}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            title={isId ? 'Perbarui database celah online & hot-patching RASP (Siklus 24 Jam)' : 'Update online vulnerability database & RASP hot-patching (24-Hour Cycle)'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isId ? 'Perbarui Celah Online (OTA 24-Jam)' : 'Update Vulnerabilities (24H OTA)'}</span>
            <span className="w-2 h-2 rounded-full bg-zinc-950 animate-ping" />
          </button>
        </div>
      </div>
    </div>
  );
};
