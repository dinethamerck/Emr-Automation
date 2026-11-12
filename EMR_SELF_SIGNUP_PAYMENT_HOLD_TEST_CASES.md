# Doctor Self Registration - Pay, Submit and Charge (Licence Verification & Payment Hold) Test Cases

## 1. Summary
- **Module / Feature**: Doctor Self Registration → Doctor Sign-Up (Pay, Submit and Charge). Related: EMR-230 (emails and PagerDuty alerts on self-registration).
- **Navigation path**: Home → *Dashboard Login* → *Sign Up* (Self Registration modal, `/signup`).
- **What changed**
  1. Step 1 shows the licence verification notice.
  2. Step 2 shows *"Your subscription period starts on the day your account is approved."* at the end of the package list.
  3. Step 3 (*Payment & Verification*) explains the hold in three steps. It shows the selected package amount, and the card is only **authorised** (Stripe SetupIntent `seti_…`), not charged. The button is now *Submit for Review*.
  4. The final step is renamed **Complete → Review**.
  5. The Review screen (*Application Submitted*) shows the timeline, reference, plan and payment status, and closes with *Done*.
  6. A self-registered doctor is `PENDING_REVIEW` and **cannot log in** until a super admin approves the licence.
- **Environments**
  - QA `qa_pg.amerck.care` (API `pg_api_emr_dev.amerck.care`): change deployed — **all automated runs below are on QA**.
  - STG `stg.amerck.care`: **not deployed yet** on 11 Nov 2026. It still shows "Complete", "Payment & Activation" and "Pay $19.00 & Complete Setup". The backend there already returns `isSetupIntent: true`.
- **Automation**
  - New spec: `tests/selfRegistrationPaymentHold.spec.js`.
  - Updated: `pages/SelfRegistrationPage.js`, `utils/testData.js`, `utils/auth.js`, `utils/globalSetup.js`, and the five `selfRegistration*.spec.js` files plus `doctorOnboarding.spec.js`.
- **Run**
  ```
  set BASE_URL=https://qa_pg.amerck.care && set SKIP_DOCTOR_SETUP=true && npx playwright test tests/selfRegistration
  ```
  (PowerShell: `$env:BASE_URL='https://qa_pg.amerck.care'; $env:SKIP_DOCTOR_SETUP='true'; npx playwright test tests/selfRegistration`)

---

## 2. Coverage Summary

| Suite # | Area | Spec | Cases | Type |
| :---: | :--- | :--- | :---: | :--- |
| 01 | Step 1 – Licence verification notice | `selfRegistrationPaymentHold`, `selfRegistrationStep1` | 4 | Automated |
| 02 | Step 2 – Subscription period notice | `selfRegistrationPaymentHold`, `selfRegistrationMultiStep` | 2 | Automated |
| 03 | Step 3 – How the hold works / dynamic amount / no charge | `selfRegistrationPaymentHold`, `selfRegistrationMultiStep` | 10 | Automated |
| 04 | Final step renamed to Review | `selfRegistrationPaymentHold`, `selfRegistrationStep1` | 2 | Automated |
| 05 | Review interface, Done, pending login | `selfRegistrationPaymentHold`, `selfRegistrationEndToEnd` | 5 | Automated |
| 06 | Responsive (375 px, 768 px) | `selfRegistrationPaymentHold` | 2 | Automated |
| 07 | Break & adversarial (cards, double submit, API replay / tamper, duplicates, reload, close) | `selfRegistrationPaymentHold`, `selfRegistrationBreakTests` | 15 | Automated |
| 08 | Approval → charge, rejection → no charge, emails (EMR-230), onboarding after approval | — | 8 | Manual |
| 09 | Regression of the existing sign-up (validation, navigation, coupons, security) | 5 existing specs (updated) | 57 | Automated |

---

## 3. Module 1: Step 1 – Licence Verification Notice

