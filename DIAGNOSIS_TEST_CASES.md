# Amerck Care & Amaran EMR - Master Clinical Diagnosis Test Specification & Quality Matrix

## 1. Executive Summary & Clinical Quality Strategy
- **Application Under Test (AUT)**: Amerck Care EMR — Clinical Diagnosis Module (`/admin/diagnosis`) & Care View Consultation Diagnosis Engine (`/admin/prescription`)
- **System Dual-Persona Perspective**:
  1. **Doctor / Clinical Pathologist**: Diagnostic coding accuracy (ICD-10, ICD-11, SNOMED-CT), acute vs chronic classification, differential diagnosis evaluation, clinical decision support (CDS) contraindication linkage (e.g., Asthma contraindicating Beta-Blockers, Gout contraindicating Thiazides), communicable disease statutory reporting, and longitudinal medical problem list continuity.
  2. **Senior QA Automation Architect**: State transition modeling, search debouncing and substring querying, tagging tokenization (Enter key, comma separation, chip removal), concurrency across clinical encounters, cross-tab persistence (`Today` vs `Story`), XSS/SQLi injection defense, and HIPAA / 21 CFR Part 11 audit compliance.

---

## 2. Master Test Suite Architecture & Coverage Summary

| Suite # | Functional Area / Sub-Module | Test Scope & Clinical Purpose | Total Cases | Priority Breakdown | Execution Type |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | **Diagnosis Directory Navigation & UI Layout** | Route `/admin/diagnosis`, navbar icon, header branding, and responsive layout | 6 | 4 Crit, 2 High | Automated |
| **02** | **ICD-10 / ICD-11 Coded & Free-Text Catalog CRUD** | Standardized ICD-10 lookup, custom practice codes, category mapping, and soft deactivation | 10 | 7 Crit, 3 High | Automated |
| **03** | **Care View Consultation Real-Time Tagging** | Enter key / comma tokenization, duplicate prevention, chip deletion, and empty states | 12 | 8 Crit, 4 High | Automated |
| **04** | **Acute vs Chronic Disease & Problem List Lifecycle** | Long-term chronic condition registry, active vs resolved state, onset date tracking | 8 | 6 Crit, 2 High | Automated |
| **05** | **Diagnosis-Linked Clinical Decision Support (CDS)** | Disease-drug contraindications (Asthma + Beta-Blocker, PUD + NSAID, CKD + Metformin) | 12 | 11 Fatal/Crit, 1 High | Automated / CDS |
| **06** | **Communicable & Statutory Notifiable Disease Alerts** | Mandatory reporting flags (Dengue, Tuberculosis, Malaria, Cholera) to public health | 6 | 5 Fatal/Crit, 1 High | Clinical / System |
| **07** | **Longitudinal Story Tab Persistence & History** | Cross-tab synchronization (`Today` ↔ `Story`), consultation auto-save, and medical problem log | 8 | 6 Crit, 2 High | Automated |
| **08** | **RBAC, Security, Sanitization & Audit Compliance** | Doctor vs Nurse access, SQLi/XSS prevention in diagnosis notes, immutable audit trail | 8 | 6 Crit, 2 High | Security / Pentest |
| **TOTAL** | **Enterprise Clinical Diagnosis Suite** | **Complete Clinical & Technical Lifecycle** | **70** | **53 Fatal/Crit, 17 High** | **Full Coverage Matrix** |

---

