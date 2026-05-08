# AGENTS.md — Project Context for AI Agents & Devs

> **Read me first.** This file is the source of truth for picking up work on this project across devices, AI tools, or new contributors. It captures decisions, conventions, and "where to find things" — info you can't derive by just reading the code.
>
> Convention: this file follows the cross-tool [`AGENTS.md`](https://agents.md) standard. Claude Code, Codex, Cursor, and others will read this automatically.

---

## 1. Project at a glance

**Personal OPS** is a personal-use, single-user web app for managing **prompts, notes, checklists, and reusable storage snippets** organized by project. Items can reference each other via `@` mentions with full backlink support. Built fast, but layered cleanly — domain logic, data access, and UI are separate.

- **Owner:** Solo developer, frontend-leaning full-stack
- **Audience:** The owner only (single-user). Multi-user is a v2 consideration
- **Core philosophy:** "Build something you'll actually use daily. Evolve based on real usage."
- **Started:** 2026-05-08

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | **React 18 + Vite + TypeScript** | Fast HMR, type safety, no Next.js bloat for a SPA |
| Styling | **TailwindCSS 3** (`darkMode: 'class'`) | Utility-first matches the speed-of-iteration goal |
| State | **Zustand 5** + `persist` middleware | Lightweight, no boilerplate, no providers |
| Backend | **Supabase** (Postgres + REST) | Free tier, instant DB, RLS for v2 auth |
| Markdown editor | **`@uiw/react-md-editor`** | Used for Notes (preview + edit toggle) |
| Code editor | **`@uiw/react-codemirror` + `@codemirror/lang-markdown` + `@codemirror/theme-one-dark`** | Used for Prompts and Storage snippets — line numbers, syntax highlighting |
| Search | **`cmdk`** | Headless command palette, kbd-driven |
| Debounce | **`use-debounce`** | Auto-save without leaks |
| Icons | **`lucide-react`** | Tree-shakeable, consistent style |
| Dates | **`date-fns`** | Functional, no moment bloat |
| Testing | **Vitest** | Same Vite config, no Jest setup, fast |
| Hosting | **Vercel** (frontend) + **Supabase Cloud** (backend) | Free, zero-config |

**Path alias:** `@/*` → `src/*` (configured in `vite.config.ts` and `tsconfig.app.json`).

---

## 3. Quick start (new device / fresh clone)

```bash
npm install
cp .env.example .env
# Fill .env with VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
# from Supabase Dashboard → Project Settings → API
npm run dev
```

Then in Supabase SQL Editor, run all migrations under `supabase/migrations/` in order.

```bash
npm test          # one-shot test run (uses Vitest)
npm run test:watch
```

> **Note on env naming:** the variable is `VITE_SUPABASE_PUBLISHABLE_KEY` (Supabase's new key naming as of 2026), not the legacy `VITE_SUPABASE_ANON_KEY`. The code uses whatever name is in the `.env`.

---

## 4. Architecture (Clean-ish, adapted for React)

The codebase is organized in four layers. Dependencies point **inward only**: presentation → application → domain ← infrastructure.

```
src/
├── domain/                              Pure TS. No React. No Supabase.
│   ├── entities/                        Type definitions + entity rules
│   │   ├── Note.ts                      Note interface + noteCopyTitle
│   │   ├── Prompt.ts                    Prompt interface + promptCopyTitle
│   │   ├── Project.ts                   Project + ProjectColor
│   │   ├── StorageItem.ts               StorageItem + StorageSourceType
│   │   └── ChecklistItem.ts             ChecklistItem + isList/isChildOf
│   ├── value-objects/
│   │   ├── ItemStatus.ts                'draft'|'final'|'archived' + canTransition
│   │   └── Tag.ts                       normalizeTag, dedupeTags
│   └── rules/
│       ├── diffPatch.ts                 Generic shallow diff (used by all save services)
│       └── parseMentions.ts             extractMentions, formatMention, transformMentionsForPreview, parseMentionUrl, backlinkNeedle
│
├── application/                         Service interfaces (ports) + implementations
│   ├── ports/                           Interfaces implemented by infrastructure
│   │   ├── NoteRepository.ts
│   │   ├── PromptRepository.ts
│   │   ├── StorageRepository.ts
│   │   ├── ProjectRepository.ts
│   │   ├── ChecklistRepository.ts
│   │   └── SearchGateway.ts             Cross-entity reads (corpus, backlinks, project lookup)
│   └── services/                        Use cases as factory-returned method bags
│       ├── NoteService.ts               list/create/update/save/togglePin/duplicate/move/delete
│       ├── PromptService.ts             same shape as NoteService
│       ├── StorageService.ts            list/create/update/save/delete
│       ├── ProjectService.ts            list/create/update/delete (tag dedupe applied here)
│       ├── ChecklistService.ts          createList/createListWithItems/createItem/toggleComplete/moveList/...
│       └── SearchService.ts             getCorpus/findBacklinksTo/getProjectId
│
├── infrastructure/                      Concrete adapters
│   ├── supabase/
│   │   ├── BaseSupabaseRepository.ts    Shared list/insert/update/delete plumbing
│   │   ├── SupabaseNoteRepository.ts    extends Base, implements NoteRepository
│   │   ├── SupabasePromptRepository.ts
│   │   ├── SupabaseStorageRepository.ts
│   │   ├── SupabaseProjectRepository.ts
│   │   ├── SupabaseChecklistRepository.ts
│   │   └── SupabaseSearchGateway.ts     Cross-table queries (corpus, LIKE backlinks)
│   └── composition.ts                   The DI root. Wires repos→services. Exports `services`.
│
└── (presentation, kept at original paths for minimal churn)
    ├── components/
    │   ├── layout/                      Sidebar, ListPanel, EditorPanel (3-panel shell)
    │   ├── notes/                       NotesList, NoteEditor
    │   ├── prompts/                     PromptsList, PromptEditor
    │   ├── checklists/                  ChecklistsList, ChecklistView
    │   ├── storage/                     StorageList, StorageView
    │   └── shared/                      ConfirmDialog, CommandPalette, EditorSkeleton, Skeletons,
    │                                    LinkPicker, Backlinks, MentionMarkdown, StatusBadge,
    │                                    TagsEditor, SaveToStorageModal, SettingsModal, Modal,
    │                                    ProjectEditModal, EmptyTemplates, WelcomePanel,
    │                                    formatDate, colors
    ├── data/
    │   └── templates.ts                 Starter templates per content type
    ├── hooks/
    │   ├── useAutoSave.ts               Debounced save hook (returns { status, flush })
    │   └── useMentionRouter.ts          Click-handler: `mention:type:id` → switch project/tab/active item
    ├── pages/
    │   └── Home.tsx                     Single page; mounts the 3 panels
    ├── stores/                          Zustand. State + service calls only. NO direct Supabase.
    │   ├── useProjectStore.ts
    │   ├── useNoteStore.ts
    │   ├── usePromptStore.ts
    │   ├── useChecklistStore.ts
    │   ├── useStorageStore.ts
    │   └── useUIStore.ts                Pure UI: theme, accent, activeTab, mobileView, searchOpen
    ├── services/
    │   └── supabaseClient.ts            Bootstrap client + LOCAL_USER_ID. Imported only by composition.ts.
    ├── types/
    │   └── index.ts                     Compatibility barrel — re-exports domain entities + defines UI-only `Tab`
    ├── App.tsx                          Mounts Home + global modals + ⌘K shortcut + accent CSS-vars subscription
    ├── main.tsx
    ├── index.css                        Tailwind + cmdk + scrollbar + mention pill + CodeMirror dark overrides
    └── vite-env.d.ts                    Env var types
```

**Where Supabase appears:** ONLY in `infrastructure/` and `services/supabaseClient.ts`. Grep `@/services/supabaseClient` outside those paths — should return 0 hits.

**The DI root:** `infrastructure/composition.ts` instantiates one repo per entity (extending `BaseSupabaseRepository`), one search gateway, then wires each into a service factory. Exports a single `services` object. Stores import from there.

---

## 5. Database schema (summary)

Tables (run all migrations under `supabase/migrations/` in order):

- **`projects`** — `id`, `user_id`, `name`, `color`, `description`, `tags text[]`, `position`, timestamps
- **`notes`** — `id`, `user_id`, `project_id` (FK cascade), `title`, `content`, `is_pinned`, `status`, `tags text[]`, `position`, timestamps
- **`prompts`** — same shape as notes
- **`checklist_items`** — `id`, `user_id`, `project_id` (FK cascade), `parent_id` (self-FK cascade), `content`, `is_completed`, `position`, timestamps
  - **Important:** `parent_id IS NULL` means "this is a list"; `parent_id IS NOT NULL` means "this is an item of that list". One table, two roles.
- **`storage_items`** — `id`, `user_id`, `project_id` (FK cascade), `name`, `description`, `content`, `tags text[]`, `source_type` (`'note'|'prompt'|'manual'`), `source_id`, timestamps. Frozen-copy snapshots; `source_id` references the original but isn't a hard FK so deleting the source doesn't cascade-delete the snapshot.

**Status values:** `'draft' | 'final' | 'archived'` — applies to notes and prompts.

**RLS:** enabled on all tables with a permissive `using (true)` policy for v1 single-user mode. When auth is added in v2, swap to `using (auth.uid() = user_id)`.

**Triggers:** `set_updated_at()` on all tables.

**Cascade behavior:** Deleting a project cascades to notes/prompts/checklists/storage. Deleting a checklist parent cascades to its child items.

**Mention storage:** mentions are stored inline as `@[Title](type:id)` in any `content` column. Backlinks are queried via `LIKE '%:itemId)%'`. No separate `links` table.

---

## 6. Architectural decisions (chronological)

| # | Decision | Why |
|---|---|---|
| 1 | **3-panel layout, not 2** | Original spec said 2-panel, but the user's mockup showed 3. |
| 2 | **No auth in v1; hardcoded `LOCAL_USER_ID` env var** | Ships faster. Schema has `user_id` columns + RLS pre-enabled, so v2 auth swap is policy-only, not migration. |
| 3 | **Checklist parent/child on one table** | Spec had a flat `checklists` table — broken. Self-referencing `parent_id`: one table, two roles. |
| 4 | **Optimistic updates everywhere** | Each store mutates state first, then writes to backend. Rolls back on error. Feels instant. |
| 5 | **Imperative confirm dialog** (`confirmDialog({...}) → Promise<boolean>`) | Replaces native `confirm()`. Single mount in App, callable anywhere as a one-liner. |
| 6 | **Mobile-first stack-and-navigate, breakpoint `md` (768px)** | `mobileView` state drives single-panel-at-a-time on mobile, full 3-panel on desktop. |
| 7 | **Command Palette is global-scope** | Fetches up to 100 of each type across all projects via `SearchService.getCorpus()`. |
| 8 | **Templates are pure data** in `src/data/templates.ts` | Adding a template = appending to an array. No component changes. |
| 9 | **Cross-store cleanup on project delete** | `useProjectStore.deleteProject` clears note/prompt/checklist stores when last project goes, to avoid stale UI. |
| 10 | **Layered architecture** (domain / application / infrastructure / presentation) | Stores were directly coupled to Supabase, CRUD was duplicated 5x, and business rules leaked into components. Refactor introduced repository ports + service factories. Domain is now pure TS, fully unit-testable. |
| 11 | **`BaseSupabaseRepository<T>`** | The 5 entity repos shared ~80% of their code (CRUD plumbing). Base class owns `update`, `delete`, `listOrderedBy`, `insertOne`, `insertMany`, `updateManyById`. Subclasses provide table name + entity-specific defaults. |
| 12 | **Composition root** in `infrastructure/composition.ts` | Manual DI. No container library. Singletons created at module load; services consumed via `import { services }`. Total runtime cost: zero. |
| 13 | **Tag normalization in domain** | `normalizeTag` lowercases, trims, strips leading `#`. `dedupeTags` removes case-insensitive duplicates and preserves first-occurrence order. Applied in every service `save`/`create` so the rule has one home. |
| 14 | **Status state machine** (`canTransition`) | `archived → final` is intentionally blocked (must go via `draft`). Enforced at the service layer; UI doesn't need to gate it. |
| 15 | **Storage Vault is per-project, snippet-style** | Spec said "centralized storage." Made it per-project (matches the rest of the IA tree) and skipped real file uploads (would need Supabase Storage bucket + RLS). Snapshots track `source_type` + `source_id` but don't hard-link, so source edits don't propagate. |
| 16 | **Mention syntax: `@[Title](type:id)`** | ID-based, stable across renames. Pre-processor rewrites to `[@Title](mention:type:id)` so the markdown renderer treats it as a normal link; click handler intercepts the `mention:` scheme. Backlinks found via `LIKE '%:itemId)%'`. |
| 17 | **`SearchGateway` for cross-entity reads** | `LinkPicker`, `Backlinks`, and `CommandPalette` previously each did their own raw Supabase queries. Now all three call `services.search.{getCorpus, findBacklinksTo, getProjectId}`. One implementation owns the query shapes. |
| 18 | **Vitest co-located with source** (`*.test.ts` next to file under test) | No separate `tests/` folder — easier to find, easier to keep in sync. 61 tests cover all 5 services + 4 domain rule modules. ~1.2s runtime. |

---

## 7. Critical conventions (don't violate)

### 7.1 Zustand selectors must return stable references

**This is a footgun that crashed the app once.** When a selector returns a new array/object every call, Zustand triggers infinite re-renders.

| Inside selector | Safe? |
|---|---|
| `s.items` (raw access) | ✅ |
| `s.items.find(...)` (returns existing object ref) | ✅ |
| `s.activeId` (primitive) | ✅ |
| `s.items.filter(...)` | ❌ creates new array |
| `s.items.map(...)` | ❌ creates new array |
| `{ a, b }` | ❌ creates new object |
| `[x, y]` | ❌ creates new array |

**Pattern when you need derived data:** select raw inputs, derive with `useMemo`.

```tsx
// ❌ BAD — infinite loop
const items = useStore((s) => s.items.filter((i) => i.parent_id === pid))

// ✅ GOOD
const allItems = useStore((s) => s.items)
const items = useMemo(
  () => allItems.filter((i) => i.parent_id === pid),
  [allItems, pid]
)
```

### 7.2 Where logic lives

The dependency direction is: **components → stores → services → repositories**.

| Layer | Owns | Doesn't touch |
|---|---|---|
| Components | Render, local UI state, store calls | Supabase, business rules |
| Stores | UI state shape, optimistic updates, error logging | Supabase (delegate to services) |
| Services | Use cases, validation, sanitization (e.g. tag dedupe, status guard, save diffing) | DOM, React, raw SQL |
| Repositories | Table queries, row shape | Business rules |
| Domain | Pure functions + types | Anything async, anything React, anything Supabase |

**Never import `@/services/supabaseClient` outside `infrastructure/`.** If a component needs cross-entity data (search, backlinks), call `services.search.*` from the composition root — not Supabase directly.

### 7.3 Optimistic updates

When writing a store mutation:
1. Save the previous state for rollback
2. Mutate local state immediately
3. Call the service
4. On error: log + restore previous state (for destructive ops only — autosave just logs)

Pattern in every store. See `useNoteStore.deleteNote` for the canonical version.

### 7.4 Auto-save uses `useAutoSave` + `service.save(current, next)`

Components don't compute the save patch themselves. The service does the diff via `domain/rules/diffPatch.ts`.

```tsx
const save = useNoteStore((s) => s.save)
const { status, flush } = useAutoSave(
  { title, content, status: noteStatus, tags },
  (next) => (note ? save(note, next) : Promise.resolve())
)
```

The hook returns:
- `status: 'idle' | 'unsaved' | 'saving' | 'saved'` for the footer indicator
- `flush()` for `Ctrl+S` (cancels debounce, persists immediately)

The service's `save(current, next)`:
- Dedupes/normalizes tags
- Rejects illegal status transitions
- Skips the repo write entirely if nothing changed (via `diffPatch`)

### 7.5 Modal & palette state lives in `useUIStore`

Don't add new global state stores for one-off modals. Reuse `searchOpen` pattern.

### 7.6 New domain rules go in `domain/`, not in services

If logic is pure (no IO, no React, no async) and reusable across services, it belongs in `domain/rules/` or `domain/value-objects/`. Add a unit test next to it. Examples: `diffPatch`, `dedupeTags`, `canTransition`, `normalizeTag`, `extractMentions`.

### 7.7 Tests are co-located with source

`Tag.ts` → `Tag.test.ts` in the same folder. `npm test` runs them all. New domain rules and service methods should ship with at least a smoke test.

---

## 8. Feature inventory (what exists)

✅ **Built and working:**

- **Projects** — create, switch, edit (name/color/description/tags), delete with cascade warning. Sidebar tree expands the active project to show its content types.
- **Notes** — markdown editor (preview + edit toggle), auto-save 800ms, pin, status (Draft/Final/Archived), tags, copy-to-clipboard, save-to-storage, insert mention (Link button), backlinks panel.
- **Prompts** — CodeMirror editor (line numbers, syntax highlighting, oneDark in dark mode), auto-save, pin, status, tags, copy, save-to-storage, insert mention, backlinks panel.
- **Checklists** — parent list + child items, progress bar, item-level delete, list-level delete, move-list (with children) to another project.
- **Storage Vault** — per-project snippet store. Snapshots from notes/prompts include `source_type` + `source_id`. Editable name/description/content/tags. Independent of source after creation.
- **Mentions / backlinks** — `@[Title](type:id)` syntax, pill rendering in markdown preview, click-to-navigate (switches project + tab + active item), inline backlinks panel beneath each editor.
- **Command Palette** (`⌘K` / `Ctrl+K`) — global search across notes/prompts/checklists/storage/projects + create actions + theme toggle. All driven by `SearchService.getCorpus()`.
- **3-panel layout** (Sidebar 256px · List 340px · Editor flex-1)
- **Mobile-responsive** — single-panel stack-and-navigate below `md` breakpoint, 768px
- **Dark / light mode** + accent color picker (violet/blue/emerald/orange/rose/cyan, persisted, applied via CSS variables on `<html>`)
- **Settings modal** — theme, accent color
- **Empty-state ghost-card templates** for notes/prompts/checklists
- **Reusable `ConfirmDialog`** (imperative async API, danger variant)
- **Loading skeletons** for list panel + editor

🚫 **Deferred (intentionally not built):**

- Real auth (Supabase Auth) — schema is ready, swap RLS policies when needed
- File uploads to Storage Vault — currently snippet-only. Real files need a Supabase Storage bucket + MIME handling + size limits.
- Versioning / history
- AI execution / runner
- Realtime sync (Supabase Realtime)
- Drag-reorder (`position` columns exist; no UI yet)
- Sidebar item counts
- Group-by-date in lists
- Inbox feature shown in original mockup
- PWA / installable
- Vercel deployment (the app runs locally; not yet deployed)
- `@`-trigger autocomplete-as-you-type (current flow uses the Link button → picker; works in both MDEditor and CodeMirror with one path)
- Component-level smoke tests (RTL + jsdom)
- CI workflow (GitHub Actions)

---

## 9. Recipes — "how do I add X?"

### Add a new starter template

Edit `src/data/templates.ts`. Append to the relevant array. No component changes needed.

### Add a new top-level entity (e.g., a "Bookmarks" tab)

Mirror the Notes shape end-to-end:

1. **Migration** — `supabase/migrations/00X_<name>.sql` with `user_id`, FKs, timestamps, trigger, RLS. Match the existing patterns.
2. **Domain entity** — `src/domain/entities/<Name>.ts`: interface + any entity-level rule functions (copy-title, etc.).
3. **Port** — `src/application/ports/<Name>Repository.ts`: interface declaring `listByProject`, `create`, `update`, `delete`. Add a `New<Name>Input` type.
4. **Service** — `src/application/services/<Name>Service.ts`: factory function `create<Name>Service({ repo, userId })`. Apply tag dedupe + status guards if the entity has them.
5. **Repository** — `src/infrastructure/supabase/Supabase<Name>Repository.ts`: extends `BaseSupabaseRepository<T>`, implements the port. Usually just `listByProject` and `create` need overrides.
6. **Composition** — instantiate the repo + service in `infrastructure/composition.ts`, add to the exported `services` object.
7. **Store** — `src/stores/use<Name>Store.ts`: state + actions that call `services.<name>.*`. NO Supabase imports.
8. **Components** — `src/components/<name>/<Name>List.tsx` + `<Name>View.tsx`. Follow the structure in `notes/` or `storage/`.
9. **Routing** — add to `Tab` type in `src/types/index.ts`, the `TABS` array in `Sidebar.tsx`, the conditional renders in `ListPanel.tsx` + `EditorPanel.tsx`, and the `handleNew` switch in Sidebar.
10. **Search** — if globally searchable, extend `SearchGateway.getCorpus()` and the type meta in `LinkPicker` / `CommandPalette`.
11. **Tests** — `<Name>Service.test.ts` co-located with the service, mirroring `NoteService.test.ts`.

### Add a unit test

Co-locate next to the source: `Foo.ts` → `Foo.test.ts`. Use Vitest:

```ts
import { describe, it, expect, vi } from 'vitest'
```

Domain rules need no mocks. Services take a fake repo (`vi.fn()` for each method). See `application/services/NoteService.test.ts` for the canonical fake-repo pattern.

### Replace `LOCAL_USER_ID` with real Supabase Auth

1. Enable an auth provider in Supabase Dashboard.
2. Replace the permissive RLS policy on each table:
   ```sql
   drop policy "v1 open access" on notes;
   create policy "users see own" on notes
     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
   ```
   Repeat for `projects`, `prompts`, `checklist_items`, `storage_items`.
3. In `infrastructure/composition.ts`, replace the static `LOCAL_USER_ID` with an async user-id resolver that's recreated when auth changes (or rebuild `services` on auth state change).
4. Add an auth gate component above `<Home />` in `App.tsx`.
5. Delete `LOCAL_USER_ID` from `services/supabaseClient.ts` and `.env.example`.

### Use the confirm dialog anywhere

```tsx
import { confirmDialog } from '@/components/shared/ConfirmDialog'

const ok = await confirmDialog({
  title: 'Discard changes?',
  description: 'Optional secondary text.',
  confirmText: 'Discard',
  cancelText: 'Keep editing',
  variant: 'danger',
})
if (ok) { /* ... */ }
```

`<ConfirmDialog />` is mounted once in `App.tsx`. The function is the imperative API.

### Add a new accent color

`App.tsx` holds the `ACCENT_VARS` map. Add a new entry (RGB triplet for each shade + hex pair). Add the literal to `AccentColor` in `useUIStore.ts` and to the `ACCENTS` array in `SettingsModal.tsx`. CSS variables are applied via a Zustand subscription, so updates fire synchronously on selection.

---

## 10. Known gotchas

- **Vite env reload:** changing `.env` requires restarting `npm run dev`. HMR doesn't pick it up.
- **Supabase publishable vs anon key:** the new `sb_publishable_*` format is what we use.
- **`mobileView` is not persisted** — refreshing always lands on `'list'`. Intentional.
- **Active project auto-switching:** deleting the active project switches to the next remaining one. If none left, all dependent stores get cleared to prevent stale data.
- **`useMemo` is not optional** when you'd otherwise write `s.items.filter(...)` in a Zustand selector. See §7.1.
- **Cross-store imports** (`useProjectStore` → `useNoteStore`/`usePromptStore`/`useChecklistStore`) are intentional in `deleteProject` for cascade cleanup.
- **Mention insertion** uses cursor splicing in NoteEditor (textarea selection tracking) and CodeMirror's `view.dispatch` in PromptEditor/StorageView. Don't refactor to "append at end" — it regresses UX.
- **Backlinks `LIKE` query** scans `notes`, `prompts`, `storage_items`. It doesn't scan `checklist_items` (linking from inside a checkbox is unusual). Easy to add if needed.
- **Schema cache lag:** Supabase caches table schema for ~30s after `ALTER TABLE`. If a migration just ran and you see "column not found," wait or hard-reload.
- **CodeMirror dark mode bg:** oneDark sets its own background; we override with transparent in `index.css` so it sits on the editor surface (zinc-950) cleanly.
- **The editor header/footer use `bg-white dark:bg-zinc-900`** while the content area is `bg-white dark:bg-zinc-950`. Banded look — matches the sidebar/list bands across the top and bottom of the app. Don't unify them.

---

## 11. Style & code conventions

- **No comments unless WHY is non-obvious.** Code should be self-documenting via clear names.
- **No emojis in code or UI** unless explicitly requested.
- **Imperative > declarative for one-off modals/dialogs** (see ConfirmDialog).
- **Prefer composition over abstraction.** Three similar components is fine; don't preemptively abstract.
- **No defensive null checks** for invariants the type system guarantees.
- **Tailwind classes**: use `clsx` for conditionals, never string-concat.
- **Lucide icons** sized via `h-N w-N` (typically `h-4 w-4` for inline, `h-3.5 w-3.5` for hover-revealed).
- **Dark mode:** every visual style needs a `dark:` variant. Tailwind `darkMode: 'class'`.
- **Snake_case in entities** matches the DB shape directly. No row-mapping in the repository layer. We may flip to camelCase later as a separate refactor; it's not currently needed.
- **Tag normalization is universal** — services dedupe on save/create. Components don't need to (and shouldn't) implement their own normalization.

---

## 12. Scope status (V1 → V1.5)

The original v1 boundary was deliberately tight: notes/prompts/checklists per project, no auth, no tags, no AI. The point was daily usage, not feature completeness.

V1.5 (this codebase) added, deliberately:

- **Tags** on projects/notes/prompts/storage (was excluded; user requested it directly)
- **Status states** Draft/Final/Archived (new in v1.5)
- **Storage Vault** as a 4th content type (was deferred; built per the v2 spec)
- **Mentions + backlinks** (was deferred; built per the v2 spec)
- **Settings modal** with theme + accent color (new)
- **Layered architecture refactor** (decoupled stores from Supabase, introduced services + ports)

V1.5 is still intentionally **not** doing: auth, file uploads, versioning, AI execution, realtime, drag-reorder, deployment.

When in doubt about scope: choose less. New scope additions need a clear "I've used the app for X days and feel the pain of not having Y" signal.

---

## 13. Memory / context tips for future AI sessions

- Read this file first, then `README.md` for setup commands, then `supabase/migrations/` for the DB shape.
- The original product spec is in the conversation history at session start. Several parts were deliberately deviated from — see §6 for what changed and why.
- The owner's collaboration preferences: terse, structured, push back on bad ideas, MVP-first, profitability-aware. They want CTO-style guidance, not yes-man execution.
- When in doubt about scope: choose less.
- When in doubt about architecture: keep the dependency direction inward. Don't let infrastructure types leak past `infrastructure/`. Don't let Supabase imports leak past it either.
- When in doubt about adding abstraction: don't. Three similar files is fine. Abstract on the third real duplication, not the first imagined one.
