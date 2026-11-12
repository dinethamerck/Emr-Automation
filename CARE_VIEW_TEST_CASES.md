# Amerck Care - Care View Master Senior QA Test Specification & Execution Matrix

## 1. Executive Summary & Quality Strategy
- **Application Under Test (AUT)**: Amerck Care EMR — Clinical Care View (`/admin/prescription`)
- **End-to-End Workflow Scope**: Self-Registration (`/signup`) ➔ Authentication Gate (`/login`) ➔ Doctor Onboarding & EULA Agreement ➔ Care View Clinical Portal (`/admin/prescription`)
- **Target Environments**:
  - Registration Portal: `https://qa_care.amerck.com/signup` (or `http://192.168.0.173:3000/signup`)
  - Authentication Gate: `https://qa_care.amerck.com/login`
  - Clinical Care View: `https://qa_care.amerck.com/admin/prescription`
- **Quality Assurance Lead / Author**: Senior QA Architect & Automation Lead
- **Automation Framework**: Playwright Test (Node.js, JavaScript, Page Object Model Architecture)
- **Test Strategy Approach**: Risk-Based Testing, Equivalence Partitioning (EP), Boundary Value Analysis (BVA), State Transition Modeling, Biometric Formula Validation, Longitudinal Record Integrity, Adversarial/Security Penetration (OWASP Top 10), and HIPAA / Healthcare Audit Compliance.

---

## 2. Master Test Suite Architecture & Coverage Summary

| Suite # | Functional Area / Sub-Module | Spec File / Target | Total Cases | Automated | Priority Breakdown |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **01** | **Registration-to-Care View Transition & Session Hydration** | `tests/careView.spec.js` | 6 | ✅ 4 Auto / 2 Manual | 5 Crit, 1 High |
| **02** | **Global Navigation, Header & Practice Switcher** | `tests/careView.spec.js` | 7 | ✅ 4 Auto / 3 Manual | 3 Crit, 4 High |
| **03** | **Universal Patient Search & Identifier Lookup** | `tests/careView.spec.js` | 8 | ✅ 4 Auto / 4 Manual | 6 Crit, 2 High |
| **04** | **New Patient Wizard Modal & Quick Registration** | `tests/careView.spec.js` | 7 | ✅ 3 Auto / 4 Manual | 4 Crit, 3 High |
| **05** | **Patient Consultation Header & Metadata** | `tests/careView.spec.js` | 6 | ✅ 3 Auto / 3 Manual | 3 Crit, 3 High |
| **06** | **Examination Findings & Diagnostic Reports** | `tests/careView.spec.js` | 6 | ✅ 3 Auto / 3 Manual | 3 Crit, 3 High |
| **07** | **Vital Signs & Biometric BMI Calculation Engine** | `tests/careView.spec.js` | 8 | ✅ 5 Auto / 3 Manual | 5 Crit, 3 High |
| **08** | **Clinical Diagnosis Directory & Dynamic Tagging** | `tests/careView.spec.js` | 6 | ✅ 3 Auto / 3 Manual | 4 Crit, 2 High |
| **09** | **Investigations & Laboratory Orders Management** | `tests/careView.spec.js` | 6 | ✅ 3 Auto / 3 Manual | 3 Crit, 3 High |
| **10** | **Medication & Prescription Grid Management** | `tests/careView.spec.js` | 10 | ✅ 4 Auto / 6 Manual | 7 Crit, 3 High |
| **11** | **Follow-Up & Next Review Scheduling** | `tests/careView.spec.js` | 5 | ✅ 3 Auto / 2 Manual | 2 Crit, 3 High |
| **12** | **Right Patient Context, Demographics & Clinical Panel** | `tests/careView.spec.js` | 8 | ✅ 4 Auto / 4 Manual | 5 Crit, 3 High |
| **13** | **Dual Tab Navigation: Today vs Story Longitudinal Timeline** | `tests/careView.spec.js` | 6 | ✅ 3 Auto / 3 Manual | 3 Crit, 3 High |
| **14** | **Auto-Save Engine, Concurrency & Data Persistence** | `tests/careView.spec.js` | 6 | ✅ 2 Auto / 4 Manual | 4 Crit, 2 High |
| **15** | **Adversarial, Boundary & OWASP Security Suite** | `tests/careView.spec.js` | 10 | ✅ 4 Auto / 6 Manual | 8 Crit, 2 High |
| **16** | **Healthcare Compliance (HIPAA), WCAG 2.1 AA & Audit** | Healthcare Audit Suite | 6 | 6 Audit / Manual | 5 Crit, 1 High |
| **TOTAL** | **Enterprise Care View Test Matrix** | **Complete System Scope** | **111** | **52 Auto / 59 Spec** | **70 Crit, 41 High** |

---

