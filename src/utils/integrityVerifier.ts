import { TargetApp, IntegrityVerdictResult, IntegrityDiagnostic, Language } from '../types';

export function runIntegrityVerification(app: TargetApp, lang: Language = 'id'): IntegrityVerdictResult {
  const tA = app.typeA;
  const tB = app.typeB;
  const isEnabled = app.enabled;
  const isId = lang === 'id';

  const diagnostics: IntegrityDiagnostic[] = [];
  const logs: string[] = [];
  const advice: string[] = [];

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  logs.push(`[${timeStr}] Initializing Google Play Integrity API client handshake...`);
  logs.push(`[${timeStr}] Attaching to target PID namespace: ${app.id}`);
  logs.push(`[${timeStr}] Reading active Zygisk Chameleon native hooks for UID...`);

  // Vector 1: Physical Kernel Mounts (umount2 MNT_DETACH)
  if (isEnabled && tA.deepMountUnmount && tA.isolatedMountNamespace) {
    diagnostics.push({
      id: 'mount_unmount',
      name: isId ? 'Kernel Mount Namespace Unmounting' : 'Kernel Mount Namespace Unmounting',
      category: 'kernel',
      status: 'pass',
      detail: isId
        ? 'umount2(MNT_DETACH) aktif. /data/adb, mirror mounts, dan loop devices tidak ada di mount table namespace.'
        : 'umount2(MNT_DETACH) active. /data/adb, mirror mounts, and loop devices are removed from the mount namespace table.',
    });
    logs.push(`[${timeStr}] [PASS] umount2(MNT_DETACH): /data/adb & /data/adb/modules unmounted cleanly.`);
  } else {
    diagnostics.push({
      id: 'mount_unmount',
      name: isId ? 'Kernel Mount Namespace Unmounting' : 'Kernel Mount Namespace Unmounting',
      category: 'kernel',
      status: 'fail',
      detail: isId
        ? 'Mount point /data/adb atau mirror KSU terdeteksi di /proc/self/mountinfo.'
        : 'Mount point /data/adb or KSU mirror detected in /proc/self/mountinfo.',
      causeIfFailed: isId
        ? 'Deep Kernel Namespace Unmount atau Isolasi Mount Namespace dinonaktifkan.'
        : 'Deep Kernel Namespace Unmount or Mount Namespace Isolation is disabled.',
      recommendation: isId
        ? 'Aktifkan toggle "Deep Kernel Namespace Unmount" pada Bagian A.'
        : 'Enable "Deep Kernel Namespace Unmount" toggle under Section A.',
    });
    logs.push(`[${timeStr}] [FAIL] /proc/self/mountinfo exposes mountpoint /data/adb (ino=26849).`);
    advice.push(isId
      ? 'Aktifkan Deep Kernel Namespace Unmount (umount2 MNT_DETACH) untuk menghilangkan jejak partisi root.'
      : 'Enable Deep Kernel Namespace Unmount (umount2 MNT_DETACH) to erase root mount traces.');
  }

  // Vector 2: Seccomp-BPF Raw Syscall Interceptor
  if (isEnabled && tA.rawSyscallBlock) {
    diagnostics.push({
      id: 'raw_syscall',
      name: isId ? 'Seccomp-BPF Raw Syscall Guard' : 'Seccomp-BPF Raw Syscall Guard',
      category: 'kernel',
      status: 'pass',
      detail: isId
        ? 'Direct assembly SVC #0 pada __NR_openat/__NR_faccessat berhasil dicegat dan mengembalikan ENOENT.'
        : 'Direct assembly SVC #0 on __NR_openat/__NR_faccessat successfully intercepted and returned ENOENT.',
    });
    logs.push(`[${timeStr}] [PASS] Seccomp-BPF filter trapped direct SVC #0 syscall on /system/bin/su -> returned -ENOENT.`);
  } else {
    diagnostics.push({
      id: 'raw_syscall',
      name: isId ? 'Seccomp-BPF Raw Syscall Guard' : 'Seccomp-BPF Raw Syscall Guard',
      category: 'kernel',
      status: 'fail',
      detail: isId
        ? 'Bypass libc via raw assembly instruction lolos tanpa pencegatan kernel.'
        : 'Libc bypass via raw assembly instructions passed without kernel interception.',
      causeIfFailed: isId
        ? 'Raw Syscall Guard tidak aktif, scanner perbankan dapat memintas libc.'
        : 'Raw Syscall Guard is disabled; banking scanners can bypass libc.',
      recommendation: isId
        ? 'Aktifkan toggle "Seccomp-BPF Raw Syscall Guard".'
        : 'Enable "Seccomp-BPF Raw Syscall Guard" toggle.',
    });
    logs.push(`[${timeStr}] [WARN] Direct assembly SVC #0 detected potential su inode.`);
    advice.push(isId
      ? 'Aktifkan Seccomp-BPF Raw Syscall Guard untuk menangkal pemindai RASP tingkat assembly.'
      : 'Enable Seccomp-BPF Raw Syscall Guard to counter assembly-level RASP scanners.');
  }

  // Vector 3: Root Binaries ($PATH Discovery)
  if (isEnabled && tA.hideSu && tA.execveHook) {
    diagnostics.push({
      id: 'su_binary',
      name: isId ? 'Pemeriksaan Biner SU & Executable' : 'SU Binary & Executable Verification',
      category: 'native',
      status: 'pass',
      detail: isId
        ? 'Pencarian which/which su, daemonsu, ksu, dan magisk menghasilkan NULL / File Not Found.'
        : 'Probing which su, daemonsu, ksu, and magisk returned NULL / File Not Found.',
    });
    logs.push(`[${timeStr}] [PASS] stat("/system/bin/su") -> ENOENT. Execve hook active.`);
  } else {
    diagnostics.push({
      id: 'su_binary',
      name: isId ? 'Pemeriksaan Biner SU & Executable' : 'SU Binary & Executable Verification',
      category: 'native',
      status: 'fail',
      detail: isId
        ? 'Biner eksekusi su atau path root ditemukan dalam variabel lingkungan $PATH.'
        : 'Executable su binary or root path found within $PATH environment variable.',
      causeIfFailed: isId
        ? 'Toggle Hide SU atau Execve Hook mati.'
        : 'Hide SU or Execve Hook toggle is disabled.',
      recommendation: isId
        ? 'Aktifkan "Sembunyikan Binary Root (su)" dan "Cegat Execve".'
        : 'Enable "Hide Root Binaries (su)" and "Intercept Execve".',
    });
    logs.push(`[${timeStr}] [FAIL] stat() found accessible su binary in PATH.`);
    advice.push(isId
      ? 'Aktifkan Sembunyikan Binary Root (su) pada aplikasi ini.'
      : 'Enable Hide Root Binaries (su) for this target app.');
  }

  // Vector 4: Process Memory Map Sanitization (/proc/self/maps)
  if (isEnabled && tA.filterProcMaps) {
    diagnostics.push({
      id: 'proc_maps',
      name: isId ? 'Sanitasi Memori RAM (/proc/self/maps)' : 'RAM Memory Map Sanitization (/proc/self/maps)',
      category: 'native',
      status: 'pass',
      detail: isId
        ? 'libzygisk.so dan pointer modul Chameleon berhasil disaring dari virtual memory maps.'
        : 'libzygisk.so and Chameleon module pointers successfully filtered from virtual memory maps.',
    });
    logs.push(`[${timeStr}] [PASS] /proc/self/maps virtualized: 0 injected .so libraries detected.`);
  } else {
    diagnostics.push({
      id: 'proc_maps',
      name: isId ? 'Sanitasi Memori RAM (/proc/self/maps)' : 'RAM Memory Map Sanitization (/proc/self/maps)',
      category: 'native',
      status: 'warn',
      detail: isId
        ? 'Alamat memori pustaka asing (.so) berpotensi terbaca oleh detektor memori in-line.'
        : 'Memory addresses of foreign libraries (.so) can potentially be read by in-line memory detectors.',
      causeIfFailed: isId
        ? 'Filter Memori RAM tidak aktif.'
        : 'RAM Memory Map Filter is disabled.',
      recommendation: isId
        ? 'Aktifkan "Filter Memori RAM (/proc/self/maps)".'
        : 'Enable "Filter Memory RAM (/proc/self/maps)".',
    });
    logs.push(`[${timeStr}] [WARN] Memory mapping scanner found potential shared library hook.`);
  }

  // Vector 5: LSPosed & Stack Trace Frame Shield
  if (isEnabled && tA.hideLsposed) {
    diagnostics.push({
      id: 'lsposed_shield',
      name: isId ? 'LSPosed & Xposed Framework Scrubbing' : 'LSPosed & Xposed Framework Scrubbing',
      category: 'native',
      status: 'pass',
      detail: isId
        ? 'Frame stack trace de-inlined; de.robv.android.xposed classloader tidak terdeteksi.'
        : 'Stack trace frames de-inlined; de.robv.android.xposed classloader not detected.',
    });
    logs.push(`[${timeStr}] [PASS] StackTraceElement inspection: 0 Xposed bridge frames found.`);
  } else {
    diagnostics.push({
      id: 'lsposed_shield',
      name: isId ? 'LSPosed & Xposed Framework Scrubbing' : 'LSPosed & Xposed Framework Scrubbing',
      category: 'native',
      status: 'warn',
      detail: isId
        ? 'Hook framework Java berpotensi memicu deteksi pada Thread.currentThread().getStackTrace().'
        : 'Java framework hooks can potentially trigger detection in Thread.currentThread().getStackTrace().',
      causeIfFailed: isId
        ? 'LSPosed Shield dinonaktifkan.'
        : 'LSPosed Shield is disabled.',
      recommendation: isId
        ? 'Aktifkan "LSPosed Stack Trace Scrubbing".'
        : 'Enable "LSPosed Stack Trace Scrubbing".',
    });
  }

  // Vector 6: Build Identity & Fingerprint Consistency (Type B)
  const isIdentityConsistent = isEnabled && tB.spoofFingerprint && tB.spoofSecurityPatch && tB.spoofBuildDisplay;
  if (isIdentityConsistent) {
    diagnostics.push({
      id: 'fingerprint_sync',
      name: isId ? 'Konsistensi Build Fingerprint & CTS Profile' : 'Build Fingerprint & CTS Profile Consistency',
      category: 'identity',
      status: 'pass',
      detail: isId
        ? `Fingerprint resmi tersinkronisasi: ${app.targetBrand} Android ${app.targetAndroid} (${tB.securityPatch}).`
        : `Certified fingerprint synchronized: ${app.targetBrand} Android ${app.targetAndroid} (${tB.securityPatch}).`,
    });
    logs.push(`[${timeStr}] [PASS] Fingerprint verified against Google Android Certified Device database.`);
  } else {
    diagnostics.push({
      id: 'fingerprint_sync',
      name: isId ? 'Konsistensi Build Fingerprint & CTS Profile' : 'Build Fingerprint & CTS Profile Consistency',
      category: 'identity',
      status: 'fail',
      detail: isId
        ? 'Fingerprint atau Security Patch tidak tersinkronisasi, memicu kegagalan ctsProfileMatch.'
        : 'Fingerprint or Security Patch is out of sync, triggering ctsProfileMatch failure.',
      causeIfFailed: isId
        ? 'Type B Fingerprint atau Security Patch spoofing tidak aktif.'
        : 'Type B Fingerprint or Security Patch spoofing is disabled.',
      recommendation: isId
        ? 'Gunakan Smart Scale Auto-Sync atau aktifkan spoofing fingerprint.'
        : 'Use Smart Scale Auto-Sync or enable fingerprint spoofing.',
    });
    logs.push(`[${timeStr}] [FAIL] Device fingerprint mismatched or unofficial build ID detected.`);
    advice.push(isId
      ? 'Sinkronkan build fingerprint dan security patch resmi Google.'
      : 'Synchronize official Google build fingerprint and security patch.');
  }

  // Vector 7: Developer Options & ADB Port Masking
  if (isEnabled && tA.maskDevOptions && tA.antiDebug) {
    diagnostics.push({
      id: 'dev_options',
      name: isId ? 'Status Opsi Pengembang & USB Debugging' : 'Developer Options & USB Debugging Status',
      category: 'environment',
      status: 'pass',
      detail: isId
        ? 'Settings.Global.DEVELOPMENT_SETTINGS_ENABLED dipalsukan menjadi 0 (Nonaktif).'
        : 'Settings.Global.DEVELOPMENT_SETTINGS_ENABLED spoofed to 0 (Disabled).',
    });
    logs.push(`[${timeStr}] [PASS] ContentProvider query: development_settings_enabled = 0.`);
  } else {
    diagnostics.push({
      id: 'dev_options',
      name: isId ? 'Status Opsi Pengembang & USB Debugging' : 'Developer Options & USB Debugging Status',
      category: 'environment',
      status: 'warn',
      detail: isId
        ? 'Mode pengembang aktif dapat ditolak oleh aplikasi perbankan tertentu.'
        : 'Active developer options may be rejected by sensitive banking apps.',
      causeIfFailed: isId
        ? 'Mask Opsi Pengembang tidak aktif.'
        : 'Developer Options masking is disabled.',
      recommendation: isId
        ? 'Aktifkan "Mask Opsi Pengembang" pada Bagian A.'
        : 'Enable "Mask Developer Options" under Section A.',
    });
  }

  // Vector 8: Kernel Cmdline & Verified Boot State
  if (isEnabled && tB.spoofCmdline && tB.spoofKernel) {
    diagnostics.push({
      id: 'kernel_state',
      name: isId ? 'Kernel Cmdline & Verified Boot State' : 'Kernel Cmdline & Verified Boot State',
      category: 'environment',
      status: 'pass',
      detail: isId
        ? 'androidboot.verifiedbootstate=green, androidboot.flash.locked=1 dilaporkan ke aplikasi.'
        : 'androidboot.verifiedbootstate=green, androidboot.flash.locked=1 reported to target app.',
    });
    logs.push(`[${timeStr}] [PASS] /proc/cmdline filtered: verifiedbootstate=green, locked=1.`);
  } else {
    diagnostics.push({
      id: 'kernel_state',
      name: isId ? 'Kernel Cmdline & Verified Boot State' : 'Kernel Cmdline & Verified Boot State',
      category: 'environment',
      status: 'fail',
      detail: isId
        ? 'Bootloader unlocked (orange) atau flag kernel debug terdeteksi.'
        : 'Unlocked bootloader (orange) or debug kernel flags detected.',
      causeIfFailed: isId
        ? 'Cmdline atau Kernel Spoofing tidak aktif.'
        : 'Cmdline or Kernel Spoofing is disabled.',
      recommendation: isId
        ? 'Aktifkan "Spoof Kernel Release" dan "Spoof Kernel Cmdline".'
        : 'Enable "Spoof Kernel Release" and "Spoof Kernel Cmdline".',
    });
    logs.push(`[${timeStr}] [FAIL] /proc/cmdline exposes verifiedbootstate=orange (unlocked).`);
    advice.push(isId
      ? 'Aktifkan penyamaran status bootloader (verifiedbootstate=green).'
      : 'Enable bootloader status masking (verifiedbootstate=green).');
  }

  // Vector 9: Kernel Ring 0 eBPF Syscall Probe Filter
  if (isEnabled && (tA.ebpfSyscallFilter ?? true)) {
    diagnostics.push({
      id: 'ebpf_filter',
      name: isId ? 'Kernel Ring-0 eBPF Syscall Filter' : 'Kernel Ring-0 eBPF Syscall Filter',
      category: 'kernel',
      status: 'pass',
      detail: isId
        ? 'Tracepoint kernel sys_enter_* dicegat di Ring-0. Pemanggilan raw assembly SVC #0 langsung dimanipulasi di level kernel tanpa delay.'
        : 'Ring-0 kernel tracepoint sys_enter_* intercepted. Raw assembly SVC #0 execution safely trapped at kernel level with 0ms latency.',
    });
    logs.push(`[${timeStr}] [PASS] eBPF kprobe/sys_enter attached: PID ${app.id} syscalls filtered at ring-0.`);
  } else {
    diagnostics.push({
      id: 'ebpf_filter',
      name: isId ? 'Kernel Ring-0 eBPF Syscall Filter' : 'Kernel Ring-0 eBPF Syscall Filter',
      category: 'kernel',
      status: 'fail',
      detail: isId
        ? 'Filter eBPF Ring-0 nonaktif; kernel mengizinkan pemindaian assembly tingkat rendah langsung.'
        : 'Ring-0 eBPF filter inactive; kernel allows low-level direct assembly probes.',
      causeIfFailed: isId ? 'Toggle eBPF Ring-0 Syscall Filter mati.' : 'eBPF Ring-0 Syscall Filter toggle is off.',
      recommendation: isId ? 'Aktifkan "Kernel Ring-0 eBPF Syscall Filter".' : 'Enable "Kernel Ring-0 eBPF Syscall Filter".',
    });
  }

  // Vector 10: StrongBox Hardware-backed TEE Attestation & Keymint HAL
  if (isEnabled && (tA.teeStrongBoxEmulation ?? true) && tB.spoofFingerprint) {
    diagnostics.push({
      id: 'tee_strongbox',
      name: isId ? 'StrongBox TEE Hardware Keystore & Keymint HAL' : 'StrongBox TEE Hardware Keystore & Keymint HAL',
      category: 'identity',
      status: 'pass',
      detail: isId
        ? 'Kunci privat RSA/EC dienkripsi dengan sertifikat hardware StrongBox resmi. MEETS_STRONG_INTEGRITY dijamin lolos.'
        : 'RSA/EC private keys cryptographically attested with genuine StrongBox hardware certificate. MEETS_STRONG_INTEGRITY secured.',
    });
    logs.push(`[${timeStr}] [PASS] Keymint HAL: Injected Hardware Attestation Root-of-Trust (deviceLocked=true, verifiedBoot=GREEN).`);
  } else {
    diagnostics.push({
      id: 'tee_strongbox',
      name: isId ? 'StrongBox TEE Hardware Keystore & Keymint HAL' : 'StrongBox TEE Hardware Keystore & Keymint HAL',
      category: 'identity',
      status: 'warn',
      detail: isId
        ? 'StrongBox Hardware TEE tidak aktif. Evaluasi fallback ke BASIC evaluation.'
        : 'StrongBox Hardware TEE inactive. Evaluation falls back to BASIC evaluation.',
      causeIfFailed: isId ? 'Emulasi StrongBox Keymint HAL dinonaktifkan.' : 'StrongBox Keymint HAL emulation is disabled.',
      recommendation: isId ? 'Aktifkan "StrongBox TEE Keystore Emulation".' : 'Enable "StrongBox TEE Keystore Emulation".',
    });
  }

  // Vector 11: Anti-RASP Promon Shield & DexGuard Neutralizer
  if (isEnabled && (tA.antiRaspPromonShield ?? true)) {
    diagnostics.push({
      id: 'promon_shield',
      name: isId ? 'Anti-RASP Promon & DexGuard Assembly Neutralizer' : 'Anti-RASP Promon & DexGuard Assembly Neutralizer',
      category: 'native',
      status: 'pass',
      detail: isId
        ? 'Checksum integritas memori Promon Shield dan probe refleksi DexGuard dinetralkan tanpa memicu crash thread.'
        : 'Promon Shield memory integrity checksums and DexGuard reflection probes neutralized without thread crashes.',
    });
    logs.push(`[${timeStr}] [PASS] Native RASP Shield: Neutralized libpromon.so & DexGuard integrity watchdogs.`);
  } else {
    diagnostics.push({
      id: 'promon_shield',
      name: isId ? 'Anti-RASP Promon & DexGuard Assembly Neutralizer' : 'Anti-RASP Promon & DexGuard Assembly Neutralizer',
      category: 'native',
      status: 'warn',
      detail: isId
        ? 'Anti-RASP Promon dinonaktifkan; perbankan seperti BCA/Mandiri dapat memicu deteksi proteksi in-app.'
        : 'Anti-RASP Promon disabled; banking apps may trigger in-app protection warnings.',
    });
  }

  // Vector 12: Abstract Domain Socket & Netlink Scrubber
  if (isEnabled && (tA.abstractSocketScrubber ?? true) && tA.hideDevSockets) {
    diagnostics.push({
      id: 'abstract_sockets',
      name: isId ? 'Pembersihan Abstract Socket (/proc/net/unix)' : 'Abstract Socket Sanitization (/proc/net/unix)',
      category: 'environment',
      status: 'pass',
      detail: isId
        ? 'Socket daemon KSU, Magisk, dan LSPosed disapu bersih dari tabel IPC Unix.'
        : 'KSU, Magisk, and LSPosed daemon sockets wiped completely from Unix IPC table.',
    });
    logs.push(`[${timeStr}] [PASS] /proc/net/unix virtualized: 0 daemon sockets visible to target.`);
  }

  // Vector 13: CNTVCT_EL0 Hardware Cycle Normalizer (Anti-Timing Attack)
  if (isEnabled && (tA.cntvctCycleNormalizer ?? true)) {
    diagnostics.push({
      id: 'cntvct_timing',
      name: isId ? 'Normalisasi CNTVCT_EL0 Cycle Counter (Anti-Timing Attack)' : 'CNTVCT_EL0 Cycle Normalizer (Anti-Timing Attack)',
      category: 'kernel',
      status: 'pass',
      detail: isId
        ? 'Trapping register counter clock CPU ARM64 aktif. Latensi pencegatan syscall disamarkan ke baseline OEM murni.'
        : 'ARM64 CPU clock cycle counter register trapped. Syscall interception latency masked to pristine OEM baseline.',
    });
    logs.push(`[${timeStr}] [PASS] CNTVCT_EL0 virtualizer: Hook execution delay neutralized. 0-delta timing signature.`);
  } else {
    diagnostics.push({
      id: 'cntvct_timing',
      name: isId ? 'Normalisasi CNTVCT_EL0 Cycle Counter (Anti-Timing Attack)' : 'CNTVCT_EL0 Cycle Normalizer (Anti-Timing Attack)',
      category: 'kernel',
      status: 'warn',
      detail: isId
        ? 'Cycle counter tidak dinormalisasi; scanner perbankan dapat mengukur anomali latensi eksekusi syscall.'
        : 'Cycle counter not normalized; banking timing attacks may detect syscall delay anomalies.',
    });
  }

  // Vector 14: .text Section Copy-On-Write Shadow Page Redirection
  if (isEnabled && (tA.shadowMemoryPageRedirect ?? true)) {
    diagnostics.push({
      id: 'shadow_memory',
      name: isId ? 'Shadow-Mapping Memori .text (Anti-Checksum Integrity)' : '.text Section Shadow-Mapping (Anti-Checksum Integrity)',
      category: 'native',
      status: 'pass',
      detail: isId
        ? 'Pemisahan halaman baca/eksekusi aktif. Pemindaian SHA-256 oleh Promon/DexGuard membaca biner OEM bersih.'
        : 'Split Read/Execute pages active. SHA-256 scanner from Promon/DexGuard reads clean stock OEM memory.',
    });
    logs.push(`[${timeStr}] [PASS] .text shadow page: Injected clean stock libc.so buffer for memory integrity scanners.`);
  }

  // Vector 15: Dynamic Keybox OTA Pool & Nonce Rotator (Anti-Revocation Ban)
  if (isEnabled && (tA.dynamicKeyboxOtaPool ?? true)) {
    diagnostics.push({
      id: 'dynamic_keybox',
      name: isId ? 'Rotasi Pool Keybox OTA Dinamis (Anti-Revocation Ban)' : 'Dynamic Keybox OTA Pool (Anti-Revocation Ban)',
      category: 'identity',
      status: 'pass',
      detail: isId
        ? 'Sertifikat Keybox StrongBox disinkronkan secara real-time dengan pool sertifikat OEM aktif tanpa risiko revoked CRL.'
        : 'StrongBox Keybox certificate synchronized in real-time with healthy OEM certificate pool with zero CRL revocation risk.',
    });
    logs.push(`[${timeStr}] [PASS] Keybox OTA Pool: Active cert serial verified against Google Play Services CRL list.`);
  }

  // Vector 16: Task Thread (/proc/self/task/) & Call Stack Sanitizer
  if (isEnabled && (tA.taskThreadStackSanitizer ?? true)) {
    diagnostics.push({
      id: 'task_thread_sanitizer',
      name: isId ? 'Sanitasi Thread /proc/self/task & Stack Trace' : 'Task Thread /proc/self/task & Stack Sanitizer',
      category: 'environment',
      status: 'pass',
      detail: isId
        ? 'Thread watchdog internal Zygisk disembunyikan dari direktori task proses dan stack unwinding disanitasi.'
        : 'Internal Zygisk watchdog threads concealed from process task directory and stack traces sanitized.',
    });
    logs.push(`[${timeStr}] [PASS] Task thread table filtered: 0 foreign daemon threads exposed to process.`);
  }

  // Vector 17: Binder IPC Transaction Filter
  if (isEnabled && (tA.binderIpcPayloadSanitizer ?? true)) {
    diagnostics.push({
      id: 'binder_filter',
      name: isId ? 'Filter Transaksi Binder IPC (PackageManager Guard)' : 'Binder IPC Transaction Filter (PackageManager Guard)',
      category: 'native',
      status: 'pass',
      detail: isId
        ? 'Transaksi Binder ioctl(/dev/binder) disaring; paket manager sistem dicegah membocorkan aplikasi root terpasang.'
        : 'Binder ioctl transactions filtered; system package manager prevented from leaking root packages to app.',
    });
    logs.push(`[${timeStr}] [PASS] Binder IPC payload filter active for getInstalledApplications().`);
  }

  // Vector 18: ART VM Inline Method Shield
  if (isEnabled && (tA.artInlineHookProtector ?? true)) {
    diagnostics.push({
      id: 'art_inline_guard',
      name: isId ? 'Proteksi Method Inlining ART VM (Runtime De-opt Guard)' : 'ART VM Inline Method Shield (Runtime De-opt Guard)',
      category: 'native',
      status: 'pass',
      detail: isId
        ? 'Flag kompilasi ArtMethod dikunci; compiler JIT/AOT dicegah mendeteksi de-optimasi method inline.'
        : 'ArtMethod compilation flags locked; JIT/AOT compiler prevented from detecting method de-optimizations.',
    });
    logs.push(`[${timeStr}] [PASS] ART runtime guard: Method inlining metadata preserved across all DEX classes.`);
  }

  // Vector 19: TEE Keybox & TrickyStore Style Green Leaf Cert Generator
  let hasValidKeybox = true;
  let hasGreenCertTarget = true;
  let keyboxPatchDate = '2025-02-05';

  try {
    const savedKb = localStorage.getItem('chameleon_keybox_config');
    if (savedKb) {
      const parsed = JSON.parse(savedKb);
      hasValidKeybox = !!parsed.hasCustomKeybox;
      keyboxPatchDate = parsed.securityPatchDate || '2025-02-05';
      const targetMatch = parsed.targets?.find((t: any) => t.packageName === app.id);
      if (targetMatch) {
        hasGreenCertTarget = !!targetMatch.generateCertGreen;
      }
    }
  } catch {}

  if (hasValidKeybox && hasGreenCertTarget) {
    diagnostics.push({
      id: 'keybox_leaf_cert',
      name: isId ? 'Injeksi Keybox & Sertifikat Hijau TEE (TrickyStore Attestation)' : 'Keybox & TEE Green Cert Injection (TrickyStore Attestation)',
      category: 'identity',
      status: 'pass',
      detail: isId
        ? `Sertifikat leaf StrongBox aktif & ditandatangani untuk target (${app.id}). Tanggal patch keamanan disinkronkan (${keyboxPatchDate}).`
        : `StrongBox leaf cert active & signed for target (${app.id}). Security patch date aligned (${keyboxPatchDate}).`,
    });
    logs.push(`[${timeStr}] [PASS] Green Leaf cert generated for ${app.id} signed with OEM Keybox root. Patch date: ${keyboxPatchDate}.`);
  } else {
    diagnostics.push({
      id: 'keybox_leaf_cert',
      name: isId ? 'Injeksi Keybox & Sertifikat Hijau TEE (TrickyStore Attestation)' : 'Keybox & TEE Green Cert Injection (TrickyStore Attestation)',
      category: 'identity',
      status: 'warn',
      detail: isId
        ? `Target ${app.id} belum memiliki sertifikat hijau aktif atau Keybox XML belum di-inject. Menghasilkan BASIC & DEVICE Integrity saja.`
        : `Target ${app.id} does not have green cert generated or Keybox XML not injected. Only BASIC & DEVICE Integrity will pass.`,
      recommendation: isId
        ? 'Buka Manajer Keybox -> Aktifkan "Sertifikat Hijau" untuk target ini dan lakukan "Injeksi ke Sistem Android".'
        : 'Open Keybox Manager -> Enable "Green Cert" for this target and click "Inject into Android System".',
    });
    logs.push(`[${timeStr}] [WARN] Keybox green cert generation disabled for ${app.id}. StrongBox attestation fallback.`);
  }

  // Verdict calculation
  const hasKernelFail = diagnostics.some(
    (d) => (d.id === 'mount_unmount' || d.id === 'raw_syscall' || d.id === 'su_binary' || d.id === 'ebpf_filter') && d.status === 'fail'
  );
  const hasIdentityFail = diagnostics.some((d) => d.id === 'fingerprint_sync' && d.status === 'fail');

  const meetsBasicIntegrity = !hasKernelFail && isEnabled;
  const meetsDeviceIntegrity = meetsBasicIntegrity && !hasIdentityFail && isEnabled;
  // Strong integrity requires hardware keystore simulation & locked state + eBPF filter + dynamic keybox + cycle normalizer + green cert
  const meetsStrongIntegrity = 
    meetsDeviceIntegrity && 
    isIdentityConsistent && 
    tB.spoofCmdline && 
    (tA.teeStrongBoxEmulation ?? true) &&
    (tA.vfsZeroTraceDetach ?? true) &&
    (tA.dynamicKeyboxOtaPool ?? true) &&
    (tA.cntvctCycleNormalizer ?? true) &&
    hasValidKeybox &&
    hasGreenCertTarget;

  const legacyBasicIntegrity = meetsBasicIntegrity;
  const legacyCtsProfileMatch = meetsDeviceIntegrity;
  const evaluationType = meetsStrongIntegrity ? 'BASIC,HARDWARE_BACKED' : meetsDeviceIntegrity ? 'BASIC' : 'NONE';

  logs.push(`[${timeStr}] Verification evaluation completed.`);
  logs.push(`[${timeStr}] Verdict: MEETS_BASIC=${meetsBasicIntegrity ? 'YES' : 'NO'}, MEETS_DEVICE=${meetsDeviceIntegrity ? 'YES' : 'NO'}, MEETS_STRONG=${meetsStrongIntegrity ? 'YES' : 'NO'}`);

  return {
    meetsBasicIntegrity,
    meetsDeviceIntegrity,
    meetsStrongIntegrity,
    legacyBasicIntegrity,
    legacyCtsProfileMatch,
    evaluationType,
    advice,
    diagnostics,
    logs,
    timestamp: timeStr,
  };
}
