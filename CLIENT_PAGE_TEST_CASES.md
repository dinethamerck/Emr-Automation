# Amerck Care EMR - Master Client & Patient Management Specification & Quality Matrix

## 1. Executive Summary & Dual-Persona Quality Strategy
- **Application Under Test (AUT)**: Amerck Care EMR — Client & Patient Master Directory (`/admin/patients`), New Patient Wizard Modal, and Longitudinal Patient Demographic & Clinical Record (`/admin/patients/edit/:id`).
- **System Perspectives**:
  1. **Doctor / Healthcare Clinician Perspective**: Seamless access to patient longitudinal records, instantaneous demographic lookup during acute emergencies, accurate age and date-of-birth biometric tracking, emergency contact accessibility, consent compliance guardrails, and direct one-click consultation initiation via *New Prescription*.
  2. **Senior QA Automation Architect Perspective**: Resilient Page Object Model (`PatientsPage.js`), high-speed authentication bypassing redundant self-registration via `loginAsDoctor()`, Equivalence Partitioning (EP) & Boundary Value Analysis (BVA) on demographic inputs (NIC, Mobile, DOB), table DOM virtualization verification, debounce search verification, form persistence assertions, and automated video evidence capture.
- **Target Application Scope**:
  - Global Navigation & Patients Badge (`/admin/patients`)
  - Patient Directory Master Table (`HIN No.`, `Name`, `Age`, `NIC No.`, `Mobile No.`, `Emergency Contact No.`, `Status`)
  - Real-Time Substring Search Engine (`input[name="query"]`)
  - New Patient Wizard Modal (`Search by ID Card Number, Mobile Phone Number`)
  - Patient Demographic & Contact Profile (`/admin/patients/edit/:id`)
  - Personal Information (`Name`, `DOB`, `Age`, `NIC`, `Gender`, `Marital Status`, `Patient Status`)
  - Contact Information (`Mobile No`, `WhatsApp No`, `Emergency Contact No`, `Email`, `Occupation`, `City`, `Address`)
  - Clinical Biometrics & Background (`Weight`, `Height`, `BMI`, `Blood Group`, `Medical Problems`, `Allergies`, `Notes`)
  - Consent Verification Status & Workflow (`Sign Consent Form`, `New Prescription`)

---

## 2. Master Test Suite Architecture & Coverage Summary

| Suite # | Functional Area / Sub-Module | Test Scope & Clinical Purpose | Total Cases | Priority Breakdown | Execution Type |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | **Global Header & Navigation Integration** | Link visibility, URL routing (`/admin/patients`), active state styling, practice tenant switching | 6 | 4 Crit, 2 High | Automated |
| **02** | **Patient Directory Table & Catalog Display** | Table headers, column formatting, age calculation, HIN identifier display, row count integrity | 8 | 6 Crit, 2 High | Automated |
| **03** | **Real-Time Search & Substring Filtering** | Name substring match, case-insensitive query, non-matching query handling, debounce latency | 8 | 6 Crit, 2 High | Automated |
| **04** | **New Patient Wizard Modal & Search** | Modal trigger, unique identifier input, close button, backdrop click dismiss, search query submission | 8 | 6 Crit, 2 High | Automated |
| **05** | **Patient Demographic & Contact Record Edit** | Personal info update, mandatory mobile validation, age recalculation from DOB, save persistence | 12 | 8 Crit, 4 High | Automated |
| **06** | **Clinical Workflow & Care View Hand-off** | One-click *New Prescription* hand-off to Care View, consent form alerts, back navigation | 8 | 6 Crit, 2 High | Automated |
| **TOTAL** | **Enterprise Client & Patient Suite** | **Comprehensive Clinical & Technical Quality Lifecycle** | **50** | **36 Fatal/Crit, 14 High** | **Full Coverage Matrix** |

---

