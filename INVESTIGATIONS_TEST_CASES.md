# Amerck Care EMR - Master Clinical Investigations Specification & Quality Matrix

## 1. Executive Summary & Dual-Persona Quality Strategy
- **Application Under Test (AUT)**: Amerck Care EMR — Clinical Diagnostic Investigations Directory (`/admin/investigations`), Report Template Builder (`/admin/report-templates`), and Care View Requisition Engine (`/admin/prescription`)
- **System Perspectives**:
  1. **Doctor / Clinical Pathologist & Radiologist**: Diagnostic accuracy, patient preparation safety (e.g. 12-hour fasting for fasting lipid/glucose, contrast nephropathy prophylaxis for IV contrast CT, metal screening for MRI), rapid specimen turnaround, critical panic value alerting (e.g., critical hyperkalemia, elevated troponin, thrombocytopenia), and seamless consultation requisition ordering.
  2. **Senior QA Automation Architect**: Page Object Model (POM) architecture, Boundary Value Analysis (BVA), Equivalence Partitioning (EP), debounced search filtering, RESTful CRUD lifecycle verification, modal state management, OWASP input sanitization, and automated portable Playwright screen recording evidence.
- **Target Application Scope**:
  - Diagnostic Master Directory (`/admin/investigations`)
  - Report Creation (`Add New Report` Modal with Name, Abbreviation, Description, Instructions)
  - Report Editing (`Update Report` and `Delete Report` Modals)
  - Substring Search & Real-Time Server Query Filtering
  - Sub-Navigation (`Report Templates` and `Documents / Letters`)
  - Active Consultation Integration (`Care View` Requisitions Section)

---

## 2. Master Test Suite Architecture & Coverage Summary

| Suite # | Functional Area / Sub-Module | Test Scope & Clinical Purpose | Total Cases | Priority Breakdown | Execution Type |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | **Global Header & Navigation Integration** | Link visibility, URL routing (`/admin/investigations`), page title, and sub-nav tabs | 6 | 4 Crit, 2 High | Automated |
| **02** | **Add Diagnostic Report Modal & Validation** | Mandatory fields (Abbreviation, Name), character limits, patient prep instructions, submit lifecycle | 10 | 8 Crit, 2 High | Automated |
| **03** | **Search, Filtering & Pagination Engine** | Query debouncing, abbreviation vs name matching, empty state handling, pagination buttons | 8 | 6 Crit, 2 High | Automated |
| **04** | **Edit & Update Investigation Lifecycle** | Pre-population of fields, update submission, delete report modal safeguard | 8 | 6 Crit, 2 High | Automated |
| **05** | **Clinical Prep Instructions & Patient Safety** | Fasting guidelines, contrast allergy warnings, radioactive tracer precautions, metal implant guards | 10 | 8 Fatal/Crit, 2 High | Automated / Clinical |
| **06** | **Care View Active Consultation Integration** | Requisition ordering in active encounter note, autocomplete chips, consultation note persistence | 8 | 6 Crit, 2 High | Automated |
| **TOTAL** | **Enterprise Clinical Investigations Suite** | **Complete Clinical & Technical Lifecycle** | **50** | **38 Fatal/Crit, 12 High** | **Full Coverage Matrix** |

---

