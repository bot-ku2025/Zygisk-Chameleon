import React, { useState } from 'react';
import { 
  Search, Shield, Sliders, CheckCircle2, XCircle, 
  Sparkles, ChevronRight, Plus, X, Globe, Check,
  ShieldCheck, ShieldAlert, Award, Zap, Layers
} from 'lucide-react';
import { TargetApp, Language, ExternalSpooferState, OtaCelahUpdateState } from '../types';
import { translations } from '../locales/dictionary';
import { AppConfigModal } from './AppConfigModal';
import { AppIcon } from './AppIcon';
import { generateSmartProfile } from '../utils/generator';
import { ApexHierarchyModal } from './ApexHierarchyModal';
import { FULL_STEALTH_TYPE_A } from '../data/initialApps';

interface AppListTabProps {
  apps: TargetApp[];
  setApps: React.Dispatch<React.SetStateAction<TargetApp[]>>;
  lang: Language;
  onOpenIntegrityTab?: () => void;
  spooferState?: ExternalSpooferState;
  otaState?: OtaCelahUpdateState;
  onOpenOtaModal?: () => void;
}

export const AppListTab: React.FC<AppListTabProps> = ({ 
  apps, 
  setApps, 
  lang, 
  onOpenIntegrityTab,
  spooferState,
  otaState,
  onOpenOtaModal,
}) => {
  const t = translations[lang];
  const isId = lang === 'id';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalApp, setActiveModalApp] = useState<TargetApp | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);

  const handleActivateFullProtection = () => {
    setApps((prev) =>
      prev.map((a) => ({
        ...a,
        enabled: true,
        preset: 'full_stealth',
        typeA: { ...FULL_STEALTH_TYPE_A },
        typeB: {
          ...a.typeB,
          spoofFingerprint: true,
          spoofSecurityPatch: true,
          spoofBuildDisplay: true,
          spoofCmdline: true,
          spoofKernel: true,
        },
        dynamicToggles: {
          ...(a.dynamicToggles || {}),
          shopee_unix_socket: true,
          dexclassloader_hook_guard: true,
          bca_promon_svc_shield: true,
          mandiri_livin_mount_sanitizer: true,
          anti_bootloop_gki_guard: true,
        },
      }))
    );
  };

  // New app modal state
  const [newPkgId, setNewPkgId] = useState('');
  const [newAppName, setNewAppName] = useState('');
  const [newCategory, setNewCategory] = useState<'banking' | 'ecommerce' | 'gaming' | 'utility'>('banking');

  // Filter apps
  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleAppEnabled = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setApps((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          const nextEnabled = !a.enabled;
          return {
            ...a,
            enabled: nextEnabled,
            preset: nextEnabled ? (a.preset === 'bypass' ? 'full_stealth' : a.preset) : 'bypass',
          };
        }
        return a;
      })
    );
  };

  const handleUpdateAppConfig = (updatedApp: TargetApp) => {
    setApps((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));
    setActiveModalApp(null);
  };

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgId.trim()) return;

    const trimmedPkg = newPkgId.trim().toLowerCase();
    const existing = apps.find((a) => a.id === trimmedPkg);
    if (existing) {
      setActiveModalApp(existing);
      setShowAddModal(false);
      return;
    }

    const brand = (spooferState?.interceptedBrand) || 'Samsung';
    const androidVer = (spooferState?.interceptedAndroid) || '14';
    const smartProfile = generateSmartProfile(androidVer, brand, '4.19.157');

    const initialDynamicToggles: Record<string, boolean> = {};
    (otaState?.dynamicToggles || []).forEach((t) => {
      initialDynamicToggles[t.id] = t.enabled;
    });

    const newApp: TargetApp = {
      id: trimmedPkg,
      name: newAppName.trim() || trimmedPkg.split('.').pop()?.toUpperCase() || 'App Target',
      category: newCategory,
      icon: 'Shield',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      enabled: true,
      preset: 'full_stealth',
      targetAndroid: androidVer,
      targetBrand: brand,
      dynamicToggles: initialDynamicToggles,
      typeA: {
        ...FULL_STEALTH_TYPE_A,
      },
      typeB: {
        spoofKernel: true,
        kernelString: smartProfile.kernelString,
        spoofBuildDisplay: true,
        buildDisplayId: smartProfile.buildDisplayId,
        spoofBuildId: true,
        buildId: smartProfile.buildId,
        spoofSdk: true,
        sdkVersion: smartProfile.sdkVersion,
        spoofSecurityPatch: true,
        securityPatch: smartProfile.securityPatch,
        spoofCmdline: true,
        cmdlineString: smartProfile.cmdlineString,
        spoofFingerprint: true,
        fingerprint: smartProfile.fingerprint,
        installerPackage: 'com.android.vending',
      },
    };

    setApps((prev) => [newApp, ...prev]);
    setNewPkgId('');
    setNewAppName('');
    setShowAddModal(false);
    setActiveModalApp(newApp);
  };

  return (
    <div className="space-y-5">
      {/* System Architecture & Protection Overview Banner */}
      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <span>{isId ? 'Arsitektur Isolasi Proses & Kernel' : 'Process & Kernel Isolation Architecture'}</span>
              </h3>
              <span className="px-2 py-0.5 text-[9px] font-mono font-medium bg-zinc-800 text-emerald-400 border border-emerald-500/30 rounded-full tracking-wider">
                {isId ? 'TERFOKUS & MANDIRI' : 'FOCUSED & AUTONOMOUS'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 max-w-2xl mt-0.5">
              {isId
                ? 'Bekerja mandiri pada lapisan Kernel GKI, pemisahan namespace mount VFS, dan pengamanan bionic linker untuk menjaga privasi sistem secara tenang dan konsisten.'
                : 'Operates independently across GKI kernel layers, VFS mount namespace detachment, and bionic linker safeguards to maintain system integrity calmly and reliably.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsHierarchyModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isId ? 'Diagram Lapisan' : 'Architecture'}</span>
          </button>

          <button
            onClick={handleActivateFullProtection}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/60 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isId ? 'Proteksi Penuh' : 'Full Protection'}</span>
          </button>
        </div>
      </div>

      {/* Quick Play Integrity & SafetyNet Status Check Banner */}
      {onOpenIntegrityTab && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-zinc-900 to-emerald-950/30 border border-blue-800/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>Play Integrity & SafetyNet Verification</span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
                  NEW
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                {lang === 'id'
                  ? 'Uji langsung apakah setelan cloaking yang diterapkan saat ini berhasil menyembunyikan root secara 100% dari target aplikasi.'
                  : 'Directly test whether the current cloaking settings successfully hide root 100% from target applications.'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenIntegrityTab}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 shadow-md shadow-blue-950/60 transition-colors shrink-0 cursor-pointer"
          >
            <span>{lang === 'id' ? 'Buka Checker' : 'Open Checker'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.apps.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Category Pills & Add App Button */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { id: 'all', label: t.apps.filterAll },
              { id: 'ecommerce', label: t.apps.filterEcommerce },
              { id: 'banking', label: t.apps.filterBanking },
              { id: 'gaming', label: t.apps.filterGaming },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-500 text-zinc-950 flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'Tambah Target App' : 'Add Target App'}</span>
          </button>
        </div>
      </div>

      {/* App Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredApps.map((app) => {
          return (
            <div
              key={app.id}
              onClick={() => setActiveModalApp(app)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                app.enabled
                  ? 'bg-zinc-900/70 border-emerald-900/30 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/20'
                  : 'bg-zinc-900/30 border-zinc-800/50 opacity-70 hover:opacity-100 hover:border-zinc-700'
              }`}
            >
              {/* Subtle top indicator bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-0.5 ${
                  app.enabled ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-zinc-800'
                }`}
              />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AppIcon appId={app.id} size="md" showAutoBadge={true} />
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                      {app.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-[11px] font-mono text-zinc-400">{app.id}</p>
                      {app.enabled ? (
                        <span className="text-[10px] text-emerald-300 font-mono flex items-center gap-1 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700/50">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                          <span>MNT_DETACH + SECCOMP ✓</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/60">
                          <ShieldAlert className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                          <span>{isId ? 'ISOLASI MATI' : 'ISOLATION OFF'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Toggle Switch */}
                <button
                  onClick={(e) => handleToggleAppEnabled(app.id, e)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 border ${
                    app.enabled
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                  }`}
                  title="Toggle Chameleon Protection"
                >
                  {app.enabled ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ON</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-zinc-500" />
                      <span>OFF</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Toggles Bar */}
              <div className="mt-3.5 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      app.preset === 'full_stealth'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800/50'
                        : app.preset === 'custom'
                        ? 'bg-amber-950 text-amber-300 border-amber-800/50'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {app.preset === 'full_stealth'
                      ? 'Full Stealth'
                      : app.preset === 'custom'
                      ? 'Custom Hook'
                      : 'Bypass'}
                  </span>

                  <span className="text-[10px] font-mono text-zinc-400">
                    Target: <strong className="text-zinc-300">{app.targetBrand} (A{app.targetAndroid})</strong>
                  </span>

                  {app.typeA.hideLsposed && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 font-mono text-[10px]">
                      LSPosed Shield
                    </span>
                  )}
                </div>

                <div className="text-zinc-500 group-hover:text-emerald-400 flex items-center gap-0.5 transition-colors">
                  <span className="text-[11px] font-medium hidden sm:inline">{lang === 'id' ? 'Konfigurasi' : 'Configure'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Target App Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-emerald-900/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold text-zinc-100">
                  {lang === 'id' ? 'Tambah Target Aplikasi' : 'Add Target Application'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddApp} className="p-4 sm:p-5 space-y-4 text-xs font-sans">
              {/* Optional APK File Drop / Selector */}
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-dashed border-zinc-700 hover:border-emerald-500/50 transition-colors text-center relative">
                <input
                  type="file"
                  accept=".apk"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const cleanName = file.name.replace(/\.apk$/i, '').trim();
                      const sanitizedPkg = 'com.' + cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.app';
                      setNewPkgId(sanitizedPkg);
                      setNewAppName(cleanName.split(/[\s_-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="space-y-1 pointer-events-none">
                  <span className="text-emerald-400 font-semibold block text-xs">
                    {lang === 'id' ? '📁 Pilih atau Drag & Drop File .APK (misal: pine drama.apk)' : '📁 Select or Drag & Drop .APK File (e.g. pine drama.apk)'}
                  </span>
                  <p className="text-[10px] text-zinc-400">
                    {lang === 'id' 
                      ? 'Otomatis membaca nama paket & menerapkan preset Full Stealth secara instan'
                      : 'Automatically detects package name & instantly applies Full Stealth preset'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  {lang === 'id' ? 'Nama Paket Android (Package ID) *' : 'Android Package ID *'}
                </label>
                <input
                  type="text"
                  required
                  value={newPkgId}
                  onChange={(e) => setNewPkgId(e.target.value)}
                  placeholder={lang === 'id' ? 'Contoh: com.pinedrama.app atau com.shopee.id' : 'Example: com.pinedrama.app or com.shopee.id'}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                  {lang === 'id' 
                    ? '* Otomatis mengisolasi mount su (umount2 MNT_DETACH) & seccomp filter untuk target ini.'
                    : '* Automatically isolates su mounts (umount2 MNT_DETACH) & seccomp filters for this target.'}
                </p>
              </div>

              {/* Live Preview of Auto-Detected Icon */}
              {newPkgId.trim().length > 3 && (
                <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center gap-3">
                  <AppIcon appId={newPkgId.trim()} size="md" showAutoBadge={true} />
                  <div>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold block">
                      {lang === 'id' ? 'TARGET APLIKASI TERVERIFIKASI:' : 'VERIFIED TARGET APPLICATION:'}
                    </span>
                    <span className="text-xs font-mono text-zinc-200 truncate max-w-[220px] block">
                      {newPkgId.trim()}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  {lang === 'id' ? 'Nama Label Aplikasi (Opsional)' : 'Application Label Name (Optional)'}
                </label>
                <input
                  type="text"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder={lang === 'id' ? 'Contoh: WhatsApp Messenger' : 'Example: WhatsApp Messenger'}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  {lang === 'id' ? 'Kategori Aplikasi' : 'Application Category'}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="banking">{lang === 'id' ? 'Perbankan / Finansial (High Stealth)' : 'Banking / Financial (High Stealth)'}</option>
                  <option value="ecommerce">{lang === 'id' ? 'E-Commerce / Belanja' : 'E-Commerce / Shopping'}</option>
                  <option value="gaming">{lang === 'id' ? 'Game Online / Anti-Cheat' : 'Online Gaming / Anti-Cheat'}</option>
                  <option value="utility">{lang === 'id' ? 'Utilitas / Komunikasi' : 'Utilities / Communication'}</option>
                </select>
              </div>

              <div className="p-4 border-t border-zinc-800 flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                >
                  {lang === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-zinc-950 transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === 'id' ? 'Tambahkan Aplikasi' : 'Add Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Configuration Modal */}
      {activeModalApp && (
        <AppConfigModal
          app={activeModalApp}
          lang={lang}
          onClose={() => setActiveModalApp(null)}
          onSave={handleUpdateAppConfig}
          spooferState={spooferState}
          otaState={otaState}
          allApps={apps}
        />
      )}

      {/* System Architecture & Protection Hierarchy Modal */}
      <ApexHierarchyModal
        isOpen={isHierarchyModalOpen}
        onClose={() => setIsHierarchyModalOpen(false)}
        lang={lang}
        onActivateApexGodmode={handleActivateFullProtection}
        appsCount={apps.length}
      />
    </div>
  );
};
