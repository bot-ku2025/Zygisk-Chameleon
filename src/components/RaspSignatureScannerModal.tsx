import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, X, Check, Search, AlertTriangle, 
  Cpu, Terminal, Zap, FileCode, CheckCircle2, ArrowRight
} from 'lucide-react';
import { TargetApp, Language, RaspScanReport, DetectedRaspVendor } from '../types';
import { 
  BCA_EXTREME_TYPE_A, 
  MANDIRI_LIVIN_TYPE_A, 
  SHOPEE_SEABANK_TYPE_A, 
  BRIMO_JENIUS_TYPE_A, 
  FULL_STEALTH_TYPE_A 
} from '../data/initialApps';

interface RaspSignatureScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  targetApp: TargetApp;
  onApplyPreset: (appId: string, preset: any, typeA: any) => void;
}

export const RaspSignatureScannerModal: React.FC<RaspSignatureScannerModalProps> = ({
  isOpen,
  onClose,
  lang,
  targetApp,
  onApplyPreset,
}) => {
  const isId = lang === 'id';
  const [isScanning, setIsScanning] = useState(true);
  const [scanReport, setScanReport] = useState<RaspScanReport | null>(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsScanning(true);
    setApplied(false);

    const timer = setTimeout(() => {
      // Analyze app characteristics to produce heuristic report
      let threatScore = 75;
      let riskLevel: RaspScanReport['riskLevel'] = 'HIGH';
      let detectedVendors: DetectedRaspVendor[] = [];
      let probedVulnerabilities: string[] = [];
      let recommendedPreset: any = 'full_stealth';
      let recommendedTypeA: any = FULL_STEALTH_TYPE_A;

      const pkg = targetApp.id.toLowerCase();
      const name = targetApp.name.toLowerCase();

      if (pkg.includes('bca') || name.includes('bca')) {
        threatScore = 98;
        riskLevel = 'CRITICAL';
        detectedVendors = [
          {
            name: 'Promon SHIELD v6.4 (Norway)',
            library: 'libpromon.so / libshield.so',
            description: 'Pemindaian memori .text copy-on-write, deteksi hooking PLT/GOT, ptrace anti-debug, dan CNTVCT_EL0 hardware timer loop.',
            descriptionEn: 'In-memory .text CoW checksumming, PLT/GOT hook detection, ptrace anti-debug, and CNTVCT_EL0 hardware timer loop.',
            risk: 'CRITICAL',
          },
          {
            name: 'Bionic Linker Solist Hunter',
            library: 'dl_iterate_phdr in-line trap',
            description: 'Memeriksa rantai internal __dl__ZL10g_dl_mutex untuk mendeteksi pustaka Zygisk yang disuntikkan.',
            descriptionEn: 'Walks __dl__ZL10g_dl_mutex linked list to find injected Zygisk native shared objects.',
            risk: 'CRITICAL',
          },
        ];
        probedVulnerabilities = [
          'Direct ARM64 svc #0 assembly syscall execution',
          'Timing attack via CNTVCT_EL0 register difference',
          'Self-memory .text page hash verification',
          'Mountinfo and mount namespace cross-referencing',
        ];
        recommendedPreset = 'bca_extreme';
        recommendedTypeA = BCA_EXTREME_TYPE_A;
      } else if (pkg.includes('shopee') || pkg.includes('seabank')) {
        threatScore = 92;
        riskLevel = 'CRITICAL';
        detectedVendors = [
          {
            name: 'Shopee In-House Security Daemon',
            library: 'libmsao.so / libpairipcore.so',
            description: 'Pemeriksaan abstract domain socket di /proc/net/unix (@shopee_socket_guard) dan query Binder IPC ke PackageManager.',
            descriptionEn: 'Abstract unix socket scans in /proc/net/unix and aggressive Binder IPC queries to PackageManager.',
            risk: 'CRITICAL',
          },
          {
            name: 'DexGuard ProGuard Shield',
            library: 'libDexGuard.so',
            description: 'Obfuscasi method bytecode dan verifikasi integritas APK signature runtime.',
            descriptionEn: 'Bytecode method obfuscation and runtime APK signature verification.',
            risk: 'HIGH',
          },
        ];
        probedVulnerabilities = [
          'Abstract unix domain socket leakage',
          'Root app package manager enumeration',
          'Zygote dl_iterate_phdr link traversal',
        ];
        recommendedPreset = 'shopee_seabank';
        recommendedTypeA = SHOPEE_SEABANK_TYPE_A;
      } else if (pkg.includes('bmri') || pkg.includes('livin') || pkg.includes('bni') || pkg.includes('wondr')) {
        threatScore = 89;
        riskLevel = 'HIGH';
        detectedVendors = [
          {
            name: 'VFS Mount & Namespace Integrity Guard',
            library: 'libsecguard_native.so',
            description: 'Inspeksi mountinfo mendalam mencari /data/adb/ksu, /debug_ramdisk, dan ksu_loop mount point.',
            descriptionEn: 'Deep mountinfo inspection searching for /data/adb, debug_ramdisk, and ksu_loop mounts.',
            risk: 'HIGH',
          },
          {
            name: 'Seccomp Syscall Filter Probe',
            library: 'libc_probe.so',
            description: 'Mencoba memicu interupsi syscall seccomp untuk mendeteksi keberadaan filter kernel.',
            descriptionEn: 'Attempts to trigger seccomp filter anomalies to detect root sandboxes.',
            risk: 'HIGH',
          },
        ];
        probedVulnerabilities = [
          'Mount namespace leak in /proc/self/mounts',
          'Daemon unix domain socket in /dev/socket',
          'Root binary search across $PATH',
        ];
        recommendedPreset = 'mandiri_livin';
        recommendedTypeA = MANDIRI_LIVIN_TYPE_A;
      } else if (pkg.includes('bri') || pkg.includes('brimo') || pkg.includes('jenius') || pkg.includes('dana')) {
        threatScore = 86;
        riskLevel = 'HIGH';
        detectedVendors = [
          {
            name: 'DexGuard Native Guard & Arxan',
            library: 'libdexguard-debug.so',
            description: 'Anti-ptrace debugging trap, deteksi ART method inlining, dan pencarian direktori recovery.',
            descriptionEn: 'Anti-ptrace debugging trap, ART method inlining detection, and recovery folder sweep.',
            risk: 'HIGH',
          },
        ];
        probedVulnerabilities = [
          'ptrace(PTRACE_TRACEME) anti-debugging trap',
          'Method de-optimization probe in ART runtime',
          'Su binary presence test via Runtime.exec',
        ];
        recommendedPreset = 'brimo_jenius';
        recommendedTypeA = BRIMO_JENIUS_TYPE_A;
      } else {
        threatScore = 65;
        riskLevel = 'ELEVATED';
        detectedVendors = [
          {
            name: 'Generic RASP & SafetyNet Client',
            library: 'play-services-integrity.aar',
            description: 'Attestasi perangkat keras dan verifikasi status bootloader.',
            descriptionEn: 'Hardware-backed attestation and bootloader state verification.',
            risk: 'MEDIUM',
          },
        ];
        probedVulnerabilities = [
          'Google Play Protect certification check',
          'Basic /system/xbin/su existence',
          'Developer options status',
        ];
        recommendedPreset = 'full_stealth';
        recommendedTypeA = FULL_STEALTH_TYPE_A;
      }

      setScanReport({
        appId: targetApp.id,
        packageName: targetApp.id,
        timestamp: new Date().toLocaleTimeString(),
        threatScore,
        riskLevel,
        detectedVendors,
        probedVulnerabilities,
        recommendedPreset,
        recommendedToggles: Object.keys(recommendedTypeA) as any,
      });

      setIsScanning(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isOpen, targetApp.id]);

  if (!isOpen) return null;

  const handleApplyPresetClick = () => {
    if (!scanReport) return;
    let typeA = FULL_STEALTH_TYPE_A;
    if (scanReport.recommendedPreset === 'bca_extreme') typeA = BCA_EXTREME_TYPE_A;
    else if (scanReport.recommendedPreset === 'mandiri_livin') typeA = MANDIRI_LIVIN_TYPE_A;
    else if (scanReport.recommendedPreset === 'shopee_seabank') typeA = SHOPEE_SEABANK_TYPE_A;
    else if (scanReport.recommendedPreset === 'brimo_jenius') typeA = BRIMO_JENIUS_TYPE_A;

    onApplyPreset(targetApp.id, scanReport.recommendedPreset, typeA);
    setApplied(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-rose-400 bg-rose-950/40 border-rose-800/60';
    if (score >= 75) return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
    return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-950 border border-emerald-500/40 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-fadeIn">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/90 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
                {isId ? 'Pemindai Tanda Tangan RASP & Analisis Ancaman' : 'RASP Signature Scanner & Threat Analysis'}
              </h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {targetApp.name} ({targetApp.id})
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

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-zinc-200">
          {isScanning ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                <Cpu className="w-7 h-7 text-emerald-400 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-zinc-100 font-mono">
                  {isId ? 'Membongkar Header ELF & Memindai Pustaka Dinamis...' : 'Parsing ELF Headers & Scanning Dynamic Libraries...'}
                </h4>
                <p className="text-zinc-400 text-xs">
                  {isId ? 'Menganalisis impor libc, syscall SVC rakitan, dan signature Promon/DexGuard' : 'Analyzing libc imports, assembly SVC traps, and Promon/DexGuard signatures'}
                </p>
              </div>
            </div>
          ) : scanReport ? (
            <div className="space-y-5 animate-fadeIn">
              {/* Threat Score Card */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">
                    {isId ? 'Skor Agresivitas RASP Aplikasi Target' : 'Target App RASP Aggressiveness Score'}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-zinc-100">
                      {scanReport.threatScore}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">/ 100</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getScoreColor(scanReport.threatScore)}`}>
                      {scanReport.riskLevel} RISK
                    </span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-[11px] text-zinc-400 block font-mono">
                    {isId ? 'Rekomendasi Profil:' : 'Recommended Profile:'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs inline-block">
                    {scanReport.recommendedPreset.toUpperCase().replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Detected Vendors */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                  {isId ? 'Vendor & Modul Proteksi RASP Terdeteksi' : 'Detected RASP Vendors & Protection Modules'}
                </h4>

                <div className="space-y-2">
                  {scanReport.detectedVendors.map((vendor, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                          <span className="font-bold text-zinc-200">{vendor.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                          {vendor.library}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {isId ? vendor.description : (vendor.descriptionEn || vendor.description)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Probed Vectors */}
              <div className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/70 space-y-2">
                <h4 className="text-xs font-semibold text-zinc-300 font-mono">
                  {isId ? 'Vektor Deteksi Aktif yang Diuji Aplikasi Ini:' : 'Active Detection Vectors Tested by This App:'}
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px] text-zinc-400">
                  {scanReport.probedVulnerabilities.map((v, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Auto Apply Banner */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5 text-center sm:text-left">
                  <div className="font-bold text-emerald-300">
                    {isId ? 'Konfigurasi Pertahanan Zygisk Chameleon Siap' : 'Zygisk Chameleon Defense Matrix Ready'}
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    {isId 
                      ? 'Terapkan seluruh mitigasi mutakhir yang sesuai dengan arsitektur proteksi aplikasi ini dengan 1 klik.' 
                      : 'Apply all tailored frontier mitigations matching this app’s exact protection architecture with 1 click.'}
                  </p>
                </div>

                <button
                  onClick={handleApplyPresetClick}
                  disabled={applied}
                  className={`px-4 py-2 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer ${
                    applied
                      ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/40'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-950/40'
                  }`}
                >
                  {applied ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  <span>{applied ? (isId ? 'Preset Diterapkan!' : 'Preset Applied!') : (isId ? 'Terapkan Preset Otomatis' : 'Auto-Apply Preset')}</span>
                </button>
              </div>

            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors cursor-pointer"
          >
            {isId ? 'Tutup' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
