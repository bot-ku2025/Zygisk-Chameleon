import React, { useState } from 'react';
import { 
  X, Check, Shield, Cpu, Sparkles, Terminal, RotateCcw, 
  Layers, Lock, Sliders, ToggleLeft, ToggleRight, Smartphone, AlertCircle,
  ShieldCheck, CheckCircle2, XCircle, Zap, Search, Activity
} from 'lucide-react';
import { TargetApp, Language, IntegrityVerdictResult, ExternalSpooferState, OtaCelahUpdateState, AppPresetType } from '../types';
import { translations } from '../locales/dictionary';
import { generateSmartProfile } from '../utils/generator';
import { runIntegrityVerification } from '../utils/integrityVerifier';
import { AppIcon } from './AppIcon';
import { 
  FULL_STEALTH_TYPE_A, 
  BYPASS_TYPE_A,
  BCA_EXTREME_TYPE_A,
  MANDIRI_LIVIN_TYPE_A,
  SHOPEE_SEABANK_TYPE_A,
  BRIMO_JENIUS_TYPE_A,
  STRONGBOX_TEE_TYPE_A
} from '../data/initialApps';
import { RaspSignatureScannerModal } from './RaspSignatureScannerModal';
import { LiveSyscallMonitorModal } from './LiveSyscallMonitorModal';

interface AppConfigModalProps {
  app: TargetApp;
  lang: Language;
  onClose: () => void;
  onSave: (updatedApp: TargetApp) => void;
  spooferState?: ExternalSpooferState;
  otaState?: OtaCelahUpdateState;
  allApps?: TargetApp[];
}

