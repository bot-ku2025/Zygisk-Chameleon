import React, { useState, useEffect } from 'react';
import { TargetApp, Language, TabType, RootEnvironment, RootModule, ExternalSpooferState, OtaCelahUpdateState } from './types';
import { INITIAL_APPS } from './data/initialApps';
import { INITIAL_INSTALLED_MODULES } from './data/installedModules';
import { INITIAL_SPOOFER_STATE, INITIAL_OTA_STATE } from './data/spooferAndOtaData';
import { UnifiedHeader } from './components/UnifiedHeader';
import { OtaUpdateModal } from './components/OtaUpdateModal';
import { AppListTab } from './components/AppListTab';
import { PlayIntegrityTab } from './components/PlayIntegrityTab';
import { SettingsTab } from './components/SettingsTab';
import { AboutTab } from './components/AboutTab';
import { translations } from './locales/dictionary';

const INSTALLED_ROOT_ENV: RootEnvironment = {
  manager: 'KernelSU',
  version: 'v0.9.5',
  versionCode: 11872,
  mode: 'Kernel GKI Hook (Low-Level)',
  selinux: 'Enforcing',
  suPath: '/data/adb/ksu/bin/su',
  modulePath: '/data/adb/modules/zygisk_chameleon',
  zygiskStatus: 'Zygisk Next v1.1.0 (Loaded)',
  granted: true,
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('chameleon_lang');
    return (saved === 'en' || saved === 'id') ? saved : 'id';
  });

  const [currentTab, setCurrentTab] = useState<TabType>('apps');
  const rootEnv = INSTALLED_ROOT_ENV;

  const [spooferState, setSpooferState] = useState<ExternalSpooferState>(() => {
    const saved = localStorage.getItem('chameleon_spoofer_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_SPOOFER_STATE;
  });

  const [otaState, setOtaState] = useState<OtaCelahUpdateState>(() => {
    const saved = localStorage.getItem('chameleon_ota_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_OTA_STATE;
  });

  const [isOtaModalOpen, setIsOtaModalOpen] = useState(false);

  const [modules, setModules] = useState<RootModule[]>(() => {
    const saved = localStorage.getItem('chameleon_installed_modules');
    if (saved) {
      try {
        const parsed: RootModule[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((m) => m.id));
        const missing = INITIAL_INSTALLED_MODULES.filter((m) => !existingIds.has(m.id));
        const chameleonInit = INITIAL_INSTALLED_MODULES.find(x => x.id === 'zygisk_chameleon');
        return [...parsed, ...missing].map((m) => 
          m.id === 'zygisk_chameleon' && chameleonInit ? {
            ...m,
            author: 'STNK',
            description: chameleonInit.description,
            configFiles: chameleonInit.configFiles,
          } : m
        );
      } catch {
        return INITIAL_INSTALLED_MODULES;
      }
    }
    return INITIAL_INSTALLED_MODULES;
  });

  const [apps, setApps] = useState<TargetApp[]>(() => {
    const saved = localStorage.getItem('chameleon_apps');
    if (saved) {
      try {
        const parsed: TargetApp[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((a) => a.id));
        const missing = INITIAL_APPS.filter((a) => !existingIds.has(a.id));
        return [...parsed, ...missing].map((app) => ({
          ...app,
          typeA: {
            deepMountUnmount: true,
            rawSyscallBlock: true,
            isolatedMountNamespace: true,
            hideDevSockets: true,
            ...app.typeA,
          },
        }));
      } catch {
        return INITIAL_APPS;
      }
    }
    return INITIAL_APPS;
  });

  useEffect(() => {
    localStorage.setItem('chameleon_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('chameleon_apps', JSON.stringify(apps));
  }, [apps]);

  useEffect(() => {
    localStorage.setItem('chameleon_installed_modules', JSON.stringify(modules));
  }, [modules]);

  useEffect(() => {
    localStorage.setItem('chameleon_spoofer_state', JSON.stringify(spooferState));
  }, [spooferState]);

  useEffect(() => {
    localStorage.setItem('chameleon_ota_state', JSON.stringify(otaState));
  }, [otaState]);

  const handleRunOtaUpdate = async () => {
    const isId = lang === 'id';
    setOtaState((prev) => ({
      ...prev,
      lastUpdated: isId ? 'Hari ini, 09:48 WIB (Hot-Patching Aktif)' : 'Today, 09:48 WIB (Hot-Patching Active)',
      lastUpdatedEn: 'Today, 09:48 WIB (Hot-Patching Active)',
      nextScheduledCheck: isId ? '23 jam 59 menit lagi (Siklus 24 Jam)' : 'In 23 hours 59 mins (24-Hour Cycle)',
      nextScheduledCheckEn: 'In 23 hours 59 mins (24-Hour Cycle)',
      version: 'v2026.09.09-OTA',
      rulesCount: prev.rulesCount + 6,
      fingerprintsCount: prev.fingerprintsCount + 4,
      status: 'applied',
      recentChangelog: [
        {
          id: 'ch-new-' + Date.now(),
          title: isId ? 'Hot-Patch Celah Shopee & Bank RASP v2.89 Berhasil Diterapkan' : 'Hot-Patch Shopee & Bank RASP v2.89 Successfully Applied',
          titleEn: 'Hot-Patch Shopee & Bank RASP v2.89 Successfully Applied',
          timestamp: isId ? 'Baru saja' : 'Just now',
          timestampEn: 'Just now',
          type: 'dynamic_toggle',
          desc: isId
            ? 'Filter socket /proc/net/unix dan seccomp raw assembly syscalls telah disuntikkan ke memori Zygote tanpa reboot.'
            : '/proc/net/unix socket filter and seccomp raw assembly syscalls injected into Zygote memory without reboot.',
          descEn: '/proc/net/unix socket filter and seccomp raw assembly syscalls injected into Zygote memory without reboot.',
        },
        ...prev.recentChangelog.slice(0, 4),
      ],
    }));

    // Automatically ensure all target apps inherit the updated dynamic toggles
    setApps((prev) =>
      prev.map((a) => ({
        ...a,
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

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Application Header (Neatly unified: Brand, Root Manager, Spoofer Result, Modules & Tabs) */}
      <UnifiedHeader
        currentTab={currentTab}
        setTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        rootEnv={rootEnv}
        spooferState={spooferState}
        setSpooferState={setSpooferState}
        otaState={otaState}
        onOpenOtaModal={() => setIsOtaModalOpen(true)}
        modules={modules}
        setModules={setModules}
      />

      {/* Main Content Area - Completely clean, without any cluttering bars */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5">
        {currentTab === 'apps' && (
          <AppListTab 
            apps={apps} 
            setApps={setApps} 
            lang={lang} 
            onOpenIntegrityTab={() => setCurrentTab('integrity')}
            spooferState={spooferState}
            otaState={otaState}
            onOpenOtaModal={() => setIsOtaModalOpen(true)}
          />
        )}

        {currentTab === 'integrity' && (
          <PlayIntegrityTab apps={apps} setApps={setApps} lang={lang} />
        )}

        {currentTab === 'settings' && (
          <SettingsTab lang={lang} setLang={setLang} apps={apps} />
        )}

        {currentTab === 'about' && (
          <AboutTab lang={lang} />
        )}
      </main>

      {/* 24-Hour Online Vulnerability OTA Update Modal */}
      <OtaUpdateModal
        isOpen={isOtaModalOpen}
        onClose={() => setIsOtaModalOpen(false)}
        otaState={otaState}
        onRunOtaUpdate={handleRunOtaUpdate}
        lang={lang}
      />

      {/* Persistent Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-zinc-400">Zygisk Chameleon v1.0.0</span>
            <span className="text-zinc-600">|</span>
            <span>KernelSU • APatch • Magisk Native Module</span>
          </div>
          <div>
            <span>Develop by </span>
            <a
              href="https://t.me/MuhammadDimasRidho"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline font-semibold"
            >
              STNK
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
