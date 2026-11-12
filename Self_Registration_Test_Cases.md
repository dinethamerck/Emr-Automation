# Amerck Care - Master Senior QA Test Specification & Execution Matrix

## 1. Executive Summary & Quality Strategy
- **Application Under Test (AUT)**: Amerck Care EMR (Self-Registration, Subscription Gateway & Doctor Onboarding Portal)
- **Target Environments**:
  - Registration Portal: `https://qa_care.amerck.com/signup`
  - Authentication Gate: `https://qa_care.amerck.com/login`
  - Doctor Onboarding & Clinical EMR: `https://qa_care.amerck.com/admin/prescription`
- **Quality Assurance Lead / Author**: Senior QA Architect & Automation Lead
- **Automation Framework**: Playwright Test (Node.js, JavaScript, POM Architecture)
- **Test Strategy Approach**: Risk-Based Testing, Equivalence Partitioning (EP), Boundary Value Analysis (BVA), State Transition Modeling, Adversarial/Security Penetration (OWASP Top 10), and WCAG 2.1 AA Accessibility.

---

## 2. Master Test Suite Architecture & Coverage Summary

| Suite # | Functional Area / Module | Spec File / Category | Total Cases | Automated | Priority Breakdown |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **01** | **Step 1: UI, Structural & Input Layout** | `tests/selfRegistrationStep1.spec.js` | 12 | ✅ 9 Auto / 3 Manual | 6 High, 6 Med |
| **02** | **Step 1: Form Validation & Boundary Values** | `tests/selfRegistrationValidation.spec.js` | 28 | ✅ 25 Auto / 3 Manual | 18 Crit, 10 High |
| **03** | **Step 2: Subscription Package Selection** | `tests/selfRegistrationMultiStep.spec.js` | 8 | ✅ 6 Auto / 2 Manual | 4 Crit, 4 High |
| **04** | **Step 3: Payment Gateway (Stripe SCA & Coupons)** | `tests/selfRegistrationEndToEnd.spec.js` | 14 | ✅ 4 Auto / 10 Manual | 10 Crit, 4 High |
| **05** | **Step 4: Account Activation & Provisioning** | `tests/selfRegistrationEndToEnd.spec.js` | 6 | ✅ 4 Auto / 2 Manual | 4 Crit, 2 High |
| **06** | **Doctor Onboarding: Profile & Qualifications** | `tests/doctorOnboarding.spec.js` | 10 | ✅ 5 Auto / 5 Manual | 7 Crit, 3 High |
| **07** | **Doctor Onboarding: EULA & Legal Consent** | `tests/doctorOnboarding.spec.js` | 8 | ✅ 5 Auto / 3 Manual | 6 Crit, 2 High |
| **08** | **Authentication, Session & Access Control** | `tests/loginPathBreakTests.spec.js` | 12 | ✅ 8 Auto / 4 Manual | 9 Crit, 3 High |
| **09** | **Break, Adversarial & OWASP Security Suite** | `tests/selfRegistrationBreakTests.spec.js` | 16 | ✅ 11 Auto / 5 Manual | 12 Crit, 4 High |
| **10** | **Concurrency, Network Resiliency & Stress** | `tests/loginPathBreakTests.spec.js` | 8 | ✅ 4 Auto / 4 Manual | 5 Crit, 3 High |
| **11** | **Accessibility (WCAG 2.1 AA) & Cross-Platform** | Cross-Browser / Viewport Matrix | 10 | ✅ 3 Auto / 7 Manual | 4 High, 6 Med |
| **12** | **Healthcare Compliance, Audit & Data Privacy** | Regulatory & Audit Verification | 6 | 6 Audit / Manual | 6 Crit |
| **TOTAL** | **Enterprise Test Matrix** | **Complete System Scope** | **138** | **68 Auto / 70 Spec** | **81 Crit, 45 High, 12 Med** |

---

## 3. Module 1: Step 1 UI, Structural & Field Layout

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-SR-UI-001** | Verify Header, Subtitle & Step Counter | User visits `/signup` | 1. Open `/signup`<br>2. Inspect header elements | Modal title is *"Create Your Account"*, subtitle is *"Enter your credentials and professional information to get started."*, badge shows *"Self Registration"*, and step reads *"Step 1 of 4"*. | High | Automated |
| **TC-SR-UI-002** | Verify Stepper Indicators & Initial State | Modal open | 1. Observe stepper layout | All 4 steps (*Account*, *Package*, *Payment*, *Review*) are visible — the final step was renamed from *Complete* to *Review* (pay, submit and charge); Step 1 is highlighted as active. | Medium | Automated |
| **TC-SR-UI-003** | Verify All Form Input Placeholders | Modal open | 1. Check placeholders of all Step 1 inputs | Placeholders exactly match:<br>- First Name: `e.g. Jane`<br>- Last Name: `e.g. Doe`<br>- Username: `e.g. dr_janedoe`<br>- Email: `jane.doe@clinic.com`<br>- Mobile: `+94 77 123 4567`<br>- NIC: `e.g. 123456789V or 199012345678`<br>- License: `e.g. SLMC-12345`<br>- Password: `Min 8 chars, Aa1@`<br>- Confirm Password: `Re-enter password` | Medium | Automated |
| **TC-SR-UI-004** | Verify Password Masking Default | Modal open | 1. Inspect input `type` attributes | Password and Confirm Password inputs have `type="password"` by default. Characters typed are masked with dots. | High | Automated |
| **TC-SR-UI-005** | Verify Password Eye Toggle Functionality | Input with value | 1. Enter password<br>2. Click eye icon<br>3. Click eye icon again | Input type switches from `password` to `text` (revealed) and back to `password` (hidden). Eye icon toggle state alternates. | High | Automated |
| **TC-SR-UI-006** | Verify Confirm Password Eye Toggle | Input with value | 1. Enter confirm password<br>2. Click eye icon<br>3. Click eye icon again | Confirm password input unmasks and masks independently without affecting password field. | High | Automated |
| **TC-SR-UI-007** | Verify Additional Options Accordion Toggle | Modal open | 1. Click "Show Additional Options"<br>2. Check expanded elements<br>3. Click "Hide Additional Options" | Options expand smoothly to show *User Type* (*Clinical*, *Non-Clinical*), and collapses when toggled again. | Medium | Automated |
| **TC-SR-UI-008** | Verify Close Button (X) Presence & Styling | Modal open | 1. Check top-right corner of modal | Close button (X icon) is rendered, visible, accessible via keyboard, and enabled in the modal header. | Medium | Automated |
| **TC-SR-UI-009** | Verify Entry from Login Page Sign-Up Link | User at `/login` | 1. Navigate to `/login`<br>2. Click *"Sign Up"* link | User is directed to `/signup` and the Self Registration modal opens automatically. | High | Automated |
| **TC-SR-UI-010** | Verify Browser Tab Title & Meta Description | Browser loaded | 1. Inspect `<title>` and `<meta>` | Tab title displays *"Sign Up \| Amerck Care"* and meta description reflects clinical registration. | Low | Exploratory |
| **TC-SR-UI-011** | Verify Responsive Layout on Tablet (768px) | Modal open | 1. Resize viewport to 768x1024<br>2. Inspect grid layout | Two-column form stacks gracefully into a single-column or readable layout without horizontal scrollbar. | High | Automated |
| **TC-SR-UI-012** | Verify Responsive Layout on Mobile (375px) | Modal open | 1. Resize viewport to 375x667<br>2. Check modal padding and touch targets | Modal fits mobile viewport; form inputs and CTA buttons meet minimum touch target size (44x44px). | High | Automated |

