# marlo

> **“Marlo’s got it.”**
> AI-powered youth activity discovery, matching, and enrollment for NYC families.

-----

## What This Is

Marlo is a two-sided marketplace that connects NYC parents with youth activity providers — sports leagues, summer camps, music lessons, martial arts studios, coding programs, and more. The core product is an AI matching engine that takes a child’s profile and a parent’s natural language request, then returns 3 curated program matches ranked by fit. Parents don’t browse. They choose.

**The one-sentence pitch:** You tell Marlo about your kid. Marlo handles the rest.

**The two customers:**

- **Parents (B2C):** Time-poor, cash-rich NYC families. Marlo sells them time and confidence — the feeling of having a knowledgeable friend who knows every good program in the city.
- **Providers (B2B):** Activity businesses who need enrolled kids, not just visibility. Marlo sells them an enrollment pipeline, not a listing.

-----

## Tech Stack

|Layer         |Technology                                |Notes                                         |
|--------------|------------------------------------------|----------------------------------------------|
|Frontend      |Next.js 14 (App Router)                   |Web-first MVP. PWA for mobile.                |
|Styling       |Tailwind CSS                              |Utility-first. Maps to Marlo design system.   |
|Backend / API |Supabase                                  |Postgres + Auth + Realtime subscriptions      |
|AI Matching   |Anthropic Claude API (`claude-sonnet-4-6`)|Natural language parsing + matching agent     |
|Payments      |Stripe                                    |Parent subscriptions + provider billing       |
|Auth          |Supabase Auth                             |Magic link + Google OAuth                     |
|Email         |Resend                                    |Transactional — waitlist alerts, confirmations|
|Hosting       |Vercel                                    |One-click Next.js deploy                      |
|Analytics     |PostHog                                   |Product analytics + session replay            |
|CRM (internal)|Notion + Airtable                         |Provider relationships — MVP only             |

-----

## Brand System

```
Name:      marlo (lowercase in wordmark)
Tagline:   Marlo's got it.
Market:    NYC — Brooklyn launch (Park Slope, Cobble Hill, Carroll Gardens)
```

### Color Palette

```css
--ink:          #1A1917;   /* Primary text, dark backgrounds */
--ink-soft:     #2C2B28;   /* Provider dashboard background */
--cream:        #F8F4EE;   /* Primary background */
--warm-white:   #FDFAF6;   /* Card backgrounds */
--parchment:    #EDE8E0;   /* Section dividers, pale fills */

--terracotta:   #C4603A;   /* Primary brand accent — CTAs, highlights */
--terra-light:  #E8896A;   /* Gradients, hover states */
--terra-glow:   #F2A882;   /* Soft fills */

--sage:         #6B9E70;   /* Secondary accent — success, soccer/sports */
--sage-light:   #9DC4A0;   /* Gradient end */
--sage-pale:    #D4EAD6;   /* Alert backgrounds */

--gold:         #C9A44C;   /* Waitlist alerts, warnings */
--gold-light:   #E8C97A;   /* Soft gold fills */
--gold-pale:    #FBF3DC;   /* Alert backgrounds */

--stone:        #8C8478;   /* Secondary text, labels */
--stone-light:  #B8B2AA;   /* Dividers */
--stone-pale:   #E4DED6;   /* Borders */
```

### Typography

```
Display:  Palatino Linotype / Book Antiqua / Palatino (serif)
Body:     Gill Sans / Gill Sans MT / Calibri (sans-serif)
Code:     Courier New (monospace)
```

### Brand Voice

|Marlo IS                 |Marlo IS NOT            |
|-------------------------|------------------------|
|Quietly confident        |Loud or boastful        |
|Warmly in control        |Corporate or cold       |
|Already three steps ahead|Overly playful or kiddie|
|The friend who handles it|Complicated or technical|
|Present, not pushy       |Urgent or pressuring    |

### Copy Moments (use these exactly in UI)

```
Tagline:          "Marlo's got it."
Onboarding:       "Tell Marlo about your family. We'll handle the rest."
Confirmation:     "Marlo's got it. [Child name]'s enrolled."
Waitlist alert:   "Marlo found a spot. Tap to claim it."
Loading state:    "Marlo's handling it..."
Conflict alert:   "Marlo noticed [conflict]. Tap to resolve."
Re-enrollment:    "Marlo reminder: [Program] re-enrollment opens [date]."
Home feed:        "Marlo found [n] matches for [child name] this week."
```

-----

## Database Schema

### Supabase Postgres — Full Schema