## 3. Module 1: Diagnosis Directory Navigation & Header Architecture

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DX-NAV-001** | Direct Navigation to Diagnosis Module via Top Navbar | Doctor logged in on Care View (`/admin/prescription`) | 1. Locate Diagnosis icon in top navigation bar<br>2. Click Diagnosis link<br>3. Verify route and header | Target: `a[href*="/admin/diagnosis"]` | System transitions smoothly to `/admin/diagnosis`; page header displays Diagnosis Directory; URL reflects active path. | Critical | Automated |
| **TC-DX-NAV-002** | Return to Care View from Diagnosis Module | Doctor on `/admin/diagnosis` | 1. Click Care View stethoscope icon in top navbar | Target: `a[href*="/admin/prescription"]` | System returns immediately to active Care View consultation portal without session drop or re-authentication. | Critical | Automated |
| **TC-DX-NAV-003** | Unauthenticated Access Guard on `/admin/diagnosis` | Clean incognito browser without auth cookie | 1. Browse directly to `https://qa_care.amerck.com/admin/diagnosis` | URL: `/admin/diagnosis` | Auth router immediately intercepts and redirects unauthenticated request to `/login`; zero clinical data leakage. | Critical | Automated |
| **TC-DX-NAV-004** | Active Practice Tenancy Scoping in Diagnosis Catalog | Doctor belongs to multiple practices | 1. Inspect practice switcher combobox in navbar<br>2. Verify diagnosis formulary is strictly scoped to active clinic | Practice: `Dr. John's Clinic` | Diagnoses and custom favorites display only data belonging to active practice tenancy. | High | Automated |
| **TC-DX-NAV-005** | Browser Tab Title & Meta Standardization | On `/admin/diagnosis` | 1. Inspect browser tab title and metadata | Page Title | Tab title contains: *"Amerck Care - Diagnosis Directory"* or standard EMR brand title. | Medium | Automated |
| **TC-DX-NAV-006** | Responsive Viewport Layout (Desktop vs Tablet/Mobile) | Browser resized to 768px (iPad/Tablet view) | 1. Inspect Diagnosis navbar and layout at 768x1024 | Viewport: `768x1024` | Navbar collapses cleanly into hamburger/drawer icon; diagnosis list remains scrollable and fully accessible. | High | Automated |

---

## 4. Module 2: ICD-10 / ICD-11 Coded & Free-Text Catalog CRUD

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DX-CAT-001** | Add New Standardized Diagnosis with ICD-10 Code | Doctor on `/admin/diagnosis` | 1. Click *"Add Diagnosis"*<br>2. Enter Diagnosis Name<br>3. Enter valid ICD-10 Code<br>4. Select Specialty Category<br>5. Save | Name: `Essential Hypertension`<br>ICD-10: `I10`<br>Category: `Cardiology` | Diagnosis is saved to practice directory; displays ICD-10 badge `I10`; immediately searchable in Care View consultation combobox. | Critical | Automated |
| **TC-DX-CAT-002** | Fast Substring & ICD-10 Code Search | 1000+ diagnoses loaded | 1. Type partial ICD code `E11`<br>2. Observe instant results<br>3. Type partial text `diabet` | Code: `E11`<br>Query: `diabet` | System filters in < 100ms; displays `Type 2 Diabetes Mellitus (E11.9)` and related sub-classifications. | Critical | Automated |
| **TC-DX-CAT-003** | Free-Text / Provisional Diagnosis Creation | Clinical term not yet formalized in standard ICD | 1. Click Add Diagnosis<br>2. Enter provisional condition name<br>3. Leave ICD code blank or marked `Unspecified / R69` | Name: `Undifferentiated Viral Exanthem`<br>Code: `R69` | System permits saving provisional diagnosis with clear *"Unspecified / Clinical Term"* indicator; does not block doctor workflow. | High | Automated |
| **TC-DX-CAT-004** | Duplicate Diagnosis Code Prevention Rule | Diagnosis `I10 - Essential Hypertension` exists | 1. Click Add Diagnosis<br>2. Enter duplicate code `I10` with same clinical description | Name: `Essential Hypertension`<br>Code: `I10` | System blocks submission with validation: *"Diagnosis with ICD code I10 already exists in practice catalog"*. | High | Automated |
| **TC-DX-CAT-005** | Soft Deactivation vs Disallowed Hard Deletion | Diagnosis linked to historical patient consultations | 1. Locate diagnosis used in past records<br>2. Attempt deletion | Target: `Asthma (J45.909)` | System prohibits SQL hard delete; provides *"Archive / Deactivate"*; past patient clinical story preserves diagnosis; hidden from future consults. | Critical | Automated |
| **TC-DX-CAT-006** | Specialty / Body System Category Filtering | Doctor on `/admin/diagnosis` | 1. Select Category filter: `Respiratory`<br>2. Inspect results | Category: `Respiratory` | List displays only respiratory diagnoses (`J06.9 Acute URI`, `J45 Asthma`, `J18 Pneumonia`); non-respiratory items hidden. | High | Automated |
| **TC-DX-CAT-007** | Chronic Condition Flagging on Diagnosis Master | Add Diagnosis modal open | 1. Check box: `Chronic Condition / Long-term Management`<br>2. Save diagnosis | Name: `Type 2 Diabetes Mellitus`<br>Flag: `Chronic` | Diagnosis is tagged with permanent blue/purple *"Chronic"* badge; auto-hydrates patient's ongoing Medical Problem list. | Critical | Automated |
| **TC-DX-CAT-008** | Clinical Criteria & Diagnostic Diagnostic Guidelines | Add Diagnosis modal open | 1. Enter diagnostic criteria in Clinical Notes field<br>2. Save | Criteria: `BP >= 140/90 mmHg on two separate clinical occasions` | Guidance notes are visible upon hover/info click in Care View to assist junior physicians and clinical interns. | Medium | Clinical |
| **TC-DX-CAT-009** | Bulk ICD-10 Practice Formulary Import (CSV) | Tools menu | 1. Upload 100-item standard WHO ICD-10 CSV file<br>2. Verify batch insertion | File: `icd10_common_general_practice.csv` | All 100 diagnoses parsed, validated, and indexed in < 2 seconds with zero catalog corruption. | High | Automated |
| **TC-DX-CAT-010** | Dual SNOMED CT and ICD-10 Interoperability Mapping | Enterprise EMR mode | 1. Add diagnosis with both ICD-10 and SNOMED-CT code | Name: `Myocardial Infarction`<br>ICD-10: `I21.9`<br>SNOMED: `22298006` | Both terminologies saved; ensures HL7 FHIR and electronic health exchange interoperability. | High | Spec / Audit |

