import React, { useState, useEffect } from 'react';
import { ChamberHeader } from './components/ChamberHeader';
import { JournalBook } from './components/JournalBook';
import { SpellbookArchives } from './components/SpellbookArchives';
import { ChamberLoreModal } from './components/ChamberLoreModal';
import { SparkleCanvas } from './components/SparkleCanvas';
import { JournalEntry } from './types/journal';
import { INITIAL_SAMPLE_ENTRIES } from './data/sampleEntries';
import { enchantedAudio } from './utils/audio';

const STORAGE_KEY = 'chamber_of_secrets_entries_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'inscribe' | 'archives' | 'lore'>('inscribe');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => enchantedAudio.getMuted());
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(false);
  const [isLoreOpen, setIsLoreOpen] = useState<boolean>(false);

  // Persistent entries in localStorage
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.error('Failed to load past entries from storage:', err);
      }
    }
    return INITIAL_SAMPLE_ENTRIES;
  });

  // Save entries to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (err) {
      console.error('Failed to save entries to storage:', err);
    }
  }, [entries]);

  // Audio mute handler
  const handleToggleAudio = () => {
    const newMuted = enchantedAudio.toggleMute();
    setIsAudioMuted(newMuted);
  };

  // Save new entry
  const handleSaveEntry = (newEntry: JournalEntry) => {
    setEntries((prev) => [newEntry, ...prev]);
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isFavorite: !e.isFavorite } : e))
    );
  };

  // Delete entry
  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Seed sample entries
  const handleSeedSamples = () => {
    setEntries(INITIAL_SAMPLE_ENTRIES);
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden bg-[#0c0810] text-[#e8dfc8]">
      {/* Background Ambience Layer: Stone vignette + emerald & maroon mist */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Deep maroon and emerald magical radial gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#5a0c1a]/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-[#0a3a24]/18 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#3d240c]/12 blur-[160px] pointer-events-none" />
        
        {/* Subtle gothic stone grid & noise overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffd700_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Floating Sparkles and Wand Trail */}
      <SparkleCanvas />

      {/* Atmospheric Header */}
      <ChamberHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        isPrivacyMode={isPrivacyMode}
        onTogglePrivacy={() => setIsPrivacyMode(!isPrivacyMode)}
        totalEntriesCount={entries.length}
        onOpenLore={() => setIsLoreOpen(true)}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center py-4 sm:py-6">
        {activeTab === 'inscribe' ? (
          <JournalBook
            onSaveEntry={handleSaveEntry}
            pastEntries={entries}
            isPrivacyMode={isPrivacyMode}
            onOpenArchives={() => {
              enchantedAudio.playPageTurn();
              setActiveTab('archives');
            }}
          />
        ) : (
          <SpellbookArchives
            entries={entries}
            onToggleFavorite={handleToggleFavorite}
            onDeleteEntry={handleDeleteEntry}
            onSelectEntry={() => {}}
            onBackToInscribe={() => {
              enchantedAudio.playPageTurn();
              setActiveTab('inscribe');
            }}
            isPrivacyMode={isPrivacyMode}
            onSeedSampleEntries={handleSeedSamples}
          />
        )}
      </main>

      {/* Lore & Grimoire Rules Modal */}
      <ChamberLoreModal
        isOpen={isLoreOpen}
        onClose={() => setIsLoreOpen(false)}
      />

      {/* Atmospheric Footer */}
      <footer className="relative z-10 w-full border-t border-[#3d2a1b]/40 bg-[#0a060d]/90 py-3 px-4 text-center text-xs font-parchment text-[#a8937b]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[#ffd700]">⚜</span>
            <span>Chamber of Secrets • Bound in Sentient Enchantment</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#7d6b56]">
            <span>Hogwarts Archive #7719</span>
            <span>•</span>
            <button
              onClick={() => {
                enchantedAudio.playInkRevealChime();
                setIsLoreOpen(true);
              }}
              className="hover:text-[#ffd700] underline cursor-pointer"
            >
              Spellbook Codex & Lore
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
