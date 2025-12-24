create table public.categories (
  id uuid not null default gen_random_uuid (),
  name text not null,
  slug text not null,
  description text null,
  created_at timestamp with time zone null default now(),
  constraint categories_pkey primary key (id),
  constraint categories_name_key unique (name),
  constraint categories_slug_key unique (slug)
) TABLESPACE pg_default;


create table public.user_profiles (
  id uuid not null,
  username text not null,
  display_name text null,
  avatar_url text null,
  bio text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_username_key unique (username),
  constraint user_profiles_id_fkey foreign KEY (id) references auth.users (id)
) TABLESPACE pg_default;


create table public.categories (
  id uuid not null default gen_random_uuid (),
  name text not null,
  slug text not null,
  description text null,
  created_at timestamp with time zone null default now(),
  constraint categories_pkey primary key (id),
  constraint categories_name_key unique (name),
  constraint categories_slug_key unique (slug)
) TABLESPACE pg_default;



create table public.user_profiles (
  id uuid not null,
  username text not null,
  display_name text null,
  avatar_url text null,
  bio text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_username_key unique (username),
  constraint user_profiles_id_fkey foreign KEY (id) references auth.users (id)
) TABLESPACE pg_default;




create table public.post_categories (
  post_id uuid not null,
  category_id uuid not null,
  constraint post_categories_pkey primary key (post_id, category_id),
  constraint post_categories_category_id_fkey foreign KEY (category_id) references categories (id) on delete CASCADE,
  constraint post_categories_post_id_fkey foreign KEY (post_id) references posts (id) on delete CASCADE
) TABLESPACE pg_default;


create table public.posts (
  id uuid not null default gen_random_uuid (),
  title text not null,
  slug text not null,
  content text not null,
  excerpt text null,
  author_id uuid not null,
  published boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  is_public boolean null default false,
  constraint posts_pkey primary key (id),
  constraint posts_slug_key unique (slug),
  constraint posts_author_id_fkey foreign KEY (author_id) references auth.users (id)
) TABLESPACE pg_default;


create table public.post_categories (
  post_id uuid not null,
  category_id uuid not null,
  constraint post_categories_pkey primary key (post_id, category_id),
  constraint post_categories_category_id_fkey foreign KEY (category_id) references categories (id) on delete CASCADE,
  constraint post_categories_post_id_fkey foreign KEY (post_id) references posts (id) on delete CASCADE
) TABLESPACE pg_default;






