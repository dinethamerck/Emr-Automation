# Amerck Care EMR - Master Report Templates Specification & Quality Matrix

## 1. Executive Summary & Dual-Persona Quality Strategy
- **Application Under Test (AUT)**: Amerck Care EMR — Clinical Report Templates Directory (`/admin/report-templates`), New Template Editor (`/admin/report-templates/new`), Template Details & Parameter Builder (`/admin/report-templates/:id`).
- **System Perspectives**:
  1. **Doctor / Healthcare Clinician Perspective**: Standardized diagnostic reporting, structured lab/radiology observation panels (e.g., ABG, Full Blood Count, 24-hr Urine Protein, Dengue Monitoring), rapid requisition prep, reference interval definitions, parameter customization (numeric vs text vs choice), and clinic-specific practice isolation.
  2. **Senior QA Automation Architect Perspective**: Resilient Page Object Model (`ReportTemplatesPage.js`), high-speed authentication bypassing redundant self-registration via `loginAsDoctor()`, Equivalence Partitioning (EP) & Boundary Value Analysis (BVA) on template naming and parameters, card DOM isolation, debounce search verification, form persistence assertions, parameter modal lifecycle, and automated video evidence capture.
- **Target Application Scope**:
  - Global Navigation & Report Templates Badge (`/admin/report-templates`)
  - Template Directory Grid & Card Catalog (`Title`, `Category Badges`, `Abbreviation`, `Scope / Local`, `Description`, `Investigation Count`, `Parameter Bullets`)
  - Real-Time Substring Search Engine (`input[placeholder="Search templates..."]`)
  - New Template Creation Wizard (`/admin/report-templates/new`)
  - Template Details Form (`Name`, `Abbreviation`, `Description`, `Categories`, `Save`)
  - Clinical Parameter Details Modal & Grid (`Name`, `Type`, `Default Value / Reference`, `Save`, `Close`)
  - Edit & Delete Lifecycle Operations (Pencil Edit, Trash Destructive, Pagination)

---

## 2. Master Test Suite Architecture & Coverage Summary

| Suite # | Functional Area / Sub-Module | Test Scope & Clinical Purpose | Total Cases | Priority Breakdown | Execution Type |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | **Global Header & Navigation Integration** | Link visibility, URL routing (`/admin/report-templates`), active state styling, practice tenant switching | 6 | 4 Crit, 2 High | Automated |
| **02** | **Template Directory Grid & Card Catalog** | Card metadata rendering, abbreviation badges, local scope indicators, investigation parameter counts, pagination | 8 | 6 Crit, 2 High | Automated |
| **03** | **Real-Time Search & Substring Filtering** | Template name substring match, category filtering, case-insensitivity, non-matching query handling, clear search | 8 | 6 Crit, 2 High | Automated |
| **04** | **Template Creation & Validation Lifecycle** | Form fields, mandatory name validation, toast notification (`Template created successfully`), URL transition to `/admin/report-templates/:id` | 10 | 7 Crit, 3 High | Automated |
| **05** | **Clinical Parameter Details Builder & Modal** | Add Parameter button state guard, modal fields (`Name`, `Type`, `Default Value`), parameter saving, card list append | 10 | 7 Crit, 3 High | Automated |
| **06** | **Template Modification & Clinical Deletion** | Edit action trigger, parameter updating, back navigation to catalog, template deletion, persistence | 8 | 6 Crit, 2 High | Automated |
| **TOTAL** | **Enterprise Report Templates Suite** | **Comprehensive Clinical & Technical Quality Lifecycle** | **50** | **36 Fatal/Crit, 14 High** | **Full Coverage Matrix** |

---

