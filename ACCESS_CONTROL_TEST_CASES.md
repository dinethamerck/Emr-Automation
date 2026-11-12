# Amerck Care EMR - Access Control & Error Pages Specification & Quality Matrix

## 1. Executive Summary & Dual-Persona Quality Strategy
- **Application Under Test (AUT)**: Amerck Care EMR — module pages that exist in the application but are **not linked** for the QA doctor account, plus the 404 "page could not be found" screen.
- **How these pages were found**: the app is built with the Next.js App Router, which publishes no page list. The routes were collected by scanning the app's JavaScript bundles for route paths. Every route found was opened as the QA doctor:
  - **16 module pages** are not available to this account: OPD, Admissions, Admission Investigations, Treatment Room, Pharmacy, Schedule, Telemedicine, Telemedicine Reports, Aesthetic Appointments / Clients / Schedule / Finances / Settings, and Optical Consultations / Inventory / Lab.
  - 15 of them show *"You don't have permission to access this page"*; Aesthetic Appointments does not (DEF-ACL-001).
  - `/invoices`, `/patient-consent-forms` and `/onboarding/update` are API paths, not pages, and return 404 in the browser.
- **Account permissions under test**: The doctor's login token grants `rwcd` on Patients, Drugs, Investigations, Prescriptions, Letters, Labs, Reports and Diagnosis. OPD and Hospitals are `----`, and no Aesthetic, Optical, Pharmacy or Telemedicine permission is present.
- **System Perspectives**:
  1. **Doctor / Healthcare Clinician Perspective**: A practice sees only the modules it is licensed and authorised for; patient and staff data from other modules must not be exposed.
  2. **Senior QA Automation Architect Perspective**: UI guard on every restricted route, **server-side** authorisation of the data behind it, auth redirect for logged-out users, and genuine HTTP 404 responses for unknown URLs.
- **Safety**: The suite only opens pages and reads responses; nothing is created or changed.
- **Related suites added after re-checking**:
  - The **reset-password page** (`/forgotPassword/resetPassword`) was found by route probing. It is covered in `RESET_PASSWORD_TEST_CASES.md` (mocked token where a real emailed one is needed).
  - The **Queue View "now calling" state** is covered in `QUEUE_VIEW_TEST_CASES.md` with a fake socket.io server, because the QA realtime server is unreachable.
- **Still not covered**: the functional behaviour of the restricted modules.
  - Self-service cannot enable them. Sign-up plans are billing periods only (Monthly, 3 / 6 Months, 1 Year), and Step 1 options set only the user type.
  - Module access comes from token permissions, so an administrator-provisioned account licensed for those modules is required.

---

## 2. Master Test Suite Architecture & Coverage Summary

| Suite # | Functional Area / Sub-Module | Test Scope & Clinical Purpose | Total Cases | Priority Breakdown | Execution Type |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | **Restricted Module Pages** | Permission screen on 16 unlicensed module routes; logged-out redirect | 7 | 1 Crit, 6 High | Automated |
| **02** | **API Authorisation** | Restricted module data refused by the server | 1 | 1 Crit | Automated |
| **03** | **Page Not Found** | Real 404 for unknown URLs, signed in and out | 3 | 3 Medium | Automated |
| **TOTAL** | **Access Control & Error Pages Suite** | **Licensing, authorisation and error handling** | **11** | **2 Crit, 6 High, 3 Medium** | **11 Automated** |

---