---

## 5. Module 3: Care View Consultation Real-Time Tagging & Tokenization

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DX-RX-001** | Add Diagnosis via Enter Key Tokenization | Patient details entered in Care View (`/admin/prescription`) | 1. Click diagnosis textbox<br>2. Type `Tension Headache`<br>3. Press `Enter` key | Input: `Tension Headache` | System immediately converts text into an interactive chip tag: `[Tension Headache ×]`; textbox clears and readies for next input. | Critical | Automated |
| **TC-DX-RX-002** | Add Multiple Diagnoses via Comma Separation | Patient active in Care View | 1. Type `Bronchitis, Allergic Rhinitis, Eczema`<br>2. Press Enter or tab out | Input: `Bronchitis, Allergic Rhinitis, Eczema` | System parses comma-delimited string into 3 distinct individual chips: `[Bronchitis]`, `[Allergic Rhinitis]`, `[Eczema]`. | Critical | Automated |
| **TC-DX-RX-003** | Remove Individual Diagnosis Chip via Close Icon | 3 diagnosis chips in consultation | 1. Click the `×` (close icon) on `[Allergic Rhinitis]` chip | Target: `Allergic Rhinitis` | Only `Allergic Rhinitis` is removed; remaining chips `[Bronchitis]` and `[Eczema]` remain intact; consultation state updates. | Critical | Automated |
| **TC-DX-RX-004** | Prevent Duplicate Diagnosis in Same Consultation | Diagnosis `Hypertension` already tagged | 1. Attempt to type and add `Hypertension` again | Input: `Hypertension` | System detects duplicate; suppresses creation of redundant chip; highlights existing tag with subtle micro-animation. | High | Automated |
| **TC-DX-RX-005** | Care View Initial Empty State (No Patient Selected) | Care View open; no patient selected | 1. Inspect diagnosis section | No patient active | Diagnosis input shows disabled placeholder: *"Enter patient details to add diagnosis."*; prevents ghost data entry. | High | Automated |
| **TC-DX-RX-006** | Care View Empty State (Patient Active, No Diagnosis Yet) | Patient selected; 0 diagnoses entered | 1. Inspect consultation diagnosis block | Active patient | Displays subtle prompt: *"No diagnosis specified"* with clean styling; indicates consultation is currently non-diagnostic. | Medium | Automated |
| **TC-DX-RX-007** | Auto-Complete Suggestions from Practice Directory | Doctor typing in diagnosis textbox | 1. Type `Hypert` in diagnosis input<br>2. Observe dropdown list | Query: `Hypert` | Autocomplete menu appears with matching catalog entries: `Essential Hypertension (I10)`, `Secondary Hypertension (I15)`. | Critical | Automated |
| **TC-DX-RX-008** | Primary vs Secondary / Comorbid Diagnosis Hierarchy | 3 diagnoses added | 1. Drag or select first chip as Primary Diagnosis | Diagnoses: `1. Acute Appendicitis (Primary)`, `2. Type 2 Diabetes`, `3. Obesity` | Primary diagnosis is highlighted with bold badge; prints prominently on prescription header and referral letters. | High | Automated |
| **TC-DX-RX-009** | Whitespace Trimming & Special Character Sanitization | Doctor enters messy string | 1. Type `  Acute Tonsillitis   `<br>2. Press Enter | Input: `  Acute Tonsillitis   ` | System automatically trims leading and trailing whitespace; stores clean chip: `[Acute Tonsillitis]`. | Medium | Automated |
| **TC-DX-RX-010** | Very Long Diagnosis Description Handling | Complex pathological description | 1. Enter 120-character diagnosis string | Input: `Poorly differentiated adenocarcinoma of the gastroesophageal junction with regional lymph node metastasis` | Tag container wraps gracefully with ellipsis or auto-multiline; zero UI breakage or layout overflow. | High | Automated |
| **TC-DX-RX-011** | Quick-Pick Favorites 1-Click Addition | Common diagnosis quick-picks visible | 1. Click quick-pick pill: `[+ URTI]` | Target: `URTI` | `Upper Respiratory Tract Infection` instantly tags into consultation grid with 0 keyboard strokes. | High | Automated |
| **TC-DX-RX-012** | Clearing Consultation Clears All Diagnosis Chips | 3 diagnoses active | 1. Click Consultation Reset / Clear | 3 active tags | All diagnosis chips are cleared cleanly; returns to *"No diagnosis specified"* state. | Medium | Automated |

