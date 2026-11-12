# Amerck Care EMR - Clinical Documents & Letters Specification & Quality Matrix

## 1. Executive Summary & Dual-Persona Quality Strategy
- **Application Under Test (AUT)**: Amerck Care EMR — Clinical Documents Hub (`/admin/letters`), Letter Editor (`/admin/letters/edit/new?type=<type>` & `/admin/letters/edit/:id`), AI Letter Generator (`/admin/letters/ai`).
- **System Perspectives**:
  1. **Doctor / Healthcare Clinician Perspective**: Issuing medico-legal documents bound to the correct patient — specialist referral letters, medical leave certificates, confirmation of death, free-form custom letters and AI-assisted drafts — with pre-filled clinical wording and doctor credentials.
  2. **Senior QA Automation Architect Perspective**: Resilient Page Object Model (`DocumentsPage.js`), direct login via `loginAsDoctor()`, per-letter-type field coverage, patient-gate enablement checks, mandatory field validation, draft persistence (`POST /admin/api/letters` → `/admin/letters/edit/:id`), keyboard shortcut accessibility, and automated video/trace evidence capture.
- **Target Application Scope**:
  - Global Navigation & Documents link (`/admin/letters`)
  - Hub Tabs (`Create Document`, `Recent Documents`)
  - Letter Type Catalog (`AI Writer`, `Referral Letter`, `Medical Leave Certificate`, `Confirmation of Death`, `Custom Letter`)
  - Patient Picker (`Search by name, NIC or mobile number...`, `Change`)
  - Letter Editor Form, View Modes (`Form`, `Split`, `Preview`) and Toolbar (`Shortcuts`, `Save Draft`, `Print`, `Finalize & Print`)
  - Recent Documents list, empty state and pagination
  - AI Letter Generator (patient gate, template selector, prompt, `Generate with AI`, `Preview & Save`)
- **Test Data**: Existing QA patient `Edward Jenner` in the doctor's practice. Draft letters created by the suite carry a timestamp suffix.
- **Out of Scope (intentionally not automated)**: Clicking `Print` / `Finalize & Print` (opens native print dialog; finalization is irreversible) and triggering `Generate with AI` (non-deterministic external AI call).

---

## 2. Master Test Suite Architecture & Coverage Summary

| Suite # | Functional Area / Sub-Module | Test Scope & Clinical Purpose | Total Cases | Priority Breakdown | Execution Type |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | **Global Header & Navigation Integration** | Topbar routing, deep-link session, auth guard, Care View round trip | 4 | 3 Crit, 1 High | Automated |
| **02** | **Create Document Hub & Letter Type Catalog** | Default tab, five letter type cards, editor route hrefs, tab switching | 3 | 2 Crit, 1 High | Automated |
| **03** | **Letter Editor Layout & Default Content** | Per-type field sets, pre-filled wording, disabled actions, Back navigation | 5 | 4 Crit, 1 High | Automated |
| **04** | **Patient Selection & Context Binding** | Patient search/select, action enablement, Change patient, no-match & OWASP input | 4 | 2 Crit, 2 High | Automated |
| **05** | **Mandatory Field Validation** | Required-field guards per letter type, no persistence on invalid form | 3 | 3 Crit | Automated |
| **06** | **Editor View Modes & Keyboard Shortcuts** | Form / Split / Preview toggle, Shortcuts dialog, `Ctrl + /` | 3 | 1 High, 2 Medium | Automated |
| **07** | **Draft Persistence & Recent Documents** | Save Draft, `Ctrl + S`, reload integrity, Recent list linkage, empty/pagination states | 4 | 3 Crit, 1 High | Automated |
| **08** | **AI Letter Generator** | Patient gate, template + prompt guard on Generate, Back to Letters | 3 | 1 Crit, 2 High | Automated |
| **TOTAL** | **Clinical Documents Suite** | **End-to-end document authoring lifecycle** | **29** | **18 Crit, 9 High, 2 Medium** | **29 Automated** |