| Test Case ID | Scenario | Preconditions | Steps | Expected Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-SR-HOLD-001** | Notice shows the exact ticket wording | Logged out | 1. Open `/signup` | *Step 1 of 4*. Notice reads: **"Accounts are verified before activation."** *"Amerck Care checks your medical licence number before your account goes live. Your card is only charged once you are approved."* | High | Automated |
| **TC-SR-UI-010** | Notice is above the form | Step 1 open | 1. Compare notice and First Name positions | Notice is fully above the First Name field (seen before the doctor starts typing). | Medium | Automated |
| **TC-SR-UI-011** | Ticket navigation path | Logged out on home page | 1. Click *Dashboard Login*<br>2. Click *Sign Up* | Self Registration opens on Step 1 with the notice. | High | Automated |
| **TC-SR-HOLD-002** | Notice stays when validation errors show | Step 1 open | 1. Click *Next* with empty form | Required-field errors appear; notice remains visible. | Low | Automated |

## 4. Module 2: Step 2 – Subscription Period Notice

| Test Case ID | Scenario | Preconditions | Steps | Expected Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-SR-STEP-009** | Notice at the end of the package form | Valid Step 1 | 1. Click *Next* | *"Your subscription period starts on the day your account is approved."* shown below the last package (*1 Year Plan*) and in line with / above *Proceed to Payment*. | High | Automated |
| **TC-SR-HOLD-003** | Notice stays when the package changes | Step 2 | 1. Check notice with the default package (*Monthly Plan* preselected)<br>2. Choose *1 Year Plan* | Notice visible in both states; *Proceed to Payment* enabled. | Medium | Automated |

## 5. Module 3: Step 3 – Payment Hold Explanation

| Test Case ID | Scenario | Preconditions | Steps | Expected Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-SR-HOLD-004** | Section title | Step 3, Monthly Plan | 1. Read the hold section title | Title is **"How the hold works"** (ticket). | Medium | Automated |
| **TC-SR-HOLD-005** | Three steps and order | Step 3, Monthly Plan | 1. Read the section | **1 · Submit today** – *"Your card details are handled securely by Stripe. Nothing is charged today."*<br>**2 · We verify** – *"Our team checks your licence, usually within 2 working days."*<br>**3 · Charge or remove** – *"If you are approved, $19.00 is charged and your plan starts. If not, you are not charged."*<br>Shown left → right in order 1, 2, 3 (desktop). | High | Automated |
| **TC-SR-HOLD-006-monthly** | Dynamic amount – Monthly | Step 2 | 1. Choose *Monthly Plan* → Proceed | Summary, *Charged on approval*, step 3 text and footer all show **$19.00**; *Charged today* **$0.00**; `create-payment-intent` `packageId 1`, `amount 19`. | Critical | Automated |
| **TC-SR-HOLD-006-quarterly** | Dynamic amount – 3 Months | Step 2 | 1. Choose *3 Months Plan* → Proceed | As above with **$50.00**, `packageId 2`. | Critical | Automated |
| **TC-SR-HOLD-006-halfYearly** | Dynamic amount – 6 Months | Step 2 | 1. Choose *6 Months Plan* → Proceed | As above with **$100.00**, `packageId 3`. | Critical | Automated |
| **TC-SR-HOLD-006-yearly** | Dynamic amount – 1 Year | Step 2 | 1. Choose *1 Year Plan* → Proceed | As above with **$200.00**, `packageId 4`. | Critical | Automated |
| **TC-SR-HOLD-007** | Change Plan updates the amount | Step 3, Monthly | 1. *Change Plan*<br>2. Choose *1 Year Plan* → Proceed | All amounts change to **$200.00**; no **$19.00** left in the hold text. | High | Automated |
| **TC-SR-HOLD-008** | Nothing charged at Payment | Step 3, 3 Months | 1. Inspect `POST /payments/create-payment-intent` | `isSetupIntent: true`, id starts `seti_` (card authorisation only); *Charged today* $0.00; button *Submit for Review*. | Critical | Automated |
| **TC-SR-STEP-004** | Order summary replaces the old pay button | Step 3, Monthly | 1. Inspect summary | *Charged on approval $19.00*, *Charged today $0.00*, SSL / Stripe badges, *Submit for Review*; no *Pay $…* button and no *Total Due Today*. | High | Automated |
| **TC-SR-HOLD-011** | Submission is PENDING_REVIEW and not charged | Step 3, valid card | 1. *Submit for Review*<br>2. Inspect `POST /payments/confirm-payment` | 200; `paymentIntentId` is `seti_…`; `status: PENDING_REVIEW`; message *"…charged once your account is approved."*; amount 19; no charge / capture endpoint called. | Critical | Automated |

