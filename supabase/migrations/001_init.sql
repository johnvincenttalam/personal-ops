-- Personal OPS — initial schema
-- Run this in the Supabase SQL editor.

create extension if not exists "uuid-ossp";

-- Helper: auto-update updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ── PROJECTS ───────────────────────────────────────────────────────
create table if not exists projects (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid,
  name        text not null,
  color       text default 'violet',
  position    int  default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create trigger projects_set_updated_at
before update on projects
for each row execute function set_updated_at();

-- ── NOTES ──────────────────────────────────────────────────────────
create table if not exists notes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid,
  project_id  uuid references projects(id) on delete cascade,
  title       text default 'Untitled',
  content     text default '',
  is_pinned   boolean default false,
  position    int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create trigger notes_set_updated_at
before update on notes
for each row execute function set_updated_at();

create index if not exists notes_project_idx on notes(project_id);
create index if not exists notes_pinned_idx  on notes(is_pinned);

-- ── PROMPTS ────────────────────────────────────────────────────────
create table if not exists prompts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid,
  project_id  uuid references projects(id) on delete cascade,
  title       text default 'Untitled',
  content     text default '',
  is_pinned   boolean default false,
  position    int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create trigger prompts_set_updated_at
before update on prompts
for each row execute function set_updated_at();

create index if not exists prompts_project_idx on prompts(project_id);

-- ── CHECKLISTS (parent list + child items) ─────────────────────────
-- A row with parent_id = NULL is a list.
-- A row with parent_id set is an item belonging to that list.
create table if not exists checklist_items (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid,
  project_id    uuid references projects(id) on delete cascade,
  parent_id     uuid references checklist_items(id) on delete cascade,
  content       text default '',
  is_completed  boolean default false,
  position      int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create trigger checklist_items_set_updated_at
before update on checklist_items
for each row execute function set_updated_at();

create index if not exists checklist_project_idx on checklist_items(project_id);
create index if not exists checklist_parent_idx  on checklist_items(parent_id);

-- ── ROW LEVEL SECURITY (enable now, permissive policy for v1) ─────
-- When you add real auth, swap these for `using (auth.uid() = user_id)`.
alter table projects        enable row level security;
alter table notes           enable row level security;
alter table prompts         enable row level security;
alter table checklist_items enable row level security;

create policy "v1 open access" on projects        for all using (true) with check (true);
create policy "v1 open access" on notes           for all using (true) with check (true);
create policy "v1 open access" on prompts         for all using (true) with check (true);
create policy "v1 open access" on checklist_items for all using (true) with check (true);
