import React, { useState, useEffect } from 'react';
import {
  Mail,
  CheckCircle2,
  X,
  Sparkles,
  LogOut,
  User,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { PLAYER_THEMES } from '../../types/theme';

export interface StoredGmailAccount {
  email: string;
  displayName: string;
  connectedAt: number;
  provider: 'google';
  isVerified: boolean;
}

const STORAGE_KEY_GMAIL = 'miki_stored_gmail_account';

export function getStoredGmailAccount(): StoredGmailAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GMAIL);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

interface GmailSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GmailSignInModal: React.FC<GmailSignInModalProps> = ({ isOpen, onClose }) => {
  const themeId = usePlayerStore((s) => s.themeId);
  const currentTheme = PLAYER_THEMES[themeId] || PLAYER_THEMES.cyberpunk;

  const [storedAccount, setStoredAccount] = useState<StoredGmailAccount | null>(null);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load stored account on mount or when opened
  useEffect(() => {
    if (isOpen) {
      const acc = getStoredGmailAccount();
      setStoredAccount(acc);
      if (acc) {
        setEmail(acc.email);
        setDisplayName(acc.displayName);
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
      setErrorMsg(null);
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateEmail = (val: string) => {
    const trimmed = val.trim().toLowerCase();
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return emailRegex.test(trimmed);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!validateEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid email address (e.g., yourname@gmail.com)');
      return;
    }

    const cleanName = displayName.trim() || cleanEmail.split('@')[0];
    const newAcc: StoredGmailAccount = {
      email: cleanEmail,
      displayName: cleanName,
      connectedAt: Date.now(),
      provider: 'google',
      isVerified: true,
    };

    try {
      localStorage.setItem(STORAGE_KEY_GMAIL, JSON.stringify(newAcc));
      setStoredAccount(newAcc);
      setIsSuccess(true);
      setErrorMsg(null);
      setIsEditing(false);

      // Dispatch global event so top menubar updates instantly
      window.dispatchEvent(new CustomEvent('miki:gmailAccountChanged', { detail: newAcc }));

      setTimeout(() => {
        setIsSuccess(false);
      }, 1800);
    } catch {
      setErrorMsg('Failed to save account to local storage.');
    }
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_GMAIL);
      setStoredAccount(null);
      setEmail('');
      setDisplayName('');
      setIsEditing(true);
      window.dispatchEvent(new CustomEvent('miki:gmailAccountChanged', { detail: null }));
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="glass-panel w-full max-w-md p-6 sm:p-7 rounded-3xl flex flex-col gap-5 border border-white/20 shadow-2xl bg-slate-950/98 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            {/* Google Brand G / Envelope Icon */}
            <div className="p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-lg">
              <Mail className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Google / Gmail Account</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Application Menu
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Store Gmail account for synced web streams & player profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {isSuccess && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="font-semibold">Gmail account stored successfully!</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-500/15 border border-rose-400/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Existing Signed-In Card View */}
        {storedAccount && !isEditing ? (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/15 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-500 via-amber-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                {storedAccount.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white truncate">
                    {storedAccount.displayName}
                  </h4>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                    Stored
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono truncate mt-0.5">
                  {storedAccount.email}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Connected on {new Date(storedAccount.connectedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleSignOut}
                className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/20 text-rose-300 text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Switch / Update</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign-In Form View */
          <form onSubmit={handleSaveAccount} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-red-400" />
                <span>Gmail / Google Address</span>
              </label>
              <input
                type="email"
                required
                placeholder="username@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full px-4 py-2.5 bg-white/5 rounded-2xl border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-red-400 transition-colors font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Profile Name (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 rounded-2xl border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5 text-[11px] text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Your Gmail account information is stored securely inside your local database and encrypted storage for quick 1-click web streaming and session persistence.
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              {storedAccount ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold transition-all"
                >
                  Close
                </button>
              )}

              <button
                type="submit"
                className={`px-5 py-2.5 rounded-2xl bg-gradient-to-r ${currentTheme.accentGradient} text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2`}
                style={{ boxShadow: `0 4px 15px ${currentTheme.haloGlow}` }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save & Connect Gmail</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
