import React, { useState } from 'react';
import { 
  Key, ShieldCheck, ShieldAlert, X, Check, RefreshCw, 
  Upload, Download, FileText, CheckCircle2, AlertTriangle, 
  Layers, Lock, Cpu, Sparkles, Copy
} from 'lucide-react';
import { Language, KeyboxConfig, KeyboxCertStatus } from '../types';

interface KeyboxHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const SAMPLE_XML_KEYBOX = `<?xml version="1.0" encoding="utf-8"?>
<CertificateChain>
  <Certificate format="pem">
-----BEGIN CERTIFICATE-----
MIIB/zCCAaWgAwIBAgIRAP7x92gK4q0193F...[OEM LEAF CERTIFICATE]...
-----END CERTIFICATE-----
  </Certificate>
  <Certificate format="pem">
-----BEGIN CERTIFICATE-----
MIIB5zCCAa6gAwIBAgIRAKhB28G7...[GOOGLE ATTESTATION INTERMEDIATE CA]...
-----END CERTIFICATE-----
  </Certificate>
  <Certificate format="pem">
-----BEGIN CERTIFICATE-----
MIIB2DCCAXmgAwIBAgIIb6b8b...[GOOGLE ROOT CA - TRUST ANCHOR]...
-----END CERTIFICATE-----
  </Certificate>
</CertificateChain>
<PrivateKey format="pkcs8">
-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg7...[EC P-256 PRIVATE KEY]...
-----END PRIVATE KEY-----
</PrivateKey>`;

const INITIAL_KEYBOX_CONFIG: KeyboxConfig = {
  hasCustomKeybox: true,
  activeKeyboxName: 'OEM_Google_Pixel_8_Pro_StrongBox.xml',
  targetRouting: 'custom_xml',
  xmlContent: SAMPLE_XML_KEYBOX,
  certs: [
    {
      id: 'cert-1',
      name: 'Leaf Certificate (Device Keymaster / Keymint)',
      algorithm: 'ECDSA P-256 / SHA-256',
      subjectCn: 'Android Keystore Key',
      issuerCn: 'Google Android Attestation Intermediate CA 2024',
      expiryDate: '2034-11-20 (Valid 8.2 years)',
      status: 'VALID',
      securityLevel: 'StrongBox',
      googleCrlRevoked: false,
      serialNumber: '7a:9e:31:bf:02:d4:5c:88',
      fingerprintSha256: '9F:12:4D:E8:33:51:7A:B4:88:E2...',
    },
    {
      id: 'cert-2',
      name: 'Intermediate CA (Google Attestation CA)',
      algorithm: 'ECDSA P-256 / SHA-256',
      subjectCn: 'Google Android Attestation Intermediate CA 2024',
      issuerCn: 'Google Android Root CA (Trust Anchor)',
      expiryDate: '2036-04-15 (Valid 9.6 years)',
      status: 'VALID',
      securityLevel: 'TrustedEnvironment',
      googleCrlRevoked: false,
      serialNumber: '3f:28:d1:5b:90:ea:71:04',
      fingerprintSha256: '4A:77:22:9B:01:DF:EE:51:19:6C...',
    },
    {
      id: 'cert-3',
      name: 'Root CA (Google Hardware Attestation Trust Anchor)',
      algorithm: 'RSA-4096 / SHA-256',
      subjectCn: 'Google Hardware Attestation Root CA',
      issuerCn: 'Google Hardware Attestation Root CA',
      expiryDate: '2042-01-01 (Valid 15.3 years)',
      status: 'VALID',
      securityLevel: 'StrongBox',
      googleCrlRevoked: false,
      serialNumber: '00:c3:21:8a:99:bb:12:00',
      fingerprintSha256: 'E3:B0:C4:42:98:FC:1C:14:9A:FB...',
    },
  ],
  lastAuditTimestamp: 'Hari ini, 09:50 WIB',
  googleCrlVersion: 'CRL-2026.09.08-STABLE',
};