---

## 4. Module 2: Step 1 Complete Form Validation & Boundary Analysis

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-SR-VAL-001** | Blank Form Submission (All 8 Required Fields) | Modal open at Step 1 | 1. Leave all fields empty<br>2. Click "Next" | Form displays inline errors in red:<br>- *"First name is required"*<br>- *"Last name is required"*<br>- *"Username is required"*<br>- *"Email address is required"*<br>- *"Mobile number is required"*<br>- *"License number is required"*<br>- *"Password is required"*<br>- *"Please confirm your password"* | Critical | Automated |
| **TC-SR-VAL-002** | Optional NIC Field Validation Exemption | Modal open at Step 1 | 1. Submit empty form<br>2. Inspect NIC field | No validation error is displayed for NIC (*Optional* label verified). | Medium | Automated |
| **TC-SR-VAL-003** | Whitespace-Only Validation (First & Last Name) | Modal open at Step 1 | 1. Enter spaces `"    "` into First Name and Last Name<br>2. Click "Next" | Whitespace is trimmed and treated as empty; *"First name is required"* and *"Last name is required"* errors appear. | High | Automated |
| **TC-SR-VAL-004** | Whitespace-Only Validation (Username & License) | Modal open at Step 1 | 1. Enter spaces into Username and License Number<br>2. Click "Next" | Fields reject whitespace; *"Username is required"* and *"License number is required"* errors appear. | High | Automated |
| **TC-SR-VAL-005** | Real-time Error Clearance on Input Modification | Field showing error | 1. Click Next to trigger error<br>2. Type valid value into First Name | *"First name is required"* error message clears dynamically on keyup/change without re-submitting. | High | Automated |
| **TC-SR-VAL-006** | Username with Embedded Spaces | Modal open at Step 1 | 1. Enter `dr john doe`<br>2. Click "Next" | Inline error displays: *"Only letters, numbers, dot, dash, underscore allowed"*. | Critical | Automated |
| **TC-SR-VAL-007** | Username with Illegal Special Symbols | Modal open at Step 1 | 1. Enter `dr_user#99!`<br>2. Click "Next" | Inline error displays: *"Only letters, numbers, dot, dash, underscore allowed"*. | High | Automated |
| **TC-SR-VAL-008** | Valid Username Characters Boundary (., -, _) | Modal open at Step 1 | 1. Enter `dr.john_doe-99`<br>2. Click "Next" | Username format error does not trigger; valid alphanumeric and special characters accepted. | High | Automated |
| **TC-SR-VAL-009** | Email Missing "@" Symbol | Modal open at Step 1 | 1. Enter `dr.smith_clinic.com`<br>2. Click "Next" | Inline error displays: *"Please enter a valid email address"*. | Critical | Automated |
| **TC-SR-VAL-010** | Email Missing Domain after "@" | Modal open at Step 1 | 1. Enter `dr.smith@`<br>2. Click "Next" | Inline error displays: *"Please enter a valid email address"*. | High | Automated |
| **TC-SR-VAL-011** | Email with Embedded Spaces | Modal open at Step 1 | 1. Enter `dr smith@clinic.com`<br>2. Click "Next" | Inline error displays: *"Please enter a valid email address"*. | High | Automated |
| **TC-SR-VAL-012** | Email with Multiple "@" Symbols | Modal open at Step 1 | 1. Enter `dr@smith@clinic.com`<br>2. Click "Next" | Inline error displays: *"Please enter a valid email address"*. | High | Automated |
| **TC-SR-VAL-013** | Mobile Number Containing Alphabetic Letters | Modal open at Step 1 | 1. Enter `077ABCDEFG`<br>2. Click "Next" | Inline error displays: *"Please enter a valid phone number"*. | Critical | Automated |
| **TC-SR-VAL-014** | Mobile Number Under Minimum Length (< 7 digits) | Modal open at Step 1 | 1. Enter `12345`<br>2. Click "Next" | Inline error displays: *"Please enter a valid phone number"*. | High | Automated |
| **TC-SR-VAL-015** | Valid International Mobile Number with Country Code | Modal open at Step 1 | 1. Enter `+94771234567`<br>2. Click "Next" | Mobile validation passes without error. | High | Automated |
| **TC-SR-VAL-016** | Invalid NIC Format (Arbitrary alphanumeric) | Modal open at Step 1 | 1. Enter `12345ABC`<br>2. Click "Next" | Inline error displays: *"Invalid NIC (e.g. 123456789V or 199012345678)"*. | High | Automated |
| **TC-SR-VAL-017** | Valid Old NIC Format (9 Digits + V/X) | Modal open at Step 1 | 1. Enter `123456789V`<br>2. Click "Next" | Old Sri Lankan NIC format is accepted without error. | High | Automated |
| **TC-SR-VAL-018** | Valid New NIC Format (12 Digits) | Modal open at Step 1 | 1. Enter `199012345678`<br>2. Click "Next" | New 12-digit NIC format is accepted without error. | High | Automated |
| **TC-SR-VAL-019** | Password Under 8 Characters (BVA: 7 chars) | Modal open at Step 1 | 1. Enter `Aa1@567`<br>2. Click "Next" | Inline error displays: *"Password must be at least 8 characters"*. | Critical | Automated |
| **TC-SR-VAL-020** | Password Missing Uppercase Letter | Modal open at Step 1 | 1. Enter `password123@`<br>2. Click "Next" | Inline error displays: *"Must contain at least 1 uppercase letter"*. | High | Automated |
| **TC-SR-VAL-021** | Password Missing Lowercase Letter | Modal open at Step 1 | 1. Enter `PASSWORD123@`<br>2. Click "Next" | Inline error displays: *"Must contain at least 1 lowercase letter"*. | High | Automated |
| **TC-SR-VAL-022** | Password Missing Numeric Digit | Modal open at Step 1 | 1. Enter `Password@@@@`<br>2. Click "Next" | Inline error displays: *"Must contain at least 1 number"*. | High | Automated |
| **TC-SR-VAL-023** | Password Missing Special Character | Modal open at Step 1 | 1. Enter `Password1234`<br>2. Click "Next" | Inline error displays: *"Must contain at least 1 special character"*. | High | Automated |
| **TC-SR-VAL-024** | Empty Confirm Password Field | Modal open at Step 1 | 1. Enter valid Password<br>2. Leave Confirm Password blank<br>3. Click "Next" | Inline error displays: *"Please confirm your password"*. | High | Automated |
| **TC-SR-VAL-025** | Password & Confirm Password Mismatch | Modal open at Step 1 | 1. Enter `StrongPassword123!`<br>2. Enter `DifferentPassword123!`<br>3. Click "Next" | Inline error displays: *"Passwords do not match"*, preventing step transition. | Critical | Automated |
| **TC-SR-VAL-026** | Existing / Duplicate Email Registration | Modal open at Step 1 | 1. Enter an email already registered in database<br>2. Fill other valid fields<br>3. Click "Next" | System returns backend error banner: *"Email already in use"* or prevents duplicate account generation. | Critical | Automated |
| **TC-SR-VAL-027** | Existing / Duplicate Username Registration | Modal open at Step 1 | 1. Enter an existing username<br>2. Click "Next" | System returns inline error or modal toast: *"Username is already taken"*. | Critical | Automated |
| **TC-SR-VAL-028** | License Number Boundary (Alphanumeric length) | Modal open at Step 1 | 1. Enter 30-char license string `SLMC-MED-SPEC-9988776655`<br>2. Click "Next" | Field accepts valid alphanumeric medical board identifiers without truncation. | High | Automated |