## 3. Module 1: Navigation & Global Header Integration

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-RPT-NAV-001** | Doctor navigates to Report Templates from top navigation bar | Doctor authenticated on Care View (`/admin/prescription`) | 1. Locate `Report Templates` navigation link in top navbar<br>2. Click link<br>3. Verify URL and page title | N/A | Application transitions cleanly to `/admin/report-templates`; URL contains `/admin/report-templates`; page title reflects *"Amerck Care"*. | Critical | Automated |
| **TC-RPT-NAV-002** | Report Templates navigation link shows active route styling | On `/admin/report-templates` | 1. Inspect navigation bar link styling | Link: `Report Templates` | Navigation item renders with active/selected state (highlighted badge/background styling). | High | Automated |
| **TC-RPT-NAV-003** | Direct browser URL navigation to `/admin/report-templates` | Doctor authenticated | 1. Navigate directly to `https://qa_pg.amerck.care/admin/report-templates`<br>2. Wait for DOM content loaded | URL: `/admin/report-templates` | Page loads directly with HTTP 200; practice context preserved; template catalog renders. | Critical | Automated |
| **TC-RPT-NAV-004** | Practice Switcher context preserved on Report Templates | Doctor has active practice tenancy | 1. Inspect top practice dropdown<br>2. Switch active practice in header | Practice: `DrJohn Tester's Practice` | Template catalog refreshes according to selected clinic practice isolation without session termination. | High | Automated |
| **TC-RPT-NAV-005** | Unauthenticated access to `/admin/report-templates` triggers login redirect | Clean incognito session without auth storage | 1. Navigate to `/admin/report-templates` without active session | N/A | Auth guard immediately redirects user to `/login`; protected templates are shielded. | Critical | Automated |
| **TC-RPT-NAV-006** | Responsive topbar icon navigation between Report Templates and Care View | On `/admin/report-templates` | 1. Click stethoscope icon in topbar<br>2. Verify Care View loaded<br>3. Click Report Templates icon to return | Route: `/admin/prescription` <-> `/admin/report-templates` | Smooth bidirectional navigation with preserved session and zero page reload crashes. | High | Automated |

---

## 4. Module 2: Template Directory Grid & Card Catalog

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-RPT-CAT-001** | Verify primary catalog controls and "+ New Template" button | On `/admin/report-templates` | 1. Inspect header controls above grid | Elements: Search input, `+ New Template` button | Search bar and `+ New Template` button are visible and interactive. | Critical | Automated |
| **TC-RPT-CAT-002** | Template card displays title, category badge, and abbreviation | Catalog populated | 1. Inspect card for `24-Hour Urine Protein` | Template: `24-Hour Urine Protein` | Card renders title, category badge (*Urinalysis, Nephrology*), and abbreviation badge (*U24P*). | Critical | Automated |
| **TC-RPT-CAT-003** | Template card displays clinical scope badge (Local) | Catalog populated | 1. Inspect scope badge on template card | Badge: `Local` | Displays "Local" badge with edit icon indicating custom clinic template ownership. | Medium | Automated |
| **TC-RPT-CAT-004** | Template card displays investigation count and parameter bullets | Template has associated parameters | 1. Inspect card parameter summary | Summary: `5 investigations` | Displays count and bulleted list of constituent clinical parameters (e.g., *Total Volume*, *Urine Protein Concentration*). | High | Automated |
| **TC-RPT-CAT-005** | Template card action buttons (Edit & Delete) presence | Template rendered | 1. Inspect top right corner of template card | Icons: Pencil (Edit), Trash (Delete) | Both action buttons are present, rendered with accessible SVG icons. | Critical | Automated |
| **TC-RPT-CAT-006** | Pagination controls visibility and page boundary state | Multiple pages of templates exist | 1. Inspect footer pagination controls | Pagination: `< Previous`, `1/2`, `Next >` | Pagination elements are rendered cleanly; disabled states reflect boundary on page 1. | High | Automated |
| **TC-RPT-CAT-007** | Navigating to Next page loads subsequent templates | Multiple pages exist | 1. Click `Next` pagination button<br>2. Observe page count update | Page: `2/2` | Subsequent page of template cards loads smoothly; page counter updates to `2/2`. | High | Automated |
| **TC-RPT-CAT-008** | Template grid responsive layout on various viewports | Desktop & Tablet viewports | 1. Resize viewport to 1024px and 768px<br>2. Inspect grid columns | Viewports: 1280px (3 cols), 1024px (2 cols), 768px (1 col) | Cards adapt responsively without text clipping, badge overlapping, or horizontal scrolling overflows. | Medium | Automated |

