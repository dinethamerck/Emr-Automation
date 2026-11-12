# Amerck Care EMR - Login & Forgot Password Specification & Quality Matrix

## 1. Executive Summary & Dual-Persona Quality Strategy
- **Application Under Test (AUT)**: Amerck Care EMR — Login (`/login`) and Forgot Password (`/forgotPassword/initForgetPasswordLink`).
- **Relationship to existing suites**: `loginPathBreakTests.spec.js` covers login **security break tests** (SQL injection, XSS, enumeration, case sensitivity, oversized input, double submit). This suite covers **functional** behaviour: layout, authentication, validation, navigation, session handling and the password-reset request.
- **System Perspectives**:
  1. **Doctor / Healthcare Clinician Perspective**: Fast, reliable sign-in to patient records, clear feedback on mistakes, and self-service recovery when a password is forgotten.
  2. **Senior QA Automation Architect Perspective**: Page objects (`LoginPage.js`, `ForgotPasswordPage.js`), API contract checks on `POST /auth/login` and `POST /auth/initResetPasswordUrl`, proof that validation errors send no request, and hydration-aware form handling.
- **Safety Strategy**:
  - Forgot Password never targets the shared doctor's real email.
  - The success test uses an unregistered address on the reserved `example.com` domain, so no email is delivered.
  - Validation tests abort the reset request before it leaves the browser.
- **Automation note**: Both forms are server-rendered and become interactive only after React hydration. Text typed before hydration is wiped, so the page objects wait for hydration (`waitForHydration()`) before typing.

---

## 2. Master Test Suite Architecture & Coverage Summary

| Suite # | Functional Area / Sub-Module | Test Scope & Clinical Purpose | Total Cases | Priority Breakdown | Execution Type |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | **Login Page Layout** | Fields, masking, entry links, quote, visibility toggle | 2 | 1 High, 1 Medium | Automated |
| **02** | **Authentication** | Valid sign-in, Enter key, wrong password, API status | 4 | 2 Crit, 1 High, 1 Medium | Automated |
| **03** | **Login Validation** | Required fields with no API call | 2 | 1 High, 1 Medium | Automated |
| **04** | **Login Navigation & Session** | Sign Up / Forgot links, signed-in redirect, deep link | 4 | 2 High, 2 Medium | Automated |
| **05** | **Forgot Password** | Layout, Back link, validation, reset request and confirmation | 6 | 1 Crit, 2 High, 3 Medium | Automated |
| **TOTAL** | **Login & Forgot Password Suite** | **Access to the EMR and account recovery** | **18** | **3 Crit, 7 High, 8 Medium** | **18 Automated** |

---

## 3. Module 1: Login Page Layout

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-LGN-UI-001** | Login page shows fields, entry links and a quote | Logged out | 1. Open `/login` | N/A | *Username* and *Password* labels; username input `name=user_name`; password `type=password`; `Sign In`; *"Don't have an account? Sign Up"*; *"Forgot password?"*; a medical quote with *"— Author"*. | High | Automated |
| **TC-LGN-UI-002** | Eye toggle reveals and re-masks the password | On `/login` | 1. Type password<br>2. Click eye toggle<br>3. Click again | `Secret@123` | Input switches `password` → `text` (value intact) → `password`. | Medium | Automated |

---

## 4. Module 2: Authentication

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-LGN-AUTH-001** | Valid credentials sign in and open Care View | Logged out | 1. Enter valid credentials<br>2. Click `Sign In` | `DOCTOR_USERNAME` / `DOCTOR_PASSWORD` | Redirect to `/admin/prescription`; patient search visible; `token` stored in localStorage. | Critical | Automated |
| **TC-LGN-AUTH-002** | Enter key submits the login | Logged out | 1. Enter credentials<br>2. Press `Enter` in Password | Valid credentials | Redirect to `/admin/prescription`. | Medium | Automated |
| **TC-LGN-AUTH-003** | Wrong password shows an error | Logged out | 1. Enter valid username, wrong password<br>2. `Sign In` | `WrongPassword@999` | *"Invalid User/Password"*; URL stays `/login`; no `token` stored. | Critical | Automated |
| **TC-LGN-AUTH-004** | Invalid credentials return a client error | Logged out | 1. Submit wrong credentials<br>2. Inspect `POST /auth/login` response | `WrongPassword@999` | HTTP 4xx (e.g. 401). **Known defect DEF-LGN-001** (`test.fail()`). | High | Automated |

---

