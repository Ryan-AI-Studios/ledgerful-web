/**
 * Single source of truth for Commercial License price figures and fulfillment
 * copy (track 0069). Import from pricing content and page surfaces so figures
 * cannot drift. Phase-0 binding: review.md 2026-07-21.
 */

export type CommercialPriceTier = {
  upTo25: {
    label: string;
    maxEngineers: 25;
    priceUsd: 1500;
    period: "year";
  };
  upTo50: {
    label: string;
    maxEngineers: 50;
    priceUsd: 2500;
    period: "year";
  };
  over50: {
    label: string;
    contact: true;
  };
};

export const commercialPricing = {
  provisionalLabel: "Introductory pricing",
  currency: "USD",
  contactEmail: "legal@ledgerful.dev",
  tiers: {
    upTo25: {
      label: "Up to 25 engineers",
      maxEngineers: 25 as const,
      priceUsd: 1500 as const,
      period: "year" as const,
    },
    upTo50: {
      label: "Up to 50 engineers",
      maxEngineers: 50 as const,
      priceUsd: 2500 as const,
      period: "year" as const,
    },
    over50: {
      label: "Over 50 engineers",
      contact: true as const,
    },
  } satisfies CommercialPriceTier,
  /**
   * Honest next-step copy. No response-time SLA.
   */
  fulfillmentSentence:
    "Request a commercial license by email. We reply with a commercial license agreement and invoice path. There is no published response-time SLA.",
  /**
   * OEM / hosting / resale is never covered by the headcount-band Commercial License alone.
   */
  oemHostingNote:
    "OEM, hosting-as-a-service, resale, or redistribution requires a separate written agreement regardless of company size — email legal@ledgerful.dev.",
  exceptionHref: "/COMMERCIAL-EXCEPTION.md",
} as const;

export type CommercialPricing = typeof commercialPricing;

/** Format a pinned annual USD amount for display (e.g. $1,500). */
export function formatCommercialPriceUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: commercialPricing.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Primary card price line: from the lowest announced band. */
export function commercialCardPriceLabel(): string {
  const { upTo25 } = commercialPricing.tiers;
  return `From ${formatCommercialPriceUsd(upTo25.priceUsd)} / ${upTo25.period}`;
}

/** Structured mailto for commercial license requests (company / revenue / eng / use case). */
export function buildCommercialLicenseMailto(options?: {
  company?: string;
  revenueBand?: string;
  engineerCount?: string;
  useCase?: string;
}): string {
  const email = commercialPricing.contactEmail;
  const subject = "Ledgerful commercial license request";
  const body = [
    "I'd like to request a Ledgerful commercial license.",
    "",
    `Company: ${options?.company ?? "[your company]"}`,
    `Revenue band (under $1M / at or above $1M / unsure): ${options?.revenueBand ?? "[band]"}`,
    `Engineer count (≤25 / ≤50 / >50): ${options?.engineerCount ?? "[count]"}`,
    `Use case (internal production / evaluation / other): ${options?.useCase ?? "[describe]"}`,
    "",
    "Notes:",
    "",
  ].join("\n");

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Mailto for OEM / hosting / resale inquiries (same mailbox, distinct subject). */
export function buildOemHostingMailto(): string {
  const email = commercialPricing.contactEmail;
  const subject = "Ledgerful OEM / hosting / redistribution inquiry";
  const body = [
    "I'd like to discuss OEM, hosting-as-a-service, resale, or redistribution rights for Ledgerful.",
    "",
    "Company: [your company]",
    "Use case: [describe]",
    "",
  ].join("\n");
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Ordered list of price-band rows for UI and truth checks. */
export function commercialPriceBandRows(): Array<{
  label: string;
  priceDisplay: string;
  isContact: boolean;
}> {
  const { upTo25, upTo50, over50 } = commercialPricing.tiers;
  return [
    {
      label: upTo25.label,
      priceDisplay: `${formatCommercialPriceUsd(upTo25.priceUsd)} / ${upTo25.period}`,
      isContact: false,
    },
    {
      label: upTo50.label,
      priceDisplay: `${formatCommercialPriceUsd(upTo50.priceUsd)} / ${upTo50.period}`,
      isContact: false,
    },
    {
      label: over50.label,
      priceDisplay: "Contact us",
      isContact: true,
    },
  ];
}
