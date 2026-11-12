# Amerck Care EMR - Dashboard & Application Shell Specification & Quality Matrix

## 1. Executive Summary & Dual-Persona Quality Strategy
- **Application Under Test (AUT)**: Amerck Care EMR — Dashboard launchpad (`/admin`), global application header (topbar navigation, practice switcher, avatar account menu) and Queue View waiting-room display (`/admin/queue-view`).
- **System Perspectives**:
  1. **Doctor / Healthcare Clinician Perspective**: One-click access to every clinical module, confidence that the correct hospital/practice context is active, quick identity confirmation and secure logout on shared clinic terminals, and a patient-facing token display for the waiting room.
  2. **Senior QA Automation Architect Perspective**: Resilient Page Object Model (`DashboardPage.js`), direct login via `loginAsDoctor()`, data-driven tile/route verification, auth-guard checks before and after logout, popover/menu lifecycle and keyboard dismissal.
- **Target Application Scope**:
  - Post-login landing route and Dashboard routing (logo link, deep link, auth guard)
  - Dashboard module tiles (`Care View`, `Patients`, `Drug Cabinet`, `Diagnosis`, `Investigations`, `Report Templates`, `Documents`, `Queue View`)
  - Header navigation links
  - Practice switcher (`Search hospital…`, `No hospitals available!`)
  - Avatar account menu (`Account Management`, `Log out`)
  - Queue View idle state and close control

---

## 2. Master Test Suite Architecture & Coverage Summary

| Suite # | Functional Area / Sub-Module | Test Scope & Clinical Purpose | Total Cases | Priority Breakdown | Execution Type |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | **Dashboard Access & Routing** | Landing route, logo navigation, deep link, auth guard | 4 | 3 Crit, 1 High | Automated |
| **02** | **Dashboard Module Tiles** | Tile catalog/order, hrefs, live route transitions | 3 | 3 Crit | Automated |
| **03** | **Global Header Navigation** | Link presence and routing from any module | 2 | 1 Crit, 1 High | Automated |
| **04** | **Practice Switcher** | Active practice display, search, empty state | 2 | 1 High, 1 Medium | Automated |
| **05** | **Account Menu & Session Termination** | Identity display, Account Management routing, logout + post-logout guard | 3 | 2 Crit, 1 High | Automated |
| **06** | **Queue View** | Waiting-room idle state, close control | 2 | 1 High, 1 Medium | Automated |
| **TOTAL** | **Dashboard & Application Shell Suite** | **Navigation backbone of the EMR** | **16** | **9 Crit, 5 High, 2 Medium** | **16 Automated** |

---

## 3. Module 1: Dashboard Access & Routing

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DSH-NAV-001** | Successful login lands the doctor on Care View | Valid doctor credentials in `.env` | 1. Log in via `/login` | `DOCTOR_USERNAME` / `DOCTOR_PASSWORD` | Doctor lands on `/admin/prescription`. | Critical | Automated |
| **TC-DSH-NAV-002** | Open Dashboard from the header logo | Doctor on Care View | 1. Click Amerck Care logo | N/A | URL path is `/admin`; module tiles render. | Critical | Automated |
| **TC-DSH-NAV-003** | Direct URL navigation to `/admin` preserves session | Doctor authenticated | 1. Navigate directly to `/admin` | URL: `/admin` | Dashboard renders without redirecting to login. | High | Automated |
| **TC-DSH-NAV-004** | Unauthenticated access to `/admin` is redirected | Fresh browser context, no session | 1. Navigate to `/admin` | N/A | Redirect to `/login`; no tiles rendered. | Critical | Automated |

---

## 4. Module 2: Dashboard Module Tiles

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DSH-TILE-001** | Dashboard lists all eight module tiles in order | On `/admin` | 1. Inspect tile headings | 8 modules | Headings in order: `Care View`, `Patients`, `Drug Cabinet`, `Diagnosis`, `Investigations`, `Report Templates`, `Documents`, `Queue View`. | Critical | Automated |
| **TC-DSH-TILE-002** | Each tile links to the correct module route | On `/admin` | 1. Inspect each tile `href` | Routes: `/admin/prescription`, `/admin/patients`, `/admin/drugs`, `/admin/diagnosis`, `/admin/investigations`, `/admin/report-templates`, `/admin/letters`, `/admin/queue-view` | Every tile `href` matches its module route. | Critical | Automated |
| **TC-DSH-TILE-003** | Clicking each clinical tile opens that module | On `/admin` | 1. For each of the 7 clinical tiles: open Dashboard, click tile, verify route | 7 clinical modules | Each click navigates to the matching module route. | Critical | Automated |

---

## 5. Module 3: Global Header Navigation

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DSH-HDR-001** | Header exposes links to every clinical module | Doctor on Care View | 1. Inspect header links | 7 module routes + logo | All seven module links and the logo link are visible. | Critical | Automated |
| **TC-DSH-HDR-002** | Header navigation works from a non-dashboard module | Doctor on Care View | 1. Open Patients from header<br>2. Open Documents from header<br>3. Click logo | Patients → Documents → Dashboard | Each transition succeeds; Dashboard shows all 8 tiles. | High | Automated |

---

## 6. Module 4: Practice Switcher

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DSH-PRC-001** | Switcher shows active practice and lists it | Doctor authenticated | 1. Read practice name in header<br>2. Open switcher | Practice: `DrJohn Tester's Practice …` | Practice name is shown; the same practice appears as an option. | High | Automated |
| **TC-DSH-PRC-002** | No-match practice search shows empty state | Switcher open | 1. Search `ZZQX_NO_HOSPITAL_9999`<br>2. Press Escape | N/A | *"No hospitals available!"* shown with zero options; Escape closes popover. | Medium | Automated |

---

## 7. Module 5: Account Menu & Session Termination

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DSH-ACC-001** | Avatar menu shows doctor identity and actions | Doctor authenticated | 1. Click avatar (initials)<br>2. Press Escape | N/A | Menu shows doctor name (*"Dr. …"*), email, `Account Management`, `Log out`; Escape closes it. | High | Automated |
| **TC-DSH-ACC-002** | Account Management opens Account Settings | Avatar menu open | 1. Click `Account Management` | N/A | Navigates to `/admin/account`; heading *"Account Settings"*. | Critical | Automated |
| **TC-DSH-ACC-003** | Log out ends the session and protects admin routes | Doctor authenticated | 1. Avatar → `Log out`<br>2. Navigate to `/admin/prescription` | N/A | Redirect to `/login` on logout; revisiting an admin route redirects to `/login` again. | Critical | Automated |

---

## 8. Module 6: Queue View (Patient-Facing Token Display)

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DSH-QUE-001** | Queue View renders waiting-room idle state | On `/admin` | 1. Click `Queue View` tile | Today's date | URL `/admin/queue-view`; today's long-form date, *"Waiting for Next Patient"* and token instructions are visible. | High | Automated |
| **TC-DSH-QUE-002** | Close control returns to the Dashboard | On `/admin/queue-view` | 1. Click visible close (X) button | N/A | Navigates back to `/admin`; Dashboard tiles render. | Medium | Automated |

> **Environment note**: On QA the Queue View shows *"Failed to connect to server — Attempting to reconnect..."* (realtime queue server unreachable). The tests cover the idle state only; token-call behaviour needs a working queue server.
