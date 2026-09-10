import { RootEnvironment, TargetApp } from '../types';

declare global {
  interface Window {
    ksu?: {
      exec?: (cmd: string, callback?: (errno: number, stdout: string, stderr: string) => void) => string | void;
      full_exec?: (cmd: string) => Promise<{ errno: number; stdout: string; stderr: string }>;
      toast?: (msg: string) => void;
      mmrl?: any;
    };
    $ksu?: any;
  }
}

export interface RealDeviceInfo {
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

/**
 * Execute command via KernelSU/ResuKSU/APatch WebUI JavascriptInterface bridge.
 */
export async function execRootCommand(cmd: string): Promise<{ success: boolean; stdout: string; stderr: string }> {
  try {
    // 1. Check if window.ksu.full_exec is available (ResuKSU / Modern KernelSU)
    if (window.ksu?.full_exec && typeof window.ksu.full_exec === 'function') {
      const res = await window.ksu.full_exec(cmd);
      return {
        success: res.errno === 0,
        stdout: res.stdout || '',
        stderr: res.stderr || '',
      };
    }

    // 2. Check if window.ksu.exec is available with callback or sync return
    if (window.ksu?.exec && typeof window.ksu.exec === 'function') {
      return new Promise((resolve) => {
        try {
          const syncRet = window.ksu!.exec!(cmd, (errno, stdout, stderr) => {
            resolve({
              success: errno === 0,
              stdout: stdout || '',
              stderr: stderr || '',
            });
          });

          // Some versions return stdout directly as string
          if (typeof syncRet === 'string') {
            resolve({
              success: true,
              stdout: syncRet,
              stderr: '',
            });
          }
        } catch (err: any) {
          resolve({
            success: false,
            stdout: '',
            stderr: String(err?.message || err),
          });
        }
      });
    }

    // 3. Fallback when running inside standard browser preview without root WebUI bridge
    return {
      success: false,
      stdout: '',
      stderr: 'WebUI root bridge (window.ksu) not detected in current WebView context.',
    };
  } catch (error: any) {
    return {
      success: false,
      stdout: '',
      stderr: error?.message || 'Execution error',
    };
  }
}

/**
 * Check if the app is currently running inside a real root manager WebView (ResuKSU/KernelSU/APatch).
 */
export function isKsuBridgeAvailable(): boolean {
  return typeof window !== 'undefined' && (!!window.ksu || !!window.$ksu);
}

/**
 * Query real device properties dynamically from the Android system.
 */
export async function queryRealDeviceInfo(): Promise<RealDeviceInfo> {
  const isAvailable = isKsuBridgeAvailable();

  if (!isAvailable) {
    // Check if we have previously saved device info in localStorage
    const cached = localStorage.getItem('chameleon_device_info');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }

    // Fallback baseline for non-rooted browser preview
    return {
      brand: 'Android',
      model: 'Device (Awaiting Root Shell)',
      device: 'generic_arm64',
      product: 'generic',
      manufacturer: 'Android',
      fingerprint: 'generic/arm64-v8a/user/release-keys',
      securityPatch: '2025-02-05',
      androidVersion: '14',
      firstApiLevel: '32',
      selinux: 'Enforcing',
      isRealDevice: false,
    };
  }

  try {
    const cmd = `
      getprop ro.product.brand
      echo "---SEP---"
      getprop ro.product.model
      echo "---SEP---"
      getprop ro.product.device
      echo "---SEP---"
      getprop ro.product.manufacturer
      echo "---SEP---"
      getprop ro.build.fingerprint
      echo "---SEP---"
      getprop ro.build.version.security_patch
      echo "---SEP---"
      getprop ro.build.version.release
      echo "---SEP---"
      getprop ro.product.first_api_level
      echo "---SEP---"
      getenforce
    `;

    const { stdout } = await execRootCommand(cmd);
    const parts = stdout.split('---SEP---').map((s) => s.trim());

    const realInfo: RealDeviceInfo = {
      brand: parts[0] || 'Android',
      model: parts[1] || 'Device',
      device: parts[2] || 'arm64',
      manufacturer: parts[3] || 'Android',
      fingerprint: parts[4] || 'generic/release-keys',
      securityPatch: parts[5] || '2025-02-05',
      androidVersion: parts[6] || '14',
      firstApiLevel: parts[7] || '32',
      product: parts[2] || 'device',
      selinux: (parts[8]?.toLowerCase().includes('permissive') ? 'Permissive' : 'Enforcing') as any,
      isRealDevice: true,
    };

    localStorage.setItem('chameleon_device_info', JSON.stringify(realInfo));
    return realInfo;
  } catch {
    return {
      brand: 'Android',
      model: 'Native Device',
      device: 'arm64',
      product: 'generic',
      manufacturer: 'Android',
      fingerprint: 'generic/release-keys',
      securityPatch: '2025-02-05',
      androidVersion: '14',
      firstApiLevel: '32',
      selinux: 'Enforcing',
      isRealDevice: false,
    };
  }
}

/**
 * Detect real root manager (ResuKSU / KernelSU / APatch / Magisk) from the phone.
 */
