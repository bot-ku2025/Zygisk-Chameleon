# Zygisk Chameleon Changelog

## v1.1.0 (2026-09-10 - Chameleon Evolution)
- **Deteksi Real Root Manager**: Terintegrasi langsung dengan ResuKSU, KernelSU, APatch, dan Magisk via bridge live `window.ksu` (menghapus data hardcoded lingkungan root).
- **Inspeksi & Pembacaan Hardware Asli**: Query live `ro.product.brand`, `ro.product.model`, `ro.build.version.release`, dan `ro.build.version.security_patch` langsung dari HP via getprop.
- **Manajer Keybox, Tanggal Keamanan & Sertifikat Hijau TEE (TrickyStore Style)**:
  - Injeksi manual file XML Keybox (.xml / .txt / .pem) dari penyimpanan ponsel.
  - Pengaturan tanggal patch keamanan kriptografi (`securityPatchDate`) dan First API Level yang dapat dibaca otomatis dari HP.
  - Pembuatan sertifikat hijau (`generateCertGreen`) per target app untuk menghasilkan `MEETS_STRONG_INTEGRITY` asli.
  - Injeksi langsung ke `/data/adb/zygisk_chameleon/keybox.xml` dan `target.txt`.
- **Pindai Aplikasi Terpasang dari HP**: Menjalankan `pm list packages -3` via root shell untuk mendeteksi aplikasi pihak ketiga asli di ponsel dan menambahkannya ke daftar target dengan satu klik.
- **Pembersihan Data AI Studio**: Menghapus seluruh residu tiruan (seperti mock Samsung SM-S928B dan Sentinel.apk) serta menyediakan tombol Reset Fresh di Pengaturan.
- **Pembaruan Celah OTA dengan Notifikasi Up-to-Date**: Menambahkan notifikasi khusus ketika basis data celah 24-jam sudah versi paling mutakhir (`v2026.09.10-STABLE`).
- **Pembersihan Antarmuka**: Menghapus opsi unduh flashable ZIP yang tidak diperlukan di tab Pengaturan dan menggantinya dengan panel diagnostik hardware perangkat nyata.

## v1.0.0 (2026-09-08 - Initial Public Release)
- Arsitektur Isolasi Proses & Kernel: Proteksi per-aplikasi adaptif berbasis Zygisk & GKI Ring-0 hook.
- Mount Namespace Shadowing: Menyembunyikan seluruh mount root, ksu, apatch, dan magisk dari `/proc/self/mountinfo`.
- Anti-RASP Engine: Mitigasi canggih untuk Promon SHIELD, DexGuard, dan Bionic solist walker tanpa modifikasi biner.
- Keybox Manager & TEE StrongBox Auditor: Mendukung sertifikat OEM dan simulasi token kriptografi.
- WebUI Terintegrasi: Kompatibel penuh dengan WebUI bawaan KernelSU dan APatch dengan batas aman status bar mobile.
- Serverless GitHub Releases & OTA Updates: Pembaruan instan langsung melalui repositori GitHub tanpa memerlukan server backend.