## 5. Module 3: Login Validation

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-LGN-VAL-001** | Empty submit shows Required on both fields | On `/login` | 1. Click `Sign In` with empty fields | N/A | Two *"Required"* messages; no `POST /auth/login`; stays on `/login`. | High | Automated |
| **TC-LGN-VAL-002** | Username without password | On `/login` | 1. Fill username only<br>2. `Sign In` | Valid username | One *"Required"* (password); no `POST /auth/login`. | Medium | Automated |

---

## 6. Module 4: Login Navigation & Session

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-LGN-NAV-001** | Sign Up link opens registration | On `/login` | 1. Click *"Don't have an account? Sign Up"* | N/A | URL `/signup`. | Medium | Automated |
| **TC-LGN-NAV-002** | Forgot password link opens reset form | On `/login` | 1. Click *"Forgot password?"* | N/A | URL `/forgotPassword/initForgetPasswordLink`; heading *"Forgot Password"*. | Medium | Automated |
| **TC-LGN-SES-001** | Signed-in doctor opening `/login` is redirected | Signed in | 1. Navigate to `/login` | N/A | Redirect to `/admin/prescription`; login form not shown. | High | Automated |
| **TC-LGN-SES-002** | Logged-out deep link goes to login, then Care View | Logged out | 1. Open `/admin/patients`<br>2. Sign in | Valid credentials | Redirect to `/login`; after sign-in lands on `/admin/prescription`. The requested page is **not** remembered (see observation OBS-LGN-001). | High | Automated |

---

## 7. Module 5: Forgot Password

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-FPW-UI-001** | Page shows email field and actions | Logged out | 1. Open Forgot Password | N/A | Heading *"Forgot Password"*; *Email* label; empty input; `Reset Password` enabled; *"Back to login"*. | Medium | Automated |
| **TC-FPW-NAV-001** | Back to login returns to login | On Forgot Password | 1. Click *"Back to login"* | N/A | URL `/login`; `Sign In` visible. | Medium | Automated |
| **TC-FPW-VAL-001** | Empty email shows Required | Reset requests blocked | 1. Click `Reset Password` | N/A | *"Required"*; no reset request attempted. | High | Automated |
| **TC-FPW-VAL-002** | Whitespace-only email is rejected | On Forgot Password | 1. Enter spaces<br>2. `Reset Password` | `"   "` | API trims to empty and answers 400; *"Email is required"* shown; stays on the page. | Medium | Automated |
| **TC-FPW-VAL-003** | Malformed email is rejected before sending | Reset requests blocked | 1. Enter malformed email<br>2. `Reset Password` | `not-an-email` | No reset request attempted. **Known defect DEF-FPW-001** (`test.fail()`). | High | Automated |
| **TC-FPW-SUB-001** | Unregistered email gets the generic confirmation | On Forgot Password | 1. Enter unregistered email<br>2. `Reset Password` | `pw_unregistered_reset@example.com` | `POST /auth/initResetPasswordUrl` with `{"email": …}` → 200 *"Reset Password Email sent successfully."* (does not reveal the account doesn't exist); redirect to `/login` with the same toast. | Critical | Automated |

---

## 8. Known Defects & Observations Found During Automation

| Defect ID | Linked Test | Summary | Steps to Reproduce | Expected | Actual | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **DEF-LGN-001** | TC-LGN-AUTH-004 | Wrong credentials return HTTP 500 | 1. `/login`<br>2. Valid username, wrong password<br>3. `Sign In` | 401 Unauthorized (or another 4xx) | `500 {"error":"Invalid User/Password"}`. Monitoring will count every typo as a server error, and real server failures become harder to spot. | Medium |
| **DEF-FPW-001** | TC-FPW-VAL-003 | Malformed email accepted by Forgot Password | 1. Forgot Password<br>2. Email `not-an-email`<br>3. `Reset Password` | Client-side *"Invalid email"*; no request | Request sent; API answers 200 *"Reset Password Email sent successfully."* and the user is told an email was sent. | Medium |
| **OBS-LGN-001** | TC-LGN-SES-002 | Requested page not remembered after login | 1. Logged out, open `/admin/patients`<br>2. Sign in | Return to `/admin/patients` | Lands on `/admin/prescription` | Low (enhancement) |
| **OBS-LGN-002** | — (observed) | Session token kept in `localStorage` | Sign in, inspect storage | Token in an `HttpOnly` cookie | `localStorage.token` holds the JWT, readable by any script on the page if an XSS flaw exists | Low (security hardening) |

> TC-LGN-AUTH-004 and TC-FPW-VAL-003 are marked `test.fail()` with a `defect` annotation so the suite stays green while the defects are open. When the application is fixed, these tests will report "expected to fail but passed"; remove the `test.fail()` line at that point.
