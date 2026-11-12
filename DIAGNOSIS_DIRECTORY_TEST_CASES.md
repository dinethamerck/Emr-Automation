# Amerck Care EMR - Diagnosis Directory Specification & Quality Matrix

## 1. Executive Summary & Dual-Persona Quality Strategy
- **Application Under Test (AUT)**: Amerck Care EMR — Diagnosis Directory (`/admin/diagnosis`). It lists **Global** diagnoses (the built-in ICD reference, about 19,600 entries) and the doctor's own **Custom** diagnoses, 10 per page, with server-side search and an Add / Edit dialog.
- **Relationship to existing documents**: `DIAGNOSIS_TEST_CASES.md` / `diagnosis.spec.js` cover the diagnosis box inside **Care View** and a planned directory feature set. This document covers the directory page **as it is built today**, verified against QA.
- **System Perspectives**:
  1. **Doctor / Healthcare Clinician Perspective**: Find a diagnosis by clinical term or ICD code, and keep a clean practice vocabulary of custom diagnoses with codes. The ICD reference itself must stay unchanged.
  2. **Senior QA Automation Architect Perspective**: Page object `DiagnosisDirectoryPage.js` and API contract checks on `GET /diagnosis/getDiagnosis`, `POST /diagnosis`, `PUT /diagnosis?id=` and `DELETE /diagnosis?id=`. Search waits for the matching response instead of fixed sleeps.
- **Safety Strategy**: All suites share the QA doctor account.
  - Dialog and validation tests call `blockDiagnosisWrites()` and assert **zero** write attempts.
  - Lifecycle tests create custom diagnoses named `PW Dx <label> <timestamp>` and delete them in `afterEach`, even when a test fails.
  - Global entries are never changed. Saving one only creates a custom copy, which is cleaned up.

---

## 2. Master Test Suite Architecture & Coverage Summary

| Suite # | Functional Area / Sub-Module | Test Scope & Clinical Purpose | Total Cases | Priority Breakdown | Execution Type |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | **Access & Directory Listing** | Deep link, auth guard, columns, Global/Custom labels, paging | 4 | 1 Crit, 1 High, 2 Medium | Automated |
| **02** | **Search** | By term, by ICD code, empty state + Clear, typing debounce | 4 | 1 Crit, 1 High, 2 Medium | Automated |
| **03** | **Add / Edit Dialog** | Defaults, Escape/Close, Global edit mode | 2 | 1 High, 1 Medium | Automated |
| **04** | **Validation** | Required name, ICD code, whitespace | 3 | 1 Crit, 1 High, 1 Medium | Automated |
| **05** | **Custom Diagnosis Lifecycle** | Create, duplicate rule, edit, Global copy, delete | 7 | 3 Crit, 3 High, 1 Medium | Automated |
| **TOTAL** | **Diagnosis Directory Suite** | **Practice diagnosis vocabulary** | **20** | **6 Crit, 7 High, 7 Medium** | **20 Automated** |

---

## 3. Module 1: Access & Directory Listing

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DXD-NAV-001** | Directory opens with columns, controls and pager | Doctor authenticated | 1. Open `/admin/diagnosis` | N/A | `Add Diagnosis` and empty `Search…`; columns *Diagnosis*, *ICD Code*; 10 rows; indicator `1/N` with N > 1. | High | Automated |
| **TC-DXD-NAV-002** | Unauthenticated access is redirected | Fresh context, no session | 1. Open `/admin/diagnosis` | N/A | Redirect to `/login`; no directory rows. | Critical | Automated |
| **TC-DXD-LST-001** | Rows labelled Global or Custom; Global rows have a code | On directory | 1. Search `asthma`<br>2. Inspect rows | `asthma` | Every row labelled *Global* or *Custom*; every Global row shows an ICD code. | Medium | Automated |
| **TC-DXD-LST-002** | Next / Previous move between pages | On page 1 | 1. Click `Previous`<br>2. Click `Next`<br>3. Click `Previous` | N/A | Previous on page 1 sends no request and stays on `1/N` (see OBS-DXD-001); Next loads `page=2` with no overlapping rows, shown as `2/N`; Previous restores the original page 1 rows. | Medium | Automated |

---

## 4. Module 2: Search

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DXD-SRCH-001** | Search by clinical term | On directory | 1. Search `asthma` | `asthma` | Request `search=asthma`; every result name contains *asthma*; *Asthma* included; pager back to `1/N`. | Critical | Automated |
| **TC-DXD-SRCH-002** | Search by ICD code | On directory | 1. Search `CA23` | `CA23` | Every result has a code starting `CA23`; includes *Asthma — Global — CA23*. | High | Automated |
| **TC-DXD-SRCH-003** | No-match search shows empty state; Clear restores | On directory | 1. Search nonsense term<br>2. Click Clear (x) | `zzqx_no_such_diagnosis` | *"No diagnoses found"* and *"Add a diagnosis to get started."*; after Clear the box is empty and 10 rows return. | Medium | Automated |
| **TC-DXD-SRCH-004** | Typing sends one request after the user stops | On directory | 1. Type `cough variant` one character at a time (60 ms apart) | `cough variant` | Exactly one search request (`search=cough variant`); result *Cough variant asthma — CA23.22*. | Medium | Automated |

---