## 3. Module 1: Navigation & Global Header Integration

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CLI-NAV-001** | Doctor navigates to Client / Patient Directory from top navigation bar | Doctor authenticated on Care View (`/admin/prescription`) | 1. Locate `Patients` navigation link in top navbar<br>2. Click link<br>3. Verify URL and page title | N/A | Application transitions cleanly to `/admin/patients`; URL contains `/admin/patients`; page title reflects *"Amerck Care"*. | Critical | Automated |
| **TC-CLI-NAV-002** | Patients navigation link shows active route styling | On `/admin/patients` | 1. Inspect navigation bar link styling | Link: `Patients` | Navigation item renders with active/selected state (highlighted badge/background styling). | High | Automated |
| **TC-CLI-NAV-003** | Direct browser URL navigation to `/admin/patients` | Doctor authenticated | 1. Navigate directly to `https://qa_pg.amerck.care/admin/patients`<br>2. Wait for DOM content loaded | URL: `/admin/patients` | Page loads directly with HTTP 200; practice context preserved; directory table renders. | Critical | Automated |
| **TC-CLI-NAV-004** | Practice Switcher context preserved on Patients Directory | Doctor has active practice tenancy | 1. Inspect top practice dropdown<br>2. Switch active practice in header | Practice: `DrJohn Tester's Practice` | Patient directory refreshes according to selected clinic practice isolation without session termination. | High | Automated |
| **TC-CLI-NAV-005** | Unauthenticated access to `/admin/patients` triggers login redirect | Clean incognito session without auth storage | 1. Navigate to `/admin/patients` without active session | N/A | Auth guard immediately redirects user to `/login`; protected patient records are shielded. | Critical | Automated |
| **TC-CLI-NAV-006** | Responsive topbar icon navigation between Patients and Care View | On `/admin/patients` | 1. Click stethoscope icon in topbar<br>2. Verify Care View loaded<br>3. Click Patients icon to return | Route: `/admin/prescription` <-> `/admin/patients` | Smooth bidirectional navigation with preserved session and zero page reload crashes. | High | Automated |

---

## 4. Module 2: Patient Directory Table & Catalog Display

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CLI-LST-001** | Verify all 7 core demographic table headers are rendered | On `/admin/patients` | 1. Inspect table column headers | Columns: `HIN No.`, `Name`, `Age`, `NIC No.`, `Mobile No.`, `Emergency Contact No.`, `Status` | Exactly 7 column headers are present with correct clinical labels and formatting. | Critical | Automated |
| **TC-CLI-LST-002** | Patient row displays accurate demographic attributes | Registered patient exists | 1. Inspect row for patient `Virginia Apgar` | Patient: `Virginia Apgar` | Row displays name, calculated age (*44 years*), and corresponding status cells. | Critical | Automated |
| **TC-CLI-LST-003** | HIN Number displays "Not specified" when unassigned | Patient without allocated HIN | 1. Inspect HIN column cell | HIN cell | Displays italicized *"Not specified"* fallback prompt rather than `null` or broken UI. | Medium | Automated |
| **TC-CLI-LST-004** | Clicking patient row opens Patient Demographic Record | Patient list populated | 1. Click row for patient `Edward Jenner`<br>2. Verify URL and page elements | Target: `/admin/patients/edit/:id` | Navigates to `/admin/patients/edit/:id`; Personal Information and Contact Information sections render. | Critical | Automated |
| **TC-CLI-LST-005** | Pagination controls visibility and state | Directory with registered patients | 1. Inspect table footer pagination controls | Pagination: `< Previous`, `1/1`, `Next >` | Pagination elements are rendered cleanly; disabled states reflect current page boundary. | High | Automated |
| **TC-CLI-LST-006** | Empty directory state handling | New practice with zero registered patients | 1. View table when patient count is 0 | Catalog: Empty | Table renders empty state notification without script error. | High | Automated |
| **TC-CLI-LST-007** | Table responsiveness on various viewport widths | Desktop & Tablet viewports | 1. Resize viewport to 1024px and 768px<br>2. Verify table horizontal scrolling | Viewports: 1024x768, 768x1024 | Table layout adapts gracefully; text does not overlap or truncate unpredictably. | Medium | Automated |
| **TC-CLI-LST-008** | Verify row hover visual feedback | On `/admin/patients` | 1. Hover over any patient row | Target: Table row | Row displays distinct hover background highlight indicating clickability. | Low | Automated |

---

## 5. Module 3: Real-Time Patient Search & Substring Filtering

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CLI-SRCH-001** | Search filters table by full patient first name | Patients `Virginia Apgar`, `Robert Koch` exist | 1. Enter `Virginia` in search input<br>2. Wait 500ms debounce | Query: `Virginia` | Table filters to show only `Virginia Apgar`; non-matching patients are excluded. | Critical | Automated |
| **TC-CLI-SRCH-002** | Search filters by partial last name substring | Patients exist | 1. Enter `Jenner` in search input<br>2. Observe table update | Query: `Jenner` | Row for `Edward Jenner` is retained; matching rows isolate accurately. | High | Automated |
| **TC-CLI-SRCH-003** | Case-insensitive search query evaluation | On `/admin/patients` | 1. Enter `fleming`<br>2. Observe results | Query: `fleming` (lowercase) | Successfully matches and displays `Alexander Fleming`. | High | Automated |
| **TC-CLI-SRCH-004** | Non-matching search query displays zero rows | Catalog populated | 1. Enter `NON_EXISTENT_CLIENT_9999` in search input | Query: `NON_EXISTENT_CLIENT_9999` | Table displays 0 rows cleanly without DOM crash or console exceptions. | High | Automated |
| **TC-CLI-SRCH-005** | Clearing search input restores full patient directory | Filtered directory active | 1. Clear text from search input<br>2. Wait 500ms debounce | Query: `""` | Full patient catalog is restored to original unfiltered row count. | Critical | Automated |
| **TC-CLI-SRCH-006** | Special character handling in search bar (OWASP input safety) | On `/admin/patients` | 1. Enter `' OR '1'='1' --` and `<script>` in search | Query: SQLi & XSS payloads | Input is sanitized; search evaluates as literal string; zero script execution. | Critical | Automated |
| **TC-CLI-SRCH-007** | Search input retains focus during fast keystroke typing | On `/admin/patients` | 1. Type query rapidly without pausing | Query: `Marie Curie` | Input maintains cursor position and focus; no component re-render focus stealing. | High | Automated |
| **TC-CLI-SRCH-008** | Search query persists when switching back from patient edit | Search filter active | 1. Filter by `Koch`<br>2. Click row<br>3. Click `Back` button | Query: `Koch` | Table maintains search state or cleanly resets without table display freezes. | Medium | Automated |

