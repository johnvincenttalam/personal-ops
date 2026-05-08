# Personal OPS

Fast, no-friction tool for managing **prompts, notes, checklists, and reusable storage snippets** organized by project — with cross-item `@` mentions and backlinks.

> 📘 **For AI assistants and contributors:** read [`AGENTS.md`](./AGENTS.md) first. It has the architectural context, conventions, and gotchas you need to work on this project safely.

---

## Setup

```bash
npm install
cp .env.example .env
```

Fill `.env` with values from your Supabase project (Dashboard → Project Settings → API):

```
VITE_SUPABASE_URL=https://<your-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_LOCAL_USER_ID=00000000-0000-0000-0000-000000000001
```

`VITE_LOCAL_USER_ID` is a single-user-mode placeholder for v1 — replace with real auth in v2.

Then in Supabase SQL Editor, run all migrations under `supabase/migrations/` in order.

```bash
npm run dev
```

Open http://localhost:5173.

---

## Features

- **Projects** with color, description, tags, and a sidebar tree that nests content types under the active project
- **Notes** — markdown editor with edit/preview toggle, auto-save, pin
- **Prompts** — CodeMirror editor with line numbers + syntax highlighting, copy-to-clipboard
- **Checklists** — parent list + child items, progress bar, move-to-project (with children)
- **Storage Vault** — per-project snippet store. "Save to Storage" button on notes/prompts captures a frozen snapshot
- **Status states** — Draft / Final / Archived (notes + prompts)
- **Tags** on every content type, normalized + deduped automatically
- **Mentions + backlinks** — `@[Title](type:id)` syntax, picker-driven insertion, click-to-navigate, inline backlinks panel under each editor
- **Command Palette** (`⌘K` / `Ctrl+K`) — global search + quick actions
- **Settings** — theme (light/dark) + accent color (6 options)
- **Mobile-responsive** — single-panel stack-and-navigate on small screens, 3-panel on desktop
- **Auto-save** with status indicator (idle / unsaved / saving / saved); `Ctrl+S` to flush

---

## Architecture

The codebase is layered: **`domain/` → `application/` → `infrastructure/` → presentation (`stores/`, `components/`)**. Supabase is contained inside `infrastructure/`; nothing else imports it. Domain logic (status transitions, tag dedupe, mention parsing, save diffing) is pure TypeScript and unit-tested.

See [`AGENTS.md`](./AGENTS.md) for the full architecture, conventions, and "how to add X" recipes.

---

## Stack

React 18 · Vite · TypeScript · TailwindCSS · Zustand · Supabase · `@uiw/react-md-editor` · `@uiw/react-codemirror` · `cmdk` · `lucide-react` · `date-fns` · Vitest

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run unit test suite (Vitest) |
| `npm run test:watch` | Watch-mode tests |
| `npm run lint` | ESLint |

---

## Deploy

- **Frontend:** Vercel — set the `VITE_*` env vars in the dashboard
- **Backend:** Supabase Cloud (already provisioned)

---

## Project context

For architectural decisions, conventions, "how to add X" recipes, and what's deliberately scoped out, see [`AGENTS.md`](./AGENTS.md).