## 6. Module 4: Final Step Renamed to Review

| Test Case ID | Scenario | Preconditions | Steps | Expected Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-SR-UI-002** | Stepper labels on Step 1 | Step 1 | 1. Read stepper | *Account, Package, Payment, Review*; no *Complete*. | High | Automated |
| **TC-SR-HOLD-009** | Stepper labels on every step | New doctor | 1. Walk Steps 1 → 4 checking the stepper | *Review* on all four steps, never *Complete*; Step 4 shows *Step 4 of 4*. | High | Automated |

## 7. Module 5: Review Interface

| Test Case ID | Scenario | Preconditions | Steps | Expected Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-SR-HOLD-010** | Review screen content (reference image) | 6 Months Plan submitted | 1. Inspect Review | Heading *Application Submitted*; subtitle *"Your account is waiting for verification by Amerck Care."*; *Thank you, Dr. &lt;Last name&gt;*; *"…we will email you at &lt;email&gt; to sign in."*; timeline **DONE** Application received (date-time), **IN PROGRESS** Licence verification (*Usually within 2 working days*), **NEXT** Activation (*Card charged, login email sent*); Reference `REG-YYYY-NNNNN` equal to the API value; Plan *6 Months Plan*; Payment *Not charged · charged on approval*; *Done* button. | Critical | Automated |
| **TC-SR-E2E-001** | Full journey ending with Done | — | 1. Steps 1 → 3 with test card<br>2. *Submit for Review*<br>3. *Done* | Review shown; Done closes the modal and opens the home page `/`. | Critical | Automated |
| **TC-SR-HOLD-012** | Done returns to the public site | Review | 1. Click *Done* | Modal closes; URL `/`; *Dashboard Login* visible. | High | Automated |
| **TC-SR-HOLD-013** | Pending doctor cannot sign in | Review | 1. *Done*<br>2. Sign in with the new credentials | Stays on `/login` with *"Your account is awaiting verification by Amerck Care. We will email you once it is approved."* | Critical | Automated |
| **TC-SR-E2E-002** | Review after a coupon | Coupon configured (`COUPON_CODE`) | 1. Apply coupon<br>2. Submit | Review shown; payment *Not charged*. Skipped automatically if the coupon is not configured on the environment. | Medium | Automated |

## 8. Module 6: Responsive Layout

| Test Case ID | Scenario | Steps | Expected Result | Severity | Type |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-SR-HOLD-014-mobile** | 375 × 812 | Walk Steps 1 → 4 | Licence notice, subscription notice, hold section and Review / Done visible; no horizontal scroll on any step. | High | Automated |
| **TC-SR-HOLD-014-tablet** | 768 × 1024 | Same | Same. | Medium | Automated |

## 9. Module 7: Break & Adversarial

