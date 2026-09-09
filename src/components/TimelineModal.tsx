import React, { useState } from 'react';
import { X, Calendar, Share2, Download, Check, ShieldCheck, ChevronRight, ChevronDown, Copy } from 'lucide-react';
import { TimelineEvent } from '../types';

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  jempId: string;
  events: TimelineEvent[];
  onCreateShareLink: (jempId: string) => Promise<string | null>;
}

export const TimelineModal: React.FC<TimelineModalProps> = ({
  isOpen,
  onClose,
  jempId,
  events,
  onCreateShareLink,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [expandedYear, setExpandedYear] = useState<number | null>(2026);
  const [expandedMonth, setExpandedMonth] = useState<string | null>('Sep');
  const [filterType, setFilterType] = useState<string>('ALL');

  if (!isOpen) return null;

  const handleShare = async () => {
    setIsGeneratingShare(true);
    try {
      const url = await onCreateShareLink(jempId);
      if (url) {
        setCopiedLink(url);
        navigator.clipboard.writeText(url).catch(() => {});
      }
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const downloadExport = (format: 'json' | 'md') => {
    let content = '';
    let mimeType = 'text/plain';
    let extension = 'txt';

    if (format === 'json') {
      content = JSON.stringify(events, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      content =
        `# JOBLESS EMPIRE PROOF-OF-WORK TIMELINE\n` +
        `**Identity:** ${jempId}\n` +
        `**Source of Truth:** despair.us\n` +
        `**Generated:** ${new Date().toISOString()}\n\n` +
        `---\n\n` +
        events
          .map(
            (e) =>
              `## [${new Date(e.occurredAt).toLocaleDateString()}] ${e.title}\n` +
              `*Classification: ${e.authorityClassification} | System: ${e.sourceSystem}*\n\n` +
              `> ${e.description}\n\n`
          )
          .join('\n');
      mimeType = 'text/markdown';
      extension = 'md';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jemp_timeline_${jempId.replace('#', '_')}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Group events by Year -> Month
  const filteredEvents =
    filterType === 'ALL' ? events : events.filter((e) => e.sourceSystem === filterType);

  const years: number[] = Array.from(
    new Set<number>(filteredEvents.map((e) => new Date(e.occurredAt).getFullYear()))
  ).sort((a, b) => b - a);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#121316] border border-zinc-800 w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 bg-[#0a0a0c] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800/80 text-white border border-zinc-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-base tracking-wide">
                  Proof-of-Work Timeline
                </h3>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/30">
                  {jempId}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Authoritative chronological ledger • Official verified events only
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              disabled={isGeneratingShare}
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedLink ? 'Link Copied' : '24h Public Link'}
            </button>

            <button
              onClick={() => downloadExport('md')}
              className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700"
            >
              <Download className="w-3.5 h-3.5" />
              MD
            </button>
            <button
              onClick={() => downloadExport('json')}
              className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700"
            >
              <Download className="w-3.5 h-3.5" />
              JSON
            </button>

            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-5 py-2.5 bg-[#16171b] border-b border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-zinc-400 font-medium mr-2">Filter Source:</span>
            {['ALL', 'MEMBERSHIP', 'PROJECT', 'BRAINSTORM', 'PAYROLL', 'ADMIN'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  filterType === type
                    ? 'bg-zinc-200 text-zinc-900 font-bold'
                    : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <span className="text-zinc-400 font-mono text-[11px] shrink-0">
            {filteredEvents.length} Official Records
          </span>
        </div>

        {/* Share Link Banner if active */}
        {copiedLink && (
          <div className="px-5 py-2.5 bg-emerald-950/40 border-b border-emerald-900/60 text-xs text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <Share2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-mono truncate">{copiedLink}</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-900/60 rounded text-emerald-300 shrink-0">
              Active for 24h
            </span>
          </div>
        )}

        {/* Body: Hierarchical Navigation (Year -> Month -> Events) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              No authoritative timeline records found for this filter.
            </div>
          ) : (
            years.map((year) => {
              const yearEvents = filteredEvents.filter(
                (e) => new Date(e.occurredAt).getFullYear() === year
              );
              const isYearOpen = expandedYear === year;

              return (
                <div key={year} className="space-y-3">
                  {/* Year Header Accordion */}
                  <button
                    onClick={() => setExpandedYear(isYearOpen ? null : year)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      {isYearOpen ? (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                      )}
                      <span className="font-bold text-white font-mono text-base">{year}</span>
                      <span className="text-xs text-zinc-400 font-mono">
                        ({yearEvents.length} events)
                      </span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
                      Authoritative Ledger
                    </span>
                  </button>

                  {/* Year Content */}
                  {isYearOpen && (
                    <div className="pl-4 sm:pl-6 border-l-2 border-zinc-800 space-y-4">
                      {yearEvents.map((evt) => {
                        const dateObj = new Date(evt.occurredAt);
                        const dateFormatted = dateObj.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });

                        return (
                          <div
                            key={evt.id}
                            className="p-4 rounded-lg bg-[#18191c] border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition-all shadow-sm"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-rose-400 font-semibold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40">
                                  {dateFormatted}
                                </span>
                                <h4 className="font-bold text-sm text-zinc-100">{evt.title}</h4>
                              </div>
                              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                {evt.authorityClassification}
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                              {evt.description}
                            </p>

                            <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                              <span>Source: [{evt.sourceSystem}]</span>
                              <span>ID: {evt.sourceEventId}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0a0c] border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>Official JEMP Institutional Memory • despair.us</span>
          <span className="font-mono text-[11px]">No inferred hours. Immutable proof of work.</span>
        </div>
      </div>
    </div>
  );
};
