import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Send,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { testFirestoreWrite, saveEntryToFirestore } from '../firebase';
import { JournalEntry } from '../types/journal';
import { enchantedAudio } from '../utils/audio';

interface FirestoreDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  entries: JournalEntry[];
  onSyncAll: () => Promise<void>;
}

export const FirestoreDiagnosticsModal: React.FC<FirestoreDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  entries,
  onSyncAll,
}) => {
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success?: boolean;
    message?: string;
  }>({ tested: false });
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleTestWrite = async () => {
    setIsTesting(true);
    enchantedAudio.playQuillScratch();
    try {
      const res = await testFirestoreWrite();
      setTestResult({
        tested: true,
        success: res.success,
        message: res.message,
      });
      if (res.success) {
        enchantedAudio.playInkRevealChime();
      }
    } catch (err: any) {
      setTestResult({
        tested: true,
        success: false,
        message: err?.message || String(err),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePushAll = async () => {
    setIsSyncing(true);
    enchantedAudio.playInkRevealChime();
    await onSyncAll();
    setIsSyncing(false);
  };

  const firestoreDataUrl =
    'https://console.firebase.google.com/project/chamberofsecrets-a2f6a/firestore/databases/-default-/data';
  const firestoreRulesUrl =
    'https://console.firebase.google.com/project/chamberofsecrets-a2f6a/firestore/databases/-default-/rules';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-[#d4af37]/60 bg-[#160d1b] p-6 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_25px_rgba(212,175,55,0.25)] text-[#e8dfc8]">
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
        <div className="flex items-center gap-3 mb-5 border-b border-[#3e2b1d] pb-4">
          <div className="w-11 h-11 rounded-full border border-[#d4af37]/50 bg-[#25152b] flex items-center justify-center text-xl text-[#ffd700] shadow-inner shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cinzel text-xl font-bold text-[#ffd700] gold-glow flex items-center gap-2">
              Firestore Connection Diagnostics
            </h3>
            <p className="font-parchment text-xs text-[#baa78f]">
              Project: <span className="font-mono text-[#a8e6cf]">chamberofsecrets-a2f6a</span>
            </p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-4 font-parchment text-sm">
          {/* Item 1: Authentication status */}
          <div className="p-3.5 rounded-xl border border-[#3e2b1d] bg-[#1a1122] flex items-start justify-between gap-3">
            <div>
              <div className="font-cinzel text-xs font-semibold text-[#ffd700] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Wizard Authentication Status</span>
              </div>
              <p className="text-xs text-[#b8a791] mt-1">
                {currentUser ? (
                  <span className="text-[#a8e6cf]">
                    Authenticated as <strong>{currentUser.displayName || currentUser.email}</strong> (UID: {currentUser.uid.slice(0, 8)}...)
                  </span>
                ) : (
                  <span className="text-[#f39c12]">
                    Unauthenticated / Local Seeker mode. (Google Sign-In is required if your Firestore rules enforce authentication).
                  </span>
                )}
              </p>
            </div>
            <div className="shrink-0">
              {currentUser ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2ecc71]/20 text-[#2ecc71] border border-[#2ecc71]/40 font-semibold">
                  Signed In
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e67e22]/20 text-[#f39c12] border border-[#e67e22]/40 font-semibold">
                  Local Mode
                </span>
              )}
            </div>
          </div>

          {/* Item 2: Why data might not appear in Firestore Console */}
          <div className="p-4 rounded-xl border border-[#d4af37]/30 bg-[#201328]">
            <h4 className="font-cinzel text-xs font-bold text-[#ffd700] uppercase mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#ffd700]" />
              <span>Top 3 Reasons Information Isn't Appearing in Firestore</span>
            </h4>
            <ol className="list-decimal pl-5 space-y-2 text-xs text-[#c9b79f] leading-relaxed">
              <li>
                <strong>You were in Local Seeker mode:</strong> By default, secrets are preserved in your local browser sanctuary. Entries only upload to Firestore when you sign in or when Firestore allows guest writes.
              </li>
              <li>
                <strong>Firestore Security Rules blocked write:</strong> If your Firebase Console rules say <code className="text-[#ffd700]">allow read, write: if false;</code> or require <code className="text-[#ffd700]">request.auth != null</code> without signing in, Firestore rejects the write.
              </li>
              <li>
                <strong>Firestore database not created yet:</strong> Make sure you have clicked <em>"Create database"</em> in your Firebase Console under <strong>Firestore Database</strong>.
              </li>
            </ol>
          </div>

          {/* Item 3: Live Connection Test */}
          <div className="p-4 rounded-xl border border-[#3e2b1d] bg-[#1a1122]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <div className="font-cinzel text-xs font-semibold text-[#ffd700]">
                  Live Test: Write to Firestore Test Document
                </div>
                <p className="text-xs text-[#a08f7b]">
                  Sends a test ping to <code className="text-[#a8e6cf]">test/connection</code> in your Firestore database.
                </p>
              </div>
              <button
                onClick={handleTestWrite}
                disabled={isTesting}
                className="px-3.5 py-1.5 rounded-lg font-cinzel text-xs font-bold bg-[#d4af37] text-[#1c1106] hover:bg-[#ebd580] transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
              >
                {isTesting ? 'Testing...' : 'Test Firestore Write'}
              </button>
            </div>

            {testResult.tested && (
              <div
                className={`mt-3 p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'border-[#2ecc71]/40 bg-[#12281a] text-[#a8e6cf]'
                    : 'border-[#ff4444]/40 bg-[#2d1217] text-[#ffaaaa]'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-[#2ecc71] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#ff5555] shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">
                    {testResult.success ? 'Firestore Write Succeeded!' : 'Firestore Write Failed:'}
                  </div>
                  <div className="text-[11px] mt-0.5 font-mono break-all">{testResult.message}</div>
                </div>
              </div>
            )}
          </div>

          {/* Direct Firebase Console Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <a
              href={firestoreDataUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border border-[#3e2b1d] bg-[#140b19] hover:border-[#d4af37]/60 text-xs font-cinzel text-[#ffd700] transition-colors shadow-sm"
            >
              <span>View Data in Firebase Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={firestoreRulesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border border-[#3e2b1d] bg-[#140b19] hover:border-[#d4af37]/60 text-xs font-cinzel text-[#ffd700] transition-colors shadow-sm"
            >
              <span>Edit Rules in Firebase Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-[#3e2b1d] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handlePushAll}
            disabled={isSyncing || entries.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-cinzel text-xs font-bold bg-[#124e33] text-[#b4f5d1] hover:bg-[#1a6e48] border border-[#2ecc71]/40 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSyncing ? 'Syncing...' : `Force Sync All ${entries.length} Secrets to Firestore`}</span>
          </button>

          <button
            onClick={() => {
              enchantedAudio.playPageTurn();
              onClose();
            }}
            className="px-5 py-2 rounded-lg font-cinzel text-xs font-semibold bg-[#2a1b32] text-[#baa78f] hover:text-[#ffd700] border border-[#4a3422] transition-colors cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
