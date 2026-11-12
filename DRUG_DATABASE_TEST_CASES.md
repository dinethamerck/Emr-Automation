# Amerck Care EMR - Drug Database Change Impact Specification & Quality Matrix

## 1. Executive Summary & Dual-Persona Quality Strategy
- **Trigger**: The drug database was changed. This suite checks every area that consumes drug data, so a database change can be verified end to end.
- **How drug data flows** (from the app's JavaScript bundles and observed traffic):

| Layer | API | Used by |
| :--- | :--- | :--- |
| **Standard drug database** (default formulary) | `GET /standardDrugs/getDrugs`; `POST` / `PUT` / `DELETE /standardDrugs` | Administrators only; a doctor gets 403 |
| **Populate** (copy the standard database into a cabinet) | `POST /standardDrugs/populateDrugs` | Drug Cabinet → `Populate` button |
| **Doctor's Drug Cabinet** (each drug keeps `parentDrug_id` = its source standard drug) | `GET /drugs/getDrugs?page&limit&search`, `POST` / `PUT` / `DELETE /drugs` | Drug Cabinet list and edit |
| **Prescribing suggestions** | `GET /drugs/getDrugs?limit=100&search=…` (searches generic **and** brand; was `limit=0` = whole cabinet before the 3 Nov 2026 deployment) | Care View prescription grid, Drug Preset editor |
| **Saved presets** | `/drugPresets`; each treatment stores a **copy** of the drug details plus `drug_id` | Drug Presets |

  The browser's offline store (IndexedDB `PatientDB`) has a `drugs` table, but it was empty in every check, so no stale offline copy exists today.
- **Approach**: A doctor cannot read the changed standard database (403), and a real Populate permanently adds the whole formulary to the shared QA account. So:
  - **"After the change" behaviour** is tested by serving `NEW_DATABASE_DRUGS` (23 synthetic drugs) as the cabinet through a mocked `GET /drugs/getDrugs` that honours paging and search. The data includes combination names, special characters, non-oral routes and missing brand/frequency.
  - **Populate** is mocked, except TC-DDB-POP-004, which runs the real Populate only when `RUN_LIVE_POPULATE=1` is set.
  - **Real data** is only read: authorisation, brand search, and integrity of the live cabinet and presets.
  - **All writes are blocked**, including Care View autosave (`PUT /prescriptions`), so the test patient's record is never changed.
- **System Perspectives**:
  1. **Doctor / Healthcare Clinician Perspective**: After a database change, every drug is shown and prescribed with the right strength, route and frequency. Removed drugs are no longer suggested, and saved regimens keep working.
  2. **Senior QA Automation Architect Perspective**: API contracts per layer, rendering of imperfect data, search/paging, idempotent re-population, and referential integrity between presets and the cabinet.

---

## 2. Master Test Suite Architecture & Coverage Summary

| Suite # | Functional Area / Sub-Module | Test Scope & Clinical Purpose | Total Cases | Priority Breakdown | Execution Type |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | **Standard Drug Database Access** | Only admins can read the formulary | 1 | 1 Crit | Automated |
| **02** | **Populate** | Request contract, success feedback, failure, live idempotency | 4 | 1 Crit, 2 High, 1 Medium | Automated (POP-004 opt-in) |
| **03** | **Drug Cabinet after the Change** | Listing, paging, search, imperfect data, empty cabinet | 5 | 1 Crit, 2 High, 2 Medium | Automated |
| **04** | **Care View Prescribing** | New drug suggested and filled, removed drug gone, missing fields, brand search | 4 | 2 Crit, 1 High, 1 Medium | Automated |
| **05** | **Drug Presets** | New drug in preset editor; preset with removed drug | 2 | 1 Crit, 1 High | Automated |
| **06** | **Real Data Integrity** | Required fields, duplicates, preset → cabinet links | 3 | 1 Crit, 2 High | Automated |
| **TOTAL** | **Drug Database Change Impact Suite** | **Every consumer of drug data** | **19** | **7 Crit, 8 High, 4 Medium** | **18 Automated + 1 opt-in live** |

---

## 3. Module 1: Standard Drug Database Access

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DDB-STD-001** | Doctor cannot read the standard drug database | Doctor authenticated | 1. `GET /standardDrugs/getDrugs`<br>2. `GET /standardDrugs/` | Doctor token | Both answer 403 `{"error":"You do not have permission to perform this action"}`. | Critical | Automated |

---

## 4. Module 2: Populate

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DDB-POP-001** | Populate sends one request to the standard database | Populate mocked 200 | 1. Open Drug Cabinet<br>2. Click `Populate` | N/A | Button titled *"Populate drugs from standard formulary"*; exactly one `POST /standardDrugs/populateDrugs` with no body. | High | Automated |
| **TC-DDB-POP-002** | Successful Populate confirms and refreshes | Populate mocked 200 | 1. Click `Populate` | N/A | A confirmation is shown and the cabinet list is reloaded. **Known defect DEF-DDB-001** (`test.fail()`). | High | Automated |
| **TC-DDB-POP-003** | Failed Populate shows an error; cabinet unchanged | Populate mocked 500 | 1. Record rows<br>2. Click `Populate` | Server error | Error shown (*"Request failed with status code 500"*, see OBS-DDB-001); rows identical to before. | Medium | Automated |
| **TC-DDB-POP-004** | **[LIVE, opt-in]** Real Populate links drugs and is idempotent | `RUN_LIVE_POPULATE=1`; preferably a disposable account | 1. `POST /standardDrugs/populateDrugs`<br>2. Wait until the populated count is stable<br>3. Populate again | Real standard database | Drugs with `parentDrug_id` appear; each has generic name, strength and method; a second run adds **no** drugs and no `parentDrug_id` repeats. | Critical | Automated (opt-in) |

---

## 5. Module 3: Drug Cabinet after the Change

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DDB-CAB-001** | New database drugs listed with columns and paging | Cabinet = 23 new drugs | 1. Open Drug Cabinet<br>2. Next, Next | `NEW_DATABASE_DRUGS` | Columns *Generic Name, Brand Name, Strength, Frequency*; 10 rows, first *Amlodipine / Norvasc / 5 mg / OD*; pager `1/3` → `3/3` with Simvastatin, Vitamin B12 (Cyanocobalamin), Warfarin; request `page=3&limit=10`. | Critical | Automated |
| **TC-DDB-CAB-002** | Search by generic and by brand | Cabinet = new drugs | 1. Search `statin`<br>2. Search `Glucophage` | — | `statin` → Atorvastatin, Simvastatin; `Glucophage` → *Metformin / Glucophage / 500 mg / BD*. | High | Automated |
| **TC-DDB-CAB-003** | Missing brand / frequency shown blank | Cabinet = new drugs | 1. Search `Clavulanic`<br>2. Open the row | Amoxicillin + Clavulanic Acid (brand and frequency null) | List cells blank, never *null* / *undefined*; Edit Drug dialog shows empty Brand and Frequency, Strength *625 mg*, Method *Oral*; zero writes. | High | Automated |
| **TC-DDB-CAB-004** | Combination names, special characters, non-oral routes intact | Cabinet = new drugs | 1. Search each drug | Co-trimoxazole; Vitamin B12 (Cyanocobalamin) 1000 mcg Weekly; Salbutamol 100 mcg/puff PRN | Each row shows exactly the database values. | Medium | Automated |
| **TC-DDB-CAB-005** | Empty cabinet after the change | Cabinet = no drugs | 1. Open Drug Cabinet | — | *"No drugs found"*, *"Add a drug to get started."*; `Populate` enabled. | Medium | Automated |

---

## 6. Module 4: Care View Prescribing

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DDB-CV-001** | New database drug is suggested and fills the row | Cabinet = new drugs; patient *Edward Jenner* open; writes blocked | 1. Type `Metfor` in the prescription<br>2. Pick *Metformin* | Metformin / Glucophage 500 mg Oral BD | Lookup `search=Metfor` (limit 100); suggestion shows *Glucophage*, *Metformin*, *Dosage: 500 mg* (Method / Frequency no longer listed since 3 Nov 2026); row filled 500 mg / BD / Oral. | Critical | Automated |
| **TC-DDB-CV-002** | Drug removed from the database is no longer suggested | New drugs (no Ibuprofen); patient open | 1. Type `Ibuprofen` | Ibuprofen | No suggestion; the typed name stays as free text with no dosage and route *PO*. | Critical | Automated |
| **TC-DDB-CV-003** | Suggestion with missing frequency | New drugs; patient open | 1. Pick *Prednisolone* | Prednisolone 5 mg Oral, frequency null | Dosage *5 mg*, route *Oral*, frequency blank (no *null*). | Medium | Automated |
| **TC-DDB-CV-004** | Real cabinet drug found by brand name | Real cabinet; patient open | 1. Type `Panadol` | Paracetamol / Panadol | Suggestion shows *Paracetamol* with *Dosage: 650 mg*. | High | Automated |

---

## 7. Module 5: Drug Presets

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DDB-PRS-001** | Preset editor suggests new database drugs | Cabinet = new drugs | 1. New Preset<br>2. Type `Atorva`, pick *Atorvastatin* | Atorvastatin / Lipitor 20 mg Oral Nocte | Row filled 20 mg / Nocte / Oral. | High | Automated |
| **TC-DDB-PRS-002** | Preset with a drug removed from the database still opens | Cabinet = new drugs (no Ibuprofen); preset mocked | 1. Open preset `PW Legacy Regimen` | Treatment: Ibuprofen / Advil 400 mg TDS Oral 3 days, `drug_id` 937502 | Name shown; medication row shows the stored values unchanged; zero writes. | Critical | Automated |

---

## 8. Module 6: Real Data Integrity (read-only)

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DDB-INT-001** | Every cabinet drug has the fields prescribing needs | Live cabinet | 1. `GET /drugs/getDrugs?limit=0` | Whole cabinet | `count` equals rows returned; every drug has generic name, strength and method. | Critical | Automated |
| **TC-DDB-INT-002** | No duplicate drugs | Live cabinet | 1. Group by generic + brand + strength | Whole cabinet | No group with more than one drug. | High | Automated |
| **TC-DDB-INT-003** | Presets linked to missing drugs keep complete copies | Live cabinet and presets | 1. Compare each preset treatment's `drug_id` with the cabinet | All presets | Treatments whose drug no longer exists are listed in the report annotation, and each still has generic name, dosage and method. | High | Automated |

---

## 9. Known Defects & Observations Found During Automation

| ID | Linked Test | Summary | Steps to Reproduce | Expected | Actual | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **DEF-DDB-001** | TC-DDB-POP-002 | Populate gives no feedback and does not refresh the cabinet | Drug Cabinet → `Populate` (success response) | Confirmation (e.g. *"Drug population started in background"*) and the list reloads | Nothing is shown and the list is not reloaded. The doctor cannot tell whether the new database was applied. | Medium |
| **OBS-DDB-001** | TC-DDB-POP-003 | Populate failure shows a technical message | `Populate` when the server fails | The server's message, e.g. *"Unable to load the standard formulary"* | *"Request failed with status code 500"* | Low (UX) |
| **OBS-DDB-002** | TC-DDB-INT-003 | Live preset links to a deleted drug | Compare presets with cabinet | `drug_id` points to an existing cabinet drug, or is cleared when the drug is removed | *Adult URTI Standard Regimen* → Amoxicillin `drug_id` 937503, which is not in the cabinet (cabinet Amoxicillin is 937500). The preset still works because it keeps its own copy. | Low (data integrity) |
| **OBS-DDB-003** | — (live data) | No cabinet drug came from the standard database | `GET /drugs/getDrugs?limit=0` | After the existing TC-DC-006 clicks the real `Populate` on every run, drugs with `parentDrug_id` would be expected | All 3 cabinet drugs (Amoxicillin, Ibuprofen, Paracetamol) have `parentDrug_id = null`, so no populated drug is present. Populate may be failing silently after the database change; confirm with TC-DDB-POP-004 on a disposable account. | **High (needs confirmation)** |
| **OBS-DDB-004** | TC-DDB-CV-001..003 | Text typed right after opening a patient is wiped | Open a patient in Care View and type a drug name within ~1 s | Typed text is kept | The patient's saved draft finishes loading (`getLatestDraft` → `activeMedications`, about 3 s) and replaces the grid, erasing what was typed. The tests wait for that load. | Medium (UX) |
| **OBS-DDB-005** | — (existing suite) | Existing Populate test cannot fail | `drugCabinet.spec.js` TC-DC-006 | Assert a real confirmation | It looks for `/Drug population started in background\|Populate/i`, which always matches the **Populate button itself**. It also runs the real Populate on the shared account on every run. Replace it with TC-DDB-POP-001..003 (mocked) and TC-DDB-POP-004 (opt-in live). | Medium (test quality) |

> TC-DDB-POP-002 is marked `test.fail()` with a `defect` annotation so the suite stays green while the defect is open. When it is fixed, the test will report "expected to fail but passed"; remove the `test.fail()` line at that point.
>
> **Running the live check**: `RUN_LIVE_POPULATE=1 npx playwright test tests/drugDatabase.spec.js -g "POP-004"`. It permanently adds the standard formulary to the logged-in account's cabinet, so use a disposable account (set `DOCTOR_USERNAME` / `DOCTOR_PASSWORD` for that run).