export async function detectRealRootEnvironment(): Promise<RootEnvironment> {
  const isAvailable = isKsuBridgeAvailable();

  if (!isAvailable) {
    const cached = localStorage.getItem('chameleon_root_env');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }

    return {
      manager: 'KernelSU',
      version: 'ResuKSU Native WebUI',
      versionCode: 11950,
      mode: 'Kernel GKI Ring-0 (Adaptive Hook)',
      selinux: 'Enforcing',
      suPath: '/data/adb/ksu/bin/su',
      modulePath: '/data/adb/modules/zygisk_chameleon',
      zygiskStatus: 'Zygisk Chameleon v1.0.0 (Native Active)',
      granted: true,
    };
  }

  try {
    const cmd = `
      which ksu || which apd || which magisk || which su
      echo "---SEP---"
      ksu -V 2>/dev/null || magisk -V 2>/dev/null || echo "0"
      echo "---SEP---"
      getenforce
      echo "---SEP---"
      ls -d /data/adb/ksu 2>/dev/null || ls -d /data/adb/ap 2>/dev/null || echo "generic"
    `;

    const { stdout } = await execRootCommand(cmd);
    const parts = stdout.split('---SEP---').map((s) => s.trim());

    const whichOutput = (parts[0] || '').toLowerCase();
    const verCode = parseInt(parts[1] || '0', 10) || 11950;
    const selinuxStr = parts[2] || 'Enforcing';
    const adbPath = parts[3] || '';

    let managerName: 'KernelSU' | 'APatch' | 'Magisk' = 'KernelSU';
    let versionStr = 'v1.0.0 (ResuKSU WebUI)';
    let suPath = '/data/adb/ksu/bin/su';

    if (adbPath.includes('ap') || whichOutput.includes('apd')) {
      managerName = 'APatch';
      versionStr = `APatch (Code: ${verCode})`;
      suPath = '/data/adb/ap/bin/su';
    } else if (whichOutput.includes('magisk')) {
      managerName = 'Magisk';
      versionStr = `Magisk (Code: ${verCode})`;
      suPath = '/data/adb/magisk/su';
    } else {
      managerName = 'KernelSU';
      versionStr = `ResuKSU/KernelSU (v${verCode})`;
      suPath = '/data/adb/ksu/bin/su';
    }

    const env: RootEnvironment = {
      manager: managerName,
      version: versionStr,
      versionCode: verCode,
      mode: 'Kernel GKI Ring-0 (Adaptive Hook)',
      selinux: selinuxStr.toLowerCase().includes('permissive') ? 'Permissive' : 'Enforcing',
      suPath,
      modulePath: '/data/adb/modules/zygisk_chameleon',
      zygiskStatus: 'Zygisk Chameleon v1.0.0 (Active)',
      granted: true,
    };

    localStorage.setItem('chameleon_root_env', JSON.stringify(env));
    return env;
  } catch {
    return {
      manager: 'KernelSU',
      version: 'ResuKSU Environment',
      versionCode: 11950,
      mode: 'Kernel GKI Hook',
      selinux: 'Enforcing',
      suPath: '/data/adb/ksu/bin/su',
      modulePath: '/data/adb/modules/zygisk_chameleon',
      zygiskStatus: 'Active',
      granted: true,
    };
  }
}

/**
 * Scan real third-party applications installed on the phone using `pm list packages -3`.
 */
export async function scanRealInstalledApps(): Promise<{ id: string; name: string }[]> {
  const isAvailable = isKsuBridgeAvailable();
  if (!isAvailable) {
    return [];
  }

  try {
    const { stdout } = await execRootCommand('pm list packages -3');
    if (!stdout) return [];

    const lines = stdout.split('\n');
    const packages: { id: string; name: string }[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line.startsWith('package:')) continue;
      const pkgId = line.replace('package:', '').trim();
      if (!pkgId) continue;

      // Guess human-readable name from package segments
      const segments = pkgId.split('.');
      const lastSegment = segments[segments.length - 1];
      const humanName = lastSegment
        .replace(/_/g, ' ')
        .replace(/^[a-z]/, (c) => c.toUpperCase());

      packages.push({
        id: pkgId,
        name: humanName,
      });
    }

    return packages;
  } catch {
    return [];
  }
}

/**
 * Write configuration files directly to `/data/adb/zygisk_chameleon/`.
 */
export async function writeModuleConfig(filename: string, content: string): Promise<boolean> {
  const isAvailable = isKsuBridgeAvailable();
  if (!isAvailable) {
    localStorage.setItem(`chameleon_cfg_${filename}`, content);
    return true;
  }

  try {
    const safeContent = content.replace(/'/g, "'\\''");
    const cmd = `
      mkdir -p /data/adb/zygisk_chameleon
      chmod 755 /data/adb/zygisk_chameleon
      cat << 'EOF' > /data/adb/zygisk_chameleon/${filename}
${content}
EOF
      chmod 644 /data/adb/zygisk_chameleon/${filename}
    `;
    const res = await execRootCommand(cmd);
    return res.success;
  } catch {
    return false;
  }
}
