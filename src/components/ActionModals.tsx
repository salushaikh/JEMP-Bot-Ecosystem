import React, { useState } from 'react';
import { X, ShieldCheck, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, timezone: string, resumeFileName: string) => Promise<void>;
  defaultEmail?: string;
  isSubmitting: boolean;
  errorMessage?: string;
}

export const VerifyModal: React.FC<VerifyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultEmail = 'alex.builder@despair.us',
  isSubmitting,
  errorMessage,
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [timezone, setTimezone] = useState('UTC-5 (EST)');
  const [resumeFileName, setResumeFileName] = useState('alex_vance_cv_2026.pdf');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1e1f22] border border-zinc-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-[#111214] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm tracking-wide">
                Whitelist Email Authentication
              </h3>
              <p className="text-xs text-zinc-400">JEMP Automated Discord Onboarding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs sm:text-sm">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-zinc-300 font-semibold uppercase text-[11px] tracking-wider">
              Application Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex.builder@despair.us"
              className="w-full bg-[#2b2d31] border border-zinc-700 rounded-md px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
              required
            />
            <p className="text-[11px] text-zinc-400">
              Must match the email pre-approved by the despair.us application administrator.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-zinc-300 font-semibold uppercase text-[11px] tracking-wider">
              Primary Timezone <span className="text-rose-500">*</span>
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-[#2b2d31] border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-rose-500"
            >
              <option value="UTC-8 (PST)">UTC-8 (PST / Pacific)</option>
              <option value="UTC-5 (EST)">UTC-5 (EST / Eastern)</option>
              <option value="UTC (GMT)">UTC (GMT / London)</option>
              <option value="UTC+1 (CET)">UTC+1 (CET / Berlin)</option>
              <option value="UTC+5:30 (IST)">UTC+5:30 (IST / India)</option>
              <option value="UTC+9 (JST)">UTC+9 (JST / Tokyo)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-zinc-300 font-semibold uppercase text-[11px] tracking-wider">
              Resume / Portfolio Document Reference
            </label>
            <input
              type="text"
              value={resumeFileName}
              onChange={(e) => setResumeFileName(e.target.value)}
              placeholder="alex_vance_cv_2026.pdf"
              className="w-full bg-[#2b2d31] border border-zinc-700 rounded-md px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
            />
            <p className="text-[11px] text-zinc-400">
              Only recorded into your Profile/HR system after email is authenticated.
            </p>
          </div>

          <div className="bg-[#111214] p-3 rounded-md border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
            <div className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Automated Execution Guarantee
            </div>
            <p>
              Upon successful verification, the one-use card in #verify-me will self-destruct,
              your permanent sequential <strong>JEMP#</strong> will be assigned, and your Discord role
              will synchronize to <strong>@Member</strong>.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#111214] border-t border-zinc-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(email, timezone, resumeFileName)}
            disabled={isSubmitting || !email.trim()}
            className="px-5 py-2 rounded text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-rose-950/40"
          >
            {isSubmitting ? (
              <>Verifying Whitelist...</>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Authenticate & Activate JEMP#
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
