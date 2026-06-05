"use client";

import {
  CHANNEL_LABELS,
  type ChannelToggles,
  type OutreachChannel,
} from "@/lib/clarity-theme";

const CHANNEL_ORDER: OutreachChannel[] = ["email", "linkedin", "whatsapp"];

export function ChannelToggleBar({
  channels,
  onToggle,
}: {
  channels: ChannelToggles;
  onToggle: (channel: OutreachChannel) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {CHANNEL_ORDER.map((channel) => {
        const included = channels[channel];
        const { label, description } = CHANNEL_LABELS[channel];
        return (
          <button
            key={channel}
            type="button"
            onClick={() => onToggle(channel)}
            className={`rounded-xl border p-4 text-left transition ${
              included
                ? "border-clarity-accent-active bg-clarity-accent-active/15 shadow-sm"
                : "border-clarity-border/50 bg-clarity-surface/60 opacity-75"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-clarity-ink">{label}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  included
                    ? "bg-clarity-accent-active/30 text-clarity-ink"
                    : "bg-clarity-border/30 text-clarity-muted"
                }`}
              >
                {included ? "Included" : "Excluded"}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-clarity-muted">{description}</p>
          </button>
        );
      })}
    </div>
  );
}