---

## 3. Module 1: Navigation & Global Header Integration

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DOC-NAV-001** | Doctor navigates to Documents from top navigation bar | Doctor authenticated on Care View (`/admin/prescription`) | 1. Locate `Documents` link in topbar<br>2. Click link<br>3. Verify URL, title and tabs | N/A | URL ends with `/admin/letters`; title contains *"Amerck Care"*; `Create Document` and `Recent Documents` tabs visible. | Critical | Automated |
| **TC-DOC-NAV-002** | Direct URL navigation to `/admin/letters` preserves session | Doctor authenticated | 1. Navigate directly to `/admin/letters` | URL: `/admin/letters` | Hub renders with tabs and letter cards; no redirect to login. | Critical | Automated |
| **TC-DOC-NAV-003** | Unauthenticated access to `/admin/letters` is blocked | Fresh browser context, no session | 1. Navigate to `/admin/letters` | N/A | Auth guard redirects to `/login`; Documents hub is never rendered. | Critical | Automated |
| **TC-DOC-NAV-004** | Bidirectional topbar navigation between Documents and Care View | On `/admin/letters` | 1. Click Care View icon<br>2. Verify Care View ready<br>3. Click Documents link | Route: `/admin/letters` <-> `/admin/prescription` | Smooth round trip with preserved session. | High | Automated |

---

## 4. Module 2: Create Document Hub & Letter Type Catalog

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DOC-HUB-001** | Create Document tab active by default with all five letter types | On `/admin/letters` | 1. Inspect tab state<br>2. Inspect card headings | Cards: `AI Writer`, `Referral Letter`, `Medical Leave Certificate`, `Confirmation of Death`, `Custom Letter` | `Create Document` has `aria-selected=true`; five cards render in the listed order. | Critical | Automated |
| **TC-DOC-HUB-002** | Each card's create action points to the correct editor route | On `/admin/letters` | 1. Inspect each card's action link label and `href` | `Create with AI`, `Create Referral`, `Create Certificate` ×2, `Create Custom` | `href` values: `/admin/letters/ai`, `/admin/letters/edit/new?type=referral`, `...type=medical-leave`, `...type=death-confirmation`, `...type=custom`. | Critical | Automated |
| **TC-DOC-HUB-003** | Switching between Create Document and Recent Documents tabs | On `/admin/letters` | 1. Click `Recent Documents`<br>2. Click `Create Document` | N/A | Recent tab hides letter cards and shows list/empty state; returning restores cards. | High | Automated |

---

## 5. Module 3: Letter Editor Layout & Default Clinical Content

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DOC-EDT-001** | Referral Letter editor fields, defaults and disabled actions | On `/admin/letters` | 1. Click `Create Referral`<br>2. Inspect header, fields and toolbar | Greeting: `Dear Sir/Madam`; Subject: `Referral Letter` | Title *"Referral Letter"*; status *"Draft • No patient selected"*; date pre-filled (`YYYY-MM-DD`); recipient fields empty; body pre-filled; `Save Draft`, `Print`, `Finalize & Print` disabled. | Critical | Automated |
| **TC-DOC-EDT-002** | Medical Leave Certificate pre-fills certificate wording | On `/admin/letters` | 1. Click `Create Certificate` (Medical Leave) | Recipient: `To Whom it May Concern`; Subject: `MEDICAL LEAVE CERTIFICATE` | Defaults present; body begins *"This is to certify that"*. | Critical | Automated |
| **TC-DOC-EDT-003** | Confirmation of Death renders death-specific fields | On `/admin/letters` | 1. Click `Create Certificate` (Confirmation of Death) | N/A | Registrar, Date, Time (`HH:MM`), Address, Examination Findings (*"Confirmed the absence of vital signs..."*), Probable Cause of Death, Contributory Causes rendered; recipient fields absent. | Critical | Automated |
| **TC-DOC-EDT-004** | Custom Letter starts with blank subject and body | On `/admin/letters` | 1. Click `Create Custom` | N/A | Recipient, Subject and Body empty; preview placeholder *"Preview will appear here as you type..."* shown. | High | Automated |
| **TC-DOC-EDT-005** | Back button returns from editor to Documents hub | In Referral editor | 1. Click `Back` | N/A | Navigates to `/admin/letters`; hub tabs visible. | Critical | Automated |

