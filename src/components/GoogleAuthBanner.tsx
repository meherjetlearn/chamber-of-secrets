import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Cloud, CheckCircle2, RefreshCw, LogOut, Sparkles, Shield, User as UserIcon } from 'lucide-react';
import { enchantedAudio } from '../utils/audio';

interface GoogleAuthBannerProps {
  currentUser: User | null;
  onLoginGoogle: () => Promise<void>;
  onLogout: () => Promise<void>;
  totalEntries: number;
  isSyncing: boolean;
  onManualSync: () => Promise<void>;
  syncMessage: string | null;
  onOpenDiagnostics: () => void;
}

export const GoogleAuthBanner: React.FC<GoogleAuthBannerProps> = ({
  currentUser,
  onLoginGoogle,
  onLogout,
  totalEntries,
  isSyncing,
  onManualSync,
  syncMessage,
  onOpenDiagnostics,
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoggingIn(true);
      enchantedAudio.playInkRevealChime();
      await onLoginGoogle();
    } catch (err) {
      console.error('Sign in error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    enchantedAudio.playPageTurn();
    await onLogout();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mb-3">
      {currentUser ? (
        /* CONNECTED TO FIRESTORE BANNER */
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-[#2ecc71]/40 bg-gradient-to-r from-[#0d2217] via-[#14281c] to-[#0d1d14] shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-[#d4f8e8]">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'Wizard'}
                className="w-10 h-10 rounded-full border-2 border-[#2ecc71]/60 shadow-[0_0_10px_rgba(46,204,113,0.3)] object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-[#2ecc71]/60 bg-[#163a25] flex items-center justify-center text-[#2ecc71]">
                <UserIcon className="w-5 h-5" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-xs sm:text-sm font-bold text-[#ffd700]">
                  {currentUser.displayName || 'Enchanted Seeker'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2ecc71]/20 text-[#2ecc71] font-semibold flex items-center gap-1 border border-[#2ecc71]/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Firestore Connected</span>
                </span>
              </div>
              <p className="font-parchment text-xs text-[#a0d6bc] mt-0.5">
                {currentUser.email} • {totalEntries} secrets preserved in your cloud grimoire
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                enchantedAudio.playQuillScratch();
                onOpenDiagnostics();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3e2b1d] bg-[#1a1122] hover:border-[#d4af37]/50 text-xs font-cinzel text-[#dcd1be] transition-all cursor-pointer"
              title="View Firestore connection diagnostics and rules check"
            >
              <span>Diagnostics</span>
            </button>

            <button
              onClick={() => {
                enchantedAudio.playQuillScratch();
                onManualSync();
              }}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2ecc71]/40 bg-[#173a25]/60 hover:bg-[#1f4a30] text-xs font-cinzel text-[#baf2d8] transition-all cursor-pointer disabled:opacity-50"
              title="Sync latest questions and answers with Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#2ecc71]' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Vault'}</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#5c1322]/50 bg-[#2b0d14]/70 hover:bg-[#3d121c] text-xs font-cinzel text-[#ff9999] transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      ) : (
        /* PROMINENT GOOGLE SIGN IN BANNER */
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border border-[#d4af37]/40 bg-gradient-to-r from-[#21141c] via-[#1a0f18] to-[#120912] shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-white p-2 shrink-0 shadow-md">
              {/* Official Google G Logo */}
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#ffd700] gold-glow">
                  Sign in with Google to Connect to Firestore
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#ffd700] hidden sm:inline-block">
                  Preserve & Restore
                </span>
              </div>
              <p className="font-parchment text-xs sm:text-sm text-[#cbb59a] mt-0.5 leading-relaxed">
                Connect your Google account to automatically restore all previous questions, secrets, and AI diary replies from Firestore across any device.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex items-center justify-end gap-2 shrink-0">
            <button
              onClick={() => {
                enchantedAudio.playQuillScratch();
                onOpenDiagnostics();
              }}
              className="px-3 py-2 rounded-xl font-cinzel text-xs text-[#baa78f] border border-[#3e2b1d] hover:border-[#d4af37]/50 transition-colors cursor-pointer"
              title="Test Firestore connection and view database status"
            >
              Diagnostics
            </button>

            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="flex items-center justify-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl font-cinzel text-xs sm:text-sm font-bold bg-white text-[#1f2937] hover:bg-[#f3f4f6] transition-all shadow-[0_4px_15px_rgba(255,215,0,0.25)] border border-[#ffd700]/50 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {/* Google G Icon */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Sync Status Toast/Notice */}
      {syncMessage && (
        <div className="mt-2 p-2 rounded-lg bg-[#14281c] border border-[#2ecc71]/40 text-[#a8e6cf] text-xs font-parchment flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-[#2ecc71] shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}
    </div>
  );
};
