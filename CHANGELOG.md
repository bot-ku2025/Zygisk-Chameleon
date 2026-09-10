# Zygisk Chameleon Changelog

## v1.0.0 (Initial Public Release)
- Arsitektur Isolasi Proses & Kernel: Proteksi per-aplikasi adaptif berbasis Zygisk & GKI Ring-0 hook.
- Mount Namespace Shadowing: Menyembunyikan seluruh mount root, ksu, apatch, dan magisk dari `/proc/self/mountinfo`.
- Anti-RASP Engine: Mitigasi canggih untuk Promon SHIELD, DexGuard, dan Bionic solist walker tanpa modifikasi biner.
- Keybox Manager & TEE StrongBox Auditor: Mendukung sertifikat OEM dan simulasi token kriptografi.
- WebUI Terintegrasi: Kompatibel penuh dengan WebUI bawaan KernelSU dan APatch dengan batas aman status bar mobile.
- Serverless GitHub Releases & OTA Updates: Pembaruan instan langsung melalui repositori GitHub tanpa memerlukan server backend.