```sql
-- USERS
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  subscription_tier text default 'free', -- 'free' | 'family' | 'family_plus'
  subscription_status text default 'inactive', -- 'active' | 'inactive' | 'cancelled'
  stripe_customer_id text,
  created_at timestamptz default now()
);

-- CHILDREN
create table children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  age integer not null,
  interests text[],          -- ['soccer', 'art', 'music']
  schedule text[],           -- ['monday', 'tuesday', 'saturday']
  allergies text[],          -- ['peanuts', 'tree nuts']
  needs text[],              -- ['early_dropoff', 'special_needs_accommodation']
  budget_max integer,        -- monthly max in dollars
  neighborhood text,
  borough text default 'brooklyn',
  scholarship_matching boolean default false,
  created_at timestamptz default now()
);

-- PROVIDERS
create table providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,    -- 'soccer' | 'dance' | 'music' | 'coding' | 'martial_arts' | 'arts' | 'swim' | 'camp'
  neighborhood text,
  borough text,
  address text,
  contact_email text,
  contact_phone text,
  website text,
  instagram text,
  stripe_account_id text,
  plan_tier text default 'free', -- 'free' | 'growth' | 'pro'
  plan_status text default 'active',
  founding_provider boolean default false,
  verified boolean default false,
  created_at timestamptz default now()
);

-- PROGRAMS
create table programs (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id) on delete cascade,
  name text not null,
  description text,
  category text not null,
  schedule_days text[],      -- ['saturday', 'sunday']
  schedule_time text,        -- '9:00 AM - 11:00 AM'
  price_monthly integer,     -- in dollars
  price_session integer,     -- for camps / one-time
  capacity integer,
  spots_remaining integer,
  tags text[],               -- ['early_dropoff', 'nut_free', 'ages_7_10', 'competitive']
  age_min integer,
  age_max integer,
  start_date date,
  end_date date,
  early_dropoff boolean default false,
  early_dropoff_time text,   -- '7:45 AM'
  allergy_safe boolean default false,
  allergy_notes text,
  scholarship_available boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

-- MATCHES (AI-generated, cached)
create table matches (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  program_id uuid references programs(id) on delete cascade,
  match_score integer,       -- 0-100
  match_reasons text[],      -- ['schedule_fit', 'allergy_safe', 'budget_match', 'interest_align']
  query_text text,           -- the parent's original natural language query
  created_at timestamptz default now(),
  status text default 'active' -- 'active' | 'dismissed' | 'saved' | 'enrolled'
);

-- WAITLIST
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  program_id uuid references programs(id) on delete cascade,
  position integer,
  notified_at timestamptz,
  claimed_at timestamptz,
  expired_at timestamptz,
  created_at timestamptz default now()
);

-- ENROLLMENTS
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  program_id uuid references programs(id) on delete cascade,
  status text default 'pending', -- 'pending' | 'confirmed' | 'cancelled'
  enrolled_at timestamptz default now(),
  payment_amount integer,
  stripe_payment_id text,
  waiver_signed boolean default false,
  waiver_signed_at timestamptz,
  waiver_document_url text
);

-- SAVED PROGRAMS
create table saved_programs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  program_id uuid references programs(id) on delete cascade,
  saved_at timestamptz default now()
);

-- PROVIDER ANALYTICS (updated daily)
create table provider_analytics (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id) on delete cascade,
  program_id uuid references programs(id) on delete cascade,
  date date default current_date,
  profile_views integer default 0,
  saves integer default 0,
  waitlist_adds integer default 0,
  enrollments integer default 0
);
```

### Row Level Security

```sql
-- Users can only read/write their own data
alter table users enable row level security;
alter table children enable row level security;
alter table matches enable row level security;
alter table waitlist enable row level security;
alter table enrollments enable row level security;
alter table saved_programs enable row level security;

-- Providers are publicly readable, write-protected by ownership
alter table providers enable row level security;
alter table programs enable row level security;

-- RLS policies — example for children table
create policy "Users can manage their own children"
  on children for all
  using (auth.uid() = user_id);

-- Programs are public read
create policy "Programs are publicly readable"
  on programs for select
  using (true);
```

-----

## AI Matching Agent

### How It Works

The matching agent is the core of Marlo. It receives a structured child profile + a parent’s natural language query, calls the Claude API, and returns 3 ranked program matches with explanations.

### Implementation

