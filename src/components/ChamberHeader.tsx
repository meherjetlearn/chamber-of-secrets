import React from 'react';
import { Volume2, VolumeX, Eye, EyeOff, BookOpen, Feather, Sparkles, HelpCircle } from 'lucide-react';
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
}) => {
  const moon = getMoonPhase();
  const hour = getHogwartsHour();

  return (
    <header className="relative z-10 w-full border-b border-[#3d2a1b]/60 bg-[#0e0913]/85 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title & Crest */}
        <div className="flex items-center gap-3.5 text-center md:text-left">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full border border-[#d4af37]/40 bg-[#160d1f] shadow-[0_0_15px_rgba(212,175,55,0.25)] group cursor-pointer transition-transform hover:scale-105"
               onClick={() => {
                 enchantedAudio.playInkRevealChime();
                 setActiveTab('inscribe');
               }}>
            <span className="text-2xl select-none group-hover:rotate-12 transition-transform">🐍</span>
            <div className="absolute -inset-1 rounded-full border border-[#2ecc71]/20 animate-pulse pointer-events-none" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-[#ffd700] gold-glow flex items-center gap-2">
                CHAMBER OF SECRETS
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full border border-[#d4af37]/30 bg-[#2b1b0b]/60 text-[#d4af37] font-serif hidden sm:inline-block">
                Anno 1943
              </span>
            </div>
            <p className="font-parchment text-sm italic text-[#c8b79b] tracking-wide">
              The Sentient Diary • Whisper your truth, and the parchment shall answer.
            </p>
          </div>
        </div>

        {/* Hogwarts Astronomical Watch & Moon */}
        <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-lg border border-[#3e2c1c]/70 bg-[#130d1a]/80 shadow-inner">
          <span className="text-lg" title={moon.name}>{moon.symbol}</span>
          <div className="text-xs font-serif text-left">
            <div className="text-[#ffd700]/90 font-semibold">{moon.name}</div>
            <div className="text-[#a08f7b] text-[11px] truncate max-w-[200px]">{hour}</div>
          </div>
        </div>

        {/* Controls & Nav */}
        <div className="flex items-center flex-wrap justify-center gap-2 sm:gap-3">
          {/* Navigation Pill */}
          <div className="flex items-center p-1 rounded-lg bg-[#181022] border border-[#3a2519]">
            <button
              onClick={() => {
                enchantedAudio.playPageTurn();
                setActiveTab('inscribe');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-cinzel tracking-wider font-semibold transition-all ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-cinzel tracking-wider font-semibold transition-all ${
                activeTab === 'archives'
                  ? 'bg-gradient-to-r from-[#124e33] to-[#0a2e1e] text-[#b4f5d1] border border-[#2ecc71]/40 shadow-sm'
                  : 'text-[#ab9982] hover:text-[#ffd700] hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#2ecc71]" />
              <span>Archives ({totalEntriesCount})</span>
            </button>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1.5">
            {/* Aparecium / Invisible ink privacy toggle */}
            <button
              onClick={() => {
                enchantedAudio.playQuillScratch();
                onTogglePrivacy();
              }}
              title={isPrivacyMode ? 'Aparecium active (Secrets blurred until hovered)' : 'Hide whispers from prying eyes (Aparecium charm)'}
              className={`p-2 rounded-lg border transition-all ${
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
              className={`p-2 rounded-lg border border-[#3a2519] bg-[#160e1d] transition-all ${
                isAudioMuted ? 'text-[#7d6f5f]' : 'text-[#ffd700] hover:border-[#d4af37]/40 shadow-[0_0_8px_rgba(212,175,55,0.2)]'
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
              className="p-2 rounded-lg border border-[#3a2519] bg-[#160e1d] text-[#c9a759] hover:text-[#ffd700] hover:border-[#d4af37]/50 transition-all"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
