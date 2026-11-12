# Amerck Care EMR - Prescription Medication Specification & Quality Matrix

## 1. Executive Summary & Dual-Persona Quality Strategy
- **Application Under Test (AUT)**: Amerck Care EMR — the medication grid of the Care View prescription (`/admin/prescription`).
  - **Row**: Generic name (with Drug Cabinet suggestions), Dosage, Frequency, Route (default *PO*), Duration, remove (x), Move up / Move down, and a "⋮" menu (*Remove*, *Add Row*) on narrow screens.
  - **Section actions**: *Clear All*, *Use Preset*, *Add Medication*.
- **How it works** (observed traffic):
  - **Drug suggestions**: `GET /drugs/getDrugs?limit=100&search=…` searches the doctor's Drug Cabinet by generic **and** brand name. Since the 3 Nov 2026 deployment the suggestion shows brand, generic and *Dosage* (before: also *Method* and *Frequency*); picking still fills method and frequency.
  - **Autosave**: every change saves `treatments` in `PUT /prescriptions?id=<draft>`.
    - Each treatment is `{ generic_name, brand_name, dosage, frequency, method, duration, expiration_date (today + duration), patient_id, is_active }`.
    - Status shows *"All changes saved"*, or after repeated failures *"Changes couldn't be saved after multiple attempts…"*.
  - **Reopening a patient** loads the draft (`getLatestDraft` → `GET /prescriptions?id=` → `patients` → `patients/activeMedications`) and restores its `treatments`.
- **System Perspectives**:
  1. **Doctor / Healthcare Clinician Perspective**: Every drug in the list can be prescribed with the right strength, frequency and route. Standard regimens insert in one step, and the prescription warns about allergies, duplicates and impossible doses.
  2. **Senior QA Automation Architect Perspective**: Data-driven coverage of **every drug** (real cabinet and the new drug database), grid operations, the autosave payload contract, draft restore, and failure handling.
- **Safety Strategy**:
  - **Patient**: *Edward Jenner*, an existing QA patient with a recorded **Penicillin** allergy.
  - **Autosaves**: every autosave is answered by the test (`fakeSaves`) and its payload recorded. The patient's draft is never changed, and all other writes are aborted.
  - **Real data**: the Drug Cabinet and presets are only read.
  - **New-database scenario**: the cabinet is served from `NEW_DATABASE_DRUGS` (23 drugs, see `DRUG_DATABASE_TEST_CASES.md`).
- **Test data rule**: Drug lists are read at run time (`GET /drugs/getDrugs`, `GET /drugPresets/getPresets`), so the "every drug" tests grow automatically with the cabinet.

---

## 2. Master Test Suite Architecture & Coverage Summary

| Suite # | Functional Area / Sub-Module | Test Scope & Clinical Purpose | Total Cases | Priority Breakdown | Execution Type |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | **Medication Grid Layout** | Columns, default row, actions, Active Medications | 1 | 1 High | Automated |
| **02** | **Drug List** | Every real drug, brand search, every new-database drug, search rules, free text, brand data | 6 | 3 Crit, 2 High, 1 Medium | Automated |
| **03** | **Row Operations** | Add, Enter, reorder, remove, Clear All, phone menu, replacing a drug | 6 | 1 Crit, 2 High, 3 Medium | Automated |
| **04** | **Use Preset** | Preset list and search, appending preset medications | 2 | 1 High, 1 Medium | Automated |
| **05** | **Autosave & Persistence** | Payload contract and expiry, failure message, draft restore | 3 | 2 Crit, 1 High | Automated |
| **06** | **Clinical Safety** | Allergy, duplicate, impossible values | 3 | 1 Crit, 2 High | Automated |
| **TOTAL** | **Prescription Medication Suite** | **Safe, accurate prescribing** | **21** | **7 Crit, 9 High, 5 Medium** | **21 Automated** |

---

## 3. Module 1: Medication Grid Layout

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-RX-UI-001** | Grid opens with columns, a blank row and actions | Patient open in Care View | 1. Inspect the medication grid | Edward Jenner | Columns *Generic/Brand, Dosage, Frequency, Route, Duration*; one blank row with route *PO*; *Clear All*, *Use Preset*, *Add Medication*; *Active Medications* panel. | High | Automated |

---

