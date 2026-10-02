# ACME Active Membership Portal — Step-by-Step Setup Guide

**Society**: ACME Society  
**Department**: Department of Electrical and Electronics Engineering  
**Institution**: Galgotias University, Greater Noida  
**Hosting**: Vercel (Next.js + TypeScript + Tailwind CSS)  
**Data Layer**: Google Sheets via Google Apps Script (Zero Custom Database)  

---

## 1. Google Sheets Setup

You need **one Google Sheet** with two tabs (sheets): `Responses` and `Questions`.

> **TIP — Quick Setup via Apps Script**:
> You don't have to manually type the column headers! The provided Google Apps Script has a built-in `setupSpreadsheet()` function that automatically generates both sheets, headers, and the initial standard questions in one click.

### Manual Setup (if doing by hand):

#### Tab 1: `Responses`
Rename the first tab to **`Responses`**. Create the following 16 column headers in Row 1:
1. `Timestamp`
2. `Full Name`
3. `Admission Number`
4. `Email ID`
5. `Phone Number`
6. `Year`
7. `Branch`
8. `Section`
9. `Continue as Active Member`
10. `Activity Participation`
11. `Meeting Attendance`
12. `Group Communication`
13. `Event Participation`
14. `Areas of Interest`
15. `Contribution`
16. `Suggestions for ACME`

#### Tab 2: `Questions`
Add a second tab named **`Questions`**. Create the following 8 column headers in Row 1:
1. `Question ID`
2. `Question Text`
3. `Page`
4. `Question Type`
5. `Options`
6. `Required`
7. `Enabled`
8. `Order`

---

## 2. Google Apps Script Bridge Setup

1. In your Google Sheet, click **Extensions** → **Apps Script** in the top menu bar.
2. In the Apps Script code editor, delete any template code.
3. Open the file [`google-apps-script/Code.gs`](./google-apps-script/Code.gs) from this project repository, copy its entire contents, and paste it into the Apps Script editor.
4. **Auto-Initialize**:
   - In the toolbar dropdown, select the function **`setupSpreadsheet`** and click **Run**.
   - Review permissions if prompted (Click *Advanced* → *Go to ... (unsafe)* → *Allow*).
   - Once executed, switch back to your Google Sheet — both `Responses` and `Questions` tabs will be pre-formatted with headers and the 8 standard questions!

---

## 3. Deploying Google Apps Script as a Web App

1. In the Apps Script editor, click the blue **Deploy** button (top right) → **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the fields:
   - **Description**: `ACME Membership Portal Bridge v1`
   - **Execute as**: `Me (your Google email)`
   - **Who has access**: `Anyone` *(CRITICAL: Choose "Anyone" so submissions from the public Member Panel succeed without requiring visitors to sign in to Google)*.
4. Click **Deploy**.
5. Grant access permissions when prompted.
6. Copy the generated **Web app URL** (starts with `https://script.google.com/macros/s/.../exec`).

---

## 4. Environment Variables Configuration

In your project root, open (or create) `.env.local` and add:

```env
# Google Apps Script Web App URL from Step 3
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

# Link to your Google Sheet (for the Admin "Open Google Sheet" button)
NEXT_PUBLIC_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit

# Initial Admin Credentials
ADMIN_EMAIL=adminvardan@acme.in
ADMIN_PASSWORD=TEAMINDIA

# Society Details
NEXT_PUBLIC_SOCIETY_NAME="ACME Society"
NEXT_PUBLIC_DEPARTMENT_NAME="Department of Electrical and Electronics Engineering"
NEXT_PUBLIC_UNIVERSITY_NAME="Galgotias University"
```

---

## 5. Adding the Official ACME Logo

Place your official ACME logo image in the following location:
```
public/images/acme-logo.png
```
- The website automatically displays this logo responsively across both desktop and mobile devices.
- If the file is not yet added, the portal displays a clean institutional ACME EEE GU emblem fallback without broken images.

---

## 6. Running Locally

1. Open PowerShell / Terminal in the project directory:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Deploying to Vercel

1. Push your repository to **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "ACME Active Membership Portal"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/acme-membership-portal.git
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com/) and click **Add New...** → **Project**.
3. Select your GitHub repository.
4. Under **Environment Variables**, add the variables from your `.env.local`:
   - `NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL`
   - `GOOGLE_APPS_SCRIPT_URL`
   - `NEXT_PUBLIC_GOOGLE_SHEET_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
5. Click **Deploy**. Vercel will build and deploy your application in under 1 minute.

---

## 8. Testing the Portal

### Testing Member Panel
1. Navigate to the homepage `/`.
2. Fill in **Step 1 (Member Details)**:
   - Full Name, Admission Number, Email, 10-digit Indian Mobile Number (`9XXXXXXXXX`), Year, Branch, Section.
3. Click **Next: Active Participation**.
4. Confirm entered details remain preserved if you click **Back to Step 1**.
5. Fill in **Step 2 (Active Participation)** questions (Continue status, activity level, meetings, areas of interest).
6. Check the **I agree** confirmation box.
7. Click **Submit Application**.
8. Verify the success message:
   > *"Thank you for submitting the ACME Active Membership Form. Your response has been recorded successfully."*
9. Check your Google Sheet `Responses` tab to see the newly appended row with timestamp!

### Testing Admin Panel
1. Click the discreet **Admin** link in the header or visit `/admin`.
2. Login with credentials:
   - Email: `adminvardan@acme.in`
   - Password: `TEAMINDIA`
3. View the **Admin Dashboard**:
   - Summary cards (Total, Active, Maybe, Not Continuing, 1st Year, 2nd Year).
   - Filter responses by Year, Section, Continuation Status, Meetings.
   - Search by student name or admission number.
   - Click **View** on any row to open the complete individual response detail modal.
   - Click **Open Google Sheet** to open the live sheet in a new tab.
   - Click **Export CSV** to download a spreadsheet copy.
4. Test **Manage Form**:
   - Click **Manage Form** tab.
   - Click **Add Question**, enter question text and type (e.g. Checkboxes or Short Answer).
   - Reorder questions using the Up / Down arrows.
   - Toggle question enable/disable.
   - Return to the Member Panel to see the newly added question appear dynamically!
5. Click **Logout** to verify session termination.
