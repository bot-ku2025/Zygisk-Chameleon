import React, { useState } from 'react';
import { useAutoAppIcon } from '../utils/appIconResolver';
import { Sparkles } from 'lucide-react';

interface AppIconProps {
  appId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showAutoBadge?: boolean;
}

export const AppIcon: React.FC<AppIconProps> = ({ 
  appId, 
  size = 'md', 
  className = '',
  showAutoBadge = false,
}) => {
  const { iconUrl, isLoading, hasError } = useAutoAppIcon(appId);
  const [imgFailed, setImgFailed] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-11 h-11 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
  }[size];

  // If official Google Play icon is detected and hasn't failed loading
  if (iconUrl && !imgFailed) {
    return (
      <div
        className={`${sizeClasses} relative overflow-hidden bg-zinc-900 border border-zinc-800/80 shadow-md shadow-black/40 flex-shrink-0 group ${className}`}
      >
        <img
          src={iconUrl}
          alt={appId}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover select-none transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
        {showAutoBadge && (
          <div
            title="Auto-detected genuine Google Play icon"
            className="absolute bottom-0 right-0 p-0.5 bg-emerald-500/90 text-zinc-950 rounded-tl shadow"
          >
            <Sparkles className="w-2.5 h-2.5" />
          </div>
        )}
      </div>
    );
  }

  // Loading state while auto-detecting
  if (isLoading) {
    return (
      <div
        className={`${sizeClasses} bg-zinc-800 animate-pulse border border-zinc-700/60 flex items-center justify-center flex-shrink-0 ${className}`}
      >
        <div className="w-4 h-4 rounded-full border-2 border-emerald-500/40 border-t-emerald-400 animate-spin" />
      </div>
    );
  }

  // High-fidelity fallback for known apps if offline
  if (appId === 'com.shopee.id') {
    return (
      <div
        className={`${sizeClasses} bg-gradient-to-b from-[#FF5722] to-[#EE4D2D] p-1.5 flex items-center justify-center shadow-md shadow-orange-950/40 relative overflow-hidden border border-orange-400/30 flex-shrink-0 ${className}`}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none">
          <path d="M34 38 C34 22, 66 22, 66 38" stroke="white" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M20 38 L25 84 C25.5 88, 29 91, 33 91 L67 91 C71 91, 74.5 88, 75 84 L80 38 Z" fill="white" />
          <path d="M58 48 C55 45, 45 44, 43 49 C41 54, 57 56, 57 65 C57 73, 47 75, 41 72 M41 72 L41 75" stroke="#EE4D2D" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
    );
  }

  if (appId === 'com.bca') {
    return (
      <div
        className={`${sizeClasses} bg-gradient-to-b from-[#004899] to-[#002766] p-1.5 flex flex-col items-center justify-center shadow-md shadow-blue-950/50 relative overflow-hidden border border-blue-400/30 flex-shrink-0 ${className}`}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <path d="M20 18 L80 18 C80 18, 84 55, 50 86 C16 55, 20 18, 20 18 Z" fill="#0052A3" stroke="white" strokeWidth="3.5" />
          <path d="M30 38 C40 30, 60 30, 70 38 C65 52, 50 62, 50 62 C50 62, 35 52, 30 38 Z" fill="#FFCC00" />
          <path d="M35 40 C43 33, 57 33, 65 40 C60 50, 50 58, 50 58 C50 58, 40 50, 35 40 Z" fill="#ED1C24" />
          <text x="50" y="81" textAnchor="middle" fill="white" fontSize="18" fontWeight="900" fontFamily="Arial, sans-serif">BCA</text>
        </svg>
      </div>
    );
  }

  if (appId === 'id.dana') {
    return (
      <div
        className={`${sizeClasses} bg-gradient-to-b from-[#118EEA] to-[#0E6CBA] p-1.5 flex items-center justify-center shadow-md shadow-sky-950/50 relative overflow-hidden border border-sky-400/30 flex-shrink-0 ${className}`}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none">
          <circle cx="50" cy="50" r="42" fill="#118EEA" />
          <path d="M26 33 L45 33 C62 33, 74 41, 74 53 C74 65, 62 73, 45 73 L26 73 Z" fill="white" />
          <path d="M37 43 L45 43 C54 43, 61 47, 61 53 C61 59, 54 63, 45 63 L37 63 Z" fill="#118EEA" />
          <polygon points="50,47 52,52 57,53 53,56 54,61 50,58 46,61 47,56 43,53 48,52" fill="#FFD200" />
        </svg>
      </div>
    );
  }

  if (appId === 'com.gojek.app') {
    return (
      <div
        className={`${sizeClasses} bg-gradient-to-b from-[#00AA13] to-[#008810] p-1.5 flex items-center justify-center shadow-md shadow-emerald-950/50 relative overflow-hidden border border-emerald-400/30 flex-shrink-0 ${className}`}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none">
          <circle cx="50" cy="50" r="33" stroke="white" strokeWidth="12" fill="none" />
          <circle cx="50" cy="50" r="12" fill="white" />
          <rect x="52" y="12" width="18" height="15" fill="#00AA13" transform="rotate(35 52 12)" />
        </svg>
      </div>
    );
  }

  // Generic fallback for custom packages
  return (
    <div
      className={`${sizeClasses} bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/80 p-2 flex items-center justify-center text-zinc-300 shadow-md flex-shrink-0 ${className}`}
    >
      <div className="font-mono text-[10px] font-bold text-emerald-400 text-center uppercase tracking-tighter truncate max-w-full">
        {appId.split('.').pop()?.substring(0, 3) || 'APP'}
      </div>
    </div>
  );
};
