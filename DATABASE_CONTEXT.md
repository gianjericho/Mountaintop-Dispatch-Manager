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
*The main data store for all dispatches.*
- `id`: uuid (Primary Key)
- `name`: text (Subscriber Name)
- `team`: text (Assigned Team Name or 'Unassigned')
- `area`: text (e.g., TAGAYTAY, AMADEO)
- `barangay`: text (Dynamic sub-area dependant on the area field, synced from monitoring sheets)
- `status`: text ('pending', 'active', 'done')
- `type`: text ('SLR' or 'SLI')
- `date_reported`: text (Original date from monitoring sheet)
- `dateAdded`: text (Date it was dispatched/moved to 'active')
- `dateDone`: text (Date it was completed)
- `ticket_no`: text (SF Ticket for SLR / JO No. for SLI)
- `account_no`: text (Account Number)
- `contact_number`: text
- `facility`: text (e.g., NAP location)
- `address`: text
- `trouble_report`: text (Stores 'Reported Trouble' for SLR OR 'Package Name' for SLI)
- `long_lat`: text (Coordinates for Google Maps bridge)
- `pic`, `pwr`, `speed`, `rpt`: boolean (Checklist items for field techs)

## Business Logic Rules
1. **Automation Bridge:** Google Apps Script pushes new rows as `status: 'pending'`.
2. **Inbox Logic:** Only 'admin' or 'developer' can see the 'pending' tab to assign teams and approve tickets.
3. **SLI vs SLR UI (Refactored):** The rendering engine (`createCardHTML`) uses environment-aware variables to toggle labels:
   - If `currentAppMode === 'SLI'`: Labels use "JO No." and "Package". Icons use `fa-clipboard-list` and `fa-box`.
   - If `currentAppMode === 'SLR'`: Labels use "Ticket No." and "Reported Trouble". Icons use `fa-ticket` and `fa-triangle-exclamation`.
4. **Filtering Robustness:** Search and filter logic for `team`, `area`, and `barangay` is case-insensitive and whitespace-trimmed to ensure data entry variations in Google Sheets do not break the dashboard.
4. **RBAC:** - 'tech' users ONLY see 'active' tickets matching their assigned `team`. 
   - 'admin' and 'developer' see all tickets and management tools.
5. **_SYS_REF:** The Google Apps Script uses a `_SYS_REF` column in the sheets. If the cell is empty, the script syncs the row and writes '1' back to the sheet to prevent duplicates.