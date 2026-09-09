import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface EmbedData {
  color?: string; // hex string e.g. '#e11d48'
  title?: string;
  description?: string;
  fields?: EmbedField[];
  footer?: { text: string; iconUrl?: string };
  timestamp?: string;
  mentionUser?: string; // e.g. 'alex_builder'
}

export interface EmbedButton {
  id: string;
  label: string;
  style: 'primary' | 'secondary' | 'success' | 'danger';
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface DiscordEmbedViewProps {
  authorName?: string;
  authorTag?: string;
  authorAvatar?: string;
  isBot?: boolean;
  contentMention?: string;
  embed: EmbedData;
  buttons?: EmbedButton[];
  disappearingNotice?: string;
}

export const DiscordEmbedView: React.FC<DiscordEmbedViewProps> = ({
  authorName = 'JEMP Bot',
  authorTag = 'BOT',
  authorAvatar = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=80',
  isBot = true,
  contentMention,
  embed,
  buttons = [],
  disappearingNotice,
}) => {
  const getButtonStyle = (style: EmbedButton['style']) => {
    switch (style) {
      case 'primary':
        return 'bg-[#5865F2] hover:bg-[#4752C4] text-white';
      case 'success':
        return 'bg-[#248046] hover:bg-[#1a6334] text-white';
      case 'danger':
        return 'bg-[#DA373C] hover:bg-[#a1282c] text-white';
      case 'secondary':
      default:
        return 'bg-[#4E5058] hover:bg-[#6D6F78] text-white';
    }
  };

  const borderColor = embed.color || '#e11d48';

  return (
    <div className="flex gap-4 p-4 rounded-lg bg-[#18191c] hover:bg-[#1c1d22] transition-colors border border-[#2b2d31]">
      {/* Avatar */}
      <div className="shrink-0">
        <img
          src={authorAvatar}
          alt={authorName}
          className="w-10 h-10 rounded-full bg-zinc-800 object-cover border border-zinc-700"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header line */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white text-sm hover:underline cursor-pointer">
            {authorName}
          </span>
          {isBot && (
            <span className="bg-[#5865F2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              {authorTag}
            </span>
          )}
          <span className="text-zinc-400 text-xs">Today at 10:53 AM</span>

          {disappearingNotice && (
            <span className="ml-auto text-[11px] bg-rose-950/60 text-rose-300 border border-rose-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              ⏱️ {disappearingNotice}
            </span>
          )}
        </div>

        {/* Content Mention line */}
        {contentMention && (
          <div className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <span className="bg-[#5865F2]/20 text-[#8ea1e1] px-1.5 py-0.5 rounded font-mono text-xs border border-[#5865F2]/30">
              {contentMention}
            </span>
            <span className="text-xs text-zinc-400">— Action required to proceed</span>
          </div>
        )}

        {/* Embed Card */}
        <div
          className="rounded-md bg-[#1e1f22] p-4 space-y-3 max-w-2xl border-l-[4px] shadow-lg"
          style={{ borderLeftColor: borderColor }}
        >
          {embed.title && (
            <h4 className="text-base font-bold text-white tracking-wide flex items-center justify-between">
              {embed.title}
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
                despair.us
              </span>
            </h4>
          )}

          {embed.description && (
            <div className="text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {embed.description}
            </div>
          )}

          {embed.fields && embed.fields.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {embed.fields.map((field, idx) => (
                <div
                  key={idx}
                  className={`${
                    field.inline === false ? 'sm:col-span-2' : ''
                  } bg-[#2b2d31]/40 p-2.5 rounded border border-[#2b2d31]/60`}
                >
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    {field.name}
                  </div>
                  <div className="text-xs text-zinc-200 whitespace-pre-wrap leading-snug">
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {embed.footer && (
            <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80 flex items-center justify-between">
              <span>{embed.footer.text}</span>
              {embed.timestamp && <span>{embed.timestamp}</span>}
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        {buttons.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {buttons.map((btn) => (
              <button
                key={btn.id}
                id={btn.id}
                onClick={btn.onClick}
                disabled={btn.disabled}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${getButtonStyle(
                  btn.style
                )}`}
              >
                {btn.icon}
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
