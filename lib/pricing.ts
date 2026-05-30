export type MailType = "standard" | "premium"

// Canonical prices in the smallest currency unit (USD cents).
const PRICES_CENTS: Record<MailType, number> = {
  standard: 599,
  premium: 999,
}

/**
 * Price in cents. This is the canonical minor-unit amount that appears
 * over the wire in an MPP challenge and in the discovery document's
 * `x-payment-info`.
 */
export function priceCents(mailType: MailType): number {
  return PRICES_CENTS[mailType]
}

/**
 * Price as a major-unit decimal string (e.g. "5.99"). This is what the mppx
 * `charge()` API expects as its `amount`; it multiplies by 10^decimals to
 * arrive at the canonical cents amount. Passing cents here would overcharge
 * by 100x.
 */
export function priceMajorUnits(mailType: MailType): string {
  return (priceCents(mailType) / 100).toFixed(2)
}
