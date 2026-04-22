// ─── DATABASE ROW TYPES ───────────────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'family' | 'family_plus'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled'
export type ProviderPlanTier = 'free' | 'growth' | 'pro'
export type ProgramCategory =
  | 'soccer'
  | 'dance'
  | 'music'
  | 'coding'
  | 'martial_arts'
  | 'arts'
  | 'swim'
  | 'camp'

export type MatchStatus = 'active' | 'dismissed' | 'saved' | 'enrolled'
export type EnrollmentStatus = 'pending' | 'confirmed' | 'cancelled'

export interface User {
  id: string
  email: string
  name: string | null
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  stripe_customer_id: string | null
  created_at: string
}

export interface Child {
  id: string
  user_id: string
  name: string
  age: number
  interests: string[]
  schedule: string[]
  allergies: string[]
  needs: string[]
  budget_max: number | null
  neighborhood: string | null
  borough: string
  scholarship_matching: boolean
  created_at: string
}

export interface Provider {
  id: string
  name: string
  category: ProgramCategory
  neighborhood: string | null
  borough: string | null
  address: string | null
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  instagram: string | null
  stripe_account_id: string | null
  plan_tier: ProviderPlanTier
  plan_status: string
  founding_provider: boolean
  verified: boolean
  created_at: string
}

export interface Program {
  id: string
  provider_id: string
  name: string
  description: string | null
  category: ProgramCategory
  schedule_days: string[]
  schedule_time: string | null
  price_monthly: number | null
  price_session: number | null
  capacity: number | null
  spots_remaining: number | null
  tags: string[]
  age_min: number | null
  age_max: number | null
  start_date: string | null
  end_date: string | null
  early_dropoff: boolean
  early_dropoff_time: string | null
  allergy_safe: boolean
  allergy_notes: string | null
  scholarship_available: boolean
  active: boolean
  created_at: string
  // joined
  provider?: Provider
}

export interface Match {
  id: string
  child_id: string
  program_id: string
  match_score: number
  match_reasons: string[]
  explanation: string | null
  query_text: string | null
  created_at: string
  status: MatchStatus
  // joined
  program?: Program
  child?: Child
}

export interface Waitlist {
  id: string
  child_id: string
  program_id: string
  position: number | null
  notified_at: string | null
  claimed_at: string | null
  expired_at: string | null
  created_at: string
  // joined
  program?: Program
}

export interface Enrollment {
  id: string
  child_id: string
  program_id: string
  status: EnrollmentStatus
  enrolled_at: string
  payment_amount: number | null
  stripe_payment_id: string | null
  waiver_signed: boolean
  waiver_signed_at: string | null
  waiver_document_url: string | null
  // joined
  program?: Program
  child?: Child
}

export interface SavedProgram {
  id: string
  child_id: string
  program_id: string
  saved_at: string
  // joined
  program?: Program
}

export interface ProviderAnalytics {
  id: string
  provider_id: string
  program_id: string
  date: string
  profile_views: number
  saves: number
  waitlist_adds: number
  enrollments: number
}

// ─── AI AGENT TYPES ───────────────────────────────────────────────────────────

export interface ChildProfile {
  name: string
  age: number
  interests: string[]
  schedule: string[]
  allergies: string[]
  needs: string[]
  budgetMax: number
  neighborhood: string
}

export interface MatchResult {
  programId: string
  matchScore: number
  matchReasons: string[]
  explanation: string
}

export interface MatchAgentResponse {
  matches: MatchResult[]
}

// ─── UI STATE TYPES ───────────────────────────────────────────────────────────

export interface OnboardingState {
  step: 1 | 2 | 3 | 4
  email: string
  name: string
  childName: string
  childAge: number | null
  interests: string[]
  schedule: string[]
  allergies: string[]
  needs: string[]
  budgetMax: number | null
  neighborhood: string
}
