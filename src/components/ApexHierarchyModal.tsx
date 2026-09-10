import React, { useState } from 'react';
import { 
  X, Shield, ShieldCheck, Cpu, Sparkles, Check, 
  Layers, Terminal, Award, Lock, ExternalLink, Zap
} from 'lucide-react';
import { Language, TargetApp } from '../types';
import { translations } from '../locales/dictionary';
import { APEX_HIERARCHY_TIERS } from '../data/apexHierarchyData';

interface ApexHierarchyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onActivateApexGodmode: () => void;
  appsCount: number;
}

export const ApexHierarchyModal: React.FC<ApexHierarchyModalProps> = ({
  isOpen,
  onClose,
  lang,
  onActivateApexGodmode,
  appsCount,
}) => {
  const isId = lang === 'id';
  const t = translations[lang];
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [isActivating, setIsActivating] = useState(false);
  const [activatedSuccess, setActivatedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleActivate = () => {
    setIsActivating(true);
    setTimeout(() => {
      onActivateApexGodmode();
      setIsActivating(false);
      setActivatedSuccess(true);
      setTimeout(() => setActivatedSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-inner">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                  {isId ? 'Arsitektur Lapisan Proteksi Sistem' : 'System Protection Architecture Layers'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-emerald-400 border border-emerald-500/30 font-medium">
                  {isId ? '5 LAPISAN' : '5 LAYERS'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isId 
                  ? 'Struktur teknis isolasi kernel, namespace VFS, dan runtime Zygisk Chameleon secara mandiri.'
                  : 'Technical structure of kernel isolation, VFS namespace, and Zygisk Chameleon runtime.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* Master Full Protection Activation Banner */}
          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h4 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight">
                    {isId ? 'Terapkan Konfigurasi Proteksi Lengkap' : 'Apply Full Protection Profile'}
                  </h4>
                </div>
                <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
                  {isId
                    ? 'Terapkan seluruh parameter isolasi Ring-0 Kernel GKI, filter eBPF raw syscall, isolasi namespace VFS ephemeral, dan pengamanan bionic linker ke seluruh aplikasi target secara serentak.'
                    : 'Apply all Ring-0 Kernel GKI isolation parameters, eBPF raw syscall filters, ephemeral VFS namespace isolation, and bionic linker safeguards to all target apps simultaneously.'}
                </p>
              </div>

              <button
                onClick={handleActivate}
                disabled={isActivating}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {activatedSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{isId ? 'Berhasil Diterapkan!' : 'Successfully Applied!'}</span>
                  </>
                ) : isActivating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-white" />
                    <span>{isId ? 'Menerapkan Konfigurasi...' : 'Applying Configuration...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isId ? 'Terapkan ke Seluruh Aplikasi' : 'Apply to All Apps'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick stats pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800 text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">{isId ? 'Cakupan Lapisan' : 'Layer Scope'}</span>
                <strong className="text-emerald-400">Ring-0 s/d Framework</strong>
              </div>
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">{isId ? 'Isolasi VFS' : 'VFS Isolation'}</span>
                <strong className="text-emerald-400">MNT_DETACH Clean</strong>
              </div>
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">{isId ? 'Hardware TEE' : 'Hardware TEE'}</span>
                <strong className="text-emerald-400">StrongBox Keymint</strong>
              </div>
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">{isId ? 'Aplikasi Terdaftar' : 'Registered Apps'}</span>
                <strong className="text-emerald-400">{appsCount} Aplikasi</strong>
              </div>
            </div>
          </div>

          {/* Hierarchy Breakdown: Tier 0 to Tier 4 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>{isId ? 'Struktur 5 Lapisan Proteksi Sistem' : 'System Protection 5-Layer Architecture'}</span>
            </h4>

            <div className="space-y-3">
              {APEX_HIERARCHY_TIERS.map((tier) => {
                const isSelected = selectedTier === tier.level;
                const isApex = tier.level === 0;

                return (
                  <div
                    key={tier.level}
                    onClick={() => setSelectedTier(tier.level)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isApex
                        ? isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/60 ring-1 ring-emerald-500/50'
                          : 'bg-zinc-900/80 border-emerald-500/50 hover:border-emerald-400'
                        : isSelected
                          ? 'bg-zinc-900 border-zinc-600'
                          : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                          isApex
                            ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          Tier {tier.level}
                        </span>
                        <h5 className={`text-xs sm:text-sm font-bold ${isApex ? 'text-emerald-300' : 'text-zinc-200'}`}>
                          {tier.rankTitle}
                        </h5>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          isApex 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {tier.bypassEfficiency}
                        </span>
                      </div>
                    </div>

                    {/* Tier Description & Modules */}
                    <div className="mt-3 text-xs text-zinc-300 space-y-2">
                      <p className="leading-relaxed">
                        {isId ? tier.description : (tier.descriptionEn || tier.description)}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-[11px] font-mono">
                        <div>
                          <span className="text-zinc-500">{isId ? 'Cakupan & Kedalaman: ' : 'Scope & Depth: '}</span>
                          <span className="text-zinc-300">{tier.depth}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">{isId ? 'Status RASP Perbankan: ' : 'Banking RASP Status: '}</span>
                          <span className={isApex ? 'text-emerald-400 font-semibold' : 'text-rose-400'}>
                            {tier.detectedByRasp}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500">{isId ? 'Tahap Eksekusi: ' : 'Execution Stage: '}</span>
                          <span className="text-zinc-300">{tier.executionStage}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">{isId ? 'Contoh Modul: ' : 'Example Modules: '}</span>
                          <span className={isApex ? 'text-emerald-300 font-bold' : 'text-zinc-300'}>
                            {tier.modulesInTier.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technical Details Box */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>{isId ? 'Rincian Teknis Implementasi Proteksi Mandiri' : 'Technical Details: Core Protection Implementation'}</span>
            </div>
            
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 space-y-2 text-[11px] leading-relaxed">
              <p>
                <span className="text-emerald-400 font-bold">1. Intersepsi Ring 0 (Kernel GKI & eBPF):</span> Menangani pemanggilan langsung instruksi assembler raw SVC #0 di level tracepoint kernel sehingga pemanggilan sistem dari proses target tetap dapat dipantau dan disanitasi sebelum dieksekusi.
              </p>
              <p>
                <span className="text-emerald-400 font-bold">2. Isolasi VFS Ephemeral:</span> Memanggil unmount2(MNT_DETACH) dan mengisolasi namespace mount sebelum proses target diinisialisasi, menghasilkan rekaman /proc/[pid]/mountinfo yang bersih dan bebas artefak.
              </p>
              <p>
                <span className="text-emerald-400 font-bold">3. StrongBox Hardware-backed TEE:</span> Mengarahkan evaluasi keystore ke emulasi Keymint HAL dengan status bootloader verifiedbootstate=green untuk mendukung kestabilan evaluasi integritas hardware.
              </p>
              <p>
                <span className="text-teal-400 font-bold">4. Normalisasi Register Waktu (CNTVCT_EL0):</span> Menyelaraskan pembacaan register counter cycle ARM64 sehingga selisih waktu eksekusi syscall tampil wajar dan selaras dengan waktu CPU native.
              </p>
              <p>
                <span className="text-teal-400 font-bold">5. Pemetaan Memori .text Shadow-Mapping:</span> Memisahkan halaman Read dan Execute guna menjaga keaslian pembacaan hash SHA-256 biner pada memori proses.
              </p>
              <p>
                <span className="text-teal-400 font-bold">6. Dynamic Keybox & Task Thread Scrubber:</span> Pembersihan thread background dari /proc/[pid]/task/ agar thread internal tidak terekspos ke scanner proses target.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">
            Zygisk Chameleon • Core System Architecture v1.0.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
          >
            {isId ? 'Tutup' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
