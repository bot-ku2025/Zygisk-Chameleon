import { RootModule } from '../types';

export const INITIAL_INSTALLED_MODULES: RootModule[] = [
  {
    id: 'zygisk_chameleon',
    name: 'Zygisk Chameleon',
    version: 'v2.4.1',
    versionCode: 10241,
    author: 'STNK',
    description: 'Kernel Namespace Unmounter (umount2 MNT_DETACH), Seccomp-BPF Syscall Guard & Synchronized Identity Spoofing.',
    enabled: true,
    hasAction: true,
    hasWebUI: true,
    webUiType: 'chameleon',
    path: '/data/adb/modules/zygisk_chameleon',
    configFiles: [
      {
        filename: 'module.prop',
        path: '/data/adb/modules/zygisk_chameleon/module.prop',
        description: 'Module metadata and version specification',
        content: `id=zygisk_chameleon
name=Zygisk Chameleon
version=v2.4.1
versionCode=10241
author=STNK
description=Dual-Core stealth engine: Kernel umount2(MNT_DETACH) namespace isolation, Seccomp-BPF raw syscall guard & per-app identity spoofing.
minMagisk=26000
needRamdisk=false`,
      },
      {
        filename: 'unmounter.hpp',
        path: '/data/adb/modules/zygisk_chameleon/jni/unmounter.hpp',
        description: 'Deep Kernel Namespace Unmounter & Seccomp-BPF Guard (Native C++ Standalone Core)',
        content: `// Zygisk Chameleon Native Kernel Namespace Unmounter & Seccomp Guard
// Standalone engine unifying MNT_DETACH with per-app granular profile injection
#pragma once
#include <sys/mount.h>
#include <sched.h>
#include <unistd.h>
#include <linux/seccomp.h>
#include <linux/filter.h>

namespace chameleon {

inline void isolate_and_deep_unmount(const char* target_pkg) {
    // 1. Separate mount namespace from parent Zygote
    if (unshare(CLONE_NEWNS) == -1) return;

    // 2. Unmount all root mounts & mirrors physically (MNT_DETACH)
    static const char* target_mounts[] = {
        "/data/adb",
        "/data/adb/modules",
        "/data/adb/ksu",
        "/data/adb/ap",
        "/data/adb/magisk",
        "/sbin",
        "/debug_ramdisk",
        nullptr
    };

    for (int i = 0; target_mounts[i]; ++i) {
        umount2(target_mounts[i], MNT_DETACH);
    }

    // 3. Purge detached overlayfs loop mounts & dynamic ksu mirrors
    purge_dynamic_mount_mirrors();
}

inline void install_seccomp_raw_syscall_trap() {
    // Traps direct SVC #0 assembly syscalls on __NR_openat, __NR_faccessat, __NR_readlinkat
    struct sock_filter filter[] = {
        BPF_STMT(BPF_LD | BPF_W | BPF_ABS, offsetof(struct seccomp_data, nr)),
        // Kernel-level filtering returning ENOENT directly
        BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_ALLOW)
    };
    struct sock_fprog prog = { .len = (unsigned short)(sizeof(filter)/sizeof(filter[0])), .filter = filter };
    prctl(PR_SET_SECCOMP, SECCOMP_MODE_FILTER, &prog);
}

}`,
      },
      {
        filename: 'service.sh',
        path: '/data/adb/modules/zygisk_chameleon/service.sh',
        description: 'Late-service boot daemon initialization script',
        content: `#!/system/bin/sh
MODDIR=\${0%/*}
# Start Chameleon Daemon for Zygisk communication
if [ -f "\$MODDIR/bin/chameleon_daemon" ]; then
  chmod 755 "\$MODDIR/bin/chameleon_daemon"
  "\$MODDIR/bin/chameleon_daemon" --zygisk-hook &
fi
echo "[OK] Zygisk Chameleon daemon started" > /dev/kmsg`,
      },
      {
        filename: 'config.json',
        path: '/data/adb/modules/zygisk_chameleon/config.json',
        description: 'Global stealth configuration flags',
        content: `{
  "global_stealth": true,
  "kernel_unmount_detach": true,
  "seccomp_bpf_raw_syscall_trap": true,
  "isolated_mount_namespace": true,
  "purge_daemon_sockets": true,
  "proc_maps_filter": true,
  "log_level": "silent"
}`,
      },
    ],
  },
  {
    id: 'playintegrityfix',
    name: 'Play Integrity Fix',
    version: 'v17.8',
    versionCode: 17800,
    author: 'chiteroman, osm0sis',
    description: 'Fix Play Integrity (MEETS_DEVICE_INTEGRITY) verdicts with custom spoofed pif values.',
    enabled: true,
    hasAction: true,
    hasWebUI: true,
    webUiType: 'playintegrity',
    path: '/data/adb/modules/playintegrityfix',
    configFiles: [
      {
        filename: 'module.prop',
        path: '/data/adb/modules/playintegrityfix/module.prop',
        description: 'PIF module definition',
        content: `id=playintegrityfix
name=Play Integrity Fix
version=v17.8
versionCode=17800
author=chiteroman, osm0sis
description=Fix Play Integrity verdicts. Spoofs fingerprint and hardware keystore properties.`,
      },
      {
        filename: 'pif.json',
        path: '/data/adb/modules/playintegrityfix/pif.json',
        description: 'Hardware fingerprint and security patch keystore spoof',
        content: `{
  "MANUFACTURER": "Google",
  "MODEL": "Pixel 8 Pro",
  "FINGERPRINT": "google/husky/husky:14/UD1A.230803.041/10808477:user/release-keys",
  "BRAND": "google",
  "PRODUCT": "husky",
  "DEVICE": "husky",
  "RELEASE": "14",
  "ID": "UD1A.230803.041",
  "INCREMENTAL": "10808477",
  "TYPE": "user",
  "TAGS": "release-keys",
  "SECURITY_PATCH": "2024-05-05",
  "DEVICE_INITIAL_SDK_INT": "31"
}`,
      },
      {
        filename: 'custom.pif.json',
        path: '/data/adb/pif.json',
        description: 'Persistent user override keystore file',
        content: `{
  "spoofBuild": true,
  "spoofProvider": true,
  "spoofSignature": true
}`,
      },
    ],
  },
  {
    id: 'tricky_store',
    name: 'Tricky Store',
    version: 'v1.2.0',
    versionCode: 120,
    author: '5ec1cff',
    description: 'Keystore interceptor that tricks TEE and StrongBox hardware validations.',
    enabled: true,
    hasAction: true,
    hasWebUI: true,
    webUiType: 'trickystore',
    path: '/data/adb/modules/tricky_store',
    configFiles: [
      {
        filename: 'module.prop',
        path: '/data/adb/modules/tricky_store/module.prop',
        description: 'TrickyStore prop definition',
        content: `id=tricky_store
name=Tricky Store
version=v1.2.0
versionCode=120
author=5ec1cff
description=A keystore generation tool that tricks TEE/StrongBox broken keystores.`,
      },
      {
        filename: 'target.txt',
        path: '/data/adb/tricky_store/target.txt',
        description: 'Target package names requiring hardware leaf certificate spoofing',
        content: `com.google.android.gms
com.google.android.gsf
com.bca
id.dana
com.shopee.id
com.tokopedia.tkpd`,
      },
      {
        filename: 'keybox.xml',
        path: '/data/adb/tricky_store/keybox.xml',
        description: 'Keybox attestation certificate template (Active)',
        content: `<!-- TRICKY STORE HARDWARE KEYBOX PROVISIONED -->
<Keybox version="1">
  <NumberOfKeyboxes>1</NumberOfKeyboxes>
  <Keybox DeviceID="AOSP_GENERIC_KEYBOX_ACTIVE">
    <Key algorithm="ecdsa">
      <PrivateKey format="pem">[CERTIFICATE_VALID_CHAIN]</PrivateKey>
      <Certificate format="pem">[AOSP_INTERMEDIATE_ROOT]</Certificate>
    </Key>
  </Keybox>
</Keybox>`,
      },
    ],
  },
  {
    id: 'zygisk-next',
    name: 'Zygisk Next',
    version: 'v1.1.0',
    versionCode: 110,
    author: 'Dr-TSNG',
    description: 'Standalone, robust Zygisk implementation for KernelSU and APatch environments.',
    enabled: true,
    hasAction: false,
    hasWebUI: true,
    webUiType: 'zygisk',
    path: '/data/adb/modules/zygisk-next',
    configFiles: [
      {
        filename: 'module.prop',
        path: '/data/adb/modules/zygisk-next/module.prop',
        description: 'Zygisk Next module declaration',
        content: `id=zygisk-next
name=Zygisk Next
version=v1.1.0
versionCode=110
author=Dr-TSNG
description=Standalone Zygisk implementation for KernelSU and APatch.`,
      },
      {
        filename: 'zygisk.log',
        path: '/data/adb/zygisk/log.txt',
        description: 'Zygote companion injection log',
        content: `[zygisk-next] Loaded companion daemon (PID: 642)
[zygisk-next] Hooking zygote process (zygote64 & zygote32)
[zygisk-next] Modules loaded: 3 (zygisk_chameleon, playintegrityfix, tricky_store)
[zygisk-next] Engine status: READY_ACTIVE`,
      },
    ],
  },
  {
    id: 'busybox-ndk',
    name: 'Busybox for Android NDK',
    version: 'v1.34.1',
    versionCode: 13411,
    author: 'osm0sis @ xda-developers',
    description: 'Static Busybox binary compiled for all architectures with applet symlinks.',
    enabled: true,
    hasAction: false,
    hasWebUI: true,
    webUiType: 'busybox',
    path: '/data/adb/modules/busybox-ndk',
    configFiles: [
      {
        filename: 'module.prop',
        path: '/data/adb/modules/busybox-ndk/module.prop',
        description: 'Busybox module property',
        content: `id=busybox-ndk
name=Busybox for Android NDK
version=1.34.1
versionCode=13411
author=osm0sis @ xda-developers
description=Static busybox binary compiled for all Android architectures with applet symlinks.`,
      },
      {
        filename: 'applets.list',
        path: '/data/adb/modules/busybox-ndk/applets.txt',
        description: 'Available applet symlinks in /system/bin',
        content: `[ [ [ ash awk base64 basename cat chattr chmod chown chroot cksum clear cmp cp cpio cut date dd df diff dirname dmesg dos2unix du echo egrep env expand expr false fgrep find flock fold free fstrim grep groups gunzip gzip head hexdump hostname id ifconfig install kill killall ln lock lzcat lzma lzop md5sum mkdir mknod mkswap mktemp mv netstat nice nl nohup nproc od paste patch pgrep pidof pkill printf ps pwd readlink realpath renice reset rev rm rmdir sed seq setsid sh sha1sum sha256sum sha3sum sha512sum sleep sort split stat strings sum sync sysctl tac tail tar tee test time timeout top touch tr true truncate tty uname uniq unix2dos unzip uptime usleep uudecode uuencode vi watch wc which whoami xargs xz xzcat yes zcat`,
      },
    ],
  },
];