```typescript
// lib/agents/matching-agent.ts

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

interface ChildProfile {
  name: string;
  age: number;
  interests: string[];
  schedule: string[];
  allergies: string[];
  needs: string[];
  budgetMax: number;
  neighborhood: string;
}

interface Program {
  id: string;
  name: string;
  category: string;
  neighborhood: string;
  priceMonthly: number;
  scheduleDays: string[];
  scheduleTime: string;
  spotsRemaining: number;
  tags: string[];
  ageMin: number;
  ageMax: number;
  earlyDropoff: boolean;
  earlyDropoffTime?: string;
  allergySafe: boolean;
  allergyNotes?: string;
  description: string;
}

interface MatchResult {
  programId: string;
  matchScore: number;
  matchReasons: string[];
  explanation: string; // "Why Marlo chose this for [child]"
}

export async function runMatchingAgent(
  child: ChildProfile,
  query: string,
  programs: Program[]
): Promise<MatchResult[]> {

  const systemPrompt = `You are Marlo's matching agent. Your job is to find the best activity programs for a specific child based on their profile and a parent's request.

You must return EXACTLY 3 matches, ranked from best fit to third-best fit.
You must return valid JSON only — no preamble, no explanation outside the JSON.

Scoring criteria (weight each):
- Schedule compatibility: Does the program's days/times work for the child? (25%)
- Interest alignment: Does the category match the child's interests? (25%)
- Budget fit: Is the price within the family's budget? (20%)
- Safety requirements: Allergy-safe, accommodations available? (20%)
- Location proximity: Is the neighborhood close to the family? (10%)

Return format:
{
  "matches": [
    {
      "programId": "uuid",
      "matchScore": 94,
      "matchReasons": ["schedule_fit", "allergy_safe", "interest_align", "budget_match"],
      "explanation": "Brooklyn Soccer Academy offers early drop-off from 7:45am, has confirmed peanut-free facilities, and fits within your $200/month budget — all matching Maya's profile exactly."
    }
  ]
}`;

  const userMessage = `
CHILD PROFILE:
Name: ${child.name}
Age: ${child.age}
Interests: ${child.interests.join(', ')}
Available days: ${child.schedule.join(', ')}
Allergies: ${child.allergies.join(', ') || 'none'}
Special needs: ${child.needs.join(', ') || 'none'}
Monthly budget: $${child.budgetMax}
Neighborhood: ${child.neighborhood}

PARENT REQUEST:
"${query}"

AVAILABLE PROGRAMS:
${JSON.stringify(programs, null, 2)}

Return the 3 best matches as JSON.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: userMessage }],
    system: systemPrompt,
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  const parsed = JSON.parse(content.text);
  return parsed.matches;
}
```

### Waitlist Agent

```typescript
// lib/agents/waitlist-agent.ts
// Triggered via Supabase Realtime when programs.spots_remaining changes