---

## 6. Module 4: Patient Selection & Clinical Context Binding

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DOC-PAT-001** | Selecting a patient binds the letter and enables actions | In Referral editor | 1. Type patient name in picker<br>2. Select matching option | Patient: `Edward Jenner` | Status *"Draft • Patient: Edward Jenner"*; body text includes patient name; `Save Draft`, `Print`, `Finalize & Print` enabled. | Critical | Automated |
| **TC-DOC-PAT-002** | Change button clears the selected patient | Custom editor with patient selected | 1. Click `Change` | Patient: `Edward Jenner` | Status reverts to *"No patient selected"*; picker visible; `Save Draft` disabled again. | Critical | Automated |
| **TC-DOC-PAT-003** | Non-matching patient search | In Referral editor | 1. Type non-existent token | `ZZQXNOPATIENT9999` | Only the disabled *"No patients found"* option is listed; `Save Draft` stays disabled. | High | Automated |
| **TC-DOC-PAT-004** | SQL injection / XSS payload in patient search (OWASP) | In Referral editor | 1. Enter payload in picker | `' OR '1'='1' <script>alert(1)</script>` | No JS dialog executes; *"No patients found"* shown; editor remains stable. | High | Automated |

---

## 7. Module 5: Mandatory Field Validation

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DOC-VAL-001** | Empty Custom Letter cannot be saved | Custom editor with patient selected | 1. Leave Recipient/Designation/Subject/Body empty<br>2. Click `Save Draft` | All mandatory fields `""` | Inline *"Required"* messages shown; URL stays on `/edit/new?type=custom`; zero `POST /api/letters` requests. | Critical | Automated |
| **TC-DOC-VAL-002** | Referral Letter requires recipient name and designation | Referral editor with patient selected | 1. Leave Name and Designation empty<br>2. Click `Save Draft` | Name/Designation `""` | Save blocked with two *"Required"* messages; URL stays on `/edit/new?type=referral`. **Currently fails — see DEF-DOC-001.** | Critical | Automated (`test.fail`) |
| **TC-DOC-VAL-003** | Confirmation of Death requires registrar, address and causes | Death editor with patient selected | 1. Leave Registrar, Address, Cause, Contributory Causes empty<br>2. Click `Save Draft` | All four fields `""` | Save blocked with ≥4 *"Required"* messages; URL stays on `/edit/new?type=death-confirmation`. **Currently fails — see DEF-DOC-002.** | Critical | Automated (`test.fail`) |

---

## 8. Module 6: Editor View Modes & Keyboard Shortcuts

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DOC-MODE-001** | Form / Split / Preview view modes | Referral editor with patient selected | 1. Click `Preview`<br>2. Click `Split`<br>3. Click `Form` | N/A | Preview hides the form; Split shows form plus rendered letter (*"Yours sincerely,"*); Form restores the form. | High | Automated |
| **TC-DOC-MODE-002** | Shortcuts button opens Keyboard Shortcuts dialog | In Referral editor | 1. Click `Shortcuts`<br>2. Press `Escape` | `Ctrl + S`, `Ctrl + P`, `Ctrl + Shift + P`, `Ctrl + /` | Dialog lists save / print / finalize shortcuts; closes on Escape. | Medium | Automated |
| **TC-DOC-MODE-003** | `Ctrl + /` opens Keyboard Shortcuts dialog | In Referral editor | 1. Press `Ctrl + /` | Key: `Ctrl + /` | Keyboard Shortcuts dialog opens. | Medium | Automated |

---

