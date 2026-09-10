export type Language = 'id' | 'en';

export type TabType = 'apps' | 'integrity' | 'settings' | 'about';

export interface IntegrityDiagnostic {
  id: string;
  name: string;
  category: 'kernel' | 'native' | 'identity' | 'environment';
  status: 'pass' | 'fail' | 'warn';
  detail: string;
  causeIfFailed?: string;
  recommendation?: string;
}

export interface IntegrityVerdictResult {
  meetsBasicIntegrity: boolean;
  meetsDeviceIntegrity: boolean;
  meetsStrongIntegrity: boolean;
  legacyBasicIntegrity: boolean;
  legacyCtsProfileMatch: boolean;
  evaluationType: 'BASIC,HARDWARE_BACKED' | 'BASIC' | 'NONE';
  advice: string[];
  diagnostics: IntegrityDiagnostic[];
  logs: string[];
  timestamp: string;
}

export type RootManagerType = 'KernelSU' | 'APatch' | 'Magisk';

export interface DeviceInfo {
  brand: string;
  model: string;
  device: string;
  product: string;
  manufacturer: string;
  fingerprint: string;
  securityPatch: string;
  androidVersion: string;
  firstApiLevel: string;
  selinux: 'Enforcing' | 'Permissive' | 'Disabled';
  isRealDevice: boolean;
}

export interface RootEnvironment {
  manager: RootManagerType;
  version: string;
  versionCode: number;
  mode: string;
  selinux: 'Enforcing' | 'Permissive';
  suPath: string;
  modulePath: string;
  zygiskStatus: string;
  granted: boolean;
}

export interface TypeAToggles {
  deepMountUnmount: boolean;       // umount2(MNT_DETACH) kernel namespace unmount for /data/adb, mirrors & KSU
  rawSyscallBlock: boolean;        // Seccomp-BPF filter intercepting direct assembly syscalls (openat, faccessat)
  isolatedMountNamespace: boolean; // unshare(CLONE_NEWNS) clean process mount table
  hideDevSockets: boolean;         // Wipe abstract daemon sockets & KSU/Magisk named pipes
  hideSu: boolean;
  hideRecovery: boolean;
  filterProcMaps: boolean;
  hideLsposed: boolean;
  hideRootApps: boolean;
  antiDebug: boolean;
  maskDevOptions: boolean;
  execveHook: boolean;
  // Apex Hyper-Kernel Capabilities (Ring-0 & StrongBox TEE Tier)
  ebpfSyscallFilter: boolean;      // Kernel Ring-0 eBPF probe filter intercepting sys_enter_*
  teeStrongBoxEmulation: boolean;  // StrongBox Keymaster/Keymint HAL hardware-backed attestation
  vfsZeroTraceDetach: boolean;     // Zero-trace ephemeral VFS mount synthesis (0 byte trace)
  antiRaspPromonShield: boolean;   // Anti-RASP Promon Shield v5/v6, DexGuard & Arxan neutralizer
  zygoteMemoryScrubber: boolean;   // Scrub dl_iterate_phdr, ELF headers & RAM virtual maps
  abstractSocketScrubber: boolean; // /proc/net/unix abstract domain socket & netlink wipe
  // Ultra-Advanced Frontier Mitigations (4 Holy Grails + Deep System Guards)
  cntvctCycleNormalizer: boolean;      // Anti-Timing Attack: ARM64 CNTVCT_EL0 Virtual Counter Hardware Trap
  shadowMemoryPageRedirect: boolean;   // Anti-Checksum: .text Section Copy-On-Write Shadow Page Redirection
  dynamicKeyboxOtaPool: boolean;       // Dynamic Keybox OTA Pool: Automatic rotating certified OEM TEE Keybox
  taskThreadStackSanitizer: boolean;   // Task Thread Sanitizer: /proc/[pid]/task/ & call stack probe cloaking
  binderIpcPayloadSanitizer: boolean;  // Binder IPC Sanitizer: Filter PackageManager transaction queries
  artInlineHookProtector: boolean;     // ART JIT/AOT Compiler Inline Guard: Prevent runtime method de-opt leaks
  // Bionic Linker64 & Zero-Trace In-Memory Scrubber
  linkerSolistUnlink: boolean;         // Bionic Linker solist unlinking (__dl__ZL10g_dl_mutex / link_map unchain)
  pltGotAntiTamperMask: boolean;       // In-Memory PLT/GOT Checksum Mask (restore clean function pointer checksums)
  libcBionicSyscallTrampoline: boolean;// Direct Bionic assembly trampoline redirect to hide backtrace frames
}

export interface TypeBSpoofs {
  spoofKernel: boolean;
  kernelString: string;
  spoofBuildDisplay: boolean;
  buildDisplayId: string;
  spoofBuildId: boolean;
  buildId: string;
  spoofSdk: boolean;
  sdkVersion: string;
  spoofSecurityPatch: boolean;
  securityPatch: string;
  spoofCmdline: boolean;
  cmdlineString: string;
  spoofFingerprint: boolean;
  fingerprint: string;
  installerPackage: string;
}

export type AppPresetType = 
  | 'full_stealth' 
  | 'custom' 
  | 'bypass' 
  | 'bca_extreme' 
  | 'mandiri_livin' 
  | 'shopee_seabank' 
  | 'brimo_jenius' 
  | 'strongbox_tee';

export interface TargetApp {
  id: string;
  name: string;
  category: 'ecommerce' | 'banking' | 'gaming' | 'utility';
  icon: string;
  iconBg: string;
  enabled: boolean;
  preset: AppPresetType;
  targetAndroid: '13' | '14' | '15' | '16';
  targetBrand: 'Xiaomi' | 'Samsung' | 'Google';
  typeA: TypeAToggles;
  typeB: TypeBSpoofs;
  dynamicToggles?: Record<string, boolean>;
  keyboxRoute?: 'auto' | 'custom_xml' | 'software_enclave' | 'tee_hardware';
}