export const AppConfigModal: React.FC<AppConfigModalProps> = ({
  app,
  lang,
  onClose,
  onSave,
  spooferState,
  otaState,
  allApps = [],
}) => {
  const t = translations[lang];
  const isId = lang === 'id';
  const [config, setConfig] = useState<TargetApp>({ ...app });
  const [logOutput, setLogOutput] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [quickTestResult, setQuickTestResult] = useState<IntegrityVerdictResult | null>(null);
  const [isTestingIntegrity, setIsTestingIntegrity] = useState(false);
  const [isRaspScanOpen, setIsRaspScanOpen] = useState(false);
  const [isLiveSyscallOpen, setIsLiveSyscallOpen] = useState(false);

  const handleTestIntegrityNow = () => {
    setIsTestingIntegrity(true);
    setTimeout(() => {
      const res = runIntegrityVerification(config, lang);
      setQuickTestResult(res);
      setIsTestingIntegrity(false);
    }, 450);
  };

  // Synchronize all variables according to the selected Target Android Version & Brand
  const applySmartSync = (androidVer: '13' | '14' | '15' | '16', brand: 'Xiaomi' | 'Samsung' | 'Google') => {
    const profile = generateSmartProfile(androidVer, brand, '4.19.157');
    setConfig((prev) => ({
      ...prev,
      targetAndroid: androidVer,
      targetBrand: brand,
      typeB: {
        ...prev.typeB,
        kernelString: profile.kernelString,
        buildId: profile.buildId,
        buildDisplayId: profile.buildDisplayId,
        sdkVersion: profile.sdkVersion,
        securityPatch: profile.securityPatch,
        fingerprint: profile.fingerprint,
        cmdlineString: profile.cmdlineString,
        installerPackage: profile.installerPackage,
      },
    }));
  };

  const handleSyncAll = () => {
    applySmartSync(config.targetAndroid, config.targetBrand);
  };

  // Generate single field on demand
  const handleGenerateKernel = () => {
    const profile = generateSmartProfile(config.targetAndroid, config.targetBrand, '4.19.157');
    setConfig((prev) => ({
      ...prev,
      typeB: { ...prev.typeB, kernelString: profile.kernelString },
    }));
  };

  const handleGenerateBuildId = () => {
    const profile = generateSmartProfile(config.targetAndroid, config.targetBrand, '4.19.157');
    setConfig((prev) => ({
      ...prev,
      typeB: { ...prev.typeB, buildId: profile.buildId, buildDisplayId: profile.buildDisplayId },
    }));
  };

  const handleGeneratePatch = () => {
    const profile = generateSmartProfile(config.targetAndroid, config.targetBrand, '4.19.157');
    setConfig((prev) => ({
      ...prev,
      typeB: { ...prev.typeB, securityPatch: profile.securityPatch },
    }));
  };

  const handleSaveAndForceStop = () => {
    setIsSaving(true);
    setLogOutput(
      `[CHAMELEON ROOT DAEMON]\n> ${t.apps.terminalLog.saving} /data/adb/modules/zygisk_chameleon/config/${config.id}.json\n> [OK] JSON payload verified.\n> ${t.apps.terminalLog.forceStop} am force-stop ${config.id}\n> [PID: KILL_SUCCESS]\n> ${t.apps.terminalLog.success}`
    );

    setTimeout(() => {
      onSave(config);
      setIsSaving(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-950 border border-emerald-900/40 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <AppIcon appId={config.id} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-zinc-100">{config.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 font-mono text-zinc-400 border border-zinc-700">
                  {config.id}
                </span>
              </div>
              <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                {t.apps.detectedBase}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-zinc-200 text-sm">
          
          {/* Inline Quick Play Integrity & RASP Tools Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsRaspScanOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/60 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Search className="w-3.5 h-3.5 text-rose-400" />
                <span>{isId ? 'Pindai RASP (Deep Scan)' : 'Scan RASP Signatures'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLiveSyscallOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-800/60 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isId ? 'Live Syscall Streamer' : 'Live Syscall Streamer'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleTestIntegrityNow}
              disabled={isTestingIntegrity}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-950/60 hover:bg-blue-900/70 text-blue-300 border border-blue-800/60 flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>{isTestingIntegrity ? (isId ? 'Menguji...' : 'Testing...') : (isId ? 'Uji Cepat Integritas' : 'Quick Integrity Check')}</span>
            </button>
          </div>

          {/* Inline Quick Play Integrity Test Banner */}
          {quickTestResult && (
            <div className={`p-4 rounded-xl border transition-all ${
              quickTestResult.meetsBasicIntegrity && quickTestResult.meetsDeviceIntegrity
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/40'
                : 'bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-950/40'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    quickTestResult.meetsBasicIntegrity && quickTestResult.meetsDeviceIntegrity
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {quickTestResult.meetsBasicIntegrity && quickTestResult.meetsDeviceIntegrity ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-zinc-100">
                        {quickTestResult.meetsBasicIntegrity && quickTestResult.meetsDeviceIntegrity
                          ? (isId ? 'Hasil Verifikasi: Lolos Play Integrity & SafetyNet' : 'Verification Result: Passed Play Integrity & SafetyNet')
                          : (isId ? 'Hasil Verifikasi: Terdeteksi Modifikasi Root' : 'Verification Result: Root Modifications Detected')}
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-400">
                        ({quickTestResult.timestamp})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono pt-1">
                      <span className={`px-2 py-0.5 rounded border ${
                        quickTestResult.meetsBasicIntegrity
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        BASIC: {quickTestResult.meetsBasicIntegrity ? 'PASS' : 'FAIL'}
                      </span>
                      <span className={`px-2 py-0.5 rounded border ${
                        quickTestResult.meetsDeviceIntegrity
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        DEVICE: {quickTestResult.meetsDeviceIntegrity ? 'PASS' : 'FAIL'}
                      </span>
                      <span className={`px-2 py-0.5 rounded border ${
                        quickTestResult.meetsStrongIntegrity
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        STRONG: {quickTestResult.meetsStrongIntegrity ? 'PASS' : 'OPTIONAL'}
                      </span>
                      <span className={`px-2 py-0.5 rounded border ${
                        quickTestResult.legacyCtsProfileMatch
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        CTS: {quickTestResult.legacyCtsProfileMatch ? 'TRUE' : 'FALSE'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setQuickTestResult(null)}
                  className="text-zinc-400 hover:text-zinc-200 p-1 text-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* Active External Spoofer Auto-Harmonization Banner */}
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono tracking-wide bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {spooferState?.source === 'sentinel' ? (isId ? '- Spoof Dari Sentinel -' : '- Spoofed from Sentinel -') :
                 spooferState?.source === 'device_faker' ? (isId ? '- Spoof Dari Device Faker -' : '- Spoofed from Device Faker -') :
                 spooferState?.source === 'tspoof' ? (isId ? '- Spoof Dari TSpoof -' : '- Spoofed from TSpoof -') :
                 spooferState?.source === 'magisk_props' ? (isId ? '- Spoof Dari Magisk Props -' : '- Spoofed from Magisk Props -') :
                 (isId ? '- Mode Mandiri Chameleon -' : '- Chameleon Standalone -')}
              </span>
              <div className="text-[11px] text-zinc-300">
                <span className="text-zinc-500">{isId ? 'Profil: ' : 'Profile: '}</span>
                <strong>{spooferState?.interceptedBrand || config.targetBrand} {spooferState?.interceptedModel || 'Device'}</strong> (Android {spooferState?.interceptedAndroid || config.targetAndroid})
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isId ? '100% Kernel & Props Terharmonisasi ✓' : '100% Kernel & Props Harmonized ✓'}</span>
            </div>
          </div>

          {/* Preset & Target OS Anchor Control Panel */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/20 border border-zinc-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Preset Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  {t.apps.presetLabel}
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setConfig({
                      ...config,
                      preset: 'full_stealth',
                      enabled: true,
                      typeA: { ...FULL_STEALTH_TYPE_A }
                    })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      config.preset === 'full_stealth'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {t.apps.presetFull}
                  </button>

                  <button
                    onClick={() => setConfig({
                      ...config,
                      preset: 'bca_extreme',
                      enabled: true,
                      typeA: { ...BCA_EXTREME_TYPE_A }
                    })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      config.preset === 'bca_extreme'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                    title="BCA & myBCA Promon SHIELD v6.4 Extreme Bypass"
                  >
                    BCA Promon
                  </button>

                  <button
                    onClick={() => setConfig({
                      ...config,
                      preset: 'mandiri_livin',
                      enabled: true,
                      typeA: { ...MANDIRI_LIVIN_TYPE_A }
                    })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      config.preset === 'mandiri_livin'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                    title="Mandiri Livin & wondr BNI VFS Rootfs Cloak"
                  >
                    Livin Mandiri
                  </button>

                  <button
                    onClick={() => setConfig({
                      ...config,
                      preset: 'shopee_seabank',
                      enabled: true,
                      typeA: { ...SHOPEE_SEABANK_TYPE_A }
                    })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      config.preset === 'shopee_seabank'
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                    title="Shopee & SeaBank Abstract Socket Scrub"
                  >
                    Shopee / SeaBank
                  </button>

                  <button
                    onClick={() => setConfig({
                      ...config,
                      preset: 'brimo_jenius',
                      enabled: true,
                      typeA: { ...BRIMO_JENIUS_TYPE_A }
                    })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      config.preset === 'brimo_jenius'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                    title="BRImo & Jenius Anti-DexGuard Shield"
                  >
                    BRImo / Jenius
                  </button>

                  <button
                    onClick={() => setConfig({
                      ...config,
                      preset: 'strongbox_tee',
                      enabled: true,
                      typeA: { ...STRONGBOX_TEE_TYPE_A }
                    })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      config.preset === 'strongbox_tee'
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                    title="StrongBox TEE Keybox Emulation"
                  >
                    StrongBox TEE
                  </button>

                  <button
                    onClick={() => setConfig({ ...config, preset: 'custom', enabled: true })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      config.preset === 'custom'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {t.apps.presetCustom}
                  </button>

                  <button
                    onClick={() => setConfig({
                      ...config,
                      preset: 'bypass',
                      enabled: false,
                      typeA: { ...BYPASS_TYPE_A }
                    })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      config.preset === 'bypass'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {t.apps.statusBypass}
                  </button>
                </div>
              </div>

              {/* Master OS Context Anchor */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    {t.apps.targetOsLabel}
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Auto-Synced ✓
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={config.targetAndroid}
                    onChange={(e) => {
                      const newTarget = e.target.value as '13' | '14' | '15' | '16';
                      applySmartSync(newTarget, config.targetBrand);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="13">Android 13 (API 33 - Tiramisu)</option>
                    <option value="14">Android 14 (API 34 - UpsideDownCake)</option>
                    <option value="15">Android 15 (API 35 - VanillaIceCream)</option>
                    <option value="16">Android 16 (API 36 - Baklava)</option>
                  </select>

                  <select
                    value={config.targetBrand}
                    onChange={(e) => {
                      const newBrand = e.target.value as 'Xiaomi' | 'Samsung' | 'Google';
                      applySmartSync(config.targetAndroid, newBrand);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Xiaomi">Xiaomi (HyperOS/MIUI)</option>
                    <option value="Samsung">Samsung (OneUI)</option>
                    <option value="Google">Google (Pixel Stock)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sync All Button */}
            <div className="pt-2 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-xs text-zinc-400">
                {t.apps.targetOsSub}
              </p>
              <button
                onClick={handleSyncAll}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.apps.buttons.generateAllSync}</span>
              </button>
            </div>
          </div>

          {/* SECTION A: STEALTH TOGGLES (MURNI ON / OFF) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-zinc-800">
              <Lock className="w-4 h-4 text-emerald-400" />
              <div>
                <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  {t.apps.sectionA}
                </h4>
                <p className="text-[11px] text-zinc-400">{t.apps.sectionASub}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {Object.entries(config.typeA).map(([key, value]) => {
                const label = t.apps.toggles[key as keyof typeof t.apps.toggles] || key;
                const ultraFrontierKeys = ['cntvctCycleNormalizer', 'shadowMemoryPageRedirect', 'dynamicKeyboxOtaPool', 'taskThreadStackSanitizer', 'binderIpcPayloadSanitizer', 'artInlineHookProtector'];
                const apexRing0Keys = ['ebpfSyscallFilter', 'teeStrongBoxEmulation', 'vfsZeroTraceDetach', 'antiRaspPromonShield', 'zygoteMemoryScrubber', 'abstractSocketScrubber'];
                const bionicLinkerKeys = ['linkerSolistUnlink', 'pltGotAntiTamperMask', 'libcBionicSyscallTrampoline'];
                const isUltraFrontier = ultraFrontierKeys.includes(key);
                const isApexRing0 = apexRing0Keys.includes(key);
                const isBionicLinker = bionicLinkerKeys.includes(key);
                const isKernelCore = ['deepMountUnmount', 'rawSyscallBlock', 'isolatedMountNamespace', 'hideDevSockets'].includes(key);
                return (
                  <div
                    key={key}
                    onClick={() => {
                      setConfig({
                        ...config,
                        typeA: {
                          ...config.typeA,
                          [key]: !value,
                        },
                      });
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      value
                        ? isBionicLinker
                          ? 'bg-indigo-950/50 border-indigo-400 text-indigo-100 shadow-md shadow-indigo-950/60 ring-1 ring-indigo-400/40'
                          : isUltraFrontier
                          ? 'bg-teal-950/50 border-teal-400 text-teal-100 shadow-md shadow-teal-950/60 ring-1 ring-teal-400/40'
                          : isApexRing0
                          ? 'bg-emerald-950/50 border-emerald-400 text-emerald-100 shadow-md shadow-emerald-950/60 ring-1 ring-emerald-500/30'
                          : isKernelCore
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-sm shadow-emerald-950/50'
                          : 'bg-emerald-950/20 border-emerald-800/40 text-zinc-200'
                        : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex flex-col gap-1 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isBionicLinker && (
                          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                            <Cpu className="w-2.5 h-2.5" />
                            BIONIC LINKER64
                          </span>
                        )}
                        {isUltraFrontier && (
                          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-gradient-to-r from-amber-400 to-teal-300 text-zinc-950 border border-amber-300 flex items-center gap-1 shadow-sm">
                            <Zap className="w-2.5 h-2.5 fill-current" />
                            ULTRA FRONTIER
                          </span>
                        )}
                        {isApexRing0 && (
                          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-emerald-500 text-zinc-950 border border-emerald-400 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            APEX RING-0
                          </span>
                        )}
                        {isKernelCore && (
                          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            KERNEL CORE
                          </span>
                        )}
                        <span className="text-xs font-medium leading-tight">{label}</span>
                      </div>
                    </div>
                    {value ? (
                      <ToggleRight className={`w-6 h-6 shrink-0 ${isUltraFrontier ? 'text-teal-300' : 'text-emerald-400'}`} />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-zinc-500 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION B: SPOOFING & IDENTITY MATRIX (MANUAL + SMART SCALE GENERATOR) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 pb-1 border-b border-zinc-800">
              <Layers className="w-4 h-4 text-emerald-400" />
              <div>
                <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  {t.apps.sectionB}
                </h4>
                <p className="text-[11px] text-zinc-400">{t.apps.sectionBSub}</p>
              </div>
            </div>

            {/* Field 1: Kernel Version String */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                    <span>{t.apps.spoofFields.kernelVersion}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 font-mono">
                      Target: Android {config.targetAndroid}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">{t.apps.spoofFields.kernelSub}</p>
                </div>
                <button
                  onClick={handleGenerateKernel}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1 border border-zinc-700 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>{t.apps.buttons.generateSmart}</span>
                </button>
              </div>
              <textarea
                rows={2}
                value={config.typeB.kernelString}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    typeB: { ...config.typeB, kernelString: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700/80 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Field 2: Build ID & Display ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-zinc-200">{t.apps.spoofFields.buildId}</span>
                    <p className="text-[10px] text-zinc-400">{t.apps.spoofFields.buildIdSub}</p>
                  </div>
                  <button
                    onClick={handleGenerateBuildId}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono flex items-center gap-1 border border-zinc-700"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Generate</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={config.typeB.buildId}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      typeB: { ...config.typeB, buildId: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700/80 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-zinc-200">{t.apps.spoofFields.buildDisplay}</span>
                    <p className="text-[10px] text-zinc-400">{t.apps.spoofFields.buildDisplaySub}</p>
                  </div>
                </div>
                <input
                  type="text"
                  value={config.typeB.buildDisplayId}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      typeB: { ...config.typeB, buildDisplayId: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700/80 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Field 3: API Level & Security Patch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div>
                  <span className="text-xs font-semibold text-zinc-200">{t.apps.spoofFields.sdkVersion}</span>
                  <p className="text-[10px] text-zinc-400">{t.apps.spoofFields.sdkSub}</p>
                </div>
                <input
                  type="text"
                  readOnly
                  value={config.typeB.sdkVersion}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs font-mono text-emerald-400 cursor-not-allowed"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-zinc-200">{t.apps.spoofFields.securityPatch}</span>
                    <p className="text-[10px] text-zinc-400">{t.apps.spoofFields.securityPatchSub}</p>
                  </div>
                  <button
                    onClick={handleGeneratePatch}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono flex items-center gap-1 border border-zinc-700"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Generate</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={config.typeB.securityPatch}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      typeB: { ...config.typeB, securityPatch: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700/80 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Field 4: Full Fingerprint */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div>
                <span className="text-xs font-semibold text-zinc-200">{t.apps.spoofFields.fingerprint}</span>
                <p className="text-[10px] text-zinc-400">{t.apps.spoofFields.fingerprintSub}</p>
              </div>
              <input
                type="text"
                value={config.typeB.fingerprint}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    typeB: { ...config.typeB, fingerprint: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700/80 text-xs font-mono text-zinc-300 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Field 5: Cmdline & Installer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div>
                  <span className="text-xs font-semibold text-zinc-200">{t.apps.spoofFields.cmdline}</span>
                  <p className="text-[10px] text-zinc-400">{t.apps.spoofFields.cmdlineSub}</p>
                </div>
                <input
                  type="text"
                  value={config.typeB.cmdlineString}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      typeB: { ...config.typeB, cmdlineString: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700/80 text-xs font-mono text-zinc-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div>
                  <span className="text-xs font-semibold text-zinc-200">{t.apps.spoofFields.installer}</span>
                  <p className="text-[10px] text-zinc-400">{t.apps.spoofFields.installerSub}</p>
                </div>
                <input
                  type="text"
                  value={config.typeB.installerPackage}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      typeB: { ...config.typeB, installerPackage: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700/80 text-xs font-mono text-zinc-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section C: Dynamic OTA Vulnerability Patches (Hasil Update 24-Jam) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {lang === 'id' ? 'Bagian C: Patch Celah Dinamis (Hasil Update OTA 24-Jam)' : 'Section C: Dynamic OTA Vulnerability Patches (24-Hour Cycle)'}
                </h4>
                <p className="text-[11px] text-zinc-500">
                  {lang === 'id' 
                    ? 'Injeksi otomatis aturan proteksi anti-root/anti-fraud terbaru langsung ke aplikasi target' 
                    : 'Auto-injected latest anti-root/anti-fraud protection rules directly into target app'}
                </p>
              </div>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Live Hot-Patch ✓
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(otaState?.dynamicToggles || []).map((toggle) => {
                const isChecked = config.dynamicToggles && typeof config.dynamicToggles[toggle.id] === 'boolean'
                  ? config.dynamicToggles[toggle.id]
                  : toggle.enabled;

                return (
                  <div
                    key={toggle.id}
                    onClick={() => {
                      setConfig((prev) => ({
                        ...prev,
                        dynamicToggles: {
                          ...(prev.dynamicToggles || {}),
                          [toggle.id]: !isChecked,
                        },
                      }));
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isChecked
                        ? 'bg-amber-950/20 border-amber-500/40 text-zinc-200'
                        : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-zinc-200">{isId ? toggle.label : (toggle.labelEn || toggle.label)}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {toggle.dateAdded}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-normal">
                        {isId ? toggle.description : (toggle.descriptionEn || toggle.description)}
                      </p>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {isChecked ? (
                        <ToggleRight className="w-6 h-6 text-amber-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-zinc-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Terminal Output Simulation */}
          {logOutput && (
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-emerald-500/40 font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed">
              <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-zinc-800 text-zinc-400 text-[11px]">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isId ? 'Log Eksekusi Shell Root' : 'Root Shell Execution Log'}</span>
              </div>
              {logOutput}
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                const reset = generateSmartProfile('14', 'Xiaomi', '4.19.157');
                setConfig({
                  ...config,
                  typeB: {
                    ...config.typeB,
                    kernelString: reset.kernelString,
                    buildId: reset.buildId,
                    buildDisplayId: reset.buildDisplayId,
                    sdkVersion: reset.sdkVersion,
                    securityPatch: reset.securityPatch,
                    fingerprint: reset.fingerprint,
                    cmdlineString: reset.cmdlineString,
                    installerPackage: reset.installerPackage,
                  },
                });
              }}
              className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 flex items-center justify-center gap-2 border border-transparent transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.apps.buttons.resetDefault}</span>
            </button>

            <button
              type="button"
              onClick={handleTestIntegrityNow}
              disabled={isTestingIntegrity}
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>{isTestingIntegrity ? (isId ? 'Menguji...' : 'Testing...') : (isId ? 'Uji Integritas' : 'Test Integrity')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
            >
              {t.apps.buttons.closeModal}
            </button>
            <button
              onClick={handleSaveAndForceStop}
              disabled={isSaving}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSaving ? (isId ? 'Menyimpan...' : 'Saving...') : t.apps.buttons.saveAndKill}</span>
            </button>
          </div>
        </div>

      </div>

      {/* RASP Signature Scanner Modal */}
      {isRaspScanOpen && (
        <RaspSignatureScannerModal
          isOpen={isRaspScanOpen}
          onClose={() => setIsRaspScanOpen(false)}
          lang={lang}
          targetApp={config}
          onApplyPreset={(appId, newPreset, newTypeA) => {
            setConfig((prev) => ({
              ...prev,
              preset: newPreset,
              enabled: newPreset !== 'bypass',
              typeA: { ...newTypeA },
            }));
          }}
        />
      )}

      {/* Live Syscall Interception Monitor Modal */}
      {isLiveSyscallOpen && (
        <LiveSyscallMonitorModal
          isOpen={isLiveSyscallOpen}
          onClose={() => setIsLiveSyscallOpen(false)}
          lang={lang}
          apps={allApps.length > 0 ? allApps : [config]}
        />
      )}
    </div>
  );
};
