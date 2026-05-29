"use client";

import { useMemo, useState } from "react";
import {
  AI_ARK_MONTHLY,
  calculateCosts,
  capLinkedinMonthlyVolume,
  DEFAULT_INR_TO_USD,
  deriveVolume,
  EMAILS_PER_MAILBOX_PER_DAY,
  LINKEDIN_CONNECTION_DAILY_CAP,
  LINKEDIN_DM_DAILY_CAP,
  LINKEDIN_MONTHLY_INPUT_CAP,
  suggestAiArkTier,
  suggestApolloPlan,
  suggestHeyReachPlan,
  suggestSmartleadPlan,
  type AiArkTier,
  type ApolloPlan,
  type BillingCycle,
  type CalculatorConfig,
  type HeyReachPlan,
  type InteraktMessageType,
  type InteraktPlan,
  type SmartleadPlan,
  type ToolToggles,
  type VolumeInputs,
} from "@/lib/pricing";

const defaultVolume: VolumeInputs = {
  prospects: 100,
  accountsPerProspect: 3,
  emailsPerAccount: 5,
  whatsappPerAccount: 2,
  linkedinDmsPerMonth: 1500,
  linkedinConnectionRequestsPerMonth: 600,
};

const defaultTools: ToolToggles = {
  apollo: true,
  aiArk: false,
  inboxkit: true,
  smartlead: true,
  heyreach: true,
  interakt: true,
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
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</span>
      ) : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

const selectClass = inputClass;

