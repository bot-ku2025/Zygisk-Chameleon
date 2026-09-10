import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, X, Play, Pause, Trash2, Download, ShieldAlert, 
  Filter, Zap, Radio, CheckCircle, AlertTriangle, ShieldCheck,
  RefreshCw, Copy, Check
} from 'lucide-react';
import { SyscallLogEvent, Language, TargetApp } from '../types';

interface LiveSyscallMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  apps: TargetApp[];
}

const SAMPLE_EVENTS: Omit<SyscallLogEvent, 'id' | 'timestamp'>[] = [
  {
    appId: 'com.bca',
    appName: 'BCA mobile',
    syscallName: 'sys_openat',
    argument: '/proc/self/maps',
    actionTaken: 'SHADOW_REDIRECT',
    severity: 'CRITICAL',
    raspMechanism: 'Promon SHIELD v6.4 (.text checksum probe)',
  },
  {
    appId: 'com.bca',
    appName: 'BCA mobile',
    syscallName: 'sys_faccessat2',
    argument: '/system/bin/su',
    actionTaken: 'BLOCKED_ENOENT',
    severity: 'HIGH',
    raspMechanism: 'Promon SVC Assembly Direct Hook',
  },
  {
    appId: 'com.bca',
    appName: 'BCA mobile',
    syscallName: 'arm64_cntvct_el0',
    argument: 'CNTVCT_EL0 (Hardware Tick Delta = 48ns)',
    actionTaken: 'TRAPPED_NORMALIZED',
    severity: 'CRITICAL',
    raspMechanism: 'Anti-Debugging Timing Loop Attack',
  },
  {
    appId: 'com.shopee.id',
    appName: 'Shopee',
    syscallName: 'sys_openat',
    argument: '/proc/net/unix',
    actionTaken: 'SCRUBBED_FILTER',
    severity: 'HIGH',
    raspMechanism: 'Shopee Security Daemon Abstract Probe',
  },
  {
    appId: 'com.shopee.id',
    appName: 'Shopee',
    syscallName: 'dl_iterate_phdr',
    argument: '__dl__ZL10g_dl_mutex (soinfo scan)',
    actionTaken: 'UNLINKED_SOLIST',
    severity: 'CRITICAL',
    raspMechanism: 'Bionic Linker In-Memory Module Hunter',
  },
  {
    appId: 'id.bmri.livin',
    appName: "Livin' by Mandiri",
    syscallName: 'sys_readlinkat',
    argument: '/proc/self/mountinfo',
    actionTaken: 'SCRUBBED_FILTER',
    severity: 'HIGH',
    raspMechanism: 'Mandiri Livin VFS Rootfs Scanner',
  },
  {
    appId: 'id.bmri.livin',
    appName: "Livin' by Mandiri",
    syscallName: 'sys_openat',
    argument: '/data/adb/ksu',
    actionTaken: 'BLOCKED_ENOENT',
    severity: 'HIGH',
    raspMechanism: 'KernelSU Namespace Direct Probe',
  },
  {
    appId: 'com.bri.brimo',
    appName: 'BRImo BRI',
    syscallName: 'ptrace',
    argument: 'PTRACE_TRACEME',
    actionTaken: 'BLOCKED_ENOENT',
    severity: 'CRITICAL',
    raspMechanism: 'DexGuard Anti-Debug Trace Trap',
  },
  {
    appId: 'com.google.android.gms',
    appName: 'Google Play Services',
    syscallName: 'keymaster_attestation',
    argument: 'OEM StrongBox Keybox EC P-256 Valid',
    actionTaken: 'SHADOW_REDIRECT',
    severity: 'INFO',
    raspMechanism: 'Play Integrity Hardware Attestation',
  },
];

