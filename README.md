# 📡 Dispatch Manager

> An enterprise-grade, real-time web application engineered to streamline field service operations, triage incoming tickets, and track team performance using Role-Based Access Control (RBAC) and Bi-Directional syncing.

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_Website-blue?style=for-the-badge)](https://mountaintop-dispatch-manager.netlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

![Dashboard Screenshot](assets/dashboard.png)

## 🚀 Advanced Key Features

* **🛡️ Role-Based Access Control (RBAC):** Strict row-level security ensures Field Techs can only view and interact with their own team's active dispatches, while Dispatchers/Admins have a birds-eye view of all global operations.
* **🔄 Bi-Directional Google Sheets Sync:** Data doesn't just flow one way. The app seamlessly pulls incoming data piped from Google Sheets via Apps Script, and pushes status updates back to the sheet, ensuring legacy spreadsheets remain fully updated automatically.
* **📈 Advanced Analytics Dashboard:** A dynamic performance tab that auto-calculates team efficiency, area-specific completion rates, and visualizes daily/weekly operational throughput.
* **⚡ Real-Time Data Sync:** Powered by Supabase WebSockets, dispatchers and field techs see updates, assignments, and ticket closures instantly without ever refreshing the page.
* **📥 Smart Triage Inbox:** Admins can review, edit, assign, and bulk-approve incoming tickets before they hit the active field dispatch board.
* **📊 Spreadsheet-Style Bulk Dispatch:** Paste multi-column data directly from Excel/Google Sheets into the app to generate dozens of rich tickets in seconds.

## 📸 App Gallery

Here is a look at the different modules within the Dispatch Manager:

| Light Theme Dashboard | Dark Theme Dashboard |
| :---: | :---: |
| ![Dashboard](assets/dashboard.png) | ![Dark Theme](assets/dashboard-dark-theme.png) |

| Advanced Analytics | Team Management |
| :---: | :---: |
| ![Performance](assets/performance-tab.png) | ![Team Settings](assets/team-management.png) |

| Manual Bulk Dispatch | Rich Manual Dispatch |
| :---: | :---: |
| ![Bulk Dispatch](assets/manual-bulk-dispatch.png) | ![Manual Dispatch](assets/manual-dispatch.png) |

*Secure Google OAuth Login:*
![Login Screen](assets/login-screen.png)

## 🛠️ Tech Stack

* **Frontend:** HTML5, Vanilla JavaScript (ES6+), Tailwind CSS
* **Backend (BaaS):** Supabase (PostgreSQL, Realtime WebSockets, Authentication)
* **Integrations:** Google Apps Script (Bi-Directional Sync API)
* **Testing:** Cypress (E2E)
* **Hosting:** Netlify
* **Icons:** FontAwesome 6

## ⚙️ Local Development Setup

To run this project locally:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
2. **Install dependencies (for Cypress testing):**
   ```bash
   npm install
3. **Set up Environment Variables:**
   Create a `cypress.env.json` file in the root directory for secure testing:
   ```json
   {
     "TEST_EMAIL": "your-test-email@example.com",
     "TEST_PASSWORD": "your-test-password"
   }
4. **Run the build script:**
   ```Bash
   npm run build
5. Open locally: Use Live Server (VS Code extension) or any local HTTP server to open `index.html`

## 🛡️ Architecture & Security Note

This application utilizes a decoupled Jamstack architecture. The UI is completely separated from the database. Security is not handled in the frontend client; instead, Row Level Security (RLS) is strictly enforced directly at the PostgreSQL database level. The database physically rejects queries for data that a specific authenticated user's role is not permitted to see.