export function OutreachCalculator() {
  const [volume, setVolume] = useState<VolumeInputs>(defaultVolume);
  const [tools, setTools] = useState<ToolToggles>(defaultTools);
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [inrToUsd, setInrToUsd] = useState(DEFAULT_INR_TO_USD);

  const [apolloPlan, setApolloPlan] = useState<ApolloPlan>("basic");
  const [apolloSeats, setApolloSeats] = useState(1);

  const [aiArkTier, setAiArkTier] = useState<AiArkTier>("starter");

  const [inboxkitPricePerMailbox, setInboxkitPricePerMailbox] = useState(4.5);

  const [smartleadPlan, setSmartleadPlan] = useState<SmartleadPlan>("basic");
  const [smartleadWarmup, setSmartleadWarmup] = useState(true);

  const [heyreachPlan, setHeyreachPlan] = useState<HeyReachPlan>("growth-1");
  const [heyreachSendersOverride, setHeyreachSendersOverride] = useState<
    number | null
  >(null);
  const [heyreachProxies, setHeyreachProxies] = useState(false);
  const [proxyCostPerSender, setProxyCostPerSender] = useState(20);

  const [interaktPlan, setInteraktPlan] = useState<InteraktPlan>("growth");
  const [interaktMessageType, setInteraktMessageType] =
    useState<InteraktMessageType>("marketing");

  const derivedPreview = useMemo(() => deriveVolume(volume), [volume]);

  const config: CalculatorConfig = useMemo(
    () => ({
      volume,
      tools,
      billing,
      inrToUsd,
      apollo: { plan: apolloPlan, seats: apolloSeats },
      aiArk: { tier: aiArkTier },
      inboxkit: {
        pricePerMailbox: inboxkitPricePerMailbox,
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
      billing,
      inrToUsd,
      apolloPlan,
      apolloSeats,
      aiArkTier,
      inboxkitPricePerMailbox,
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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
          GTM Stack
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Outreach Tool Cost Calculator
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Model monthly stack cost from prospect volume, channel mix, and 2026
          pricing for Apollo, AI Ark, Inboxkit, Smartlead, HeyReach, and
          Interakt. Toggle tools off to exclude them from the total.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
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
              <Field label="Emails per account / month" hint="1 Apollo credit per email">
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
              <Field
                label="LinkedIn DMs (total / month)"
                hint={`Max ${LINKEDIN_MONTHLY_INPUT_CAP.toLocaleString()}/mo · ${LINKEDIN_DM_DAILY_CAP}/sender/day`}
              >
                <input
                  type="number"
                  min={0}
                  max={LINKEDIN_MONTHLY_INPUT_CAP}
                  className={inputClass}
                  value={volume.linkedinDmsPerMonth}
                  onChange={(e) =>
                    updateVolume(
                      "linkedinDmsPerMonth",
                      capLinkedinMonthlyVolume(Number(e.target.value)),
                    )
                  }
                />
              </Field>
              <Field
                label="Connection requests (total / month)"
                hint={`Max ${LINKEDIN_MONTHLY_INPUT_CAP.toLocaleString()}/mo · ${LINKEDIN_CONNECTION_DAILY_CAP}/sender/day`}
              >
                <input
                  type="number"
                  min={0}
                  max={LINKEDIN_MONTHLY_INPUT_CAP}
                  className={inputClass}
                  value={volume.linkedinConnectionRequestsPerMonth}
                  onChange={(e) =>
                    updateVolume(
                      "linkedinConnectionRequestsPerMonth",
                      capLinkedinMonthlyVolume(Number(e.target.value)),
                    )
                  }
                />
              </Field>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-zinc-50 p-4 text-sm dark:bg-zinc-900/60">
              <div>
                <dt className="text-zinc-500">Total accounts</dt>
                <dd className="font-semibold tabular-nums">
                  {derivedPreview.totalAccounts.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Emails / month</dt>
                <dd className="font-semibold tabular-nums">
                  {derivedPreview.totalEmailsMonthly.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">WhatsApp / month</dt>
                <dd className="font-semibold tabular-nums">
                  {derivedPreview.totalWhatsappMonthly.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">AI Ark credits (campaign)</dt>
                <dd className="font-semibold tabular-nums">
                  {derivedPreview.aiArkCreditsPerCampaign.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Inboxkit mailboxes (auto)</dt>
                <dd className="font-semibold tabular-nums">
                  {derivedPreview.inboxkitMailboxesNeeded}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">LinkedIn senders (est.)</dt>
                <dd className="font-semibold tabular-nums">
                  {derivedPreview.heyreachSendersNeeded}
                  <span className="ml-1 text-xs font-normal text-zinc-500">
                    (DMs: {derivedPreview.heyreachSendersForDms}, conn:{" "}
                    {derivedPreview.heyreachSendersForConnections})
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">LinkedIn DMs / month</dt>
                <dd className="font-semibold tabular-nums">
                  {derivedPreview.linkedinDmsPerMonth.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Connections / month</dt>
                <dd className="font-semibold tabular-nums">
                  {derivedPreview.linkedinConnectionRequestsPerMonth.toLocaleString()}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-3">
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
            </div>

            <button
              type="button"
              onClick={autoSuggestPlans}
              className="mt-5 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Auto-suggest plans from volume
            </button>
          </div>
        </section>

        <section className="space-y-4 lg:col-span-3">
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

          <ToolCard
            name="AI Ark"
            enabled={tools.aiArk}
            onToggle={() => toggleTool("aiArk")}
            description="Credit-volume tiers; alternative to Apollo."
          >
            <Field label="Tier">
              <select
                className={selectClass}
                value={aiArkTier}
                onChange={(e) => setAiArkTier(e.target.value as AiArkTier)}
              >
                <option value="starter">Starter — $49/mo (30K credits, 3 seats)</option>
                <option value="builder-60k">Builder 60K — $99/mo</option>
                <option value="builder-120k">Builder 120K — $149/mo</option>
                <option value="builder-300k">Builder 300K — $249/mo</option>
                <option value="scale-450k">Scale 450K+ — $399/mo</option>
              </select>
            </Field>
            <AiArkCostCreditsPanel
              tier={aiArkTier}
              billing={billing}
              campaignCredits={derived.aiArkCreditsPerCampaign}
            />
          </ToolCard>

          <ToolCard
            name="Inboxkit"
            enabled={tools.inboxkit}
            onToggle={() => toggleTool("inboxkit")}
            description="Mailboxes auto-sized from total email volume."
          >
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-600 dark:text-zinc-400">Mailboxes (auto)</span>
                <span className="text-lg font-semibold tabular-nums">
                  {derived.inboxkitMailboxesNeeded}
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                {derived.totalEmailsMonthly.toLocaleString()} emails ÷{" "}
                {EMAILS_PER_MAILBOX_PER_DAY}/inbox · {derived.inboxkitDomainsNeeded}{" "}
                domain(s)
              </p>
            </div>
            <Field label="Price per mailbox / month">
              <input
                type="number"
                step={0.01}
                min={0}
                className={inputClass}
                value={inboxkitPricePerMailbox}
                onChange={(e) => setInboxkitPricePerMailbox(Number(e.target.value))}
              />
            </Field>
          </ToolCard>

          <ToolCard
            name="Smartlead"
            enabled={tools.smartlead}
            onToggle={() => toggleTool("smartlead")}
            description="Active leads + send limits; unlimited mailboxes on all plans."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Plan">
                <select
                  className={selectClass}
                  value={smartleadPlan}
                  onChange={(e) => setSmartleadPlan(e.target.value as SmartleadPlan)}
                >
                  <option value="basic">Basic — $39 (2K leads, 6K sends)</option>
                  <option value="pro">Pro — $79 (30K leads, unlimited sends)</option>
                  <option value="custom">Custom — $94+ (unlimited)</option>
                </select>
              </Field>
              <Field label="AI Warmup Pool (+$59/mo)">
                <select
                  className={selectClass}
                  value={smartleadWarmup ? "yes" : "no"}
                  onChange={(e) => setSmartleadWarmup(e.target.value === "yes")}
                >
                  <option value="yes">Include warmup add-on</option>
                  <option value="no">Exclude warmup</option>
                </select>
              </Field>
            </div>
          </ToolCard>

          <ToolCard
            name="HeyReach"
            enabled={tools.heyreach}
            onToggle={() => toggleTool("heyreach")}
            description={`Per sender: ${LINKEDIN_DM_DAILY_CAP} DMs/day · ${LINKEDIN_CONNECTION_DAILY_CAP} connections/day.`}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Plan">
                <select
                  className={selectClass}
                  value={heyreachPlan}
                  onChange={(e) => setHeyreachPlan(e.target.value as HeyReachPlan)}
                >
                  <option value="growth-1">Growth — 1 sender ($79/mo)</option>
                  <option value="growth-5">Growth — 5 senders ($395/mo)</option>
                  <option value="agency">Agency — up to 50 ($999/mo)</option>
                  <option value="unlimited">Unlimited — up to 500 ($1,999/mo)</option>
                </select>
              </Field>
              <Field
                label="Senders (override)"
                hint={`Auto: ${derived.heyreachSendersNeeded}`}
              >
                <input
                  type="number"
                  min={0}
                  placeholder="Auto"
                  className={inputClass}
                  value={heyreachSendersOverride ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setHeyreachSendersOverride(v === "" ? null : Math.max(0, Number(v)));
                  }}
                />
              </Field>
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
            </div>
          </ToolCard>

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
        </section>
      </div>

      <section className="mt-10 rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-4 border-b border-zinc-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Cost breakdown
          </h2>
          <div className="text-right">
            <p className="text-sm text-zinc-500">Estimated monthly total (USD)</p>
            <p className="text-3xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
              {formatUsd(totalMonthlyUsd)}
            </p>
            {annualTotal !== null ? (
              <p className="text-sm text-zinc-500">
                ~{formatUsd(annualTotal)} if billed annually (12× monthly equivalent)
              </p>
            ) : null}
          </div>
        </div>

        {warnings.length > 0 ? (
          <ul className="border-b border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            {warnings.map((w) => (
              <li key={w} className="list-inside list-disc">
                {w}
              </li>
            ))}
          </ul>
        ) : null}

        {lineItems.length === 0 ? (
          <p className="px-6 py-8 text-center text-zinc-500">
            Enable at least one tool to see costs.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-500 dark:border-zinc-800">
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
                  className="border-b border-zinc-50 last:border-0 dark:border-zinc-900"
                >
                  <td className="px-6 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {item.tool}
                  </td>
                  <td className="px-6 py-3 text-zinc-700 dark:text-zinc-300">
                    {item.label}
                  </td>
                  <td className="px-6 py-3 text-zinc-500">
                    {item.creditsUsed != null ? (
                      <span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {item.creditsUsed.toLocaleString()}
                        </span>
                        {" / "}
                        {item.creditsIncluded?.toLocaleString()} included
                        {item.detail ? ` · ${item.detail}` : ""}
                      </span>
                    ) : (
                      (item.detail ?? "—")
                    )}
                  </td>
                  <td className="px-6 py-3 text-right tabular-nums font-medium">
                    {formatUsd(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-zinc-50 font-semibold dark:bg-zinc-900/60">
                <td colSpan={3} className="px-6 py-4 text-zinc-900 dark:text-zinc-50">
                  Total
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-blue-600 dark:text-blue-400">
                  {formatUsd(totalMonthlyUsd)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </section>

      <p className="mt-6 text-center text-xs text-zinc-400">
        Estimates based on 2026 public pricing. AI Ark Builder tiers use indicative
        list prices where not published. Verify with vendors before budgeting.
      </p>
    </div>
  );
}

function AiArkCostCreditsPanel({
  tier,
  billing,
  campaignCredits,
}: {
  tier: AiArkTier;
  billing: BillingCycle;
  campaignCredits: number;
}) {
  const tierInfo = AI_ARK_MONTHLY[tier];
  const monthlyPrice =
    billing === "annual" ? tierInfo.price * 0.8 : tierInfo.price;
  const overPlan = campaignCredits > tierInfo.credits;

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
          Campaign credits
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
          {campaignCredits.toLocaleString()}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">1 credit per email</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
          Plan cost / month
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
          {formatUsd(monthlyPrice)}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          Includes {tierInfo.credits.toLocaleString()} credits/mo
        </p>
      </div>
      {overPlan ? (
        <p className="col-span-2 text-xs text-amber-700 dark:text-amber-300">
          Campaign exceeds plan by{" "}
          {(campaignCredits - tierInfo.credits).toLocaleString()} credits — consider
          a higher tier.
        </p>
      ) : (
        <p className="col-span-2 text-xs text-emerald-700 dark:text-emerald-300">
          {(tierInfo.credits - campaignCredits).toLocaleString()} credits remaining
          in plan this month (if single campaign).
        </p>
      )}
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
      className={`rounded-2xl border p-5 transition ${
        enabled
          ? "border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          : "border-zinc-100 bg-zinc-50 opacity-60 dark:border-zinc-900 dark:bg-zinc-950/50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{name}</h3>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
            enabled
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {enabled ? "Included" : "Excluded"}
        </button>
      </div>
      {enabled ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
