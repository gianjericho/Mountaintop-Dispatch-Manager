# AGENTS.md — Workspace Rules for LLM Agents

System context and standing rules for working in the SLR Ticket Monitoring & Field Dispatch Ecosystem repos:
1. `SLR DAILY MONITORING` (`/Users/gian/Coding/SLR DAILY MONITORING`)
2. `Mountaintop-Dispatch-Manager` (`/Users/gian/Coding/Mountaintop-Dispatch-Manager`)

---

## 📜 Standing Rules (Mandatory Enforcement)

### 1. Git Commit & Push Policy
- **ALWAYS commit and push changes to GitHub (`git commit` and `git push origin main`)** upon completing major changes, feature implementations, or session work across both repos.
- Ensure commit messages are descriptive and reference the relevant spec or task.

### 2. Data Integrity Policy (Never-Delete Rule)
- **`service_orders` rows are NEVER deleted from Supabase.**
- Mountaintop Dispatch Manager's Performance tab relies on full historical data.
- Any duplicates, invalid rows, or test data must be fixed by **relabeling** (e.g. appending `" (dup)"` to `ticket_no`) or flagging (`is_processed`, `status`), **NEVER via SQL `DELETE` or sheet row deletions on synchronized records**.
- In particular, `deleteTeam` operations or administrative triage tools must reassign or archive orders, never issue `DELETE` queries against `service_orders`.

---

## 🏗️ Ecosystem Architecture

- **Architecture:** Vanilla HTML/CSS/JS (`index.html`, `app.js`, `style.css`), Tailwind, FontAwesome 6, Supabase REST / Realtime.
- **Database:** Supabase `service_orders` table (prod project ref: `qqrzlltwvvpowdigffsq`). Schema documented in `DATABASE_CONTEXT.md`.
- **Dedup Index:** Compound unique index `(type, ticket_no, account_no, date_reported)` prevents duplicate SLR/SLI tickets without breaking placeholder ticket values.
- **Tagging:** `is_processed` and `date_processed` track dispatch review state.

---

## 🔑 Reference Files

- `DATABASE_CONTEXT.md`: Database schema, tables, and column context.
- `docs/superpowers/specs/2026-08-01-nextjs-rewrite-design.md`: Spec B — Next.js/TypeScript Rewrite (planned).
- `docs/superpowers/specs/2026-08-01-data-quality-and-analytics-design.md`: Spec C — Data Quality & Analytics (planned).
