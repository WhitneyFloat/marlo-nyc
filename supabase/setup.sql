-- Run this entire file in Supabase SQL Editor
-- supabase.com → your project → SQL Editor → New query → paste → Run

create table if not exists users (
  id                  uuid primary key default gen_random_uuid(),
  email               text unique not null,
  name                text,
  subscription_tier   text default 'free',
  subscription_status text default 'inactive',
  stripe_customer_id  text,
  created_at          timestamptz default now()
);

create table if not exists children (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references users(id) on delete cascade,
  name                 text not null,
  age                  integer not null,
  interests            text[],
  schedule             text[],
  allergies            text[],
  needs                text[],
  budget_max           integer,
  neighborhood         text,
  borough              text default 'brooklyn',
  scholarship_matching boolean default false,
  created_at           timestamptz default now()
);

create table if not exists providers (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  category          text not null,
  neighborhood      text,
  borough           text,
  address           text,
  contact_email     text,
  contact_phone     text,
  website           text,
  instagram         text,
  stripe_account_id text,
  plan_tier         text default 'free',
  plan_status       text default 'active',
  founding_provider boolean default false,
  verified          boolean default false,
  created_at        timestamptz default now()
);

create table if not exists programs (
  id                    uuid primary key default gen_random_uuid(),
  provider_id           uuid references providers(id) on delete cascade,
  name                  text not null,
  description           text,
  category              text not null,
  schedule_days         text[],
  schedule_time         text,
  price_monthly         integer,
  price_session         integer,
  capacity              integer,
  spots_remaining       integer,
  tags                  text[],
  age_min               integer,
  age_max               integer,
  start_date            date,
  end_date              date,
  early_dropoff         boolean default false,
  early_dropoff_time    text,
  allergy_safe          boolean default false,
  allergy_notes         text,
  scholarship_available boolean default false,
  active                boolean default true,
  created_at            timestamptz default now()
);

create table if not exists matches (
  id            uuid primary key default gen_random_uuid(),
  child_id      uuid references children(id) on delete cascade,
  program_id    uuid references programs(id) on delete cascade,
  match_score   integer,
  match_reasons text[],
  explanation   text,
  query_text    text,
  created_at    timestamptz default now(),
  status        text default 'active'
);

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

create table if not exists enrollments (
  id                  uuid primary key default gen_random_uuid(),
  child_id            uuid references children(id) on delete cascade,
  program_id          uuid references programs(id) on delete cascade,
  status              text default 'pending',
  enrolled_at         timestamptz default now(),
  payment_amount      integer,
  stripe_payment_id   text,
  waiver_signed       boolean default false,
  waiver_signed_at    timestamptz,
  waiver_document_url text
);

create table if not exists saved_programs (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid references children(id) on delete cascade,
  program_id uuid references programs(id) on delete cascade,
  saved_at   timestamptz default now()
);

create table if not exists provider_analytics (
  id            uuid primary key default gen_random_uuid(),
  provider_id   uuid references providers(id) on delete cascade,
  program_id    uuid references programs(id) on delete cascade,
  date          date default current_date,
  profile_views integer default 0,
  saves         integer default 0,
  waitlist_adds integer default 0,
  enrollments   integer default 0
);

alter table users              enable row level security;
alter table children           enable row level security;
alter table matches            enable row level security;
alter table waitlist           enable row level security;
alter table enrollments        enable row level security;
alter table saved_programs     enable row level security;
alter table providers          enable row level security;
alter table programs           enable row level security;
alter table provider_analytics enable row level security;

create policy "Users can read their own profile"
  on users for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on users for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on users for insert with check (auth.uid() = id);

create policy "Users can manage their own children"
  on children for all using (auth.uid() = user_id);

create policy "Providers are publicly readable"
  on providers for select using (true);

create policy "Authenticated users can create providers"
  on providers for insert with check (auth.role() = 'authenticated');

create policy "Programs are publicly readable"
  on programs for select using (true);

create policy "Users can manage their childrens matches"
  on matches for all
  using (
    exists (
      select 1 from children c
      where c.id = matches.child_id
      and c.user_id = auth.uid()
    )
  );

create policy "Users can manage their childrens waitlist entries"
  on waitlist for all
  using (
    exists (
      select 1 from children c
      where c.id = waitlist.child_id
      and c.user_id = auth.uid()
    )
  );

create policy "Users can manage their childrens enrollments"
  on enrollments for all
  using (
    exists (
      select 1 from children c
      where c.id = enrollments.child_id
      and c.user_id = auth.uid()
    )
  );

create policy "Users can manage their childrens saved programs"
  on saved_programs for all
  using (
    exists (
      select 1 from children c
      where c.id = saved_programs.child_id
      and c.user_id = auth.uid()
    )
  );

create policy "Provider analytics visible to authenticated users"
  on provider_analytics for select using (auth.role() = 'authenticated');

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.handle_enrollment_spots()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (TG_OP = 'INSERT' and new.status = 'confirmed') then
    update programs set spots_remaining = greatest(0, spots_remaining - 1) where id = new.program_id;
  elsif (TG_OP = 'UPDATE' and old.status != 'confirmed' and new.status = 'confirmed') then
    update programs set spots_remaining = greatest(0, spots_remaining - 1) where id = new.program_id;
  elsif (TG_OP = 'UPDATE' and old.status = 'confirmed' and new.status = 'cancelled') then
    update programs set spots_remaining = spots_remaining + 1 where id = new.program_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_enrollment_change on enrollments;
create trigger on_enrollment_change
  after insert or update on enrollments
  for each row execute procedure public.handle_enrollment_spots();
