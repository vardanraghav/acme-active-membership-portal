# ACME Active Membership Portal

Official Active Membership Registration & Administration Portal for **ACME Society**, **Department of Electrical and Electronics Engineering**, **Galgotias University**.

Developed with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, and **Google Sheets** (via Google Apps Script). Ready for direct deployment on **Vercel**.

---

## Key Features

- **Departmental Society Branding**: Official institutional design for ACME Society, Dept of EEE, Galgotias University.
- **Zero Custom Database Requirement**: Utilizes Google Sheets as the persistent storage layer (`Responses` and `Questions` tabs) via Google Apps Script Web App.
- **2-Step Member Panel**:
  - `01 Member Details`: Full Name, Admission Number, Email, 10-digit Indian Mobile validation (`/^[6-9]\d{9}$/`), Year (`1st Year`, `2nd Year`), Branch, Section (`Section 1` to `Section 4`).
  - `02 Active Participation`: Activity level, Meeting attendance, Group communication, Event participation, Multi-select areas of interest, Contribution, and Suggestions.
  - State preservation when navigating between pages.
  - Verbatim confirmation agreement checkbox.
  - Verbatim success and network failure messages with preserved form state.
- **Protected Admin Panel**:
  - Secure login with configured credentials (`adminvardan@acme.in` / `TEAMINDIA`).
  - Summary metric cards (Total Submissions, Active Yes, Maybe, Not Continuing, 1st Year, 2nd Year).
  - Multi-criteria filters (Year, Section, Continuation Status, Meeting Attendance, Event Participation).
  - Search across Name, Admission Number, Email, and Branch.
  - Individual response modal with full detail breakdown.
  - CSV export for offline records.
  - Dedicated "Open Google Sheet" button.
- **Dynamic Form Management**:
  - Administrator can Add, Edit, Delete (with confirmation), Reorder, and Enable/Disable dynamic questions.
  - All form configuration changes persist to the `Questions` sheet tab and reflect dynamically on the Member Form.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production (Vercel)
npm run build
```

See [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) for full instructions on Google Sheets setup, Google Apps Script deployment, and Vercel hosting.