---

## 5. Module 3: Real-Time Search & Substring Filtering

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-RPT-SRCH-001** | Search filters grid by template title substring | Templates `Dengue Panel`, `ANCA Panel` exist | 1. Enter `Dengue` in search input<br>2. Wait 500ms debounce | Query: `Dengue` | Grid isolates cards matching `Dengue` (`Dengue Panel`, `Dengue Monitoring Panel`); non-matching cards excluded. | Critical | Automated |
| **TC-RPT-SRCH-002** | Search filters by clinical category keyword | Templates exist | 1. Enter `Cardiology` in search input<br>2. Observe card filter | Query: `Cardiology` | Grid displays templates categorized under cardiology (e.g., *Ambulatory Blood Pressure Report*). | High | Automated |
| **TC-RPT-SRCH-003** | Case-insensitive search query evaluation | On `/admin/report-templates` | 1. Enter `lipid` (lowercase)<br>2. Observe results | Query: `lipid` | Successfully matches and displays `Lipid Profile`. | High | Automated |
| **TC-RPT-SRCH-004** | Non-matching search query displays zero cards / empty state | Catalog populated | 1. Enter `NON_EXISTENT_TEMPLATE_9999` in search | Query: `NON_EXISTENT_TEMPLATE_9999` | Grid displays 0 cards cleanly without DOM crash or console exceptions. | High | Automated |
| **TC-RPT-SRCH-005** | Clearing search input restores full template catalog | Filtered grid active | 1. Clear text from search input<br>2. Wait 500ms debounce | Query: `""` | Full template grid is restored to original unfiltered card count. | Critical | Automated |
| **TC-RPT-SRCH-006** | Special character handling in search bar (OWASP input safety) | On `/admin/report-templates` | 1. Enter `' OR '1'='1' --` and `<script>` in search | Query: SQLi & XSS payloads | Input is sanitized; search evaluates as literal string; zero script execution. | Critical | Automated |
| **TC-RPT-SRCH-007** | Search input retains focus during rapid keystrokes | On `/admin/report-templates` | 1. Type query rapidly without pausing | Query: `Anti-Mullerian Hormone` | Input maintains cursor position and focus; no component re-render focus stealing. | High | Automated |
| **TC-RPT-SRCH-008** | Abbreviation search matching (e.g., "ABPM", "U24P") | Catalog populated | 1. Enter `ABPM` in search input | Query: `ABPM` | Directly matches and isolates `Ambulatory Blood Pressure Report`. | High | Automated |

---

