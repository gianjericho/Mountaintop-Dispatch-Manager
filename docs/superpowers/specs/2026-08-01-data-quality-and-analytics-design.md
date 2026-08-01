# Spec C: Data Quality, Sync Health, and Analytics (Mountaintop Dispatch Manager)

**Date:** 2026-08-01
**Repo:** `/Users/gian/Coding/Mountaintop-Dispatch-Manager` (plus Apps Script changes in `SLR DAILY MONITORING`)
**Status:** Draft, awaiting review

---

## 1. Origin

Two user requests came in via the 2026-08-01 screenshot thread:

1. "Pwede kaya magkaroon ng tagging na done processed na? Kasi medyo nakakalito kung ano yung mga bagong report nila tech."
2. "Pwede kaya magkaroon ng option dito for month selection or date range? Para mas accurate yung calculation ng tickets nina tech."

**Both are already shipped** (`app.js:610`, `app.js:1338`, `index.html:144`). The remaining ask is the third line: "give me suggestions pa rin na mas maganda."

This spec is that suggestions list, scoped to the two areas selected: **data quality and sync health**, and **analytics and reporting**.

---

## 2. Why these two areas

The system has three write paths into `service_orders` (Apps Script push, dispatcher manual entry, dispatcher bulk paste) and one write path back out (`syncStatusFromSupabase`). Nobody can currently see whether any of them is working. When a ticket goes missing between the sheet and the dispatch board, there is no way to find out where it went short of reading the Apps Script execution log.

Meanwhile the Performance tab computes exactly four things: a global efficiency percentage, tickets resolved over time, trouble types, and per-team totals. That answers "how are we doing this month." It does not answer "which accounts keep breaking," "how long does a ticket actually take," or "which tech is carrying the team," which are the questions that change how work gets assigned.

---

## 3. Dependencies and sequencing

| This spec assumes | Why |
|---|---|
| Spec A's `_SYNC_ERR` column and error surfacing | C1.1 reads sync failure state that Spec A creates |
| Spec A's Supabase unique index on SLR `ticket_no` | C1.2 becomes far simpler once duplicates cannot be inserted at all |
| Spec B's React rewrite | Every UI item here is substantially cheaper to build in React with Recharts than as string-concatenated HTML plus imperative Chart.js |

**Recommended order: A, then B, then C.** Building C on the vanilla app means building it twice. The exception is C1.1 (sync heartbeat) and C0 (the `assigned_tech` column), which are backend-only and can land any time.

---

## 4. C0: Data model prerequisites

Three of the analytics items below are blocked on data that does not exist yet.

### C0.1 Per-tech attribution

`service_orders` has `team` but no individual technician. The sheet has an `ASSIGNED TECH` column (`Code.gs:315`) that is written on entry and then **never pushed to Supabase** (`Supabase.gs:102-119` does not include it). Per-tech analytics is impossible until this is fixed.

- Add `assigned_tech text` to `service_orders`.
- Add `assigned_tech` to the `autoDispatchToSupabase` payload.
- Add a tech selector to the dispatch app's assign flow, so tickets created in-app also get it.
- Backfill from the sheet by joining on `ticket_no`.

### C0.2 Timestamp integrity

Turnaround-time metrics need reliable start and end times. Currently:
- `date_reported` is text copied from the sheet
- `dateAdded` is text, `new Date().toLocaleDateString('en-US')` (`app.js:793`)
- `dateDone` is text, same format
- `date_processed` is text

These are date strings with no time component and no timezone, in at least two different formats depending on write path. Any duration math on them is approximate at best.

- Add `created_at`, `dispatched_at`, `completed_at`, `processed_at` as `timestamptz`, defaulting `created_at` to `now()`.
- Write both the new timestamps and the existing text columns during a transition period so nothing breaks.
- Backfill the timestamp columns from the text columns where parseable, leaving null where not. Do not fabricate values.

### C0.3 Audit trail table

```sql
create table service_order_events (
  id bigserial primary key,
  order_id uuid not null references service_orders(id) on delete cascade,
  actor_email text,
  action text not null,        -- created | assigned | approved | done | reopened | processed | edited | deleted
  field text,                  -- for 'edited'
  old_value text,
  new_value text,
  source text not null,        -- apps_script | dispatch_app
  at timestamptz not null default now()
);
create index on service_order_events (order_id, at desc);
```

Written by a Postgres trigger on `service_orders` rather than by application code, so the Apps Script path is covered without changes to `Supabase.gs`. `actor_email` comes from `auth.jwt()` where available and is null for service-role writes.

This is the single highest-value item in the spec. Without it, "who marked this done and when" is unanswerable.

