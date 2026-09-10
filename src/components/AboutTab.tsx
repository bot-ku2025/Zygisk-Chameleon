import React, { useState } from 'react';
import { 
  Send, ExternalLink, ShieldCheck, Cpu, Code2, 
  Sparkles, Check, Copy, Terminal, Info, History, Tag, ChevronDown, ChevronUp
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../locales/dictionary';
import { APP_VERSION, APP_RELEASE_DATE, APP_CODENAME, VERSION_HISTORY } from '../data/version';
import logoImg from '../assets/images/natural_chameleon_logo_1788962639417.jpg';

interface AboutTabProps {
  lang: Language;
}

export const AboutTab: React.FC<AboutTabProps> = ({ lang }) => {
  const t = translations[lang];
  const isId = lang === 'id';
  const [copied, setCopied] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState<string>(APP_VERSION);
  const telegramUrl = 'https://t.me/MuhammadDimasRidho';

  const handleCopyTelegram = () => {
    navigator.clipboard.writeText(telegramUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleVersion = (ver: string) => {
    setExpandedVersion((prev) => (prev === ver ? '' : ver));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Hero Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/40 border border-emerald-900/40 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
          <img
            src={logoImg}
            alt="Zygisk Chameleon Logo"
            className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
                Zygisk Chameleon
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                {APP_VERSION} (Terbaru / Latest)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                {APP_CODENAME}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                {APP_RELEASE_DATE}
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed max-w-xl">
              {t.about.philosophyDesc}
            </p>
          </div>
        </div>
      </div>

      {/* VERSION HISTORY & CHANGELOG CARD */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
            <History className="w-4 h-4 text-emerald-400" />
            <span>{isId ? 'Catatan Rilis & Riwayat Versi Modul' : 'Release Notes & Module Version History'}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-medium">
            {isId ? 'Versi Aktif: ' : 'Active: '}<strong>{APP_VERSION}</strong>
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          {isId 
            ? 'Lihat rincian pembaruan pada setiap versi untuk membedakan antara rilis terbaru dengan rilis sebelumnya.' 
            : 'Detailed release logs for each version to clearly distinguish new updates from previous builds.'}
        </p>

        <div className="space-y-3 pt-1">
          {VERSION_HISTORY.map((item) => {
            const isLatest = item.tag === 'Latest';
            const isExpanded = expandedVersion === item.version;

            return (
              <div
                key={item.version}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isLatest 
                    ? 'bg-zinc-950/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20' 
                    : 'bg-zinc-950/50 border-zinc-800/80'
                }`}
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleVersion(item.version)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-sm text-zinc-100">
                      {item.version}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      isLatest 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {isLatest ? (isId ? 'RILIS TERBARU' : 'LATEST RELEASE') : (isId ? 'VERSI LAMA' : 'PREVIOUS')}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      Code: {item.versionCode} • {item.date}
                    </span>
                  </div>

                  <button className="p-1 text-zinc-400 hover:text-zinc-200">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Highlights List */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-zinc-900 text-xs space-y-2 text-zinc-300">
                    <ul className="space-y-2 list-disc list-inside">
                      {item.highlights.map((hl, idx) => (
                        <li key={idx} className="leading-relaxed">
                          <span className="text-zinc-200 font-medium">
                            {isId ? hl.id : hl.en}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Developer Profile Card */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4 shadow-lg">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 text-xs font-bold text-zinc-400 uppercase tracking-wider">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span>{t.about.creatorHeader}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              {t.about.creatorName}
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed max-w-xl">
              {t.about.creatorBio}
            </p>
          </div>
        </div>

        {/* Telegram Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1f90c6] text-white text-xs font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-sky-950/50 transition-all group"
          >
            <div className="p-1 rounded-full bg-white/20">
              <Send className="w-3.5 h-3.5 fill-white text-white" />
            </div>
            <span className="font-semibold tracking-wide">Admin</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          <button
            onClick={handleCopyTelegram}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 border border-zinc-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-mono">{lang === 'id' ? 'Tersalin!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>{lang === 'id' ? 'Salin Kontak Admin' : 'Copy Admin Contact'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Technical Specifications Table */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4 shadow-lg">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 text-xs font-bold text-zinc-400 uppercase tracking-wider">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>{t.about.techSpecsTitle}</span>
        </div>

        <div className="divide-y divide-zinc-800/80 text-xs font-mono">
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-zinc-400">{isId ? 'Versi Modul Terpasang' : 'Installed Module Version'}</span>
            <span className="text-emerald-400 sm:text-right font-bold">{APP_VERSION} (Code: 110)</span>
          </div>
          {t.about.specs.map((item, idx) => (
            <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-zinc-400">{item.label}</span>
              <span className="text-emerald-400 sm:text-right font-medium">{item.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Research Disclaimer */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{t.about.notice}</p>
      </div>

    </div>
  );
};