| Test Case ID | Scenario | Steps | Expected Result | Severity | Type |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-SR-HOLD-BRK-001-declined** | Declined card | Card `4000 0000 0000 0002` → Submit | *"Your card has been declined."*; stays on Step 3; **no** `confirm-payment` call. | Critical | Automated |
| **TC-SR-HOLD-BRK-001-insufficient-funds** | Insufficient funds | Card `4000 0000 0000 9995` | Card error; stays on Step 3; no application. | Critical | Automated |
| **TC-SR-HOLD-BRK-001-expired** | Expired card | Card `4000 0000 0000 0069` | Card error; stays on Step 3; no application. | High | Automated |
| **TC-SR-BRK-009** | Expiry date in the past | Exp `01/20` | Stays on Step 3; no application. | High | Automated |
| **TC-SR-BRK-010** | Declined card (existing case, updated) | Card `4000…0002` | Decline message; no application. | Critical | Automated |
| **TC-SR-HOLD-BRK-002** | Retry after decline | Declined card, then `4242…` | Second attempt reaches Review; *Not charged*. | High | Automated |
| **TC-SR-HOLD-BRK-003** | Double-click Submit for Review | Double-click | Exactly **one** `confirm-payment` request. | Critical | Automated |
| **TC-SR-HOLD-BRK-004** | Replay / price tampering | Re-send `confirm-payment`; then with `packageId 4` | Same `applicationId` and reference (no duplicate); plan stays *Monthly Plan*, amount 19. | Critical | Automated |
| **TC-SR-HOLD-BRK-005** | Someone else's authorisation | `confirm-payment` with `userId + 1` | 403 *"Card authorization does not match this registration."* | Critical | Automated |
| **TC-SR-HOLD-BRK-006** | Unfinished / fake authorisation | `confirm-payment` with an un-confirmed `seti_` and with `seti_fake_123` | 400 *"Card authorization was not successful."*; fake id 4xx. No application. | Critical | Automated |
| **TC-SR-HOLD-BRK-007** | Register a pending doctor again | Same email / username / licence on Step 1 | *already registered / taken* errors; stays on Step 1. | High | Automated |
| **TC-SR-HOLD-BRK-008** | Login API for pending doctor | `POST /auth/login` | 403, `code: ACCOUNT_PENDING_APPROVAL`, no token. | Critical | Automated |
| **TC-SR-HOLD-BRK-009** | Reload on Review | Reload page | Fresh Step 1 with empty form; no second submission. | Medium | Automated |
| **TC-SR-HOLD-BRK-010** | Close (X) on Review | Click X, reopen `/signup` | Modal closes; new visit starts at Step 1. | Medium | Automated |
| **TC-SR-HOLD-BRK-011** | Reload on Payment | Reload on Step 3 (3 Months) | Stays on Step 3 with $50.00 hold. | Medium | Automated |

## 10. Module 8: Approval, Charge and Notifications (Manual)

These need a super-admin approval screen / API and access to mailboxes, Stripe dashboard and PagerDuty. None of these is available to the automation on QA on 11 Nov 2026.

| Test Case ID | Scenario | Steps | Expected Result | Severity | Type |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-SR-HOLD-M-001** | Card charged after approval | 1. Submit (Monthly)<br>2. Super admin approves the licence<br>3. Check Stripe | One charge of **$19.00** on the saved card; subscription period starts on the approval date; doctor can sign in. | Critical | Manual |
| **TC-SR-HOLD-M-002** | Not charged when rejected | 1. Submit<br>2. Super admin rejects | No charge in Stripe; saved card detached / not used; login still refused. | Critical | Manual |
| **TC-SR-HOLD-M-003** | Amount charged equals the selected package | Approve doctors on 3 Months / 6 Months / 1 Year | Charges $50 / $100 / $200. | Critical | Manual |
| **TC-SR-HOLD-M-004** | First login after approval | Approve, sign in | Doctor onboarding (profile + EULA) shown, then Care View. Covers `doctorOnboarding.spec.js`, which now skips on hold-flow environments. | High | Manual |
| **TC-SR-HOLD-M-005** | Email to doctor (EMR-230) | Submit | Doctor receives the "application received" email with reference. | High | Manual |
| **TC-SR-HOLD-M-006** | Email to super admin (EMR-230) | Submit | Amerck Care super admin receives the new-registration email; PagerDuty alert raised. | High | Manual |
| **TC-SR-HOLD-M-007** | Card fails at approval time | Submit with `4000 0000 0000 0341` (attaches, fails on charge) and approve | Approval reports the failed charge; account not activated or follow-up defined by product. | High | Manual |
| **TC-SR-HOLD-M-008** | 3-D Secure card | Submit with `4000 0025 0000 3155` | Authentication popup; completes to Review after approval in popup; fails cleanly if cancelled. | Medium | Manual |

## 11. Module 9: Regression of the Existing Sign-Up

All existing cases in `selfRegistrationStep1`, `selfRegistrationValidation`, `selfRegistrationMultiStep`, `selfRegistrationEndToEnd` and `selfRegistrationBreakTests` still run. Updated for this ticket:

