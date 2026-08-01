# Spec B: Next.js Rewrite (Mountaintop Dispatch Manager)

**Date:** 2026-08-01
**Repo:** `/Users/gian/Coding/Mountaintop-Dispatch-Manager`
**Status:** Draft, awaiting review

---

## 1. Problem

The app is a 1,759-line `app.js` and a 491-line `index.html` with no build step, no module system, and no type safety. Every handler is bolted onto `window`, every state change calls a global `render()` that rebuilds the DOM by string concatenation, and all state lives in a mutable module-level `soData` array.

This works, and it is fast to change in the small. It fails at:
- **Reasoning about correctness.** `createCardHTML` (`app.js:1225`) is a 160-line template literal producing HTML with inline `onclick` handlers that reference globals. Any refactor there is unverifiable without clicking through the UI.
- **Testing.** The only tests are Cypress end-to-end, which means every unit of logic is only testable through a browser.
- **Onboarding anyone else.** There are no boundaries. `render()` (`app.js:975`) is coupled to filters, tabs, RBAC, sorting, pagination, and both app modes simultaneously.

### Why the last attempt failed

Commit `0bbbd92` ("migrate project to Next.js and relocate legacy code") scaffolded a fresh `create-next-app`, moved everything into `legacy/`, and stopped. It ported zero features. It sat on a branch for four weeks, got merged in `df4eadb`, then reverted the same day in `308aede`.

The lesson is not "Next.js was wrong." The lesson is that a scaffold plus a `legacy/` folder is not a migration. This spec is a parity plan, not a scaffold plan. Scaffolding is step 1 of 9, not the deliverable.

---

## 2. Goals

1. Feature parity with the current vanilla app. Every behavior in `app.js` works identically after the cutover.
2. The 1,759-line file becomes typed modules with explicit boundaries, none of which need the whole app in your head.
3. Unit-testable business logic (filters, duplicate detection, performance math, date handling) separated from rendering.
4. Deploy to Vercel with real environment variables instead of hardcoded keys.

### Non-goals

- **No new features.** Spec C covers those. Adding features during a port is how ports die.
- No visual redesign. The UI should look the same to users on cutover day.
- No changes to the `service_orders` schema. Spec A owns the one schema change in flight (the SLR ticket unique index).
- No changes to the Apps Script bridge.

---

## 3. Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | Next.js 15, App Router | Chosen. Server components for the initial data fetch, client components for realtime. |
| Language | TypeScript, strict | The whole point. `service_orders` types generated from Supabase. |
| Styling | Tailwind v4 | Already using Tailwind via CDN (`index.html:9`). Moving to a real build removes the CDN script and the FOUC. |
| Auth | `@supabase/ssr` | Replaces the current client-only Google OAuth. Gives middleware-level route protection. |
| Server state | TanStack Query | Replaces the global `soData` array and manual `render()` calls. Realtime events become cache invalidations. |
| Charts | Recharts | Replaces Chart.js CDN (`index.html:11`). React-native, no imperative instance handling (`lineChartInstance`, `pieChartInstance` at `app.js:57`). |
| Icons | `lucide-react` | Replaces the FontAwesome CDN stylesheet. |
| Forms | React Hook Form + Zod | Replaces manual `getElementById().value` reads across `saveSO` and `saveBulkSO`. |
| Tests | Vitest (unit) + Playwright (e2e) | Existing Cypress suite gets ported; see 7. |
| Hosting | Vercel | Replaces Netlify. |

---

## 4. Architecture

### Route structure

```
app/
  layout.tsx                    root, theme provider, query provider
  login/page.tsx                Google OAuth (from index.html:18-36)
  (app)/
    layout.tsx                  header, mode switcher, tab nav, filter bar
    inbox/page.tsx              status = 'pending'      admin/dev only
    dispatched/page.tsx         status = 'active'
    history/page.tsx            status = 'done'
    performance/page.tsx        analytics
  auth/callback/route.ts        Supabase OAuth code exchange
middleware.ts                   session refresh + route gate
```

Tabs become real routes. Currently `switchTab` (`app.js:217`) toggles `hidden` classes on divs and there is no URL state, so a dispatcher cannot bookmark or share a view. Routes fix that for free.

### Module boundaries

```
lib/
  supabase/
    client.ts                   browser client
    server.ts                   server client
    middleware.ts               session refresh helper
    types.ts                    generated from the live DB
  domain/
    serviceOrder.ts             ServiceOrder type, status/type/mode enums
    filters.ts                  pure: (orders, FilterState) -> orders
    duplicates.ts               pure: from checkSLRDuplicate / checkSLIDuplicate
    performance.ts              pure: from renderPerformance, all the period math
    dates.ts                    pure: from parseSafeDate / isSameDay / parseDateInput
    rbac.ts                     pure: (role, team, order) -> visible boolean
  data/
    serviceOrders.ts            all db reads/writes, one place
    authorizedEmails.ts         role lookup
hooks/
  useServiceOrders.ts           TanStack Query + realtime subscription
  useCurrentUser.ts             session + role + team + impersonation
  useFilters.ts                 filter state in URL search params
components/
  ServiceOrderCard.tsx          from createCardHTML
  ServiceOrderList.tsx          from renderList, incl. pagination
  FilterBar.tsx                 from the search/filter section
  tabs/InboxTab.tsx
  tabs/DispatchedTab.tsx
  tabs/HistoryTab.tsx
  tabs/PerformanceTab.tsx
  modals/DispatchFormModal.tsx  from saveSO
  modals/BulkDispatchModal.tsx  from saveBulkSO
  modals/SettingsModal.tsx      from toggleSettings / renameTeam / deleteTeam
  DevImpersonationBar.tsx       from applyImpersonation
```