## 6. Module 4: Template Creation & Validation Lifecycle

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-RPT-NEW-001** | Click "+ New Template" button navigates to template editor | On `/admin/report-templates` | 1. Click `+ New Template` button<br>2. Wait for page load | Button: `+ New Template` | Navigates to `/admin/report-templates/new`; Template Details card and Parameters card render. | Critical | Automated |
| **TC-RPT-NEW-002** | Verify Template Details form inputs and placeholders | On `/admin/report-templates/new` | 1. Inspect form inputs for Name, Abbreviation, Description, Categories | Placeholders: `Required`, `Optional`, `Optional`, `e.g. Hematology, Diabetes, etc.` | All 4 inputs are visible with accurate clinical placeholder hints. | High | Automated |
| **TC-RPT-NEW-003** | Attempting to save without mandatory Name prevents submission | On new template page | 1. Leave `Name` blank<br>2. Click `Save` button | Name: `""` | Submission is blocked by HTML5/client validation; no broken POST dispatch. | Critical | Automated |
| **TC-RPT-NEW-004** | Create valid report template with all demographic attributes | On new template page | 1. Fill Name: `Renal Clearance Panel`<br>2. Fill Abbr: `RCP`<br>3. Fill Description: `Estimated GFR & Creatinine clearance`<br>4. Fill Category: `Nephrology`<br>5. Click `Save` | Template Details | POST request dispatched (HTTP 201); toast notification displays *"Template created successfully"*. | Critical | Automated |
| **TC-RPT-NEW-005** | Template save redirects cleanly to `/admin/report-templates/:id` | Template saved | 1. Observe browser URL after successful save | Target: `/admin/report-templates/:id` | URL updates with newly allocated template ID; form enters saved editing mode. | Critical | Automated |
| **TC-RPT-NEW-006** | Parameter "+ Add" button is disabled prior to template initial save | On `/admin/report-templates/new` | 1. Inspect `+ Add` button on Parameters card | Button: `+ Add` | Button is disabled with `disabled` attribute; prevents orphan parameters on unsaved template. | Critical | Automated |
| **TC-RPT-NEW-007** | Parameter "+ Add" button becomes enabled once template is saved | Template saved (`/admin/report-templates/:id`) | 1. Inspect `+ Add` button after save | Button: `+ Add` | Disabled attribute is removed; `+ Add` button becomes active and clickable. | Critical | Automated |
| **TC-RPT-NEW-008** | Click "Back" button returns to Report Templates catalog | On template editor page | 1. Click `<- Back` button | Button: `<- Back` | Navigates back to `/admin/report-templates`; template grid renders. | Critical | Automated |
| **TC-RPT-NEW-009** | Newly created template persists and appears in catalog | Template created | 1. Return to `/admin/report-templates`<br>2. Search for newly created template | Template: `Renal Clearance Panel` | Newly created template is listed with correct title, category, and abbreviation badges. | Critical | Automated |
| **TC-RPT-NEW-010** | Special characters in template title and description | On new template page | 1. Enter title with `&`, `/`, `-`, `()`: `Lipid & Cardiac / Biomarkers (Panel-A)`<br>2. Click `Save` | Characters: `& / - ()` | Template saves successfully without character encoding corruption or server 500 error. | High | Automated |

---

