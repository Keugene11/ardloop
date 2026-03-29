-- Ardsleypost Database Schema
-- Run this in the Supabase SQL Editor after creating the project

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  bio text,
  stripe_customer_id text,
  stripe_account_id text,
  stripe_onboarded boolean default false,
  is_premium boolean default false,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Posts table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles on delete cascade not null,
  content text not null,
  category text not null default 'general',
  image_url text,
  price integer,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Users can update own posts"
  on public.posts for update
  using (auth.uid() = author_id);

create policy "Users can delete own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- Comments table
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts on delete cascade not null,
  author_id uuid references public.profiles on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Authenticated users can create comments"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "Users can delete own comments"
  on public.comments for delete
  using (auth.uid() = author_id);

-- Likes table
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (post_id, user_id)
);

alter table public.likes enable row level security;

create policy "Likes are viewable by everyone"
  on public.likes for select
  using (true);

create policy "Authenticated users can like"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike"
  on public.likes for delete
  using (auth.uid() = user_id);

-- Messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles on delete cascade not null,
  receiver_id uuid references public.profiles on delete cascade not null,
  content text not null,
  read boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.messages enable row level security;

create policy "Users can view their own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Authenticated users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "Receivers can update message read status"
  on public.messages for update
  using (auth.uid() = receiver_id);

-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;

-- Purchases table
create table public.purchases (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts on delete set null,
  buyer_id uuid references public.profiles on delete cascade not null,
  seller_id uuid references public.profiles on delete cascade not null,
  amount integer not null,
  commission integer not null,
  stripe_session_id text,
  status text not null default 'pending',
  created_at timestamptz default now() not null
);

alter table public.purchases enable row level security;

create policy "Users can view their own purchases"
  on public.purchases for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "System can insert purchases"
  on public.purchases for insert
  with check (true);

create policy "System can update purchases"
  on public.purchases for update
  using (true);

-- Indexes for performance
create index posts_author_id_idx on public.posts (author_id);
create index posts_created_at_idx on public.posts (created_at desc);
create index posts_category_idx on public.posts (category);
create index comments_post_id_idx on public.comments (post_id);
create index likes_post_id_idx on public.likes (post_id);
create index likes_user_id_idx on public.likes (user_id);
create index messages_sender_id_idx on public.messages (sender_id);
create index messages_receiver_id_idx on public.messages (receiver_id);
create index messages_created_at_idx on public.messages (created_at desc);
