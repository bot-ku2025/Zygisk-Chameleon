export interface GeneratedProfile {
  kernelString: string;
  buildId: string;
  buildDisplayId: string;
  sdkVersion: string;
  securityPatch: string;
  fingerprint: string;
  cmdlineString: string;
  installerPackage: string;
}

export function generateSmartProfile(
  targetAndroid: '13' | '14' | '15' | '16',
  brand: 'Xiaomi' | 'Samsung' | 'Google' = 'Xiaomi',
  baseKernel: string = '4.19.157'
): GeneratedProfile {
  // Random 6-8 digit commit hash
  const randomHex = Math.random().toString(16).substring(2, 8);
  const randomBuildNum = Math.floor(Math.random() * 80) + 10;
  
  let sdk = '34';
  let buildIdPrefix = 'U';
  let patchDate = '2024-04-05';
  let displayId = 'V14.0.8.0.UMCMIXM';
  let fingerprint = '';

  switch (targetAndroid) {
    case '13':
      sdk = '33';
      buildIdPrefix = 'T';
      patchDate = '2023-09-05';
      if (brand === 'Xiaomi') {
        displayId = 'V14.0.7.0.TLQMIXM';
        fingerprint = `Xiaomi/fuxi_global/fuxi:13/TKQ1.221114.001/V14.0.7.0.TLQMIXM:user/release-keys`;
      } else if (brand === 'Samsung') {
        displayId = 'TP1A.220624.014.S908BXXU4CWD3';
        fingerprint = `samsung/b0qxxx/b0q:13/TP1A.220624.014/S908BXXU4CWD3:user/release-keys`;
      } else {
        displayId = 'TQ3A.230901.001';
        fingerprint = `google/panther/panther:13/TQ3A.230901.001/10750761:user/release-keys`;
      }
      break;

    case '14':
      sdk = '34';
      buildIdPrefix = 'U';
      patchDate = '2024-05-05';
      if (brand === 'Xiaomi') {
        displayId = '1.0.8.0.UMCMIXM';
        fingerprint = `Xiaomi/fuxi_global/fuxi:14/UKQ1.230804.001/V14.0.8.0.UMCMIXM:user/release-keys`;
      } else if (brand === 'Samsung') {
        displayId = 'UP1A.231005.007.S918BXXU3BWJM';
        fingerprint = `samsung/dm3qxxx/dm3q:14/UP1A.231005.007/S918BXXU3BWJM:user/release-keys`;
      } else {
        displayId = 'UQ1A.240205.004';
        fingerprint = `google/shiba/shiba:14/UQ1A.240205.004/11269751:user/release-keys`;
      }
      break;

    case '15':
      sdk = '35';
      buildIdPrefix = 'V';
      patchDate = '2024-11-05';
      if (brand === 'Xiaomi') {
        displayId = '2.0.2.0.VNCMIXM';
        fingerprint = `Xiaomi/houji_global/houji:15/VKQ1.240501.001/V15.0.2.0.VNCMIXM:user/release-keys`;
      } else if (brand === 'Samsung') {
        displayId = 'VP1A.240905.010.S928BXXU2AXK4';
        fingerprint = `samsung/e3qxxx/e3q:15/VP1A.240905.010/S928BXXU2AXK4:user/release-keys`;
      } else {
        displayId = 'AP3A.241005.015';
        fingerprint = `google/caiman/caiman:15/AP3A.241005.015/12441999:user/release-keys`;
      }
      break;

    case '16':
      sdk = '36';
      buildIdPrefix = 'B';
      patchDate = '2025-06-05';
      displayId = 'BP1A.250505.001';
      fingerprint = `google/komodo/komodo:16/BP1A.250505.001/13100200:user/release-keys`;
      break;
  }

  // Construct realistic Google AOSP / OEM kernel format
  const kernelString = `Linux version ${baseKernel}-android${targetAndroid}-${randomBuildNum}-g${randomHex} (android-build@google.com) (Android (10750761, based on r487747c) clang version 17.0.2) #1 SMP PREEMPT Tue ${patchDate} UTC`;

  const randomSubDay = Math.floor(Math.random() * 20) + 10;
  const buildId = `${buildIdPrefix}P1A.23${randomSubDay}.00${Math.floor(Math.random() * 9) + 1}`;

  return {
    kernelString,
    buildId,
    buildDisplayId: displayId,
    sdkVersion: sdk,
    securityPatch: patchDate,
    fingerprint,
    cmdlineString: 'androidboot.verifiedbootstate=green androidboot.flash.locked=1 androidboot.vbmeta.device_state=locked enforcing=1',
    installerPackage: 'com.android.vending',
  };
}