---

## 5. Module 3: Step 2 Subscription Package Selection & Tier Matrix

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-SR-STEP-001** | Step 1 to Step 2 Transition with Valid Data | Step 1 filled with valid data | 1. Fill all required fields with unique valid data<br>2. Click "Next" | Stepper advances to *"Step 2 of 4"*, showing heading *"Select Subscription Package"*. | Critical | Automated |
| **TC-SR-STEP-002** | Subscription Plans Display & Pricing Accuracy | User at Step 2 | 1. Wait for plans to render | Four packages: *Monthly Plan* $19.00 / month, *3 Months Plan* $50.00, *6 Months Plan* $100.00, *1 Year Plan* $200.00; *Monthly Plan* is preselected so *Proceed to Payment* is enabled; notice *"Your subscription period starts on the day your account is approved."* at the end. | High | Automated |
| **TC-SR-STEP-003** | Step 2 Plan Selection & Radio State Highlight | User at Step 2 | 1. Click on *Standard Plan* card<br>2. Observe card border & selection indicator | Selected plan card is visually highlighted (border/active state), and *"Proceed to Payment"* is enabled. | High | Automated |
| **TC-SR-STEP-004** | Step 2 to Step 3 Transition | User at Step 2 | 1. Select *Monthly Plan*<br>2. Click *"Proceed to Payment"* | Stepper advances to *"Step 3 of 4"*, heading *"Payment & Verification"*. | Critical | Automated |
| **TC-SR-STEP-005** | Plan Selection Switch before Proceeding | User at Step 2 | 1. Click *Standard Plan*<br>2. Switch click to *Quarterly Plan*<br>3. Click *"Proceed to Payment"* | Selection updates dynamically; Step 3 order summary shows `USD $49.00` for Quarterly Plan. | High | Automated |
| **TC-SR-STEP-006** | Additional Options Submission Processing | Step 1 open | 1. Fill required fields<br>2. Expand Additional Options<br>3. Select *Clinical User Type*<br>4. Click "Next" | Form successfully processes user classification payload and advances to Step 2. | High | Automated |
| **TC-SR-STEP-007** | Step 2 Back Navigation to Step 1 | User at Step 2 | 1. Click Back button or browser Back | User is returned to Step 1 with all previously entered credentials preserved. | High | Automated |
| **TC-SR-STEP-008** | Default Plan Selection | User at Step 2 | 1. Wait for packages to load | *Monthly Plan* is preselected (check mark) and *Proceed to Payment* is enabled; the doctor can still pick another package. | Medium | Automated |

