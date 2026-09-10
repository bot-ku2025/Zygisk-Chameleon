import { useState, useEffect } from 'react';

// Pre-seeded verified official Google Play Store CDN app icons
const PRESEEDED_OFFICIAL_ICONS: Record<string, string> = {
  'com.shopee.id':
    'https://play-lh.googleusercontent.com/iQSwLIDG3thlv1OoVFD9kVtCFdYUUdeM-cZ2WGwsuodGQKm8rrfzMzgfHF4lvQfwkmov7_3rxzeAB9qiuQ0i_l4=s180-rw',
  'com.bca':
    'https://play-lh.googleusercontent.com/X_mZBEXEq098F3AuGWXmRq51jMWJyEQf62uZjjEdNHmxA4_-5ma1YG4sunDorwxl60qhGDQJB4LjpWQgHVVIlg=s180-rw',
  'id.dana':
    'https://play-lh.googleusercontent.com/3pjYaXJAV8Q05NwQbvsGCnkflnR8Sh_5xLoj92Uq5ptmnn2nbfp0WrCzKPPyI3eYpMz1f8mxd-RWm-1NrWzhPQ=s180-rw',
  'com.gojek.app':
    'https://play-lh.googleusercontent.com/LMMiBxDmUDNqqTK8V3Xcgoy_Mf4t9TD-IbKznzp-NeOPH6GDV5vZ_SO0qjE3iv0LENGvu2dat9ZTIS4KS9UJ=s180-rw',
  'com.mobile.legends':
    'https://play-lh.googleusercontent.com/MztmLpB1-_eFbHnqNzzvzl5zjiOH2BEb0D71uBxZYf_4BEmW3QEPWODhRtyqY7Qz4wRLwQ--Rg1RAjOFqtHSs-o=s180-rw',
  'com.tokopedia.tkpd':
    'https://play-lh.googleusercontent.com/SRaYm_m0CexjTJZtViLmQFWDqt5YvFzhElku5ZHbfvbnit4ASZSmKDHC_cMFcCm5lPP8qiN4v1vj54P0ngiTPA=s180-rw',
  'id.bmri.livin':
    'https://play-lh.googleusercontent.com/9W6GZFDXIfeGrqO87czC_x8s4ece5Yq26Y8vjrZ-Nm5wsyYKLQjz1OPaaJxxXYWdt8jhOtmIsPlmtkK5v7BwNaI=s180-rw',
  'id.co.bri.brimo':
    'https://play-lh.googleusercontent.com/tPkBCKqgRm2WxCbnDXtFP54MZ0Pdi2qOi9xk4cpbqzTseTZiZFkb0JnZkat-W269nTtZEsXxN8B_W_7nyOJ3=s180-rw',
  'com.whatsapp':
    'https://play-lh.googleusercontent.com/bYtqbOcTYOVuQO6VrhZMvmmAtWeP0uza6jwEMcvFQTEXQgOsASdj73viKitWedflrw=s180-rw',
  'com.instagram.android':
    'https://play-lh.googleusercontent.com/VRMWkE5UC8UVzAqnDTsiQIIRLeplsuUi9ZNJsbdWBQXgzujHcgW4Cu-50AaNsOTuh3dZ=s180-rw',
  'com.google.android.youtube':
    'https://play-lh.googleusercontent.com/1-hPxafOxdYpYZEOKTaSuMwGamlIVmEvBmJfncFineBAstMvfLehumfhR1isyuvAquzX=s180-rw',
  'com.spotify.music':
    'https://play-lh.googleusercontent.com/UrY7BAZ-XfXGpfkeWg0zCCeo-7blznDfbIIIKDh15jaUpmqhEdOtEpasswdZaOublG6Y=s180-rw',
};

// In-memory runtime cache
const memoryIconCache = new Map<string, string>();

// Initialize memory cache from localStorage if available
try {
  const stored = localStorage.getItem('chameleon_detected_icons');
  if (stored) {
    const parsed = JSON.parse(stored);
    Object.entries(parsed).forEach(([k, v]) => {
      if (typeof v === 'string') memoryIconCache.set(k, v);
    });
  }
} catch {
  // Ignore storage read errors
}

export function getCachedAppIcon(appId: string): string | null {
  if (PRESEEDED_OFFICIAL_ICONS[appId]) {
    return PRESEEDED_OFFICIAL_ICONS[appId];
  }
  return memoryIconCache.get(appId) || null;
}

export function saveAppIconToCache(appId: string, iconUrl: string) {
  memoryIconCache.set(appId, iconUrl);
  try {
    const obj: Record<string, string> = {};
    memoryIconCache.forEach((val, key) => {
      obj[key] = val;
    });
    localStorage.setItem('chameleon_detected_icons', JSON.stringify(obj));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Hook to automatically resolve the real official app icon from Google Play Store
 */
export function useAutoAppIcon(appId: string) {
  const [iconUrl, setIconUrl] = useState<string | null>(() => getCachedAppIcon(appId));
  const [isLoading, setIsLoading] = useState<boolean>(!getCachedAppIcon(appId));
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const cached = getCachedAppIcon(appId);
    if (cached) {
      setIconUrl(cached);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    const controller = new AbortController();

    async function fetchPlayStoreIcon() {
      try {
        const res = await fetch(`/api/app-icon?package=${encodeURIComponent(appId)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }
        const data = await res.json();
        if (data && data.iconUrl) {
          if (isMounted) {
            saveAppIconToCache(appId, data.iconUrl);
            setIconUrl(data.iconUrl);
            setIsLoading(false);
          }
        } else {
          throw new Error('No iconUrl in response');
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError' && isMounted) {
          setIsLoading(false);
          setHasError(true);
        }
      }
    }

    fetchPlayStoreIcon();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [appId]);

  return {
    iconUrl,
    isLoading,
    hasError,
    isAutoDetected: !!iconUrl,
  };
}
