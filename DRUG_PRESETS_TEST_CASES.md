# Amerck Care EMR - Drug Presets Specification & Quality Matrix

## 1. Executive Summary & Dual-Persona Quality Strategy
- **Application Under Test (AUT)**: Amerck Care EMR — Drug Presets: presets list (`/admin/drugs/presets`) and preset editor (`/admin/drugs/presets/edit/new`, `/admin/drugs/presets/edit/:id`).
- **System Perspectives**:
  1. **Doctor / Healthcare Clinician Perspective**: Standard regimens (e.g. URTI, hypertension) saved once and reused, with every drug carrying the right dose, frequency, route and duration, in the right order. Incomplete regimens must never be saved, because they are later prescribed to patients.
  2. **Senior QA Automation Architect Perspective**: Resilient Page Object Model (`DrugPresetsPage.js`), direct login via `loginAsDoctor()`, API contract checks (`POST` / `PUT` / `DELETE /drugPresets`), persistence after reload, and **self-cleaning tests on a shared account**.
- **Safety Strategy**: All suites share the QA doctor account.
  - Form and validation tests call `blockPresetWrites()`, which aborts every non-GET request to `*.amerck.care`. They assert **zero** write attempts, so nothing is saved.
  - Lifecycle tests create presets with unique names (`PW <label> <timestamp>`) and delete them in `afterEach`, even when a test fails.
- **Preconditions**: Drug Cabinet contains *Amoxicillin 500 mg / Oral / TDS* (added by `TC-DC-002`) for the suggestion test `TC-PRS-FRM-002`.

---

## 2. Master Test Suite Architecture & Coverage Summary

| Suite # | Functional Area / Sub-Module | Test Scope & Clinical Purpose | Total Cases | Priority Breakdown | Execution Type |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | **Access & Navigation** | Drug Cabinet entry link, deep link, auth guard, Back links | 4 | 2 Crit, 2 High | Automated |
| **02** | **Presets List** | Search, empty state, clear control, pager | 4 | 1 High, 3 Medium | Automated |
| **03** | **Editor: Medication Rows** | Defaults, Drug Cabinet autofill, add / reorder / remove / clear | 5 | 3 High, 2 Medium | Automated |
| **04** | **Editor: Validation** | Required name and medication, incomplete rows | 6 | 4 Crit, 2 High | Automated |
| **05** | **Preset Lifecycle** | Create, reopen, edit, delete cancel / confirm | 5 | 4 Crit, 1 High | Automated |
| **TOTAL** | **Drug Presets Suite** | **Reusable prescribing regimens** | **24** | **10 Crit, 9 High, 5 Medium** | **24 Automated** |

---

## 3. Module 1: Access & Navigation

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-PRS-NAV-001** | Drug Cabinet Presets link opens the presets list | Doctor authenticated | 1. Open `/admin/drugs`<br>2. Click `Presets` | N/A | URL `/admin/drugs/presets`; `New Preset`, `Search…` and `Back` shown; columns *Preset Name*, *Notes*, *Number of Drugs*. | Critical | Automated |
| **TC-PRS-NAV-002** | Direct URL navigation preserves session | Doctor authenticated | 1. Navigate directly to `/admin/drugs/presets` | N/A | List renders without login redirect. | High | Automated |
| **TC-PRS-NAV-003** | Unauthenticated access to the editor is redirected | Fresh context, no session | 1. Navigate to `/admin/drugs/presets/edit/new` | N/A | Redirect to `/login`; editor never rendered. | Critical | Automated |
| **TC-PRS-NAV-004** | Back links return to list and Drug Cabinet | On presets list | 1. Click `New Preset`<br>2. Click editor `Back`<br>3. Click list `Back` | N/A | Editor `Back` → `/admin/drugs/presets`; list `Back` → `/admin/drugs`. | High | Automated |

---

