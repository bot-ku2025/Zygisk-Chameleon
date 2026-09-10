import React, { useState } from 'react';
import { 
  Layers, ChevronDown, Cpu, CheckCircle2, Sliders, 
  ExternalLink, Terminal, Shield, RefreshCw, Power, FolderOpen
} from 'lucide-react';
import { RootModule, Language } from '../types';
import { ModuleAccessModal } from './ModuleAccessModal';

interface InstalledModulesAccordionProps {
  modules: RootModule[];
  setModules: React.Dispatch<React.SetStateAction<RootModule[]>>;
  lang: Language;
  onOpenChameleonConfig?: () => void;
  onOpenIntegrityCheck?: () => void;
}

export const InstalledModulesAccordion: React.FC<InstalledModulesAccordionProps> = ({
  modules,
  setModules,
  lang,
  onOpenChameleonConfig,
  onOpenIntegrityCheck,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedModule, setSelectedModule] = useState<RootModule | null>(null);

  const isId = lang === 'id';
  const activeCount = modules.filter((m) => m.enabled).length;

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

  return (
    <div className="mb-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md backdrop-blur-sm overflow-hidden transition-all duration-200">
      {/* Expandable Accordion Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 sm:p-4 flex items-center justify-between text-left hover:bg-zinc-800/40 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Layers className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-zinc-100">
                {isId ? 'Modul Terpasang di KernelSU' : 'Modules Installed in KernelSU'}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-mono font-semibold border border-emerald-800/40">
                {modules.length} {isId ? 'Modul' : 'Modules'}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono border border-zinc-700">
                {activeCount} {isId ? 'Aktif' : 'Active'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              {isId 
                ? `/data/adb/modules • Klik untuk ${isExpanded ? 'menutup' : 'menampilkan & mengakses modul'}`
                : `/data/adb/modules • Click to ${isExpanded ? 'collapse' : 'expand & access modules'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 hidden sm:inline font-mono">
            {isExpanded 
              ? (isId ? 'Tutup Panel' : 'Collapse') 
              : (isId ? 'Buka Panel (Expand)' : 'Expand Panel')}
          </span>
          <div
            className={`p-1.5 rounded-lg bg-zinc-800 text-zinc-300 transition-transform duration-200 ${
              isExpanded ? 'rotate-180 text-emerald-400' : ''
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* Expanded Module List & Access Controls */}
      {isExpanded && (
        <div className="border-t border-zinc-800/80 p-3 sm:p-4 bg-zinc-950/60 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pb-1 border-b border-zinc-800/60">
            <span>{isId ? 'DAFTAR MODUL TERINSTALASI (/data/adb/modules)' : 'INSTALLED MODULES LIST (/data/adb/modules)'}</span>
            <span className="text-emerald-400 font-semibold">{isId ? 'AKSES ROOT: UID 0 (SUPERUSER)' : 'ROOT ACCESS: UID 0 (SUPERUSER)'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  mod.enabled
                    ? 'bg-zinc-900/70 border-zinc-800 hover:border-emerald-500/50 shadow-sm'
                    : 'bg-zinc-950/50 border-zinc-800/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        mod.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                      }`}
                    />
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-100 hover:text-emerald-400 transition-colors">
                      {mod.name}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-emerald-400 border border-zinc-700">
                      {mod.version}
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggleModule(mod.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border transition-colors cursor-pointer ${
                      mod.enabled
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800/50'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {mod.enabled ? (isId ? 'AKTIF' : 'ACTIVE') : (isId ? 'NONAKTIF' : 'INACTIVE')}
                  </button>
                </div>

                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                  {mod.description}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/60">
                  <span className="truncate max-w-[140px] text-zinc-400">
                    {isId ? 'Oleh:' : 'By:'} {mod.author}
                  </span>

                  {/* Akses Modul Button */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {mod.id === 'zygisk_chameleon' && onOpenChameleonConfig && (
                      <button
                        onClick={onOpenChameleonConfig}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{isId ? 'WebUI Ini' : 'This WebUI'}</span>
                      </button>
                    )}
                    {mod.id === 'playintegrity_fix' && onOpenIntegrityCheck && (
                      <button
                        onClick={onOpenIntegrityCheck}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800/60 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Shield className="w-3 h-3 text-blue-400" />
                        <span>{isId ? 'Cek Status' : 'Check Status'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedModule(mod)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
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
    </div>
  );
};
