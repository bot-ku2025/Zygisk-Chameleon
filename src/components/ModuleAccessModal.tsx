import React, { useState } from 'react';
import { 
  X, Terminal, FileCode, Sliders, CheckCircle2, AlertTriangle, 
  Play, Save, Check, RefreshCw, Folder, Cpu, Shield, ShieldCheck, 
  Lock, Copy
} from 'lucide-react';
import { RootModule, Language } from '../types';
import { translations } from '../locales/dictionary';

interface ModuleAccessModalProps {
  module: RootModule;
  lang: Language;
  onClose: () => void;
  onToggleEnable: (id: string) => void;
  onUpdateFile: (moduleId: string, filename: string, newContent: string) => void;
}

export const ModuleAccessModal: React.FC<ModuleAccessModalProps> = ({
  module,
  lang,
  onClose,
  onToggleEnable,
  onUpdateFile,
}) => {
  const t = translations[lang];
  const isId = lang === 'id';
  const [activeTab, setActiveTab] = useState<'console' | 'files' | 'action'>('console');
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0);
  const [fileContent, setFileContent] = useState<string>(
    module.configFiles[0]?.content || ''
  );
  const [isSaved, setIsSaved] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [isRunningAction, setIsRunningAction] = useState(false);
  const [busyboxCmd, setBusyboxCmd] = useState('busybox uname -a');
  const [busyboxOutput, setBusyboxOutput] = useState(
    'Linux localhost 5.15.131-android14-11-g8d1a6c0 #1 SMP PREEMPT aarch64 GNU/Linux'
  );

  // When selected file changes
  const handleSelectFile = (idx: number) => {
    setSelectedFileIdx(idx);
    setFileContent(module.configFiles[idx]?.content || '');
    setIsSaved(false);
  };

  const handleSaveFile = () => {
    const currentFile = module.configFiles[selectedFileIdx];
    if (currentFile) {
      onUpdateFile(module.id, currentFile.filename, fileContent);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleRunAction = () => {
    setIsRunningAction(true);
    setActionLog([
      isId ? `[SU] Mengakses biner su di /data/adb/ksu/bin/su...` : `[SU] Accessing su binary at /data/adb/ksu/bin/su...`,
      isId ? `[RUN] Menjalankan: sh ${module.path}/action.sh` : `[RUN] Executing: sh ${module.path}/action.sh`,
    ]);

    setTimeout(() => {
      setActionLog((prev) => [
        ...prev,
        isId ? `[*] Inisialisasi hook ${module.name} (${module.version})...` : `[*] Initializing hook ${module.name} (${module.version})...`,
        isId ? `[*] Membaca parameter konfigurasi runtime...` : `[*] Reading runtime configuration parameters...`,
        isId ? `[OK] Modul berhasil disinkronisasi dengan Zygote daemon.` : `[OK] Module successfully synchronized with Zygote daemon.`,
        isId ? `[SUCCESS] Selesai dengan kode status: 0 (Exit Success).` : `[SUCCESS] Finished with status code: 0 (Exit Success).`,
      ]);
      setIsRunningAction(false);
    }, 900);
  };

  const handleRunBusybox = () => {
    if (busyboxCmd.includes('df')) {
      setBusyboxOutput(
        `Filesystem           1K-blocks      Used Available Use% Mounted on\n/dev/block/dm-0       11624000   8400120   3223880  72% /\n/data/adb/modules      5490000   1200400   4289600  22% /data/adb/modules`
      );
    } else if (busyboxCmd.includes('free')) {
      setBusyboxOutput(
        `              total        used        free      shared     buffers\nMem:        7984024     4510200     3473824       32400      124000\n-/+ buffers/cache:     4386200     3597824\nSwap:       3145724      120400     3025324`
      );
    } else {
      setBusyboxOutput(
        `Linux localhost 5.15.131-android14-11-g8d1a6c0 #1 SMP PREEMPT Wed May 8 04:22:10 UTC 2024 aarch64 Android`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-950 border border-emerald-900/40 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-zinc-100">{module.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 font-mono text-emerald-400 border border-zinc-700">
                  {module.version}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {isId ? 'oleh' : 'by'} <strong className="text-zinc-200">{module.author}</strong>
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-0.5 truncate max-w-lg">
                Path: <span className="text-zinc-300">{module.path}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleEnable(module.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                module.enabled
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${module.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
              {module.enabled ? (isId ? 'Aktif (UID 0)' : 'Active (UID 0)') : (isId ? 'Nonaktif' : 'Disabled')}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/30 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('console')}
            className={`py-3 px-4 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'console'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{isId ? 'Kontrol & Konfigurasi' : 'Control & Configuration'}</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`py-3 px-4 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'files'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>{isId ? 'Penjelajah File' : 'File Explorer'} ({module.configFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('action')}
            className={`py-3 px-4 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'action'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>{isId ? 'Terminal Tindakan' : 'Action Terminal'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: CONSOLE / SPECIALIZED MODULE ACCESS */}
          {activeTab === 'console' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  {isId ? 'Deskripsi Modul' : 'Module Description'}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{module.description}</p>
              </div>

              {/* Module-Specific GUI Panels */}
              {module.id === 'playintegrityfix' && (
                <div className="space-y-3 p-4 rounded-xl bg-zinc-900/70 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-zinc-200">
                        {isId ? 'Status Pemalsuan Putusan Play Integrity' : 'Play Integrity Verdict Spoofing Status'}
                      </span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      MEETS_DEVICE_INTEGRITY: PASS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">CURRENT FINGERPRINT</span>
                      <span className="text-zinc-200 text-[11px] break-all">
                        google/husky:14/UD1A.230803.041
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">SECURITY PATCH</span>
                      <span className="text-emerald-400 text-[11px]">2024-05-05 (Certified)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        alert(isId ? 'Integritas hardware berhasil diverifikasi: MEETS_DEVICE_INTEGRITY!' : 'Hardware integrity successfully verified: MEETS_DEVICE_INTEGRITY!');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isId ? 'Tes Integrity (CTS API)' : 'Test Integrity (CTS API)'}
                    </button>
                    <button
                      onClick={() => {
                        alert(isId ? 'Fingerprint PIF berhasil diperbarui dari repository PIF-Fork!' : 'PIF Fingerprint successfully updated from PIF-Fork repository!');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                      {isId ? 'Perbarui Fingerprint PIF' : 'Update PIF Fingerprint'}
                    </button>
                  </div>
                </div>
              )}

              {module.id === 'tricky_store' && (
                <div className="space-y-3 p-4 rounded-xl bg-zinc-900/70 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-zinc-200">
                        TEE / StrongBox Hardware Keystore Interceptor
                      </span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Keybox: Valid Chain
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {isId
                      ? 'TrickyStore memalsukan respon validasi sertifikat hardware Android Keystore sehingga aplikasi perbankan menganggap bootloader terkunci pabrik.'
                      : 'TrickyStore mocks Android Keystore hardware certificate validation responses so banking apps consider the bootloader factory-locked.'}
                  </p>
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono">
                    <span className="text-zinc-500 block text-[10px]">{isId ? 'APLIKASI DALAM TARGET.TXT:' : 'APPS IN TARGET.TXT:'}</span>
                    <span className="text-zinc-300 text-[11px]">
                      com.google.android.gms, com.bca, id.dana, com.shopee.id, com.tokopedia.tkpd
                    </span>
                  </div>
                </div>
              )}

              {module.id === 'zygisk-next' && (
                <div className="space-y-3 p-4 rounded-xl bg-zinc-900/70 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-zinc-200">
                        {isId ? 'Status Daemon Zygisk Next' : 'Zygisk Next Daemon Status'}
                      </span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Engine: Running
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">ZYGOTE 64-BIT</span>
                      <span className="text-emerald-400 font-bold">Hooked (PID 591)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">ZYGOTE 32-BIT</span>
                      <span className="text-emerald-400 font-bold">Hooked (PID 592)</span>
                    </div>
                  </div>
                </div>
              )}

              {module.id === 'busybox-ndk' && (
                <div className="space-y-3 p-4 rounded-xl bg-zinc-900/70 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200">
                      {isId ? 'BusyBox Applets Interactive Test Runner' : 'BusyBox Applets Interactive Test Runner'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      367 {isId ? 'Applets Tersedia' : 'Applets Available'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={busyboxCmd}
                      onChange={(e) => setBusyboxCmd(e.target.value)}
                      placeholder={isId ? 'Contoh: busybox df -h atau busybox free' : 'Example: busybox df -h or busybox free'}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleRunBusybox}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-semibold cursor-pointer"
                    >
                      {isId ? 'Jalankan' : 'Run'}
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                    {busyboxOutput}
                  </pre>
                </div>
              )}

              {module.id === 'zygisk_chameleon' && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 space-y-2">
                  <h5 className="text-xs font-bold text-emerald-400">
                    {isId ? 'Modul Zygisk Chameleon Aktif & Terhubung' : 'Zygisk Chameleon Module Active & Connected'}
                  </h5>
                  <p className="text-xs text-zinc-300">
                    {isId
                      ? "Modul ini adalah engine utama WebUI yang sedang Anda buka. Perubahan pada tab 'Daftar Aplikasi' akan otomatis disuntikkan ke modul ini via IPC tanpa perlu reboot perangkat."
                      : "This module is the core engine of this WebUI. Changes made in the 'App List' tab are automatically injected via IPC without requiring a device reboot."}
                  </p>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: FILE EXPLORER & CONFIG EDITOR */}
          {activeTab === 'files' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {module.configFiles.map((file, idx) => (
                  <button
                    key={file.filename}
                    onClick={() => handleSelectFile(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors whitespace-nowrap border cursor-pointer ${
                      selectedFileIdx === idx
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>{file.filename}</span>
                  </button>
                ))}
              </div>

              {module.configFiles[selectedFileIdx] && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span className="truncate max-w-md">
                      {module.configFiles[selectedFileIdx].path}
                    </span>
                    <button
                      onClick={handleSaveFile}
                      className={`px-3 py-1 rounded-lg font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-emerald-500 text-zinc-950'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{isId ? 'Tersimpan!' : 'Saved!'}</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>{isId ? 'Simpan File' : 'Save File'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    rows={12}
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500 selection:bg-emerald-500/30 resize-y"
                    spellCheck={false}
                  />
                  <p className="text-[11px] text-zinc-500 font-mono">
                    * {module.configFiles[selectedFileIdx].description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TERMINAL ACTION RUNNER */}
          {activeTab === 'action' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">
                    {isId ? 'Eksekusi Script Tindakan Modul (action.sh)' : 'Execute Module Action Script (action.sh)'}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {isId 
                      ? 'Menjalankan skrip tindakan modul dengan wewenang SuperUser (UID 0 / root).' 
                      : 'Runs module action script with SuperUser privileges (UID 0 / root).'}
                  </p>
                </div>
                <button
                  disabled={isRunningAction}
                  onClick={handleRunAction}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold text-xs flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isRunningAction ? (isId ? 'Mengeksekusi...' : 'Executing...') : (isId ? 'Jalankan action.sh' : 'Run action.sh')}</span>
                </button>
              </div>

              {/* Console Output Window */}
              <div className="p-4 rounded-xl bg-black border border-zinc-800 font-mono text-xs space-y-1.5 min-h-[160px] max-h-[260px] overflow-y-auto">
                <div className="text-zinc-500 text-[11px] border-b border-zinc-900 pb-1 flex items-center justify-between">
                  <span>ROOT TERMINAL SESSION</span>
                  <span>/data/adb/ksu/bin/su</span>
                </div>
                {actionLog.length === 0 ? (
                  <p className="text-zinc-600 italic py-4">
                    {isId 
                      ? 'Belum ada tindakan dijalankan. Klik "Jalankan action.sh" untuk memulai proses.' 
                      : 'No action has been executed yet. Click "Run action.sh" to start the process.'}
                  </p>
                ) : (
                  actionLog.map((line, idx) => (
                    <div
                      key={idx}
                      className={`${
                        line.includes('[SUCCESS]') || line.includes('[OK]')
                          ? 'text-emerald-400 font-semibold'
                          : line.includes('[RUN]') || line.includes('[SU]')
                          ? 'text-amber-300'
                          : 'text-zinc-300'
                      }`}
                    >
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex justify-between items-center">
          <span className="text-[11px] font-mono text-zinc-500">
            {isId ? 'Modul ID:' : 'Module ID:'} <strong className="text-zinc-400">{module.id}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
          >
            {isId ? 'Tutup' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
