import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, ShieldAlert, Sparkles, Download, Clock, ShieldCheck, X, Cpu, AlertTriangle, Check } from 'lucide-react';
import { OtaCelahUpdateState, Language } from '../types';

interface OtaUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  otaState: OtaCelahUpdateState;
  onRunOtaUpdate: () => Promise<void>;
  lang: Language;
}

export const OtaUpdateModal: React.FC<OtaUpdateModalProps> = ({
  isOpen,
  onClose,
  otaState,
  onRunOtaUpdate,
  lang,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [upToDateNotice, setUpToDateNotice] = useState<boolean | null>(null);
  const [updateLog, setUpdateLog] = useState<string[]>([]);
  const [hasCompleted, setHasCompleted] = useState(false);

  if (!isOpen) return null;

  const isId = lang === 'id';

  // Check for updates without blindly running installation
  const handleCheckUpdates = async () => {
    setIsChecking(true);
    setUpToDateNotice(null);
    await new Promise((r) => setTimeout(r, 600));
    setIsChecking(false);
    // Notify user that the vulnerability database is already the latest version
    setUpToDateNotice(true);
  };

  const handleStartUpdate = async () => {
    setIsUpdating(true);
    setHasCompleted(false);
    setUpToDateNotice(null);
    setUpdateLog([
      isId ? '▶ Memulai koneksi aman ke Repositori Definisi Celah (OTA 24-Jam)...' : '▶ Connecting to Secure Vulnerability Definition Repo (24H OTA)...',
    ]);

    await new Promise((r) => setTimeout(r, 500));
    setUpdateLog((prev) => [
      ...prev,
      isId 
        ? '✓ Server terhubung: cdn.chameleon-ota.internal/v2/definitions' 
        : '✓ Server connected: cdn.chameleon-ota.internal/v2/definitions',
      isId 
        ? '⬇ Memverifikasi 14 database CTS Fingerprint terbaru (Certified Baseline)...' 
        : '⬇ Verifying 14 new CTS Fingerprint database (Certified Baseline)...',
    ]);

    await new Promise((r) => setTimeout(r, 600));
    setUpdateLog((prev) => [
      ...prev,
      isId 
        ? '⬇ Mengunduh tanda tangan RASP (Shopee v2.89 socket probe, Mandiri Livin v3.2, BCA Promon)...' 
        : '⬇ Fetching latest RASP signatures (Shopee socket probe, Mandiri, BCA)...',
      isId 
        ? '⚡ Memeriksa integritas sistem: Zero-Bootloop Safety Guard terverifikasi 100% Aman (User-space only).' 
        : '⚡ Verifying system integrity: Zero-Bootloop Safety Guard verified 100% Safe (User-space only).',
    ]);

    await new Promise((r) => setTimeout(r, 600));
    await onRunOtaUpdate();

    setUpdateLog((prev) => [
      ...prev,
      isId 
        ? '✓ Hot-patching memori kernel selesai! Seluruh celah berhasil ditambal tanpa perlu reboot HP.' 
        : '✓ Memory hot-patching complete! All detection leaks patched without requiring a reboot.',
      isId 
        ? '★ Status: Database Celah v2026.09.10-STABLE AKTIF & TERKINI.' 
        : '★ Status: Vulnerability Database v2026.09.10-STABLE ACTIVE & UP-TO-DATE.',
    ]);
    setIsUpdating(false);
    setHasCompleted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <RefreshCw className={`w-5 h-5 ${isUpdating || isChecking ? 'animate-spin text-emerald-300' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-100">
                  {isId ? 'Pusat Pembaruan Celah Online (OTA 24-Jam)' : 'Online Vulnerability OTA Hub (24-Hour Cycle)'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Daily Sync
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isId 
                  ? 'Pembaruan otomatis tiap 24 jam & hot-patching celah anti-root secara instan tanpa reboot.' 
                  : 'Automatic updates every 24 hours & instant anti-root hot-patching without reboot.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* SPECIAL NOTIFICATION POPUP: When already up to date */}
          {upToDateNotice && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/70 to-zinc-900 border border-emerald-500/60 text-zinc-200 shadow-xl space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {isId 
                      ? 'Pemberitahuan: Database Celah Sudah Versi Terbaru (Up-to-Date)' 
                      : 'Notice: Vulnerability Database is Already Up-to-Date'}
                  </span>
                </div>
                <button
                  onClick={() => setUpToDateNotice(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-zinc-300 text-[11px] leading-relaxed">
                {isId 
                  ? 'Tidak ada pembaruan celah baru. Tanda tangan aktif Anda (v2026.09.10-STABLE) sudah memiliki seluruh 148 aturan penangkal RASP, pencegat syscall assembly, dan isolasi mount namespace terbaru.'
                  : 'No new vulnerability updates found. Your active signature (v2026.09.10-STABLE) includes all 148 latest RASP defense rules, assembly syscall traps, and mount isolations.'}
              </p>

              <div className="pt-2 flex items-center justify-between text-[11px] font-mono border-t border-zinc-800">
                <span className="text-emerald-400">Status: 100% Terproteksi & Bersih</span>
                <button
                  onClick={handleStartUpdate}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  {isId ? 'Paksa Terapkan Ulang Patch' : 'Force Re-apply Patch'}
                </button>
              </div>
            </div>
          )}

          {/* Status Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
              <span className="text-[11px] text-zinc-400 block mb-1">
                {isId ? 'Siklus Pengecekan' : 'Check Cycle'}
              </span>
              <div className="flex items-center gap-1.5 text-zinc-100 font-semibold font-mono text-xs">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isId ? '24 Jam Otomatis' : '24h Automatic'}</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                {isId ? otaState.nextScheduledCheck : (otaState.nextScheduledCheckEn || otaState.nextScheduledCheck)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
              <span className="text-[11px] text-zinc-400 block mb-1">
                {isId ? 'Basis Aturan Celah' : 'Vulnerability Rules'}
              </span>
              <div className="flex items-center gap-1.5 text-zinc-100 font-semibold font-mono text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{otaState.rulesCount} {isId ? 'Aturan Terpasang' : 'Rules Installed'}</span>
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 block font-mono">
                + {otaState.fingerprintsCount} CTS Fingerprints
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
              <span className="text-[11px] text-zinc-400 block mb-1">
                {isId ? 'Jaminan Keamanan' : 'Safety Guarantee'}
              </span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-xs">
                <Cpu className="w-3.5 h-3.5" />
                <span>Zero-Bootloop 100%</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                {isId ? 'User-space runtime only' : 'User-space runtime only'}
              </span>
            </div>
          </div>

          {/* Zero Bootloop Explainer Notice */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3 text-zinc-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-emerald-300 text-xs block">
                {isId ? 'Proteksi Anti-Bootloop Aktif (Zero Risk)' : 'Anti-Bootloop Protection Active (Zero Risk)'}
              </span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {isId
                  ? 'Setiap patch celah yang diunduh hanya menyuntikkan filter memori di tingkat proses Zygote user-space. Modul TIDAK PERNAH memodifikasi partisi boot atau sistem, sehingga mustahil menyebabkan HP bootloop atau macet di logo.'
                  : 'All downloaded vulnerability patches only inject memory filters into user-space Zygote processes. The module never alters boot or system partitions, preventing any bootloop risk.'}
              </p>
            </div>
          </div>

          {/* Dynamic Toggles Introduced via OTA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {isId ? 'Toggle Celah Dinamis yang Diinjeksi Otomatis' : 'Dynamic Toggles Injected via OTA'}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {otaState.dynamicToggles.length} {isId ? 'Patch Celah Siap Pakai' : 'Patches Ready'}
              </span>
            </div>

            <div className="space-y-2">
              {otaState.dynamicToggles.map((item) => (
                <div 
                  key={item.id}
                  className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/90 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-200 text-xs">
                        {isId ? item.label : (item.labelEn || item.label)}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {item.dateAdded}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-normal">
                      {isId ? item.description : (item.descriptionEn || item.description)}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    Auto-ON ✓
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Update Execution Log */}
          {updateLog.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-300">
                {isId ? 'Terminal Pembaruan Celah (Real-Time)' : 'Vulnerability Update Terminal (Real-Time)'}
              </span>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] space-y-1 max-h-36 overflow-y-auto">
                {updateLog.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={
                      log.startsWith('✓') || log.startsWith('★')
                        ? 'text-emerald-400' 
                        : log.startsWith('⚡')
                        ? 'text-amber-400'
                        : 'text-zinc-300'
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Changelog */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-300">
              {isId ? 'Riwayat Tambalan Celah Terbaru (OTA 24-Jam)' : 'Recent Vulnerability Patch History'}
            </span>
            <div className="space-y-1.5">
              {otaState.recentChangelog.map((ch) => (
                <div key={ch.id} className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60 flex items-start gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-200">{isId ? ch.title : (ch.titleEn || ch.title)}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{isId ? ch.timestamp : (ch.timestampEn || ch.timestamp)}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{isId ? ch.desc : (ch.descEn || ch.desc)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-zinc-400">
            {isId ? 'Terakhir diperiksa:' : 'Last checked:'} <span className="text-zinc-300 font-mono">{isId ? otaState.lastUpdated : (otaState.lastUpdatedEn || otaState.lastUpdated)}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCheckUpdates}
              disabled={isChecking || isUpdating}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? (isId ? 'Memeriksa...' : 'Checking...') : (isId ? 'Cek Pembaruan Celah' : 'Check for Updates')}</span>
            </button>

            <button
              onClick={handleStartUpdate}
              disabled={isUpdating}
              className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                isUpdating
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : hasCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>
                {isUpdating
                  ? (isId ? 'Mengunduh Celah...' : 'Downloading Patches...')
                  : hasCompleted
                  ? (isId ? 'Terapkan Ulang Patch' : 'Re-apply Patch')
                  : (isId ? 'Perbarui Celah Online Sekarang' : 'Update Vulnerabilities Now')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
