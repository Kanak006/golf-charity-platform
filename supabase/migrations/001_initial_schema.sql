-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'subscriber' check (role in ('subscriber', 'admin')),
  selected_charity_id uuid,
  charity_percentage numeric(5,2) default 10.00 check (charity_percentage >= 10),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- SUBSCRIPTIONS
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null check (plan in ('monthly', 'yearly')),
  status text not null default 'active' check (status in ('active', 'inactive', 'cancelled', 'lapsed')),
  amount_cents integer not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- GOLF SCORES
create table public.scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  score integer not null check (score >= 1 and score <= 45),
  score_date date not null,
  created_at timestamptz default now()
);

-- CHARITIES
create table public.charities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  image_url text,
  website_url text,
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CHARITY EVENTS
create table public.charity_events (
  id uuid default uuid_generate_v4() primary key,
  charity_id uuid references public.charities(id) on delete cascade not null,
  title text not null,
  description text,
  event_date timestamptz,
  created_at timestamptz default now()
);

-- DRAWS
create table public.draws (
  id uuid default uuid_generate_v4() primary key,
  draw_date date not null,
  draw_type text not null default 'random' check (draw_type in ('random', 'algorithmic')),
  winning_numbers integer[] not null,
  status text not null default 'pending' check (status in ('pending', 'simulated', 'published')),
  jackpot_rollover boolean default false,
  rollover_amount_cents integer default 0,
  created_by uuid references public.profiles(id),
  published_at timestamptz,
  created_at timestamptz default now()
);

-- PRIZE POOLS
create table public.prize_pools (
  id uuid default uuid_generate_v4() primary key,
  draw_id uuid references public.draws(id) on delete cascade not null,
  pool_type text not null check (pool_type in ('jackpot_5', 'match_4', 'match_3')),
  total_amount_cents integer not null default 0,
  winners_count integer default 0,
  per_winner_amount_cents integer default 0,
  created_at timestamptz default now()
);

-- WINNERS
create table public.winners (
  id uuid default uuid_generate_v4() primary key,
  draw_id uuid references public.draws(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  match_type text not null check (match_type in ('match_5', 'match_4', 'match_3')),
  matched_numbers integer[],
  prize_amount_cents integer not null default 0,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'verification_required', 'verified', 'paid', 'rejected')),
  proof_url text,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CHARITY CONTRIBUTIONS
create table public.charity_contributions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  charity_id uuid references public.charities(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  amount_cents integer not null,
  contribution_date date default current_date,
  created_at timestamptz default now()
);

-- FOREIGN KEY: profiles.selected_charity_id
alter table public.profiles
  add constraint fk_selected_charity
  foreign key (selected_charity_id)
  references public.charities(id)
  on delete set null;

-- INDEXES
create index idx_scores_user_id on public.scores(user_id);
create index idx_scores_created_at on public.scores(created_at desc);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_status on public.subscriptions(status);
create index idx_winners_draw_id on public.winners(draw_id);
create index idx_winners_user_id on public.winners(user_id);

-- ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.scores enable row level security;
alter table public.charities enable row level security;
alter table public.draws enable row level security;
alter table public.winners enable row level security;
alter table public.charity_contributions enable row level security;

-- RLS POLICIES: profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Service can insert profiles" on public.profiles for insert with check (auth.uid() = id);

-- RLS POLICIES: scores
create policy "Users can manage own scores" on public.scores for all using (auth.uid() = user_id);
create policy "Admins can view all scores" on public.scores for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- RLS POLICIES: subscriptions
create policy "Users can view own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Admins can view all subscriptions" on public.subscriptions for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- RLS POLICIES: charities (public read)
create policy "Anyone can view active charities" on public.charities for select using (is_active = true);
create policy "Admins can manage charities" on public.charities for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- RLS POLICIES: draws (public read for published)
create policy "Anyone can view published draws" on public.draws for select using (status = 'published');
create policy "Admins can manage draws" on public.draws for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- RLS POLICIES: winners
create policy "Users can view own winnings" on public.winners for select using (auth.uid() = user_id);
create policy "Users can upload proof" on public.winners for update using (auth.uid() = user_id);
create policy "Admins can manage winners" on public.winners for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- RLS POLICIES: charity_contributions
create policy "Users can view own contributions" on public.charity_contributions for select using (auth.uid() = user_id);
create policy "Admins can view all contributions" on public.charity_contributions for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- FUNCTION: Keep only latest 5 scores per user
create or replace function enforce_max_five_scores()
returns trigger as $$
begin
  delete from public.scores
  where user_id = NEW.user_id
    and id not in (
      select id from public.scores
      where user_id = NEW.user_id
      order by score_date desc, created_at desc
      limit 5
    );
  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_max_five_scores
after insert on public.scores
for each row execute function enforce_max_five_scores();

-- FUNCTION: Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- SEED: Default admin (update email after deploy)
-- insert into public.profiles (id, email, role) values ('<your-auth-user-id>', 'admin@yourdomain.com', 'admin');