-- ============================================================
-- TimeToLearn v1 — tabele + RLS
-- Wklej całość do Supabase SQL Editor i kliknij Run
-- ============================================================


-- ─── PROFILES ────────────────────────────────────────────────
-- Rozszerza auth.users o dodatkowe dane (display_name, avatar)
-- id = auth.uid() — jeden do jednego z użytkownikiem

create table if not exists profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url   text,
  created_at   timestamptz default now()
);

alter table profiles enable row level security;

create policy "users see own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "users update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Trigger: automatycznie tworzy wiersz w profiles po rejestracji
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id) values (new.id);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- ─── DECKS (zestawy fiszek) ───────────────────────────────────

create table if not exists decks (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null default auth.uid(),
  title      text not null,
  subject    text,
  created_at timestamptz default now()
);

alter table decks enable row level security;

-- "for all" obejmuje SELECT, INSERT, UPDATE, DELETE jedną polityką
create policy "users manage own decks"
  on decks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ─── FLASHCARDS (fiszki) ──────────────────────────────────────
-- Fiszki nie mają user_id — dostęp sprawdzamy przez należący zestaw

create table if not exists flashcards (
  id         uuid default gen_random_uuid() primary key,
  deck_id    uuid references decks(id) on delete cascade not null,
  question   text not null,
  answer     text not null,
  created_at timestamptz default now()
);

alter table flashcards enable row level security;

create policy "users manage flashcards in own decks"
  on flashcards for all
  using (
    exists (
      select 1 from decks
      where decks.id = flashcards.deck_id
        and decks.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from decks
      where decks.id = flashcards.deck_id
        and decks.user_id = auth.uid()
    )
  );


-- ─── RESOURCES (tutoriale / linki) ────────────────────────────

create table if not exists resources (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null default auth.uid(),
  title      text not null,
  url        text not null,
  platform   text,
  category   text,
  created_at timestamptz default now()
);

alter table resources enable row level security;

create policy "users manage own resources"
  on resources for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ─── HABIT_LOGS ──────────────────────────────────────────────
-- Jeden wpis = jedno odznaczenie nawyku danego dnia
-- habit IN ('timetolearn'|'python'|'ai'|'project') LUB 'note' (notatka dnia)
-- Partial unique index: każdy nawyk można oznaczyć raz dziennie,
-- notatki ('note') nie mają ograniczenia — można dodać wiele

create table if not exists habit_logs (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users(id) on delete cascade not null default auth.uid(),
  habit          text not null,
  completed_date date not null default current_date,
  note           text,
  created_at     timestamptz default now()
);

alter table habit_logs enable row level security;

create policy "users manage own habit logs"
  on habit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- jeden check-in na nawyk na dzień (notatki wykluczone)
create unique index if not exists habit_logs_once_per_day
  on habit_logs(user_id, habit, completed_date)
  where habit != 'note';


-- ─── POMODORO_LOGS ────────────────────────────────────────────

create table if not exists pomodoro_logs (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null default auth.uid(),
  duration_min integer not null,
  mode         text not null check (mode in ('work', 'short_break', 'long_break')),
  completed_at timestamptz default now()
);

alter table pomodoro_logs enable row level security;

create policy "users manage own pomodoro logs"
  on pomodoro_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
