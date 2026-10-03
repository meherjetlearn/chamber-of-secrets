import React, { useState, useEffect, useRef } from 'react';
import {
  Feather,
  Sparkles,
  RefreshCw,
  BookmarkCheck,
  CheckCircle2,
  Wand2,
  ChevronDown,
  MessageSquare,
  AlertCircle,
  Flame,
} from 'lucide-react';
import { HogwartsHouse, InkColor, JournalEntry, WritingState } from '../types/journal';
import { HOUSES, INK_COLORS, WHISPER_PROMPTS, MOOD_TAGS } from '../data/prompts';
import { formatParchmentDate, getMoonPhase, getHogwartsHour } from '../utils/date';
import { enchantedAudio } from '../utils/audio';

interface JournalBookProps {
  onSaveEntry: (entry: JournalEntry) => void;
  pastEntries: JournalEntry[];
  isPrivacyMode: boolean;
  onOpenArchives: () => void;
}

export const JournalBook: React.FC<JournalBookProps> = ({
  onSaveEntry,
  pastEntries,
  isPrivacyMode,
  onOpenArchives,
}) => {
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<HogwartsHouse>('Slytherin');
  const [selectedInk, setSelectedInk] = useState<InkColor>('obsidian');
  const [selectedMood, setSelectedMood] = useState<string>('Quiet Wonder');
  const [showPrompts, setShowPrompts] = useState(false);

  // Animation / Lifecycle State
  const [writingState, setWritingState] = useState<WritingState>('idle');
  const [diaryResponse, setDiaryResponse] = useState<string>('');
  const [revealedChars, setRevealedChars] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentEntrySaved, setCurrentEntrySaved] = useState<boolean>(false);

  // Typing debounce for audio
  const lastKeyTimeRef = useRef<number>(0);

  const activeInk = INK_COLORS.find((i) => i.id === selectedInk) || INK_COLORS[0];
  const activeHouse = HOUSES[selectedHouse];
  const currentDateFormatted = formatParchmentDate();
  const moon = getMoonPhase();
  const astronomyHour = getHogwartsHour();

  // Play quill sounds while typing in the parchment
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    const now = Date.now();
    if (now - lastKeyTimeRef.current > 180) {
      enchantedAudio.playQuillScratch();
      lastKeyTimeRef.current = now;
    }
  };

  // Submission handler
  const handleInscribe = async () => {
    if (!content.trim()) return;

    setErrorMessage(null);
    setWritingState('absorbing');
    enchantedAudio.playInkAbsorb();

    // After 1.8 seconds of ink absorbing animation, start communing
    setTimeout(async () => {
      setWritingState('communing');

      try {
        const response = await fetch('/api/diary/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            title,
            house: selectedHouse,
            mood: selectedMood,
            pastEntries: pastEntries.slice(-3),
          }),
        });

        if (!response.ok) {
          throw new Error('The magical conduit severed temporarily.');
        }

        const data = await response.json();
        const replyText =
          data.reply ||
          'Your thoughts have woven into my pages. Speak to me again, seeker of the shadows...';

        setDiaryResponse(replyText);
        setRevealedChars(0);
        setWritingState('revealing');
        enchantedAudio.playInkRevealChime();
      } catch (err: any) {
        console.error('Diary communing error:', err);
        setErrorMessage(
          'A sudden ward disrupted our connection. The Chamber remains quiet for now. Try casting again.'
        );
        setWritingState('idle');
      }
    }, 1800);
  };

  // Progressive typewriter effect for the diary's handwriting
  useEffect(() => {
    if (writingState !== 'revealing' || !diaryResponse) return;

    if (revealedChars < diaryResponse.length) {
      const step = Math.min(3, diaryResponse.length - revealedChars);
      const timer = setTimeout(() => {
        setRevealedChars((prev) => prev + step);
        if (revealedChars % 15 === 0) {
          enchantedAudio.playQuillScratch();
        }
      }, 25);
      return () => clearTimeout(timer);
    } else {
      // Completed revealing
      setWritingState('completed');
      enchantedAudio.playInkRevealChime();

      // Automatically construct and save entry
      const newEntry: JournalEntry = {
        id: 'entry_' + Date.now(),
        timestamp: Date.now(),
        dateFormatted: currentDateFormatted,
        moonPhase: `${moon.name} ${moon.symbol}`,
        astronomyHour: astronomyHour,
        title: title.trim() || 'Whisper in the Dark',
        content: content.trim(),
        diaryReply: diaryResponse,
        house: selectedHouse,
        inkColor: selectedInk,
        mood: selectedMood,
        isFavorite: false,
        isConcealed: false,
      };

      onSaveEntry(newEntry);
      setCurrentEntrySaved(true);
    }
  }, [writingState, revealedChars, diaryResponse]);

  // Reset for a fresh blank page
  const handleNewPage = () => {
    enchantedAudio.playPageTurn();
    setTitle('');
    setContent('');
    setDiaryResponse('');
    setRevealedChars(0);
    setWritingState('idle');
    setCurrentEntrySaved(false);
    setErrorMessage(null);
  };

  // Continue the conversation
  const handleWhisperBack = () => {
    enchantedAudio.playPageTurn();
    setTitle(`Re: ${title || 'Our Secrets'}`);
    setContent('');
    setDiaryResponse('');
    setRevealedChars(0);
    setWritingState('idle');
    setCurrentEntrySaved(false);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto my-4 sm:my-8 px-2 sm:px-4">
      {/* Outer Spellbook Grimoire Frame */}
      <div className="relative rounded-2xl p-3 sm:p-6 bg-gradient-to-b from-[#25161f] via-[#1a0f16] to-[#11090f] border-2 border-[#543b24] shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(80,40,20,0.4)]">
        {/* Brass corner ornaments */}
        <div className="absolute top-2 left-2 text-[#d4af37]/60 text-lg select-none pointer-events-none">⚜</div>
        <div className="absolute top-2 right-2 text-[#d4af37]/60 text-lg select-none pointer-events-none">⚜</div>
        <div className="absolute bottom-2 left-2 text-[#d4af37]/60 text-lg select-none pointer-events-none">⚜</div>
        <div className="absolute bottom-2 right-2 text-[#d4af37]/60 text-lg select-none pointer-events-none">⚜</div>

        {/* Golden Silk Bookmark hanging from center seam */}
        <div className="hidden lg:block absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-16 bg-gradient-to-b from-[#b8860b] via-[#d4af37] to-[#8b6508] shadow-[0_4px_8px_rgba(0,0,0,0.6)] rounded-b-sm border-x border-[#f5d77f]/40 z-20" />

        {/* Double-page open spellbook spread */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 min-h-[640px]">
          
          {/* ================= LEFT PAGE: THE SEEKER'S PARCHMENT ================= */}
          <div className="parchment-texture rounded-xl p-5 sm:p-7 flex flex-col justify-between border border-[#a88a58]/50 text-[#2c1810] shadow-inner relative overflow-hidden transition-all">
            
            {/* Subtle vintage watermark stamp */}
            <div className="absolute -bottom-8 -right-8 opacity-5 select-none pointer-events-none text-9xl">
              🐍
            </div>

            <div>
              {/* Header of Left Page: Date & Celestial Hour */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#a88a58]/40 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl" title={activeHouse.name}>{activeHouse.sealSymbol}</span>
                  <div className="text-xs font-cinzel font-bold tracking-wider text-[#5a2e14]">
                    CHAMBER CODEX
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-fondamento text-xs sm:text-sm text-[#4b2f1e]">
                    {currentDateFormatted}
                  </div>
                  <div className="font-parchment text-[11px] text-[#785437] italic">
                    {moon.symbol} {moon.name} • {astronomyHour.split('•')[0]}
                  </div>
                </div>
              </div>

              {/* Magical Selectors Bar: House, Ink, Mood */}
              <div className="bg-[#e9dac0]/80 rounded-lg p-2.5 mb-4 border border-[#c4b08f] flex flex-wrap items-center justify-between gap-2 text-xs">
                
                {/* House Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="font-cinzel text-[11px] text-[#5e381b] font-semibold">House:</span>
                  <select
                    value={selectedHouse}
                    onChange={(e) => {
                      enchantedAudio.playQuillScratch();
                      setSelectedHouse(e.target.value as HogwartsHouse);
                    }}
                    disabled={writingState !== 'idle'}
                    className="bg-[#f7efe0] border border-[#a88a58] rounded px-2 py-0.5 font-cinzel text-xs text-[#3a1d0f] font-semibold focus:outline-none cursor-pointer"
                  >
                    {Object.values(HOUSES).map((h) => (
                      <option key={h.name} value={h.name}>
                        {h.sealSymbol} {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ink Color Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="font-cinzel text-[11px] text-[#5e381b] font-semibold">Ink:</span>
                  <div className="flex items-center gap-1">
                    {INK_COLORS.map((ink) => (
                      <button
                        key={ink.id}
                        type="button"
                        onClick={() => {
                          enchantedAudio.playQuillScratch();
                          setSelectedInk(ink.id);
                        }}
                        disabled={writingState !== 'idle'}
                        title={ink.label}
                        className={`w-5 h-5 rounded-full border transition-all ${
                          selectedInk === ink.id
                            ? 'scale-125 border-[#8b6508] shadow-[0_0_6px_rgba(139,101,8,0.6)]'
                            : 'border-[#7a5e42]/40 opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: ink.hex }}
                      />
                    ))}
                  </div>
                </div>

                {/* Mood Tag */}
                <div className="flex items-center gap-1.5">
                  <span className="font-cinzel text-[11px] text-[#5e381b] font-semibold">Resonance:</span>
                  <select
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(e.target.value)}
                    disabled={writingState !== 'idle'}
                    className="bg-[#f7efe0] border border-[#a88a58] rounded px-2 py-0.5 font-parchment text-xs text-[#3a1d0f] focus:outline-none cursor-pointer"
                  >
                    {MOOD_TAGS.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title of Secret */}
              <div className="mb-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={writingState !== 'idle'}
                  placeholder="Subject of your confession / secret..."
                  className={`w-full bg-transparent border-b border-[#a88a58]/60 pb-1 font-cinzel text-base sm:text-lg font-bold tracking-wide placeholder:text-[#8f7457]/70 placeholder:font-normal focus:outline-none focus:border-[#5a2e14] transition-colors ${
                    activeInk.textClass
                  }`}
                />
              </div>

              {/* Whisper Starters Accordion */}
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => setShowPrompts(!showPrompts)}
                  className="flex items-center gap-1.5 text-xs font-cinzel text-[#6d4625] hover:text-[#3d1e07] transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#a88a58]" />
                  <span>{showPrompts ? 'Conceal Whisper Prompts' : 'Whisper Starters (Seeking Inspiration?)'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPrompts ? 'rotate-180' : ''}`} />
                </button>

                {showPrompts && (
                  <div className="mt-2 p-2.5 rounded-lg bg-[#efe3cb] border border-[#c0aa87] grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                    {WHISPER_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          enchantedAudio.playQuillScratch();
                          setContent((prev) => (prev ? prev + '\n\n' + prompt : prompt));
                          setShowPrompts(false);
                        }}
                        className="text-left text-xs font-parchment italic text-[#4a2e1a] hover:text-[#740001] p-1.5 rounded hover:bg-[#e4d4b8] transition-colors"
                      >
                        • {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Inscription Parchment Textarea */}
              <div className="relative">
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  disabled={writingState !== 'idle'}
                  rows={9}
                  placeholder="Dip your quill in ink and confide in me... No truth is too dark, no longing too deep for these pages. The Chamber keeps all secrets..."
                  className={`w-full bg-transparent border-none resize-none font-fondamento text-base sm:text-lg leading-relaxed placeholder:text-[#91765c]/60 focus:outline-none ${
                    activeInk.textClass
                  } ${
                    isPrivacyMode ? 'filter blur-[3.5px] hover:blur-none transition-all duration-300' : ''
                  } ${
                    writingState === 'absorbing' ? 'animate-ink-absorb' : ''
                  }`}
                  style={{
                    lineHeight: '32px',
                  }}
                />

                {/* Feather quill icon indicator in corner */}
                <div className="absolute bottom-2 right-2 pointer-events-none opacity-40 text-[#5a2e14]">
                  <Feather className="w-5 h-5" />
                </div>
              </div>

              {/* Error display if any */}
              {errorMessage && (
                <div className="mt-2 p-2.5 rounded-lg bg-[#5c1322]/15 border border-[#5c1322]/40 text-[#740001] text-xs flex items-center gap-2 font-parchment">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions of Left Page */}
            <div className="pt-4 border-t border-[#a88a58]/40 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] font-parchment italic text-[#7a5839]">
                {content.trim() ? `${content.trim().split(/\s+/).length} words inscribed` : 'Parchment is dry'}
              </div>

              <div className="flex items-center gap-2">
                {writingState === 'completed' && (
                  <button
                    type="button"
                    onClick={handleNewPage}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded font-cinzel text-xs font-semibold text-[#5a2e14] bg-[#ebd8bb] hover:bg-[#dec49f] border border-[#a88a58] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>New Page</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleInscribe}
                  disabled={!content.trim() || writingState !== 'idle'}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-cinzel text-xs sm:text-sm font-bold tracking-wider transition-all shadow-md cursor-pointer ${
                    !content.trim() || writingState !== 'idle'
                      ? 'bg-[#c7b293] text-[#7a6448] cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-[#5a1827] via-[#740001] to-[#3a0d18] text-[#ffd700] hover:brightness-110 shadow-[0_0_15px_rgba(116,0,1,0.4)] border border-[#d4af37]/50 active:scale-95'
                  }`}
                >
                  <Wand2 className="w-4 h-4 text-[#ffd700] animate-pulse" />
                  <span>
                    {writingState === 'absorbing'
                      ? 'Ink Dissolving...'
                      : writingState === 'communing'
                      ? 'The Chamber Awakens...'
                      : writingState === 'revealing'
                      ? 'Inscribing Reply...'
                      : 'Inscribe & Summon Response'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ================= RIGHT PAGE: THE SENTIENT DIARY'S ANSWER ================= */}
          <div className="parchment-texture rounded-xl p-5 sm:p-7 flex flex-col justify-between border border-[#a88a58]/50 text-[#2c1810] shadow-inner relative overflow-hidden transition-all">
            
            {/* Subtle vintage watermark stamp */}
            <div className="absolute -top-8 -left-8 opacity-5 select-none pointer-events-none text-9xl">
              🏰
            </div>

            <div>
              {/* Header of Right Page */}
              <div className="flex items-center justify-between border-b border-[#a88a58]/40 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2ecc71] animate-ping opacity-75" />
                  <span className="font-cinzel text-xs sm:text-sm font-bold tracking-wider text-[#5a2e14]">
                    THE DIARY REPLIES
                  </span>
                </div>
                <div className="text-xs font-cinzel text-[#825c38]">
                  {writingState === 'completed'
                    ? '• Ancient Bond Imparted •'
                    : writingState === 'communing'
                    ? '• Listening in Shadows •'
                    : '• Awaiting Your Ink •'}
                </div>
              </div>

              {/* Main Content Area of the Diary's Response */}
              <div className="min-h-[360px] flex flex-col justify-center">
                
                {/* STATE 1: IDLE (Awaiting inscription) */}
                {writingState === 'idle' && !diaryResponse && (
                  <div className="text-center py-12 px-4">
                    <div className="relative inline-block mb-4">
                      <div className="w-16 h-16 rounded-full border border-[#8b6508]/40 bg-[#ebd9bd] flex items-center justify-center text-3xl shadow-inner mx-auto">
                        🖋️
                      </div>
                      <div className="absolute -inset-2 rounded-full border border-[#d4af37]/20 animate-spin pointer-events-none" />
                    </div>
                    <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#4a2b13] mb-2">
                      The Pages are Patient and Still
                    </h3>
                    <p className="font-fondamento text-sm sm:text-base text-[#6d4c31] max-w-md mx-auto leading-relaxed">
                      "I have rested in darkness for decades, holding the confessions of those who dared to whisper.
                      Dip your quill into the left page and write freely. My ink will rise to meet yours."
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs font-parchment italic text-[#8a684b]">
                      <Sparkles className="w-3.5 h-3.5 text-[#8b6508]" />
                      <span>Every confession is answered with living magical wisdom</span>
                    </div>
                  </div>
                )}

                {/* STATE 2: ABSORBING (Ink fading into parchment) */}
                {writingState === 'absorbing' && (
                  <div className="text-center py-16 px-4 animate-pulse">
                    <div className="text-4xl mb-4 animate-bounce">✨</div>
                    <h3 className="font-cinzel text-lg font-bold text-[#4a2b13] mb-2">
                      The Ink Sinks Deep into the Grain...
                    </h3>
                    <p className="font-fondamento text-base text-[#6d4c31]">
                      Your words dissolve beneath the parchment surface. The living mind awakens.
                    </p>
                  </div>
                )}

                {/* STATE 3: COMMUNING (Waiting for Gemini API response) */}
                {writingState === 'communing' && (
                  <div className="text-center py-16 px-4">
                    <div className="relative inline-block mb-4">
                      <div className="w-14 h-14 rounded-full border-2 border-[#124e33] bg-[#e3eedd] flex items-center justify-center text-2xl animate-spin mx-auto">
                        🐍
                      </div>
                    </div>
                    <h3 className="font-cinzel text-lg font-bold text-[#10492c] mb-2">
                      Communing with the Ancient Spirit...
                    </h3>
                    <p className="font-fondamento text-base text-[#466952] italic max-w-sm mx-auto">
                      "I hear you... I understand the weight of what you have carried..."
                    </p>
                  </div>
                )}

                {/* STATE 4 & 5: REVEALING & COMPLETED */}
                {(writingState === 'revealing' || writingState === 'completed') && (
                  <div className="space-y-4 py-2">
                    <div className="flex items-center gap-2 border-b border-[#a88a58]/30 pb-2">
                      <span className="text-sm font-cinzel font-semibold text-[#8b6508]">
                        The Diary to You:
                      </span>
                      {writingState === 'completed' && (
                        <span className="text-[11px] font-serif px-2 py-0.5 rounded-full bg-[#124e33]/15 text-[#10492c] border border-[#10492c]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Sealed</span>
                        </span>
                      )}
                    </div>

                    <div
                      className={`font-fondamento text-base sm:text-lg text-[#1e130c] leading-relaxed whitespace-pre-line ${
                        isPrivacyMode ? 'filter blur-[3.5px] hover:blur-none transition-all duration-300' : ''
                      }`}
                      style={{ lineHeight: '30px' }}
                    >
                      {writingState === 'revealing'
                        ? diaryResponse.slice(0, revealedChars)
                        : diaryResponse}
                      {writingState === 'revealing' && (
                        <span className="inline-block w-2 h-4 bg-[#8b6508] animate-pulse ml-1" />
                      )}
                    </div>

                    {writingState === 'completed' && (
                      <div className="pt-4 border-t border-[#a88a58]/30 flex items-center justify-between text-xs font-parchment italic text-[#704f32]">
                        <span>Imparted under the {moon.name}</span>
                        <span className="font-cinzel text-[11px] text-[#4a2b13] font-bold">
                          — The Chamber's Keeper
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions of Right Page */}
            {writingState === 'completed' && (
              <div className="pt-4 border-t border-[#a88a58]/40 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={onOpenArchives}
                  className="flex items-center gap-1.5 text-xs font-cinzel font-semibold text-[#5a2e14] hover:text-[#8b6508] transition-colors"
                >
                  <BookmarkCheck className="w-4 h-4 text-[#8b6508]" />
                  <span>View in Grimoire Archives ({pastEntries.length})</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleWhisperBack}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded font-cinzel text-xs font-semibold bg-[#ebd8bb] hover:bg-[#dec49f] border border-[#a88a58] text-[#4a2b13] transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Whisper Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNewPage}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded font-cinzel text-xs font-bold bg-gradient-to-r from-[#124e33] to-[#0a2e1e] text-[#cbf5dd] hover:brightness-110 border border-[#2ecc71]/40 transition-colors shadow-sm cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Turn Page</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Outer leather binding stitch accent at bottom */}
        <div className="mt-4 pt-3 border-t border-[#442c18]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-[#a08b73] font-parchment gap-2 px-2">
          <div className="flex items-center gap-2">
            <span className="text-[#ffd700]">⚡</span>
            <span>Handbound with enchanted dragon hide & basilisk parchment</span>
          </div>
          <div className="text-[#c2ab90] italic">
            "Words are, in my not-so-humble opinion, our most inexhaustible source of magic."
          </div>
        </div>
      </div>
    </div>
  );
};
