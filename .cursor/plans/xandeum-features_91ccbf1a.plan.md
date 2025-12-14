---
name: xandeum-features
overview: "Turn the current Next.js scaffold into a working pNode analytics dashboard: server-side pRPC aggregator + cached API routes + directory/detail/compare pages built with shadcn UI."
todos: []
---

# Xandeum pNode Analytics — Feature Implementation Plan (Post-Scaffold)

## Current scaffold (what’s already true)

- App Router is set up under [`app/`](app/): [`app/layout.tsx`](app/layout.tsx), [`app/page.tsx`](app/page.tsx), Tailwind v4 tokens in [`app/globals.css`](app/globals.css).
- shadcn is configured via [`components.json`](components.json) and the `cn()` helper exists in [`lib/utils.ts`](lib/utils.ts), but there are **no UI components installed yet** under `components/ui/`.
- TypeScript path alias is root-based: `@/* -> ./*` ([`tsconfig.json`](tsconfig.json)).

## Assumptions (so we can start building immediately)

- **pRPC is reachable over HTTP** from the Next.js server (Route Handlers) using an env var `PRPC_HTTP_URL`.
- If the exact method names/response shapes aren’t finalized yet, we’ll keep a **mock provider** and make method names configurable via env.
- Start with **in-process TTL caching** (good for local dev + MVP). Add Redis/KV later if needed.

## MVP scope (what “feature-complete” means for v0)

- `/pnodes`: **Directory table** of all pNodes discovered via gossip list, with search/sort/filter + status chips + “last updated”.
- `/pnodes/[id]`: **Detail page** with canonical fields + a “Raw payload” tab for transparency.
- `/`: **Overview** with KPI cards (counts by status + total gossip nodes + last refresh time).
- `/compare?ids=a,b,c`: basic side‑by‑side compare for key fields.
- `/about`: methodology + caching/refresh explanation.

## Architecture (repo-aligned)

```mermaid
flowchart TD
  Browser[Browser_UI] -->|GET| ApiSnapshot[/api/pnodes/snapshot]
  Browser -->|GET| ApiNode[/api/pnodes/{id}]

  ApiSnapshot --> Service[lib/pnodes/service]
  ApiNode --> Service

  Service --> Provider[lib/prpc/provider]
  Provider -->|live| PrpcHttp[(PRPC_HTTP_URL)]
  Provider -->|mock| MockData[(fixtures)]

  Service --> Cache[(TTL_cache_in_memory)]
```

### Key modules (create these at repo root to match `@/*`)

- [`lib/prpc/`](lib/prpc/): transport + method wrappers + boundary validation
- [`lib/pnodes/`](lib/pnodes/): canonical types + service orchestration + scoring
- [`components/`](components/): shared UI (KPI cards, status chips, table wrapper)
- [`app/api/`](app/api/): Next Route Handlers (server aggregator)

## Implementation steps (ordered for fastest end-to-end progress)

### 1) UI foundation (layout + navigation)

- Update [`app/layout.tsx`](app/layout.tsx) to include an app shell:
  - top nav links: Overview, pNodes, Compare, About
  - “Last updated” area (hooked to snapshot timestamps later)
- Replace the default contents of [`app/page.tsx`](app/page.tsx) with a real Overview skeleton.

### 2) Install shadcn UI primitives you’ll use everywhere

Add (at minimum): `button`, `card`, `badge`, `tabs`, `table`, `input`, `select`, `dropdown-menu`, `tooltip`, `separator`, `skeleton`.

- This will create `components/ui/*` and enable consistent primitives.

### 3) Canonical domain model + status scoring

Create:

- [`lib/pnodes/types.ts`](lib/pnodes/types.ts): `PNodeId`, `PNodeGossipRecord`, `PNodeDetails`, `PNodeSnapshotRow`, `PNodeStatus`, `StatusReason`.
- [`lib/pnodes/scoring.ts`](lib/pnodes/scoring.ts): `scorePNode(row) -> { status, reasons[] }` (keep rules simple at first: reachable + in gossip + fresh).
- [`lib/pnodes/formatters.ts`](lib/pnodes/formatters.ts): `shortId`, `formatMs`, `formatBytes`, `formatRelativeTime`.