---

## 6. Module 4: Step 3 Payment Processing, Stripe SCA & Coupons

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-SR-PAY-001** | Step 3 Order Summary, Hold & Stripe Badge | User at Step 3 | 1. Inspect payment section | Plan summary, *Charged on approval* $19.00, *Charged today* $0.00, three-step hold explanation, 256-bit SSL / Powered by Stripe, *Submit for Review*. See `EMR_SELF_SIGNUP_PAYMENT_HOLD_TEST_CASES.md`. | High | Automated |
| **TC-SR-PAY-002** | Valid Stripe Test Card Authorisation | User at Step 3 | 1. Enter `4242 4242 4242 4242`, `12/34`, `123`<br>2. Click *"Submit for Review"* | Card is authorised (SetupIntent), **not charged**; page advances to Step 4 *Review* (*Application Submitted*). | Critical | Automated |
| **TC-SR-PAY-003** | Step 3 Back Navigation ("Change Plan") | User at Step 3 | 1. Click *"Change Plan"* button | User is smoothly navigated back to Step 2 (*"Step 2 of 4"* - *Select Subscription Package*). | High | Automated |
| **TC-SR-PAY-004** | Valid Promo Code Application (`THREE_MONTHS_FREE`) | User at Step 3 | 1. Enter `THREE_MONTHS_FREE` in coupon input<br>2. Click *"Apply"* | Total due becomes `FREE ($0.00)`, discount line `-$19.00` appears, and submit button updates to *"Start Subscription"*. | Critical | Automated |
| **TC-SR-PAY-005** | Dynamic Coupon Code Removal & Price Restoration | User at Step 3 with promo | 1. Observe discounted price (`$0.00`)<br>2. Click *"Remove"* button | Pricing reverts dynamically back to `$19.00`, and *"Apply"* button is restored. | High | Automated |
| **TC-SR-PAY-006** | Incomplete / Invalid Card Number Alert Banner | User at Step 3 | 1. Enter incomplete card `1444 4444 4444 4444` with Exp & CVC<br>2. Click Submit | Red alert banner displays: *"Your card number is incomplete."* (or *"Your card number is incorrect."*), halting flow. | High | Automated |
| **TC-SR-PAY-007** | Expired Payment Card Rejection | User at Step 3 | 1. Fill card with past expiration (`01/20`)<br>2. Click Pay | Stripe validator displays past expiration notice (*"Your card's expiration year is in the past."*) and blocks submission. | Critical | Automated |
| **TC-SR-PAY-008** | Declined Payment Card Handling (Generic Decline) | User at Step 3 | 1. Enter Stripe card `4000 0000 0000 0002`<br>2. Click *Submit for Review* | *"Your card has been declined."*; user stays on Step 3; no application is created. | Critical | Automated |
| **TC-SR-PAY-009** | Insufficient Funds Card Decline | User at Step 3 | 1. Enter Stripe test card `4000 0000 0000 9995`<br>2. Click Pay | System displays *"Your card has insufficient funds"*, halting activation. | High | Exploratory |
| **TC-SR-PAY-010** | Stripe 3D Secure (3DS / SCA) Authentication Challenge | User at Step 3 | 1. Enter 3DS test card `4000 0000 0000 3063`<br>2. Click Pay | 3DS iframe modal pops up; completing challenge authorizes payment and completes step 4. | Critical | Automated |
| **TC-SR-PAY-011** | Stripe 3D Secure (3DS) Challenge Failure / Cancellation | User at Step 3 | 1. Enter 3DS test card<br>2. In 3DS modal, click "Fail Authentication" | Modal closes; error displays *"Authentication failed"*; user remains on payment screen. | High | Exploratory |
| **TC-SR-PAY-012** | Invalid Coupon Code Error Handling | User at Step 3 | 1. Enter `FAKE_COUPON_999`<br>2. Click "Apply" | Error toast/inline error appears: *"Invalid coupon code"*; price is unchanged. | High | Automated |
| **TC-SR-PAY-013** | Expired Promo Code Handling | User at Step 3 | 1. Enter known expired promo code<br>2. Click "Apply" | Error message displays: *"This promo code has expired"*. | Medium | Exploratory |
| **TC-SR-PAY-014** | Rapid Double-Click on Submit for Review | User at Step 3 | 1. Enter valid card<br>2. Double-click *Submit for Review* | Exactly one `confirm-payment` request and one application reference. | Critical | Automated |

---

## 7. Module 5: Step 4 Review (Application Submitted)

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-SR-CONF-001** | Complete End-to-End Registration (Paid Plan) | Step 1 open | 1. Fill Step 1 credentials<br>2. Choose *Monthly Plan*<br>3. Enter Stripe test card<br>4. Click *Submit for Review* | Stepper advances to **Step 4 of 4 – Review**: *"Application Submitted"*, *"Thank you, Dr. &lt;Last name&gt;"*, timeline, reference, plan, *Payment: Not charged · charged on approval*. | Critical | Automated |
| **TC-SR-CONF-002** | Complete End-to-End Registration (Promo Code) | Coupon configured on the environment | 1. Fill Step 1<br>2. Choose plan<br>3. Apply coupon<br>4. Enter test card<br>5. *Submit for Review* | Advances to **Review**; *Charged today* $0.00. Skipped when the coupon is not configured (QA rejects `THREE_MONTHS_FREE` on 11 Nov 2026). | Critical | Automated |
| **TC-SR-CONF-003** | Done CTA Navigation | User at Review | 1. Click *"Done"* | Modal closes and the browser opens the public home page `/`. (*Proceed to Login Dashboard* was removed — the doctor cannot sign in until approved.) | Critical | Automated |
| **TC-SR-CONF-004** | Reload / Back after submission | User at Review | 1. Reload the page | Fresh Step 1; no second submission. | High | Automated |
| **TC-SR-CONF-005** | Submission & Approval Emails (EMR-230) | Application submitted | 1. Check doctor and super-admin mailboxes | Doctor and Amerck Care super admin receive the self-registration emails; login email is sent after approval. | High | Manual |
| **TC-SR-CONF-006** | Database Application & Subscription Audit | Application submitted | 1. Query the new doctor | Application `PENDING_REVIEW`; no charge; after approval user `ACTIVE`, subscription starts on approval date. | High | Manual |