---

## 5. C1: Data quality and sync health

### C1.1 Sync health panel

A new admin-only section (Settings modal, or a dedicated `/health` route in the Spec B structure) showing:

| Metric | Source |
|---|---|
| Last successful Apps Script push, with row count | new `sync_log` table |
| Last successful pull-back (`syncStatusFromSupabase`) | same |
| Rows in the sheet that are complete but unpushed | requires the Apps Script to report this count |
| Rows with `_SYNC_ERR` set | same |
| Realtime channel connection state | client-side, from the Supabase channel |

New table:

```sql
create table sync_log (
  id bigserial primary key,
  direction text not null,     -- push | pull
  ran_at timestamptz not null default now(),
  rows_affected int not null default 0,
  rows_failed int not null default 0,
  stuck_row_count int,
  error_text text
);
```

`autoDispatchToSupabase` and `syncStatusFromSupabase` each write one row per run. The panel reads the latest of each direction and shows a red state if the newest push is older than 15 minutes (given a 5-minute trigger interval).

**Value:** turns "tickets aren't showing up, is it broken?" from a support conversation into a glance.

### C1.2 Data issues list

A single screen listing every record the system considers suspect, each with a resolve action.

**Hard rule (established 2026-08-02, applies to every check below): `service_orders` rows are never deleted.** Mountaintop's Performance tab aggregates across full history, so removing a row silently changes historical stats. This was confirmed while fixing the SLR/SLI duplicate `ticket_no` problem in Spec A — 16 true duplicate pairs existed in prod, and the fix was to relabel one row's `ticket_no` (appending a disambiguating suffix) rather than delete it, leaving every other field and the total row count untouched. Every "resolve" action in this spec follows the same pattern: relabel, flag, or merge-without-removing — never `DELETE FROM service_orders`.

| Check | Definition | Action offered |
|---|---|---|
| Duplicate ticket number | same `type`, `ticket_no`, `account_no`, `date_reported` on 2+ rows | Relabel the extra row's `ticket_no` (append a suffix) so it's flagged as a resolved duplicate but stays in history |
| Duplicate account per day | same `account_no` and `date_reported` | Link the rows to each other (a `duplicate_of` column) rather than merging/deleting either |
| Repeat within 7 days | same `account_no`, 2+ tickets in 7 days | Not an error. Link them and flag as repeat trouble (see C2.3) |
| Stale pending | `status = 'pending'` older than 3 days | Assign or cancel |
| Stale active | `status = 'active'` older than 7 days | Nudge team, or force-close |
| Active with no team | `status = 'active'` and `team` is null or 'Unassigned' | Assign |
| Done with no completion date | `status = 'done'` and `completed_at` is null | Set from audit trail |
| Done, unprocessed, aged | `status = 'done'`, `is_processed = false`, older than 7 days | Direct link to process it |
| Missing coordinates | `long_lat` empty | Flag for encoder |

Implemented as a Postgres view per check, unioned into one `data_issues` view with `(issue_type, order_id, severity, detail)`. The UI is then a single query plus a filter chip row, and adding a tenth check later is a view change with no UI work.

### C1.3 Reconciliation report

The one check that cannot live in Postgres: rows present in `DAILY REPORT` but absent from `service_orders`, and the reverse.

An Apps Script function `reconcileWithSupabase()` runs nightly, pulls all SLR `ticket_no` values from Supabase, diffs against the sheet, and writes the result to `sync_log` plus a `RECONCILIATION` sheet listing each orphan on both sides.

This is what catches the failure mode nothing else catches: a row that got `_SYS_REF = 1` stamped but whose POST silently failed. The current code stamps `_SYS_REF` for the whole batch after a single `UrlFetchApp.fetch` without checking the response code (`Supabase.gs:139-142`), so this failure is not hypothetical.

### C1.4 Audit timeline on the card

Expandable section on each ticket card showing its `service_order_events` history: created by Apps Script, assigned to Team X by dispatcher@..., marked done by tech@..., processed by dispatcher@.... Read-only.

---

## 6. C2: Analytics and reporting

### C2.1 Per-technician leaderboard

Blocked on C0.1. Adds a tech-level breakdown alongside the existing team cards: tickets completed, average turnaround, repeat rate, in the selected period. Sortable.

The existing per-team view answers "which team," which is not actionable when a team's number is being carried by one person.

### C2.2 Turnaround time

Blocked on C0.2. Three metrics, per period, sliceable by team, area, and trouble type:
- **Response time**: `date_reported` to `dispatched_at`
- **Resolution time**: `dispatched_at` to `completed_at`
- **Total time**: `date_reported` to `completed_at`