## 9. Module 7: Draft Persistence & Recent Documents

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DOC-SAVE-001** | Save Referral draft and verify persistence after reload | Referral editor with patient selected | 1. Fill Name and Designation<br>2. Click `Save Draft`<br>3. Reload page | Name: `Dr. QA Cardiologist <id>`; Designation: `Consultant Cardiologist` | Redirect to `/admin/letters/edit/:id`; toast *"Letter saved successfully"*; values and patient persist after reload. | Critical | Automated |
| **TC-DOC-SAVE-002** | `Ctrl + S` saves the draft | Custom editor with patient and all fields filled | 1. Press `Ctrl + S` | Subject: `Fitness to Resume Sports <id>` | Redirect to `/admin/letters/edit/:id`; success toast shown. | High | Automated |
| **TC-DOC-SAVE-003** | Saved draft appears in Recent Documents and reopens | Medical Leave draft saved | 1. Click `Back`<br>2. Open `Recent Documents`<br>3. Click saved letter | Designation: `HR Manager <id>` | List item links to the saved `/edit/:id`, shows *"Medical Leave"*, patient and *"Draft"*; reopening restores saved values. | Critical | Automated |
| **TC-DOC-SAVE-004** | Recent Documents empty state or paginated list | On `/admin/letters` | 1. Open `Recent Documents` | N/A | Empty: *"No letters found"* + *"Create your first letter"*. Populated: letter rows + `Previous`, `n/n`, `Next`. | Critical | Automated |

---

## 10. Module 8: AI Letter Generator

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DOC-AI-001** | AI generator requires patient selection | On `/admin/letters` | 1. Click `Create with AI` | N/A | URL `/admin/letters/ai`; heading *"AI Letter Generator"*; *"No Patient Selected"* gate shown; prompt hidden. | Critical | Automated |
| **TC-DOC-AI-002** | Generate guarded until template and prompt provided | AI generator with patient selected | 1. Verify templates<br>2. Type prompt only<br>3. Select template<br>4. Clear prompt | Templates: `Medical Leave Letter`, `Referral Letter`, `Fitness Certificate`, `Treatment Summary`; Prompt: *"Leave for 3 days... acute bronchitis"* | `Preview & Save` disabled; `Generate with AI` disabled with prompt only, enabled with template + prompt, disabled again when prompt cleared. | High | Automated |
| **TC-DOC-AI-003** | Back to Letters returns to Documents hub | On `/admin/letters/ai` | 1. Click `Back to Letters` | N/A | Navigates to `/admin/letters`; hub tabs visible. | High | Automated |

---

## 11. Known Defects Found During Automation

| Defect ID | Linked Test | Summary | Steps to Reproduce | Expected | Actual | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **DEF-DOC-001** | TC-DOC-VAL-002 | Referral Letter saves with empty mandatory recipient fields | 1. Open Referral editor<br>2. Select patient<br>3. Leave Name/Designation empty<br>4. Click `Save Draft` | Save blocked with *"Required"* (inputs carry `required`; Custom Letter enforces this) | Letter saved and redirected to `/admin/letters/edit/:id` | High |
| **DEF-DOC-002** | TC-DOC-VAL-003 | Confirmation of Death saves with empty registrar, address and causes of death | 1. Open Confirmation of Death editor<br>2. Select patient<br>3. Leave required fields empty<br>4. Click `Save Draft` | Save blocked — a medico-legal death confirmation must not be stored without cause of death | Letter saved and redirected to `/admin/letters/edit/:id` | Critical |
| **DEF-DOC-003** | — (observed) | Medical Leave Certificate saves with empty Recipient Designation | Same as above on Medical Leave editor | Save blocked on `required` field | Letter saved | Medium |

> TC-DOC-VAL-002 and TC-DOC-VAL-003 are marked `test.fail()` with a `defect` annotation so the suite stays green while the defects are open. When the application is fixed these tests will start failing as "expected to fail but passed" — remove the `test.fail()` line at that point.
