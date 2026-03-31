-- Post impressions (view tracking)
create table public.post_impressions (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts on delete cascade not null,
  viewer_id uuid references public.profiles on delete cascade,
  created_at timestamptz default now() not null
);

alter table public.post_impressions enable row level security;

create policy "Impressions are viewable by everyone"
  on public.post_impressions for select
  using (true);

create policy "Anyone can record impressions"
  on public.post_impressions for insert
  with check (true);

create index post_impressions_post_id_idx on public.post_impressions (post_id);

-- Profile views
create table public.profile_views (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles on delete cascade not null,
  viewer_id uuid references public.profiles on delete cascade not null,
  created_at timestamptz default now() not null
);

alter table public.profile_views enable row level security;

create policy "Users can view their own profile views"
  on public.profile_views for select
  using (auth.uid() = profile_id);

create policy "Authenticated users can record profile views"
  on public.profile_views for insert
  with check (auth.uid() = viewer_id);

create index profile_views_profile_id_idx on public.profile_views (profile_id);
create index profile_views_viewer_id_idx on public.profile_views (viewer_id);
