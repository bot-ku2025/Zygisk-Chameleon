import React, { useState } from 'react';
import { 
  Globe, Zap, Trash2, CheckCircle, ShieldCheck, 
  TerminalSquare, Download, FileArchive, Check, 
  Copy, ExternalLink, Smartphone, AlertCircle, RefreshCw,
  GitBranch
} from 'lucide-react';
import { Language, TargetApp } from '../types';
import { translations } from '../locales/dictionary';
import { generateFlashableModuleZip } from '../utils/moduleZipBuilder';

interface SettingsTabProps {
  lang: Language;
  setLang: (lang: Language) => void;
  apps?: TargetApp[];
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ lang, setLang, apps = [] }) => {
  const t = translations[lang];
  const isId = lang === 'id';
  const [autoKill, setAutoKill] = useState(true);
  const [defaultPreset, setDefaultPreset] = useState<'full' | 'custom'>('full');
  const [cleanAlert, setCleanAlert] = useState(false);
  
  // Download states
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const liveWebUiUrl = 'https://ais-pre-xmvzmwiikf7gtwubrtnucv-496454469850.asia-southeast1.run.app';

  const handleCleanCache = () => {
    setCleanAlert(true);
    setTimeout(() => setCleanAlert(false), 3000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsGeneratingZip(true);
      const blob = await generateFlashableModuleZip({
        apps,
        version: 'v1.0.0',
        author: 'STNK',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'zygisk-chameleon-v1.0.0.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to generate ZIP module', err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(liveWebUiUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold text-zinc-100">{t.settings.title}</h2>
        <p className="text-xs text-zinc-400">{t.settings.sub}</p>
      </div>

      {/* MODULE DOWNLOAD & DIRECT TEST CARD */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/30 border border-emerald-500/40 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
              <FileArchive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-100">
                  {isId ? 'Unduh Paket Modul Flashable (ZIP)' : 'Download Flashable Module Package (ZIP)'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready to Flash
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {isId 
                  ? 'Paket file ZIP siap pasang untuk KernelSU, APatch, dan Magisk lengkap dengan skrip instalasi dan WebUI.' 
                  : 'Ready-to-flash ZIP package for KernelSU, APatch, and Magisk including install scripts and WebUI.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isGeneratingZip}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all shadow-lg shadow-emerald-950/50 disabled:opacity-50 shrink-0"
          >
            {isGeneratingZip ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isId ? 'Mengemas ZIP...' : 'Packing ZIP...'}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isId ? 'Unduh zygisk-chameleon-v1.0.0.zip' : 'Download zygisk-chameleon-v1.0.0.zip'}</span>
              </>
            )}
          </button>
        </div>

        {downloadSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isId 
                ? 'File zygisk-chameleon-v1.0.0.zip berhasil diunduh! Silakan ikuti langkah pengujian di bawah.' 
                : 'zygisk-chameleon-v1.0.0.zip successfully downloaded! Follow the testing steps below.'}
            </span>
          </div>
        )}

        {/* Manifest Preview */}
        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-[11px] font-mono text-zinc-400 space-y-1.5">
          <div className="flex items-center justify-between text-zinc-300 font-semibold border-b border-zinc-800 pb-1">
            <span>{isId ? 'Struktur Arsip Modul:' : 'Module Archive Structure:'}</span>
            <span className="text-emerald-400">Universal Root Compatible</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <span className="text-zinc-300">📄 module.prop</span>
            <span className="text-zinc-300">⚙️ customize.sh</span>
            <span className="text-zinc-300">🔧 service.sh</span>
            <span className="text-zinc-300">🛡️ post-fs-data.sh</span>
            <span className="text-zinc-300">🔘 action.sh</span>
            <span className="text-zinc-300">🔒 sepolicy.rule</span>
            <span className="text-zinc-300">📋 config.json</span>
            <span className="text-emerald-400">🌐 webroot/</span>
          </div>
        </div>

        {/* 4-Step Quick Flashing Guide */}
        <div className="space-y-2 pt-1 border-t border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>{isId ? 'Langkah Uji Coba di Ponsel Android:' : 'Android Device Testing Steps:'}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 flex gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">1</span>
              <p className="text-zinc-300">
                {isId ? 'Salin file ZIP ke memori internal ponsel Anda.' : 'Transfer the downloaded ZIP to phone internal storage.'}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 flex gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">2</span>
              <p className="text-zinc-300">
                {isId ? 'Buka KernelSU, APatch, atau Magisk Manager.' : 'Open KernelSU, APatch, or Magisk Manager.'}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 flex gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">3</span>
              <p className="text-zinc-300">
                {isId ? 'Tab Modul → "Instal dari penyimpanan" → pilih file ZIP.' : 'Modules tab → "Install from storage" → select the ZIP.'}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 flex gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">4</span>
              <p className="text-zinc-300">
                {isId ? 'Reboot ponsel untuk mengaktifkan modul & uji coba aplikasi!' : 'Reboot your phone to activate module & test target apps!'}
              </p>
            </div>
          </div>
        </div>

        {/* Live WebUI Direct Testing on Mobile */}
        <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-semibold text-zinc-200 block">
              {isId ? 'Uji Coba Langsung WebUI di Browser HP:' : 'Test WebUI Directly on Mobile Browser:'}
            </span>
            <span className="text-[11px] font-mono text-zinc-400 break-all">{liveWebUiUrl}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyUrl}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 transition-colors"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? (isId ? 'Tersalin' : 'Copied') : (isId ? 'Salin URL' : 'Copy URL')}</span>
            </button>
            <a
              href={liveWebUiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isId ? 'Buka di HP' : 'Open'}</span>
            </a>
          </div>
        </div>

        {/* GitHub Serverless Update Mechanism */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <span>
                {isId ? 'Pembaruan Modul Otomatis via GitHub (Serverless)' : 'Serverless GitHub Module Updates'}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-700 text-zinc-300">
              KernelSU & Magisk Spec
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            {isId 
              ? 'Modul ini sudah dikonfigurasi dengan standar updateJson resmi. Saat Anda merilis versi baru di GitHub (misal v1.0.1), pengguna yang memasang modul ini akan otomatis mendapatkan tombol "Update" langsung di aplikasi KernelSU/Magisk tanpa perlu server backend.'
              : 'This module is preconfigured with the official updateJson standard. Whenever you publish a new release on GitHub, users will automatically receive an "Update" button inside their KernelSU/Magisk app without requiring any backend server.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
              <span className="text-[11px] text-zinc-500 font-mono block">1. Ekspor ke GitHub</span>
              <p className="text-zinc-300 mt-1">
                {isId ? 'Menu Settings di pojok kanan atas AI Studio → "Export to GitHub".' : 'Settings menu top-right of AI Studio → "Export to GitHub".'}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
              <span className="text-[11px] text-zinc-500 font-mono block">2. GitHub Actions</span>
              <p className="text-zinc-300 mt-1">
                {isId ? 'Workflow .github/workflows/build-release.yml otomatis mengemas ZIP setiap kali rilis.' : 'Prebuilt workflow automatically builds and packs flashable ZIP on tags.'}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
              <span className="text-[11px] text-zinc-500 font-mono block">3. Serverless OTA</span>
              <p className="text-zinc-300 mt-1">
                {isId ? 'KernelSU & Magisk memeriksa update.json langsung di raw repository GitHub.' : 'Root managers query raw update.json directly from GitHub repository.'}
              </p>
            </div>
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                lang === 'id'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              🇮🇩 Bahasa Indonesia
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors self-end sm:self-auto ${
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                defaultPreset === 'full'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Full Stealth
            </button>
            <button
              onClick={() => setDefaultPreset('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                defaultPreset === 'custom'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Purge Cache */}
        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">{t.settings.cleanCacheTitle}</h3>
              <p className="text-xs text-zinc-400">{t.settings.cleanCacheDesc}</p>
            </div>
          </div>
          <button
            onClick={handleCleanCache}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors self-end sm:self-auto"
          >
            {t.settings.cleanBtn}
          </button>
        </div>

        {cleanAlert && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{t.settings.cleanedAlert}</span>
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
            <span className="text-emerald-400 font-semibold">KernelSU Native API</span>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800">
            <span className="text-[11px] text-zinc-500 block">Storage Path</span>
            <span className="text-zinc-300 text-[11px] truncate block">/data/adb/modules</span>
          </div>
        </div>
      </div>
    </div>
  );
};

