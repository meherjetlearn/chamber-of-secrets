import React, { useState } from 'react';
import {
  Search,
  Star,
  Trash2,
  Download,
  BookOpen,
  Calendar,
  Sparkles,
  Flame,
  ArrowLeft,
  Eye,
  EyeOff,
  Feather,
} from 'lucide-react';
import { JournalEntry, HogwartsHouse } from '../types/journal';
import { HOUSES, INK_COLORS } from '../data/prompts';
import { enchantedAudio } from '../utils/audio';

interface SpellbookArchivesProps {
  entries: JournalEntry[];
  onToggleFavorite: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onSelectEntry: (entry: JournalEntry) => void;
  onBackToInscribe: () => void;
  isPrivacyMode: boolean;
  onSeedSampleEntries: () => void;
}

export const SpellbookArchives: React.FC<SpellbookArchivesProps> = ({
  entries,
  onToggleFavorite,
  onDeleteEntry,
  onSelectEntry,
  onBackToInscribe,
  isPrivacyMode,
  onSeedSampleEntries,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHouseFilter, setSelectedHouseFilter] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [burningId, setBurningId] = useState<string | null>(null);
  const [inspectedEntry, setInspectedEntry] = useState<JournalEntry | null>(null);

  // Filter entries
  const filteredEntries = entries.filter((e) => {
    if (selectedHouseFilter !== 'all' && e.house !== selectedHouseFilter) return false;
    if (onlyFavorites && !e.isFavorite) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchContent = e.content.toLowerCase().includes(q);
      const matchReply = e.diaryReply.toLowerCase().includes(q);
      const matchMood = e.mood.toLowerCase().includes(q);
      return matchTitle || matchContent || matchReply || matchMood;
    }
    return true;
  });

  // Handle Incendio deletion with audio & flame effect
  const handleBurn = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    enchantedAudio.playIncendio();
    setBurningId(id);

    setTimeout(() => {
      onDeleteEntry(id);
      setBurningId(null);
      if (inspectedEntry?.id === id) {
        setInspectedEntry(null);
      }
    }, 800);
  };

  // Export as enchanted text scroll
  const handleExportJournal = () => {
    enchantedAudio.playInkRevealChime();
    const exportText = entries
      .map(
        (e, idx) =>
          `═══════════════════════════════════════════════════════════\n` +
          `SECRETS OF THE CHAMBER — CODEX ENTRY #${idx + 1}\n` +
          `Date: ${e.dateFormatted}\n` +
          `Celestial Watch: ${e.astronomyHour} (${e.moonPhase})\n` +
          `House Alignment: House ${e.house}\n` +
          `Ink: ${e.inkColor} | Resonance: ${e.mood}\n` +
          `Subject: ${e.title}\n` +
          `───────────────────────────────────────────────────────────\n` +
          `SEEKER'S CONFESSION:\n${e.content}\n\n` +
          `THE LIVING DIARY REPLIES:\n${e.diaryReply}\n` +
          `═══════════════════════════════════════════════════════════\n\n`
      )
      .join('\n');

    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chamber_Of_Secrets_Chronicle_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto my-4 sm:my-8 px-2 sm:px-4">
      {/* Outer Grimoire Frame */}
      <div className="relative rounded-2xl p-4 sm:p-7 bg-gradient-to-b from-[#21141c] via-[#160d14] to-[#0c070b] border-2 border-[#4d341f] shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(80,40,20,0.4)]">
        
        {/* Top Navigation & Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#442c18]/70 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                enchantedAudio.playPageTurn();
                onBackToInscribe();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d4af37]/40 bg-[#241627] text-[#ffd700] hover:bg-[#341e38] transition-all text-xs font-cinzel font-semibold cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Inscribing</span>
            </button>

            <div>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#ffd700] tracking-wide gold-glow flex items-center gap-2">
                <span>The Restricted Archives</span>
                <span className="text-sm px-2 py-0.5 rounded-full border border-[#2ecc71]/40 bg-[#0c2417] text-[#2ecc71]">
                  {entries.length} Whispers
                </span>
              </h2>
              <p className="font-parchment italic text-xs sm:text-sm text-[#baa78f]">
                Preserved within the subterranean vaults of Hogwarts.
              </p>
            </div>
          </div>

          {/* Export Button */}
          {entries.length > 0 && (
            <button
              onClick={handleExportJournal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#a88a58]/50 bg-[#1e1324] text-[#e3dac9] hover:text-[#ffd700] hover:border-[#ffd700]/60 transition-all text-xs font-cinzel font-semibold cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#ffd700]" />
              <span>Export Chronicle (.txt)</span>
            </button>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-[#160d1b] p-3 rounded-xl border border-[#3e2b1d]">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c745c]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search secrets, words, or reflections..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#221528] border border-[#4a3422] text-xs font-parchment text-[#e6ded2] placeholder:text-[#8c745c] focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          {/* House Filter & Favorites */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={selectedHouseFilter}
              onChange={(e) => {
                enchantedAudio.playQuillScratch();
                setSelectedHouseFilter(e.target.value);
              }}
              className="bg-[#221528] border border-[#4a3422] rounded-lg px-2.5 py-1.5 font-cinzel text-xs text-[#dcd1be] focus:outline-none cursor-pointer"
            >
              <option value="all">All Houses</option>
              <option value="Slytherin">🐍 Slytherin</option>
              <option value="Gryffindor">🦁 Gryffindor</option>
              <option value="Ravenclaw">🦅 Ravenclaw</option>
              <option value="Hufflepuff">🦡 Hufflepuff</option>
              <option value="Hogwarts">🏰 Hogwarts</option>
            </select>

            <button
              onClick={() => {
                enchantedAudio.playQuillScratch();
                setOnlyFavorites(!onlyFavorites);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-cinzel transition-all cursor-pointer ${
                onlyFavorites
                  ? 'border-[#ffd700] bg-[#3a280c] text-[#ffd700] shadow-[0_0_8px_rgba(255,215,0,0.3)]'
                  : 'border-[#4a3422] bg-[#221528] text-[#a08f7b] hover:text-[#ffd700]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-[#ffd700]' : ''}`} />
              <span>Bookmarked</span>
            </button>
          </div>
        </div>

        {/* Content: Empty State OR Grid of Entries */}
        {entries.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#140b17]/50 rounded-xl border border-[#3e2b1d]">
            <div className="text-4xl mb-3">📜</div>
            <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#ffd700] mb-2">
              The Archives are Silent and Empty
            </h3>
            <p className="font-parchment text-sm sm:text-base text-[#ab977e] max-w-md mx-auto mb-6">
              You have not yet committed any whispers into the Chamber. Inscribe your first secret or evoke
              ancient sample memories.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  enchantedAudio.playPageTurn();
                  onBackToInscribe();
                }}
                className="px-5 py-2 rounded-lg font-cinzel text-xs font-bold bg-gradient-to-r from-[#5a1827] to-[#740001] text-[#ffd700] border border-[#d4af37]/40 hover:brightness-110 transition-all shadow-md cursor-pointer"
              >
                Inscribe a Secret Now
              </button>
              <button
                onClick={() => {
                  enchantedAudio.playInkRevealChime();
                  onSeedSampleEntries();
                }}
                className="px-4 py-2 rounded-lg font-cinzel text-xs font-semibold bg-[#221528] text-[#c9a759] border border-[#4a3422] hover:border-[#ffd700]/50 transition-all cursor-pointer"
              >
                Awaken Ancient Sample Secrets
              </button>
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#140b17]/50 rounded-xl border border-[#3e2b1d]">
            <p className="font-parchment text-base text-[#baa78f]">
              No whispers matched your search runes in this vault.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntries.map((entry) => {
              const houseInfo = HOUSES[entry.house] || HOUSES.Slytherin;
              const ink = INK_COLORS.find((i) => i.id === entry.inkColor) || INK_COLORS[0];
              const isBurning = burningId === entry.id;

              return (
                <div
                  key={entry.id}
                  onClick={() => {
                    enchantedAudio.playPageTurn();
                    setInspectedEntry(entry);
                  }}
                  className={`relative parchment-texture rounded-xl p-4 sm:p-5 border border-[#a88a58]/60 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)] flex flex-col justify-between ${
                    isBurning ? 'animate-ink-absorb pointer-events-none' : ''
                  }`}
                >
                  {/* Top Bar of card */}
                  <div>
                    <div className="flex items-center justify-between border-b border-[#a88a58]/30 pb-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base" title={houseInfo.name}>
                          {houseInfo.sealSymbol}
                        </span>
                        <span className="font-cinzel text-[11px] font-bold text-[#5a2e14]">
                          House {entry.house}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            enchantedAudio.playQuillScratch();
                            onToggleFavorite(entry.id);
                          }}
                          title={entry.isFavorite ? 'Remove Bookmark' : 'Bookmark Whisper'}
                          className="p-1 text-[#8b6508] hover:text-[#d4af37] transition-colors"
                        >
                          <Star
                            className={`w-4 h-4 ${entry.isFavorite ? 'fill-[#8b6508] text-[#8b6508]' : ''}`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleBurn(entry.id, e)}
                          title="Incendio (Burn from parchment)"
                          className="p-1 text-[#8b352b] hover:text-[#b01c1c] transition-colors"
                        >
                          <Flame className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Date & Celestial info */}
                    <div className="font-parchment text-[11px] text-[#7a5839] italic mb-2">
                      {entry.dateFormatted} • {entry.moonPhase}
                    </div>

                    {/* Title */}
                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#3d1e0f] mb-2 line-clamp-1">
                      {entry.title}
                    </h3>

                    {/* Excerpt of Seeker's confession */}
                    <div className="mb-3">
                      <div className="text-[10px] font-cinzel text-[#825b39] uppercase font-semibold">
                        Your Inscription:
                      </div>
                      <p
                        className={`font-fondamento text-xs sm:text-sm text-[#2b170e] line-clamp-3 leading-relaxed ${
                          isPrivacyMode ? 'filter blur-[2.5px] hover:blur-none transition-all' : ''
                        }`}
                      >
                        "{entry.content}"
                      </p>
                    </div>

                    {/* Excerpt of Diary's reply */}
                    <div className="p-2.5 rounded bg-[#ebd8bb]/70 border border-[#c4ab89]/60">
                      <div className="text-[10px] font-cinzel text-[#10492c] uppercase font-bold flex items-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3 text-[#10492c]" />
                        <span>The Diary's Answer:</span>
                      </div>
                      <p
                        className={`font-fondamento text-xs text-[#1c1209] line-clamp-3 italic leading-relaxed ${
                          isPrivacyMode ? 'filter blur-[2.5px] hover:blur-none transition-all' : ''
                        }`}
                      >
                        "{entry.diaryReply}"
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 mt-3 border-t border-[#a88a58]/30 flex items-center justify-between text-[11px] font-cinzel text-[#704f32]">
                    <span className="italic font-serif">{entry.mood}</span>
                    <span className="font-semibold text-[#8b6508] hover:underline">
                      Unfurl Scroll →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= MODAL: INSPECT FULL SECRET SCROLL ================= */}
      {inspectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto parchment-texture rounded-2xl p-6 sm:p-8 border-2 border-[#a88a58] shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.3)] text-[#2c1810]">
            
            {/* Close Button */}
            <button
              onClick={() => {
                enchantedAudio.playPageTurn();
                setInspectedEntry(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full border border-[#8b6508] bg-[#ebd8bb] text-[#4a2e1a] hover:bg-[#deb887] transition-colors"
            >
              ✕
            </button>

            {/* Header of Modal */}
            <div className="border-b border-[#a88a58]/50 pb-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {HOUSES[inspectedEntry.house]?.sealSymbol || '🐍'}
                </span>
                <span className="font-cinzel text-xs font-bold text-[#8b6508] tracking-widest uppercase">
                  Chamber of Secrets • House {inspectedEntry.house} Codex
                </span>
              </div>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#3a1d0f]">
                {inspectedEntry.title}
              </h2>
              <div className="font-fondamento text-xs sm:text-sm text-[#7a5839] mt-1">
                Inscribed on {inspectedEntry.dateFormatted} • {inspectedEntry.moonPhase} •{' '}
                {inspectedEntry.astronomyHour}
              </div>
            </div>

            {/* Inscription & Answer Sections */}
            <div className="space-y-6">
              {/* The Seeker's Words */}
              <div className="p-4 rounded-xl bg-[#ebd9bf]/60 border border-[#c4ab89]">
                <div className="flex items-center gap-2 font-cinzel text-xs font-bold text-[#740001] mb-2 uppercase">
                  <Feather className="w-4 h-4" />
                  <span>Your Inscription:</span>
                </div>
                <div
                  className={`font-fondamento text-base sm:text-lg text-[#1e130c] leading-relaxed whitespace-pre-line ${
                    isPrivacyMode ? 'filter blur-[3px] hover:blur-none transition-all' : ''
                  }`}
                  style={{ lineHeight: '30px' }}
                >
                  {inspectedEntry.content}
                </div>
              </div>

              {/* The Sentient Diary's Words */}
              <div className="p-5 rounded-xl bg-[#e3eedd]/70 border border-[#a2c4ac]">
                <div className="flex items-center gap-2 font-cinzel text-xs font-bold text-[#10492c] mb-2 uppercase">
                  <Sparkles className="w-4 h-4 text-[#10492c]" />
                  <span>The Living Diary Replied:</span>
                </div>
                <div
                  className={`font-fondamento text-base sm:text-lg text-[#0f291a] leading-relaxed whitespace-pre-line ${
                    isPrivacyMode ? 'filter blur-[3px] hover:blur-none transition-all' : ''
                  }`}
                  style={{ lineHeight: '30px' }}
                >
                  {inspectedEntry.diaryReply}
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="mt-6 pt-4 border-t border-[#a88a58]/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    enchantedAudio.playQuillScratch();
                    onToggleFavorite(inspectedEntry.id);
                    setInspectedEntry({
                      ...inspectedEntry,
                      isFavorite: !inspectedEntry.isFavorite,
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#a88a58] bg-[#ebd8bb] hover:bg-[#deb887] text-xs font-cinzel font-semibold text-[#4a2e1a] transition-colors cursor-pointer"
                >
                  <Star
                    className={`w-4 h-4 ${
                      inspectedEntry.isFavorite ? 'fill-[#8b6508] text-[#8b6508]' : ''
                    }`}
                  />
                  <span>
                    {inspectedEntry.isFavorite ? 'Bookmarked' : 'Add Bookmark'}
                  </span>
                </button>

                <button
                  onClick={(e) => handleBurn(inspectedEntry.id, e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8b352b] bg-[#f2d8d8] hover:bg-[#eab8b8] text-xs font-cinzel font-semibold text-[#740001] transition-colors cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-[#740001]" />
                  <span>Incendio (Burn)</span>
                </button>
              </div>

              <button
                onClick={() => {
                  enchantedAudio.playPageTurn();
                  setInspectedEntry(null);
                }}
                className="px-5 py-2 rounded-lg font-cinzel text-xs font-bold bg-[#3a1d0f] text-[#ffd700] hover:bg-[#4d2815] transition-colors cursor-pointer"
              >
                Close Scroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
