import React, { useState } from 'react';
import { 
  ShieldCheck, Cpu, WifiOff, Globe, Sparkles, Radio, Smartphone, 
  RefreshCw, ChevronDown, ChevronUp, Layers, Sliders
} from 'lucide-react';
import { Language, TabType, RootEnvironment, ExternalSpooferState, OtaCelahUpdateState, SpooferSourceType, RootModule } from '../types';
import { translations } from '../locales/dictionary';
import { ModuleAccessModal } from './ModuleAccessModal';
import { APP_VERSION } from '../data/version';
import { queryRealDeviceInfo } from '../utils/ksuBridge';
import logoImg from '../assets/images/natural_chameleon_logo_1788962639417.jpg';

interface UnifiedHeaderProps {
  currentTab: TabType;
  setTab: (tab: TabType) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  rootEnv: RootEnvironment;
  spooferState: ExternalSpooferState;
  setSpooferState: React.Dispatch<React.SetStateAction<ExternalSpooferState>>;
  otaState: OtaCelahUpdateState;
  onOpenOtaModal: () => void;
  modules: RootModule[];
  setModules: React.Dispatch<React.SetStateAction<RootModule[]>>;
}

export const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  currentTab,
  setTab,
  lang,
  setLang,
  rootEnv,
  spooferState,
  setSpooferState,
  otaState,
  onOpenOtaModal,
  modules,
  setModules,
}) => {
  const t = translations[lang];
  const isId = lang === 'id';
  const [isHarmonizing, setIsHarmonizing] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isModulesExpanded, setIsModulesExpanded] = useState(false);
  const [selectedModule, setSelectedModule] = useState<RootModule | null>(null);

  const activeModulesCount = modules.filter((m) => m.enabled).length;

  const handleToggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((mod) => (mod.id === id ? { ...mod, enabled: !mod.enabled } : mod))
    );
  };

  const handleUpdateFile = (moduleId: string, filename: string, newContent: string) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return {
          ...mod,
          configFiles: mod.configFiles.map((cf) =>
            cf.filename === filename ? { ...cf, content: newContent } : cf
          ),
        };
      })
    );
  };

  const getSpooferBadgeLabel = () => {
    if (spooferState.source === 'internal') {
      return isId ? '- Mode Mandiri (Chameleon Core) -' : '- Chameleon Standalone Mode -';
    }
    return isId 
      ? `- ${spooferState.sourceName} (Aktif Digunakan) -` 
      : `- ${spooferState.sourceName} (Active In-Use) -`;
  };

  const handleToggleSpooferMode = async () => {
    setIsHarmonizing(true);
    const syncTime = isId ? 'Baru saja' : 'Just now';
    try {
      const liveInfo = await queryRealDeviceInfo();
      setSpooferState((prev) => ({
        ...prev,
        source: 'internal',
        sourceName: 'Zygisk Chameleon Standalone Engine',
        isDetected: false,
        detectedPackage: 'zygisk_chameleon_core',
        detectedVersion: `${APP_VERSION} (Native Generator)`,
        interceptedBrand: (liveInfo.brand as any) || prev.interceptedBrand || 'Xiaomi',
        interceptedModel: liveInfo.model || prev.interceptedModel || 'Live Device',
        interceptedAndroid: (liveInfo.androidVersion as any) || prev.interceptedAndroid || '14',
        interceptedImeiMasked: isId ? 'Hardware Salted Invariant' : 'Hardware Salted Invariant',
        interceptedAndroidId: 'Hardware Salted ID',
        isHarmonized: true,
        lastSyncTimestamp: syncTime,
      }));
    } catch {
      setSpooferState((prev) => ({
        ...prev,
        source: 'internal',
        sourceName: 'Zygisk Chameleon Standalone Engine',
        isHarmonized: true,
        lastSyncTimestamp: syncTime,
      }));
    } finally {
      setIsHarmonizing(false);
    }
  };

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md sticky top-0 z-40 shadow-xl pt-[max(0.6rem,env(safe-area-inset-top,0px))] pl-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))]">
      <div className="max-w-6xl mx-auto px-4 py-2.5 space-y-2.5">
        
        {/* ROW 1: Brand & Core Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <img
                src={logoImg}
                alt="Zygisk Chameleon Logo"
                className="w-9 h-9 rounded-xl object-cover border border-emerald-500/40 shadow-md shadow-emerald-950/40"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-zinc-950"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-zinc-100 tracking-tight flex items-center gap-1.5">
                  Zygisk Chameleon
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {APP_VERSION}
                  </span>
                </h1>
                <span className="hidden md:inline-block text-[11px] text-zinc-500">|</span>
                <span className="hidden md:inline-block text-[11px] text-zinc-400 font-mono">
                  {rootEnv.manager} {rootEnv.version} (SELinux: {rootEnv.selinux})
                </span>
              </div>
            </div>
          </div>

          {/* Top Quick Actions (OTA 24H Button, Spoofer Switcher, Lang) */}
          <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
            {/* 24-Hour OTA Vulnerability Update Button */}
            <button
              onClick={onOpenOtaModal}
              className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
              title="Perbarui database celah online & hot-patching RASP (Siklus 24 Jam)"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{isId ? 'Update Celah (24 Jam)' : 'OTA Update (24H)'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-ping" />
            </button>

            {/* Toggle Mode Mandiri vs Spoofer Aktif Sistem */}
            <button
              onClick={handleToggleSpooferMode}
              disabled={isHarmonizing}
              className="px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-medium text-zinc-300 hover:text-zinc-100 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title={
                spooferState.source === 'internal'
                  ? (isId ? 'Gunakan spoofer sistem yang aktif (Sentinel.apk)' : 'Use active system spoofer (Sentinel.apk)')
                  : (isId ? 'Beralih ke Mode Mandiri (Zygisk Chameleon)' : 'Switch to Standalone Mode (Zygisk Chameleon)')
              }
            >
              {spooferState.source === 'internal' ? (
                <>
                  <Radio className={`w-3 h-3 text-emerald-400 ${isHarmonizing ? 'animate-spin' : ''}`} />
                  <span className="hidden xs:inline">{isId ? 'Gunakan Sistem' : 'Use System'}</span>
                </>
              ) : (
                <>
                  <Cpu className={`w-3 h-3 text-emerald-400 ${isHarmonizing ? 'animate-spin' : ''}`} />
                  <span className="hidden xs:inline">{isId ? 'Mode Mandiri' : 'Standalone'}</span>
                </>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 text-xs font-medium transition-colors cursor-pointer"
              title="Ganti Bahasa / Switch Language"
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>{lang === 'id' ? 'ID' : 'EN'}</span>
            </button>
          </div>
        </div>

        {/* ROW 2: Compact Unified Status Strip (Root Manager & Active Spoofer Results & Installed Modules Trigger) */}
        <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-2 sm:px-3 sm:py-2 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-2 shadow-inner">
          <div className="flex flex-wrap items-center gap-2">
            {/* Active Spoofer Badge requested by user */}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono tracking-wide bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              {getSpooferBadgeLabel()}
            </span>

            {/* Target Hardware Profile */}
            <div className="flex items-center gap-1.5 text-zinc-300 font-sans">
              <Smartphone className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-400">{isId ? 'Target:' : 'Target:'}</span>
              <strong className="text-zinc-100 font-medium">
                {spooferState.interceptedBrand} {spooferState.interceptedModel}
              </strong>
              <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] font-mono text-emerald-400">
                Android {spooferState.interceptedAndroid}
              </span>
            </div>

            {/* Status Invariant */}
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              100% Invariant
            </span>

            {/* Modul Terpasang Quick Pill in Top Header Bar */}
            <button
              onClick={() => setIsModulesExpanded(!isModulesExpanded)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                isModulesExpanded 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 shadow-sm' 
                  : 'bg-zinc-800/90 text-zinc-300 border-zinc-700 hover:border-emerald-500/40 hover:text-emerald-300'
              }`}
              title={isId ? 'Klik untuk membuka/menutup daftar modul terpasang di KernelSU' : 'Click to toggle installed KernelSU modules list'}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isId ? 'Modul Terpasang:' : 'Installed Modules:'}</span>
              <span className="px-1.5 py-0.1 rounded bg-zinc-900 text-emerald-400 font-bold">
                {activeModulesCount}/{modules.length}
              </span>
              {isModulesExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Root Manager & Details Toggle */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 self-end md:self-auto">
            <span className="hidden lg:inline text-zinc-500">
              IMEI: <span className="text-zinc-300">{spooferState.interceptedImeiMasked}</span>
            </span>
            <span className="hidden lg:inline text-zinc-600">•</span>
            <span className="text-zinc-300 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-emerald-400" />
              {rootEnv.manager} Granted ✓
            </span>

            <button
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="ml-1 p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-0.5 text-[10px] font-sans cursor-pointer"
              title={isId ? 'Lihat rincian environment & identitas' : 'View environment & identity details'}
            >
              <span>{isDetailsExpanded ? (isId ? 'Tutup' : 'Close') : (isId ? 'Detail' : 'Details')}</span>
              {isDetailsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Expandable Mini Drawer for Root & Spoof Details */}
        {isDetailsExpanded && (
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[11px] font-mono grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-zinc-300 animate-fadeIn">
            <div>
              <span className="text-zinc-500 block text-[10px]">Root Environment:</span>
              <span className="text-emerald-400 font-semibold">{rootEnv.manager} {rootEnv.version}</span>
              <span className="text-zinc-500 block text-[10px]">Path: {rootEnv.suPath}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">SELinux & Kernel:</span>
              <span className="text-zinc-200">{rootEnv.selinux} / GKI Safe</span>
              <span className="text-zinc-500 block text-[10px]">Zero-Bootloop: Active ✓</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Android ID:</span>
              <span className="text-zinc-200">{spooferState.interceptedAndroidId}</span>
              <span className="text-zinc-500 block text-[10px]">Package: {spooferState.detectedPackage}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">{isId ? 'Status Database Celah:' : 'Vulnerability Database:'}</span>
              <span className="text-emerald-400 font-semibold">{otaState.version}</span>
              <span className="text-zinc-500 block text-[10px]">{isId ? 'OTA Sync: 24 Jam Otomatis' : 'OTA Sync: 24H Automatic'}</span>
            </div>
          </div>
        )}

        {/* Expandable Clean Drawer for Installed Modules (Neatly arranged at top) */}
        {isModulesExpanded && (
          <div className="p-3 sm:p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 text-xs shadow-2xl animate-fadeIn space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
              <div className="flex items-center gap-2 font-mono">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-zinc-100">{isId ? 'MODUL TERPASANG DI KERNELSU' : 'INSTALLED KERNELSU MODULES'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                  /data/adb/modules ({activeModulesCount} {isId ? 'aktif dari' : 'active of'} {modules.length})
                </span>
              </div>
              <button
                onClick={() => setIsModulesExpanded(false)}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 cursor-pointer"
              >
                {isId ? 'Tutup Modul ▲' : 'Close Modules ▲'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {modules.map((mod) => (
                <div
                  key={mod.id}
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
                    mod.enabled
                      ? 'bg-zinc-900/90 border-zinc-800 hover:border-emerald-500/40 shadow-sm'
                      : 'bg-zinc-950/70 border-zinc-800/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          mod.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                        }`}
                      />
                      <span className="font-bold text-xs text-zinc-100">{mod.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 font-mono text-emerald-400 border border-zinc-700">
                        {mod.version}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleModule(mod.id)}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-medium border transition-colors cursor-pointer ${
                        mod.enabled
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800/50'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {mod.enabled ? (isId ? 'AKTIF' : 'ACTIVE') : (isId ? 'NONAKTIF' : 'INACTIVE')}
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-400 line-clamp-1 mb-2">
                    {mod.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-800/60">
                    <span className="truncate max-w-[130px] text-zinc-400">{isId ? 'Oleh:' : 'By:'} {mod.author}</span>
                    <div className="flex items-center gap-1.5">
                      {mod.id === 'playintegrity_fix' && (
                        <button
                          onClick={() => {
                            setTab('integrity');
                            setIsModulesExpanded(false);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800/50 flex items-center gap-1 cursor-pointer"
                        >
                          <ShieldCheck className="w-3 h-3 text-blue-400" />
                          <span>{isId ? 'Cek Status' : 'Check Status'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedModule(mod)}
                        className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Sliders className="w-3 h-3 text-emerald-400" />
                        <span>{isId ? 'Akses Modul' : 'Access Module'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROW 3: Navigation Tabs */}
        <nav className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setTab('apps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'apps'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.tabs.apps}</span>
          </button>

          <button
            onClick={() => setTab('integrity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'integrity'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.tabs.integrity}</span>
          </button>

          <button
            onClick={() => setTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            {t.tabs.settings}
          </button>

          <button
            onClick={() => setTab('about')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentTab === 'about'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            {t.tabs.about}
          </button>
        </nav>
      </div>

      {/* Interactive Module Access Modal */}
      {selectedModule && (
        <ModuleAccessModal
          module={selectedModule}
          lang={lang}
          onClose={() => setSelectedModule(null)}
          onToggleEnable={handleToggleModule}
          onUpdateFile={handleUpdateFile}
        />
      )}
    </header>
  );
};
