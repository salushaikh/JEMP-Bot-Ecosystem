import React from 'react';
import { ShieldCheck, Calendar, ExternalLink, ArrowLeft, Download, CheckCircle2 } from 'lucide-react';
import { Member, TimelineEvent } from '../types';

interface PublicShareViewProps {
  member: Member;
  events: TimelineEvent[];
  expiresAt: string;
  onBack?: () => void;
}

export const PublicShareView: React.FC<PublicShareViewProps> = ({
  member,
  events,
  expiresAt,
  onBack,
}) => {
  const expiresDate = new Date(expiresAt);
  const isExpired = expiresDate.getTime() < Date.now();

  return (
    <div className="min-h-screen bg-[#090a0c] text-zinc-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation / Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:text-white text-zinc-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white uppercase">
                  Jobless Empire
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-xs font-bold border border-rose-500/30">
                  despair.us
                </span>
              </div>
              <p className="text-xs text-zinc-400 tracking-wide">
                Authoritative Proof-of-Work Attestation Matrix
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-3 py-1.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Cryptographically Signed • Verified Identity
            </span>
          </div>
        </div>

        {/* Member Profile Banner */}
        <div className="p-6 rounded-xl bg-[#111215] border border-zinc-800 flex flex-wrap items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-xl font-bold text-white uppercase overflow-hidden">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.jempId}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                member.jempId?.slice(0, 4) || 'JEMP'
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide font-mono">
                  {member.jempId}
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                  {member.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Member of Jobless Empire Private Builder Collective • Timezone: {member.timezone || 'UTC'}
              </p>
              <div className="text-[11px] text-zinc-500 font-mono">
                Verified since {new Date(member.verifiedAt || member.joinedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 text-right">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
              Share Security Token
            </span>
            <span className="text-xs font-mono text-zinc-300">
              Valid until: {expiresDate.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500">
              Personal emails, discord handles, and private hashes redacted by protocol.
            </span>
          </div>
        </div>

        {/* Proof of Work Ledger */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              Verified Contribution History
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              {events.length} Authoritative Records
            </span>
          </div>

          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-5 rounded-xl bg-[#121316] border border-zinc-800 space-y-2 hover:border-zinc-700 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded border border-rose-900/40">
                      {new Date(event.occurredAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <h4 className="font-bold text-base text-zinc-100">{event.title}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {event.authorityClassification}
                  </span>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed pl-1">
                  {event.description}
                </p>

                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 font-mono">
                  <span>System: [{event.sourceSystem}]</span>
                  <span>Official Event: {event.eventId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-zinc-800 space-y-1 text-xs text-zinc-500">
          <p className="font-semibold text-zinc-400">
            JOBLESS DOESN'T MEAN USELESS. NO JOB. STILL BUILDING.
          </p>
          <p>
            Official verification issued by Jobless Empire (despair.us). This timeline is an immutable record of software contributions.
          </p>
        </div>
      </div>
    </div>
  );
};