export async function checkWaitlistAndNotify(programId: string) {
  // 1. Query waitlist ordered by position
  // 2. Get top family on waitlist
  // 3. Send notification via Resend
  // 4. Set 2-hour claim window
  // 5. If unclaimed after 2hrs, notify next family
}
```

-----

## Pricing Model

### Parent Side (B2C)

|Tier            |Price               |Features                                                                                                 |
|----------------|--------------------|---------------------------------------------------------------------------------------------------------|
|**Free**        |$0                  |Basic search, browse listings, top 5 results                                                             |
|**Family Plan** |$14.99/mo or $119/yr|Full AI matching, child profiles, waitlist alerts, allergy/need filters                                  |
|**Family Plan+**|$24.99/mo or $189/yr|Everything + exclusive member discounts (5–15% off programs), concierge support, multi-child coordination|

### Provider Side (B2B)

|Tier             |Price               |Features                                                          |
|-----------------|--------------------|------------------------------------------------------------------|
|**Basic**        |Free                |Listed in database, basic info only                               |
|**Growth**       |$99/mo or $899/yr   |Full profile, photos/video, registration link, analytics dashboard|
|**Pro**          |$199/mo or $1,799/yr|Priority placement, featured badge, AI demand insights            |
|**Founding Rate**|$49/mo (months 7–12)|Locked rate for first 30 providers — first 6 months free          |
|**Enrollment %** |8–12% per booking   |Alternative to flat fee — Marlo takes % of each enrollment driven |

-----

## MVP Build Scope

### What Is In MVP (Months 1–6)

#### Parent Side

- [ ] Onboarding flow — 4 steps: account, child profile, preferences, neighborhood + budget
- [ ] Child profile engine — age, interests, schedule, allergies, needs, budget. Multi-child support.
- [ ] Home feed — personalized per active child. AI match banner. Quick filters. Waitlist alerts. No empty search bar.
- [ ] Natural language search — parent types or speaks. AI returns 3 ranked matches.
- [ ] Program discovery view — 3-card results. Match %, price, schedule, spots, tags, distance.
- [ ] Program detail view — full info + “Why Marlo chose this for [child]” AI explanation panel.
- [ ] Save & waitlist — save programs, join waitlist, agent fires notification when spot opens.
- [ ] Parent subscription billing — Stripe. Free / Family $14.99/mo / Family+ $24.99/mo.

#### Provider Side

- [ ] Provider onboarding — business info, program categories, schedule, pricing, capacity, photos.
- [ ] Program listings — one or more programs per provider. Full detail, schedule, spots, tags.
- [ ] Basic dashboard — view count, saves, waitlist size.
- [ ] Provider billing — Stripe. Free / Growth $899/yr / Pro $1,799/yr. Founding rate $49/mo.

### What Is NOT In MVP

- ❌ In-app registration & payment processing (V1.1)
- ❌ Waiver management (V1.1)
- ❌ Family OS calendar layer (V2.0)
- ❌ Data insights product for providers (V2.0)
- ❌ Scholarship matching engine (V2.0)
- ❌ Multi-borough expansion (V2.0)
- ❌ Native iOS & Android apps — web-first only

### V1.1 Scope (Months 6–12)

- [ ] In-app registration — pre-filled form, Stripe payment, confirmation screen
- [ ] Waiver management — digital generation, e-signature, stored in parent + provider accounts
- [ ] Enrollment pipeline dashboard for providers
- [ ] Full analytics dashboard for providers
- [ ] Push notifications (Expo)

### V2.0 Scope (Year 2)

- [ ] Family OS calendar — all programs per child, conflict detection, re-enrollment prompts
- [ ] Scholarship matching — financial aid flag, AI surfaces sliding-scale programs
- [ ] AI Insight Card for providers — demand intelligence (“Your Friday 4pm fills 3× faster”)
- [ ] Data insights product — anonymized demand signals sold to providers
- [ ] Multi-borough expansion — Manhattan, Queens, Bronx

-----

## File Structure

```
marlo/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (parent)/
│   │   ├── layout.tsx
│   │   ├── home/
│   │   │   └── page.tsx          # Home feed — personalized, AI match banner
│   │   ├── search/
│   │   │   └── page.tsx          # Natural language search + 3 results
│   │   ├── program/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Program detail + "Why Marlo chose this"
│   │   ├── schedule/
│   │   │   └── page.tsx          # Family OS (V2.0)
│   │   └── profile/
│   │       └── page.tsx          # Parent account + child profiles
│   ├── (provider)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Provider analytics dashboard
│   │   ├── programs/
│   │   │   ├── page.tsx          # Program listings
│   │   │   └── new/
│   │   │       └── page.tsx      # Add program
│   │   └── settings/
│   │       └── page.tsx
│   ├── onboarding/
│   │   └── page.tsx              # 4-step family setup
│   └── api/
│       ├── match/
│       │   └── route.ts          # POST — runs matching agent
│       ├── waitlist/
│       │   └── route.ts          # POST — join waitlist
│       ├── webhooks/
│       │   └── stripe/
│       │       └── route.ts      # Stripe webhook handler
│       └── providers/
│           └── route.ts          # Provider CRUD
├── components/
│   ├── ui/
│   │   ├── marlo-wordmark.tsx    # "marlo" + terracotta dot
│   │   ├── program-card.tsx      # Match result card
│   │   ├── child-switcher.tsx    # Maya / Jordan toggle
│   │   ├── match-banner.tsx      # AI match hero on home feed
│   │   ├── waitlist-alert.tsx    # Gold alert card
│   │   └── phone-frame.tsx       # Dev preview only
│   ├── parent/
│   │   ├── home-feed.tsx
│   │   ├── search-bar.tsx        # Natural language input
│   │   ├── program-detail.tsx
│   │   └── why-marlo-chose.tsx   # AI explanation panel
│   └── provider/
│       ├── stats-grid.tsx
│       ├── enrollment-pipeline.tsx
│       └── ai-insight-card.tsx
├── lib/
│   ├── agents/
│   │   ├── matching-agent.ts     # Claude API — returns 3 ranked matches
│   │   └── waitlist-agent.ts     # Realtime spot notification
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── stripe/
│   │   └── index.ts
│   └── utils.ts
├── types/
│   └── index.ts                  # Shared TypeScript types
├── public/
└── README.md                     # This file
```

-----

## Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Stripe Price IDs
STRIPE_PRICE_FAMILY_MONTHLY=
STRIPE_PRICE_FAMILY_PLUS_MONTHLY=
STRIPE_PRICE_FAMILY_ANNUAL=
STRIPE_PRICE_FAMILY_PLUS_ANNUAL=
STRIPE_PRICE_PROVIDER_GROWTH=
STRIPE_PRICE_PROVIDER_PRO=
STRIPE_PRICE_PROVIDER_FOUNDING=

# Resend
RESEND_API_KEY=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

-----

## Build Timeline

|Weeks|Phase               |Deliverable                                                           |
|-----|--------------------|----------------------------------------------------------------------|
|1–2  |Foundation          |Auth, DB schema, Supabase setup, design system, routing               |
|3–5  |Child Profile + Home|Onboarding flow, child profile engine, home feed UI                   |
|6–8  |AI Matching         |Claude API integration, NL search, program cards, match scoring       |
|9–10 |Provider Side       |Provider onboarding, program listings, basic dashboard                |
|11–13|Billing + Waitlist  |Stripe parent + provider billing, waitlist agent, Resend notifications|
|14–16|QA + Launch         |Testing, bug fixes, GTM provider onboarding, soft launch              |

**Total: 12–16 weeks · Team: 2–3 people · Budget: $40,000–60,000**

-----

## MVP Success Metrics

These numbers greenlight V1.1 investment at Month 6:

|Metric                                        |Target          |
|----------------------------------------------|----------------|
|Parent 30-day retention                       |70%+            |
|Match satisfaction score                      |4.5+ / 5 stars  |
|Time to first match (from onboarding complete)|Under 60 seconds|
|Provider renewal rate at Month 6              |80%+            |
|Paying parent subscribers                     |500             |
|Active providers                              |30              |

-----

## Go-To-Market Summary

**Launch market:** Park Slope, Cobble Hill, Carroll Gardens — Brooklyn, NYC

**Days 1–30 — Provider First**
Sign 30 providers before a single parent subscribes. Build their profiles for them. Target: soccer leagues (6), summer camps (6), martial arts (5), dance (4), music (4), coding (3), arts (2).

**Founding provider offer:** Free for 6 months → $49/mo locked for months 7–12 → $99/mo thereafter.

**Days 31–90 — Parent Acquisition**
Channel 1 — Community seeding: 10 seed parents in Park Slope Parents (38k members), Brooklyn Families (22k members), school WhatsApp groups.
Channel 2 — Provider co-marketing: 20 referral cards per provider, Instagram story ask, QR codes at front desks.
Channel 3 — Content/SEO: “Best Summer Camps in Park Slope 2026” and similar articles published before launch.
Channel 4 — Paid (Days 60–90 only): Instagram/Facebook, parents 28–42, Brooklyn, household income $80k+. Target CPA: $15–25.

**90-day revenue target:** ~$46,875/month by Month 6 (~$562,500 annualized run rate).

-----

## Getting Started (Local Development)

```bash
# Clone the repo
git clone https://github.com/[your-username]/marlo.git
cd marlo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in all values above