## 3. Module 1: Registration-to-Care View Transition & Session Hydration

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CV-REG-001** | End-to-End Registration to Care View Landing | Browser open at `/signup` | 1. Complete Steps 1-4 of Self Registration with unique credentials<br>2. Click *"Proceed to Login Dashboard"*<br>3. Authenticate with newly created username and password<br>4. Complete Doctor Profile and accept EULA<br>5. Observe final landing page | Doctor Onboarding modal dismisses cleanly; browser navigates directly to `https://qa_care.amerck.com/admin/prescription`; Care View interface is fully displayed. | Critical | Automated |
| **TC-CV-REG-002** | Profile Loading Animation Lifecycle | Onboarding completed | 1. Click *"Accept & Continue to Dashboard"* on EULA step<br>2. Observe transitional loading animation | Transitional screen shows DNA helix animation with prompt *"Loading your profile..."*; animation dismisses within 5-10s without getting stuck. | High | Automated |
| **TC-CV-REG-003** | Browser Tab Title & Metadata Verification | Landed on `/admin/prescription` | 1. Inspect `<title>` and `<head>` tags | Tab title reads: *"Amerck Care - One Patient, One Record \| Electronic Medical Record System"*; viewport and charset meta tags are correctly declared. | Medium | Automated |
| **TC-CV-REG-004** | Fresh Account First-Time Doctor State | First-time doctor session | 1. Land on Care View<br>2. Inspect consultation area and right panel | Initial state displays *"No patient selected"* with subtitle *"Search or register a new patient to get started…"*, and *"Register Patient"* CTA button. | High | Automated |
| **TC-CV-REG-005** | Subsequent Login Direct Routing (Bypass Onboarding) | Doctor with completed onboarding | 1. Log out from Care View<br>2. Login again at `/login` with same credentials | System navigates directly to `/admin/prescription` without re-displaying Doctor Profile or EULA agreement modals (Idempotency). | Critical | Automated |
| **TC-CV-REG-006** | Incomplete Onboarding Session Interception | Doctor registered but EULA not accepted | 1. Log out before accepting EULA<br>2. Login again and browse to `/admin/prescription` | Auth router intercepts navigation and forcibly displays mandatory Onboarding modal; direct access to Care View is blocked. | Critical | Automated |

---