## 3. Module 1: Navigation & Global Header Integration

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-INV-NAV-001** | Doctor navigates to Investigations from Care View top navigation | Doctor logged in on Care View (`/admin/prescription`) | 1. Locate `Investigations` navigation link in top navbar<br>2. Click link<br>3. Verify URL and page title | N/A | Application transitions to `/admin/investigations`; page title displays *"Amerck Care"*; header displays *"Investigations"*. | Critical | Automated |
| **TC-INV-NAV-002** | Investigations link shows active route styling | On `/admin/investigations` | 1. Inspect navigation bar link styling | Link: `Investigations` | Navigation item renders with active/selected state (primary background styling: `bg-primary/10`). | High | Automated |
| **TC-INV-NAV-003** | Navigation to Report Templates sub-tab | On `/admin/investigations` | 1. Click *"Report Templates"* sub-nav link<br>2. Verify URL transition | Target: `/admin/report-templates` | Successfully routes to `/admin/report-templates`; template management catalog is rendered. | High | Automated |
| **TC-INV-NAV-004** | Navigation to Documents / Letters sub-tab | On `/admin/investigations` | 1. Click *"Documents"* sub-nav link<br>2. Verify URL transition | Target: `/admin/letters` | Successfully routes to `/admin/letters`; clinical document generator is displayed. | High | Automated |
| **TC-INV-NAV-005** | Direct browser URL navigation to `/admin/investigations` | Doctor authenticated | 1. Enter `https://qa_care.amerck.com/admin/investigations` in browser address bar<br>2. Press Enter | URL: `/admin/investigations` | Page loads cleanly with HTTP 200; practice context preserved; no redirect to login. | Critical | Automated |
| **TC-INV-NAV-006** | Practice Switcher context preserved on Investigations page | Doctor has multiple practices | 1. Switch active practice in top dropdown<br>2. Observe Investigations directory reload | Practice: `Dr John Clinic 2` | Investigations list refreshes to reflect active practice tenancy without session termination. | High | Automated |

---

## 4. Module 2: Add Diagnostic Report Modal & Input Validation

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-INV-ADD-001** | Add new diagnostic investigation with complete clinical prep details | Doctor on `/admin/investigations` | 1. Click *"Add New Report"*<br>2. Enter Abbreviation<br>3. Enter Report Name<br>4. Enter Clinical Description<br>5. Enter Patient Preparation Instructions<br>6. Click *"Create Report"* | Abbr: `FLIP`<br>Name: `Fasting Lipid Profile`<br>Desc: `Serum cholesterol & triglycerides`<br>Prep: `12-hour overnight fast. Water allowed.` | Form submits via POST; returns 201 Created; modal closes; investigation is added to practice directory and searchable. | Critical | Automated |
| **TC-INV-ADD-002** | Mandatory Abbreviation and Name validation | Add New Report modal open | 1. Leave Abbreviation and Name blank<br>2. Attempt to click *"Create Report"* | Blank inputs | HTML5 / React form validation blocks submission; fields display required red borders/prompts. | Critical | Automated |
| **TC-INV-ADD-003** | Cancel button dismisses modal without state corruption | Add New Report modal open | 1. Enter partial data<br>2. Click *"Cancel"* or *"Close"* button | Abbr: `TEMP_99` | Modal dismisses immediately; no orphan draft saved in database. | Medium | Automated |
| **TC-INV-ADD-004** | Duplicate Abbreviation rejection | Report `ECG` exists in practice | 1. Attempt to add new report with identical Abbreviation: `ECG` | Abbr: `ECG` | System displays conflict error: *"An investigation with this abbreviation already exists in this practice"*. | High | Automated |
| **TC-INV-ADD-005** | Long text handling in Clinical Instructions | Add New Report modal open | 1. Enter 1000-character detailed multi-step patient prep instructions<br>2. Save report | Prep: Extensive 24-hr urine acidification protocol | Form handles text cleanly without string truncation or SQL buffer overflow. | High | Automated |

---

