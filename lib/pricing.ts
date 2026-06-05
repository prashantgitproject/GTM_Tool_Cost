import type { ChannelToggles } from "./clarity-theme";

/** USD per INR (approximate; override in UI if needed) */
export const DEFAULT_INR_TO_USD = 1 / 83;

export type { ChannelToggles };

export type BillingCycle = "monthly" | "annual";

export type VolumeInputs = {
  prospects: number;
  accountsPerProspect: number;
  /** Email touch points per account per month */
  emailsPerAccount: number;
  whatsappPerAccount: number;
  /** LinkedIn touch points per account per month (messages) */
  linkedinTouchPointsPerAccount: number;
  /** @deprecated Use linkedinTouchPointsPerAccount; kept for migration */
  linkedinDmsPerMonth?: number;
  /** @deprecated Use linkedinTouchPointsPerAccount; kept for migration */
  linkedinConnectionRequestsPerMonth?: number;
};

export type ToolToggles = {
  apollo: boolean;
  aiArk: boolean;
  freckle: boolean;
  inboxkit: boolean;
  smartlead: boolean;
  heyreach: boolean;
  interakt: boolean;
};

export type ApolloPlan = "free" | "basic" | "professional" | "organization";
export type AiArkTier =
  | "starter"
  | "builder-60k"
  | "builder-120k"
  | "builder-300k"
  | "scale-450k";
export type SmartleadPlan = "basic" | "pro" | "custom";
export type HeyReachPlan = "growth-1" | "growth-5" | "agency" | "unlimited";
export type InteraktPlan = "starter" | "growth" | "advanced";
export type InteraktMessageType =
  | "marketing"
  | "utility"
  | "authentication"
  | "service";

export type CalculatorConfig = {
  volume: VolumeInputs;
  tools: ToolToggles;
  channels: ChannelToggles;
  billing: BillingCycle;
  inrToUsd: number;
  apollo: {
    plan: ApolloPlan;
    seats: number;
  };
  aiArk: {
    tier: AiArkTier;
  };
  inboxkit: {
    pricePerMailbox: number;
  };
  smartlead: {
    plan: SmartleadPlan;
    includeWarmup: boolean;
  };
  heyreach: {
    plan: HeyReachPlan;
    sendersOverride: number | null;
    includeProxies: boolean;
    proxyCostPerSender: number;
  };
  interakt: {
    plan: InteraktPlan;
    messageType: InteraktMessageType;
  };
};

export type LineItem = {
  tool: string;
  label: string;
  amount: number;
  detail?: string;
  creditsUsed?: number;
  creditsIncluded?: number;
};

export type DerivedVolume = {
  totalAccounts: number;
  totalEmailsMonthly: number;
  totalWhatsappMonthly: number;
  totalLinkedinMessagesMonthly: number;
  aiArkCreditsPerCampaign: number;
  freckleCreditsPerCampaign: number;
  linkedinDmsPerMonth: number;
  linkedinConnectionRequestsPerMonth: number;
  heyreachSendersForDms: number;
  heyreachSendersForConnections: number;
  heyreachSendersNeeded: number;
  inboxkitMailboxesNeeded: number;
  inboxkitDomainsNeeded: number;
  apolloCreditsNeeded: number;
  /** Per-account usage cost (domain portion) */
  inboxkitDomainCostPerAccount: number;
  /** Per-account usage cost (inbox portion) */
  inboxkitInboxCostPerAccount: number;
};

const DAYS_PER_MONTH = 30;

/** Usage-based pricing constants */
export const USAGE_PRICING = {
  aiArk: {
    pricePerMonth: 49,
    creditsPerMonth: 5_000,
    creditsPerAccount: 0.5,
  },
  freckle: {
    pricePerMonth: 189,
    creditsPerMonth: 5_000,
    creditsPerAccount: 1,
  },
  inboxkit: {
    planPrice: 99,
    inboxesIncluded: 30,
    emailsPerInboxPerDay: 25,
    domainCostYearly: 14,
    emailsPerDomainPerDay: 100,
    inboxesPerDomain: 4,
  },
  smartlead: {
    pricePerMonth: 32,
    sendsPerMonth: 6_000,
  },
  heyreach: {
    pricePerSender: 79,
    messagesPerSenderPerDay: 200,
  },
} as const;