---

## 6. Module 4: New Patient Wizard Modal & Identification

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CLI-WIZ-001** | Click "+ New Patient" button opens New Patient Wizard modal | On `/admin/patients` | 1. Click `+ New Patient` button<br>2. Verify modal visibility | Button: `+ New Patient` | Modal dialog opens; title displays *"New Patient Wizard"*; subtitle displays *"Enter patient's unique identifier"*. | Critical | Automated |
| **TC-CLI-WIZ-002** | Verify Wizard identifier input placeholder | Wizard modal open | 1. Inspect identifier input placeholder | Placeholder: `e.g. ID Card Number, Mobile Phone Number` | Input is visible, focused, and displays exact placeholder text. | High | Automated |
| **TC-CLI-WIZ-003** | Dismiss Wizard modal using Close (X) button | Wizard modal open | 1. Click `X` icon in modal header | Button: `X` | Modal closes immediately; backdrop is removed; directory table is accessible. | Critical | Automated |
| **TC-CLI-WIZ-004** | Dismiss Wizard modal using Escape key | Wizard modal open | 1. Press `Escape` key on keyboard | Key: `Escape` | Modal gracefully dismisses via standard accessibility keyboard event. | High | Automated |
| **TC-CLI-WIZ-005** | Dismiss Wizard modal by clicking backdrop overlay | Wizard modal open | 1. Click outside modal dialog content on backdrop | Target: `div.fixed.inset-0` | Modal dismisses without error; background directory table remains intact. | Medium | Automated |
| **TC-CLI-WIZ-006** | Submit search with valid NIC identifier | Wizard modal open | 1. Enter 12-digit NIC: `199278268746`<br>2. Click `Search` button | NIC: `199278268746` | System initiates patient lookup query via backend API. | High | Automated |
| **TC-CLI-WIZ-007** | Submit search with valid Mobile number identifier | Wizard modal open | 1. Enter Sri Lankan mobile: `+94778398959`<br>2. Click `Search` button | Mobile: `+94778398959` | System initiates patient lookup query via backend API. | High | Automated |
| **TC-CLI-WIZ-008** | Wizard search button disabled or handles empty input | Wizard modal open | 1. Leave identifier input blank<br>2. Click `Search` button | Query: `""` | Search is prevented or triggers validation prompt without broken API dispatch. | Medium | Automated |

---