## 4. Module 2: Drug List

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-RX-DRUG-001** | Every real cabinet drug is found by generic name and fills the row | Real Drug Cabinet | For **each** drug: 1. Type the first 4 letters<br>2. Pick it | Whole cabinet (read at run time) | Row = cabinet generic, dosage, frequency, route exactly. | Critical | Automated |
| **TC-RX-DRUG-002** | Every branded drug is suggested by brand name | Real cabinet | For **each** branded drug: type the brand | e.g. Amoxil, Advil, Panadol | Suggestion shows brand, generic and *Dosage: …*. | High | Automated |
| **TC-RX-DRUG-003** | Every drug of the new drug database is prescribable with its own values | Cabinet = `NEW_DATABASE_DRUGS` | For **each** of 23 drugs: 1. Clear All<br>2. Search full name, pick | Includes combinations, special characters, inhaled/IM routes, missing frequency | Row = that drug's dosage, frequency (blank if none), route. | Critical | Automated |
| **TC-RX-DRUG-004** | Search is case-insensitive and partial | Real cabinet | 1. Search `AMOX`, `amox`, and a middle fragment | First cabinet drug | The drug is suggested for every term. | Medium | Automated |
| **TC-RX-DRUG-005** | Unknown drug stays as free text | Patient open | 1. Type `Zzqxmycin` | — | No suggestion; row keeps `Zzqxmycin` with route *PO*; saved as typed. | High | Automated |
| **TC-RX-DRUG-006** | Brand-search pick saves generic and brand correctly | Real branded drug | 1. Search the brand<br>2. Pick the drug | Amoxil → Amoxicillin | Saved `generic_name` = generic, `brand_name` = brand. **Known defect DEF-RX-004** (`test.fail()`). | Critical | Automated |

---

## 5. Module 3: Row Operations

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-RX-ROW-001** | Add Medication and Enter add rows | Patient open | 1. *Add Medication*<br>2. Enter in last Duration | `3 days` | 2 rows, then 3; the new row is blank with *PO*. | Medium | Automated |
| **TC-RX-ROW-002** | Move up reorders; save keeps order | Two drugs prescribed | 1. Move row 2 up | First two cabinet drugs | Grid order swapped; saved `treatments` in the new order. | High | Automated |
| **TC-RX-ROW-003** | Remove deletes only that row | Two drugs prescribed | 1. Remove row 1 | — | Only the second drug remains on screen and in the save. | High | Automated |
| **TC-RX-ROW-004** | Clear All resets the grid | Drugs prescribed | 1. *Clear All* | — | One blank row; the save contains no named treatment. No confirmation is asked (OBS-RX-002). | Medium | Automated |
| **TC-RX-ROW-005** | Phone-size row menu | Drug prescribed; viewport 420 px | 1. Open the row "⋮" menu<br>2. *Add Row* | — | Menu items *Remove* and *Add Row*; *Add Row* adds a second row. | Medium | Automated |
| **TC-RX-ROW-006** | Replacing a drug does not keep the old frequency | Cabinet = new database | 1. Pick Amlodipine (OD)<br>2. Pick Prednisolone into the same row | Prednisolone has no default frequency | Frequency blank on screen and in the save. **Known defect DEF-RX-005** (`test.fail()`). | Critical | Automated |

---

## 6. Module 4: Use Preset

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-RX-PRE-001** | Preset list shows details and can be searched | At least one preset | 1. *Use Preset*<br>2. Search a non-existent name | First saved preset | Dialog *"Add Medication Preset — Select a medication preset to add to this prescription"*; preset name, notes and first medication shown; the search hides it. | Medium | Automated |
| **TC-RX-PRE-002** | Choosing a preset appends its medications | One drug already prescribed | 1. *Use Preset*<br>2. Pick the preset | First preset | Original drug stays first; preset medications follow with stored dosage, frequency, route and duration; saved. | High | Automated |

---