## 4. Module 2: Global Navigation, Header Architecture & Practice Switching

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CV-NAV-001** | Top Navbar Brand Logo & Header Layout | Doctor on Care View | 1. Inspect top navigation bar | Displays **AMERCK CARE** brand logo, module navigation icons, practice dropdown, AI Assistant button, and user avatar. | High | Automated |
| **TC-CV-NAV-002** | Care View Active Module Badge Highlight | Doctor on Care View | 1. Inspect Care View navigation item in top bar | Care View icon (stethoscope) is wrapped in active blue pill badge (`bg-primary text-white`) labeled *"Care View"*. | Critical | Automated |
| **TC-CV-NAV-003** | Global Navigation Module Switching | Doctor on Care View | 1. Click *Dashboard* icon<br>2. Click *Diagnosis* icon<br>3. Click *Patients* icon<br>4. Click *Care View* icon | Navigation switches smoothly between administrative and clinical modules; clicking Care View returns directly to `/admin/prescription`. | High | Automated |
| **TC-CV-NAV-004** | Practice Switcher Combobox Default Display | Doctor on Care View | 1. Inspect practice switcher dropdown in top-right | Displays active practice name pre-bound to doctor's newly created organization (e.g. `Dr. <Name>'s Practice`). | Critical | Automated |
| **TC-CV-NAV-005** | User Avatar with Doctor Initials | Doctor on Care View | 1. Inspect round avatar button next to practice switcher | Avatar circle displays the doctor's uppercase initials (e.g., `DT` for Dineth Tester) matching the registered first/last name. | Medium | Automated |
| **TC-CV-NAV-006** | User Profile Dropdown Menu & Logout Action | Doctor on Care View | 1. Click doctor avatar circle<br>2. Verify menu options<br>3. Click *"Logout"* | Dropdown menu reveals *Profile Settings*, *Switch Organization*, and *Logout*; clicking Logout invalidates JWT and returns to `/login`. | Critical | Automated |
| **TC-CV-NAV-007** | Floating AI Assistant Action Button (FAB) | Doctor on Care View | 1. Inspect bottom-right corner of viewport | Floating blue circular action button with sparkle icon (`✨`) is rendered fixed and accessible across all scroll positions. | Medium | Automated |

---

## 5. Module 3: Universal Patient Search & Identifier Lookup

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CV-SRC-001** | Universal Patient Search Bar Rendering & Placeholder | Care View loaded | 1. Check top search input above consultation form | Search bar is visible with search magnifying glass icon and placeholder: *"Search by name, NIC or mobile number..."*. | High | Automated |
| **TC-CV-SRC-002** | Search Patient by Sri Lankan Old NIC (9 Digits + V) | Registered patient in DB | 1. Type `123456789V` in search input<br>2. Observe type-ahead suggestions | Search dropdown lists matching patient with matching NIC; selecting patient populates Care View. | Critical | Automated |
| **TC-CV-SRC-003** | Search Patient by Sri Lankan New NIC (12 Digits) | Registered patient in DB | 1. Type `199012345678` in search input | Matching patient is filtered and displayed in results list. | Critical | Automated |
| **TC-CV-SRC-004** | Search Patient by International Mobile Number | Registered patient in DB | 1. Type `+94771234567` (or local `0771234567`) | Patient associated with mobile number is returned in instant search results. | Critical | Automated |
| **TC-CV-SRC-005** | Search Patient by Full or Partial Name | Registered patient in DB | 1. Type `Alexander` or `Fleming` in search bar | Patient matching partial string is rendered in dropdown. | High | Automated |
| **TC-CV-SRC-006** | Keyboard Arrow Navigation in Search Results | Search results displayed | 1. Press Down Arrow `↓`<br>2. Press Up Arrow `↑`<br>3. Press `Enter` | Highlight moves sequentially between search items; pressing Enter selects the highlighted patient and loads their medical record. | High | Automated |
| **TC-CV-SRC-007** | Non-Existent Patient Search Query | Care View loaded | 1. Type random non-existent query `XYZ999NONEXISTENT`<br>2. Inspect dropdown | Displays *"No patients found"* empty state with option: *"Register as New Patient"*. | Medium | Automated |
| **TC-CV-SRC-008** | Search Input Clear & Reset | Search input filled | 1. Enter text in search input<br>2. Click clear (X) icon or backspace | Search field clears completely; search results dropdown closes cleanly. | Medium | Automated |

---

## 6. Module 4: New Patient Wizard Modal & Quick Registration

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CV-WIZ-001** | Open New Patient Wizard from Empty State | No patient selected | 1. Click *"Register Patient"* button in right panel | Modal pops up with title *"New Patient Wizard"*, prompt *"Enter patient's unique identifier"*, input, Search button, and Close (X). | Critical | Automated |
| **TC-CV-WIZ-002** | New Patient Wizard Form Elements Verification | Wizard modal open | 1. Inspect input and action buttons | Input placeholder displays *"e.g. ID Card Number, Mobile Phone Number"*; *"Search"* button is rendered. | High | Automated |
| **TC-CV-WIZ-003** | Modal Dismissal via Close Button (X) | Wizard modal open | 1. Click top-right `X` button | Modal closes smoothly without altering current Care View state. | High | Automated |
| **TC-CV-WIZ-004** | Modal Dismissal via ESC Key | Wizard modal open | 1. Press `Escape` key | Modal closes immediately, returning focus to Care View. | Medium | Automated |
| **TC-CV-WIZ-005** | Modal Backdrop Click Dismissal / Retention | Wizard modal open | 1. Click darkened backdrop outside modal container | Modal either closes gracefully or retains focus to prevent accidental data loss. | Medium | Automated |
| **TC-CV-WIZ-006** | Search Identifier for Existing Patient in Wizard | Wizard modal open | 1. Enter an existing patient NIC/Mobile<br>2. Click *"Search"* | Wizard displays existing patient record and prompts: *"Load Existing Patient Consultation"*. | Critical | Automated |
| **TC-CV-WIZ-007** | Register Brand New Patient via Wizard | Wizard modal open | 1. Enter new unique NIC/Phone<br>2. Click *"Search"*<br>3. Complete quick demographic fields (Name, Gender, DOB)<br>4. Click *"Save & Start Consultation"* | New patient is registered in database; modal closes; Care View immediately unlocks with newly registered patient active. | Critical | Automated |

---

## 7. Module 5: Patient Consultation Header & Metadata

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CV-CON-001** | Default Consultation Date Binding | Patient selected | 1. Inspect Date input in consultation header | Date automatically defaults to current system date in ISO format (`YYYY-MM-DD`, e.g. `2026-10-19`). | High | Automated |
| **TC-CV-CON-002** | Direct Inline Patient Name & DOB Entry | Care View empty state | 1. Type patient name `Alexander Fleming` into Name field<br>2. Enter DOB `1980-08-06`<br>3. Press Tab | Consultation area immediately unlocks; right context panel updates to display patient name, calculated age, and temporary ID. | Critical | Automated |
| **TC-CV-CON-003** | Past Consultation Date Selection | Patient selected | 1. Click Date field<br>2. Select a past date (e.g. 3 days prior) | Field accepts past dates for retrospective clinical documentation. | High | Automated |
| **TC-CV-CON-004** | Future Date Prevention / Warning | Patient selected | 1. Enter a future date (e.g., `2028-01-01`) | System blocks future date or displays warning that consultation date cannot be in the future. | Medium | Automated |
| **TC-CV-CON-005** | "Referred by" Field Entry | Patient selected | 1. Click *"Referred by"* input<br>2. Enter `Dr. W. Perera (Base Hospital Negombo)` | Field accepts string without character distortion and persists to consultation payload. | High | Automated |
| **TC-CV-CON-006** | "Presenting problems" Multi-line Textarea | Patient selected | 1. Click *"Presenting problems"* textarea<br>2. Enter multi-line clinical history with line breaks (`Severe migraine for 3 days.\nNausea and photophobia.\nNo relief with paracetamol.`) | Textarea handles line breaks cleanly, expands vertically or scrolls, and saves complete text. | Critical | Automated |

---

## 8. Module 6: Clinical Examination Findings & Diagnostic Reports

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CV-EXM-001** | Comma-Separated Examination Findings Tagging | Patient active | 1. Focus input: *"Comma seperated findings or press enter to confirm..."*<br>2. Type `Bilateral wheezing, Rhonchi present`<br>3. Press Enter | Each comma-separated segment converts into a distinct visual tag/badge. | Critical | Automated |
| **TC-CV-EXM-002** | Examination Finding Tag Deletion | Tags created | 1. Click `×` icon on the `Bilateral wheezing` tag | Specific tag is removed immediately from consultation state. | High | Automated |
| **TC-CV-EXM-003** | Duplicate Examination Finding Prevention | Tag exists | 1. Enter an existing tag name `Bilateral wheezing` again<br>2. Press Enter | System ignores or warns of duplicate tag, preventing redundancy. | Medium | Automated |
| **TC-CV-EXM-004** | "+ Add Results" Modal / Popover | Patient active | 1. Click `+ Add Results` action link | Opens lab/diagnostic result entry modal or inline form. | High | Automated |
| **TC-CV-EXM-005** | "+ Add Reports" Diagnostic File Attachment | Patient active | 1. Click `+ Add Reports`<br>2. Upload valid PDF/JPG diagnostic scan (e.g. Chest X-Ray scan) | Document uploads successfully; file badge with name and size is appended to consultation. | High | Manual/Auto |
| **TC-CV-EXM-006** | Oversized Report Attachment Validation | Patient active | 1. Attempt to upload a 50MB file to `+ Add Reports` | Alert banner triggers: *"File exceeds maximum allowed size (10MB)"*; upload is rejected. | High | Boundary |

---

## 9. Module 7: Vital Signs & Automatic Biometric Calculations (BMI Engine)

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CV-VIT-001** | Normal Vital Signs Entry (Pulse & Blood Pressure) | Patient active | 1. Enter `72` into *Pulse (BPM)*<br>2. Enter `120` into Systolic BP<br>3. Enter `80` into Diastolic BP | Fields accept values and format as `120 / 80 mmHg` with Pulse `72 BPM`. | Critical | Automated |
| **TC-CV-VIT-002** | Real-Time Automatic BMI Calculation ($kg/m^2$) | Patient active | 1. Enter Weight: `70` kg<br>2. Enter Height: `1.75` m | System automatically computes $BMI = \frac{70}{(1.75)^2} = 22.86 \approx 22.9$; displays in `BMI (kg/m2)` field and right panel instantly. | Critical | Automated |
| **TC-CV-VIT-003** | Dynamic BMI Update on Value Modification | Vitals filled | 1. Change Weight from `70` to `85` kg | BMI recalculates instantly to $\frac{85}{(1.75)^2} = 27.75 \approx 27.8$ without page reload. | Critical | Automated |
| **TC-CV-VIT-004** | Zero / Negative Height BVA (Division by Zero Prevention) | Patient active | 1. Enter Weight: `70` kg<br>2. Enter Height: `0` (or `-1.5`) | System handles division by zero safely; displays `-` or `0` without JS NaN/Infinity crash. | Critical | Automated |
| **TC-CV-VIT-005** | Extreme Boundary Pulse Values (BVA) | Patient active | 1. Enter Pulse `300`<br>2. Enter Pulse `20` | Input flags physiological warning indicator or rejects out-of-range pulse. | High | Boundary |
| **TC-CV-VIT-006** | Diastolic Greater Than Systolic BP Validation | Patient active | 1. Enter Systolic `80`<br>2. Enter Diastolic `120` | Input alerts doctor: *"Diastolic pressure cannot exceed systolic pressure"*. | Critical | Validation |
| **TC-CV-VIT-007** | "+ Additional notes" Toggle & Entry | Patient active | 1. Click `+ Additional notes` button<br>2. Enter `Patient appears anxious; regular rhythm` | Notes field expands smoothly and persists notes to vitals payload. | Medium | Automated |
| **TC-CV-VIT-008** | Non-Numeric Characters Rejection in Vitals | Patient active | 1. Attempt typing letters `ABC` into Pulse, BP, Weight, Height | Numeric inputs reject non-numeric keystrokes automatically. | High | Automated |

---

## 10. Module 8: Clinical Diagnosis Directory & Dynamic Tagging

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CV-DX-001** | Empty Diagnosis Initial State | Patient active | 1. Inspect Diagnosis section before entry | Displays empty state label: *"No diagnosis specified"*. | Medium | Automated |
| **TC-CV-DX-002** | Add Clinical Diagnosis via Comma Delimiter | Patient active | 1. Type `Essential Hypertension, Type 2 Diabetes Mellitus`<br>2. Press Enter | Two separate diagnosis badges are rendered; *"No diagnosis specified"* label disappears. | Critical | Automated |
| **TC-CV-DX-003** | Single Diagnosis Entry via Enter Key | Patient active | 1. Type `Acute Bronchitis`<br>2. Press `Enter` | `Acute Bronchitis` is committed as a tagged diagnosis chip. | High | Automated |
| **TC-CV-DX-004** | Individual Diagnosis Chip Removal | Diagnosis tags active | 1. Click `×` icon on `Acute Bronchitis` chip | Tag is removed immediately; remaining diagnoses persist. | High | Automated |
| **TC-CV-DX-005** | Removal of All Diagnoses Returns to Empty State | 1 tag active | 1. Remove last diagnosis tag | Empty state label *"No diagnosis specified"* reappears. | High | Automated |
| **TC-CV-DX-006** | Extreme Length Diagnosis String Handling (BVA: 200 chars) | Patient active | 1. Enter 200-character medical condition description<br>2. Press Enter | Tag wraps gracefully within container without horizontal viewport blowout. | Medium | Boundary |

---

## 11. Module 9: Investigations & Laboratory Orders Management

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CV-INV-001** | Empty Investigations Initial State | Patient active | 1. Inspect Investigations section | Displays *"No investigations added"* label with placeholder: *"Press enter to confirm..."*. | Medium | Automated |
| **TC-CV-INV-002** | Add Single Investigation Order via Enter | Patient active | 1. Type `Full Blood Count (FBC)`<br>2. Press Enter | `Full Blood Count (FBC)` tag appears; *"No investigations added"* label is cleared. | Critical | Automated |
| **TC-CV-INV-003** | Add Multiple Diagnostic Orders Sequentially | Patient active | 1. Add `Lipid Profile`<br>2. Add `Serum Creatinine`<br>3. Add `HbA1c` | All 3 investigation orders are displayed as discrete ordered chips. | High | Automated |
| **TC-CV-INV-004** | Remove Investigation Order | Multiple orders present | 1. Click `×` on `Serum Creatinine` | Test is removed from order list while other tests remain untouched. | High | Automated |
| **TC-CV-INV-005** | Duplicate Investigation Warning | Test already added | 1. Attempt to add `Lipid Profile` a second time | System ignores or flags duplicate laboratory request. | Medium | Automated |
| **TC-CV-INV-006** | Special Diagnostic Instructions / Fasting Notes | Patient active | 1. Add `Fasting Blood Sugar (12 hrs fasting required)` | Test with clinical instruction persists completely to requisition. | High | Automated |

---

## 12. Module 10: Medication & Prescription Grid Management

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CV-MED-001** | Prescription Grid Column Headers Verification | Patient active | 1. Inspect Medication table | Columns match standard clinical Rx format: **Generic/Brand**, **Dosage**, **Frequency**, **Route**, **Duration**. | High | Automated |
| **TC-CV-MED-002** | "Add Medication" Button Spawns New Row | Patient active | 1. Click *"Add Medication"* button | A new interactive row is added to the table with inputs for Generic/Brand, Dosage, Frequency, Route, Duration, and a Delete icon. | Critical | Automated |
| **TC-CV-MED-003** | Complete Medication Row Entry | New row open | 1. Generic/Brand: `Paracetamol 500mg`<br>2. Dosage: `2 tabs`<br>3. Frequency: `TDS`<br>4. Route: `Oral`<br>5. Duration: `5 days` | All fields accept input; row displays formatted prescription instruction. | Critical | Automated |
| **TC-CV-MED-004** | Multi-Drug Prescription Addition | 1 drug added | 1. Click *"Add Medication"*<br>2. Add `Amoxicillin 500mg`, `1 cap`, `TDS`, `Oral`, `7 days`<br>3. Add `Cetirizine 10mg`, `1 tab`, `Nocte`, `Oral`, `5 days` | Multiple medication rows stack in order; table scrolls vertically if exceeding view height. | Critical | Automated |
| **TC-CV-MED-005** | Delete Individual Medication Row | Multiple rows | 1. Click trash/delete icon on row 2 (`Amoxicillin`) | Row 2 is removed; Row 1 and Row 3 remain intact and re-indexed. | High | Automated |
| **TC-CV-MED-006** | "Clear All" Action with Modal Confirmation | Medications present | 1. Click *"Clear All"* button<br>2. Observe confirmation prompt<br>3. Confirm clear | System prompts: *"Are you sure you want to clear all medications?"*; on confirmation, all rows are wiped cleanly. | High | Automated |
| **TC-CV-MED-007** | "Clear All" Cancellation Safety | Medications present | 1. Click *"Clear All"*<br>2. Click *"Cancel"* in dialog | Dialog closes; all existing medication rows are preserved safely. | Medium | Automated |
| **TC-CV-MED-008** | "Use Preset" Clinical Templates Modal | Patient active | 1. Click *"Use Preset"* button | Preset modal/dropdown opens displaying doctor's saved prescription templates (e.g. *Upper Respiratory Infection*, *Hypertension Stage 1*). | Critical | Automated |
| **TC-CV-MED-009** | Apply Preset Template to Prescription Grid | Preset modal open | 1. Select *Upper Respiratory Infection* preset<br>2. Click Apply | Grid auto-populates with standard protocol medications (Antipyretic + Antihistamine) instantly. | Critical | Automated |
| **TC-CV-MED-010** | Frequency Dropdown Standard Medical Codes | Rx row active | 1. Open Frequency dropdown | Contains standard medical abbreviations: `OD` (once daily), `BD` (twice daily), `TDS` (thrice daily), `QDS` (four times daily), `PRN` (as needed), `Nocte` (at night), `Stat` (immediately). | High | Manual/Auto |

---

## 13. Module 11: Follow-Up & Next Review Scheduling

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CV-REV-001** | Quick Review Pills Rendering | Patient active | 1. Inspect Next Review section | Pills visible: `3 days`, `5 days`, `1 week`, `2 weeks`, `1 month`, `3 months`, `Custom`. | High | Automated |
| **TC-CV-REV-002** | Select Quick Review Pill (1 week) | Patient active | 1. Click `1 week` pill | Pill state toggles to active (`bg-primary text-white`); return date is calculated as `Today + 7 days`. | Critical | Automated |
| **TC-CV-REV-003** | Switch Review Duration Pill | `1 week` selected | 1. Click `1 month` pill | Active state switches to `1 month`; return date updates dynamically to `Today + 30 days`. | High | Automated |
| **TC-CV-REV-004** | "Custom" Review Pill Datepicker | Patient active | 1. Click `Custom` pill | Datepicker calendar popup renders allowing doctor to choose an exact calendar date. | High | Automated |
| **TC-CV-REV-005** | Deselect / Clear Follow-Up Date | Pill selected | 1. Click selected pill again | Pill deselects; Next Review becomes optional / unset. | Medium | Automated |

---

## 14. Module 12: Right Patient Context, Demographics & Clinical Panel

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CV-PNL-001** | Active Patient Banner Details & Identification | Patient active | 1. Inspect top of right panel | Displays patient avatar, Full Name (`Sarah Connor`), Age (`37 years`), and System ID (`# 333623`). | Critical | Automated |
| **TC-CV-PNL-002** | Demographics Quick Summary Tiles | Patient active | 1. Inspect summary grid in right panel | Displays 4 metric tiles: **Mobile**, **Blood Group**, **Address**, **BMI** with accurate values or `-` defaults. | High | Automated |
| **TC-CV-PNL-003** | Private Doctor Notes Entry & Isolation | Patient active | 1. Enter confidential clinical note in *"Private Notes (visible only to you)"*<br>2. Click outside | Text persists; notice states note is visible ONLY to the consulting doctor (excluded from printed prescriptions/patient receipts). | Critical | Automated |
| **TC-CV-PNL-004** | Add Medical and Surgical Problem with Duration | Patient active | 1. Problem input: `Type 2 Diabetes Mellitus`<br>2. Duration input: `5 years`<br>3. Press Enter | Item is added to longitudinal Medical & Surgical Problems list. | High | Automated |
| **TC-CV-PNL-005** | Add Patient Allergy with Warning Badge | Patient active | 1. Allergy input: `Penicillin (Anaphylaxis)`<br>2. Press Enter | Allergy badge renders in red/amber alert color in right panel for clinical safety. | Critical | Automated |
| **TC-CV-PNL-006** | Active Medications Display from History | Patient with past Rx | 1. Inspect *Active Medications* section | Displays currently active long-term medications previously prescribed to this patient. | High | Automated |
| **TC-CV-PNL-007** | Edit Patient Demographics Icon Action | Patient active | 1. Click pencil (Edit) icon in patient banner | Opens Patient Demographics Editor modal to update phone, address, or emergency contact. | High | Automated |
| **TC-CV-PNL-008** | Discharge / Switch Patient Icon Action | Patient active | 1. Click exit/switch icon in patient banner | Clears active patient session with confirmation, resetting Care View to *"No patient selected"* state. | Critical | Automated |