/** Safe cold-email capacity per Inboxkit mailbox (legacy display) */
export const EMAILS_PER_MAILBOX_PER_DAY =
  USAGE_PRICING.inboxkit.emailsPerInboxPerDay;
/** Max LinkedIn messages per month per sender profile */
export const LINKEDIN_MONTHLY_INPUT_CAP =
  USAGE_PRICING.heyreach.messagesPerSenderPerDay * DAYS_PER_MONTH;
/** LinkedIn platform max messages per sender profile per day */
export const LINKEDIN_DM_DAILY_CAP =
  USAGE_PRICING.heyreach.messagesPerSenderPerDay;
/** LinkedIn safe max connection requests per sender profile per day */
export const LINKEDIN_CONNECTION_DAILY_CAP = 20;
/** Per-sender monthly capacity derived from daily limits */
export const LINKEDIN_DM_MONTHLY_PER_SENDER =
  LINKEDIN_DM_DAILY_CAP * DAYS_PER_MONTH;
export const LINKEDIN_CONNECTION_MONTHLY_PER_SENDER =
  LINKEDIN_CONNECTION_DAILY_CAP * DAYS_PER_MONTH;
const MAILBOXES_PER_DOMAIN = USAGE_PRICING.inboxkit.inboxesPerDomain;

const APOLLO_MONTHLY: Record<ApolloPlan, number> = {
  free: 0,
  basic: 59,
  professional: 99,
  organization: 149,
};

const APOLLO_ANNUAL: Record<ApolloPlan, number> = {
  free: 0,
  basic: 49,
  professional: 79,
  organization: 119,
};

const APOLLO_CREDITS: Record<ApolloPlan, number> = {
  free: 100,
  basic: 5000,
  professional: 10000,
  organization: 15000,
};

export const AI_ARK_MONTHLY: Record<AiArkTier, { price: number; credits: number }> = {
  starter: { price: 49, credits: 30_000 },
  "builder-60k": { price: 99, credits: 60_000 },
  "builder-120k": { price: 149, credits: 120_000 },
  "builder-300k": { price: 249, credits: 300_000 },
  "scale-450k": { price: 399, credits: 450_000 },
};

const SMARTLEAD_MONTHLY: Record<SmartleadPlan, number> = {
  basic: 39,
  pro: 79,
  custom: 94,
};

const SMARTLEAD_LEAD_LIMIT: Record<SmartleadPlan, number> = {
  basic: 2000,
  pro: 30_000,
  custom: Infinity,
};

const SMARTLEAD_SEND_LIMIT: Record<SmartleadPlan, number> = {
  basic: 6000,
  pro: Infinity,
  custom: Infinity,
};

const INTERAKT_INR_MONTHLY: Record<InteraktPlan, number> = {
  starter: 999,
  growth: 2799,
  advanced: 3799,
};

const INTERAKT_INR_PER_MESSAGE: Record<InteraktMessageType, number> = {
  marketing: 0.9,
  utility: 0.15,
  authentication: 0.12,
  service: 0,
};

/** AI Ark: (accounts × 0.5) / 5000 × $49 */
export function calculateAiArkUsageCost(accounts: number): number {
  const { creditsPerAccount, creditsPerMonth, pricePerMonth } =
    USAGE_PRICING.aiArk;
  return ((accounts * creditsPerAccount) / creditsPerMonth) * pricePerMonth;
}

/** Freckle: (accounts × 1) / 5000 × $189 */
export function calculateFreckleUsageCost(accounts: number): number {
  const { creditsPerAccount, creditsPerMonth, pricePerMonth } =
    USAGE_PRICING.freckle;
  return ((accounts * creditsPerAccount) / creditsPerMonth) * pricePerMonth;
}

/**
 * Domain: ($14/12)/mo × accounts / accountsPerDomain
 * At 4 email touch points: 100 emails/domain/day × 30 days ÷ 4 = 750 accounts/domain
 * e.g. 100 accounts → (14/12) × 100/750 ≈ $0.16/mo
 */