---

## 6. Module 4: Acute vs Chronic Disease & Problem List Lifecycle

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DX-CHR-001** | Chronic Diagnosis Promoted to Right Clinical Context Panel | Doctor enters chronic diagnosis in consultation | 1. Add diagnosis: `Type 2 Diabetes Mellitus`<br>2. Observe Right Context Panel | Diagnosis: `Type 2 Diabetes` | System auto-creates entry in Right Panel under **Medical/Surgical Problems**: `Type 2 Diabetes` with onset date pre-filled to today. | Critical | Automated |
| **TC-DX-CHR-002** | Acute Self-Limiting Condition Remains Episode-Specific | Doctor enters acute diagnosis | 1. Add diagnosis: `Acute Viral Gastroenteritis`<br>2. Finalize consultation<br>3. Open new encounter next month | Diagnosis: `Acute Gastroenteritis` | Condition is archived under historical visit story; does NOT permanently clutter active lifelong chronic problem list. | High | Automated |
| **TC-DX-CHR-003** | Medical Problem Status Transition (Active → Resolved → In Remission) | Patient with past Medical Problem | 1. Open Right Panel Medical Problems<br>2. Change status of `Iron Deficiency Anemia` to `Resolved`<br>3. Enter resolution date | Condition: `Iron Deficiency Anemia`<br>New Status: `Resolved` | Condition moves to Resolved section with strike-through or green checkmark; historical clinical audit trail preserved. | High | Automated |
| **TC-DX-CHR-004** | Medical Problem Since / Duration Tracking | Doctor documenting chronic illness | 1. Enter condition: `Osteoarthritis`<br>2. Enter duration: `5 years` | Condition: `Osteoarthritis`<br>Since: `5 years` | Duration is displayed cleanly next to problem in consultation summary: `Osteoarthritis (Since 5 years)`. | Medium | Automated |
| **TC-DX-CHR-005** | Chronic Disease Management Register Auto-Enrollment | Doctor diagnoses `Hypertension (I10)` | 1. Finalize consultation with diagnosis `Hypertension` | Diagnosis: `I10` | Patient is automatically flagged in Practice Chronic Disease Register for periodic BP monitoring and follow-up recall. | High | System / Spec |
| **TC-DX-CHR-006** | Problem List Synchronization across Multi-Doctor Practice | Patient seen by Doctor A in Room 1, then Doctor B in Room 2 | 1. Doctor A adds `COPD` to problem list<br>2. Doctor B opens patient profile in Room 2 | Condition: `COPD` | Doctor B immediately sees `COPD` in patient's active medical problems; ensures longitudinal care continuity. | Critical | Automated |
| **TC-DX-CHR-007** | Surgical History Separate from Medical Problems | Patient had appendectomy | 1. Enter `Appendectomy (Laparoscopic)` under Surgical History<br>2. Enter Year: `2018` | Surgery: `Appendectomy`<br>Year: `2018` | Saved under surgical history; clearly distinguished from ongoing active medical diseases. | Medium | Automated |
| **TC-DX-CHR-008** | Familial / Genetic Risk Factor Linking | Patient family history positive for Early CAD | 1. Tag diagnosis: `Coronary Artery Disease`<br>2. Link Family History: `Father had MI at age 42` | Risk: `Premature CAD` | Cardiovascular risk calculator elevates patient's baseline risk assessment score automatically. | High | Clinical |

