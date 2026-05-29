/** USD per INR (approximate; override in UI if needed) */
export const DEFAULT_INR_TO_USD = 1 / 83;

export type BillingCycle = "monthly" | "annual";

export type VolumeInputs = {
  prospects: number;
  accountsPerProspect: number;
  emailsPerAccount: number;
  whatsappPerAccount: number;
  linkedinDmsPerDay: number;
};

export type ToolToggles = {
  apollo: boolean;
  aiArk: boolean;
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
    mailboxesOverride: number | null;
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
};

export type DerivedVolume = {
  totalAccounts: number;
  totalEmailsMonthly: number;
  totalWhatsappMonthly: number;
  linkedinDmsPerDayCapped: number;
  totalLinkedinDmsDaily: number;
  heyreachSendersNeeded: number;
  inboxkitMailboxesNeeded: number;
  inboxkitDomainsNeeded: number;
  apolloCreditsNeeded: number;
};

const EMAILS_PER_MAILBOX_PER_DAY = 20;
const HEYREACH_DM_CAP_PER_SENDER = 20;
const MAILBOXES_PER_DOMAIN = 5;

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

const AI_ARK_MONTHLY: Record<AiArkTier, { price: number; credits: number }> = {
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

export function deriveVolume(volume: VolumeInputs): DerivedVolume {
  const {
    prospects,
    accountsPerProspect,
    emailsPerAccount,
    whatsappPerAccount,
    linkedinDmsPerDay,
  } = volume;

  const totalAccounts = prospects * accountsPerProspect;
  const totalEmailsMonthly = totalAccounts * emailsPerAccount;
  const totalWhatsappMonthly = totalAccounts * whatsappPerAccount;
  const linkedinDmsPerDayCapped = Math.min(
    Math.max(0, linkedinDmsPerDay),
    HEYREACH_DM_CAP_PER_SENDER,
  );
  const totalLinkedinDmsDaily =
    totalAccounts * linkedinDmsPerDayCapped;
  const heyreachSendersNeeded =
    linkedinDmsPerDayCapped > 0
      ? Math.max(1, Math.ceil(totalLinkedinDmsDaily / HEYREACH_DM_CAP_PER_SENDER))
      : 0;

  const emailsPerDay = totalEmailsMonthly / 30;
  const inboxkitMailboxesNeeded =
    totalEmailsMonthly > 0
      ? Math.max(1, Math.ceil(emailsPerDay / EMAILS_PER_MAILBOX_PER_DAY))
      : 0;
  const inboxkitDomainsNeeded =
    inboxkitMailboxesNeeded > 0
      ? Math.ceil(inboxkitMailboxesNeeded / MAILBOXES_PER_DOMAIN)
      : 0;

  const apolloCreditsNeeded = totalEmailsMonthly;

  return {
    totalAccounts,
    totalEmailsMonthly,
    totalWhatsappMonthly,
    linkedinDmsPerDayCapped,
    totalLinkedinDmsDaily,
    heyreachSendersNeeded,
    inboxkitMailboxesNeeded,
    inboxkitDomainsNeeded,
    apolloCreditsNeeded,
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

function annualMonthlyEquivalent(monthly: number): number {
  return monthly;
}

function applyAnnualDiscount(monthlyPrice: number, discount: number): number {
  return monthlyPrice * (1 - discount);
}

export function calculateCosts(config: CalculatorConfig): {
  derived: DerivedVolume;
  lineItems: LineItem[];
  totalMonthlyUsd: number;
  warnings: string[];
} {
  const derived = deriveVolume(config.volume);
  const lineItems: LineItem[] = [];
  const warnings: string[] = [];
  const isAnnual = config.billing === "annual";

  if (config.tools.apollo) {
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

  if (config.tools.aiArk) {
    const tier = AI_ARK_MONTHLY[config.aiArk.tier];
    let price = tier.price;
    if (isAnnual) {
      price = applyAnnualDiscount(price, 0.2);
    }
    if (derived.apolloCreditsNeeded > tier.credits) {
      warnings.push(
        `AI Ark ${config.aiArk.tier} includes ${tier.credits.toLocaleString()} credits/mo; you need ~${derived.apolloCreditsNeeded.toLocaleString()}.`,
      );
    }
    lineItems.push({
      tool: "AI Ark",
      label: `${config.aiArk.tier} (${tier.credits.toLocaleString()} credits)`,
      amount: price,
      detail: isAnnual ? "20% annual discount applied" : "Monthly",
    });
  }

  if (config.tools.inboxkit) {
    const mailboxes =
      config.inboxkit.mailboxesOverride ?? derived.inboxkitMailboxesNeeded;
    const domains = Math.ceil(mailboxes / MAILBOXES_PER_DOMAIN);
    const mailboxCost = mailboxes * config.inboxkit.pricePerMailbox;
    const domainCostMonthly = (domains * 13) / 12;
    lineItems.push({
      tool: "Inboxkit",
      label: `${mailboxes} mailbox(es), ${domains} domain(s)`,
      amount: mailboxCost + domainCostMonthly,
      detail: `~${EMAILS_PER_MAILBOX_PER_DAY} safe cold emails/mailbox/day`,
    });
    if (derived.totalEmailsMonthly > 0 && mailboxes < derived.inboxkitMailboxesNeeded) {
      warnings.push(
        `Inboxkit: recommended ${derived.inboxkitMailboxesNeeded} mailbox(es) for volume; you selected ${mailboxes}.`,
      );
    }
  }

  if (config.tools.smartlead) {
    let planPrice = SMARTLEAD_MONTHLY[config.smartlead.plan];
    planPrice = annualMonthlyEquivalent(planPrice);
    const leadLimit = SMARTLEAD_LEAD_LIMIT[config.smartlead.plan];
    const sendLimit = SMARTLEAD_SEND_LIMIT[config.smartlead.plan];
    if (derived.totalAccounts > leadLimit) {
      warnings.push(
        `Smartlead ${config.smartlead.plan} supports ${leadLimit === Infinity ? "unlimited" : leadLimit.toLocaleString()} active leads; you have ${derived.totalAccounts.toLocaleString()}.`,
      );
    }
    if (
      sendLimit !== Infinity &&
      derived.totalEmailsMonthly > sendLimit
    ) {
      warnings.push(
        `Smartlead ${config.smartlead.plan} monthly send cap is ${sendLimit.toLocaleString()}; you need ~${derived.totalEmailsMonthly.toLocaleString()}.`,
      );
    }
    lineItems.push({
      tool: "Smartlead",
      label: `${config.smartlead.plan} plan`,
      amount: planPrice,
    });
    if (config.smartlead.includeWarmup) {
      lineItems.push({
        tool: "Smartlead",
        label: "AI Warmup Pool add-on",
        amount: 59,
      });
    }
  }

  if (config.tools.heyreach) {
    const senders =
      config.heyreach.sendersOverride ?? derived.heyreachSendersNeeded;
    let heyreachCost = 0;
    const plan = config.heyreach.plan;

    switch (plan) {
      case "growth-1":
        heyreachCost = senders * 79;
        break;
      case "growth-5": {
        const packs = Math.ceil(senders / 5);
        heyreachCost = packs * 395;
        break;
      }
      case "agency":
        heyreachCost = 999;
        if (senders > 50) {
          warnings.push(
            `HeyReach Agency covers up to 50 senders; you need ${senders}. Consider Unlimited.`,
          );
        }
        break;
      case "unlimited":
        heyreachCost = 1999;
        if (senders > 500) {
          warnings.push(
            `HeyReach Unlimited covers up to 500 senders; you need ${senders}.`,
          );
        }
        break;
    }

    if (isAnnual && plan === "growth-1") {
      heyreachCost = senders * 59;
    }
    if (isAnnual && plan === "growth-5") {
      const packs = Math.ceil(senders / 5);
      heyreachCost = packs * (5 * 59);
    }

    lineItems.push({
      tool: "HeyReach",
      label: `${plan} — ${senders} LinkedIn sender(s)`,
      amount: heyreachCost,
      detail: `Up to ${HEYREACH_DM_CAP_PER_SENDER} DMs/sender/day`,
    });

    if (
      config.heyreach.includeProxies &&
      (plan === "agency" || plan === "unlimited" || senders > 5)
    ) {
      const proxyCost = senders * config.heyreach.proxyCostPerSender;
      lineItems.push({
        tool: "HeyReach",
        label: `Residential proxies (${senders} accounts)`,
        amount: proxyCost,
        detail: `$${config.heyreach.proxyCostPerSender}/account/mo`,
      });
    }
  }

  if (config.tools.interakt) {
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
  inboxkit: "Inboxkit",
  smartlead: "Smartlead",
  heyreach: "HeyReach",
  interakt: "Interakt (WhatsApp)",
} as const;