## 4. Module 2: Presets List

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-PRS-LST-001** | Searching by preset name filters the list | Unique preset created by the test | 1. Open list<br>2. Search the preset name | `PW Search <timestamp>` | Exactly one row, the matching preset. Preset deleted afterwards. | High | Automated |
| **TC-PRS-LST-002** | Non-matching search shows the empty state | On presets list | 1. Search `zzqx_no_such_preset` | N/A | *"No Drug Presets Found"* and *"Add a drug preset to get started."*; no rows. | Medium | Automated |
| **TC-PRS-LST-003** | Clear control resets the filter | List filtered to empty state | 1. Click the clear (x) control | N/A | Search box empty; empty state gone; table headers shown. | Medium | Automated |
| **TC-PRS-LST-004** | Pager shows position; Previous does nothing on page 1 | On presets list | 1. Inspect pager<br>2. Click `Previous`<br>3. If N = 1, click `Next` | N/A | Indicator `1/N`; clicking `Previous` (and `Next` when N = 1) keeps the indicator and sends no list request. See OBS-PRS-001. | Medium | Automated |

---

## 5. Module 3: Editor — Medication Rows

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-PRS-FRM-001** | New editor opens blank with one default row | Writes blocked | 1. Open `New Preset` | N/A | Name/Notes empty with *Required*/*Optional* hints; columns Generic/Brand, Dosage, Frequency, Route, Duration; one blank row with Route `PO`; no `Delete Preset`; zero writes. | Medium | Automated |
| **TC-PRS-FRM-002** | Drug Cabinet suggestion autofills the row | Amoxicillin in Drug Cabinet; writes blocked | 1. Type `Amox` in Generic name<br>2. Pick `Amoxicillin` | `Amox` | Row filled with Amoxicillin, `500 mg`, `TDS`, `Oral`. | High | Automated |
| **TC-PRS-FRM-003** | Add Medication appends; Move up reorders | Writes blocked | 1. Fill row 1<br>2. `Add Medication`, fill row 2<br>3. Move row 2 up | Amoxicillin 500 mg TDS 5 days; Paracetamol 1 g QID 3 days | Two rows in entry order; after Move up, Paracetamol is first with all values intact. | High | Automated |
| **TC-PRS-FRM-004** | Remove deletes only the selected row | Writes blocked; two rows | 1. Click remove (x) on row 1 | Amoxicillin; Paracetamol | Only Paracetamol remains. | High | Automated |
| **TC-PRS-FRM-005** | Clear All resets medications to one blank row | Writes blocked; two rows and a name | 1. Click `Clear All` | N/A | One blank row (Route `PO`); preset name kept; zero writes. | Medium | Automated |

---

## 6. Module 4: Editor — Validation

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-PRS-VAL-001** | Empty preset shows name and medication errors | Writes blocked | 1. Click `Save` on blank editor | N/A | *"Required"* under Name and *"At least one medication is required"*; stays on `/edit/new`; zero writes. | Critical | Automated |
| **TC-PRS-VAL-002** | Name without medication is rejected | Writes blocked | 1. Enter name only<br>2. `Save` | `Name Only Preset` | *"At least one medication is required"*; no name error; zero writes. | Critical | Automated |
| **TC-PRS-VAL-003** | Medication without name is rejected | Writes blocked | 1. Fill a medication<br>2. `Save` | Paracetamol 500 mg TDS | *"Required"* under Name; zero writes. | Critical | Automated |
| **TC-PRS-VAL-004** | Whitespace-only name is rejected | Writes blocked | 1. Name `"   "` plus valid medication<br>2. `Save` | Name: 3 spaces | Save blocked; zero writes. **Known defect DEF-PRS-001** (`test.fail()`). | High | Automated |
| **TC-PRS-VAL-005** | Row without generic name is rejected | Writes blocked | 1. Name plus row with dosage only<br>2. `Save` | Dosage `500 mg` | Save blocked; zero writes. **Known defect DEF-PRS-002** (`test.fail()`). | Critical | Automated |
| **TC-PRS-VAL-006** | Drug without dosage and frequency is rejected | Writes blocked | 1. Name plus generic-only row<br>2. `Save` | Generic `Paracetamol` | Save blocked; zero writes. **Known defect DEF-PRS-003** (`test.fail()`). | High | Automated |

---

## 7. Module 5: Preset Lifecycle

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-PRS-CRUD-001** | Creating a two-drug preset saves and lists it | Doctor authenticated | 1. Fill name, notes, two medications<br>2. `Save`<br>3. Search list | Notes `Take after meals`; Amoxicillin 500 mg TDS Oral 5 days; Paracetamol 1 g QID 3 days | `POST /drugPresets` → 201 *"Preset created successfully"*; redirect to `/edit/:id` with `Delete Preset`; list row shows notes and *"2 Drugs"*. Deleted afterwards. | Critical | Automated |
| **TC-PRS-CRUD-002** | Saved preset reopens with medications in saved order | Preset created by the test | 1. Open it from the list | Paracetamol then Amoxicillin | Name, notes and both rows (all five fields) match the saved values in the saved order. | Critical | Automated |
| **TC-PRS-CRUD-003** | Edit persists new name and medication list | Two-drug preset created by the test | 1. Rename<br>2. Remove Amoxicillin<br>3. `Save`<br>4. Reload | Name + ` Edited` | `PUT /drugPresets?id=:id` → 200 *"Preset updated successfully"*; after reload only Paracetamol remains with the new name; list shows *"1 Drug"*. | Critical | Automated |
| **TC-PRS-CRUD-004** | Cancelling delete keeps the preset | Preset created by the test | 1. `Delete Preset`<br>2. `Cancel` | N/A | Dialog: *"Are you sure you want to delete this preset? This action cannot be undone."*; after Cancel the dialog closes and the preset is still listed. | High | Automated |
| **TC-PRS-CRUD-005** | Confirming delete removes the preset | Preset created by the test | 1. `Delete Preset`<br>2. `Delete` | N/A | `DELETE /drugPresets?id=:id` → 204; redirect to list; search for the name shows *"No Drug Presets Found"*. | Critical | Automated |

---

## 8. Known Defects Found During Automation

| Defect ID | Linked Test | Summary | Steps to Reproduce | Expected | Actual | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **DEF-PRS-001** | TC-PRS-VAL-004 | Whitespace-only preset name passes validation | 1. New Preset<br>2. Name `"   "`<br>3. Add a valid medication<br>4. `Save` | *"Required"* (name trimmed before validation) | Request sent: `POST /drugPresets` with `"name":"   "` | Medium |
| **DEF-PRS-002** | TC-PRS-VAL-005 | Medication row with no drug name is saved | 1. New Preset with a name<br>2. Enter only Dosage `500 mg`<br>3. `Save` | Save blocked; generic name required per row | Request sent with treatment `"generic_name":""` | High |
| **DEF-PRS-003** | TC-PRS-VAL-006 | Drug without dosage or frequency is saved | 1. New Preset with a name<br>2. Enter only Generic `Paracetamol`<br>3. `Save` | Save blocked; a regimen needs dose and frequency | Request sent with `"dosage":""`, `"frequency":""` | High |
| **OBS-PRS-001** | TC-PRS-LST-004 | Unavailable pager buttons look and announce as active | Open the list on page 1 (or a single-page list) | `Previous` / `Next` greyed out and `aria-disabled="true"` when unavailable | Buttons keep their active style and have no `aria-disabled`; clicking them does nothing | Low (UX / accessibility) |

> TC-PRS-VAL-004 to VAL-006 are marked `test.fail()` with a `defect` annotation so the suite stays green while the defects are open. The write guard blocks the request, so these tests never create presets. When the application is fixed, these tests will report "expected to fail but passed"; remove the `test.fail()` line at that point.