---

## 8. Module 6: Doctor Onboarding - Profile Setup & Qualifications

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-ONB-001** | Doctor Profile Modal Display upon First Login | Newly registered doctor | 1. Login with newly created doctor credentials<br>2. Observe post-login screen | Doctor Onboarding modal displays with title *"Complete your doctor profile and review agreement to get started."* with **STEP 1 Doctor Profile** active. | Critical | Automated |
| **TC-ONB-002** | Doctor Profile Form Elements & Hint Text | Onboarding modal open | 1. Verify Display Name prefilled with `Dr. <Name>`<br>2. Verify hint text<br>3. Verify Speciality dropdown options<br>4. Verify Qualification placeholder | - Display Name prefilled.<br>- Hint reads: *"The formal name shown to patients on prescriptions, letterheads, and reports."*<br>- Speciality dropdown contains specialities (*Neurosurgeon*, *Cardiologist*, etc.)<br>- Qualification placeholder `e.g. MBBS, MD, FRCS`. | High | Automated |
| **TC-ONB-003** | Doctor Profile Submission to EULA Step | Profile form open | 1. Set Display Name: `Dr. Dineth Rathnayeke 1`<br>2. Select Speciality: `Neurosurgeon`<br>3. Set Qualification: `MBBS`<br>4. Click *"Continue to EULA Agreement ->"* | Form advances to **STEP 2 EULA Agreement**, displaying license details, practitioner name, and terms. | Critical | Automated |
| **TC-ONB-004** | Back to Profile Navigation & State Retention | User at Step 2 (EULA) | 1. From Step 2, click *"Back to Profile"* button | User returns to **STEP 1 Doctor Profile** with all previously entered details (`Dr. Dineth Rathnayeke 1`, `Neurosurgeon`, `MBBS`) preserved. | High | Automated |
| **TC-ONB-005** | Blank Display Name Validation | Onboarding Step 1 | 1. Clear Display Name field<br>2. Click *"Continue to EULA Agreement"* | Inline validation triggers: *"Display name is required"*; cannot proceed to Step 2. | Critical | Automated |
| **TC-ONB-006** | Empty Qualification Validation | Onboarding Step 1 | 1. Leave Qualification field empty<br>2. Click *"Continue to EULA Agreement"* | Validation triggers: *"Qualification is required"*; cannot proceed to Step 2. | High | Automated |
| **TC-ONB-007** | Speciality Combobox Search & Filter | Onboarding Step 1 | 1. Open Speciality combobox<br>2. Type `Cardio`<br>3. Select `Cardiologist` | Dropdown filters accurately to matching entries; selection is set to `Cardiologist`. | Medium | Automated |
| **TC-ONB-008** | Long Display Name Handling (BVA: 100 chars) | Onboarding Step 1 | 1. Enter 100-character name<br>2. Proceed to Step 2 | Text is truncated or handled without breaking prescription letterhead preview. | Medium | Exploratory |
| **TC-ONB-009** | Speciality List Medical Coverage Verification | Onboarding Step 1 | 1. Inspect all options in combobox | Contains key medical disciplines: General Physician, Pediatrician, Neurologist, Orthopedic, Dermatologist, etc. | Medium | Manual |
| **TC-ONB-010** | Unsaved Profile Changes on Refresh | Onboarding Step 1 | 1. Type new qualifications<br>2. Refresh browser | User remains on onboarding modal; unsubmitted values fall back to defaults safely. | Medium | Exploratory |

---

## 9. Module 7: Doctor Onboarding - EULA Agreement & Consent

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-ONB-011** | Accept EULA & Complete Onboarding to Dashboard | User at Step 2 (EULA) | 1. Check *"Accept EULA, Privacy Policy and Terms of Service"*<br>2. Click *"Accept & Continue to Dashboard"* | Onboarding modal closes and user is granted full access to the Doctor Dashboard (`/admin/prescription`). | Critical | Automated |
| **TC-ONB-012** | Submit EULA without Checking Agreement Box | User at Step 2 (EULA) | 1. Leave EULA checkbox unchecked<br>2. Click *"Accept & Continue to Dashboard"* | Button is disabled OR validation alert triggers: *"You must accept the terms to proceed"*; access to dashboard blocked. | Critical | Automated |
| **TC-ONB-013** | EULA Licensee and Practitioner Data Binding | User at Step 2 (EULA) | 1. Inspect EULA header and body | Licensee name displays doctor's full name, SLMC license number, and registration date accurately. | High | Automated |
| **TC-ONB-014** | Re-login After Onboarding Completion (Idempotency) | Onboarding finished | 1. Log out of doctor dashboard<br>2. Log in again with the same credentials | User is taken directly to `/admin/prescription` without seeing the onboarding modal again. | Critical | Automated |
| **TC-ONB-015** | Modal Backdrop Click Bypass Prevention | Onboarding modal open | 1. Click outside modal on darkened backdrop | Modal does NOT dismiss; user cannot bypass mandatory onboarding flow. | Critical | Automated |
| **TC-ONB-016** | Escape Key (ESC) Bypass Prevention | Onboarding modal open | 1. Press ESC key | Modal remains open; un-onboarded doctor cannot escape into clinical dashboard. | High | Automated |
| **TC-ONB-017** | Forced URL Navigation to Prescription Page | User logged in but onboarding pending | 1. Manually type `https://qa_care.amerck.com/admin/prescription`<br>2. Press Enter | Router guard intercepts navigation and displays mandatory onboarding modal. | Critical | Automated |
| **TC-ONB-018** | EULA Acceptance Audit Log Generation | EULA accepted | 1. Inspect audit log entry in backend | Timestamp, IP address, doctor ID, and EULA version are logged for healthcare legal compliance. | Critical | DB Audit |