## 7. Module 5: Clinical Parameter Details Builder & Modal

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-RPT-PRM-001** | Click "+ Add" button opens Parameter Details modal dialog | On saved template page (`/admin/report-templates/:id`) | 1. Click `+ Add` button in Parameters card<br>2. Verify modal | Dialog: `[role="dialog"]` | Modal opens with title *"Parameter Details"*; backdrop overlays background. | Critical | Automated |
| **TC-RPT-PRM-002** | Verify Parameter Details modal inputs and default values | Modal open | 1. Inspect `Name`, `Type`, `Default Value` inputs | Name: `Required`, Type: `Text`, Default: `Optional` | All fields visible; `Type` defaults to standard `Text` or selector option. | High | Automated |
| **TC-RPT-PRM-003** | Dismiss Parameter Details modal using Close (X) button | Modal open | 1. Click `X` icon in modal header | Button: `X` | Modal closes immediately; backdrop removed; template details view accessible. | Critical | Automated |
| **TC-RPT-PRM-004** | Dismiss Parameter Details modal using Escape key | Modal open | 1. Press `Escape` key on keyboard | Key: `Escape` | Modal gracefully dismisses via standard accessibility keyboard event. | High | Automated |
| **TC-RPT-PRM-005** | Add clinical text parameter to report template | Modal open | 1. Fill Name: `Serum Creatinine`<br>2. Fill Default Value: `0.7 - 1.3 mg/dL`<br>3. Click `Save` in modal | Parameter: `Serum Creatinine` | Modal closes; parameter `Serum Creatinine` is appended to template Parameters list. | Critical | Automated |
| **TC-RPT-PRM-006** | Add multiple clinical parameters sequentially | On template page with 1 parameter | 1. Click `+ Add`<br>2. Enter `Blood Urea Nitrogen`<br>3. Click `Save`<br>4. Repeat for `eGFR` | Parameters: `BUN`, `eGFR` | Both parameters append cleanly; parameter count increases to 3. | Critical | Automated |
| **TC-RPT-PRM-007** | Parameter mandatory Name validation | Modal open | 1. Leave parameter Name empty<br>2. Click `Save` in modal | Name: `""` | Save action blocked; validation error displayed; parameter not appended. | High | Automated |
| **TC-RPT-PRM-008** | Parameter list empty state displays when zero parameters exist | New template without parameters | 1. Inspect Parameters card | Prompt: `No parameters found` | Displays *"No parameters found - Add parameters to the report template"*. | High | Automated |
| **TC-RPT-PRM-009** | Parameter default value / reference range persistence | Template with parameter created | 1. Refresh page on `/admin/report-templates/:id`<br>2. Inspect parameters | Reference: `0.7 - 1.3 mg/dL` | Saved parameter values persist accurately across page reloads. | Critical | Automated |
| **TC-RPT-PRM-010** | Reorder or delete parameter from template | Template has parameters | 1. Locate delete/remove button on parameter row<br>2. Click remove | Target: Parameter row | Parameter is removed from list; template parameter count updates. | High | Automated |

---

## 8. Module 6: Template Modification & Clinical Deletion

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-RPT-MGT-001** | Clicking Edit (pencil) button on card opens template editor | On `/admin/report-templates` | 1. Locate card for target template<br>2. Click pencil icon button | Target: Template card Edit icon | Navigates directly to `/admin/report-templates/:id`; pre-populates all template details. | Critical | Automated |
| **TC-RPT-MGT-002** | Update template description and verify persistence | On template editor page | 1. Modify Description input<br>2. Click `Save`<br>3. Verify toast | Note: *"Updated clinical protocol 2026."* | Save indicator / toast appears; updated description persists on reload. | Critical | Automated |
| **TC-RPT-MGT-003** | Update template category tags | On template editor page | 1. Change Category to `Critical Care`<br>2. Click `Save` | Category: `Critical Care` | Category badge updates in card catalog upon returning to listing. | High | Automated |
| **TC-RPT-MGT-004** | Verify Delete (trash) icon renders with destructive styling | On `/admin/report-templates` | 1. Inspect trash can button on card | Class: `text-destructive` | Button styled with warning red/destructive color indicating permanent clinical data loss. | High | Automated |
| **TC-RPT-MGT-005** | Delete custom local template from catalog | Dedicated test template exists | 1. Click trash can icon on custom template<br>2. Confirm deletion dialog | Test template | Template card is removed from grid; deletion request dispatched (HTTP 200/204). | Critical | Automated |
| **TC-RPT-MGT-006** | System-default templates protected from unauthorized deletion | Core system templates | 1. Inspect system templates (if read-only) | System template | System guardrails protect clinical baseline order sets. | Critical | Automated |
| **TC-RPT-MGT-007** | Return to Care View consultation workflow after template configuration | On Report Templates page | 1. Complete template setup<br>2. Click Care View icon in topbar | Return flow | Re-enters `/admin/prescription` cleanly; consultation workspace ready for patient care. | High | Automated |
| **TC-RPT-MGT-008** | End-to-end Report Template Lifecycle: Create -> Add Parameters -> Search -> Edit -> Verify | Doctor on `/admin/report-templates` | 1. Create template<br>2. Add parameters<br>3. Save<br>4. Search in catalog<br>5. Open & verify | Complete E2E flow | Seamless round-trip execution across all modules with 100% pass rate. | Critical | Automated |
