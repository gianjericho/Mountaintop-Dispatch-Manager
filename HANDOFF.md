# 📋 HANDOFF — Mountaintop Dispatch Manager

**Repository Path:** `/Users/gian/Coding/Mountaintop-Dispatch-Manager`  
**GitHub Repository:** `https://github.com/gianjericho/Mountaintop-Dispatch-Manager.git`  
**Associated Sheets Repo:** `/Users/gian/Coding/SLR DAILY MONITORING` (`https://github.com/gianjericho/ticket-monitoring.git`)  
**Production Supabase Project:** `qqrzlltwvvpowdigffsq` ("Dispatch Manager")  
**Hosting Provider:** Netlify (automatic deployment on push to `main`)

---

## 🎯 System Goal

Mountaintop Dispatch Manager is a real-time web application for dispatchers and field technicians to triage incoming service tickets, assign field teams, monitor active dispatches, mark completed tickets, inspect audit timelines, track data quality issues, and analyze technician performance.

---

## 🚦 Current State

The Next.js 15 App Router rewrite and Spec C Data Quality & Analytics platform are **100% COMPLETE, TYPE-CHECKED, UNIT-TESTED, BUILT, AND DEPLOYED**:

1. **Next.js 15 App Router Routes**:
   - `/inbox`: Pending ticket queue for triage and bulk/single dispatch assignment.
   - `/dispatched`: Active field dispatch queue with tech checklist items (`pic`, `pwr`, `speed`, `rpt`) and remarks.
   - `/history`: Completed ticket history with `[PROCESSED]` review status tagging and Audit Trail timeline drawer.
   - `/data-issues`: Data Quality & Issues dashboard for zero-deletion duplicate relabeling (`ticket_no (dup)`), unassigned active orders, stale pending tickets, and aged unprocessed tickets.
   - `/performance`: Analytics dashboard with Recharts trends, trouble type breakdown, per-technician leaderboard, barangay geography, interactive Team Cards, Top Area Served, complete Team Order Log, CSV report export, and 2-point date range pickers.
   - `/login`: Google OAuth authentication page.
2. **Audit Trail System (`service_order_events`)**:
   - PostgreSQL table `service_order_events` and trigger `trg_log_service_order_events` log every creation, assignment, status change, and processed status toggle.
3. **Sync Health Indicator & Modal**:
   - Live header sync indicator querying `sync_log` table for Apps Script push/pull heartbeats.
4. **Dual Build Compatibility (Next.js 15 + Netlify Legacy Static Site)**:
   - Updated root `index.html` + `app.js` to ensure legacy static Netlify deployments populate **Top Areas** and **History** in `openTeamAnalytics` and support 2-point date range pickers.

---

## 📁 Key Active Files

- **[`app/(app)/performance/page.tsx`](file:///Users/gian/Coding/Mountaintop-Dispatch-Manager/app/(app)/performance/page.tsx)**: Performance analytics page with 2-point Month Range (`startMonthYear` to `endMonthYear`), 2-point Custom Date Range (`customStart` to `customEnd`), volume-sorted Team Cards, Top Area Served, and Team Order Log.
- **[`app/(app)/data-issues/page.tsx`](file:///Users/gian/Coding/Mountaintop-Dispatch-Manager/app/(app)/data-issues/page.tsx)**: Data Quality & Issues dashboard (relabels duplicates to `ticket_no (dup)` enforcing the never-delete rule).
- **[`components/AuditTimelineDrawer.tsx`](file:///Users/gian/Coding/Mountaintop-Dispatch-Manager/components/AuditTimelineDrawer.tsx)**: Slide-out drawer displaying full PostgreSQL audit event history for any ticket.
- **[`components/SyncHealthIndicator.tsx`](file:///Users/gian/Coding/Mountaintop-Dispatch-Manager/components/SyncHealthIndicator.tsx)**: Real-time header indicator showing bridge sync status.
- **[`components/ServiceOrderCard.tsx`](file:///Users/gian/Coding/Mountaintop-Dispatch-Manager/components/ServiceOrderCard.tsx)**: Ticket card component with `[REPEAT]` 30-day repeat subscriber detection badge.
- **[`lib/domain/`](file:///Users/gian/Coding/Mountaintop-Dispatch-Manager/lib/domain/)**: Pure, unit-tested domain modules (`dates.ts`, `filters.ts`, `duplicates.ts`, `rbac.ts`, `performance.ts`, `repeatTroubles.ts`).
- **[`app.js`](file:///Users/gian/Coding/Mountaintop-Dispatch-Manager/app.js)** & **[`index.html`](file:///Users/gian/Coding/Mountaintop-Dispatch-Manager/index.html)**: Legacy static site root entry points for Netlify deployment compatibility.

---

## 🛠️ Changes Made & Key Fixes

1. **Fixed Legacy `openTeamAnalytics` in `app.js`**:
   - Fixed `app.js` line 1688 which was setting `team-modal-areas` and `team-modal-history` to `""`. Top Areas and History now populate cleanly.
2. **Added 2-Point Date Range Pickers**:
   - Month Range: Pick Point A Start Month (e.g. `January 2026`) to Point B End Month (e.g. `March 2026`).
   - Custom Date Range: Pick Point A Start Date to Point B End Date.
   - Implemented in both Next.js App Router and legacy `app.js`.
3. **Volume-Sorted Team Cards**:
   - Sorted Team Cards by dispatch volume descending.
4. **PostgreSQL Audit Trail Trigger**:
   - Deployed `trg_log_service_order_events` to log all mutation events into `service_order_events`.
5. **Never-Delete Rule Enforcement**:
   - `service_orders` rows are never deleted from Supabase.

---

## ⚠️ Failed Attempts & Lessons Learned

- **Assuming Netlify Builds Next.js by Default**: Netlify served root `index.html` + `app.js` instead of Next.js `.next` output because the repository root contains `index.html`. Lesson: Maintain both `app.js`/`index.html` and Next.js App Router in sync to ensure production deployments work seamlessly on Netlify.
- **Strict String Equality on Team Names**: `o.team === activeTeamName` failed when database strings contained trailing spaces or mixed casing. Lesson: Always use case-insensitive, trimmed comparison `(o.team || '').trim().toLowerCase() === target.trim().toLowerCase()`.

---

## 🔮 Next Steps & Future Enhancements

1. **Netlify Build Settings Configuration**: If desired to serve only Next.js on Netlify, configure `Publish directory: .next` or create a `netlify.toml` build command (`next build`).
2. **Automated Export Schedules**: Option to email daily CSV performance reports to supervisors.

---

## 🔑 Database Credentials & Environment

- **Supabase Project URL**: `https://qqrzlltwvvpowdigffsq.supabase.co`
- **Supabase Key**: Service role key in `Supabase.gs` / `SLI_Supabase.gs` & `.env.local`.
- **Database Tables**: `service_orders`, `service_order_events`, `sync_log`, `authorized_emails`.
