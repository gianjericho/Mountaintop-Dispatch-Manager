# Database Context: Dispatch Manager (Supabase)

## Tech Stack
- **Database:** Supabase (PostgreSQL)
- **Frontend:** Vanilla JS, Tailwind CSS, FontAwesome 6
- **Automation:** Google Apps Script (Bridge for SLR and SLI monitoring sheets)

## Table: authorized_emails
*Handles user permissions and role-based access control (RBAC).*
- `id`: bigint (Primary Key - Auto-incrementing)
- `email`: text (Unique - used for Google Auth verification)
- `role`: text ('developer', 'admin', 'tech')
- `team`: text (Nullable - assigned team name for 'tech' users)

## Table: service_orders
*The main data store for all dispatches. Verified directly against the live prod schema (`qqrzlltwvvpowdigffsq`) on 2026-08-02.*
- `id`: text (Primary Key — stored as text, not uuid, despite values being UUID-shaped)
- `name`: text (Subscriber Name)
- `team`: text (Assigned Team Name or 'Unassigned')
- `area`: character varying (e.g., TAGAYTAY, AMADEO)
- `barangay`: text (Dynamic sub-area dependant on the area field, synced from monitoring sheets)
- `status`: character varying ('pending', 'active', 'done')
- `type`: text ('SLR' or 'SLI')
- `date_reported`: text (Original date from monitoring sheet — inconsistent formats across rows, e.g. `7/9/2026` vs `2026-07-09`; ~459 rows have it blank)
- `dateAdded`: text (Date it was dispatched/moved to 'active')
- `dateDone`: text (Date it was completed)
- `ticket_no`: text (SF Ticket for SLR / JO No. for SLI — in practice frequently a placeholder like a plan name, trouble type, or workflow status rather than a real ticket number; see the dedup work below)
- `account_no`: text (Account Number)
- `contact_number`: text
- `facility`: text (e.g., NAP location)
- `address`: text
- `trouble_report`: text (Stores 'Reported Trouble' for SLR OR 'Package Name' for SLI)
- `long_lat`: text (Coordinates for Google Maps bridge)
- `pic`, `pwr`, `speed`, `rpt`: boolean (Checklist items for field techs)
- `remarks`: text
- `dispatched_by`: text (email of the dispatcher who assigned it)
- `tech_remarks`: text
- `is_processed`: boolean, not null, default `false` (added 2026-08-02 — was referenced by `app.js` since the Done-Processed tagging feature shipped, but the column didn't exist, so tagging silently only updated in-memory state and reset on refresh)
- `date_processed`: timestamptz, nullable (added 2026-08-02, same fix)

### Indexes
- `service_orders_dedup_key`: unique index on `(type, ticket_no, account_no, date_reported)` where `ticket_no` and `account_no` are both non-blank. Added 2026-08-02 to stop true duplicate pushes from the Apps Script bridge. A single-column index on `ticket_no` alone was tried first and rejected — 80 distinct values had duplicates, mostly because encoders type a plan name, trouble type, or workflow placeholder into `ticket_no` when there's no real ticket/JO number yet, across both SLR and SLI.

## Business Logic Rules
1. **Automation Bridge:** Google Apps Script pushes new rows as `status: 'pending'`.
2. **Inbox Logic:** Only 'admin' or 'developer' can see the 'pending' tab to assign teams and approve tickets.
3. **SLI vs SLR UI (Refactored):** The rendering engine (`createCardHTML`) uses environment-aware variables to toggle labels:
   - If `currentAppMode === 'SLI'`: Labels use "JO No." and "Package". Icons use `fa-clipboard-list` and `fa-box`.
   - If `currentAppMode === 'SLR'`: Labels use "Ticket No." and "Reported Trouble". Icons use `fa-ticket` and `fa-triangle-exclamation`.
4. **Filtering Robustness:** Search and filter logic for `team`, `area`, and `barangay` is case-insensitive and whitespace-trimmed to ensure data entry variations in Google Sheets do not break the dashboard.
5. **RBAC:** - 'tech' users ONLY see 'active' tickets matching their assigned `team`.
   - 'admin' and 'developer' see all tickets and management tools.
6. **_SYS_REF:** The Google Apps Script uses a `_SYS_REF` column in the sheets. If the cell is empty, the script syncs the row and writes '1' back to the sheet to prevent duplicates.
7. **Never delete `service_orders` rows.** The Performance tab aggregates across full history; deleting a row silently changes historical stats. Established 2026-08-02 while fixing duplicate `ticket_no` values — the fix was to relabel one row's `ticket_no` rather than delete it. Applies to `deleteTeam`, the bulk-dispatch inbox cleanup, and any future dedup/cleanup tooling.