The `lib/domain/*` modules are pure functions with no DOM and no Supabase. They are the unit test surface. Everything currently untestable in `app.js` lives here after the port.

### Data flow change

**Current:** page load fetches the entire `service_orders` table in 1,000-row pages until exhausted (`app.js:437-450`), stuffs it into a global array, then filters client-side on every keystroke. At 8k+ SLR rows plus SLI rows this is already a multi-megabyte payload on every load.

**After:** server component fetches the first page for the active tab with a server-side filter (`status`, `type`, and for tech users their `team`). Client subscribes to realtime and invalidates the query on change. Filters that can push to the server (status, type, team, area, date range) do. Free-text search stays client-side over the loaded page.

This is a behavior change worth calling out explicitly: **the History tab will no longer have every historical ticket in memory.** It gets server-side pagination. Any code that assumed a complete `soData` (notably the duplicate checks at `app.js:513` and `app.js:555`, which scan the full array) must be reworked into a server query. That is a correctness improvement, since those checks are currently only as complete as what happened to be loaded.

---

## 5. Known defects to fix during the port

These are carried over as fixes, not new features:

| Issue | Location | Fix |
|---|---|---|
| Anon keys hardcoded, prod/sandbox switched on `window.location.hostname` | `app.js:7-16` | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` per Vercel environment |
| `deleteTeam` deletes every service order for a team | `app.js:792` | **Resolved 2026-08-02: `service_orders` rows are never deleted** (Mountaintop's Performance tab aggregates full history; a delete silently changes historical stats — same rule that drove the Spec A duplicate-ticket fix). Must reassign affected rows to `Unassigned` instead of deleting them. No longer an open question. |
| Bulk dispatch deletes "duplicate" inbox rows then inserts new ones | `app.js:944-950` | Also violates the never-delete rule. Rework to `UPDATE` the existing inbox row in place (promote `pending` → `active` on the same row) instead of delete-then-insert, which also fixes the side effect of losing the original row's id/history. |
| Full-table paginated fetch on every load | `app.js:437` | Server-side filtered pagination (Section 4) |
| Duplicate checks only scan loaded data | `app.js:513`, `app.js:555` | Server-side existence query |
| `addNewTeam` is a stub that shows an alert telling users to contact the developer | `app.js:248` | Either implement or remove the button |
| Cypress test bypass ships in production code | `app.js:286` | Test seams belong in test config, not `app.js` |
| `DATABASE_CONTEXT.md` has two rules numbered 4 | `DATABASE_CONTEXT.md:42-43` | Renumber while updating it |
| Dead files at repo root | `temp_old_app.js` (1,371 lines), `debug_tech.html`, `test-date.html`, `check_sandbox.js`, `test_db.js`, `.next/` | Delete or move under `scripts/` |

---

## 6. Parity checklist

This is the acceptance criteria. Cutover does not happen until every line is checked against the live vanilla app.

**Auth and RBAC**
- [ ] Google OAuth login, unauthorized email rejected with the same error message
- [ ] `tech` role sees only `active` tickets for their own team
- [ ] `admin` / `developer` see all tabs including Inbox
- [ ] Developer impersonation bar switches role and team
- [ ] Logout clears session

**Inbox (pending)**
- [ ] Pending count badge
- [ ] Assign team, then approve, moves ticket to active with `dateAdded` set
- [ ] Edit a pending ticket before approving
- [ ] Delete a pending ticket
- [ ] Auto-lands on Inbox when pending exist and user is admin

**Dispatched (active)**
- [ ] Field tech checklist toggles (`pic`, `pwr`, `speed`, `rpt`) persist
- [ ] Tech remarks save
- [ ] Mark done sets `status`, `tech_remarks`, `dateDone`
- [ ] Reschedule returns ticket to pending and clears `dateAdded`
- [ ] Tech "Today Only" toggle defaults on for tech role

**History (done)**
- [ ] Processed / Unprocessed toggle writes `is_processed` and `date_processed`
- [ ] PROCESSED badge renders
- [ ] Accomplished-logs sort and show-count controls

**Filters (all tabs)**
- [ ] Search field selector plus free-text search
- [ ] Date filter, team filter, area filter, barangay filter (dependent on area)
- [ ] Clear all filters
- [ ] Case-insensitive and whitespace-trimmed matching preserved

**Performance**
- [ ] Global efficiency percentage and progress bar
- [ ] This Month / Last Month / Select Month period picker
- [ ] Tickets-resolved line chart
- [ ] Trouble-types pie chart
- [ ] Per-team stat cards
- [ ] Per-area rows

**Modes and modals**
- [ ] SLR / SLI mode switch changes labels, icons, and filters `type`
- [ ] Manual dispatch modal creates a ticket, including duplicate warning
- [ ] Bulk paste modal parses multi-column spreadsheet paste into tickets
- [ ] Settings modal: rename team, delete team
- [ ] CSV export

**Cross-cutting**
- [ ] Dark mode toggle, persisted to localStorage
- [ ] Realtime: a change made in one browser appears in another without refresh
- [ ] Apps Script push still lands in Inbox
- [ ] `syncStatusFromSupabase` still reads back correctly

---

## 7. Implementation order

Strictly sequential. Each step ends with the app in a working state.

1. **Scaffold.** Next.js 15 + TS + Tailwind v4 on a `nextjs-rewrite` branch. Delete dead root files. Generate Supabase types. Vercel preview deploy wired up. Vanilla app stays untouched on `main` and stays live.
2. **Auth + shell.** Login page, OAuth callback, middleware gate, RBAC hook, app layout with header and tab nav. No data yet.
3. **Domain layer.** Port `dates.ts`, `filters.ts`, `duplicates.ts`, `rbac.ts`, `performance.ts` as pure functions. **Write Vitest tests for each as they are ported.** This is the step where the current logic gets pinned down; do not skip it, because everything after depends on these being right.
4. **Data layer + realtime hook.** `lib/data/serviceOrders.ts`, `useServiceOrders`. Verify against real data.
5. **Card + list.** `ServiceOrderCard`, `ServiceOrderList`, `FilterBar`. Once this renders, three of four tabs are mostly done.
6. **Tabs.** Inbox, Dispatched, History. All mutations wired.
7. **Performance tab.** Recharts, period picker.
8. **Modals.** Manual dispatch, bulk paste, settings, CSV export.
9. **Cutover.** Full parity checklist against production data. Playwright suite green. Deploy to Vercel, point the domain, keep the Netlify deploy live and reachable for one week as rollback.

Steps 1 through 3 are the highest-value and lowest-risk. If the project stalls again, stalling after step 3 still leaves a tested domain layer that the vanilla app could adopt.

---

## 8. Testing

**Unit (Vitest).** Everything in `lib/domain/`. Target: the performance period math, date parsing, and duplicate detection have tests covering the edge cases currently discovered only in production. `parseSafeDate` (`app.js:102`) and `isSameDay` (`app.js:118`) have both been the subject of past bugfix commits (`0b9f98f` "localdatestring fix", `3bd4e04` "history tab fix for today only filter"), which makes them prime candidates for regression tests written from those commits.

**Component (Vitest + Testing Library).** `ServiceOrderCard` in both SLR and SLI modes, for each status, for each role.

**E2E (Playwright).** Port the existing `cypress/` specs. Run against a seeded sandbox project (`fqxturtabhbpgbizriss`, already used as the debug DB). The current Cypress bypass hack (`app.js:286`) becomes a Playwright storage-state fixture instead of production code.

**Manual.** The Section 6 parity checklist, run side by side against the live vanilla app.

---

## 9. Open items for review

1. ~~`deleteTeam` semantics~~ — **Resolved 2026-08-02.** Never delete `service_orders` rows; reassign to `Unassigned` instead. See Section 5.
2. **Domain name and cutover.** Current live URL is `mountaintop-dispatch-manager.netlify.app`. Is there a custom domain, or does the Netlify URL need to keep working after moving to Vercel?
3. ~~SLI data source~~ — **Answered.** SLI comes from a separate Google Sheet tracker (independent of `SLR DAILY MONITORING`) whose only job is pushing rows into the same `service_orders` table. It was bolted on after SLR was already integrated with the dispatch app, which is why `ticket_no`/`JO No.` conventions differ between the two and why cross-type placeholder collisions showed up during the Spec A duplicate-key work (Section 5). No dedicated GAS repo for SLI has been identified yet — worth locating before the port so its push logic is understood too.
4. **`get_all_teams` RPC.** Used at `app.js:453` but not documented in `DATABASE_CONTEXT.md`. Needs its definition captured before the port.
5. **Rollback window.** One week of parallel Netlify is proposed. Confirm that is enough.
6. **`is_processed` / `date_processed` columns don't exist on `service_orders`** (found 2026-08-02 while investigating the duplicate-key issue — confirmed via `information_schema.columns`). `toggleProcessed` (`app.js:610-636`) already has a silent fallback for this ("Fallback if schema doesn't have is_processed column yet"), meaning the Done-Processed tagging feature currently only updates in-memory state and resets on page refresh. This needs the two columns actually added to `service_orders`; not blocking this spec, but should be fixed before or during the port rather than carried over as a latent bug.