| Case | Change |
| :--- | :--- |
| TC-SR-UI-002 | *Complete* → *Review*; asserts *Complete* is gone. |
| TC-SR-STEP-002 | Checks the 4 real packages ($19 / $50 / $100 / $200); *Monthly Plan* is preselected, so *Proceed to Payment* is enabled. |
| TC-SR-UI-006 | Assertions were inverted (expected the eye icon to keep the field masked); now checks text → password and that Password is not affected. |
| TC-SR-UI-011 (new) | Ticket path Home → *Dashboard Login* → *Sign Up*. |
| TC-SR-STEP-003 | Heading *Payment & Verification* + new subtitle. |
| TC-SR-STEP-004 | Charged on approval / Charged today / Submit for Review (no *Pay $…*). |
| TC-SR-E2E-001…004 | End on Review + Done instead of *Account Ready!* / *Proceed to Login Dashboard*; coupon cases skip when the coupon is not configured. |
| TC-SR-E2E-005 (new) | Empty card → *"Your card number is incomplete."*, no submission. |
| TC-SR-BRK-009 / 010 | Use *Submit for Review*; also assert no application is created. |
| `doctorOnboarding.spec.js` | Skips with a reason when the new doctor is pending approval (see M-004). |
| `utils/auth.js` `registerNewDoctor`, `globalSetup` | Work with both flows; on hold-flow environments raise a clear *pending approval* message instead of timing out; `SKIP_DOCTOR_SETUP=true` for sign-up-only runs. |

---

## 12. Execution Results - 11 Nov 2026 (QA)

Environment: `qa_pg.amerck.care` / API `pg_api_emr_dev.amerck.care`, Chromium 1280×720, Stripe test mode. Command: `npx playwright test tests/selfRegistration` with `BASE_URL=https://qa_pg.amerck.care`, `SKIP_DOCTOR_SETUP=true`. Evidence: `QA-Automation-Evidence/2026-11-11_13-18-29/`.

**Totals (6 spec files, 90 tests): 87 passed · 1 failed · 2 skipped.**

| Case(s) | Result | Evidence / Notes |
| :--- | :---: | :--- |
| TC-SR-HOLD-001, 002, UI-010, UI-011 | **PASS** | Licence notice text exact, above the form, kept with validation errors, reached via Dashboard Login → Sign Up. |
| TC-SR-STEP-009, HOLD-003 | **PASS** | Subscription period notice below the last package, in line with *Proceed to Payment*. |
| TC-SR-HOLD-004 | **FAIL** | Title shows *"How payment works"*; ticket requires *"How the hold works"*. **DEF-HOLD-01**. |
| TC-SR-HOLD-005 | **PASS** | Three steps with exact wording, ordered left → right. |
| TC-SR-HOLD-006 (×4), HOLD-007 | **PASS** | $19 / $50 / $100 / $200 in summary, step 3 text and footer; matches `create-payment-intent` `packageId` 1–4 and `amount`; Change Plan updates to $200. |
| TC-SR-HOLD-008, 011, STEP-004 | **PASS** | SetupIntent (`seti_…`, `isSetupIntent: true`), *Charged today $0.00*, `confirm-payment` → `PENDING_REVIEW`, no charge endpoint called. |
| TC-SR-UI-002, HOLD-009 | **PASS** | *Review* on all four steps; *Complete* gone. |
| TC-SR-HOLD-010, 012, 013, E2E-001 | **PASS** | Review screen matches the reference image; reference equals API value (`REG-2026-000NN`); Done → `/`; pending doctor sees the verification message at login. |
| TC-SR-HOLD-014 mobile / tablet | **PASS** | No horizontal scroll on any step at 375 px and 768 px. |
| TC-SR-HOLD-BRK-001 … 011, BRK-009, BRK-010 | **PASS** | Declined / no-funds / expired cards stop at Step 3 with no application; retry works; double-click → one submission; replay is idempotent; `packageId` tampering ignored; foreign `userId` → 403; unconfirmed / fake SetupIntent rejected; duplicates → 409 / inline errors; login API → 403 `ACCOUNT_PENDING_APPROVAL`. BRK-010/011 first hit *ENOSPC* (test machine disk full) and passed on re-run. |
| TC-SR-E2E-002, E2E-003 | **SKIPPED** | `THREE_MONTHS_FREE` returns *"Invalid coupon code."* on QA (`POST /coupons/verify` → 400). Set `COUPON_CODE` to a live code to run them. |
| Existing Step 1 / Validation / MultiStep / Break cases | **PASS** | All 24 validation, 11 Step 1, 7 navigation and 11 break cases pass on the new flow. |
| TC-SR-HOLD-M-001 … 008 | **NOT RUN** | No approve / reject screen for registrations in the QA super-admin portal (Settings lists Organizations, Users, Roles … only); mailboxes, Stripe dashboard and PagerDuty not accessible. |
| Cross-check on STG | **INFO** | Change not deployed on `stg.amerck.care` (old *Complete* / *Pay $19.00 & Complete Setup* flow). `registerNewDoctor` verified on both flows: STG registers and onboards; QA stops with a clear *pending approval* message. |

