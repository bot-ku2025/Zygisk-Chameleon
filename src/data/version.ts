export const APP_VERSION = 'v1.1.0';
export const APP_VERSION_CODE = 110;
export const APP_RELEASE_DATE = '10 September 2026';
export const APP_CODENAME = 'Chameleon Evolution';

export interface VersionChangeItem {
  version: string;
  versionCode: number;
  date: string;
  tag: 'Latest' | 'Stable';
  highlights: {
    id: string;
    en: string;
  }[];
}

export const VERSION_HISTORY: VersionChangeItem[] = [
  {
    version: 'v1.1.0',
    versionCode: 110,
    date: '10 September 2026',
    tag: 'Latest',
    highlights: [
      {
        id: 'Deteksi Real Root Manager: Terintegrasi dengan ResuKSU, KernelSU, APatch, dan Magisk via bridge live ksuBridge.',
        en: 'Real Root Manager Detection: Integrated with ResuKSU, KernelSU, APatch, and Magisk via live ksuBridge.',
      },
      {
        id: 'Inspeksi & Pembacaan Hardware Asli: Query live ro.product.brand, model, dan patch keamanan langsung dari HP via getprop.',
        en: 'Live Device Query: Dynamic query of brand, model, and security patch directly from device getprop.',
      },
      {
        id: 'Manajer Keybox & TEE Generator Hijau: Injeksi manual file XML Keybox, pengaturan tanggal patch keamanan, dan sertifikat hijau per-aplikasi (TrickyStore style).',
        en: 'Keybox Manager & Green Cert Generator: Manual Keybox XML import, security patch date alignment, and per-app green cert generation (TrickyStore style).',
      },
      {
        id: 'Pindai Aplikasi Terpasang dari HP: Menjalankan pm list packages -3 via root shell untuk mendeteksi aplikasi pihak ketiga asli di perangkat.',
        en: 'Scan Installed Device Apps: Runs pm list packages -3 via root shell to list real installed 3rd-party apps.',
      },
      {
        id: 'Pembaruan Celah OTA dengan Notifikasi Up-to-Date: Notifikasi khusus ketika seluruh aturan RASP dan bypass telah mutakhir.',
        en: 'Vulnerability OTA with Up-to-Date Alerts: Dedicated notice popup when all RASP & bypass rules are current.',
      },
      {
        id: 'Pembersihan Antarmuka: Menghapus opsi unduh ZIP di tab Pengaturan dan beralih ke inspeksi sistem live yang bersih.',
        en: 'UI Streamlining: Removed legacy flashable ZIP clutter from Settings tab in favor of live device diagnostics.',
      },
    ],
  },
  {
    version: 'v1.0.0',
    versionCode: 100,
    date: '08 September 2026',
    tag: 'Stable',
    highlights: [
      {
        id: 'Rilis Publik Perdana: Arsitektur isolasi proses per-aplikasi Zygisk & GKI Ring-0 hook.',
        en: 'Initial Public Release: Zygisk per-app process isolation architecture & Ring-0 kernel hooks.',
      },
      {
        id: 'Mount Namespace Shadowing: Menyembunyikan mount root dari /proc/self/mountinfo.',
        en: 'Mount Namespace Shadowing: Conceals root mounts from /proc/self/mountinfo.',
      },
      {
        id: 'Mitigasi Anti-RASP Bionic & DexGuard: Pelindung syscall SVC #0 dan pembacaan memori RAM.',
        en: 'Anti-RASP & Bionic Mitigation: Syscall SVC #0 guard and RAM memory sanitization.',
      },
      {
        id: 'WebUI Responsif: Kompatibilitas penuh dengan WebUI bawaan KernelSU & APatch dengan safe-area padding.',
        en: 'Responsive WebUI: Full compatibility with KernelSU & APatch native WebUI and safe-area padding.',
      },
    ],
  },
];