---

## 7. Module 5: Diagnosis-Linked Clinical Decision Support (CDS Engine)

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DX-CDS-001** | Disease-Drug Contraindication: Asthma + Non-Selective Beta-Blocker | Patient diagnosed with `Asthma (J45)` | 1. Diagnosis `Asthma` active in Care View<br>2. Doctor attempts to prescribe `Propranolol 40mg` | Diagnosis: `Asthma`<br>Drug: `Propranolol` | System executes **FATAL CONTRAINDICATION ALERT**: *"Contraindicated: Non-selective Beta-blockers induce severe bronchospasm and fatal status asthmaticus in asthma patients"*; blocks script. | Fatal | Automated |
| **TC-DX-CDS-002** | Disease-Drug Contraindication: Peptic Ulcer Disease + NSAID | Patient has active `Peptic Ulcer Disease (K25)` | 1. Diagnosis `Peptic Ulcer Disease` active<br>2. Doctor attempts to prescribe `Diclofenac 50mg` or `Ibuprofen 400mg` | Diagnosis: `Peptic Ulcer`<br>Drug: `Diclofenac` | System generates **HIGH-SEVERITY CONTRAINDICATION**: *"Severe Risk: NSAIDs exacerbate gastrointestinal mucosal ulceration and can precipitate massive perforation/hemorrhage"*. | Fatal | Automated |
| **TC-DX-CDS-003** | Disease-Drug Contraindication: Gout + Thiazide Diuretics | Patient has active `Gout / Hyperuricemia (M10)` | 1. Diagnosis `Gout` active<br>2. Doctor prescribes `Hydrochlorothiazide 25mg` for BP | Diagnosis: `Gout`<br>Drug: `Hydrochlorothiazide` | System alerts: *"Advisory: Thiazide diuretics inhibit renal uric acid excretion and precipitate acute, painful gouty arthritis flares"*; suggests Calcium Channel Blocker or ARB. | Critical | Automated |
| **TC-DX-CDS-004** | Disease-Drug Contraindication: Severe Chronic Kidney Disease + Metformin | Patient has `Chronic Kidney Disease Stage 4 / 5` | 1. Diagnosis `CKD Stage 4` active<br>2. Doctor prescribes `Metformin 1000mg` | Diagnosis: `CKD 4`<br>Drug: `Metformin` | System executes **FATAL CONTRAINDICATION**: *"Metformin contraindicated in severe renal impairment (eGFR < 30 ml/min) due to high risk of fatal Lactic Acidosis"*. | Fatal | Automated |
| **TC-DX-CDS-005** | Disease-Drug Contraindication: Heart Failure + Non-Dihydropyridine CCB | Patient has `Heart Failure with Reduced Ejection Fraction (I50)` | 1. Diagnosis `Heart Failure` active<br>2. Doctor prescribes `Verapamil 80mg` or `Diltiazem` | Diagnosis: `Heart Failure`<br>Drug: `Verapamil` | System warns: *"Contraindicated: Verapamil exerts potent negative inotropic activity; exacerbates acute congestive heart failure decompensation"*. | Fatal | Automated |
| **TC-DX-CDS-006** | Disease-Drug Contraindication: Glaucoma (Angle-Closure) + Anticholinergics | Patient has `Closed-Angle Glaucoma (H40.2)` | 1. Diagnosis `Glaucoma` active<br>2. Doctor prescribes `Amitriptyline 25mg` or `Atropine` | Diagnosis: `Angle-Closure Glaucoma`<br>Drug: `Amitriptyline` | System warns: *"Contraindicated: Anticholinergic mydriasis precipitates acute pupillary block and sudden vision-threatening intraocular pressure spike"*. | Fatal | Automated |
| **TC-DX-CDS-007** | Disease-Drug Contraindication: Myasthenia Gravis + Fluoroquinolones | Patient has `Myasthenia Gravis (G70.0)` | 1. Diagnosis `Myasthenia Gravis` active<br>2. Doctor prescribes `Ciprofloxacin 500mg` | Diagnosis: `Myasthenia Gravis`<br>Drug: `Ciprofloxacin` | System displays **BLACK BOX WARNING**: *"Fluoroquinolones worsen muscle weakness and may trigger severe respiratory failure / myasthenic crisis"*. | Fatal | Automated |
| **TC-DX-CDS-008** | Diagnosis-Investigation Auto-Recommendations | Doctor enters diagnosis `Type 2 Diabetes Mellitus` | 1. Add diagnosis `Type 2 Diabetes`<br>2. Inspect Investigations section | Diagnosis: `Type 2 Diabetes` | System auto-suggests relevant clinical laboratory investigations: `HbA1c`, `Fasting Blood Glucose`, `Urine Microalbumin`, `Lipid Profile`. | High | Automated |
| **TC-DX-CDS-009** | Diagnosis-Investigation Recommendation: Chest Pain | Doctor enters diagnosis `Acute Coronary Syndrome / Chest Pain` | 1. Add diagnosis `Chest Pain (R07.9)`<br>2. Inspect Investigations | Diagnosis: `Chest Pain` | System recommends STAT tests: `12-Lead ECG`, `Troponin-I / Troponin-T`, `Chest X-Ray`. | Fatal | Clinical |
| **TC-DX-CDS-010** | Clinical Rationale Mandatory when Overriding Disease Contraindication | Doctor overrides severe disease-drug warning | 1. Click Override<br>2. Attempt submit without reason | Warning: `Asthma + Beta-Blocker` | System blocks submission until doctor selects structured clinical reason (e.g. *"Cardioselective beta-blocker deemed essential by cardiologist"*) and signs. | Critical | Automated |
| **TC-DX-CDS-011** | Differential Diagnosis Generation Engine | Doctor enters presenting symptoms | 1. Symptoms: `Fever, Jaundice, Right Upper Quadrant Pain` (Charcot's Triad) | Symptoms: `Fever + Jaundice + RUQ Pain` | System suggests differential diagnoses: `Acute Cholangitis`, `Cholecystitis`, `Viral Hepatitis`, `Biliary Colic`. | High | Clinical / AI |
| **TC-DX-CDS-012** | Red Flag Critical Symptom Warning Interception | Doctor enters symptom: `Sudden onset worst headache of life` | 1. Enter symptom: `Thunderclap Headache` | Symptom: `Thunderclap Headache` | System flashes **EMERGENCY RED FLAG**: *"Immediate emergency referral required: Exclude Subarachnoid Hemorrhage (SAH)"*. | Fatal | Clinical |

---

## 8. Module 6: Communicable & Statutory Notifiable Disease Alerts

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DX-NOT-001** | Statutory Notifiable Disease Trigger: Dengue Fever | Doctor in endemic jurisdiction | 1. Add diagnosis: `Dengue Fever (A90)`<br>2. Observe system notification | Diagnosis: `Dengue Fever` | System displays **PUBLIC HEALTH NOTIFICATION**: *"Statutory notifiable disease. Ministry of Health Form H544 reporting required within 24 hours"*; provides 1-click export. | Fatal | Automated |
| **TC-DX-NOT-002** | Statutory Notifiable Disease Trigger: Pulmonary Tuberculosis | Doctor diagnoses Tuberculosis | 1. Add diagnosis: `Pulmonary Tuberculosis (A15.0)` | Diagnosis: `Tuberculosis` | System flags: *"National TB Control notification mandatory. Immediate sputum AFB and contact tracing protocol activated"*. | Fatal | Clinical |
| **TC-DX-NOT-003** | Communicable Disease Isolation Advisory Notice | Doctor diagnoses `Varicella / Chickenpox` or `Measles` | 1. Add diagnosis: `Chickenpox (B01)` | Diagnosis: `Chickenpox` | Patient counseling sheet auto-prints: *"Mandatory home isolation until all lesions have crusted (minimum 5-7 days) to prevent public transmission"*. | High | Automated |
| **TC-DX-NOT-004** | Epidemic Cluster Tracking Anonymized Reporting | Multiple patients diagnosed with `Cholera` in same postal code | 1. 3 patients diagnosed with `Cholera` in 24 hours from same area | Diagnosis: `Cholera (A00)` | Epidemiological surveillance module alerts Chief Medical Officer of potential localized waterborne disease outbreak. | Fatal | System / Spec |
| **TC-DX-NOT-005** | Animal Bite / Rabies Post-Exposure Prophylaxis Protocol | Doctor diagnoses `Dog Bite / Animal Scratch` | 1. Add diagnosis: `Dog Bite (W54)` | Diagnosis: `Animal Bite` | System triggers Rabies PEP Protocol check: *"Determine Category II/III exposure. Administer Anti-Rabies Vaccine (ARV) + Rabies Immunoglobulin (RIG) without delay"*. | Fatal | Clinical |
| **TC-DX-NOT-006** | Accidental Disease Misclassification Safety Prompt | Doctor enters rare exotic disease code | 1. Doctor enters `Ebola Virus Disease (A98.4)` | Diagnosis: `Ebola` | System displays double-confirmation dialog: *"You have selected a biosafety level 4 pathogen. Confirm definitive diagnosis or select provisional viral illness"*. | High | Clinical |

---

## 9. Module 7: Longitudinal Story Tab Persistence & History

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DX-STY-001** | Cross-Tab Persistence: Diagnoses Retained When Switching to Story | Patient has 2 diagnoses in `Today` tab | 1. Add `Bronchial Asthma`<br>2. Switch to `Story` tab<br>3. Switch back to `Today` tab | Diagnosis: `Bronchial Asthma` | Diagnoses chips remain 100% intact; zero state loss or form reset during tab navigation. | Critical | Automated |
| **TC-DX-STY-002** | Consultation Finalization Saves Diagnosis to Patient Medical Timeline | Consultation finalized | 1. Sign and finalize consultation with diagnosis `Acute Otitis Media`<br>2. Open patient's `Story` tab | Diagnosis: `Acute Otitis Media` | New chronological timeline card appears under Story with Consultation Date, Doctor Name, and `Acute Otitis Media` badge. | Critical | Automated |
| **TC-DX-STY-003** | Historical Encounter Diagnosis Filter in Story Tab | Patient has 5 past visits across 2 years | 1. Open Story tab<br>2. Filter timeline by Diagnosis: `Hypertension` | Filter: `Hypertension` | Story tab collapses non-relevant visits; displays only the 3 consultations where Hypertension was addressed. | High | Automated |
| **TC-DX-STY-004** | Longitudinal Trend Tracking: Blood Pressure vs Hypertension Diagnosis | Patient diagnosed with Hypertension | 1. Inspect Story tab vitals trend line | Metric: `Systolic / Diastolic BP` | System renders longitudinal graph displaying BP values over time correlated with antihypertensive prescription adjustments. | High | Automated |
| **TC-DX-STY-005** | Re-Importing Historical Diagnosis into Current Encounter | Patient returning for chronic follow-up | 1. In Story tab, locate past diagnosis `Type 2 Diabetes`<br>2. Click *"Add to Today's Consultation"* | Target: `Type 2 Diabetes` | Condition is automatically copied into Today's consultation diagnosis chips with 1 click; saves doctor re-typing. | High | Automated |
| **TC-DX-STY-006** | Consultation Draft Auto-Save Preserves Diagnosis Chips | Doctor fills diagnoses; browser crashes or network drops | 1. Add 2 diagnoses<br>2. Simulate unexpected browser reload (`page.reload()`) | 2 active tags | Consultation draft restore prompt allows restoring all diagnosis tags without re-entry. | Critical | Automated |
| **TC-DX-STY-007** | Referral Letter Auto-Population with Active Diagnoses | Doctor generates referral letter | 1. Click *"Generate Referral Letter"*<br>2. Inspect generated draft | Active diagnoses | Letter automatically inserts patient's primary diagnosis, comorbidities, and active medication list. | High | Automated |
| **TC-DX-STY-008** | Multi-Encounter Diagnosis Resolution Tracking | Patient acute bronchitis resolved on review visit | 1. On follow-up consult (Day 14), mark `Acute Bronchitis` as `Resolved` | Status: `Resolved` | Timeline updates: Episode marked closed with duration: 14 days; active encounter marked clean. | Medium | Automated |

---

## 10. Module 8: Role-Based Access Control, Security & Audit Compliance

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-DX-SEC-001** | Role-Based Access: Receptionist Restricted from Altering Diagnoses | User logged in as `Receptionist` | 1. Navigate to Care View consultation<br>2. Attempt to add or remove diagnosis | Role: `Receptionist` | Diagnosis textbox is disabled or hidden; direct API POST returns `403 Forbidden`. | Critical | Automated |
| **TC-DX-SEC-002** | Role-Based Access: Doctor Authorized for Full Diagnostic Life Cycle | User logged in as `Doctor` | 1. Add, edit, and resolve diagnoses | Role: `Doctor` | Doctor has full read/write authority to manage diagnoses, problem lists, and overrides. | Critical | Automated |
| **TC-DX-SEC-003** | SQL Injection Defense in Diagnosis Search Combobox | Attacker in diagnosis input | 1. Input SQL injection payloads into diagnosis search | Payload: `' OR '1'='1' --` | Parameterized prepared statements sanitize input; returns 0 matches or literal match; zero database error leakage. | Critical | Security / Pentest |
| **TC-DX-SEC-004** | Stored XSS Defense in Diagnosis Description & Notes | Attacker creating custom diagnosis | 1. Enter malicious XSS script into Diagnosis Name | Payload: `<img src=x onerror=alert(document.cookie)>` | System sanitizes and escapes all HTML entities; script rendered harmlessly as plain text string; zero DOM execution. | Critical | Security / Pentest |
| **TC-DX-SEC-005** | Tamper-Evident Immutable Medical Record Audit Trail | Any diagnosis added or removed | 1. Add diagnosis `HIV Positive`<br>2. Inspect audit database log | Action: `Add Diagnosis` | Immutable audit log created: Timestamp, Doctor User ID, Patient ID, Diagnosis, IP Address, SHA-256 hash (21 CFR Part 11). | Fatal | Audit |
| **TC-DX-SEC-006** | Patient Health Information (PHI) De-Identification in Reports | Exporting diagnostic epidemiology report | 1. Export Diagnostic Prevalence CSV | Report: `Prevalence` | Patient names and identifiable identifiers are masked according to HIPAA Safe Harbor de-identification standards. | High | Audit |
| **TC-DX-SEC-007** | Insecure Direct Object Reference (IDOR) on Diagnosis API | Attacker intercepts request | 1. Intercept `POST /api/consultation/diagnosis`<br>2. Attempt to modify another practice's consultation | Target: `Practice B` | System validates JWT session tenancy; request rejected with `403 Unauthorized`. | Critical | Security / Pentest |
| **TC-DX-SEC-008** | Medical Diagnosis Deletion Audit (No Silent Erasing) | Doctor removes diagnosis from finalized chart | 1. Request correction of misdiagnosed condition | Correction: `Pneumonia -> Bronchitis` | System records both original diagnosis, correcting physician, timestamp, and formal reason for correction; never silently erased. | Fatal | Audit |

---

## 11. Traceability Matrix: Clinical Safety vs Automated Test Suite

```
                                    +-----------------------------------------------+
                                    |         CLINICAL DIAGNOSIS LIFE CYCLE         |
                                    +-----------------------------------------------+
                                                           |
         +---------------------------------+---------------+---------------------------------+
         |                                 |                                                 |
         v                                 v                                                 v
+-----------------------+       +-----------------------+                         +-----------------------+
|  PATIENT SAFETY (CDS) |       | CARE VIEW CONSULTATION|                         |  PUBLIC HEALTH & LAW  |
+-----------------------+       +-----------------------+                         +-----------------------+
| - Asthma + Beta-Block |       | - Enter Tokenization  |                         | - Dengue Notification |
|   (TC-DX-CDS-001)     |       |   (TC-DX-RX-001)      |                         |   (TC-DX-NOT-001)     |
| - PUD + NSAID Bleed   |       | - Comma Parsing       |                         | - TB Protocol Flag    |
|   (TC-DX-CDS-002)     |       |   (TC-DX-RX-002)      |                         |   (TC-DX-NOT-002)     |
| - CKD 4 + Metformin   |       | - Cross-Tab Memory    |                         | - Tamper Audit Trail  |
|   (TC-DX-CDS-004)     |       |   (TC-DX-STY-001)     |                         |   (TC-DX-SEC-005)     |
| - Red Flag Intercept  |       | - Right Problem Panel |                         | - PHI HIPAA Masking   |
|   (TC-DX-CDS-012)     |       |   (TC-DX-CHR-001)     |                         |   (TC-DX-SEC-006)     |
+-----------------------+       +-----------------------+                         +-----------------------+
```

---

## 12. Conclusion & Clinical Sign-Off Criteria

### Definition of Done (DoD) for Diagnosis Module:
1. **Zero High-Severity Clinical Safety Bypasses**: Disease-drug contraindications (e.g. Asthma contraindicating Beta-Blockers) must execute without exception.
2. **100% Traceability & Evidence**: All automated tests pass with video recordings (`.webm`), traces (`.zip`), screenshots (`.png`), and SHA-256 manifests.
3. **Audit Compliance**: Every diagnostic modification must be immutably recorded with doctor ID and timestamp meeting 21 CFR Part 11 and HIPAA.
4. **Clinical Ergonomics**: In-consultation diagnosis entry via Enter key or comma separation must complete in `< 200 milliseconds` without blocking clinical consultation pace.