## 5. Module 3: Search, Substring Filtering & Pagination Engine

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-INV-SRCH-001** | Real-time search by Abbreviation | Catalog contains `ECHO`, `ECG`, `AXR` | 1. Type `ECHO` in search bar<br>2. Press Enter | Query: `ECHO` | Table filters to display 2D Echocardiogram row; unrelated investigations hidden. | Critical | Automated |
| **TC-INV-SRCH-002** | Search by partial Report Name substring | Catalog contains `Electrocardiogram` | 1. Type `cardio` in search bar<br>2. Press Enter | Query: `cardio` | Table returns both `ECG` (12-Lead Electrocardiogram) and `ECHO` (2D Echocardiogram); case-insensitive matching. | High | Automated |
| **TC-INV-SRCH-003** | Non-matching search query displays empty indicator | 50+ investigations exist | 1. Type `NON_EXISTENT_XYZ_999`<br>2. Press Enter | Query: `NON_EXISTENT_XYZ_999` | Table displays 0 rows or clean empty prompt: *"No investigations found"*. | High | Automated |
| **TC-INV-SRCH-004** | Clear search query restores full catalog | Filtered table displayed | 1. Clear search input<br>2. Press Enter | Query: `""` | Table re-fetches `page=1&limit=10&search=` and restores default 10 rows. | Critical | Automated |
| **TC-INV-SRCH-005** | Pagination Next and Previous controls | > 10 investigations in catalog | 1. Observe default 10 rows<br>2. Click *"Next"* button<br>3. Click *"Previous"* button | Pagination nav | Page 2 loads records 11-20 cleanly; Previous returns to records 1-10. | High | Automated |

---

## 6. Module 4: Edit & Update Investigation Lifecycle

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-INV-EDT-001** | Edit existing report pre-populates current attributes | Report `ECG` exists | 1. Click *"Edit"* button on ECG row<br>2. Inspect modal values | Target: `ECG` | Modal opens with `ECG`, `12-Lead Electrocardiogram`, and patient instructions pre-populated. | Critical | Automated |
| **TC-INV-EDT-002** | Update report instructions and submit | Edit modal open | 1. Append clinical note: *"Remove metallic jewellery and smartwatches"*<br>2. Click *"Update Report"* | Updated Prep Note | System issues PUT/PATCH; returns 200 OK; updated instructions appear in table. | Critical | Automated |
| **TC-INV-EDT-003** | Delete report button requires confirmation | Edit modal open | 1. Inspect *"Delete Report"* button<br>2. Click Delete Report | Action: Delete | System prompts confirmation dialog before permanent deletion; prevents accidental data loss. | High | Automated |

---

## 7. Module 5: Clinical Patient Safety & Prep Instructions

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-INV-SAF-001** | Fasting requirement clearly documented for Metabolic Panel | Report: `Fasting Blood Glucose` | 1. View Fasting Blood Glucose instructions | Prep: `Nil by mouth 8-10 hours` | Instructions explicitly state fasting duration to prevent inaccurate glycemic assessment. | Fatal | Clinical |
| **TC-INV-SAF-002** | MRI Metal Screening & Pacemaker Contraindication | Report: `Brain MRI` | 1. Inspect MRI prep instructions | Prep: `No pacemakers or metallic implants` | Hard warning: Pacemakers, cochlear implants, and metal fragments strictly contraindicated. | Fatal | Clinical |
| **TC-INV-SAF-003** | Contrast-Induced Nephropathy (CIN) eGFR Pre-Screen | Report: `CT Contrast Abdomen` | 1. Inspect CT Contrast prep instructions | Prep: `Check eGFR / Serum Creatinine` | Instructions advise checking renal function prior to administering iodinated contrast media. | Fatal | Clinical |

---

## 8. Module 6: Care View Active Consultation Integration

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-INV-CV-001** | Add investigation requisition tag in Care View consultation | Active patient in Care View (`/admin/prescription`) | 1. Scroll to *"Investigations to be done"* section<br>2. Type investigation name (`Full Blood Count`)<br>3. Select or press Enter | Tag: `Full Blood Count` | Interactive investigation chip is added to consultation session; persisted with encounter note. | Critical | Automated |
| **TC-INV-CV-002** | Investigation empty state when no patient is selected | Care View landing | 1. Inspect investigations section before patient selection | No active patient | Input is disabled with prompt: *"Enter patient details to add investigations."* | High | Automated |
