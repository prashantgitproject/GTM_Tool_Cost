"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChannelToggleBar } from "@/components/ChannelToggleBar";
import {
  CLARITY_THEME,
  DEFAULT_CHANNELS,
  type ChannelToggles,
  type OutreachChannel,
} from "@/lib/clarity-theme";
import {
  applyChannelVolume,
  calculateCosts,
  calculateAiArkUsageCost,
  calculateFreckleUsageCost,
  calculateHeyReachUsageCost,
  calculateInboxkitUsageCost,
  calculateSmartleadUsageCost,
  getSmartleadPlanWarnings,
  SMARTLEAD_PLAN_DETAILS,
  SMARTLEAD_WARMUP_ADDON_MONTHLY,
  DEFAULT_DOMAIN_COST_YEARLY,
  DEFAULT_INR_TO_USD,
  deriveVolume,
  EMAILS_PER_MAILBOX_PER_DAY,
  LINKEDIN_DM_DAILY_CAP,
  suggestAiArkTier,
  suggestApolloPlan,
  suggestHeyReachPlan,
  suggestSmartleadPlan,
  USAGE_PRICING,
  type AiArkTier,
  type ApolloPlan,
  type BillingCycle,
  type CalculatorConfig,
  type HeyReachPlan,
  type InteraktMessageType,
  type InteraktPlan,
  type SmartleadPlan,
  type ToolToggles,
  type LineItem,
  type VolumeInputs,
} from "@/lib/pricing";

const defaultVolume: VolumeInputs = {
  prospects: 100,
  accountsPerProspect: 1,
  emailsPerAccount: 4,
  whatsappPerAccount: 0,
  linkedinTouchPointsPerAccount: 2,
};

const defaultTools: ToolToggles = {
  apollo: false,
  aiArk: true,
  freckle: true,
  inboxkit: true,
  smartlead: true,
  heyreach: true,
  interakt: false,
};

function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-clarity-ink">{label}</span>
      {children}
      {hint ? (
        <span className="text-xs text-clarity-muted">{hint}</span>
      ) : null}
    </label>
  );
}

const inputClass =
  "w-full min-w-0 rounded-lg border border-clarity-border/60 bg-clarity-surface px-3 py-2.5 text-base text-clarity-text shadow-sm outline-none transition focus:border-clarity-accent focus:ring-2 focus:ring-clarity-accent/25 sm:py-2 sm:text-sm";

const selectClass = inputClass;