---

## 10. Module 8: Authentication, Session & Access Control

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-LOG-001** | Successful Doctor Login with Valid Credentials | Active doctor account | 1. Enter username and password<br>2. Click "Sign In" | User authenticated; redirected to onboarding modal (if 1st login) or dashboard. | Critical | Automated |
| **TC-LOG-002** | Invalid Password Attempt | User at `/login` | 1. Enter valid username<br>2. Enter wrong password<br>3. Submit | Error banner displays: *"Invalid credentials"*; login rejected. | High | Automated |
| **TC-LOG-003** | Non-Existent User Login / Account Enumeration | User at `/login` | 1. Enter non-existent username (`nonexistent_doctor_qa_999`)<br>2. Submit login form | Returns generic *"Invalid credentials"* without revealing whether user exists (prevents account enumeration). | High | Automated |
| **TC-LOG-004** | Strict Password Case Sensitivity Check | User at `/login` | 1. Enter valid doctor username<br>2. Enter password with incorrect casing (`alllowercasepassword`)<br>3. Submit form | Login is rejected; verifies password validation is strictly case-sensitive. | High | Automated |
| **TC-LOG-005** | Forced Browsing / Unauthorized Access Control | Clean session (no auth) | 1. Directly browse to protected route `/admin/prescription` without logging in | Unauthenticated request is intercepted by auth guard and redirected to `/login`. | Critical | Automated |
| **TC-LOG-006** | Incomplete Registration Account Login Attempt | Modal open at Step 1 | 1. Fill Step 1 credentials<br>2. Advance to Step 2<br>3. Abandon registration without paying<br>4. Attempt login at `/login` | Access to `/admin/prescription` is blocked, user retained on `/login`, and inactive/unauthorized notice displayed. | Critical | Automated |
| **TC-LOG-007** | Session Invalidation on Explicit Logout | Authenticated doctor | 1. Click user avatar -> Log out<br>2. Click browser Back button | Session is cleared; browser Back shows login page, protected clinical data cannot be cached or viewed. | Critical | Automated |
| **TC-LOG-008** | Session Timeout / Inactivity Expiration (HIPAA) | Authenticated doctor | 1. Remain idle for configured session timeout (e.g. 15 mins)<br>2. Attempt to click prescription action | Doctor is logged out automatically and prompted to re-authenticate to protect patient data. | Critical | Manual/Test |
| **TC-LOG-009** | Concurrent Logins from Multiple Devices | Single doctor account | 1. Login on Browser A<br>2. Login on Browser B with same account | System either invalidates Browser A session or notifies doctor of active session. | High | Exploratory |
| **TC-LOG-010** | Forgot Password Reset Workflow | User at `/login` | 1. Click "Forgot Password?"<br>2. Enter registered email<br>3. Submit | Password reset link sent to doctor's email; reset token expires after 1 hour. | High | Functional |
| **TC-LOG-011** | Brute Force Protection / Rate Limiting | User at `/login` | 1. Attempt 5 consecutive failed logins in 30 seconds | System temporarily locks account or displays CAPTCHA / rate-limit warning. | Critical | Security |
| **TC-LOG-012** | CSRF Token Validation on Login POST | API level | 1. Inspect login network payload | Requests contain valid anti-CSRF token or SameSite=Strict cookies. | Critical | Security |

---