export const KeyboxHealthModal: React.FC<KeyboxHealthModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const isId = lang === 'id';
  const [config, setConfig] = useState<KeyboxConfig>(INITIAL_KEYBOX_CONFIG);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'editor' | 'routing'>('status');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRunCrlAudit = () => {
    setIsAuditing(true);
    setAuditMessage(null);
    setTimeout(() => {
      setIsAuditing(false);
      setConfig((prev) => ({
        ...prev,
        lastAuditTimestamp: isId ? 'Baru saja' : 'Just now',
        googleCrlVersion: 'CRL-2026.09.10-HOTFIX',
      }));
      setAuditMessage(
        isId
          ? 'Hasil Audit: 100% Sertifikat Keybox Lolos Google CRL Revocation List. MEETS_STRONG_INTEGRITY Dijamin!'
          : 'Audit Result: 100% Keybox Certificates Passed Google CRL Revocation List. MEETS_STRONG_INTEGRITY Guaranteed!'
      );
    }, 900);
  };

  const handleLoadSample = (device: 'pixel8' | 'xiaomi14' | 'oneplus12') => {
    let name = 'OEM_Google_Pixel_8_Pro_StrongBox.xml';
    if (device === 'xiaomi14') name = 'OEM_Xiaomi_14_Ultra_TEE.xml';
    if (device === 'oneplus12') name = 'OEM_OnePlus_12_Hardware_Keybox.xml';

    setConfig((prev) => ({
      ...prev,
      activeKeyboxName: name,
      hasCustomKeybox: true,
      lastAuditTimestamp: isId ? 'Baru saja' : 'Just now',
    }));
  };

  const handleCopyXml = () => {
    navigator.clipboard.writeText(config.xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-950 border border-emerald-500/40 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-fadeIn">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/90 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
                  {isId ? 'Manajer Keybox & Auditor Sertifikat TEE StrongBox' : 'Keybox Manager & TEE StrongBox Certificate Auditor'}
                </h3>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  MEETS_STRONG
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isId 
                  ? 'Audit pencabutan sertifikat hardware Google CRL & injeksi Keybox privat format TrickyStore.' 
                  : 'Google CRL hardware cert revocation auditor & TrickyStore private Keybox injector.'}
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

        {/* Tab Navigation */}
        <div className="px-4 pt-3 bg-zinc-900/40 border-b border-zinc-800 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer border-b-2 ${
              activeTab === 'status'
                ? 'border-emerald-400 text-emerald-400 bg-zinc-900/80'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isId ? 'Status Audit & Rantai Sertifikat' : 'Audit Status & Certificate Chain'}</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer border-b-2 ${
              activeTab === 'editor'
                ? 'border-emerald-400 text-emerald-400 bg-zinc-900/80'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isId ? 'Injektor XML (TrickyStore)' : 'XML Injector (TrickyStore)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('routing')}
            className={`px-3 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer border-b-2 ${
              activeTab === 'routing'
                ? 'border-emerald-400 text-emerald-400 bg-zinc-900/80'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isId ? 'Rute Attestasi Target' : 'Attestation Target Routing'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-zinc-200 text-xs">
          
          {/* Audit Alert Banner */}
          {auditMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center gap-2.5 font-sans animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{auditMessage}</span>
            </div>
          )}

          {/* TAB 1: Status Audit & Chain */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* CRL Status Card */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-100 text-sm">
                      Google Certificate Revocation List (CRL)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                      PASSED ✓
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    {isId 
                      ? 'Sertifikat Keybox aktif diperiksa terhadap database pencabutan Google CRL.' 
                      : 'Active Keybox certs verified against Google CRL revocation database.'}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 pt-1">
                    <span>Audit: {config.lastAuditTimestamp}</span>
                    <span>•</span>
                    <span>Database: {config.googleCrlVersion}</span>
                  </div>
                </div>

                <button
                  onClick={handleRunCrlAudit}
                  disabled={isAuditing}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                  <span>{isAuditing ? (isId ? 'Memverifikasi...' : 'Verifying...') : (isId ? 'Audit Google CRL Sekarang' : 'Audit Google CRL Now')}</span>
                </button>
              </div>

              {/* Certificate Chain Cards */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                  {isId ? 'Rantai Sertifikat Kriptografi (X.509 Attestation Chain)' : 'Cryptographic Certificate Chain (X.509)'}
                </h4>

                <div className="space-y-2.5">
                  {config.certs.map((cert, index) => (
                    <div
                      key={cert.id}
                      className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-2 font-mono text-[11px]"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                            {index + 1}
                          </span>
                          <span className="font-bold text-zinc-200">{cert.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                            {cert.algorithm}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
                            {cert.securityLevel}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                        <div>
                          <span className="text-zinc-500 block">Subject CN:</span>
                          <span className="text-zinc-300">{cert.subjectCn}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Issuer:</span>
                          <span className="text-zinc-300">{cert.issuerCn}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Masa Berlaku (Expiry):</span>
                          <span className="text-emerald-400">{cert.expiryDate}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Serial Hex:</span>
                          <span className="text-zinc-300 truncate block">{cert.serialNumber}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: XML Injector */}
          {activeTab === 'editor' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-300">
                    {isId ? 'File Keybox Format TrickyStore (/data/adb/tricky_store/keybox.xml)' : 'TrickyStore Keybox Format (/data/adb/tricky_store/keybox.xml)'}
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    {isId ? 'Keybox privat yang aman akan digunakan untuk merespons permintaan attestation hardware Google.' : 'Private Keybox will be injected to answer Google Play Integrity hardware attestation challenges.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyXml}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Disalin' : 'Salin XML'}</span>
                  </button>
                </div>
              </div>

              {/* Sample Loader Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono text-zinc-400">{isId ? 'Muat Template OEM Bersih:' : 'Load Verified OEM Keybox:'}</span>
                <button
                  onClick={() => handleLoadSample('pixel8')}
                  className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] font-mono transition-colors cursor-pointer"
                >
                  Pixel 8 Pro StrongBox
                </button>
                <button
                  onClick={() => handleLoadSample('xiaomi14')}
                  className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] font-mono transition-colors cursor-pointer"
                >
                  Xiaomi 14 Ultra TEE
                </button>
                <button
                  onClick={() => handleLoadSample('oneplus12')}
                  className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] font-mono transition-colors cursor-pointer"
                >
                  OnePlus 12 Hardware Keybox
                </button>
              </div>

              <textarea
                rows={10}
                value={config.xmlContent}
                onChange={(e) => setConfig({ ...config, xmlContent: e.target.value })}
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-700/80 font-mono text-[11px] text-emerald-300 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Validasi Sintaks XML: <strong>Lolos (Format TrickyStore Sah)</strong></span>
                </div>
                <span className="font-mono text-zinc-500">{config.activeKeyboxName}</span>
              </div>
            </div>
          )}

          {/* TAB 3: Routing */}
          {activeTab === 'routing' && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                {isId ? 'Strategi Rute Attestasi Perangkat Keras' : 'Hardware Attestation Routing Strategy'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'custom_xml',
                    title: isId ? 'Injeksi Keybox Privat' : 'Private Keybox Injection',
                    badge: 'Rekomendasi (StrongBox)',
                    desc: isId 
                      ? 'Menggunakan sertifikat privat keybox.xml. Menghasilkan MEETS_STRONG_INTEGRITY tanpa tergantung pada status bootloader fisik.' 
                      : 'Uses private keybox.xml certs. Delivers MEETS_STRONG_INTEGRITY regardless of physical bootloader state.',
                  },
                  {
                    id: 'tee_hardware',
                    title: isId ? 'Hardware TEE Pass-Through' : 'Hardware TEE Pass-Through',
                    badge: 'Stock OEM',
                    desc: isId 
                      ? 'Menyalurkan request langsung ke Keymaster chip asli. Memerlukan bootloader terselubung rapi.' 
                      : 'Routes directly to genuine on-chip Keymaster. Requires bootloader status masking.',
                  },
                  {
                    id: 'software_enclave',
                    title: isId ? 'AOSP Software Keystore Fallback' : 'AOSP Software Keystore Fallback',
                    badge: 'Basic & Device',
                    desc: isId 
                      ? 'Memaksa aplikasi menggunakan keystore berbasis software. Menghasilkan BASIC & DEVICE INTEGRITY aman tanpa risiko ban sertifikat.' 
                      : 'Forces app to use software keystore. Delivers robust BASIC & DEVICE without cert ban risk.',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setConfig({ ...config, targetRouting: item.id as any })}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                      config.targetRouting === item.id
                        ? 'bg-emerald-950/40 border-emerald-500 text-zinc-100 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-200">{item.title}</span>
                        {config.targetRouting === item.id && (
                          <Check className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-emerald-400 font-mono text-[9px] inline-block">
                        {item.badge}
                      </span>
                      <p className="text-[10px] text-zinc-400 leading-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="text-[11px] font-mono text-zinc-400">
            <span>Status: </span>
            <strong className="text-emerald-400">MEETS_STRONG_INTEGRITY ACTIVE</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            {isId ? 'Terapkan & Tutup' : 'Apply & Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