## 7. Module 5: Demographic & Clinical Record Management (`/admin/patients/edit/:id`)

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CLI-EDT-001** | Patient edit page pre-populates existing Personal Information | On `/admin/patients/edit/:id` | 1. Inspect `Name`, `Date of birth`, `Age` inputs | Patient: `Edward Jenner` | Fields display pre-populated data (`Edward Jenner`, `1975-05-17`, `51 years`). | Critical | Automated |
| **TC-CLI-EDT-002** | Update patient Name and verify persistence | On patient edit page | 1. Update Name input<br>2. Click `Save` button<br>3. Verify toast / indicator | Name: `Edward Jenner Updated` | Name updates via PUT/PATCH; save indicator triggers; updated name persists on refresh. | Critical | Automated |
| **TC-CLI-EDT-003** | Date of Birth modification recalculates Age automatically | On patient edit page | 1. Change DOB to `1990-01-01`<br>2. Inspect `Age` input field | DOB: `1990-01-01` | Age field automatically recomputes to current age (e.g., *36 years*). | Critical | Automated |
| **TC-CLI-EDT-004** | Update Contact Information (Mobile, WhatsApp, Emergency No) | On patient edit page | 1. Fill `Mobile No`: `+94771234567`<br>2. Fill `WhatsApp No`: `+94771234567`<br>3. Fill `Emergency Contact No`: `+94779876543`<br>4. Click `Save` | Contact details | Contact inputs accept values and persist cleanly to patient record. | Critical | Automated |
| **TC-CLI-EDT-005** | Select Gender and Marital Status dropdowns | On patient edit page | 1. Select `Gender`<br>2. Select `Marital Status`<br>3. Click `Save` | Gender: Male / Female | Dropdowns retain selected options; form submits without schema validation error. | High | Automated |
| **TC-CLI-EDT-006** | Clinical Biometrics: Weight & Height auto-calculates BMI | On patient edit page | 1. Enter Weight: `75`<br>2. Enter Height: `1.80`<br>3. Observe `BMI` field | Weight: 75kg, Height: 1.80m | BMI auto-calculates to `23.1` (Weight / Height^2). | High | Automated |
| **TC-CLI-EDT-007** | Blood Group selection persistence | On patient edit page | 1. Select Blood Group: `O+`<br>2. Click `Save` | Blood Group: `O+` | Selected blood group persists in demographic profile. | High | Automated |
| **TC-CLI-EDT-008** | Documenting Medical/Surgical problems in patient record | On patient edit page | 1. Enter `Type 2 Diabetes Mellitus` in problem input<br>2. Enter `5 years` in duration | Problem & Duration | Problem tag is appended to patient profile. | High | Automated |
| **TC-CLI-EDT-009** | Documenting Patient Allergies in demographic record | On patient edit page | 1. Enter `Penicillin` in allergy input<br>2. Press Enter | Allergy: `Penicillin` | Allergy tag is added and highlighted in patient profile. | Critical | Automated |
| **TC-CLI-EDT-010** | Clinical Notes & Comments textarea persistence | On patient edit page | 1. Enter clinical note in textarea<br>2. Click `Save` | Note: *"Patient scheduled for annual diabetic retinopathy screening."* | Textarea persists notes without string truncation or formatting corruption. | High | Automated |
| **TC-CLI-EDT-011** | Click "Back" button returns to Patient Directory | On patient edit page | 1. Click `<- Back` button in header | Button: `<- Back` | Navigates back to `/admin/patients`; patient directory table is displayed. | Critical | Automated |
| **TC-CLI-EDT-012** | Unsaved changes guardrails | On patient edit page with modified inputs | 1. Modify input<br>2. Attempt to navigate away without saving | Modified input | System warns user of unsaved changes before discarding dirty form state. | Medium | Automated |

---

## 8. Module 6: Clinical Workflow & Care View Hand-off

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CLI-CON-001** | One-Click "New Prescription" button transitions patient directly to Care View | On `/admin/patients/edit/:id` for patient `Edward Jenner` | 1. Click `New Prescription` button in top right<br>2. Wait for Care View hydration | Target: Care View (`/admin/prescription`) | Navigates directly to Care View; patient `Edward Jenner` is loaded as active patient in consultation context. | Critical | Automated |
| **TC-CLI-CON-002** | Care View right panel hydrates patient demographics from edit hand-off | Triggered via `New Prescription` from edit page | 1. Inspect Care View right context panel | Demographics | Right panel displays patient name, calculated age, NIC, and contact information. | Critical | Automated |
| **TC-CLI-CON-003** | Consent status alert indicator display | Patient without signed consent | 1. Inspect top alert banner on edit page | Banner: `Consent Form Not Signed` | Displays warning icon with text: *"Consent Form Not Signed - Patient has not signed the consent form yet"*. | High | Automated |
| **TC-CLI-CON-004** | "Sign Consent Form" button accessibility | Consent alert visible | 1. Locate `Sign Consent Form` button<br>2. Click button | Button: `Sign Consent Form` | Launches consent capture modal/workflow without browser console errors. | High | Automated |
| **TC-CLI-CON-005** | Cross-tab session retention during active consultation hand-off | Patient loaded in Care View | 1. Switch between `Today` and `Story` tabs in Care View | Tabs: Today <-> Story | Active patient consultation context is preserved without data clearing. | Critical | Automated |
| **TC-CLI-CON-006** | Patient record security: Multi-tenant practice isolation | Multiple practices | 1. Verify patient records belong strictly to active practice | Multi-tenant isolation | Doctors from Practice B cannot view or modify confidential client records from Practice A. | Critical | Automated |
| **TC-CLI-CON-007** | Rapid consultation cycle: Return to Patients Directory after encounter | Encounter active | 1. Finish consultation<br>2. Click Patients icon in topbar | Return flow | Re-enters `/admin/patients` cleanly; directory is immediately ready for next patient triage. | High | Automated |
| **TC-CLI-CON-008** | End-to-end Client lifecycle: Search -> View Profile -> Update -> Launch Care View | Doctor on `/admin/patients` | 1. Search patient<br>2. Open profile<br>3. Update contact info<br>4. Click New Prescription | Complete E2E flow | Seamless round-trip execution across all modules with 100% pass rate. | Critical | Automated |