// Keybox & TEE Health Types
export interface KeyboxCertStatus {
  id: string;
  name: string;
  algorithm: string;
  subjectCn: string;
  issuerCn: string;
  expiryDate: string;
  status: 'VALID' | 'REVOKED_CRL' | 'EXPIRED' | 'UNVERIFIED';
  securityLevel: 'StrongBox' | 'TrustedEnvironment' | 'Software';
  googleCrlRevoked: boolean;
  serialNumber: string;
  fingerprintSha256: string;
}

export interface KeyboxTargetConfig {
  packageName: string;
  appName: string;
  securityPatchDate: string;
  generateCertGreen: boolean;
  firstApiLevel: number;
}

export interface KeyboxConfig {
  hasCustomKeybox: boolean;
  activeKeyboxName: string;
  targetRouting: 'auto' | 'custom_xml' | 'software_enclave' | 'tee_hardware';
  xmlContent: string;
  securityPatchDate: string;
  firstApiLevel: string;
  certs: KeyboxCertStatus[];
  targets: KeyboxTargetConfig[];
  lastAuditTimestamp: string;
  googleCrlVersion: string;
}

// Live Syscall & RASP Audit Monitor Types
export interface SyscallLogEvent {
  id: string;
  timestamp: string;
  appId: string;
  appName: string;
  syscallName: string;
  argument: string;
  actionTaken: 'BLOCKED_ENOENT' | 'SCRUBBED_FILTER' | 'SHADOW_REDIRECT' | 'TRAPPED_NORMALIZED' | 'UNLINKED_SOLIST' | 'BYPASSED';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  raspMechanism: string;
}

// Heuristic RASP Scan Result
export interface DetectedRaspVendor {
  name: string;
  library: string;
  description: string;
  descriptionEn?: string;
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface RaspScanReport {
  appId: string;
  packageName: string;
  timestamp: string;
  threatScore: number; // 0 - 100
  riskLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'LOW';
  detectedVendors: DetectedRaspVendor[];
  probedVulnerabilities: string[];
  recommendedPreset: AppPresetType;
  recommendedToggles: (keyof TypeAToggles)[];
}

export type SpooferSourceType = 'sentinel' | 'device_faker' | 'tspoof' | 'magisk_props' | 'internal';

export interface ExternalSpooferState {
  source: SpooferSourceType;
  sourceName: string;
  isDetected: boolean;
  detectedPackage: string;
  detectedVersion: string;
  interceptedBrand: 'Samsung' | 'Xiaomi' | 'Google';
  interceptedModel: string;
  interceptedAndroid: '13' | '14' | '15' | '16';
  interceptedImeiMasked: string;
  interceptedAndroidId: string;
  isHarmonized: boolean;
  lastSyncTimestamp: string;
  lastSyncTimestampEn?: string;
}

export interface DynamicOtaToggle {
  id: string;
  label: string;
  labelEn?: string;
  description: string;
  descriptionEn?: string;
  category: 'rasp_bypass' | 'socket_probe' | 'memory_scrub' | 'kernel_patch';
  targetAppId?: string; // Specific app id or undefined/'*' for all
  dateAdded: string;
  enabled: boolean;
}

export interface OtaChangelogItem {
  id: string;
  title: string;
  titleEn?: string;
  timestamp: string;
  timestampEn?: string;
  type: 'fingerprint' | 'rasp_rule' | 'dynamic_toggle' | 'kernel_safety';
  desc: string;
  descEn?: string;
}

export interface OtaCelahUpdateState {
  lastUpdated: string;
  lastUpdatedEn?: string;
  nextScheduledCheck: string;
  nextScheduledCheckEn?: string;
  version: string;
  status: 'idle' | 'checking' | 'downloading' | 'applied';
  autoCheckIntervalHours: number; // 24 hours
  rulesCount: number;
  fingerprintsCount: number;
  dynamicToggles: DynamicOtaToggle[];
  recentChangelog: OtaChangelogItem[];
}

export interface ModuleConfigFile {
  filename: string;
  path: string;
  description: string;
  content: string;
}

export interface RootModule {
  id: string;
  name: string;
  version: string;
  versionCode: number;
  author: string;
  description: string;
  enabled: boolean;
  hasAction: boolean;
  hasWebUI: boolean;
  webUiType?: 'chameleon' | 'playintegrity' | 'trickystore' | 'zygisk' | 'busybox';
  path: string;
  configFiles: ModuleConfigFile[];
  actionOutput?: string;
}

export interface ApexHierarchyTier {
  level: number;
  rankTitle: string;
  scope: string;
  depth: string;
  bypassEfficiency: string;
  isChameleon: boolean;
  description: string;
  descriptionEn?: string;
  detectedByRasp: string;
  modulesInTier: string[];
  executionStage: string;
}

export interface ApexDetectionVector {
  id: string;
  name: string;
  nameEn?: string;
  layer: 'Ring 0 Kernel' | 'Hardware TEE' | 'VFS Mounts' | 'Zygote Memory' | 'Anti-RASP' | 'IPC / Sockets' | 'Anti-Timing Trap' | 'Memory Shadow' | 'Keybox OTA' | 'Binder IPC' | 'ART Runtime';
  description: string;
  descriptionEn?: string;
  targetProbe: string;
  status: 'passed' | 'failed' | 'bypassed';
  latencyMs: number;
  kernelLog: string;
}