export const LiveSyscallMonitorModal: React.FC<LiveSyscallMonitorModalProps> = ({
  isOpen,
  onClose,
  lang,
  apps,
}) => {
  const isId = lang === 'id';
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedAppFilter, setSelectedAppFilter] = useState<string>('all');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('all');
  const [events, setEvents] = useState<SyscallLogEvent[]>([]);
  const [copied, setCopied] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Initialize initial mock stream events
  useEffect(() => {
    if (events.length === 0) {
      const now = new Date();
      const initial = SAMPLE_EVENTS.slice(0, 5).map((e, idx) => {
        const time = new Date(now.getTime() - (5 - idx) * 1200);
        return {
          ...e,
          id: 'log-' + Math.random().toString(36).substring(2, 9),
          timestamp: time.toTimeString().split(' ')[0] + '.' + String(time.getMilliseconds()).padStart(3, '0'),
        };
      });
      setEvents(initial);
    }
  }, []);

  // Periodic streaming simulation when active
  useEffect(() => {
    if (!isOpen || !isStreaming) return;

    const interval = setInterval(() => {
      const now = new Date();
      const randomTemplate = SAMPLE_EVENTS[Math.floor(Math.random() * SAMPLE_EVENTS.length)];
      const newEvent: SyscallLogEvent = {
        ...randomTemplate,
        id: 'log-' + Math.random().toString(36).substring(2, 9),
        timestamp: now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0'),
      };

      setEvents((prev) => [...prev.slice(-150), newEvent]);
    }, 1800);

    return () => clearInterval(interval);
  }, [isOpen, isStreaming]);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalRef.current && isStreaming) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [events, isStreaming]);

  if (!isOpen) return null;

  const filteredEvents = events.filter((e) => {
    if (selectedAppFilter !== 'all' && e.appId !== selectedAppFilter) return false;
    if (selectedSeverityFilter !== 'all' && e.severity !== selectedSeverityFilter) return false;
    return true;
  });

  const triggerAttackBurst = (preset: 'bca' | 'shopee' | 'play_integrity') => {
    const now = new Date();
    let burstTemplates: Omit<SyscallLogEvent, 'id' | 'timestamp'>[] = [];

    if (preset === 'bca') {
      burstTemplates = [
        {
          appId: 'com.bca',
          appName: 'BCA mobile',
          syscallName: 'sys_openat',
          argument: '/proc/self/maps',
          actionTaken: 'SHADOW_REDIRECT',
          severity: 'CRITICAL',
          raspMechanism: 'Promon SHIELD v6.4 (Aggressive Memory Walk)',
        },
        {
          appId: 'com.bca',
          appName: 'BCA mobile',
          syscallName: 'arm64_cntvct_el0',
          argument: 'CNTVCT_EL0 Loop Trap Intercepted (32ns)',
          actionTaken: 'TRAPPED_NORMALIZED',
          severity: 'CRITICAL',
          raspMechanism: 'Promon High-Precision Timing Probe',
        },
        {
          appId: 'com.bca',
          appName: 'BCA mobile',
          syscallName: 'dl_iterate_phdr',
          argument: '__dl__ZL10g_dl_mutex (soinfo scrubbed)',
          actionTaken: 'UNLINKED_SOLIST',
          severity: 'HIGH',
          raspMechanism: 'Bionic Linker Solist Scanner',
        },
      ];
    } else if (preset === 'shopee') {
      burstTemplates = [
        {
          appId: 'com.shopee.id',
          appName: 'Shopee',
          syscallName: 'sys_openat',
          argument: '/proc/net/unix (@shopee_socket_guard)',
          actionTaken: 'SCRUBBED_FILTER',
          severity: 'HIGH',
          raspMechanism: 'Abstract Unix Domain Probe',
        },
        {
          appId: 'com.shopee.id',
          appName: 'Shopee',
          syscallName: 'sys_readlinkat',
          argument: '/proc/self/exe',
          actionTaken: 'SCRUBBED_FILTER',
          severity: 'MEDIUM',
          raspMechanism: 'Executable Binary Path Integrity',
        },
      ];
    } else {
      burstTemplates = [
        {
          appId: 'com.google.android.gms',
          appName: 'Play Integrity Client',
          syscallName: 'TEE_AttestDevice',
          argument: 'StrongBox Keymint OEM Verified Token',
          actionTaken: 'SHADOW_REDIRECT',
          severity: 'INFO',
          raspMechanism: 'Google Play Integrity API (StrongBox Verified)',
        },
      ];
    }

    const newLogs: SyscallLogEvent[] = burstTemplates.map((t, i) => ({
      ...t,
      id: 'burst-' + Date.now() + '-' + i,
      timestamp: now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds() + i * 80).padStart(3, '0'),
    }));

    setEvents((prev) => [...prev, ...newLogs]);
  };

  const handleCopyLogs = () => {
    const text = filteredEvents
      .map((e) => `[${e.timestamp}] [${e.severity}] [${e.appName}] ${e.syscallName} -> ${e.argument} | ACTION: ${e.actionTaken} (${e.raspMechanism})`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogFile = () => {
    const text = filteredEvents
      .map((e) => `[${e.timestamp}] [${e.severity}] [${e.appName} (${e.appId})] ${e.syscallName} -> ${e.argument} | ACTION: ${e.actionTaken} (${e.raspMechanism})`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chameleon_live_trace_${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (action: SyscallLogEvent['actionTaken']) => {
    switch (action) {
      case 'BLOCKED_ENOENT':
        return <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">ENOENT (Blocked)</span>;
      case 'SCRUBBED_FILTER':
        return <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Scrubbed (Clean)</span>;
      case 'SHADOW_REDIRECT':
        return <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">Shadow Redirect</span>;
      case 'TRAPPED_NORMALIZED':
        return <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Cycle Trapped</span>;
      case 'UNLINKED_SOLIST':
        return <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">solist Unlinked</span>;
      default:
        return <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">Passed</span>;
    }
  };

  const getSeverityBadge = (severity: SyscallLogEvent['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/60 font-bold">CRIT</span>;
      case 'HIGH':
        return <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-bold">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60">MED</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">INFO</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-950 border border-emerald-500/40 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-fadeIn">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/90 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 font-mono tracking-tight">
                  {isId ? 'Monitor Live Syscall & Intersepsi RASP' : 'Live Syscall & RASP Interception Monitor'}
                </h3>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-semibold">
                  <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                  {isStreaming ? 'LIVE STREAMING' : 'PAUSED'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isId 
                  ? 'Audit forensik real-time: memotong syscall rakitan ARM64, loop anti-debugging, dan probe memori solist.' 
                  : 'Real-time forensic audit: intercepts raw ARM64 assembly syscalls, timing anti-debug loops, and solist memory probes.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="px-4 py-3 bg-zinc-900/40 border-b border-zinc-800/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Stream Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isStreaming 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isStreaming ? (isId ? 'Jeda Stream' : 'Pause') : (isId ? 'Lanjutkan' : 'Resume')}</span>
            </button>

            <button
              onClick={() => setEvents([])}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 flex items-center gap-1 transition-colors cursor-pointer"
              title="Bersihkan Log"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isId ? 'Bersihkan' : 'Clear'}</span>
            </button>

            {/* Filter by App */}
            <select
              value={selectedAppFilter}
              onChange={(e) => setSelectedAppFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">{isId ? 'Semua Aplikasi Target' : 'All Target Apps'}</option>
              {apps.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>

            {/* Filter by Severity */}
            <select
              value={selectedSeverityFilter}
              onChange={(e) => setSelectedSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">{isId ? 'Semua Tingkat' : 'All Severities'}</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="INFO">INFO</option>
            </select>
          </div>

          {/* Quick Simulation Attack Bursts */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-zinc-400">{isId ? 'Simulasi Serangan:' : 'Simulate Probe:'}</span>
            <button
              onClick={() => triggerAttackBurst('bca')}
              className="px-2 py-1 rounded bg-blue-950/70 hover:bg-blue-900/80 text-blue-300 border border-blue-800/60 text-[11px] font-mono transition-colors cursor-pointer"
            >
              Promon SHIELD (BCA)
            </button>
            <button
              onClick={() => triggerAttackBurst('shopee')}
              className="px-2 py-1 rounded bg-orange-950/70 hover:bg-orange-900/80 text-orange-300 border border-orange-800/60 text-[11px] font-mono transition-colors cursor-pointer"
            >
              Shopee Socket Scan
            </button>
            <button
              onClick={() => triggerAttackBurst('play_integrity')}
              className="px-2 py-1 rounded bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 text-[11px] font-mono transition-colors cursor-pointer"
            >
              Play Integrity Token
            </button>
          </div>
        </div>

        {/* Live Terminal Output Feed */}
        <div 
          ref={terminalRef}
          className="flex-1 min-h-[380px] max-h-[500px] overflow-y-auto bg-zinc-950 p-3 sm:p-4 font-mono text-[11px] space-y-2 select-text"
        >
          {filteredEvents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-16 space-y-2">
              <Terminal className="w-8 h-8 stroke-1 text-zinc-600" />
              <p>{isId ? 'Belum ada log intersepsi yang sesuai filter...' : 'No intercepted syscall logs matching filters...'}</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="p-2 sm:p-2.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/60 hover:border-emerald-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-start sm:items-center gap-2 flex-wrap">
                  <span className="text-zinc-500 text-[10px]">{event.timestamp}</span>
                  {getSeverityBadge(event.severity)}
                  <span className="font-semibold text-zinc-200">{event.appName}</span>
                  <span className="text-emerald-400 font-bold">{event.syscallName}</span>
                  <span className="text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 text-[10px]">
                    {event.argument}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 text-[10px]">
                  {getActionBadge(event.actionTaken)}
                  <span className="text-zinc-500 italic max-w-[200px] truncate" title={event.raspMechanism}>
                    {event.raspMechanism}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer with Diagnostics & Export */}
        <div className="p-3 sm:p-4 border-t border-zinc-800 bg-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 font-mono text-zinc-400 text-[11px]">
            <span>{isId ? 'Total Intersepsi:' : 'Total Intercepts:'} <strong className="text-emerald-400">{events.length}</strong></span>
            <span>•</span>
            <span className="text-rose-400">Blocked: {events.filter(e => e.actionTaken === 'BLOCKED_ENOENT').length}</span>
            <span>•</span>
            <span className="text-blue-400">Shadow: {events.filter(e => e.actionTaken === 'SHADOW_REDIRECT').length}</span>
            <span>•</span>
            <span className="text-purple-400">solist: {events.filter(e => e.actionTaken === 'UNLINKED_SOLIST').length}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyLogs}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isId ? 'Disalin!' : 'Copied!') : (isId ? 'Salin Log' : 'Copy Logs')}</span>
            </button>
            <button
              onClick={handleDownloadLogFile}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isId ? 'Ekspor .log' : 'Export .log'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
