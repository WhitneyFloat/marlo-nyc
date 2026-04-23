-- Run this in Supabase SQL Editor to fix the foreign key error
-- This creates a users row for anyone who signed up before the trigger existed

insert into public.users (id, email, name)
select
  au.id,
  au.email,
  au.raw_user_meta_data->>'name'
from auth.users au
left join public.users pu on pu.id = au.id
where pu.id is null;
