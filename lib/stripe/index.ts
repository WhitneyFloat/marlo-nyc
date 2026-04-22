import Stripe from 'stripe'

// Lazy singleton — not instantiated at module load so builds without env vars succeed
let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  return _stripe
}

export const STRIPE_PRICES = {
  FAMILY_MONTHLY:      process.env.STRIPE_PRICE_FAMILY_MONTHLY!,
  FAMILY_PLUS_MONTHLY: process.env.STRIPE_PRICE_FAMILY_PLUS_MONTHLY!,
  FAMILY_ANNUAL:       process.env.STRIPE_PRICE_FAMILY_ANNUAL!,
  FAMILY_PLUS_ANNUAL:  process.env.STRIPE_PRICE_FAMILY_PLUS_ANNUAL!,
  PROVIDER_GROWTH:     process.env.STRIPE_PRICE_PROVIDER_GROWTH!,
  PROVIDER_PRO:        process.env.STRIPE_PRICE_PROVIDER_PRO!,
  PROVIDER_FOUNDING:   process.env.STRIPE_PRICE_PROVIDER_FOUNDING!,
} as const