export function OutreachCalculator() {
  const [volume, setVolume] = useState<VolumeInputs>(defaultVolume);
  const [tools, setTools] = useState<ToolToggles>(defaultTools);
  const [channels, setChannels] = useState<ChannelToggles>(DEFAULT_CHANNELS);
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [inrToUsd, setInrToUsd] = useState(DEFAULT_INR_TO_USD);

  const [apolloPlan, setApolloPlan] = useState<ApolloPlan>("basic");
  const [apolloSeats, setApolloSeats] = useState(1);

  const [aiArkTier, setAiArkTier] = useState<AiArkTier>("starter");

  const [inboxkitDomainCostYearly, setInboxkitDomainCostYearly] = useState(
    DEFAULT_DOMAIN_COST_YEARLY,
  );

  const [smartleadPlan, setSmartleadPlan] = useState<SmartleadPlan>("basic");
  const [smartleadWarmup, setSmartleadWarmup] = useState(false);

  const [heyreachPlan, setHeyreachPlan] = useState<HeyReachPlan>("growth-1");
  const [heyreachSendersOverride, setHeyreachSendersOverride] = useState<
    number | null
  >(null);
  const [heyreachProxies, setHeyreachProxies] = useState(false);
  const [proxyCostPerSender, setProxyCostPerSender] = useState(20);

  const [interaktPlan, setInteraktPlan] = useState<InteraktPlan>("growth");
  const [interaktMessageType, setInteraktMessageType] =
    useState<InteraktMessageType>("marketing");

  const effectiveVolume = useMemo(
    () => applyChannelVolume(volume, channels),
    [volume, channels],
  );

  const derivedPreview = useMemo(
    () => deriveVolume(effectiveVolume, inboxkitDomainCostYearly),
    [effectiveVolume, inboxkitDomainCostYearly],
  );

  const config: CalculatorConfig = useMemo(
    () => ({
      volume,
      tools,
      channels,
      billing,
      inrToUsd,
      apollo: { plan: apolloPlan, seats: apolloSeats },
      aiArk: { tier: aiArkTier },
      inboxkit: {
        domainCostYearly: inboxkitDomainCostYearly,
      },
      smartlead: { plan: smartleadPlan, includeWarmup: smartleadWarmup },
      heyreach: {
        plan: heyreachPlan,
        sendersOverride: heyreachSendersOverride,
        includeProxies: heyreachProxies,
        proxyCostPerSender: proxyCostPerSender,
      },
      interakt: { plan: interaktPlan, messageType: interaktMessageType },
    }),
    [
      volume,
      tools,
      channels,
      billing,
      inrToUsd,
      apolloPlan,
      apolloSeats,
      aiArkTier,
      inboxkitDomainCostYearly,
      smartleadPlan,
      smartleadWarmup,
      heyreachPlan,
      heyreachSendersOverride,
      heyreachProxies,
      proxyCostPerSender,
      interaktPlan,
      interaktMessageType,
    ],
  );

  const { derived, lineItems, totalMonthlyUsd, warnings } = useMemo(
    () => calculateCosts(config),
    [config],
  );

  function updateVolume<K extends keyof VolumeInputs>(
    key: K,
    value: VolumeInputs[K],
  ) {
    setVolume((v) => ({ ...v, [key]: value }));
  }

  function toggleTool(key: keyof ToolToggles) {
    setTools((t) => ({ ...t, [key]: !t[key] }));
  }

  function toggleChannel(channel: OutreachChannel) {
    setChannels((c) => ({ ...c, [channel]: !c[channel] }));
  }

  function autoSuggestPlans() {
    const d = deriveVolume(volume);
    setApolloPlan(suggestApolloPlan(d.apolloCreditsNeeded));
    setAiArkTier(suggestAiArkTier(d.apolloCreditsNeeded));
    setSmartleadPlan(
      suggestSmartleadPlan(d.totalAccounts, d.totalEmailsMonthly),
    );
    setHeyreachPlan(suggestHeyReachPlan(d.heyreachSendersNeeded));
    setHeyreachSendersOverride(null);
  }

  const annualTotal = billing === "annual" ? totalMonthlyUsd * 12 : null;

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-6 sm:mb-10">
        <div className="flex items-center gap-3">
          <Image
            src={CLARITY_THEME.logoUrl}
            alt={CLARITY_THEME.brand.displayName}
            width={32}
            height={32}
            className="h-8 w-8"
            unoptimized
          />
          <p className="text-sm font-medium uppercase tracking-wider text-clarity-muted">
            {CLARITY_THEME.access.keyName}
          </p>
        </div>
        <h1 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-clarity-ink sm:text-3xl lg:text-4xl">
          Outreach Tool Cost Calculator
        </h1>
        <p className="mt-3 max-w-2xl text-clarity-muted">
          Model monthly stack cost from account volume and touch points for{" "}
          {CLARITY_THEME.brand.displayName}. Include or exclude channels to see
          usage-based costs for AI Ark, Freckle, Inboxkit, Smartlead, and
          HeyReach.
        </p>
      </header>

      <section className="mb-6 rounded-2xl border border-clarity-border/60 bg-clarity-surface p-4 shadow-sm sm:mb-8 sm:p-6">
        <h2 className="text-lg font-semibold text-clarity-ink">Channels</h2>
        <p className="mt-1 text-sm text-clarity-muted">
          Include or exclude outreach channels. Excluded channels remove related
          tools and touch points from the cost estimate.
        </p>
        <div className="mt-5">
          <ChannelToggleBar channels={channels} onToggle={toggleChannel} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <section className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-clarity-border/60 bg-clarity-surface p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-clarity-ink">
              Campaign volume
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Number of prospects" hint="Companies or people in campaign">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={volume.prospects}
                  onChange={(e) =>
                    updateVolume("prospects", Math.max(0, Number(e.target.value)))
                  }
                />
              </Field>
              <Field label="Accounts per prospect" hint="Contacts or accounts per prospect">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={volume.accountsPerProspect}
                  onChange={(e) =>
                    updateVolume(
                      "accountsPerProspect",
                      Math.max(0, Number(e.target.value)),
                    )
                  }
                />
              </Field>
              {channels.email ? (
                <Field
                  label="Email touch points / account"
                  hint="e.g. 4 emails per account per month"
                >
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={volume.emailsPerAccount}
                    onChange={(e) =>
                      updateVolume(
                        "emailsPerAccount",
                        Math.max(0, Number(e.target.value)),
                      )
                    }
                  />
                </Field>
              ) : null}
              {channels.whatsapp ? (
                <Field label="WhatsApp messages per account / month">
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={volume.whatsappPerAccount}
                    onChange={(e) =>
                      updateVolume(
                        "whatsappPerAccount",
                        Math.max(0, Number(e.target.value)),
                      )
                    }
                  />
                </Field>
              ) : null}
              {channels.linkedin ? (
                <Field
                  label="LinkedIn touch points / account"
                  hint={`e.g. 2 messages per account · ${LINKEDIN_DM_DAILY_CAP}/sender/day`}
                >
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={volume.linkedinTouchPointsPerAccount}
                    onChange={(e) =>
                      updateVolume(
                        "linkedinTouchPointsPerAccount",
                        Math.max(0, Number(e.target.value)),
                      )
                    }
                  />
                </Field>
              ) : null}
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-clarity-panel p-4 text-sm">
              <div>
                <dt className="text-clarity-muted">Total accounts</dt>
                <dd className="font-semibold tabular-nums">
                  {derivedPreview.totalAccounts.toLocaleString()}
                </dd>
              </div>
              {channels.email ? (
              <div>
                <dt className="text-clarity-muted">Emails / month</dt>
                <dd className="font-semibold tabular-nums">
                  {derivedPreview.totalEmailsMonthly.toLocaleString()}
                </dd>
              </div>
              ) : null}
              {channels.whatsapp ? (
              <div>
                <dt className="text-clarity-muted">WhatsApp / month</dt>
                <dd className="font-semibold tabular-nums">
                  {derivedPreview.totalWhatsappMonthly.toLocaleString()}
                </dd>
              </div>
              ) : null}
              <div>
                <dt className="text-clarity-muted">AI Ark credits</dt>
                <dd className="font-semibold tabular-nums">
                  {derivedPreview.aiArkCreditsPerCampaign.toLocaleString()}
                  <span className="ml-1 text-xs font-normal text-clarity-muted">
                    (0.5/account)
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-clarity-muted">Freckle credits</dt>
                <dd className="font-semibold tabular-nums">
                  {derivedPreview.freckleCreditsPerCampaign.toLocaleString()}
                  <span className="ml-1 text-xs font-normal text-clarity-muted">
                    (1/account)
                  </span>
                </dd>
              </div>
              {channels.linkedin ? (
              <div>
                <dt className="text-clarity-muted">LinkedIn messages / month</dt>
                <dd className="font-semibold tabular-nums">
                  {derivedPreview.totalLinkedinMessagesMonthly.toLocaleString()}
                </dd>
              </div>
              ) : null}
              {channels.email ? (
              <>
              <div>
                <dt className="text-clarity-muted">Inboxkit mailboxes (auto)</dt>
                <dd className="font-semibold tabular-nums">
                  {derivedPreview.inboxkitMailboxesNeeded}
                </dd>
              </div>
              <div>
                <dt className="text-clarity-muted">Inboxkit $/account (est.)</dt>
                <dd className="font-semibold tabular-nums">
                  {formatUsd(
                    derivedPreview.inboxkitDomainCostPerAccount +
                      derivedPreview.inboxkitInboxCostPerAccount,
                  )}
                </dd>
              </div>
              </>
              ) : null}
              {channels.linkedin ? (
              <div>
                <dt className="text-clarity-muted">LinkedIn senders (est.)</dt>
                <dd className="font-semibold tabular-nums">
                  {derivedPreview.heyreachSendersNeeded}
                </dd>
              </div>
              ) : null}
            </dl>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Billing cycle">
                <select
                  className={selectClass}
                  value={billing}
                  onChange={(e) => setBilling(e.target.value as BillingCycle)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual (discounted rates)</option>
                </select>
              </Field>
              {channels.whatsapp ? (
              <Field label="INR → USD rate" hint="For Interakt (₹ plans)">
                <input
                  type="number"
                  step={0.0001}
                  min={0}
                  className={inputClass}
                  value={inrToUsd}
                  onChange={(e) => setInrToUsd(Number(e.target.value))}
                />
              </Field>
              ) : null}
            </div>

            <button
              type="button"
              onClick={autoSuggestPlans}
              className="mt-5 w-full rounded-lg bg-clarity-ink px-4 py-2.5 text-sm font-medium text-clarity-bg transition hover:bg-clarity-text"
            >
              Auto-suggest plans from volume
            </button>
          </div>
        </section>

        <section className="space-y-4 lg:col-span-3">
          {channels.email ? (
          <ToolCard
            name="Apollo.io"
            enabled={tools.apollo}
            onToggle={() => toggleTool("apollo")}
            description="Per-seat plans; 1 credit per email."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Plan">
                <select
                  className={selectClass}
                  value={apolloPlan}
                  onChange={(e) => setApolloPlan(e.target.value as ApolloPlan)}
                >
                  <option value="free">Free — $0</option>
                  <option value="basic">Basic — $59/mo ($49 annual)</option>
                  <option value="professional">Professional — $99 ($79 annual)</option>
                  <option value="organization">Organization — $149 ($119 annual, min 3 seats)</option>
                </select>
              </Field>
              <Field label="Seats">
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={apolloSeats}
                  onChange={(e) => setApolloSeats(Math.max(1, Number(e.target.value)))}
                />
              </Field>
            </div>
          </ToolCard>
          ) : null}

          <ToolCard
            name="AI Ark"
            enabled={tools.aiArk}
            onToggle={() => toggleTool("aiArk")}
            description={`$${USAGE_PRICING.aiArk.pricePerMonth}/mo per ${USAGE_PRICING.aiArk.creditsPerMonth.toLocaleString()} credits · ${USAGE_PRICING.aiArk.creditsPerAccount} credit per account saved.`}
          >
            <UsageCostPanel
              credits={derived.aiArkCreditsPerCampaign}
              creditsLabel="AI Ark credits"
              creditsHint={`${USAGE_PRICING.aiArk.creditsPerAccount} credit per account`}
              cost={calculateAiArkUsageCost(derived.totalAccounts)}
              rateLabel={`$${USAGE_PRICING.aiArk.pricePerMonth} / ${USAGE_PRICING.aiArk.creditsPerMonth.toLocaleString()} credits`}
            />
          </ToolCard>

          <ToolCard
            name="Freckle"
            enabled={tools.freckle}
            onToggle={() => toggleTool("freckle")}
            description={`AI enrichment · $${USAGE_PRICING.freckle.pricePerMonth}/mo per ${USAGE_PRICING.freckle.creditsPerMonth.toLocaleString()} credits · ${USAGE_PRICING.freckle.creditsPerAccount} credit per enrichment.`}
          >
            <UsageCostPanel
              credits={derived.freckleCreditsPerCampaign}
              creditsLabel="Freckle credits"
              creditsHint={`${USAGE_PRICING.freckle.creditsPerAccount} credit per account`}
              cost={calculateFreckleUsageCost(derived.totalAccounts)}
              rateLabel={`$${USAGE_PRICING.freckle.pricePerMonth} / ${USAGE_PRICING.freckle.creditsPerMonth.toLocaleString()} credits`}
            />
          </ToolCard>

          {channels.email ? (
          <ToolCard
            name="Inboxkit"
            enabled={tools.inboxkit}
            onToggle={() => toggleTool("inboxkit")}
            description={`$${USAGE_PRICING.inboxkit.planPrice}/mo · ${USAGE_PRICING.inboxkit.inboxesIncluded} inboxes · ${USAGE_PRICING.inboxkit.emailsPerInboxPerDay} emails/inbox/day`}
          >
            <Field
              label="Domain cost / year (USD)"
              hint={`Default $${DEFAULT_DOMAIN_COST_YEARLY}/yr · used in ($/12)/mo × accounts/750`}
            >
              <input
                type="number"
                step={0.01}
                min={0}
                className={inputClass}
                value={inboxkitDomainCostYearly}
                onChange={(e) =>
                  setInboxkitDomainCostYearly(
                    Math.max(0, Number(e.target.value)),
                  )
                }
              />
            </Field>
            <UsageCostPanel
              credits={derived.totalEmailsMonthly}
              creditsLabel="Emails / month"
              creditsHint={`${volume.emailsPerAccount} touch pt(s) × ${derived.totalAccounts.toLocaleString()} accounts`}
              cost={
                calculateInboxkitUsageCost(
                  derived.totalAccounts,
                  volume.emailsPerAccount,
                  inboxkitDomainCostYearly,
                ).total
              }
              rateLabel={`Domain ${formatUsd(derived.inboxkitDomainCostPerAccount)}/acct · Inbox ${formatUsd(derived.inboxkitInboxCostPerAccount)}/acct`}
            />
          </ToolCard>
          ) : null}

          {channels.email ? (
          <ToolCard
            name="Smartlead"
            enabled={tools.smartlead}
            onToggle={() => toggleTool("smartlead")}
            description="Usage-based: (plan price ÷ plan send limit) × your monthly sends."
          >
            <Field label="Plan">
              <select
                className={selectClass}
                value={smartleadPlan}
                onChange={(e) =>
                  setSmartleadPlan(e.target.value as SmartleadPlan)
                }
              >
                <option value="basic">
                  Basic — ${SMARTLEAD_PLAN_DETAILS.basic.price}/mo ·{" "}
                  {SMARTLEAD_PLAN_DETAILS.basic.contacts.toLocaleString()}{" "}
                  contacts ·{" "}
                  {SMARTLEAD_PLAN_DETAILS.basic.sends.toLocaleString()} sends
                </option>
                <option value="pro">
                  Pro — ${SMARTLEAD_PLAN_DETAILS.pro.price}/mo ·{" "}
                  {SMARTLEAD_PLAN_DETAILS.pro.contacts.toLocaleString()}{" "}
                  contacts ·{" "}
                  {SMARTLEAD_PLAN_DETAILS.pro.sends.toLocaleString()} sends ·{" "}
                  {SMARTLEAD_PLAN_DETAILS.pro.verifiedEmails?.toLocaleString()}{" "}
                  verified emails
                </option>
              </select>
            </Field>
            {getSmartleadPlanWarnings(
              smartleadPlan,
              derived.totalAccounts,
              derived.totalEmailsMonthly,
            ).map((w) => (
              <p
                key={w}
                className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900"
              >
                {w}
              </p>
            ))}
            <UsageCostPanel
              credits={derived.totalEmailsMonthly}
              creditsLabel="Sends / month"
              creditsHint={`${derived.totalAccounts.toLocaleString()} contacts · ${volume.emailsPerAccount} touch pt(s)/account`}
              cost={calculateSmartleadUsageCost(
                smartleadPlan,
                derived.totalAccounts,
                volume.emailsPerAccount,
              )}
              rateLabel={
                smartleadPlan === "pro"
                  ? `$${SMARTLEAD_PLAN_DETAILS.pro.price}/${SMARTLEAD_PLAN_DETAILS.pro.sends.toLocaleString()} × ${derived.totalEmailsMonthly.toLocaleString()} sends`
                  : `$${SMARTLEAD_PLAN_DETAILS.basic.price}/${SMARTLEAD_PLAN_DETAILS.basic.sends.toLocaleString()} × ${derived.totalEmailsMonthly.toLocaleString()} sends`
              }
            />
            <Field label={`AI Warmup Pool (+$${SMARTLEAD_WARMUP_ADDON_MONTHLY}/mo)`}>
              <select
                className={selectClass}
                value={smartleadWarmup ? "yes" : "no"}
                onChange={(e) => setSmartleadWarmup(e.target.value === "yes")}
              >
                <option value="yes">Include warmup add-on</option>
                <option value="no">Exclude warmup</option>
              </select>
            </Field>
          </ToolCard>
          ) : null}

          {channels.linkedin ? (
          <ToolCard
            name="HeyReach"
            enabled={tools.heyreach}
            onToggle={() => toggleTool("heyreach")}
            description={`$${USAGE_PRICING.heyreach.pricePerSender}/sender · ${USAGE_PRICING.heyreach.messagesPerSenderPerDay} messages/day · ${volume.linkedinTouchPointsPerAccount} touch pt(s)/account.`}
          >
            <UsageCostPanel
              credits={derived.totalLinkedinMessagesMonthly}
              creditsLabel="LinkedIn messages / month"
              creditsHint={`${volume.linkedinTouchPointsPerAccount} touch pt(s) × ${derived.totalAccounts.toLocaleString()} accounts`}
              cost={calculateHeyReachUsageCost(
                derived.totalAccounts,
                volume.linkedinTouchPointsPerAccount,
              )}
              rateLabel={`$${USAGE_PRICING.heyreach.pricePerSender}/sender · ${Math.round((USAGE_PRICING.heyreach.messagesPerSenderPerDay * 30) / volume.linkedinTouchPointsPerAccount || 0)} accounts/sender`}
            />
            <Field label="Residential proxies">
              <select
                className={selectClass}
                value={heyreachProxies ? "yes" : "no"}
                onChange={(e) => setHeyreachProxies(e.target.value === "yes")}
              >
                <option value="no">Exclude proxy costs</option>
                <option value="yes">Include ($15–25/account — default $20)</option>
              </select>
            </Field>
            {heyreachProxies ? (
              <Field label="Proxy cost per sender / month">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={proxyCostPerSender}
                  onChange={(e) => setProxyCostPerSender(Number(e.target.value))}
                />
              </Field>
            ) : null}
          </ToolCard>
          ) : null}

          {channels.whatsapp ? (
          <ToolCard
            name="Interakt (WhatsApp)"
            enabled={tools.interakt}
            onToggle={() => toggleTool("interakt")}
            description="₹ subscription + Meta conversation fees (India rates)."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Plan">
                <select
                  className={selectClass}
                  value={interaktPlan}
                  onChange={(e) => setInteraktPlan(e.target.value as InteraktPlan)}
                >
                  <option value="starter">Starter — ₹999/mo (1 channel)</option>
                  <option value="growth">Growth — ₹2,799/mo (WA + Instagram)</option>
                  <option value="advanced">Advanced — ₹3,799/mo</option>
                </select>
              </Field>
              <Field label="Message type (per conversation)">
                <select
                  className={selectClass}
                  value={interaktMessageType}
                  onChange={(e) =>
                    setInteraktMessageType(e.target.value as InteraktMessageType)
                  }
                >
                  <option value="marketing">Marketing — ~₹0.90</option>
                  <option value="utility">Utility — ~₹0.15</option>
                  <option value="authentication">Authentication — ₹0.12</option>
                  <option value="service">Service — free (24h window)</option>
                </select>
              </Field>
            </div>
          </ToolCard>
          ) : null}
        </section>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-clarity-border/60 bg-clarity-surface shadow-sm sm:mt-10">
        <div className="flex flex-col gap-3 border-b border-clarity-border/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5">
          <h2 className="text-lg font-semibold text-clarity-ink">
            Cost breakdown
          </h2>
          <div className="sm:text-right">
            <p className="text-sm text-clarity-muted">Estimated monthly total (USD)</p>
            <p className="text-2xl font-bold tabular-nums text-clarity-gold sm:text-3xl">
              {formatUsd(totalMonthlyUsd)}
            </p>
            {annualTotal !== null ? (
              <p className="text-xs text-clarity-muted sm:text-sm">
                ~{formatUsd(annualTotal)} if billed annually (12× monthly equivalent)
              </p>
            ) : null}
          </div>
        </div>

        {warnings.length > 0 ? (
          <ul className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:px-6 sm:py-4 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            {warnings.map((w) => (
              <li key={w} className="list-inside list-disc">
                {w}
              </li>
            ))}
          </ul>
        ) : null}

        {lineItems.length === 0 ? (
          <p className="px-4 py-8 text-center text-clarity-muted sm:px-6">
            Enable at least one channel and tool to see costs.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-clarity-border/20 md:hidden">
              {lineItems.map((item, i) => (
                <li
                  key={`mobile-${item.tool}-${item.label}-${i}`}
                  className="px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-clarity-ink">{item.tool}</p>
                      <p className="mt-0.5 text-sm text-clarity-text">
                        {item.label}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-clarity-ink">
                      {formatUsd(item.amount)}
                    </p>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-clarity-muted">
                    <LineItemDetail item={item} />
                  </p>
                </li>
              ))}
              <li className="flex items-center justify-between bg-clarity-panel px-4 py-4 font-semibold">
                <span className="text-clarity-ink">Total</span>
                <span className="tabular-nums text-clarity-gold">
                  {formatUsd(totalMonthlyUsd)}
                </span>
              </li>
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-clarity-border/30 text-clarity-muted">
                    <th className="px-6 py-3 font-medium">Tool</th>
                    <th className="px-6 py-3 font-medium">Line item</th>
                    <th className="px-6 py-3 font-medium">Credits / detail</th>
                    <th className="px-6 py-3 text-right font-medium">USD / mo</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, i) => (
                    <tr
                      key={`${item.tool}-${item.label}-${i}`}
                      className="border-b border-clarity-border/20 last:border-0"
                    >
                      <td className="px-6 py-3 font-medium text-clarity-ink">
                        {item.tool}
                      </td>
                      <td className="px-6 py-3 text-clarity-text">
                        {item.label}
                      </td>
                      <td className="max-w-xs px-6 py-3 text-clarity-muted">
                        <LineItemDetail item={item} />
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums font-medium">
                        {formatUsd(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-clarity-panel font-semibold">
                    <td colSpan={3} className="px-6 py-4 text-clarity-ink">
                      Total
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-clarity-gold">
                      {formatUsd(totalMonthlyUsd)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 px-2 text-center text-xs leading-relaxed text-clarity-steel">
        Estimates based on 2026 public pricing. AI Ark Builder tiers use indicative
        list prices where not published. Verify with vendors before budgeting.
      </p>
    </div>
  );
}

function LineItemDetail({ item }: { item: LineItem }) {
  if (item.creditsUsed != null) {
    return (
      <>
        <span className="font-medium text-clarity-text">
          {item.creditsUsed.toLocaleString()}
        </span>
        {" / "}
        {item.creditsIncluded?.toLocaleString()} included
        {item.detail ? ` · ${item.detail}` : ""}
      </>
    );
  }
  return <>{item.detail ?? "—"}</>;
}

function UsageCostPanel({
  credits,
  creditsLabel,
  creditsHint,
  cost,
  rateLabel,
}: {
  credits: number;
  creditsLabel: string;
  creditsHint: string;
  cost: number;
  rateLabel: string;
}) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-clarity-accent-active/40 bg-clarity-accent-active/10 p-3 sm:grid-cols-2 sm:p-4">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-clarity-muted">
          {creditsLabel}
        </p>
        <p className="mt-1 text-xl font-bold tabular-nums text-clarity-ink sm:text-2xl">
          {credits.toLocaleString()}
        </p>
        <p className="mt-0.5 break-words text-xs text-clarity-muted">
          {creditsHint}
        </p>
      </div>
      <div className="min-w-0 border-t border-clarity-accent-active/20 pt-3 sm:border-t-0 sm:pt-0">
        <p className="text-xs font-medium uppercase tracking-wide text-clarity-muted">
          Est. cost / month
        </p>
        <p className="mt-1 text-xl font-bold tabular-nums text-clarity-ink sm:text-2xl">
          {formatUsd(cost)}
        </p>
        <p className="mt-0.5 break-words text-xs text-clarity-muted">
          {rateLabel}
        </p>
      </div>
    </div>
  );
}

function ToolCard({
  name,
  description,
  enabled,
  onToggle,
  children,
}: {
  name: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition sm:p-5 ${
        enabled
          ? "border-clarity-border/60 bg-clarity-surface shadow-sm"
          : "border-clarity-border/30 bg-clarity-panel/60 opacity-60"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-clarity-ink">{name}</h3>
          <p className="mt-0.5 break-words text-xs leading-relaxed text-clarity-muted">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`self-start rounded-full px-3 py-1.5 text-xs font-medium transition sm:shrink-0 ${
            enabled
              ? "bg-clarity-accent-active/30 text-clarity-ink"
              : "bg-clarity-border/30 text-clarity-muted"
          }`}
        >
          {enabled ? "Included" : "Excluded"}
        </button>
      </div>
      {enabled ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