---

## 15. Module 13: Dual Tab Navigation: Today vs Story Longitudinal Timeline

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CV-TAB-001** | Tab Switcher Display & Default Active State | Patient active | 1. Observe top tab switcher | Two tabs visible: `Today` and `Story`; `Today` is active by default. | High | Automated |
| **TC-CV-TAB-002** | Switch to "Story" Tab for New Patient | New patient active | 1. Click `Story` tab | View switches to timeline view displaying empty state: *"No history found for this patient"*. | Critical | Automated |
| **TC-CV-TAB-003** | Story Tab Filter Pills Rendering | User in Story tab | 1. Inspect filter chips above timeline | Displays filter pills: `All (0)` and `Prescriptions (0)`. | High | Automated |
| **TC-CV-TAB-004** | Story Tab Longitudinal Prescriptions Timeline | Patient with past visits | 1. Open Story tab for patient with 3 past visits | Chronological reverse timeline renders cards for each past visit with consultation date, doctor name, and prescribed drugs. | Critical | Manual/Auto |
| **TC-CV-TAB-005** | Filter Prescriptions in Story Tab | Multi-visit patient | 1. Click `Prescriptions` filter chip | Timeline isolates only prescription encounters, filtering out standalone lab reports or admissions. | High | Automated |
| **TC-CV-TAB-006** | State Retention When Toggling Tabs | Consultation partially filled | 1. Enter Vitals, Diagnosis, and Rx in `Today`<br>2. Switch to `Story`<br>3. Switch back to `Today` | All uncommitted consultation inputs in `Today` are 100% preserved without data loss. | Critical | Automated |

