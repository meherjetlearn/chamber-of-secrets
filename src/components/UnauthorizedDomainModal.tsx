import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';
import { enchantedAudio } from '../utils/audio';

interface UnauthorizedDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export const UnauthorizedDomainModal: React.FC<UnauthorizedDomainModalProps> = ({
  isOpen,
  onClose,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseSettingsUrl =
    'https://console.firebase.google.com/project/chamberofsecrets-a2f6a/authentication/settings';

  if (!isOpen) return null;

  const handleCopy = () => {
    enchantedAudio.playQuillScratch();
    navigator.clipboard.writeText(currentHostname);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border-2 border-[#d4af37]/60 bg-[#160d1b] p-6 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_25px_rgba(212,175,55,0.25)] text-[#e8dfc8]">
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

        {/* Title */}
        <div className="flex items-center gap-3 mb-4 border-b border-[#3e2b1d] pb-3">
          <div className="w-10 h-10 rounded-full border border-[#e67e22]/50 bg-[#2d1608] flex items-center justify-center text-xl text-[#e67e22] shadow-inner shrink-0">
            <ShieldAlert className="w-5 h-5 text-[#f39c12]" />
          </div>
          <div>
            <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#ffd700] gold-glow">
              Authorize Domain in Firebase
            </h3>
            <p className="font-parchment text-xs text-[#baa78f]">
              Firebase requires new web domains to be allowlisted for Google Sign-In.
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4 font-parchment text-sm text-[#ded4c1] leading-relaxed">
          <p>
            Your Firebase project (<code className="px-1.5 py-0.5 rounded bg-[#2b172d] text-[#ffd700] font-mono text-xs">chamberofsecrets-a2f6a</code>)
            has not yet added this app's preview domain to its Authorized Domains list.
          </p>

          <div className="p-3.5 rounded-xl border border-[#d4af37]/30 bg-[#1e1224] space-y-2">
            <div className="text-xs font-cinzel font-semibold text-[#ffd700]">
              Step 1: Copy this domain
            </div>
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#110915] border border-[#4a3422]">
              <code className="text-xs text-[#a8e6cf] font-mono select-all truncate">
                {currentHostname}
              </code>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#2c1a35] hover:bg-[#3c2548] border border-[#d4af37]/40 text-xs text-[#ffd700] font-cinzel transition-all shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#2ecc71]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[#d4af37]/30 bg-[#1e1224] space-y-2">
            <div className="text-xs font-cinzel font-semibold text-[#ffd700]">
              Step 2: Add to Firebase Console
            </div>
            <p className="text-xs text-[#b8a791]">
              Go to Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains, and click <strong>Add domain</strong>:
            </p>
            <a
              href={firebaseSettingsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#271911] hover:bg-[#3d2719] border border-[#d4af37]/50 text-xs text-[#ffd700] font-cinzel font-semibold transition-all shadow-sm"
            >
              <span>Open Firebase Auth Settings</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-3 rounded-lg bg-[#14281c] border border-[#2ecc71]/40 text-xs text-[#a8e6cf] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2ecc71] shrink-0" />
            <span>
              Your secrets are completely safe! They are stored in your browser's enchanted sanctuary until the domain is authorized.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-[#3e2b1d] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              enchantedAudio.playPageTurn();
              onClose();
            }}
            className="px-4 py-2 rounded-lg border border-[#4a3422] bg-[#221528] text-xs font-cinzel text-[#baa78f] hover:text-[#ffd700] transition-colors cursor-pointer"
          >
            Continue in Local Mode
          </button>

          <button
            onClick={() => {
              onClose();
              onRetry();
            }}
            className="px-5 py-2 rounded-lg font-cinzel text-xs font-bold bg-gradient-to-r from-[#d4af37] to-[#aa8022] text-[#1c1106] hover:brightness-110 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
          >
            I've Added It • Try Again
          </button>
        </div>
      </div>
    </div>
  );
};
