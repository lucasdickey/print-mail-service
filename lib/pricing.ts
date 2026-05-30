export type MailType = "standard" | "premium"

// Prices are in the smallest currency unit (USD cents), which is what both
// Stripe PaymentIntents and the MPP `amount` field expect.
const PRICES_CENTS: Record<MailType, number> = {
  standard: 599,
  premium: 999,
}

export function priceFor(mailType: MailType): number {
  return PRICES_CENTS[mailType]
}
