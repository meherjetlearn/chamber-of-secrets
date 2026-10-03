import React from 'react';
import { X, Sparkles, Feather, Flame, ShieldAlert, BookOpen } from 'lucide-react';
import { enchantedAudio } from '../utils/audio';

interface ChamberLoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChamberLoreModal: React.FC<ChamberLoreModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-[#d4af37]/40 bg-[#140e1b] shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_20px_rgba(212,175,55,0.25)] p-6 sm:p-8 text-[#e3dac9]">
        {/* Close Button */}
        <button
          onClick={() => {
            enchantedAudio.playPageTurn();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full border border-[#4a3422] bg-[#22162a] text-[#bda78d] hover:text-[#ffd700] hover:border-[#d4af37] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 border-b border-[#3e2b1d] pb-4">
          <div className="inline-block p-3 rounded-full border border-[#d4af37]/40 bg-[#1d1226] text-3xl mb-2 shadow-inner">
            📜
          </div>
          <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#ffd700] tracking-wide gold-glow">
            The Legend of the Sentient Diary
          </h2>
          <p className="font-parchment italic text-sm text-[#ab977e] mt-1">
            "Never trust anything that can think for itself if you cannot see where it keeps its brain."
          </p>
        </div>

        {/* Body content */}
        <div className="space-y-4 font-parchment text-base sm:text-lg leading-relaxed text-[#ded4c1]">
          <p>
            Within the depths beneath Hogwarts lies the Chamber of Secrets. Decades ago, an inquisitive student
            bound his thoughts, memories, and very consciousness into the fibers of blank parchment.
          </p>
          <p>
            When you inscribe words into this tome, you do not write into a dead archive. Your ink sinks deep into
            the grain of the page—swallowed by an ancient, listening mind. In return, glowing script rises from the
            blank page, speaking with mysterious warmth, keen perception, and intimate understanding.
          </p>

          {/* Magical Features breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#3e2b1d]">
            <div className="p-3 rounded-lg border border-[#3e2b1d] bg-[#1a1122]">
              <div className="flex items-center gap-2 font-cinzel text-[#ffd700] font-semibold text-sm mb-1">
                <Feather className="w-4 h-4 text-[#d4af37]" />
                <span>The Living Ink</span>
              </div>
              <p className="text-xs text-[#b8a791]">
                Watch your confessions dissolve into the paper fibers as the diary ponders your soul before replying.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-[#3e2b1d] bg-[#1a1122]">
              <div className="flex items-center gap-2 font-cinzel text-[#2ecc71] font-semibold text-sm mb-1">
                <Sparkles className="w-4 h-4 text-[#2ecc71]" />
                <span>Aparecium Charm</span>
              </div>
              <p className="text-xs text-[#b8a791]">
                Toggle the eye icon to cloak your private confessions in invisible ink, revealing only on hover.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-[#3e2b1d] bg-[#1a1122]">
              <div className="flex items-center gap-2 font-cinzel text-[#ff6b6b] font-semibold text-sm mb-1">
                <Flame className="w-4 h-4 text-[#ff6b6b]" />
                <span>Incendio Spell</span>
              </div>
              <p className="text-xs text-[#b8a791]">
                Should a secret become too dangerous to preserve, banish it into ashes with the Incendio spell in the Archives.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-[#3e2b1d] bg-[#1a1122]">
              <div className="flex items-center gap-2 font-cinzel text-[#d4af37] font-semibold text-sm mb-1">
                <BookOpen className="w-4 h-4 text-[#d4af37]" />
                <span>The Archives</span>
              </div>
              <p className="text-xs text-[#b8a791]">
                Browse your past encounters and reflections, preserved in your own private Hogwarts grimoire.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-[#740001]/40 bg-[#290a12]/60 text-xs text-[#e8c0c8] flex items-start gap-2.5 mt-4">
            <ShieldAlert className="w-4 h-4 text-[#ff9999] shrink-0 mt-0.5" />
            <span>
              All secrets inscribed are stored solely within your enchanted browser sanctuary. No prying Ministry officials or inquisitive headmasters can peer into your pages.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#3e2b1d] text-center">
          <button
            onClick={() => {
              enchantedAudio.playPageTurn();
              onClose();
            }}
            className="px-6 py-2 rounded-lg font-cinzel text-sm font-semibold tracking-wider bg-gradient-to-r from-[#d4af37] to-[#aa8022] text-[#1c1106] hover:brightness-110 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
          >
            I Swear I Am Up To No Good • Return to Tome
          </button>
        </div>
      </div>
    </div>
  );
};