## 7. Module 5: Autosave & Persistence

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-RX-SAVE-001** | Autosave sends every field | Patient open | 1. Pick a drug<br>2. Duration `5 days` | First cabinet drug | Saved treatment = generic, brand, dosage, frequency, method, `duration: "5 days"`, `expiration_date` = today + 5 days, `patient_id`, `is_active: false`; *"All changes saved"*. | Critical | Automated |
| **TC-RX-SAVE-002** | Repeated save failures are reported | Saves answered 500 | 1. Pick a drug | — | *"Changes couldn't be saved after multiple attempts. Please check your network connection."* | High | Automated |
| **TC-RX-SAVE-003** | Draft medications restored on reopen | Draft response carries 2 treatments | 1. Open the patient | Amoxicillin 500 mg TDS Oral 5 days; Paracetamol 650 mg PRN Q6H Oral 3 days | Both rows restored, in order, with every field. | Critical | Automated |

---

## 8. Module 6: Clinical Safety

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-RX-SAF-001** | Allergy warning when prescribing an allergen | Patient has Penicillin allergy; *Amoxicillin* added as allergy | 1. Prescribe Amoxicillin | Amoxicillin | Allergy warning shown. **Known defect DEF-RX-001** (`test.fail()`). | Critical | Automated |
| **TC-RX-SAF-002** | Duplicate drug warning | Patient open | 1. Prescribe the same drug in two rows | First cabinet drug | Duplicate warning shown. **Known defect DEF-RX-002** (`test.fail()`). | High | Automated |
| **TC-RX-SAF-003** | Impossible values rejected | Patient open | 1. Dosage `-5 mg`, frequency `9999 times`, duration `abc` | — | Values flagged and not saved. **Known defect DEF-RX-003** (`test.fail()`). | High | Automated |

---

## 9. Known Defects & Observations Found During Automation

| ID | Linked Test | Summary | Steps to Reproduce | Expected | Actual | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **DEF-RX-001** | TC-RX-SAF-001 | No allergy check when prescribing | Patient *Edward Jenner* (recorded **Penicillin** allergy) → prescribe **Amoxicillin** (a penicillin). Even with *Amoxicillin* itself recorded as an allergy, no warning is shown. | Warning or hard stop naming the allergy | Drug is suggested, filled and saved silently | **Critical (patient safety)** |
| **DEF-RX-004** | TC-RX-DRUG-006 | Brand-name search saves generic and brand swapped | Type `Amoxil`, pick *Amoxicillin* | `generic_name: "Amoxicillin"`, `brand_name: "Amoxil"` | Grid shows *Amoxil* in Generic; saved `generic_name: "Amoxil"`, `brand_name: "Amoxicillin"` | **Critical (record accuracy)** |
| **DEF-RX-005** | TC-RX-ROW-006 | Replacing a drug keeps the old drug's frequency | Pick Amlodipine (OD) in a row, then pick Prednisolone (no default frequency) in the same row | Frequency blank | Frequency stays *OD* and is saved. Seen again with Co-trimoxazole → Prednisolone (*BD* kept). | **High (wrong dosing instruction)** |
| **DEF-RX-002** | TC-RX-SAF-002 | Duplicate medication not flagged | Same drug in two rows, or a preset adding a drug already prescribed | Duplicate warning | Both rows accepted and saved silently | High |
| **DEF-RX-003** | TC-RX-SAF-003 | No validation of dosage / frequency / duration | Enter `-5 mg`, `9999 times`, `abc` | Invalid values flagged | Accepted and saved | Medium |
| **OBS-RX-001** | TC-RX-PRE-002 | Use Preset always appends | Apply a preset to a prescription that already has drugs | Option to replace, or a duplicate warning | Preset drugs are added after the existing ones, including duplicates | Low |
| **OBS-RX-002** | TC-RX-ROW-004 | Clear All has no confirmation | Click *Clear All* with drugs entered | Confirmation, because the change autosaves at once | All medications removed and saved immediately | Medium (UX) |
| **OBS-RX-003** | — (observed) | Text typed right after opening a patient is wiped | Open a patient and type within ~1 s | Typed text kept | The draft load (about 3 s) replaces the grid; tests wait for `patients/activeMedications` | Medium (UX) |
| **OBS-RX-004** | TC-RX-ROW-005 | Row "⋮" menu exists only on narrow screens | Desktop width | — | On desktop the menu button is hidden; Remove / Move are separate buttons | Info |

> TC-RX-DRUG-006, TC-RX-ROW-006 and TC-RX-SAF-001..003 are marked `test.fail()` with a `defect` annotation so the suite stays green while the defects are open. When a defect is fixed, its test will report "expected to fail but passed"; remove that `test.fail()` line at that point.