# Set up Supabase
# 1. Create project at supabase.com
# 2. Run the schema SQL above in the Supabase SQL editor
# 3. Enable Row Level Security and add policies

# Run development server
npm run dev
```

Open <http://localhost:3000>.

-----

## Claude Code Instructions

When building this project, follow this priority order:

1. **Always use the brand voice** — every UI label, alert, confirmation, and empty state should use Marlo’s voice. Reference the Copy Moments section above. Never use generic copy like “Success!” or “No results found.”
1. **The matching agent returns exactly 3 results** — never more, never fewer. The intelligence is in the curation.
1. **The home feed is proactive** — it should never show an empty search bar as the primary UI. Marlo already knows the child’s profile. Surface matches before the parent asks.
1. **The “Why Marlo chose this” panel is non-negotiable in MVP** — this is the trust-builder. Every program detail view must explain why this specific program was chosen for this specific child.
1. **Parent confirmation screen must feel like a celebration** — the moment after registration is the most important emotional beat in the product. Use the exact copy: *“Marlo’s got it. [Child]’s enrolled.”*
1. **Provider dashboard is dark-themed** — deliberately different from the parent app. Business software energy. Reference `--ink-soft` (#2C2B28) as the background.
1. **Mobile-first** — the parent app is used on phones. Build every parent-side component mobile-first, then scale up.
1. **Supabase Realtime for waitlist** — the waitlist alert must feel instant. Use Supabase Realtime subscriptions on the `programs.spots_remaining` field.

-----

*Marlo’s got it.*