---

## 16. Module 14: Data Persistence, Auto-Save Engine & Concurrency

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CV-SAV-001** | Real-Time Auto-Save Trigger on Input Blur | Patient active | 1. Type presenting problems<br>2. Blur input (click outside)<br>3. Observe save indicator | Indicator transitions from *"Save"* to *"Saving..."* to *"All changes saved"*. | Critical | Automated |
| **TC-CV-SAV-002** | Manual Click on "Save" Button | Consultation updated | 1. Click *"Save"* button in floating bottom-right bar | Triggers immediate network sync; returns toast *"Consultation saved successfully"*. | High | Automated |
| **TC-CV-SAV-003** | Browser Page Refresh Data Resilience | Changes auto-saved | 1. Fill patient vitals, diagnosis, and medications<br>2. Wait for *"All changes saved"*<br>3. Refresh browser (`F5`) | Care View re-hydrates with the same patient loaded and all consultation data intact. | Critical | Automated |
| **TC-CV-SAV-004** | Offline Network Disconnection Detection | Consultation active | 1. Simulate network disconnect (`page.setOffline(true)`)<br>2. Type in consultation fields | System displays non-blocking offline banner: *"Offline - Changes queued locally"*; prevents data loss. | Critical | Automated |
| **TC-CV-SAV-005** | Network Reconnection & Pending Sync Flushing | Offline queue active | 1. Re-enable network (`page.setOffline(false)`) | Queued consultation payloads flush to backend; indicator transitions to *"All changes saved"*. | Critical | Automated |
| **TC-CV-SAV-006** | Concurrent Edit Conflict Detection | Multi-session test | 1. Open same patient consultation in Tab A and Tab B<br>2. Modify Tab B and save<br>3. Switch to Tab A | System flags concurrent update warning: *"Record modified in another session. Please refresh."*. | High | Exploratory |

