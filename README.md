# 🏔️ Mountaintop Dispatch Manager

A real-time field dispatch and operations management dashboard built with Next.js 15, TypeScript, Tailwind CSS v4, and Supabase. Consumes incoming ticket streams from Google Apps Script monitoring sheets ([`ticket-monitoring`](https://github.com/gianjericho/ticket-monitoring)).

**✅ Next.js 15 & TypeScript Rewrite Complete (Spec B):** Migrated from legacy single-file Vanilla JS (`app.js`) to a modular Next.js App Router application with typed domain boundaries, unit-tested logic, Recharts analytics, and real URL tab routing (`/inbox`, `/dispatched`, `/history`, `/performance`).

---

## 🌟 Key Features

- **⚡ Real-Time Operations**: Live Supabase subscriptions for instant ticket updates across field tech teams.
- **🏷️ Mode Switcher (SLR vs SLI)**: Dynamic environment switching between SLR tickets and SLI job orders.
- **📍 URL-Based Tab Navigation**:
  - `/inbox`: Pending ticket queue for admin triage, team assignment, and approval.
  - `/dispatched`: Active field operations queue with tech checklist items (`pic`, `pwr`, `speed`, `rpt`) and remarks.
  - `/history`: Completed ticket archive with `[PROCESSED]` review status tagging.
  - `/performance`: Interactive analytics dashboard powered by Recharts (efficiency rate, completion trend, trouble pie chart, per-team metrics).
- **🛡️ Data Integrity Policy (Never-Delete Rule)**:
  - `service_orders` rows are NEVER deleted.
  - Team removals or bulk updates reassign tickets to `Unassigned` instead of issuing SQL `DELETE`s to preserve full historical stats for performance analytics.
- **🔐 RBAC & Dev Impersonation**: Role-based access control (`developer`, `admin`, `tech`) with developer role/team impersonation toolbar.

---

## 🏗️ Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict)
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Database / Auth**: Supabase (PostgreSQL), `@supabase/ssr` (Google OAuth)
- **State & Data Fetching**: TanStack React Query + Supabase Realtime Channels
- **Analytics / Visualization**: Recharts
- **Testing**: Vitest (Unit testing for domain logic)

---

## 🛠️ Setup & Installation

### 1. Environment Variables
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://qqrzlltwvvpowdigffsq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Running Tests & Production Build
```bash
npm test         # Run Vitest unit tests
npm run build    # Compile production build
```

---

## 📜 Standing Rules & Guidelines

See [AGENTS.md](file:///Users/gian/Coding/Mountaintop-Dispatch-Manager/AGENTS.md) for full workspace rules, git commit/push policies, and data integrity guidelines.
