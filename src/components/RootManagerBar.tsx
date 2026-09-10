import React, { useState } from 'react';
import { 
  ShieldCheck, Cpu, Info, CheckCircle2, X 
} from 'lucide-react';
import { Language, RootEnvironment } from '../types';
import { translations } from '../locales/dictionary';

interface RootManagerBarProps {
  rootEnv: RootEnvironment;
  lang: Language;
}

export const RootManagerBar: React.FC<RootManagerBarProps> = ({ rootEnv, lang }) => {
  const t = translations[lang];
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Installed Root Manager Information Bar */}
      <div className="mb-5 p-3 sm:p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Installed Root Manager Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-inner">
              <Cpu className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  {t.rootManager.title}:
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border bg-emerald-500/15 text-emerald-400 border-emerald-500/40">
                  {rootEnv.manager} {rootEnv.version} ({rootEnv.versionCode})
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {t.rootManager.granted}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-zinc-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="text-zinc-500">Mode:</span>
                  <span className="text-zinc-200">{rootEnv.mode}</span>
                </span>
                <span className="text-zinc-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <span className="text-zinc-500">SELinux:</span>
                  <span className="text-emerald-400">{rootEnv.selinux}</span>
                </span>
                <span className="text-zinc-600 hidden md:inline">•</span>
                <span className="hidden md:flex items-center gap-1 truncate max-w-xs">
                  <span className="text-zinc-500">Path:</span>
                  <span className="text-zinc-300 truncate">{rootEnv.suPath}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Diagnostic Details Button */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/80 flex items-center gap-1.5 transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'id' ? 'Info Root' : 'Root Info'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Root Environment Inspector Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-emerald-900/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
            <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold text-zinc-100">
                  {t.rootManager.detailsModalTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Manager:</span>
                <span className="text-emerald-400 font-bold">{rootEnv.manager} {rootEnv.version}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Version Code:</span>
                <span className="text-zinc-200">{rootEnv.versionCode}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Architecture Hook:</span>
                <span className="text-zinc-200">{rootEnv.mode}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">{t.rootManager.selinuxLabel}:</span>
                <span className="text-emerald-400 font-semibold">{rootEnv.selinux} (Strict)</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">{t.rootManager.suPathLabel}:</span>
                <span className="text-zinc-300 truncate max-w-[220px]">{rootEnv.suPath}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">{t.rootManager.modulePathLabel}:</span>
                <span className="text-zinc-300 truncate max-w-[220px]">{rootEnv.modulePath}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">{t.rootManager.zygiskEngineLabel}:</span>
                <span className="text-emerald-400 font-semibold">{rootEnv.zygiskStatus}</span>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
              >
                {t.rootManager.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