---

## 17. Module 15: Adversarial, Boundary & OWASP Top 10 Security Suite

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CV-SEC-001** | Cross-Site Scripting (XSS) in Presenting Problems | Patient active | 1. Enter `<script>window.__xss=true;</script>` in Presenting Problems<br>2. Save and refresh | Script tag is HTML-escaped; no script executes in window context; UI renders clean string. | Critical | Automated |
| **TC-CV-SEC-002** | XSS Script Injection in Patient Name & Notes | Patient active | 1. Enter `<img src=x onerror=alert('XSS')>` into Name & Private Notes | Payload is sanitized; img tag does not execute error callback. | Critical | Automated |
| **TC-CV-SEC-003** | SQL Injection Payload in Universal Search Bar | Care View loaded | 1. Enter `' UNION SELECT * FROM users --` in search bar<br>2. Press Enter | Backend returns safe empty results without exposing SQL syntax errors or database schema. | Critical | Automated |
| **TC-CV-SEC-004** | Unauthenticated Direct Route Access Redirection | Clean session (no auth) | 1. Open incognito window (no cookies/tokens)<br>2. Navigate to `https://qa_care.amerck.com/admin/prescription` | Auth middleware intercepts request immediately and redirects to `/login`. Clinical data is protected. | Critical | Automated |
| **TC-CV-SEC-005** | Extreme Text Input Boundary (10,000 Chars) | Patient active | 1. Paste 10,000 characters of lorem ipsum into Presenting Problems | System handles large string without UI freeze, DOM overflow, or memory crash. | High | Boundary |
| **TC-CV-SEC-006** | Rapid Multi-Clicking on "Add Medication" Button | Patient active | 1. Click *"Add Medication"* 20 times in rapid succession (< 100ms) | UI handles rapid clicks cleanly without creating ghost rows or freezing the DOM thread. | High | Stress |
| **TC-CV-SEC-007** | IDOR Direct Patient URL Parameter Manipulation | Logged-in Doctor | 1. Manually append `?patientId=ANOTHER_CLINIC_PATIENT_ID` to URL | System enforces multi-tenant row-level security; displays *"Unauthorized access to patient"*. | Critical | Security |
| **TC-CV-SEC-008** | Inactivity Session Auto-Lock (HIPAA Compliance) | Doctor logged in | 1. Leave Care View inactive for configured timeout (e.g. 15 mins)<br>2. Attempt to click consultation field | Session auto-locks; doctor is prompted for password re-authentication before viewing patient PHI. | Critical | Security |
| **TC-CV-SEC-009** | Private Notes Multi-Tenant & Role Isolation | Doctor entered notes | 1. Log in as clinic Receptionist or Nurse<br>2. View same patient record | Doctor's *"Private Notes"* section is hidden or empty for non-author roles. | Critical | Security |
| **TC-CV-SEC-010** | Cross-Site Request Forgery (CSRF) on Save Endpoint | API level | 1. Inspect consultation save HTTP request headers | Requests require valid Bearer token and SameSite cookie; foreign origin POST is rejected with 403. | Critical | Security |