export function calculateInboxkitDomainCost(
  accounts: number,
  emailTouchPoints: number,
): number {
  if (emailTouchPoints <= 0 || accounts <= 0) return 0;
  const { domainCostYearly, emailsPerDomainPerDay } = USAGE_PRICING.inboxkit;
  const domainCostMonthly = domainCostYearly / 12;
  const emailsPerDomainPerMonth = emailsPerDomainPerDay * DAYS_PER_MONTH;
  const accountsPerDomain = emailsPerDomainPerMonth / emailTouchPoints;
  return domainCostMonthly * (accounts / accountsPerDomain);
}

export function calculateInboxkitDomainCostPerAccount(
  emailTouchPoints: number,
): number {
  return calculateInboxkitDomainCost(1, emailTouchPoints);
}

/** Inbox: $99/30 inboxes, 25 emails/inbox/day → accounts covered per inbox */
export function calculateInboxkitInboxCostPerAccount(
  emailTouchPoints: number,
): number {
  if (emailTouchPoints <= 0) return 0;
  const { planPrice, inboxesIncluded, emailsPerInboxPerDay } =
    USAGE_PRICING.inboxkit;
  const inboxCostMonthly = planPrice / inboxesIncluded;
  const emailsPerInboxPerMonth = emailsPerInboxPerDay * DAYS_PER_MONTH;
  const accountsPerInbox = emailsPerInboxPerMonth / emailTouchPoints;
  return inboxCostMonthly / accountsPerInbox;
}

export function calculateInboxkitUsageCost(
  accounts: number,
  emailTouchPoints: number,
): { domain: number; inbox: number; total: number } {
  const domain = calculateInboxkitDomainCost(accounts, emailTouchPoints);
  const inboxPerAccount = calculateInboxkitInboxCostPerAccount(emailTouchPoints);
  const inbox = accounts * inboxPerAccount;
  return { domain, inbox, total: domain + inbox };
}

/** Smartlead: $32 / 6000 sends × total emails */
export function calculateSmartleadUsageCost(
  accounts: number,
  emailTouchPoints: number,
): number {
  if (emailTouchPoints <= 0) return 0;
  const { pricePerMonth, sendsPerMonth } = USAGE_PRICING.smartlead;
  const totalEmails = accounts * emailTouchPoints;
  return (pricePerMonth / sendsPerMonth) * totalEmails;
}

/** HeyReach: $79/sender, 200 msgs/day → accounts covered per sender */
export function calculateHeyReachUsageCost(
  accounts: number,
  linkedinTouchPoints: number,
): number {
  if (linkedinTouchPoints <= 0) return 0;
  const { pricePerSender, messagesPerSenderPerDay } = USAGE_PRICING.heyreach;
  const messagesPerSenderPerMonth = messagesPerSenderPerDay * DAYS_PER_MONTH;
  const accountsPerSender = messagesPerSenderPerMonth / linkedinTouchPoints;
  return (pricePerSender / accountsPerSender) * accounts;
}

export function capLinkedinMonthlyVolume(value: number): number {
  return Math.min(LINKEDIN_MONTHLY_INPUT_CAP, Math.max(0, value));
}

/** Mailboxes from total email volume. */
export function computeInboxkitMailboxes(totalEmailsMonthly: number): number {
  if (totalEmailsMonthly <= 0) return 0;
  const emailsPerInboxPerMonth =
    USAGE_PRICING.inboxkit.emailsPerInboxPerDay * DAYS_PER_MONTH;
  return Math.ceil(totalEmailsMonthly / emailsPerInboxPerMonth);
}

