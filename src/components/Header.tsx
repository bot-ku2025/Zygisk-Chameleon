import React from 'react';
import { ShieldCheck, Cpu, WifiOff, Globe, Sparkles } from 'lucide-react';
import { Language, TabType } from '../types';
import { translations } from '../locales/dictionary';
import logoImg from '../assets/images/natural_chameleon_logo_1788962639417.jpg';

interface HeaderProps {
  currentTab: TabType;
  setTab: (tab: TabType) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setTab, lang, setLang }) => {
  const t = translations[lang];

  return (
    <header className="border-b border-emerald-900/40 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Top bar: Brand & Language */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={logoImg}
                alt="Zygisk Chameleon Logo"
                className="w-11 h-11 rounded-xl object-cover border border-emerald-500/40 shadow-lg shadow-emerald-950/50"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-zinc-950"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-1.5">
                  Zygisk Chameleon
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    v1.0.0
                  </span>
                </h1>
              </div>
              <p className="text-xs text-zinc-400 max-w-lg hidden sm:block">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Status Indicators & Language Switcher */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.rootEnv}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-800/40 text-[11px] font-mono text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.engineStatus}</span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <WifiOff className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">{t.offlineMode}</span>
            </div>

            {/* Language Switcher Button */}
            <button
              onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/70 text-xs font-medium transition-colors"
              title="Ganti Bahasa / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2 pt-2.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setTab('apps')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
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
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
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
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            {t.tabs.settings}
          </button>

          <button
            onClick={() => setTab('about')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentTab === 'about'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            {t.tabs.about}
          </button>
        </nav>
      </div>
    </header>
  );
};