## 5. Module 3: Add / Edit Dialog

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DXD-DLG-001** | Add dialog opens empty, Escape closes, reopens empty | Writes blocked | 1. `Add Diagnosis`<br>2. Type a name, press `Escape`<br>3. Reopen, click `Close` | `Unsaved Diagnosis` | Empty Name and ICD Code; no Delete; Escape closes; typed name discarded on reopen; Close closes; zero writes. | Medium | Automated |
| **TC-DXD-DLG-002** | Global entry opens in "Save as Custom" mode | Writes blocked | 1. Search and open *Cough variant asthma* (Global) | N/A | *"Edit Diagnosis"* with notice *"This is a global reference diagnosis. Saving changes will add it as a customized diagnosis to your list."*; fields pre-filled; only `Save as Custom Diagnosis`, no Delete; zero writes. | High | Automated |

---

## 6. Module 4: Validation

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DXD-VAL-001** | Empty name is rejected | Writes blocked | 1. `Add Diagnosis`<br>2. `Save` | N/A | *"Name is required"*; dialog stays open; zero writes. | Critical | Automated |
| **TC-DXD-VAL-002** | ICD Code marked Required is enforced | Writes blocked | 1. Enter name only<br>2. `Save` | `Name Without Code` | ICD Code placeholder reads *Required*; save blocked; zero writes. **Known defect DEF-DXD-001** (`test.fail()`). | High | Automated |
| **TC-DXD-VAL-003** | Whitespace-only name is rejected | Writes blocked | 1. Name `"   "`, code `PW99`<br>2. `Save` | 3 spaces | Save blocked; zero writes. **Known defect DEF-DXD-002** (`test.fail()`). | Medium | Automated |

---

## 7. Module 5: Custom Diagnosis Lifecycle

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DXD-CRUD-001** | Add a custom diagnosis | Doctor authenticated | 1. `Add Diagnosis`<br>2. Name + code<br>3. `Save`<br>4. Search name | `PW Dx Create <ts>` / `PW01` | `POST /diagnosis` body `{"diagnosis":{"description","code"}}` → 201; toast *"Diagnosis created successfully"*; dialog closes; one row *Custom — PW01*. | Critical | Automated |
| **TC-DXD-CRUD-002** | Duplicate custom diagnosis is refused | Custom diagnosis exists | 1. Add the same name again | Same name / code | *"Diagnosis already exists"*; dialog stays open; still one entry. | High | Automated |
| **TC-DXD-CRUD-003** | Duplicate answered with a client error | Custom diagnosis exists | 1. Add the same name again<br>2. Inspect response | Same name / code | HTTP 4xx (e.g. 409). **Known defect DEF-DXD-003** (`test.fail()`). | Medium | Automated |
| **TC-DXD-CRUD-004** | Edit a custom diagnosis | Custom diagnosis exists | 1. Open it<br>2. Change name and code<br>3. `Save` | Name + ` Edited` / `PW02` | Edit dialog shows Delete; `PUT /diagnosis?id=` → 200; toast *"Diagnosis updated successfully"*; list shows only the updated entry. | Critical | Automated |
| **TC-DXD-CRUD-005** | Saving a Global creates a Custom copy | On directory | 1. Open *Cough variant asthma* (Global)<br>2. Rename<br>3. `Save as Custom Diagnosis` | New name; code kept `CA23.22` | `POST /diagnosis` with the new name and `CA23.22` → 201; list shows the Custom copy **and** the unchanged Global entry. | High | Automated |
| **TC-DXD-CRUD-006** | Delete a custom diagnosis | Custom diagnosis exists | 1. Open it<br>2. `Delete` | N/A | `DELETE /diagnosis?id=` → 200; dialog closes; search shows *"No diagnoses found"*. | Critical | Automated |
| **TC-DXD-CRUD-007** | Delete asks for confirmation | Custom diagnosis exists | 1. Open it<br>2. `Delete` | N/A | A confirmation dialog appears before deleting. **Known defect DEF-DXD-004** (`test.fail()`). | High | Automated |

---

## 8. Known Defects & Observations Found During Automation

| Defect ID | Linked Test | Summary | Steps to Reproduce | Expected | Actual | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **DEF-DXD-001** | TC-DXD-VAL-002 | ICD Code shows *Required* but is not enforced | 1. `Add Diagnosis`<br>2. Enter only a name<br>3. `Save` | Save blocked until a code is entered | Saved with `"code":""` (201). Existing custom *"Tension"* already has no code. | Medium |
| **DEF-DXD-002** | TC-DXD-VAL-003 | Whitespace-only name passes validation | 1. `Add Diagnosis`<br>2. Name `"   "`, any code<br>3. `Save` | *"Name is required"* | Request sent with `"description":"   "` | Medium |
| **DEF-DXD-003** | TC-DXD-CRUD-003 | Duplicate diagnosis returns HTTP 500 | Add a custom diagnosis twice | 409 Conflict (or another 4xx) | `500 {"error":"Diagnosis already exists"}`; same pattern as DEF-LGN-001 on login | Low |
| **DEF-DXD-004** | TC-DXD-CRUD-007 | Delete has no confirmation | Open a custom diagnosis, click `Delete` | *"Are you sure…?"* confirmation (as on Drug Presets) | Deleted immediately; one misclick permanently removes the diagnosis | Medium |
| **OBS-DXD-001** | TC-DXD-LST-002 | Unavailable pager buttons look and announce as active | Page 1: inspect `Previous` | Greyed out with `aria-disabled="true"` | Active style and no `aria-disabled`; clicking does nothing. Same on Drug Presets (OBS-PRS-001). | Low (UX / accessibility) |

> TC-DXD-VAL-002, VAL-003, CRUD-003 and CRUD-007 are marked `test.fail()` with a `defect` annotation so the suite stays green while the defects are open. When the application is fixed, these tests will report "expected to fail but passed"; remove the `test.fail()` line at that point.