Show p50 and p90, not mean. Mean turnaround is dominated by a handful of tickets that sat for a month, which is exactly the tail p90 surfaces and mean hides.

Presentation: a box or violin distribution rather than a single number, so the spread is visible.

### C2.3 Repeat trouble detection

The highest-value analytics item for an ISP. Same `account_no` generating multiple tickets in a rolling window means the underlying fault was never actually fixed, and every repeat visit is a wasted truck roll.

- A `repeat_troubles` view: `account_no` with 2+ tickets in rolling 30 / 60 / 90 day windows, with ticket list, trouble types, and teams involved.
- A REPEAT badge on the card whenever the account has a prior ticket within 30 days, visible to the tech before they roll out.
- A Performance tab widget: repeat rate as a percentage of total tickets, trended by month, broken down by area and by trouble type.

A rising repeat rate for a specific trouble type in a specific barangay is an infrastructure problem, not a technician problem, and the current dashboard cannot show that.

### C2.4 Trouble type trends over time

The pie chart (`index.html:180`) shows composition for one month with no history. Replace with a stacked area chart over the last 12 months. Composition changes are the signal; a snapshot is not.

Keep the pie as a secondary view for the selected period.

### C2.5 Barangay-level geography

`barangay` is already on every row (`DATABASE_CONTEXT.md:21`) and already filterable, but analytics only aggregates to `area` (municipality). Add a barangay breakdown under each area row: ticket volume, completion rate, repeat rate.

Nine municipalities is a coarse enough grouping that a problem in one barangay disappears into the municipal average.

### C2.6 Exportable monthly report

Current export is a flat CSV of raw rows (`app.js:252`). Add a formatted monthly report: period summary, per-team and per-tech tables, trouble type breakdown, repeat troubles, turnaround stats, and the data issues count at period close. PDF for sharing, XLSX for anyone who wants to pivot it.

Generated server-side in the Spec B architecture (a route handler), so it can also be scheduled and emailed later.

### C2.7 Custom date range

The period picker currently offers This Month, Last Month, and Select Month (`index.html:144`). Add an arbitrary start and end date. The original request said "month selection **or date range**"; only the month half shipped.

Small, and it closes out the original ask properly.

---

## 7. Prioritization

| Item | Impact | Effort | Blocked on |
|---|---|---|---|
| C0.3 Audit trail | High | Low | nothing |
| C1.1 Sync health panel | High | Low | Spec A `_SYNC_ERR` |
| C2.7 Custom date range | Medium | Very low | nothing |
| C1.3 Reconciliation report | High | Medium | nothing |
| C2.3 Repeat trouble detection | High | Medium | nothing |
| C1.2 Data issues list | High | Medium | C0.3 |
| C0.1 Per-tech attribution | Medium | Medium | Apps Script change |
| C0.2 Timestamp integrity | Medium | Medium | backfill migration |
| C2.4 Trouble trends | Medium | Low | nothing |
| C2.5 Barangay analytics | Medium | Low | nothing |
| C2.1 Tech leaderboard | Medium | Low | C0.1 |
| C2.2 Turnaround time | High | Medium | C0.2 |
| C1.4 Audit timeline UI | Low | Low | C0.3 |
| C2.6 Monthly report export | Medium | High | most of the above |

**Suggested first slice if you want value before Spec B lands:** C0.3 (audit trail), C1.1 (sync health), C1.3 (reconciliation), C2.7 (custom date range). All four are backend or near-backend, none require React, and together they cover the "is this data trustworthy" question end to end.

**Suggested second slice, post-Spec B:** C2.3 (repeat troubles) and C1.2 (data issues list). These are the two that change day-to-day dispatcher behavior.

---

## 8. Open items for review

1. **Which slice to build.** Section 7 proposes two. Confirm or reorder.
2. **Tech identity source.** C0.1 proposes an `assigned_tech` text column. If techs already have rows in `authorized_emails`, a foreign key to that is better than free text. Needs a look at the real data.
3. **Repeat-trouble window.** 30 days is proposed as the default badge threshold. This should come from whoever knows the business, not from me.
4. **Report distribution.** C2.6 assumes manual download. If these need emailing on a schedule, that adds an email provider and changes the design.
5. **Audit trail retention.** An events table on a system doing thousands of tickets a month grows. Confirm whether a retention policy is needed, or whether it just grows.
6. **This spec has no test plan yet.** It inherits Spec B's testing approach (Vitest for the pure aggregation functions, Playwright for the screens). The Postgres views need their own fixture-based tests, which should be added once the first slice is chosen.
