import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Mail,
  Youtube,
  FolderOpen,
  Sliders,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Share2,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { StoredGmailAccount, getStoredGmailAccount } from './GmailSignInModal';

interface ApplicationMenuProps {
  onOpenGmailSignIn: () => void;
  onOpenLibrary: (initialTab?: 'youtube' | 'tiktok' | 'instagram' | 'demos' | 'recent' | 'bookmarks') => void;
  onOpenSettings: () => void;
  onOpenEq: () => void;
  onOpenLocalFile: () => void;
  onOpenSystemAccess: () => void;
}

export const ApplicationMenu: React.FC<ApplicationMenuProps> = ({
  onOpenGmailSignIn,
  onOpenLibrary,
  onOpenSettings,
  onOpenEq,
  onOpenLocalFile,
  onOpenSystemAccess,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [account, setAccount] = useState<StoredGmailAccount | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

      {/* Glassmorphic Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-3xl bg-slate-950/98 border border-white/20 shadow-2xl backdrop-blur-xl p-3 z-50 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150">
          {/* Section 1: Google / Gmail Account Status */}
          <div
            onClick={() => {
              setIsOpen(false);
              onOpenGmailSignIn();
            }}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer group flex items-center justify-between"
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
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  </div>
                  <span className="text-[10px] text-slate-300 font-mono block truncate">
                    {account.email}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/15 border border-red-500/20 text-red-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Sign in with Gmail</span>
                  <span className="text-[10px] text-slate-300">Save accounts & streams</span>
                </div>
              </div>
            )}

            <span className="text-[10px] font-semibold text-cyan-300 group-hover:underline shrink-0">
              {account ? 'Manage' : 'Sign In'}
            </span>
          </div>

          <div className="h-px bg-white/10 my-0.5" />

          {/* Section 2: Web Streams */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2 py-0.5">
              Web Streams
            </span>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenLibrary('youtube');
              }}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90 hover:text-white transition-all text-left"
            >
              <Youtube className="w-3.5 h-3.5 text-rose-400" />
              <span>YouTube Web Stream</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenLibrary('tiktok');
              }}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90 hover:text-white transition-all text-left"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>TikTok Web Stream</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenLibrary('instagram');
              }}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90 hover:text-white transition-all text-left"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Instagram Web Stream</span>
            </button>
          </div>

          <div className="h-px bg-white/10 my-0.5" />

          {/* Section 3: Media & Library */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2 py-0.5">
              Media & Storage
            </span>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenLocalFile();
              }}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90 hover:text-white transition-all text-left"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Open Local Video / Audio</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenLibrary();
              }}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90 hover:text-white transition-all text-left"
            >
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Media Explorer & Streams</span>
            </button>
          </div>

          <div className="h-px bg-white/10 my-0.5" />

          {/* Section 4: Tools & System */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenEq();
              }}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90 hover:text-white transition-all text-left"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>3D Spatial Sound & EQ</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90 hover:text-white transition-all text-left"
            >
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Themes & Video Filters</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSystemAccess();
              }}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90 hover:text-white transition-all text-left"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>OS Permissions Access</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
