# Amerck Care EMR - Reset Password Specification & Quality Matrix

## 1. Executive Summary & Dual-Persona Quality Strategy
- **Application Under Test (AUT)**: Amerck Care EMR — Reset Password (`/forgotPassword/resetPassword?token=…`), the page opened from the link in the "Forgot password" email. It is not linked anywhere in the app. The route was found by probing the `/forgotPassword/` area: it returned 200 while every other candidate returned 404.
- **How the page works** (from its JavaScript bundle and observed traffic):
  1. It reads `token` from the URL and calls `GET /auth/checkResetPasswordToken/:token`.
  2. If the check fails, it shows *"Invalid or expired token."*.
  3. If the check succeeds, it shows a Password / Confirm Password form with the password policy.
  4. Submitting calls `POST /auth/resetPassword/:token` with `{ token, password }`, shows *"Password reset successfully."* and redirects to `/login`.
- **System Perspectives**:
  1. **Doctor / Healthcare Clinician Perspective**: A locked-out clinician can set a new, strong password from the email link, and is told clearly when a link is broken or expired.
  2. **Senior QA Automation Architect Perspective**: Real-API token rejection, client-side password policy, request contract, server-error handling. Real tokens arrive only by email, so the two endpoints are **mocked** where a valid token is needed.
- **Safety**: No real password is ever changed.
  - Invalid-token tests send made-up tokens that the server rejects.
  - Form tests mock both endpoints.
  - TC-RPW-SUB-003 sends a made-up token to the real reset endpoint to prove the server rejects it.
- **Still out of scope**: the end-to-end path with a real emailed token. It needs a mailbox the tests can read (e.g. a dedicated test inbox with an API).

---

## 2. Master Test Suite Architecture & Coverage Summary

| Suite # | Functional Area / Sub-Module | Test Scope & Clinical Purpose | Total Cases | Priority Breakdown | Execution Type |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | **Reset Link Handling** | Invalid token (real API), missing token | 2 | 1 Crit, 1 Medium | Automated |
| **02** | **Reset Form** | Layout, masking, policy hints | 1 | 1 High | Automated |
| **03** | **Password Policy Validation** | Required, length, complexity, match | 4 | 1 Crit, 3 High | Automated |
| **04** | **Submission** | Contract + success, server error, real token enforcement | 3 | 2 Crit, 1 Medium | Automated |
| **TOTAL** | **Reset Password Suite** | **Self-service account recovery** | **10** | **4 Crit, 4 High, 2 Medium** | **10 Automated** |

---

## 3. Module 1: Reset Link Handling

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-RPW-TOK-001** | Invalid or expired token is rejected | Logged out | 1. Open `/forgotPassword/resetPassword?token=pw_invalid_token` | Made-up token | Real API `GET /auth/checkResetPasswordToken/…` → 400 `{"error":"Invalid or expired token"}`; heading *"Reset Password"* and *"Invalid or expired token."*; no password fields or Submit. | Critical | Automated |
| **TC-RPW-TOK-002** | Link without a token explains the problem | Logged out | 1. Open `/forgotPassword/resetPassword` | No token | An explanation is shown, or the user is sent to Forgot Password. **Known defect DEF-RPW-001** (`test.fail()`). | Medium | Automated |

---

## 4. Module 2: Reset Form

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-RPW-UI-001** | Valid token shows the form with policy hints | Token check mocked as valid | 1. Open the link with a token | `pw_mock_reset_token` | The token from the URL is checked; *Password* and *Confirm Password* fields are masked; hints *At least 8 characters*, *One uppercase letter*, *One lowercase letter*, *One number*, *One special character (@$!%*?&)*; `Submit` enabled. | High | Automated |

---

## 5. Module 3: Password Policy Validation

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-RPW-VAL-001** | Both fields are required | Form shown; submit mocked | 1. Click `Submit` | Empty | *"Password is required"* and *"Confirm Password is required"*; nothing submitted. | High | Automated |
| **TC-RPW-VAL-002** | Minimum length 8 | Form shown; submit mocked | 1. Submit a 7-character password | `Ab@1xyz` | *"Password must be at least 8 characters"*; nothing submitted. | High | Automated |
| **TC-RPW-VAL-003** | Uppercase, lowercase, number and special character required | Form shown; submit mocked | 1. Submit each weak password | `abcdefgh`, `Abcdefgh`, `Abcdefg1`, `abcdef1@` | *"Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"* for each; nothing submitted. | Critical | Automated |
| **TC-RPW-VAL-004** | Confirmation must match | Form shown; submit mocked | 1. Submit different passwords | `NewPass@123` / `Different@123` | *"Passwords must match"*; no complexity error; nothing submitted. | High | Automated |

---

## 6. Module 4: Submission

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-RPW-SUB-001** | Valid password is submitted; user returns to login | Form shown; submit mocked 200 | 1. Submit a compliant password | `NewPass@123` | Exactly one `POST /auth/resetPassword/<token>` with body `{"token":"<token>","password":"NewPass@123"}`; redirect to `/login`; toast *"Password reset successfully."* | Critical | Automated |
| **TC-RPW-SUB-002** | Server error is shown; form stays | Form shown; submit mocked 400 | 1. Submit a compliant password | Server error `PW mock: reset link already used` | The server's error text is shown; URL stays on the reset page; `Submit` still available. | Medium | Automated |
| **TC-RPW-SUB-003** | Real API refuses an unknown token | Token check mocked; submit to **real** API | 1. Submit a compliant password | Made-up token | Real `POST /auth/resetPassword/…` → 400 `{"error":"Invalid or expired token"}`; no redirect; no success toast. | Critical | Automated |

---

## 7. Known Defects & Observations Found During Automation

| Defect ID | Linked Test | Summary | Steps to Reproduce | Expected | Actual | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **DEF-RPW-001** | TC-RPW-TOK-002 | Reset page is blank without a token | Open `/forgotPassword/resetPassword` (e.g. a truncated email link) | *"Invalid or expired token."* or redirect to Forgot Password | Blank page. The loading state starts `true` and is only cleared after a token check, which never runs without a token. | Medium |
| **OBS-RPW-001** | TC-RPW-TOK-001 | Invalid-link screen offers no way forward | Open the link with an expired token | Link to *Forgot Password* (request a new link) or *Back to login* | Only the message is shown; no links or buttons | Low (UX) |
| **OBS-RPW-002** | TC-RPW-UI-001 | No show/hide toggle on the reset form | Open a valid link | Eye toggle, as on the login page | Fields are always masked | Low (UX) |

> TC-RPW-TOK-002 is marked `test.fail()` with a `defect` annotation so the suite stays green while the defect is open. When the application is fixed, it will report "expected to fail but passed"; remove the `test.fail()` line at that point.
