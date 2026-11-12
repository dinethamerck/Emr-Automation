# Amerck Care EMR - Account Settings Specification & Quality Matrix

## 1. Executive Summary & Dual-Persona Quality Strategy
- **Application Under Test (AUT)**: Amerck Care EMR — Account Settings (`/admin/account`): Profile, Preferences, Security, Billing & Subscriptions and Templates sections, Edit Profile dialog and Change Password dialog.
- **System Perspectives**:
  1. **Doctor / Healthcare Clinician Perspective**: Accurate professional identity (name, speciality, qualification) for letters and prescriptions, workflow preferences (patient search scope, print headers), strong credentials protecting patient data, and visibility of subscription status.
  2. **Senior QA Automation Architect Perspective**: Resilient Page Object Model (`AccountSettingsPage.js`), direct login via `loginAsDoctor()`, **non-destructive testing against a shared account** using a network write-guard, client-side validation coverage, and sensitive-data masking checks.
- **Safety Strategy**: All suites share the QA doctor account. `blockAccountWrites()` aborts every non-GET request to `*.amerck.care` during these tests (third-party Stripe/Google telemetry is let through and not counted), so profile, preferences and password are never changed. Validation tests assert **zero** write attempts; the preference test asserts the expected `PUT /users/editProfileData` request is sent (and blocked).
- **Out of Scope (intentionally not automated)**: Successfully saving profile changes, changing the password, and changing Search Scope — these would alter the shared account used by every other suite. They need a dedicated disposable account.

---

## 2. Master Test Suite Architecture & Coverage Summary

| Suite # | Functional Area / Sub-Module | Test Scope & Clinical Purpose | Total Cases | Priority Breakdown | Execution Type |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | **Access & Section Navigation** | Menu routing, deep link, auth guard, section switching | 4 | 3 Crit, 1 High | Automated |
| **02** | **Settings Search** | Result filtering, summary text, clear, no-match | 3 | 1 High, 2 Medium | Automated |
| **03** | **Profile (read-only)** | Identity fields match logged-in account | 1 | 1 Crit | Automated |
| **04** | **Edit Profile Dialog** | Pre-population, Professional tab, validation, cancel | 4 | 2 Crit, 2 High | Automated |
| **05** | **Preferences** | Toggle catalog, search scope status, update request | 2 | 1 High, 1 Medium | Automated |
| **06** | **Security — Change Password** | Submit guard, mismatch, complexity, cancel | 4 | 3 Crit, 1 High | Automated |
| **07** | **Billing & Templates** | Plan/billing details, card masking, placeholder section | 2 | 1 Crit, 1 Medium | Automated |
| **TOTAL** | **Account Settings Suite** | **Doctor identity, preferences and security** | **20** | **10 Crit, 6 High, 4 Medium** | **20 Automated** |

---

## 3. Module 1: Access & Section Navigation

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-ACC-NAV-001** | Account Management opens Account Settings on Profile | Doctor authenticated | 1. Avatar → `Account Management` | N/A | URL `/admin/account`; heading *"Account Settings"*; Profile section shown; five section buttons listed. | Critical | Automated |
| **TC-ACC-NAV-002** | Direct URL navigation preserves session | Doctor authenticated | 1. Navigate directly to `/admin/account` | N/A | Account Settings renders without login redirect. | High | Automated |
| **TC-ACC-NAV-003** | Unauthenticated access is redirected | Fresh context, no session | 1. Navigate to `/admin/account` | N/A | Redirect to `/login`; settings never rendered. | Critical | Automated |
| **TC-ACC-NAV-004** | Each section button switches the visible section | On `/admin/account` | 1. Click Profile, Preferences, Security, Billing & Subscriptions, Templates | 5 sections | Section heading updates to the selected section each time. | Critical | Automated |

---

## 4. Module 2: Settings Search

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-ACC-SRCH-001** | Searching "password" surfaces Security | On `/admin/account` | 1. Type `password`<br>2. Click Security | Query: `password` | *"Found 1 setting across 1 section"*; only Security listed; clicking opens Security with `Change Password`. | High | Automated |
| **TC-ACC-SRCH-002** | Clearing search restores all sections | Search filtered by `billing` | 1. Clear search input | Query: `billing` → `""` | All five section buttons visible again. | Medium | Automated |
| **TC-ACC-SRCH-003** | Non-matching search hides every section | On `/admin/account` | 1. Type `zzqx_no_setting` | N/A | No section buttons shown; page stays stable. | Medium | Automated |

