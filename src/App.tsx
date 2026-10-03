import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { ChamberHeader } from './components/ChamberHeader';
import { JournalBook } from './components/JournalBook';
import { SpellbookArchives } from './components/SpellbookArchives';
import { ChamberLoreModal } from './components/ChamberLoreModal';
import { SparkleCanvas } from './components/SparkleCanvas';
import { GoogleAuthBanner } from './components/GoogleAuthBanner';
import { UnauthorizedDomainModal } from './components/UnauthorizedDomainModal';
import { FirestoreDiagnosticsModal } from './components/FirestoreDiagnosticsModal';
import { JournalEntry } from './types/journal';
import { INITIAL_SAMPLE_ENTRIES } from './data/sampleEntries';
import { enchantedAudio } from './utils/audio';
import {
  auth,
  testFirestoreConnection,
  loginWithGoogle,
  loginAsGuest,
  logoutUser,
  subscribeToUserEntries,
  saveEntryToFirestore,
  deleteEntryFromFirestore,
  toggleFavoriteInFirestore,
  syncAndMergeEntries,
} from './firebase';

const STORAGE_KEY = 'chamber_of_secrets_entries_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'inscribe' | 'archives' | 'lore'>('inscribe');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => enchantedAudio.getMuted());
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(false);
  const [isLoreOpen, setIsLoreOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showDomainModal, setShowDomainModal] = useState<boolean>(false);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState<boolean>(false);

  // Persistent entries fallback in localStorage
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

  // Verify connection to Firestore on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen for Firebase auth state changes and synchronize previous questions & answers with Firestore
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        setIsCloudSyncing(true);
        try {
          // Fetch previous questions and answers from Firestore and merge with any local entries
          const merged = await syncAndMergeEntries(user.uid, entries);
          setEntries(merged);
          setSyncMessage(
            `Restored ${merged.length} secret questions & diary answers from your previous login!`
          );
          setTimeout(() => setSyncMessage(null), 5000);
        } catch (err) {
          console.error('Error merging entries on login:', err);
        } finally {
          setIsCloudSyncing(false);
        }

        // Subscribe to real-time changes in Firestore
        const unsubscribeEntries = subscribeToUserEntries(user.uid, (cloudEntries) => {
          if (cloudEntries.length > 0) {
            setEntries(cloudEntries);
          }
        });

        return () => {
          unsubscribeEntries();
        };
      }
    });

    return () => unsubscribeAuth();
  }, [currentUser?.uid]);

  // Save entries to localStorage on changes as backup
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

  // Google Login Handler
  const handleGoogleLogin = async () => {
    try {
      setIsCloudSyncing(true);
      const user = await loginWithGoogle();
      enchantedAudio.playInkRevealChime();
      const merged = await syncAndMergeEntries(user.uid, entries);
      setEntries(merged);
      setSyncMessage(
        `Welcome, ${user.displayName || 'Seeker'}! Loaded ${merged.length} previous secrets and responses from Firestore.`
      );
      setTimeout(() => setSyncMessage(null), 6000);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setShowDomainModal(true);
      } else if (err?.code !== 'auth/popup-closed-by-user') {
        setSyncMessage(`Magical seal disrupted: ${err?.message || 'Login could not be completed'}`);
        setTimeout(() => setSyncMessage(null), 5000);
      }
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Guest Login Handler
  const handleGuestLogin = async () => {
    try {
      enchantedAudio.playQuillScratch();
      const guest = await loginAsGuest();
      setSyncMessage(`Entering as ${guest.displayName}. Your secrets are preserved in this sanctuary.`);
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      console.error('Guest login failed:', err);
      setSyncMessage('Guest sanctuary active locally.');
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  // Manual Sync trigger
  const handleManualSync = async () => {
    if (!currentUser) {
      setShowDiagnosticsModal(true);
      return;
    }
    try {
      setIsCloudSyncing(true);
      const merged = await syncAndMergeEntries(currentUser.uid, entries);
      setEntries(merged);
      setSyncMessage(`Vault synchronized! ${merged.length} entries up to date in Firestore.`);
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      console.error('Manual sync failed:', err);
      setSyncMessage(`Sync failed: ${err?.message || 'Check Firestore connection'}`);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Force sync all entries to Firestore
  const handleForceSyncAll = async () => {
    setIsCloudSyncing(true);
    let successCount = 0;
    let failError = '';

    for (const entry of entries) {
      const res = await saveEntryToFirestore(currentUser?.uid, entry);
      if (res.success) {
        successCount++;
      } else if (!failError && res.error) {
        failError = res.error;
      }
    }

    setIsCloudSyncing(false);
    if (successCount > 0) {
      setSyncMessage(`Successfully pushed ${successCount} secrets to Firestore!`);
    } else {
      setSyncMessage(`Firestore rejected write: ${failError || 'Requires authentication or check rules'}`);
    }
    setTimeout(() => setSyncMessage(null), 5000);
  };

  // Save new entry (both local and attempt cloud)
  const handleSaveEntry = async (newEntry: JournalEntry) => {
    setEntries((prev) => [newEntry, ...prev]);

    setIsCloudSyncing(true);
    try {
      const res = await saveEntryToFirestore(currentUser?.uid, newEntry);
      if (res.success) {
        setSyncMessage('✨ Inscribed into Firestore Cloud Vault!');
      } else {
        console.warn('Firestore write warning:', res.error);
        if (!currentUser) {
          setSyncMessage('Saved to local tome. (Sign in with Google to push to Firestore)');
        } else {
          setSyncMessage(`Saved locally. Firestore write: ${res.error}`);
        }
      }
    } catch (err: any) {
      console.error('Save to Firestore error:', err);
      setSyncMessage('Saved locally in your sanctuary.');
    } finally {
      setIsCloudSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (id: string) => {
    const target = entries.find((e) => e.id === id);
    if (!target) return;
    const newFav = !target.isFavorite;

    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isFavorite: newFav } : e))
    );

    if (currentUser) {
      try {
        await toggleFavoriteInFirestore(currentUser.uid, id, newFav);
      } catch (err) {
        console.error('Failed to update favorite in Firestore:', err);
      }
    }
  };

  // Delete entry
  const handleDeleteEntry = async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));

    if (currentUser) {
      try {
        await deleteEntryFromFirestore(currentUser.uid, id);
      } catch (err) {
        console.error('Failed to delete entry from Firestore:', err);
      }
    }
  };

  // Seed sample entries
  const handleSeedSamples = () => {
    setEntries(INITIAL_SAMPLE_ENTRIES);
    if (currentUser) {
      INITIAL_SAMPLE_ENTRIES.forEach((e) => {
        saveEntryToFirestore(currentUser.uid, e).catch(console.error);
      });
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden bg-[#0c0810] text-[#e8dfc8]">
      {/* Background Ambience Layer: Stone vignette + emerald & maroon mist */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#5a0c1a]/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-[#0a3a24]/18 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#3d240c]/12 blur-[160px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffd700_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Floating Sparkles and Wand Trail */}
      <SparkleCanvas />

      {/* Atmospheric Header with Firebase Sync */}
      <ChamberHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        isPrivacyMode={isPrivacyMode}
        onTogglePrivacy={() => setIsPrivacyMode(!isPrivacyMode)}
        totalEntriesCount={entries.length}
        onOpenLore={() => setIsLoreOpen(true)}
        currentUser={currentUser}
        onLoginGoogle={handleGoogleLogin}
        onLoginGuest={handleGuestLogin}
        onLogout={logoutUser}
        isCloudSyncing={isCloudSyncing}
      />

      {/* Google Login & Cloud Vault Status Banner */}
      <div className="relative z-10 pt-3">
        <GoogleAuthBanner
          currentUser={currentUser}
          onLoginGoogle={handleGoogleLogin}
          onLogout={logoutUser}
          totalEntries={entries.length}
          isSyncing={isCloudSyncing}
          onManualSync={handleManualSync}
          syncMessage={syncMessage}
          onOpenDiagnostics={() => setShowDiagnosticsModal(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center py-2 sm:py-4">
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
      <ChamberLoreModal isOpen={isLoreOpen} onClose={() => setIsLoreOpen(false)} />

      {/* Firestore Diagnostics & Status Modal */}
      <FirestoreDiagnosticsModal
        isOpen={showDiagnosticsModal}
        onClose={() => setShowDiagnosticsModal(false)}
        currentUser={currentUser}
        entries={entries}
        onSyncAll={handleForceSyncAll}
      />

      {/* Unauthorized Domain Guide Modal */}
      <UnauthorizedDomainModal
        isOpen={showDomainModal}
        onClose={() => setShowDomainModal(false)}
        onRetry={handleGoogleLogin}
      />

      {/* Atmospheric Footer */}
      <footer className="relative z-10 w-full border-t border-[#3d2a1b]/40 bg-[#0a060d]/90 py-3 px-4 text-center text-xs font-parchment text-[#a8937b]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[#ffd700]">⚜</span>
            <span>Chamber of Secrets • Bound in Sentient Enchantment</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#7d6b56]">
            <span>Firebase Firestore Synchronized</span>
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