**Overall**: The ticket is implemented and the hold works as described: the card is only authorised, the application is stored as `PENDING_REVIEW`, and the doctor cannot log in until approved. The amounts follow the selected package and the API resists replay and tampering. One wording defect (DEF-HOLD-01). The charge-after-approval and no-charge-after-rejection criteria cannot be verified yet, because there is no approval function on QA.

---

## 13. Findings & Questions for the Developer

| ID | Finding | Evidence | Impact | Suggested action |
| :--- | :--- | :--- | :--- | :--- |
| **DEF-HOLD-01** | Hold section title differs from the ticket | Step 3 shows *"How payment works"*; ticket section 3 says *"How the hold works"*. | Low – wording only, but an acceptance criterion. | Rename the `<h4>` or update the ticket. |
| **Q-HOLD-01** | No way to approve / reject a self-registration on QA | Super-admin Settings has no registrations / applications page; no approval route found in the front-end bundle. | Blocks acceptance criteria *"charged only after approval"* and *"not approved → no payment"* (M-001 … M-004, M-007). | Developer to confirm where approval lives (separate ticket / API) and give QA access. |
| **Q-HOLD-02** | Emails sent on *Submit for Review*, not on *Done* | Clicking *Done* makes no API call; `confirm-payment` is the last request. | Ticket says the email goes out "once the Done button is clicked". A doctor who closes the tab still gets the email (probably desired). | Confirm the trigger with EMR-230. |
| **Q-HOLD-03** | Hold section hidden when a coupon makes the plan free | Front-end code renders *How payment works* only when the amount is not $0 (`!eb`); a *"$0.00 Due Today"* box is shown instead. | Doctors on a free-months coupon do not see the verification steps. | Confirm intended. Could not run on QA: no valid coupon. |
| **Q-HOLD-04** | Footer promises recurring discounted price | With a percentage coupon the footer would read *"You will be charged $&lt;discounted&gt; … then each billing period"*. | May be misleading if the discount applies to the first period only. | Confirm wording for discount coupons. |
| **F-HOLD-05** | Monthly Plan preselected | Step 2 auto-selects *Monthly Plan* ~1 s after packages load; *Proceed to Payment* is enabled without a choice. | Behaviour change from the old spec (TC-SR-STEP-008 expected no default). | Tests updated to the new behaviour; confirm intended. |
| **F-HOLD-06** | `create-payment-intent` still works after submission | After `PENDING_REVIEW`, `POST /payments/create-payment-intent` for the same user returns a new SetupIntent (200). | Low – a submitted application can create unused SetupIntents. | Consider refusing once an application exists. |
| **F-HOLD-07** | Abandoned registration login returns HTTP 500 | Sign-up without payment → `POST /auth/login` → **500** `{"error":"User account is inactive"}`. | Server error status for a normal business case. | Return 401/403 like `ACCOUNT_PENDING_APPROVAL`. |
| **F-HOLD-08** | `THREE_MONTHS_FREE` no longer valid on QA | `POST /coupons/verify` → 400 *"Invalid coupon code."* | Coupon cases skipped. | Provide a QA coupon (set `COUPON_CODE`). |
| **F-HOLD-09** | Automation impact | Self-registered doctors now need approval before first login. | `globalSetup` / `registerNewDoctor` cannot create a usable doctor on hold-flow environments; `doctorOnboarding.spec.js` skips. | Keep an approved doctor in `.env` (`DOCTOR_USERNAME`, `POPULATE_TEST_USERNAME`); approve one doctor for onboarding runs. |
