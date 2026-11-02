import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Mail,
  FolderOpen,
  Sliders,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Share2,
  CheckCircle2,
  Plus,
  Globe,
  Film,
} from 'lucide-react';
import { StoredGmailAccount, getStoredGmailAccount } from './GmailSignInModal';

interface ApplicationMenuProps {
  onOpenGmailSignIn: () => void;
  onOpenLibrary: (initialTab?: 'youtube' | 'tiktok' | 'instagram' | 'demos' | 'recent' | 'bookmarks' | 'cinema' | 'social' | 'games' | 'music') => void;
  onOpenWebBrowser?: (url?: string) => void;
  onOpenSettings: () => void;
  onOpenEq: () => void;
  onOpenLocalFile: () => void;
  onOpenSystemAccess: () => void;
  onOpenGames?: () => void;
  onOpenMusic?: () => void;
}

export const ApplicationMenu: React.FC<ApplicationMenuProps> = ({
  onOpenGmailSignIn,
  onOpenLibrary,
  onOpenWebBrowser,
  onOpenSettings,
  onOpenEq,
  onOpenLocalFile,
  onOpenSystemAccess,
  onOpenGames,
  onOpenMusic,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [account, setAccount] = useState<StoredGmailAccount | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Synchronize native browser web view overlay visibility so menu always appears on top
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).webkit?.messageHandlers?.browserViewAction) {
      try {
        (window as any).webkit.messageHandlers.browserViewAction.postMessage({
          action: 'setOverlayVisible',
          visible: isOpen,
        });
      } catch (err) {
        // Fallback gracefully in web/mock modes
      }
    }
  }, [isOpen]);

  // Listen for account updates
  useEffect(() => {
    setAccount(getStoredGmailAccount());

    const handleAccountChange = (e: Event) => {
      const detail = (e as CustomEvent<StoredGmailAccount | null>).detail;
      setAccount(detail ?? null);
    };

    window.addEventListener('miki:gmailAccountChanged', handleAccountChange);
    return () => window.removeEventListener('miki:gmailAccountChanged', handleAccountChange);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div className="relative inline-block select-none" ref={menuRef}>
      {/* Menu Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white/90 hover:text-white transition-all active:scale-95 shadow-sm group"
        title="Application Menu"
      >
        <Menu className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-90 transition-transform" />
        <span className="hidden sm:inline">Menu</span>
        {account && (
          <span className="w-2 h-2 rounded-full bg-emerald-400 border border-black shadow-[0_0_8px_#34d399]" />
        )}
        <ChevronDown className="w-3 h-3 text-white/50 group-hover:text-white transition-colors" />
      </button>

      {/* Solid High-Contrast Dropdown Panel with Dimming Backdrop Scrim */}
      {isOpen && (
        <>
          {/* Backdrop Scrim - Dims background cards and captures outside clicks to prevent text overlap */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-150"
            onClick={() => setIsOpen(false)}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          />

          {/* Solid High-Contrast Dropdown Panel */}
          <div
            className="absolute left-0 mt-2.5 w-72 sm:w-80 rounded-3xl border border-slate-700/80 p-3.5 z-50 flex flex-col gap-2.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 select-none"
            style={{
              backgroundColor: '#0a0e1a',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.98), 0 0 25px rgba(255, 255, 255, 0.08)',
              WebkitAppRegion: 'no-drag',
            } as React.CSSProperties}
          >
          {/* Section 1: Google / Gmail Account Status */}
          <div
            onClick={() => {
              setIsOpen(false);
              onOpenGmailSignIn();
            }}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all cursor-pointer group flex items-center justify-between shadow-sm"
          >
            {account ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-500 via-amber-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                  {account.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">
                      {account.displayName}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <span className="text-[10px] text-slate-300 font-mono block truncate">
                    {account.email}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Sign in with Gmail</span>
                  <span className="text-[10px] text-slate-300">Save accounts & streams</span>
                </div>
              </div>
            )}

            <span className="text-[10px] font-bold text-cyan-300 group-hover:underline shrink-0 bg-white/10 px-2 py-1 rounded-lg">
              {account ? 'Manage' : 'Sign In'}
            </span>
          </div>

          <div className="h-px bg-white/15 my-0.5" />

          {/* Section 2: Streams */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-300 font-bold px-2 py-0.5">
              Streams
            </span>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenLibrary('cinema');
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-xs font-medium text-white transition-all text-left"
            >
              <Film className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Cinema</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenLibrary('social');
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-xs font-medium text-white transition-all text-left"
            >
              <Share2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Social</span>
            </button>
          </div>

          <div className="h-px bg-white/15 my-0.5" />

          {/* Section 3: Media */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-300 font-bold px-2 py-0.5">
              Media
            </span>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenLocalFile();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-xs font-medium text-white transition-all text-left"
            >
              <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Open Local</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenLibrary();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-xs font-medium text-white transition-all text-left"
            >
              <FolderOpen className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Library</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenMusic) {
                  onOpenMusic();
                } else {
                  onOpenLibrary('music');
                }
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-xs font-medium text-white transition-all text-left"
            >
              <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Music Player</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenGames) {
                  onOpenGames();
                } else {
                  onOpenLibrary('games');
                }
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-xs font-medium text-white transition-all text-left"
            >
              <Sliders className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Games</span>
            </button>
          </div>

          <div className="h-px bg-white/15 my-0.5" />

          {/* Section 4: System */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-300 font-bold px-2 py-0.5">
              System
            </span>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenEq();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-xs font-medium text-white transition-all text-left"
            >
              <Sliders className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Equalizer</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-xs font-medium text-white transition-all text-left"
            >
              <Sparkles className="w-4 h-4 text-fuchsia-400 shrink-0" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSystemAccess();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-xs font-medium text-white transition-all text-left"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Permissions</span>
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
};
