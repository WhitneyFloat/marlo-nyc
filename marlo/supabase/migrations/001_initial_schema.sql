-- ═══════════════════════════════════════════════════════════════
-- MARLO — Initial Schema
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- USERS
create table if not exists users (
  id                  uuid primary key default gen_random_uuid(),
  email               text unique not null,
  name                text,
  subscription_tier   text default 'free',   -- 'free' | 'family' | 'family_plus'
  subscription_status text default 'inactive', -- 'active' | 'inactive' | 'cancelled'
  stripe_customer_id  text,
  created_at          timestamptz default now()
);

-- CHILDREN
create table if not exists children (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references users(id) on delete cascade,
  name                 text not null,
  age                  integer not null,
  interests            text[],       -- ['soccer', 'art', 'music']
  schedule             text[],       -- ['monday', 'tuesday', 'saturday']
  allergies            text[],       -- ['peanuts', 'tree nuts']
  needs                text[],       -- ['early_dropoff', 'special_needs_accommodation']
  budget_max           integer,      -- monthly max in dollars
  neighborhood         text,
  borough              text default 'brooklyn',
  scholarship_matching boolean default false,
  created_at           timestamptz default now()
);

-- PROVIDERS
create table if not exists providers (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  category         text not null,   -- 'soccer' | 'dance' | 'music' | 'coding' | 'martial_arts' | 'arts' | 'swim' | 'camp'
  neighborhood     text,
  borough          text,
  address          text,
  contact_email    text,
  contact_phone    text,
  website          text,
  instagram        text,
  stripe_account_id text,
  plan_tier        text default 'free', -- 'free' | 'growth' | 'pro'
  plan_status      text default 'active',
  founding_provider boolean default false,
  verified         boolean default false,
  created_at       timestamptz default now()
);

-- PROGRAMS
create table if not exists programs (
  id                uuid primary key default gen_random_uuid(),
  provider_id       uuid references providers(id) on delete cascade,
  name              text not null,
  description       text,
  category          text not null,
  schedule_days     text[],         -- ['saturday', 'sunday']
  schedule_time     text,           -- '9:00 AM - 11:00 AM'
  price_monthly     integer,        -- in dollars
  price_session     integer,        -- for camps / one-time
  capacity          integer,
  spots_remaining   integer,
  tags              text[],         -- ['early_dropoff', 'nut_free', 'ages_7_10', 'competitive']
  age_min           integer,
  age_max           integer,
  start_date        date,
  end_date          date,
  early_dropoff     boolean default false,
  early_dropoff_time text,          -- '7:45 AM'
  allergy_safe      boolean default false,
  allergy_notes     text,
  scholarship_available boolean default false,
  active            boolean default true,
  created_at        timestamptz default now()
);

-- MATCHES (AI-generated, cached)
create table if not exists matches (
  id            uuid primary key default gen_random_uuid(),
  child_id      uuid references children(id) on delete cascade,
  program_id    uuid references programs(id) on delete cascade,
  match_score   integer,            -- 0-100
  match_reasons text[],             -- ['schedule_fit', 'allergy_safe', 'budget_match', 'interest_align']
  explanation   text,               -- "Why Marlo chose this" — AI-generated per child
  query_text    text,               -- parent's original natural language query
  created_at    timestamptz default now(),
  status        text default 'active' -- 'active' | 'dismissed' | 'saved' | 'enrolled'
);

-- WAITLIST
create table if not exists waitlist (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid references children(id) on delete cascade,
  program_id  uuid references programs(id) on delete cascade,
  position    integer,
  notified_at timestamptz,
  claimed_at  timestamptz,
  expired_at  timestamptz,
  created_at  timestamptz default now()
);

-- ENROLLMENTS
create table if not exists enrollments (
  id                 uuid primary key default gen_random_uuid(),
  child_id           uuid references children(id) on delete cascade,
  program_id         uuid references programs(id) on delete cascade,
  status             text default 'pending', -- 'pending' | 'confirmed' | 'cancelled'
  enrolled_at        timestamptz default now(),
  payment_amount     integer,
  stripe_payment_id  text,
  waiver_signed      boolean default false,
  waiver_signed_at   timestamptz,
  waiver_document_url text
);

