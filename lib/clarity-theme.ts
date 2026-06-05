/** ClarityHQ brand context — visual tokens derived from Brand Context Protocol */
export const CLARITY_THEME = {
  access: {
    keyName: "Clarity Internal",
  },
  brand: {
    displayName: "ClarityHQ",
    id: "clarityhq",
  },
  colors: {
    background: "#F5F5F0",
    surface: "#FFFFFF",
    ink: "#1A1410",
    text: "#1C1C1C",
    muted: "#6B5C4E",
    secondary: "#B8A68A",
    accentSteel: "#8B9A9C",
    accentSage: "#A8B5A0",
    accentTerracotta: "#D4A59A",
    accentGold: "#D4AF37",
  },
  typography: {
    serif: "var(--font-clarity-serif)",
    sans: "var(--font-clarity-sans)",
  },
  logoUrl: "http://www.clarityhq.ai/assets/img/favicon.svg",
} as const;

export type OutreachChannel = "email" | "linkedin" | "whatsapp";

export type ChannelToggles = Record<OutreachChannel, boolean>;

export const DEFAULT_CHANNELS: ChannelToggles = {
  email: true,
  linkedin: true,
  whatsapp: false,
};

export const CHANNEL_LABELS: Record<
  OutreachChannel,
  { label: string; description: string }
> = {
  email: {
    label: "Email",
    description: "Inboxkit, Smartlead, and email touch points",
  },
  linkedin: {
    label: "LinkedIn",
    description: "HeyReach and LinkedIn touch points",
  },
  whatsapp: {
    label: "WhatsApp",
    description: "Interakt and WhatsApp messages",
  },
};

/** Tools gated by each outreach channel */
export const CHANNEL_TOOL_KEYS = {
  email: ["inboxkit", "smartlead", "apollo"] as const,
  linkedin: ["heyreach"] as const,
  whatsapp: ["interakt"] as const,
} as const;
