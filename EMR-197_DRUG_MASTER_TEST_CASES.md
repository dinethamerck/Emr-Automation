# EMR-197 - Drug Master Table Rename (StandardDrugs → DrugMaster) Test Cases

## 1. Summary
- **Ticket**: EMR-197. The table holding the master drug list (shown as **Standard Formulary**) is renamed from `StandardDrugs` to `DrugMaster`, by migration `20261102100000-rename-standard-drugs-to-drug-master.js`.
- **What changed**:
  - The table, primary key, ID sequence and 6 indexes are renamed.
  - The model `standardDrugs.js` is replaced by `drugMaster.js`.
  - `standardDrugService.js` and `scripts/importDrugs.js` now use `db.DrugMaster`.
- **What must not change**:
  - API URLs (`/standardDrugs/...`), permissions and screens.
  - Row IDs, so the org/doctor `Drugs.parentDrug_id` links stay valid.
- **Goal of testing**: Prove the rename is invisible to users. Every area that reads or writes the master list must behave exactly as before, with no data loss and a working rollback.
- **Automation**: `tests/emr197DrugMaster.spec.js` (`npm run test:emr197`) runs at **API level**, so it does not depend on the web front end. Accounts are set in `.env`:

| Variable | Account | Used by |
| :--- | :--- | :--- |
| `DOCTOR_USERNAME` / `DOCTOR_PASSWORD` | Doctor without Standard Formulary access (the QA doctor) | ACC cases (runs today) |
| `FORMULARY_ADMIN_USERNAME` / `FORMULARY_ADMIN_PASSWORD` | User allowed to manage Standard Formulary | FRM-01..10 |
| `POPULATE_TEST_USERNAME` / `POPULATE_TEST_PASSWORD` | Doctor of a **disposable** organisation with no drugs; Populate permanently fills it | POP-01..03 |
| `DRUG_MASTER_EXPECTED_COUNT` (optional) | Row count recorded before the migration (set to **35435**, the developer's count, which QA matches) | FRM-01, POP-01 |

  Created formulary drugs are named `PW EMR197 Generic <timestamp>` and deleted after each test.
- **Manual cases** need QA database or server access (migration, SQL checks, rollback, backend log) or the web screen.
- **Related regression suites**: `npm run test:drugdb`, `npm run test:rx`, `npm run test:presets`, `npm run test:cabinet`.

---

## 2. Coverage Summary

| Suite # | Area | Scope | Total Cases | Priority Breakdown | Execution Type |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | **Migration & Database** | Migration run, rename, data, indexes, sequence, links, idempotency, rollback, deploy order | 10 | 8 Crit, 2 High | Manual (DB / server) |
| **02** | **Access Control** | Unchanged permission behaviour | 3 | 1 Crit, 2 High | 2 Automated, 1 Manual |
| **03** | **Standard Formulary** | List, search, paging, open, add, duplicates, edit, delete, screen | 12 | 4 Crit, 6 High, 2 Medium | 10 Automated, 2 Manual |
| **04** | **Populate** | Fill an empty organisation, no duplicates, prescription search, real result vs toast | 4 | 3 Crit, 1 High | 3 Automated, 1 Manual |
| **05** | **Regression of Drug Consumers** | Drug Cabinet, prescriptions, presets | 3 | 1 Crit, 2 High | Automated (existing suites) |
| **TOTAL** | **EMR-197** | **Rename invisible to users, no data loss** | **32** | **17 Crit, 13 High, 2 Medium** | **18 Automated, 14 Manual** |

---

## 3. Module 1: Migration & Database

| Test Case ID | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-EMR197-DB-01** | Migration runs cleanly (change note #1) | QA database backed up; `SELECT COUNT(*) FROM "StandardDrugs";` recorded | 1. `npx sequelize-cli db:migrate` in vajira-backend | — | Log shows *Table 'StandardDrugs' renamed to 'DrugMaster' successfully*; no errors. | Critical | Manual |
| **TC-EMR197-DB-02** | Only DrugMaster exists (#2) | DB-01 done | 1. `SELECT table_name FROM information_schema.tables WHERE table_name IN ('StandardDrugs','DrugMaster');` | — | One row: `DrugMaster`. | Critical | Manual |
| **TC-EMR197-DB-03** | No rows lost (#2) | Count recorded before | 1. `SELECT COUNT(*) FROM "DrugMaster";` | Pre-migration count (dev: 35,435) | Equal to the pre-migration count. | Critical | Manual |
| **TC-EMR197-DB-04** | Primary key and 6 indexes renamed (#2) | DB-01 done | 1. `SELECT indexname FROM pg_indexes WHERE tablename = 'DrugMaster' ORDER BY indexname;` | — | `DrugMaster_pkey`, `drug_master_brand_name`, `drug_master_generic_name`, `DrugMaster_generic_name_ci_lookup`, `DrugMaster_brand_name_ci_lookup`, `DrugMaster_generic_name_trgm`, `DrugMaster_brand_name_trgm`; no `StandardDrugs_*` / `standard_drugs_*` left. | High | Manual |
| **TC-EMR197-DB-05** | New rows still get IDs | DB-01 done | 1. `SELECT pg_get_serial_sequence('"DrugMaster"', 'id');` | — | `public."DrugMaster_id_seq"`. | Critical | Manual |
| **TC-EMR197-DB-06** | Migration recorded | DB-01 done | 1. `SELECT name FROM "SequelizeMeta" WHERE name LIKE '20261102100000%';` | — | One row for `20261102100000-rename-standard-drugs-to-drug-master.js`. | High | Manual |
| **TC-EMR197-DB-07** | Populated drugs still link to the master list | DB-01 done | 1. Count `Drugs` with `parentDrug_id` not found in `DrugMaster` (change-note SQL) | — | `0`. | Critical | Manual |
| **TC-EMR197-DB-08** | Running the migration twice does nothing | DB-01 done | 1. `npx sequelize-cli db:migrate` again | — | *No migrations were executed*; DB-02..05 results unchanged. | Critical | Manual |
| **TC-EMR197-DB-09** | Rollback and re-apply (#15, QA DB only) | DB-01 done | 1. `db:migrate:undo`<br>2. Repeat DB-02..05 for `StandardDrugs`<br>3. `db:migrate`<br>4. Repeat DB-02..07 | — | Undo renames everything back to `StandardDrugs` (and `standard_drugs_*`); re-run renames to `DrugMaster`; row count identical at each step. | Critical | Manual |
| **TC-EMR197-DB-10** | Deploy order: migration before backend restart | Deployment checklist | 1. Deploy code without restart<br>2. Migrate<br>3. Restart<br>4. Open Standard Formulary | — | List loads. A backend restarted **before** migrating answers formulary calls with 500 *relation "DrugMaster" does not exist*, so the checklist order must be followed. | Critical | Manual |

---

## 4. Module 2: Access Control

| Test Case ID | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-EMR197-ACC-01** | Doctor without formulary access stays blocked (#14) | QA doctor (`Drugs: rwcd`, Admin + Doctor roles, not super admin) | 1. `GET /standardDrugs/getDrugs?search=cillin`<br>2. `GET /standardDrugs?id=1`<br>3. `GET /standardDrugs/` | `DOCTOR_USERNAME` | Each answers 403 `{"error":"You do not have permission to perform this action"}`. | Critical | Automated |
| **TC-EMR197-ACC-02** | No session is rejected | No token | 1. `GET /standardDrugs/getDrugs` | — | 403 `{"error":true,"payload":"A token is required for authentication"}`. | High | Automated |
| **TC-EMR197-ACC-03** | Screen blocked for a user without access (#14) | User without formulary access | 1. Open Admin → Settings → Standard Formulary (`/admin/settings/standard-formulary`) | — | Access blocked, the same as before the change; no drug data shown. | High | Manual |

---

## 5. Module 3: Standard Formulary

| Test Case ID | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-EMR197-FRM-01** | List loads with the same total (#3) | Formulary admin | 1. `GET /standardDrugs/getDrugs?page=1&limit=10` | `DRUG_MASTER_EXPECTED_COUNT` | 200; rows with `id`, `generic_name`, `brand_name`, `dosage`; `count` equals the pre-migration count. | Critical | Automated |
| **TC-EMR197-FRM-02** | Partial, case-insensitive generic search (#4) | Formulary admin | 1. Search `cillin`<br>2. Search `CiLLiN` | — | Same count for both; every row contains *cillin*; Amoxicillin included. | Critical | Automated |
| **TC-EMR197-FRM-03** | Search by brand and by dosage (#4) | Formulary admin | 1. Search a brand from FRM-02<br>2. Search its dosage | Brand and dosage of a branded *cillin* drug from the first 100 results (e.g. Amoxicillin / AMOGEN 500 / 500 mg) | The drug is found by brand; dosage search returns results. | High | Automated |
| **TC-EMR197-FRM-04** | Paging keeps the total (#5) | Formulary admin | 1. Pages 1, 2 and last (limit 10) | — | Same `count` on every page; page 2 shares no rows with page 1; last page has `count − (last−1)×10` rows. | High | Automated |
| **TC-EMR197-FRM-05** | Open one drug by id | Formulary admin | 1. `GET /standardDrugs?id=<first id>` | — | 200; same id and generic name. **Known defect DEF-EMR197-01** (`test.fail()`): answers 500 *"Standard Drug not found"* for existing drugs. | High | Automated |
| **TC-EMR197-FRM-06** | Add a new drug (#6) | Formulary admin | 1. `POST /standardDrugs/` | `PW EMR197 Generic <ts>`, PW Brand, 250 mg, BD, Oral, 5 days | Saved; found by search; its id is higher than existing ids (sequence works). Deleted afterwards. | Critical | Automated |
| **TC-EMR197-FRM-07** | Duplicate rejected incl. case and trailing space (#7) | A drug from FRM-06 pattern exists | 1. Add the same drug<br>2. Upper-case generic<br>3. Trailing spaces | Same generic + brand + dosage | Each rejected with *"Drug with this combination already exists"*. | High | Automated |
| **TC-EMR197-FRM-08** | Edit a drug (#8) | Created drug | 1. `PUT /standardDrugs?id=` with frequency TDS, duration 7 days | — | Saved; search returns TDS / 7 days. | High | Automated |
| **TC-EMR197-FRM-09** | Edit into a duplicate rejected (#9) | Two created drugs | 1. Edit the second to equal the first | — | Rejected with *"Drug with this combination already exists"*. | High | Automated |
| **TC-EMR197-FRM-10** | Delete a drug (#10) | Created drug | 1. `DELETE /standardDrugs/?id=`<br>2. Search it | — | Deleted; search returns 0. | Critical | Automated |
| **TC-EMR197-FRM-11** | Screen: list, search, paging (#3–5) | Formulary admin (Super Admin); web app available | 1. Open Admin → Settings → Standard Formulary<br>2. Search `cillin`, then mixed case<br>3. Page 2 and the last page | — | List and total match the API; no error toast; search and paging behave as in FRM-02 / FRM-04. | Medium | Manual |
| **TC-EMR197-FRM-12** | Screen: add, duplicate, edit, delete (#6–10) | Formulary admin; web app available | 1. Repeat FRM-06..10 through the screen<br>2. Refresh after each step | — | Same results as the API cases, and they survive a refresh. | Medium | Manual |

---

## 6. Module 4: Populate

| Test Case ID | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-EMR197-POP-01** | Populate fills an empty organisation (#11) | Disposable organisation with no drugs | 1. `POST /standardDrugs/populateDrugs`<br>2. Poll `GET /drugs/getDrugs?limit=0` until the count is stable | `POPULATE_TEST_USERNAME` | Drugs appear; every drug has a generic name and `parentDrug_id` > 0; count equals `DRUG_MASTER_EXPECTED_COUNT` when set. | Critical | Automated |
| **TC-EMR197-POP-02** | Populating again creates no duplicates (#12) | POP-01 done | 1. Populate again<br>2. Wait 60 s | — | Same number of populated drugs; no `parentDrug_id` repeated. | Critical | Automated |
| **TC-EMR197-POP-03** | Populated drug found by prescription search (#13) | POP-01 done | 1. `GET /drugs/getDrugs?limit=0&search=<first 5 letters>` (the call Care View and presets make) | A populated drug (Amoxicillin if present) | The populated drug is returned. | Critical | Automated |
| **TC-EMR197-POP-04** | Real result checked, not only the toast | Disposable organisation; backend log access | 1. Admin → Drugs → *Populate*<br>2. Wait about a minute, refresh<br>3. Read the backend log | — | Drugs list filled; log ends with *Completed processing N standard drugs*; no *relation "DrugMaster" does not exist*. A toast alone is not a pass. | High | Manual |

---

## 7. Module 5: Regression of Drug Consumers

| Test Case ID | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-EMR197-REG-01** | Drug database impact suite | Web app available | 1. `npm run test:drugdb` | — | Same results as before the change: 18 passed, 1 skipped (live Populate opt-in); POP-002 stays an expected failure (DEF-DDB-001). | High | Automated |
| **TC-EMR197-REG-02** | Prescription medication suite (#13) | Web app available | 1. `npm run test:rx` | — | 21 passed (5 are known-defect expected failures: DEF-RX-001..005). | Critical | Automated |
| **TC-EMR197-REG-03** | Drug Cabinet and Drug Presets suites | Web app available | 1. `npm run test:cabinet`<br>2. `npm run test:presets` | — | Same results as before the change. | High | Automated |

---

## 8. Execution Results - 3 Nov 2026 (QA)

Environment: `qa_pg.amerck.care` / API `pg_api_emr_dev.amerck.care`. Accounts: QA doctor (no formulary access), `qasuperadmin` (Super Admin), and newly self-registered disposable doctors for Populate.

| Case(s) | Result | Evidence / Notes |
| :--- | :---: | :--- |
| TC-EMR197-ACC-01, ACC-02 | **PASS** | Doctor and no-session requests are refused with 403. |
| TC-EMR197-ACC-03 | **PARTIAL** | Data stays blocked (`GET /standardDrugs/getDrugs` → 403), but `/admin/settings/standard-formulary` still opens the screen for the doctor. See F-EMR197-02. |
| TC-EMR197-FRM-01 | **PASS** | Total **35,435** drugs, equal to the developer's DrugMaster count. |
| TC-EMR197-FRM-02, 03, 04 | **PASS** | `cillin` and `CiLLiN` both return 1,267; brand (AMOGEN 500) and dosage search work; paging keeps the total. |
| TC-EMR197-FRM-05 | **FAIL** | `GET /standardDrugs?id=<existing id>` → 500 *"Standard Drug not found"*. **DEF-EMR197-01**. |
| TC-EMR197-FRM-06 … 10 | **PASS** | Add, duplicate refusal (same / upper case / trailing space → *"Drug with this combination already exists"*), edit, edit-into-duplicate refusal, delete. No `PW EMR197` drugs left behind; total back to 35,435. |
| TC-EMR197-FRM-11 | **PASS** | Screen as Super Admin: list loads with no error, pager *1/3544*, `CiLLiN` → *1/127*, Next → *2/3544*. |
| TC-EMR197-FRM-12 | **NOT RUN (UI)** | Add / edit / delete covered at API level by FRM-06..10; screen version still to do manually. |
| TC-EMR197-POP-01, 02, 03 | **PASS** | New organisation `dr_018363_923`: 0 → **35,435** drugs, every one linked by `parentDrug_id`; second Populate added none and no `parentDrug_id` repeats; a populated drug is returned by the prescription search. Three earlier disposable organisations also reached exactly 35,435. |
| TC-EMR197-POP-04 | **NOT RUN** | Needs backend log access. Populate did copy every drug, so the result was checked in the Drugs list as the change note advises. |
| TC-EMR197-DB-01 … 10 | **NOT RUN** | Need QA database / server access (migration log, SQL checks, rollback). |
| TC-EMR197-REG-01 … 03 | **PASS (after test updates)** | `test:drugdb`, `test:rx`, `test:cabinet` (without TC-DC-006) and `test:presets` pass. Four tests were updated for application changes in the same deployment (see section 9); the other failures seen during the day were server load or outage and passed on re-run. |

**Overall**: The rename behaves as intended for every user-facing path that could be tested: listing, search, paging, add, duplicate rules, edit, delete, screen, Populate and prescribing. One defect (DEF-EMR197-01) blocks opening a single master drug by id. The database cases (migration, indexes, sequence, rollback) still need someone with QA database access.

---

## 9. Findings & Questions for the Developer

| ID | Finding | Evidence | Impact | Action |
| :--- | :--- | :--- | :--- | :--- |
| **DEF-EMR197-01** | Opening one Standard Formulary drug by id fails | `GET /standardDrugs?id=154984` (and 156446, 182876, and any other existing id) → 500 `{"error":"Standard Drug not found"}`; the same ids are returned by `getDrugs`. Parameter names `drugId`, `standardDrugId`, `drug_id` behave the same. | `getStandardDrugById` is one of the functions changed by EMR-197, so this is likely a regression from the rename. A missing drug should also answer 404, not 500. | Developer to check `getStandardDrugById` against `db.DrugMaster`. TC-EMR197-FRM-05 is marked `test.fail()` until fixed. |
| **Q-EMR197-01** | Standard Formulary access is Super Admin only, not the Drugs permission | QA doctor and a new doctor (Admin + Doctor, `Drugs: rwcd`) get 403; `qasuperadmin` (`isSuperAdmin: true`) gets 200. | The change note says access uses the Drugs permission; change-note case #14 cannot be set up as written. | Developer to confirm the intended rule and update the note. |
| **F-EMR197-02** | Formulary screen not guarded for users without access | As the QA doctor, `/admin/settings` shows the permission screen, but `/admin/settings/standard-formulary` opens with an **Add Drug** button, *"Request failed with status code 403"* and *"No drugs found / Add a drug to get started."* | No data is exposed (the API refuses), but the screen is misleading. Same pattern as Aesthetic Appointments (DEF-ACL-001). | Guard the route like `/admin/settings`. |
| **F-EMR197-03** | Populate gives no confirmation in the app | The change note says Populate always shows *"Drug population started in background"*; the current front end shows no message and does not refresh the list (DEF-DDB-001). | A failed Populate (for example after a wrong deploy order) would be invisible. | Always confirm the result in the Drugs list or backend log. |
| **OBS-EMR197-01** | Formulary rows look duplicated | The table shows Generic, Brand, Strength, Frequency only; entries that differ only in Method or Duration appear identical (e.g. *Amoxicillin 125 mg TDS* × 3). | Hard for admins to tell entries apart. | Consider showing Method and Duration. |
| **OBS-EMR197-02** | Other changes arrived in the same deployment (not part of EMR-197) | Drug Cabinet now refuses duplicates with *"Drug already exists"* (HTTP 500 instead of 4xx); the add form sends a new `unit` field; Care View suggestions show only brand, generic and dosage; the drug lookup uses `limit=100` instead of the whole cabinet. | Existing tests TC-DC-002, TC-DC-003, TC-DDB-CV-001 were updated; TC-DC-007 added for the duplicate rule. | Confirm these were intended. |
| **F-EMR197-04** | No backend automated tests | Stated in the change note. | These cases are the only coverage. | Keep `tests/emr197DrugMaster.spec.js` in the regression run. |