## 11. Module 9: Break, Adversarial & OWASP Top 10 Security Suite

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-SR-BRK-001** | Cross-Site Scripting (XSS) Injection in Names | Modal open at Step 1 | 1. Enter `<script>window.__xss_executed=true;</script>` in First Name<br>2. Click "Next" | Payload is sanitized/escaped; script does not execute in window context, modal remains unbroken. | Critical | Automated |
| **TC-SR-BRK-002** | SQL Injection Payload in Registration Username | Modal open at Step 1 | 1. Enter `' OR '1'='1' --` in Username<br>2. Click "Next" | Input is blocked by format validation (*"Only letters, numbers, dot, dash, underscore allowed"*), halting malicious queries. | Critical | Automated |
| **TC-SR-BRK-003** | HTML Tag Injection in License Field | Modal open at Step 1 | 1. Enter `<b id="injected-html-tag">SLMC-9999</b>`<br>2. Click "Next" | Injected HTML is escaped and does not render as an active DOM node. | High | Automated |
| **TC-SR-BRK-004** | Buffer Overflow Boundary (500+ Chars in Name) | Modal open at Step 1 | 1. Enter 500 characters of `"A"` into First Name<br>2. Click "Next" | Modal handles extreme input gracefully without horizontal blowout or browser page freeze. | High | Automated |
| **TC-SR-BRK-005** | Extreme Password Length (250 Chars) | Modal open at Step 1 | 1. Enter 250-character complex password into both password fields<br>2. Click "Next" | Password hashing and validation handles extreme string length without memory exhaustion. | High | Automated |
| **TC-SR-BRK-006** | Unicode, Multilingual Scripts & Emojis | Modal open at Step 1 | 1. Enter `Dr. 👨‍⚕️ 🩺` in First Name<br>2. Enter `වෛද්‍ය / மருத்துவர்` in Last Name<br>3. Click "Next" | System handles international non-ASCII characters and UTF-8 emojis without encoding crashes. | Medium | Automated |
| **TC-SR-BRK-007** | Rapid Double-Click Submission (Debouncing) | Modal open at Step 1 | 1. Fill valid credentials<br>2. Double-click "Next" in rapid succession (<= 50ms) | Form debounces submissions, cleanly advancing to Step 2 without jumping or creating race conditions. | High | Automated |
| **TC-SR-BRK-008** | Adversarial SQLi in Promo Code Field | User at Step 3 | 1. Enter `'; DROP TABLE coupons; --` into Promo Code<br>2. Click "Apply" | Backend responds safely with *"Invalid coupon code."* without exposing SQL syntax errors or 500 crashes. | Critical | Automated |
| **TC-SR-BRK-009** | Modal Close & Re-open State Sanity | Modal open with data | 1. Type into fields<br>2. Click Close button (X)<br>3. Re-verify page responsiveness | Modal dismisses safely without leaving backdrop deadlocks or unclickable screen overlay. | Medium | Automated |
| **TC-LOG-BRK-001** | SQL Injection Authentication Bypass on Login | User at `/login` | 1. Enter `' OR '1'='1' --` into username<br>2. Enter dummy password<br>3. Click "Log in" | SQL injection authentication bypass fails; generic error message is displayed and protected dashboard access is rejected. | Critical | Automated |
| **TC-LOG-BRK-002** | Stored/Reflected XSS Payload in Login Username | User at `/login` | 1. Enter `<script>window.__login_xss=true;</script>` into username<br>2. Submit login form | XSS script is treated as text and not executed in DOM context; window flag remains undefined. | Critical | Automated |
| **TC-LOG-BRK-005** | Extreme Buffer Overflow Stress (1,000 Chars) | User at `/login` | 1. Enter 1,000 characters into username field<br>2. Submit form | System handles oversized payload gracefully; no HTTP 500 or UI crash. | High | Automated |
| **TC-LOG-BRK-007** | Rapid Multi-Click Login Button (Debouncing) | User at `/login` | 1. Fill credentials<br>2. Click "Log in" button 5 times in rapid succession (<= 50ms) | Button debouncing prevents duplicate API requests or race conditions. | High | Automated |
| **TC-SEC-014** | Sensitive Data Exposure in LocalStorage / Cookies | Authenticated session | 1. Inspect Application tab in DevTools | Passwords, raw credit cards, and unencrypted tokens are NEVER stored in LocalStorage or cookies. | Critical | Security Audit |
| **TC-SEC-015** | Insecure Direct Object Reference (IDOR) on Onboarding | API inspection | 1. Intercept PUT `/api/doctor/profile`<br>2. Change doctor ID to another doctor's ID | Server validates authenticated user token against entity ID; rejects cross-tenant modification with 403 Forbidden. | Critical | Security Audit |
| **TC-SEC-016** | Cross-Site Request Forgery (CSRF) on Payment Activation | User at Step 3 | 1. Trigger payment action from external domain iframe | SameSite cookie policy and CORS headers block unauthorized foreign requests. | Critical | Security Audit |

---

## 12. Module 10: Concurrency, Network Resiliency & Performance

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-RES-001** | Network Disconnection Mid-Registration (Offline) | User at Step 1 | 1. Fill valid data<br>2. Disconnect network (`offline`)<br>3. Click "Next" | App displays user-friendly offline banner: *"Network connection lost. Please check your internet."*; form data intact. | High | Automated/Emul |
| **TC-RES-002** | Slow 3G Network Throttling on Payment Submission | User at Step 3 | 1. Throttle network to Slow 3G<br>2. Submit payment | Loading spinner renders; buttons disabled to prevent duplicate taps; completes once network resolves. | High | Automated/Emul |
| **TC-RES-003** | Backend 500 Internal Server Error Graceful Recovery | API mock | 1. Intercept registration API with HTTP 500<br>2. Click Next | User sees polite error toast: *"Something went wrong on our end. Please try again later."*; no blank screen. | Critical | Mock/Auto |
| **TC-RES-004** | Backend 504 Gateway Timeout Handling | API mock | 1. Intercept payment endpoint with 30s timeout | System catches timeout gracefully and allows retry without charging card twice. | High | Mock/Auto |
| **TC-RES-005** | Simultaneous Registration from Same IP | Two browser contexts | 1. Register User A and User B concurrently from same machine | System processes both independent sessions concurrently without thread locks. | Medium | Concurrency |
| **TC-RES-006** | Browser Refresh (F5) During Step 2 Package Selection | User at Step 2 | 1. Refresh page while on Step 2 | If session persisted, retains state or redirects cleanly to Step 1 with notice. | Medium | Exploratory |
| **TC-RES-007** | Step 1 Form Submission Response Time (SLA: < 2.0s) | Fast broadband | 1. Click Next with valid data<br>2. Measure navigation time | Transition to Step 2 completes in under 2000ms. | Medium | Performance |
| **TC-RES-008** | EULA Agreement Acceptance Response Time (SLA: < 1.5s) | Fast broadband | 1. Click "Accept & Continue"<br>2. Measure dashboard load time | Doctor dashboard loads completely within 1500ms. | Medium | Performance |

---