-- SAVED PROGRAMS
create table if not exists saved_programs (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid references children(id) on delete cascade,
  program_id uuid references programs(id) on delete cascade,
  saved_at   timestamptz default now()
);

-- PROVIDER ANALYTICS (updated daily)
create table if not exists provider_analytics (
  id           uuid primary key default gen_random_uuid(),
  provider_id  uuid references providers(id) on delete cascade,
  program_id   uuid references programs(id) on delete cascade,
  date         date default current_date,
  profile_views integer default 0,
  saves         integer default 0,
  waitlist_adds integer default 0,
  enrollments   integer default 0
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════

create index if not exists idx_children_user_id     on children(user_id);
create index if not exists idx_programs_provider_id on programs(provider_id);
create index if not exists idx_programs_active       on programs(active);
create index if not exists idx_programs_category     on programs(category);
create index if not exists idx_matches_child_id      on matches(child_id);
create index if not exists idx_matches_status        on matches(status);
create index if not exists idx_waitlist_program_id   on waitlist(program_id);
create index if not exists idx_enrollments_child_id  on enrollments(child_id);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

alter table users               enable row level security;
alter table children            enable row level security;
alter table matches             enable row level security;
alter table waitlist            enable row level security;
alter table enrollments         enable row level security;
alter table saved_programs      enable row level security;
alter table providers           enable row level security;
alter table programs            enable row level security;
alter table provider_analytics  enable row level security;

-- ── USERS ──
create policy "Users can read their own profile"
  on users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on users for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on users for insert
  with check (auth.uid() = id);

-- ── CHILDREN ──
create policy "Users can manage their own children"
  on children for all
  using (auth.uid() = user_id);

-- ── PROVIDERS ──
create policy "Providers are publicly readable"
  on providers for select
  using (true);

create policy "Authenticated users can create providers"
  on providers for insert
  with check (auth.role() = 'authenticated');

-- ── PROGRAMS ──
create policy "Programs are publicly readable"
  on programs for select
  using (true);

-- ── MATCHES ──
create policy "Users can manage their children's matches"
  on matches for all
  using (
    exists (
      select 1 from children c
      where c.id = matches.child_id
        and c.user_id = auth.uid()
    )
  );

-- ── WAITLIST ──
create policy "Users can manage their children's waitlist entries"
  on waitlist for all
  using (
    exists (
      select 1 from children c
      where c.id = waitlist.child_id
        and c.user_id = auth.uid()
    )
  );

-- ── ENROLLMENTS ──
create policy "Users can manage their children's enrollments"
  on enrollments for all
  using (
    exists (
      select 1 from children c
      where c.id = enrollments.child_id
        and c.user_id = auth.uid()
    )
  );

-- ── SAVED PROGRAMS ──
create policy "Users can manage their children's saved programs"
  on saved_programs for all
  using (
    exists (
      select 1 from children c
      where c.id = saved_programs.child_id
        and c.user_id = auth.uid()
    )
  );

-- ── PROVIDER ANALYTICS ──
create policy "Provider analytics visible to authenticated users"
  on provider_analytics for select
  using (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════
-- TRIGGER: create user profile on signup
-- ═══════════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- TRIGGER: auto-update spots_remaining on enrollment
-- ═══════════════════════════════════════════════════════════════

create or replace function public.handle_enrollment_spots()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (TG_OP = 'INSERT' and new.status = 'confirmed') then
    update programs
    set spots_remaining = greatest(0, spots_remaining - 1)
    where id = new.program_id;

  elsif (TG_OP = 'UPDATE' and old.status != 'confirmed' and new.status = 'confirmed') then
    update programs
    set spots_remaining = greatest(0, spots_remaining - 1)
    where id = new.program_id;

  elsif (TG_OP = 'UPDATE' and old.status = 'confirmed' and new.status = 'cancelled') then
    update programs
    set spots_remaining = spots_remaining + 1
    where id = new.program_id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_enrollment_change on enrollments;
create trigger on_enrollment_change
  after insert or update on enrollments
  for each row execute procedure public.handle_enrollment_spots();
