import React, { useState } from 'react';
import {
  ShieldCheck,
  FolderOpen,
  Camera,
  Radio,
  Zap,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { detectOperatingSystem, getOSPresetDirectories } from '../../utils/pathUtils';
import { usePlayerStore } from '../../store/playerStore';
import { PLAYER_THEMES } from '../../types/theme';

interface SystemAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemAccessModal: React.FC<SystemAccessModalProps> = ({ isOpen, onClose }) => {
  const themeId = usePlayerStore((s) => s.themeId);
  const currentTheme = PLAYER_THEMES[themeId] || PLAYER_THEMES.cyberpunk;
  const detectedOS = detectOperatingSystem();
  const osPresetDirs = getOSPresetDirectories(detectedOS);

  const [isGranted, setIsGranted] = useState(false);

  if (!isOpen) return null;

  const handleGrantAccess = () => {
    // 1. Record permission in local storage
    localStorage.setItem('miki_os_permissions_accepted', 'true');
    localStorage.setItem('miki_os_permissions_date', new Date().toISOString());

    // 2. Ping native Cocoa / WebKit host if running inside macOS app wrapper
    if (
      typeof window !== 'undefined' &&
      (window as unknown as { webkit?: { messageHandlers?: { requestSystemAccess?: { postMessage: (msg: string) => void } } } })
        .webkit?.messageHandlers?.requestSystemAccess
    ) {
      (window as unknown as { webkit: { messageHandlers: { requestSystemAccess: { postMessage: (msg: string) => void } } } })
        .webkit.messageHandlers.requestSystemAccess.postMessage('grant');
    }

    setIsGranted(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleDismiss = () => {
    localStorage.setItem('miki_os_permissions_accepted', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="glass-panel w-full max-w-xl p-6 sm:p-7 rounded-3xl flex flex-col gap-5 border border-white/20 shadow-2xl bg-slate-950/98 max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`p-3 rounded-2xl bg-gradient-to-r ${currentTheme.accentGradient} text-white shadow-lg`}
              style={{ boxShadow: `0 0 18px ${currentTheme.haloGlow}` }}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">System Permissions & Access</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {detectedOS}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Configure OS permissions for local file playback and media storage
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permissions List */}
        <div className="flex flex-col gap-3 overflow-y-auto pr-1">
          {/* Permission 1: Local Media */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5 hover:border-white/20 transition-all">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/20 text-cyan-300 shrink-0 mt-0.5">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-white">Local Files & Media Folders</h4>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Read Access
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Allows Miki Player to open video and audio files from your Movies, Downloads, and Documents library.
              </p>
            </div>
          </div>

          {/* Permission 2: Screenshots Directory */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5 hover:border-white/20 transition-all">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/20 text-amber-300 shrink-0 mt-0.5">
              <Camera className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-white">Screenshot Storage Location</h4>
                <span className="text-[10px] font-mono text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Write Access
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Saves lossless video snapshot captures to your pictures directory ({osPresetDirs[0]?.label}).
              </p>
            </div>
          </div>

          {/* Permission 3: Network Streaming */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5 hover:border-white/20 transition-all">
            <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-400/20 text-purple-300 shrink-0 mt-0.5">
              <Radio className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-white">Network Streaming & YouTube</h4>
                <span className="text-[10px] font-mono text-purple-300 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  Network Client
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Connects to remote CDNs to stream YouTube videos and high-bitrate adaptive HLS streams without interruptions.
              </p>
            </div>
          </div>

          {/* Permission 4: Hardware Acceleration */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5 hover:border-white/20 transition-all">
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/20 text-rose-300 shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-white">Hardware GPU & Audio Acceleration</h4>
                <span className="text-[10px] font-mono text-rose-300 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  GPU & DSP
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Leverages your system GPU for HDR tone-mapping and Web Audio API for 3D spatial acoustic virtualization.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button
            onClick={handleDismiss}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
          >
            Continue
          </button>

          <button
            onClick={handleGrantAccess}
            className={`px-5 py-2.5 rounded-2xl bg-gradient-to-r ${currentTheme.accentGradient} text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2`}
            style={{ boxShadow: `0 4px 18px ${currentTheme.haloGlow}` }}
          >
            {isGranted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Access Granted!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Allow Full Access</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