### 4) pRPC layer (live + mock) with a stable boundary

Add deps: `zod` (validation). Optionally `p-limit` (concurrency limiting) if needed.

Create:

- [`lib/prpc/client.ts`](lib/prpc/client.ts): HTTP client w/ timeout + retries (AbortController).
- [`lib/prpc/methods.ts`](lib/prpc/methods.ts): typed wrappers; method strings sourced from env/config.
- [`lib/prpc/schemas.ts`](lib/prpc/schemas.ts): zod schemas that parse pRPC responses into canonical shapes (start permissive; keep `raw`).
- [`lib/prpc/provider.ts`](lib/prpc/provider.ts): `listGossipPNodes()`, `getPNodeDetails(id)` that can use live or mock mode.
- [`lib/prpc/mock.ts`](lib/prpc/mock.ts) + [`lib/prpc/fixtures.json`](lib/prpc/fixtures.json): deterministic sample payloads.

### 5) Server aggregator API routes (the app’s stable contract)

Create:

- [`app/api/pnodes/snapshot/route.ts`](app/api/pnodes/snapshot/route.ts):
  - fetch gossip list
  - (optional) enrich a small subset or none initially
  - compute status for each row
  - return `{ generatedAt, stale, rows[] }`
- [`app/api/pnodes/[id]/route.ts`](app/api/pnodes/[id]/route.ts):
  - fetch per-node details
  - return `{ generatedAt, stale, details, raw }`

Caching:

- implement a tiny TTL cache module (e.g. [`lib/cache/ttl.ts`](lib/cache/ttl.ts)) used by both routes.
- if live calls fail, return cached value with `stale: true`.

### 6) Build the pages (directory → detail → overview → compare)

- [`app/pnodes/page.tsx`](app/pnodes/page.tsx):
  - table UI + search/filter/sort via query params
  - row click → `/pnodes/[id]`
- [`app/pnodes/[id]/page.tsx`](app/pnodes/[id]/page.tsx):
  - header stats + tabs (Overview, Meta)
  - show “Raw payload” pretty-printed
- [`app/page.tsx`](app/page.tsx): KPI cards from snapshot
- [`app/compare/page.tsx`](app/compare/page.tsx): parse `ids`, fetch each detail, render side-by-side
- [`app/about/page.tsx`](app/about/page.tsx): methodology + limits

Data fetching:

- either keep it simple with Server Components fetching from your route handlers, or add `@tanstack/react-query` if you want client-side polling + caching.

### 7) Polish (what makes it feel “judge-ready”)

- Skeleton loading states and explicit empty/error states
- Status “Why?” tooltip listing the scoring reasons
- Copy-to-clipboard for IDs/endpoints
- “Data as of …” timestamp + stale banner

### 8) Tests + docs (lightweight but high-signal)

- Unit tests for `scoring.ts` and `schemas.ts` (Vitest recommended)
- Update [`README.md`](README.md) with:
  - env vars
  - how gossip discovery works
  - caching/refresh policy
  - run + deploy steps

## Environment variables (start minimal)

- `PRPC_HTTP_URL` (required for live mode)
- `PRPC_MODE=mock|live` (default mock for UI work)
- Optional: `PRPC_AUTH_HEADER` / `PRPC_AUTH_TOKEN` if required by the endpoint

## Implementation todos

- `ui-shell`: Add app shell/nav; replace default home screen
- `shadcn-primitives`: Add required `components/ui/*` primitives
- `domain-types`: Create canonical pNode types + scoring + formatters
- `prpc-layer`: Implement pRPC client + schemas + provider (live/mock)
- `api-snapshot`: Build `/api/pnodes/snapshot` with TTL cache + stale fallback
- `api-node`: Build `/api/pnodes/[id]` with TTL cache + stale fallback
- `ui-directory`: Implement `/pnodes` table with search/filter/sort + compare selection
- `ui-detail`: Implement `/pnodes/[id]` with tabs + raw payload viewer
- `ui-compare-about`: Implement `/compare` + `/about`
- `quality-docs`: Add minimal tests + update README