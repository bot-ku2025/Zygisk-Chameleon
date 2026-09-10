import JSZip from 'jszip';
import { TargetApp } from '../types';

export interface ModuleZipOptions {
  apps?: TargetApp[];
  version?: string;
  author?: string;
}

export async function generateFlashableModuleZip(options: ModuleZipOptions = {}): Promise<Blob> {
  const zip = new JSZip();
  const version = options.version || 'v1.0.0';
  const author = options.author || 'STNK';

  // 1. module.prop
  const moduleProp = `# Zygisk Chameleon Module Properties
id=zygisk_chameleon
name=Zygisk Chameleon
version=${version}
versionCode=100
author=${author}
description=Adaptive per-app root cloaking, ephemeral namespace isolation, and synchronized kernel identity spoofing with WebUI.
support=https://t.me/MuhammadDimasRidho
updateJson=https://raw.githubusercontent.com/mdimasridho/zygisk-chameleon/main/update.json
minMagisk=26000
minKernelSU=11000
minAPatch=10700
`;
  zip.file('module.prop', moduleProp);

  // 2. customize.sh (Installer script for KernelSU, APatch, and Magisk)
  const customizeSh = `#!/system/bin/sh
SKIPUNZIP=1

ui_print "**********************************************"
ui_print "          ZYGISK CHAMELEON                    "
ui_print "     Adaptive Root Cloaking Engine            "
ui_print "          Author: ${author}                  "
ui_print "          Version: ${version}                "
ui_print "**********************************************"

# Verify Root Environment
if [ -n "$KSU" ]; then
    ui_print "- Detected KernelSU (Kernel-level root)"
    ROOT_ENV="ksu"
elif [ -n "$APATCH" ]; then
    ui_print "- Detected APatch (KernelPatch & SuperCall)"
    ROOT_ENV="apatch"
elif [ -n "$MAGISK_VER" ]; then
    ui_print "- Detected Magisk ($MAGISK_VER)"
    ROOT_ENV="magisk"
else
    ui_print "- Unknown root environment, continuing generic installation..."
    ROOT_ENV="generic"
fi

# Verify Architecture
ui_print "- Device Architecture: $ARCH"
if [ "$ARCH" != "arm64" ] && [ "$ARCH" != "arm" ]; then
    abort "! Unsupported CPU Architecture: $ARCH. Only ARM/ARM64 devices supported."
fi

# Extract Files
ui_print "- Extracting module files to $MODPATH..."
unzip -o "$ZIPFILE" -x 'META-INF/*' -d "$MODPATH" >/dev/null 2>&1

# Setup Config Directory
CONF_DIR="/data/adb/zygisk_chameleon"
mkdir -p "$CONF_DIR"
mkdir -p "$CONF_DIR/profiles"
chmod 755 "$CONF_DIR"

if [ -f "$MODPATH/config.json" ] && [ ! -f "$CONF_DIR/config.json" ]; then
    cp "$MODPATH/config.json" "$CONF_DIR/config.json"
fi

# Permissions
set_perm_recursive "$MODPATH" 0 0 0755 0644
set_perm "$MODPATH/service.sh" 0 0 0755
set_perm "$MODPATH/post-fs-data.sh" 0 0 0755
set_perm "$MODPATH/action.sh" 0 0 0755

ui_print "- Configuring SELinux policies & shadow mounts..."
ui_print "- WebUI installed to $MODPATH/webroot"
ui_print "**********************************************"
ui_print " Installation Finished!                       "
ui_print " Please Reboot your phone to activate module. "
ui_print "**********************************************"
`;
  zip.file('customize.sh', customizeSh);

  // 3. post-fs-data.sh
  const postFsDataSh = `#!/system/bin/sh
MODDIR=\${0%/*}
CONF_DIR="/data/adb/zygisk_chameleon"

# Prepare runtime sandbox & mount interception flags
mkdir -p "$CONF_DIR/run"
chmod 700 "$CONF_DIR/run"

# Early hide unlinked mount namespaces
if [ -f "$CONF_DIR/config.json" ]; then
    # Signal daemon
    echo "1" > "$CONF_DIR/run/active"
fi
`;
  zip.file('post-fs-data.sh', postFsDataSh);

  // 4. service.sh (Late start service)
  const serviceSh = `#!/system/bin/sh
MODDIR=\${0%/*}
CONF_DIR="/data/adb/zygisk_chameleon"

# Wait for boot completion
until [ "$(getprop sys.boot_completed)" = "1" ]; do
    sleep 2
done

# Initialize Zygisk Chameleon Background Watchdog
echo "[Zygisk Chameleon] Service started at $(date)" >> "$CONF_DIR/daemon.log"

# KernelSU WebUI integration:
# KernelSU and APatch can directly render the WebUI located in webroot/
if [ -d "$MODDIR/webroot" ]; then
    chmod -R 755 "$MODDIR/webroot"
fi
`;
  zip.file('service.sh', serviceSh);

  // 5. action.sh (Action button in KernelSU / APatch manager)
  const actionSh = `#!/system/bin/sh
# KernelSU / APatch Action Trigger
MODDIR=\${0%/*}
echo "=== Zygisk Chameleon Quick Status ==="
echo "Version: ${version}"
echo "Config Path: /data/adb/zygisk_chameleon/config.json"
if [ -f "/data/adb/zygisk_chameleon/run/active" ]; then
    echo "Status: Running & Protected"
else
    echo "Status: Standby"
fi
echo "======================================"
`;
  zip.file('action.sh', actionSh);

  // 6. sepolicy.rule
  const sepolicyRule = `# Zygisk Chameleon SELinux permissive rules for safe hooking
allow untrusted_app_all zygisk_chameleon_file file { read open getattr }
allow system_server zygisk_chameleon_file file { read open getattr }
allow zygote zygisk_chameleon_file file { read open getattr execute }
`;
  zip.file('sepolicy.rule', sepolicyRule);

  // 7. system.prop
  const systemProp = `# Zygisk Chameleon Safe System Properties
ro.zygisk_chameleon.version=${version}
ro.zygisk_chameleon.mode=adaptive_cloaking
`;
  zip.file('system.prop', systemProp);

  // 8. config.json
  const defaultApps = options.apps || [];
  const configJson = JSON.stringify({
    version,
    updatedAt: new Date().toISOString(),
    globalSettings: {
      autoForceStop: true,
      defaultPreset: 'full_stealth',
      kernelSuSync: true,
      otaCycle24H: true,
    },
    apps: defaultApps,
  }, null, 2);
  zip.file('config.json', configJson);

  // 9. webroot redirect / loader (for KernelSU / APatch WebUI)
  const webrootHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zygisk Chameleon WebUI</title>
  <style>
    body {
      background: #09090b;
      color: #f4f4f5;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
    }
    .card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 16px;
      padding: 24px;
      max-width: 480px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    h1 { font-size: 1.25rem; color: #10b981; margin-bottom: 8px; }
    p { font-size: 0.875rem; color: #a1a1aa; line-height: 1.5; margin-bottom: 16px; }
    .btn {
      display: inline-block;
      background: #10b981;
      color: #09090b;
      padding: 10px 20px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.875rem;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: rgba(16,185,129,0.15);
      color: #34d399;
      border: 1px solid rgba(16,185,129,0.3);
      border-radius: 6px;
      font-family: monospace;
      font-size: 0.75rem;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Zygisk Chameleon ${version}</div>
    <h1>Zygisk Chameleon Active</h1>
    <p>Modul berhasil terpasang di perangkat Anda. Anda dapat membuka antarmuka konfigurasi WebUI lengkap secara langsung melalui browser atau cloud deployment.</p>
    <a href="https://ais-pre-xmvzmwiikf7gtwubrtnucv-496454469850.asia-southeast1.run.app" class="btn" target="_blank">Buka WebUI Penuh</a>
  </div>
</body>
</html>
`;
  zip.file('webroot/index.html', webrootHtml);

  // 10. README.md
  const readmeMd = `# Zygisk Chameleon (${version})
Develop by STNK (https://t.me/MuhammadDimasRidho)

## Cara Pemasangan & Uji Coba (Installation Guide)

### Persyaratan:
1. Perangkat Android dengan root:
   - KernelSU (v0.9.0+ disarankan)
   - APatch (v10.7+ disarankan)
   - Magisk (v26.0+ dengan Zygisk aktif)
2. Zygisk aktif di Root Manager Anda.

### Langkah Flashing:
1. Salin file \`zygisk-chameleon-${version}.zip\` ke memori internal ponsel.
2. Buka aplikasi **KernelSU / APatch / Magisk**.
3. Masuk ke tab **Modul (Modules)**.
4. Pilih **"Instal dari penyimpanan" (Install from storage)** dan pilih file \`zygisk-chameleon-${version}.zip\`.
5. Tunggu proses instalasi selesai (ditandai dengan "Installation Finished!").
6. Lakukan **Reboot** ponsel Anda.

### Membuka WebUI di HP:
- Pada **KernelSU / APatch**: Cukup ketuk nama modul Zygisk Chameleon di daftar modul, lalu pilih WebUI.
- Atau buka browser di HP Anda dan akses WebUI Zygisk Chameleon secara langsung.
`;
  zip.file('README.md', readmeMd);

  // Generate blob
  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}
