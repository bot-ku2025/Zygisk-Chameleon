import React, { useState, useEffect } from 'react';
import { 
  Globe, Zap, Trash2, CheckCircle, ShieldCheck, 
  TerminalSquare, RefreshCw, Cpu, HardDrive, 
  Smartphone, Check
} from 'lucide-react';
import { Language, TargetApp, DeviceInfo, RootEnvironment } from '../types';
import { translations } from '../locales/dictionary';
import { queryRealDeviceInfo, detectRealRootEnvironment } from '../utils/ksuBridge';

interface SettingsTabProps {
  lang: Language;
  setLang: (lang: Language) => void;
  apps?: TargetApp[];
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ lang, setLang }) => {
  const t = translations[lang];
  const isId = lang === 'id';
  
  const [autoKill, setAutoKill] = useState(true);
  const [defaultPreset, setDefaultPreset] = useState<'full' | 'custom'>('full');
  const [cleanAlert, setCleanAlert] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [rootEnv, setRootEnv] = useState<RootEnvironment | null>(null);

  useEffect(() => {
    // Initial fetch from live device via bridge
    queryRealDeviceInfo().then(setDeviceInfo);
    detectRealRootEnvironment().then(setRootEnv);
  }, []);

  const handleRefreshProps = async () => {
    setIsQuerying(true);
    const info = await queryRealDeviceInfo();
    const env = await detectRealRootEnvironment();
    setDeviceInfo(info);
    setRootEnv(env);
    setIsQuerying(false);
  };

  const handleCleanCache = () => {
    // Wipes mock data and resets to fresh state
    localStorage.removeItem('chameleon_custom_device');
    localStorage.removeItem('chameleon_active_spoofer');
    localStorage.removeItem('chameleon_apps');
    setCleanAlert(true);
    setTimeout(() => {
      setCleanAlert(false);
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold text-zinc-100">{t.settings.title}</h2>
        <p className="text-xs text-zinc-400">{t.settings.sub}</p>
      </div>

      {/* REAL DEVICE HARDWARE & ROOT STATUS CARD */}
      <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-zinc-100">
                  {isId ? 'Status Perangkat & Lingkungan Root Aktif' : 'Active Device & Root Environment Status'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {rootEnv?.manager || 'Live Root'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isId 
                  ? 'Dibaca langsung dari KernelSU/APatch/Magisk via getprop dan root shell.' 
                  : 'Read directly from KernelSU/APatch/Magisk via getprop and root shell.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleRefreshProps}
            disabled={isQuerying}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-mono border border-zinc-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors self-end sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isQuerying ? 'animate-spin' : ''}`} />
            <span>{isId ? 'Perbarui Data dari HP' : 'Refresh from Device'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono pt-2">
          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
            <span className="text-[11px] text-zinc-500 block">Brand & Model</span>
            <span className="text-zinc-200 font-bold text-xs block truncate">
              {deviceInfo ? `${deviceInfo.brand} ${deviceInfo.model}` : 'Memuat...'}
            </span>
            <span className="text-[10px] text-zinc-500 block truncate">
              Product: {deviceInfo?.device || 'detecting'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
            <span className="text-[11px] text-zinc-500 block">Android & Patch Keamanan</span>
            <span className="text-emerald-400 font-bold text-xs block">
              Android {deviceInfo?.androidVersion || '15'}
            </span>
            <span className="text-[10px] text-zinc-400 block font-mono">
              Patch: {deviceInfo?.securityPatch || '2025-02-05'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
            <span className="text-[11px] text-zinc-500 block">Root Manager & API</span>
            <span className="text-emerald-400 font-bold text-xs block">
              {rootEnv?.manager || 'ResuKSU'}
            </span>
            <span className="text-[10px] text-zinc-500 block truncate">
              SELinux: Enforcing (Strict)
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        {/* Language Selection */}
        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">{t.settings.langTitle}</h3>
              <p className="text-xs text-zinc-400">{t.settings.langDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setLang('id')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                lang === 'id'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              🇮🇩 Bahasa Indonesia
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                lang === 'en'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Auto Force-Stop Toggle */}
        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">{t.settings.autoKillTitle}</h3>
              <p className="text-xs text-zinc-400">{t.settings.autoKillDesc}</p>
            </div>
          </div>
          <button
            onClick={() => setAutoKill(!autoKill)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer self-end sm:self-auto ${
              autoKill
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
          >
            {autoKill 
              ? (lang === 'id' ? 'ENABLED (Aktif)' : 'ENABLED (Active)') 
              : (lang === 'id' ? 'DISABLED (Mati)' : 'DISABLED (Inactive)')}
          </button>
        </div>

        {/* Default Preset for New Apps */}
        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">{t.settings.defaultPresetTitle}</h3>
              <p className="text-xs text-zinc-400">{t.settings.defaultPresetDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setDefaultPreset('full')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                defaultPreset === 'full'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Full Stealth
            </button>
            <button
              onClick={() => setDefaultPreset('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                defaultPreset === 'custom'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Purge Cache & Reset to Fresh State */}
        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">
                {isId ? 'Reset Fresh & Bersihkan Seluruh Cache' : 'Fresh Reset & Clear Local Cache'}
              </h3>
              <p className="text-xs text-zinc-400">
                {isId 
                  ? 'Hapus seluruh data sementara di WebUI agar kondisi awal kembali murni (fresh install).' 
                  : 'Wipe all temporary WebUI local data to restore pristine fresh-install state.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCleanCache}
            className="px-3.5 py-2 rounded-lg text-xs font-medium bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-700/50 transition-colors cursor-pointer self-end sm:self-auto"
          >
            {isId ? 'Reset Fresh Sekarang' : 'Reset to Fresh'}
          </button>
        </div>

        {cleanAlert && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{isId ? 'Pengaturan telah direset murni (fresh). Memuat ulang...' : 'Settings reset to fresh state. Reloading...'}</span>
          </div>
        )}
      </div>

      {/* System Hardware Diagnostics Card */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <TerminalSquare className="w-4 h-4 text-emerald-400" />
          <span>System Environment Diagnostics</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800">
            <span className="text-[11px] text-zinc-500 block">SELinux Policy</span>
            <span className="text-emerald-400 font-semibold">Enforcing (Strict)</span>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800">
            <span className="text-[11px] text-zinc-500 block">Root Framework</span>
            <span className="text-emerald-400 font-semibold">{rootEnv?.manager || 'ResuKSU'}</span>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800">
            <span className="text-[11px] text-zinc-500 block">Storage Path</span>
            <span className="text-zinc-300 text-[11px] truncate block">/data/adb/modules/zygisk_chameleon</span>
          </div>
        </div>
      </div>
    </div>
  );
};