---

## 18. Module 16: Healthcare Compliance (HIPAA), WCAG 2.1 AA & Audit Logs

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CV-CMP-001** | Clinical Consultation Audit Trail Generation | Consultation saved | 1. Save complete consultation with vitals and medications<br>2. Query backend audit trail table | Audit entry logs: timestamp, Doctor ID, Patient ID, Practice ID, and exact action (`CONSULTATION_CREATED`). | Critical | DB Audit |
| **TC-CV-CMP-002** | Patient Health Information (PHI) Masking in URLs | Any consultation | 1. Inspect URL parameters and query strings during consultation | No patient Name, NIC, or diagnostic conditions are passed in plain text in browser URL. | Critical | Compliance |
| **TC-CV-CMP-003** | WCAG 2.1 AA Keyboard Navigation Accessibility | Care View loaded | 1. Navigate entire consultation form using only `Tab`, `Shift+Tab`, and `Enter` | Focus indicators are clearly visible on every input; all sections can be completed via keyboard alone. | High | WCAG |
| **TC-CV-CMP-004** | Screen Reader Accessibility (ARIA Labels) | Care View loaded | 1. Inspect form inputs with screen reader (NVDA/VoiceOver) | Inputs have explicit `aria-label` or `<label>` bindings (e.g. *"Pulse in beats per minute"*). | High | WCAG |
| **TC-CV-CMP-005** | Color Contrast Ratio Compliance (WCAG AA 4.5:1) | Care View loaded | 1. Run Lighthouse / Axe accessibility audit on Care View | All text labels and interactive buttons meet minimum 4.5:1 contrast ratio against light background. | High | WCAG |
| **TC-CV-CMP-006** | Prescription Printing & Letterhead Layout Verification | Rx completed | 1. Click Print Prescription action<br>2. Inspect print preview | Print layout generates clean clinic letterhead with doctor name, qualifications, SLMC license, patient details, and Rx table. | Critical | Functional |

---

## 19. Playwright Automation Execution & Reporting

All automated test cases are implemented in [`tests/careView.spec.js`](file:///c:/Users/LENOVO/Desktop/EMR/tests/careView.spec.js) using the Page Object Model in [`pages/CareViewPage.js`](file:///c:/Users/LENOVO/Desktop/EMR/pages/CareViewPage.js).

### Commands:
```bash
# Run Care View automated suite in headless mode
npm run test:careview

# Run Care View automated suite with visible browser UI
npx playwright test tests/careView.spec.js --headed

# Run interactive visual Playwright UI
npx playwright test tests/careView.spec.js --ui

# View generated test report
npm run test:report
```