---

## 5. Module 3: Profile Section (read-only)

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-ACC-PRF-001** | Profile shows the logged-in doctor's identity | On Profile section | 1. Inspect profile card and fields | `DOCTOR_USERNAME` | `@<username>` and Username field match the logged-in account; Full Name, Email (contains `@`), Speciality, Qualification, Organization rendered. | Critical | Automated |

---

## 6. Module 4: Edit Profile Dialog

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-ACC-EDT-001** | Edit Profile opens pre-populated | On Profile section | 1. Click `Edit Profile` | N/A | First Name non-empty; Email equals the email shown on the Profile card. | High | Automated |
| **TC-ACC-EDT-002** | Professional tab fields and speciality list | Edit Profile open | 1. Click `Professional` | Specialities incl. `General Physician`, `Cardiologist`, `Psychiatrist`, `Other` | Full Name, Display Name, Qualification (non-empty) and Speciality select with the listed options. | High | Automated |
| **TC-ACC-EDT-003** | Empty First Name and invalid Email rejected | Edit Profile open | 1. Clear First Name<br>2. Email `not-an-email`<br>3. Click `Save Changes` | First Name `""`; Email `not-an-email` | *"Required"* and *"Invalid email"* shown; dialog stays open; zero write requests. | Critical | Automated |
| **TC-ACC-EDT-004** | Cancel discards unsaved changes | Edit Profile open | 1. Change Last Name<br>2. Click `Cancel`<br>3. Reopen dialog | Last Name: `ShouldNotPersist` | Dialog closes; on reopen the original Last Name is shown; zero write requests. | Critical | Automated |

---

## 7. Module 5: Preferences

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-ACC-PRF-002** | Preferences lists search scope and interface toggles | On `/admin/account` | 1. Open Preferences | N/A | `Search Scope`, `Wave Animation`, `Print Headers & Footers`, `Tapering Prescriptions` with 4 switches; *"Currently: Local/Global"* shown. | Medium | Automated |
| **TC-ACC-PRF-003** | Toggling a preference sends a profile update | On Preferences | 1. Click Wave Animation switch | N/A | `PUT /users/editProfileData` is dispatched (intercepted and blocked — account unchanged). | High | Automated |

---

## 8. Module 6: Security — Change Password Dialog

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-ACC-SEC-001** | Dialog fields masked and submit disabled when empty | On Security | 1. Click `Change Password` | N/A | Current/New/Confirm inputs are `type=password`; `Change Password` submit disabled. | Critical | Automated |
| **TC-ACC-SEC-002** | Mismatched confirmation rejected | Dialog open | 1. Fill mismatched new/confirm<br>2. Submit | New `NewPass@12345`, Confirm `Different@12345` | *"Passwords do not match"*; zero write requests. | Critical | Automated |
| **TC-ACC-SEC-003** | Weak new password rejected | Dialog open | 1. New/Confirm = `abc`<br>2. Submit | `abc` | Complexity message (*"at least 8 characters, one uppercase letter…"*); zero write requests. | Critical | Automated |
| **TC-ACC-SEC-004** | Cancel closes dialog and clears entries | Dialog open with value | 1. Click `Cancel`<br>2. Reopen | Current: `Something@123` | Dialog closes; on reopen Current Password is empty. | High | Automated |

---

## 9. Module 7: Billing & Templates

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-ACC-BIL-001** | Billing shows plan, next billing date and masked card | On `/admin/account` | 1. Open Billing & Subscriptions | N/A | Current Plan with *"Active"*; *"Next billing: <Month D, YYYY>"*; Payment Method with `•••• NNNN`; no full card number anywhere on page. | Critical | Automated |
| **TC-ACC-BIL-002** | Templates section shows placeholder | On `/admin/account` | 1. Open Templates | N/A | *"Template management features coming soon"*. | Medium | Automated |