## 3. Module 1: Restricted Module Pages

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-ACL-RST-001** | OPD & Admissions pages refuse access | Doctor authenticated (no OPD permission) | 1. Open each route directly | `/admin/opd`, `/admin/admissions`, `/admin/admission-investigations`, `/admin/treatment-room` | *"You don't have permission to access this page"* on each; URL unchanged. | High | Automated |
| **TC-ACL-RST-002** | Pharmacy & Schedule pages refuse access | Doctor authenticated | 1. Open each route directly | `/admin/pharmacy`, `/admin/schedule` | Permission screen on each. | High | Automated |
| **TC-ACL-RST-003** | Telemedicine pages refuse access | Doctor authenticated | 1. Open each route directly | `/admin/telemedicine`, `/admin/telemedicine-reports` | Permission screen on each. | High | Automated |
| **TC-ACL-RST-004** | Aesthetic pages refuse access | Doctor authenticated (no Aesthetic permission) | 1. Open each route directly | `/admin/aesthetic-clients`, `-schedule`, `-finances`, `-settings` | Permission screen on each. | High | Automated |
| **TC-ACL-RST-005** | Optical pages refuse access | Doctor authenticated | 1. Open each route directly | `/admin/optical-consultations`, `-inventory`, `-lab` | Permission screen on each. | High | Automated |
| **TC-ACL-RST-006** | Aesthetic Appointments refuses access like the other Aesthetic pages | Doctor authenticated (no Aesthetic permission) | 1. Open `/admin/aesthetic-appointments` | N/A | Permission screen; appointments list not shown. **Known defect DEF-ACL-001** (`test.fail()`). | High | Automated |
| **TC-ACL-AUTH-001** | Logged-out access to a restricted module redirects to login | Fresh context, no session | 1. Open `/admin/opd` | N/A | Redirect to `/login`; permission screen not shown. | Critical | Automated |

---

## 4. Module 2: API Authorisation

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-ACL-API-001** | Restricted module data is refused by the API | Doctor authenticated (no Aesthetic permission) | 1. Open blocked `/admin/aesthetic-schedule`<br>2. Record `GET /aesthetic/*` responses | N/A | Permission screen shown **and** every `/aesthetic/*` request answered 401/403. **Known defect DEF-ACL-002** (`test.fail()`). | Critical | Automated |

---

## 5. Module 3: Page Not Found

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-ACL-404-001** | Unknown URL returns a real 404 | Logged out | 1. Open `/pw-unknown-page` | N/A | HTTP 404; headings *"404"* and *"This page could not be found."* | Medium | Automated |
| **TC-ACL-404-002** | Unknown admin URL returns 404 when signed in | Doctor authenticated | 1. Open `/admin/pw-unknown-module` | N/A | HTTP 404 and not-found message; no permission screen. | Medium | Automated |
| **TC-ACL-404-003** | Unknown sub-page of an existing module returns 404 | Doctor authenticated | 1. Open `/admin/drugs/pw-unknown` | N/A | HTTP 404 and not-found message. | Medium | Automated |

---

## 6. Known Defects & Observations Found During Automation

| Defect ID | Linked Test | Summary | Steps to Reproduce | Expected | Actual | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **DEF-ACL-001** | TC-ACL-RST-006 | Aesthetic Appointments page has no permission guard | 1. Sign in as a doctor without Aesthetic permission<br>2. Open `/admin/aesthetic-appointments` | Permission screen, as on the other four Aesthetic pages | Full *"All Appointments"* screen (filters, status counts, table); `GET /aesthetic/all-appointments` → 200 | High |
| **DEF-ACL-002** | TC-ACL-API-001 | Aesthetic API endpoints do not check permissions | 1. Same account<br>2. Open blocked `/admin/aesthetic-schedule`<br>3. Watch network | 401/403 from `/aesthetic/*`; the page never requests data it may not show | The blocked page still loads `/aesthetic/appointments`, `/aesthetic/doctors` (names and emails), `/aesthetic/org-settings`, `/aesthetic/appointment-types`, `/aesthetic/off-days` and `/aesthetic/doctor-order-preferences`, all 200. Access is enforced only by hiding the UI, so anyone with a token can read the data directly. Data observed was the account's own organisation; cross-organisation access was not tested. | High |
| **OBS-ACL-001** | TC-ACL-404-001..003 | 404 page offers no way back | Open any unknown URL | Link back to the Dashboard or login | Default *"404 / This page could not be found."* with no navigation | Low (UX) |
| **OBS-ACL-002** | TC-ACL-RST-001..005 | Restricted pages answer HTTP 200 | Open any restricted module route | 403 status (helps monitoring and crawlers) | HTTP 200 with the permission message rendered in the page | Low |

> TC-ACL-RST-006 and TC-ACL-API-001 are marked `test.fail()` with a `defect` annotation so the suite stays green while the defects are open. When the application is fixed, these tests will report "expected to fail but passed"; remove the `test.fail()` line at that point. **DEF-ACL-002 is a security issue and should be raised with the backend team before release.**