export function deriveVolume(volume: VolumeInputs): DerivedVolume {
  const {
    prospects,
    accountsPerProspect,
    emailsPerAccount,
    whatsappPerAccount,
    linkedinTouchPointsPerAccount,
  } = volume;

  const totalAccounts = prospects * accountsPerProspect;
  const totalEmailsMonthly = totalAccounts * emailsPerAccount;
  const totalWhatsappMonthly = totalAccounts * whatsappPerAccount;
  const totalLinkedinMessagesMonthly =
    totalAccounts * linkedinTouchPointsPerAccount;

  const aiArkCreditsPerCampaign =
    totalAccounts * USAGE_PRICING.aiArk.creditsPerAccount;
  const freckleCreditsPerCampaign =
    totalAccounts * USAGE_PRICING.freckle.creditsPerAccount;

  const linkedinDmsPerMonthCapped = capLinkedinMonthlyVolume(
    totalLinkedinMessagesMonthly,
  );
  const linkedinConnectionRequestsPerMonthCapped = 0;

  const heyreachSendersForDms =
    linkedinTouchPointsPerAccount > 0 && totalAccounts > 0
      ? Math.max(
          1,
          Math.ceil(
            linkedinDmsPerMonthCapped / LINKEDIN_DM_MONTHLY_PER_SENDER,
          ),
        )
      : 0;
  const heyreachSendersForConnections = 0;

  const heyreachSendersNeeded = heyreachSendersForDms;

  const inboxkitMailboxesNeeded = computeInboxkitMailboxes(totalEmailsMonthly);
  const inboxkitDomainsNeeded =
    inboxkitMailboxesNeeded > 0
      ? Math.ceil(inboxkitMailboxesNeeded / MAILBOXES_PER_DOMAIN)
      : 0;

  const apolloCreditsNeeded = totalEmailsMonthly;

  const inboxkitDomainCostPerAccount =
    calculateInboxkitDomainCostPerAccount(emailsPerAccount);
  const inboxkitInboxCostPerAccount =
    calculateInboxkitInboxCostPerAccount(emailsPerAccount);

  return {
    totalAccounts,
    totalEmailsMonthly,
    totalWhatsappMonthly,
    totalLinkedinMessagesMonthly,
    aiArkCreditsPerCampaign,
    freckleCreditsPerCampaign,
    linkedinDmsPerMonth: linkedinDmsPerMonthCapped,
    linkedinConnectionRequestsPerMonth:
      linkedinConnectionRequestsPerMonthCapped,
    heyreachSendersForDms,
    heyreachSendersForConnections,
    heyreachSendersNeeded,
    inboxkitMailboxesNeeded,
    inboxkitDomainsNeeded,
    apolloCreditsNeeded,
    inboxkitDomainCostPerAccount,
    inboxkitInboxCostPerAccount,
  };
}

export function suggestApolloPlan(credits: number): ApolloPlan {
  if (credits <= APOLLO_CREDITS.free) return "free";
  if (credits <= APOLLO_CREDITS.basic) return "basic";
  if (credits <= APOLLO_CREDITS.professional) return "professional";
  return "organization";
}

export function suggestAiArkTier(credits: number): AiArkTier {
  if (credits <= 30_000) return "starter";
  if (credits <= 60_000) return "builder-60k";
  if (credits <= 120_000) return "builder-120k";
  if (credits <= 300_000) return "builder-300k";
  return "scale-450k";
}

export function suggestSmartleadPlan(
  activeLeads: number,
  monthlySends: number,
): SmartleadPlan {
  if (activeLeads <= SMARTLEAD_LEAD_LIMIT.basic && monthlySends <= SMARTLEAD_SEND_LIMIT.basic) {
    return "basic";
  }
  if (activeLeads <= SMARTLEAD_LEAD_LIMIT.pro) {
    return "pro";
  }
  return "custom";
}

export function suggestHeyReachPlan(senders: number): HeyReachPlan {
  if (senders <= 1) return "growth-1";
  if (senders <= 5) return "growth-5";
  if (senders <= 50) return "agency";
  return "unlimited";
}

function applyAnnualDiscount(monthlyPrice: number, discount: number): number {
  return monthlyPrice * (1 - discount);
}

/** Zero out touch points for excluded channels while preserving stored inputs */
export function applyChannelVolume(
  volume: VolumeInputs,
  channels: ChannelToggles,
): VolumeInputs {
  return {
    ...volume,
    emailsPerAccount: channels.email ? volume.emailsPerAccount : 0,
    linkedinTouchPointsPerAccount: channels.linkedin
      ? volume.linkedinTouchPointsPerAccount
      : 0,
    whatsappPerAccount: channels.whatsapp ? volume.whatsappPerAccount : 0,
  };
}

