import React from 'react';
import {
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  BookOpen,
  Feather,
  Sparkles,
  HelpCircle,
  Cloud,
  LogOut,
  UserCheck,
  Shield,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { getMoonPhase, getHogwartsHour } from '../utils/date';
import { enchantedAudio } from '../utils/audio';

interface ChamberHeaderProps {
  activeTab: 'inscribe' | 'archives' | 'lore';
  setActiveTab: (tab: 'inscribe' | 'archives' | 'lore') => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  isPrivacyMode: boolean;
  onTogglePrivacy: () => void;
  totalEntriesCount: number;
  onOpenLore: () => void;
  currentUser: User | null;
  onLoginGoogle: () => void;
  onLoginGuest: () => void;
  onLogout: () => void;
  isCloudSyncing: boolean;
}

export const ChamberHeader: React.FC<ChamberHeaderProps> = ({
  activeTab,
  setActiveTab,
  isAudioMuted,
  onToggleAudio,
  isPrivacyMode,
  onTogglePrivacy,
  totalEntriesCount,
  onOpenLore,
  currentUser,
  onLoginGoogle,
  onLoginGuest,
  onLogout,
  isCloudSyncing,
}) => {
  const moon = getMoonPhase();
  const hour = getHogwartsHour();

  return (
    <header className="relative z-10 w-full border-b border-[#3d2a1b]/60 bg-[#0e0913]/85 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title & Crest */}
        <div className="flex items-center gap-3.5 text-center md:text-left">
          <div
            className="relative flex items-center justify-center w-12 h-12 rounded-full border border-[#d4af37]/40 bg-[#160d1f] shadow-[0_0_15px_rgba(212,175,55,0.25)] group cursor-pointer transition-transform hover:scale-105"
            onClick={() => {
              enchantedAudio.playInkRevealChime();
              setActiveTab('inscribe');
            }}
          >
            <span className="text-2xl select-none group-hover:rotate-12 transition-transform">🐍</span>
            <div className="absolute -inset-1 rounded-full border border-[#2ecc71]/20 animate-pulse pointer-events-none" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-[#ffd700] gold-glow flex items-center gap-2">
                CHAMBER OF SECRETS
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full border border-[#d4af37]/30 bg-[#2b1b0b]/60 text-[#d4af37] font-serif hidden sm:inline-block">
                Firebase Linked
              </span>
            </div>
            <p className="font-parchment text-sm italic text-[#c8b79b] tracking-wide">
              The Sentient Diary • Whisper your truth, and the parchment shall answer.
            </p>
          </div>
        </div>

        {/* Hogwarts Astronomical Watch & Moon */}
        <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-lg border border-[#3e2c1c]/70 bg-[#130d1a]/80 shadow-inner">
          <span className="text-lg" title={moon.name}>
            {moon.symbol}
          </span>
          <div className="text-xs font-serif text-left">
            <div className="text-[#ffd700]/90 font-semibold">{moon.name}</div>
            <div className="text-[#a08f7b] text-[11px] truncate max-w-[200px]">{hour}</div>
          </div>
        </div>

        {/* Controls, Auth & Nav */}
        <div className="flex items-center flex-wrap justify-center gap-2 sm:gap-3">
          {/* Navigation Pill */}
          <div className="flex items-center p-1 rounded-lg bg-[#181022] border border-[#3a2519]">
            <button
              onClick={() => {
                enchantedAudio.playPageTurn();
                setActiveTab('inscribe');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-cinzel tracking-wider font-semibold transition-all cursor-pointer ${
                activeTab === 'inscribe'
                  ? 'bg-gradient-to-r from-[#5a1827] to-[#3a0d18] text-[#ffd700] border border-[#d4af37]/40 shadow-sm'
                  : 'text-[#ab9982] hover:text-[#ffd700] hover:bg-white/5'
              }`}
            >
              <Feather className="w-3.5 h-3.5 text-[#ffd700]" />
              <span>Inscribe</span>
            </button>

            <button
              onClick={() => {
                enchantedAudio.playPageTurn();
                setActiveTab('archives');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-cinzel tracking-wider font-semibold transition-all cursor-pointer ${
                activeTab === 'archives'
                  ? 'bg-gradient-to-r from-[#124e33] to-[#0a2e1e] text-[#b4f5d1] border border-[#2ecc71]/40 shadow-sm'
                  : 'text-[#ab9982] hover:text-[#ffd700] hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#2ecc71]" />
              <span>Archives ({totalEntriesCount})</span>
            </button>
          </div>

          {/* Cloud / Auth Badge */}
          {currentUser ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#15231a] border border-[#2ecc71]/40 text-xs"
              title="Firebase Cloud Vault Synchronized"
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Seeker'}
                  className="w-4 h-4 rounded-full border border-[#2ecc71]/60 object-cover"
                />
              ) : (
                <Cloud
                  className={`w-3.5 h-3.5 text-[#2ecc71] ${isCloudSyncing ? 'animate-pulse' : ''}`}
                />
              )}
              <span className="font-cinzel text-[11px] text-[#a8e6cf] truncate max-w-[100px] sm:max-w-[130px]">
                {currentUser.displayName || currentUser.email || 'Guest Seeker'}
              </span>
              <button
                onClick={() => {
                  enchantedAudio.playPageTurn();
                  onLogout();
                }}
                title="Sever Cloud Bond (Sign Out)"
                className="p-1 hover:text-[#ff8888] text-[#a8e6cf] transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  enchantedAudio.playInkRevealChime();
                  onLoginGoogle();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white text-[#1f2937] hover:bg-[#f3f4f6] text-xs font-cinzel font-bold transition-all shadow-sm cursor-pointer"
                title="Sign in with Google to save & restore your previous questions and answers"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                <span className="hidden sm:inline">Sign in with Google</span>
                <span className="sm:hidden">Google Login</span>
              </button>

              <button
                onClick={() => {
                  enchantedAudio.playQuillScratch();
                  onLoginGuest();
                }}
                className="px-2 py-1.5 rounded-lg bg-[#181120] border border-[#3e2b1d] text-[#baa78f] hover:text-[#ffd700] text-xs font-cinzel transition-all cursor-pointer"
                title="Enter as Guest Seeker"
              >
                Guest
              </button>
            </div>
          )}

          {/* Action icons */}
          <div className="flex items-center gap-1.5">
            {/* Aparecium / Invisible ink privacy toggle */}
            <button
              onClick={() => {
                enchantedAudio.playQuillScratch();
                onTogglePrivacy();
              }}
              title={
                isPrivacyMode
                  ? 'Aparecium active (Secrets blurred until hovered)'
                  : 'Hide whispers from prying eyes (Aparecium charm)'
              }
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                isPrivacyMode
                  ? 'border-[#2ecc71]/60 bg-[#0e2a1b] text-[#2ecc71] shadow-[0_0_8px_rgba(46,204,113,0.3)]'
                  : 'border-[#3a2519] bg-[#160e1d] text-[#a08f7b] hover:text-[#ffd700]'
              }`}
            >
              {isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                onToggleAudio();
              }}
              title={isAudioMuted ? 'Unmute enchanted sounds (quill, chimes, pages)' : 'Mute sounds'}
              className={`p-2 rounded-lg border border-[#3a2519] bg-[#160e1d] transition-all cursor-pointer ${
                isAudioMuted
                  ? 'text-[#7d6f5f]'
                  : 'text-[#ffd700] hover:border-[#d4af37]/40 shadow-[0_0_8px_rgba(212,175,55,0.2)]'
              }`}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Lore / Help */}
            <button
              onClick={() => {
                enchantedAudio.playInkRevealChime();
                onOpenLore();
              }}
              title="Chamber Lore & Grimoire Rules"
              className="p-2 rounded-lg border border-[#3a2519] bg-[#160e1d] text-[#c9a759] hover:text-[#ffd700] hover:border-[#d4af37]/50 transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