## 13. Module 11: Usability, Accessibility (WCAG 2.1 AA) & Cross-Platform

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-UX-001** | Full Keyboard Tab Navigation (Step 1 Modal) | Modal open at Step 1 | 1. Focus first input<br>2. Press `Tab` repeatedly through all inputs to Next button | Focus moves sequentially through inputs without skipping or trapping focus; focus ring visible. | High | Automated |
| **TC-UX-002** | Modal Focus Trap Verification | Modal open | 1. Tab past the last button in modal | Focus loops back to modal close button or first input; does NOT leak to background page. | High | Automated |
| **TC-UX-003** | ARIA Labels & Roles for Screen Readers | Modal open | 1. Inspect DOM accessibility tree | Inputs have associated `<label>` or `aria-label`, combobox has `role="combobox"`, modal has `role="dialog"`. | High | Accessibility |
| **TC-UX-004** | Color Contrast Compliance (WCAG AA >= 4.5:1) | Step 1 & Step 3 | 1. Run Lighthouse accessibility audit | Text contrast against white/dark backgrounds meets or exceeds 4.5:1 ratio for normal text. | High | Accessibility |
| **TC-UX-005** | Error Messages Screen Reader Announcements (`aria-live`) | Inline errors active | 1. Trigger validation errors | Error containers have `role="alert"` or `aria-live="polite"` so screen readers announce errors immediately. | Medium | Accessibility |
| **TC-UX-006** | Cross-Browser Compatibility: Google Chrome | Chrome browser | 1. Execute end-to-end flow in Chromium | All layout, styling, Stripe iframe, and modal transitions function identically. | High | Automated |
| **TC-UX-007** | Cross-Browser Compatibility: Mozilla Firefox | Firefox browser | 1. Execute end-to-end flow in Firefox | All layout, styling, Stripe iframe, and modal transitions function identically. | High | Automated |
| **TC-UX-008** | Cross-Browser Compatibility: Apple Safari / WebKit | WebKit browser | 1. Execute end-to-end flow in WebKit | All inputs, date pickers, and password eye toggles render cleanly. | High | Automated |
| **TC-UX-009** | Mobile Safari (iOS Viewport Emulation) | iPhone 14 profile | 1. Execute signup flow on mobile viewport | Virtual keyboard does not cover action buttons; inputs do not zoom viewport inappropriately (font >= 16px). | High | Automated |
| **TC-UX-010** | High DPI / Retina Screen Rendering | 2x scaling | 1. Inspect logo, icons, and SVG graphics | Logos, badges, and stepper icons render sharply without pixelation or artifacting. | Low | Visual QA |

---

## 14. Module 12: Healthcare Regulatory, Compliance & Data Governance

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Priority | Type |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-CMP-001** | HIPAA Compliance: Doctor Credential Encryption in Transit | Network capture | 1. Submit signup form<br>2. Inspect TLS configuration | All traffic is encrypted over TLS 1.3 with strong cipher suites; HTTP redirects to HTTPS. | Critical | Compliance |
| **TC-CMP-002** | HIPAA Compliance: Password Storage Hashing Standard | Database level | 1. Inspect user password hash in DB | Passwords are salted and hashed using bcrypt (cost >= 12) or Argon2; no plaintext passwords. | Critical | DB Audit |
| **TC-CMP-003** | SLMC Medical Council License Verification Workflow | Step 1 signup | 1. Submit valid doctor registration<br>2. Inspect doctor status | System flags doctor profile with verified or pending SLMC verification status. | Critical | Business Logic |
| **TC-CMP-004** | GDPR / Personal Data Rights: Consent Checkbox Logging | EULA Step 2 | 1. Accept EULA<br>2. Check database consent record | Record stores doctor ID, timestamp, IP, version of terms accepted for legal traceability. | Critical | Legal Audit |
| **TC-CMP-005** | PCI-DSS Compliance: Zero Raw Card Data on Host Servers | Network inspect | 1. Inspect payment POST payload | Raw credit card number and CVC NEVER touch Amerck Care backend servers; handled directly by Stripe Elements. | Critical | Security Audit |
| **TC-CMP-006** | Patient Data Isolation / Multi-Tenancy Guard | Logged in doctor | 1. Access prescription dashboard<br>2. Verify patient list query | Doctor can ONLY view and issue prescriptions for their own practice; cross-tenant data leakage is prevented. | Critical | Functional/Sec |

---

## 15. Defect Severity & Priority Matrix

| Severity Level | Definition | SLA / Resolution Time | Action Required |
| :--- | :--- | :---: | :--- |
| **S1 - Blocker / Critical** | Total loss of core functionality (e.g., cannot complete signup, Stripe charge fails, XSS/SQLi vulnerability, unauthenticated access to prescription data). | < 4 Hours | Hotfix immediately; halts release. |
| **S2 - Major / High** | Significant feature impairment without workaround (e.g., EULA checkbox state lost on back navigation, password eye toggle broken, mobile layout blowout). | < 24 Hours | Must fix before deployment. |
| **S3 - Medium** | Non-critical functionality defect or edge case (e.g., hint text typo, secondary coupon code formatting, non-breaking alignment issue). | Sprint Cycle | Scheduled in current sprint. |
| **S4 - Minor / Low** | Cosmetic, minor UI polish, or subtle enhancement (e.g., hover transition timing, minor placeholder wording). | Backlog | Addressed as time permits. |

---

## 16. Execution Guide & Playwright NPM Scripts

```bash
# 1. Run the entire automated test suite (all 68 automated tests across 7 spec files)
npx playwright test

# 2. Run Step 1 UI & Field Layout Suite (9 tests)
npm run test:step1

# 3. Run Step 1 Form Validation & Boundary Suite (25 tests)
npm run test:validation

# 4. Run Step 2 Multi-Step & Subscription Package Suite (6 tests)
npm run test:multistep

# 5. Run Complete 4-Step Registration End-to-End Suite (4 tests)
npm run test:e2e

# 6. Run Doctor Onboarding (Profile Setup & EULA Agreement) Suite (5 tests)
npm run test:onboarding

# 7. Run Self-Registration Break, Adversarial & OWASP Suite (11 tests)
npm run test:break

# 8. Run Login Path Security, Resiliency & Brute-Force Suite (8 tests)
npm run test:login:break

# 9. Run in headed browser mode (visual observation)
npm run test:headed

# 10. Open Playwright Interactive UI Mode (Time-travel debugger)
npm run test:ui

# 11. Generate and view HTML Test Report
npm run test:report
```