function channelIncludesTool(
  tool: keyof ToolToggles,
  channels: ChannelToggles,
): boolean {
  if (tool === "apollo" || tool === "inboxkit" || tool === "smartlead") {
    return channels.email;
  }
  if (tool === "heyreach") return channels.linkedin;
  if (tool === "interakt") return channels.whatsapp;
  return true;
}

function toolEnabled(
  config: CalculatorConfig,
  tool: keyof ToolToggles,
): boolean {
  return config.tools[tool] && channelIncludesTool(tool, config.channels);
}

export function calculateCosts(config: CalculatorConfig): {
  derived: DerivedVolume;
  lineItems: LineItem[];
  totalMonthlyUsd: number;
  warnings: string[];
} {
  const effectiveVolume = applyChannelVolume(config.volume, config.channels);
  const derived = deriveVolume(effectiveVolume);
  const lineItems: LineItem[] = [];
  const warnings: string[] = [];
  const isAnnual = config.billing === "annual";
  const { totalAccounts, emailsPerAccount: emailTouchPoints } = {
    totalAccounts: derived.totalAccounts,
    emailsPerAccount: effectiveVolume.emailsPerAccount,
  };
  const linkedinTouchPoints = effectiveVolume.linkedinTouchPointsPerAccount;

  if (toolEnabled(config, "apollo")) {
    const priceTable = isAnnual ? APOLLO_ANNUAL : APOLLO_MONTHLY;
    let seats = Math.max(1, config.apollo.seats);
    if (config.apollo.plan === "organization") {
      seats = Math.max(3, seats);
    }
    const perSeat = priceTable[config.apollo.plan];
    const subtotal = perSeat * seats;
    const creditLimit = APOLLO_CREDITS[config.apollo.plan];
    if (derived.apolloCreditsNeeded > creditLimit) {
      warnings.push(
        `Apollo ${config.apollo.plan} includes ${creditLimit.toLocaleString()} credits/mo; you need ~${derived.apolloCreditsNeeded.toLocaleString()} (emails).`,
      );
    }
    lineItems.push({
      tool: "Apollo.io",
      label: `${config.apollo.plan} × ${seats} seat(s)`,
      amount: subtotal,
      detail: isAnnual ? "Billed annually (per-seat/mo rate)" : "Billed monthly",
    });
  }

  if (toolEnabled(config, "aiArk")) {
    const usageCost = calculateAiArkUsageCost(totalAccounts);
    const { creditsPerMonth, creditsPerAccount } = USAGE_PRICING.aiArk;
    lineItems.push({
      tool: "AI Ark",
      label: `${totalAccounts.toLocaleString()} account(s)`,
      amount: usageCost,
      detail: `${creditsPerAccount} credit/account · $49/mo per 5,000 credits`,
      creditsUsed: derived.aiArkCreditsPerCampaign,
      creditsIncluded: creditsPerMonth,
    });
  }

  if (toolEnabled(config, "freckle")) {
    const usageCost = calculateFreckleUsageCost(totalAccounts);
    const { creditsPerMonth, creditsPerAccount } = USAGE_PRICING.freckle;
    lineItems.push({
      tool: "Freckle",
      label: `${totalAccounts.toLocaleString()} enrichment(s)`,
      amount: usageCost,
      detail: `${creditsPerAccount} credit/enrichment · $189/mo per 5,000 credits`,
      creditsUsed: derived.freckleCreditsPerCampaign,
      creditsIncluded: creditsPerMonth,
    });
  }

  if (toolEnabled(config, "inboxkit")) {
    const { domain, inbox, total } = calculateInboxkitUsageCost(
      totalAccounts,
      emailTouchPoints,
    );
    const accountsPerDomain =
      (USAGE_PRICING.inboxkit.emailsPerDomainPerDay * DAYS_PER_MONTH) /
      emailTouchPoints;
    lineItems.push({
      tool: "Inboxkit",
      label: `Domain (${totalAccounts.toLocaleString()} accounts)`,
      amount: domain,
      detail: `($${USAGE_PRICING.inboxkit.domainCostYearly}/12)/mo × ${totalAccounts}/${Math.round(accountsPerDomain)} accounts/domain`,
    });
    lineItems.push({
      tool: "Inboxkit",
      label: `Inboxes (${emailTouchPoints} email touch pts)`,
      amount: inbox,
      detail: `$99/30 inboxes · 25 emails/inbox/day · ${(USAGE_PRICING.inboxkit.emailsPerInboxPerDay * DAYS_PER_MONTH) / emailTouchPoints} accounts/inbox`,
    });
    if (total === 0 && totalAccounts > 0) {
      lineItems.pop();
      lineItems.pop();
    }
  }

  if (toolEnabled(config, "smartlead")) {
    const usageCost = calculateSmartleadUsageCost(totalAccounts, emailTouchPoints);
    const totalSends = totalAccounts * emailTouchPoints;
    lineItems.push({
      tool: "Smartlead",
      label: `${totalSends.toLocaleString()} sends`,
      amount: usageCost,
      detail: `$32/mo per 6,000 sends · ${emailTouchPoints} touch pt(s)/account`,
    });
    if (config.smartlead.includeWarmup) {
      lineItems.push({
        tool: "Smartlead",
        label: "AI Warmup Pool add-on",
        amount: 59,
      });
    }
  }

  if (toolEnabled(config, "heyreach")) {
    const usageCost = calculateHeyReachUsageCost(
      totalAccounts,
      linkedinTouchPoints,
    );
    const accountsPerSender =
      linkedinTouchPoints > 0
        ? (USAGE_PRICING.heyreach.messagesPerSenderPerDay * DAYS_PER_MONTH) /
          linkedinTouchPoints
        : 0;
    lineItems.push({
      tool: "HeyReach",
      label: `${derived.totalLinkedinMessagesMonthly.toLocaleString()} LinkedIn message(s)`,
      amount: usageCost,
      detail: `$79/sender · 200 msgs/day · ${Math.round(accountsPerSender)} accounts/sender · ${linkedinTouchPoints} touch pt(s)/account`,
    });

    if (config.heyreach.includeProxies && linkedinTouchPoints > 0) {
      const senders = derived.heyreachSendersNeeded;
      const proxyCost = senders * config.heyreach.proxyCostPerSender;
      lineItems.push({
        tool: "HeyReach",
        label: `Residential proxies (${senders} account(s))`,
        amount: proxyCost,
        detail: `$${config.heyreach.proxyCostPerSender}/account/mo`,
      });
    }
  }

  if (toolEnabled(config, "interakt")) {
    const inrBase = INTERAKT_INR_MONTHLY[config.interakt.plan];
    const baseUsd = inrBase * config.inrToUsd;
    const inrPerMsg = INTERAKT_INR_PER_MESSAGE[config.interakt.messageType];
    const msgUsd =
      derived.totalWhatsappMonthly * inrPerMsg * config.inrToUsd;

    lineItems.push({
      tool: "Interakt",
      label: `${config.interakt.plan} subscription`,
      amount: baseUsd,
      detail: `₹${inrBase.toLocaleString()}/mo`,
    });
    if (derived.totalWhatsappMonthly > 0 && inrPerMsg > 0) {
      lineItems.push({
        tool: "Interakt",
        label: `${config.interakt.messageType} messages (${derived.totalWhatsappMonthly.toLocaleString()})`,
        amount: msgUsd,
        detail: `₹${inrPerMsg}/conversation`,
      });
    }
  }

  const totalMonthlyUsd = lineItems.reduce((sum, item) => sum + item.amount, 0);

  return { derived, lineItems, totalMonthlyUsd, warnings };
}

export const TOOL_LABELS = {
  apollo: "Apollo.io",
  aiArk: "AI Ark",
  freckle: "Freckle",
  inboxkit: "Inboxkit",
  smartlead: "Smartlead",
  heyreach: "HeyReach",
  interakt: "Interakt (WhatsApp)",
} as const;
