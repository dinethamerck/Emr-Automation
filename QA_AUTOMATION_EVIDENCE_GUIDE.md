# QA Automation Evidence Collection & Preservation Guide
**Project:** Amerck Care EMR & Amaran Automation Test Suite  
**Role:** Senior QA Automation Engineer  

---

## 1. Overview & Architecture

This automation suite is configured to **permanently preserve 100% of test execution evidence** across all test runs. Evidence is never overwritten, and every UI test execution records the full browser interaction session as a `.webm` video for both **PASSED** and **FAILED** tests.

### Evidence Architecture Flow

```
+-------------------------------------------------------------------------------+
|                      Playwright Test Execution Suite                          |
|  use: { screenshot: 'on', video: 'on', trace: 'on' }                          |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|                     utils/evidenceReporter.js (Custom Reporter)               |
|  - Tracks test lifecycle (onBegin, onTestBegin, onStepEnd, onTestEnd, onEnd)  |
|  - Collects test status, durations, errors, steps, console logs               |
|  - Extracts raw video (.webm), screenshot (.png), and trace (.zip) files     |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|                     utils/evidenceArchiver.js & sanitizer.js                  |
|  - Redacts sensitive credentials, tokens, and payment card details            |
|  - Creates unique timestamped vault: QA-Automation-Evidence/<timestamp>/     |
|  - Uniquely renames and copies all videos, screenshots, and traces           |
|  - Generates Standalone HTML Dashboard (with native video players)            |
|  - Generates SHA-256 Checksum Manifest (evidence-manifest.json)               |
|  - Compresses execution into complete-evidence.zip                            |
|  - Updates Master Historical Catalog (QA-Automation-Evidence/index.html)     |
+-------------------------------------------------------------------------------+
```

---

## 2. Playwright Core Configuration

In [`playwright.config.js`](file:///c:/Users/LENOVO/Desktop/EMR/playwright.config.js):

```javascript
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker avoids concurrency race conditions
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['./utils/evidenceReporter.js'] // Automated permanent archiver
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://qa_care.amerck.com',
    headless: process.env.HEADLESS !== 'false',
    trace: 'on',         // Records complete trace for every test
    screenshot: 'on',    // Captures screenshot at completion of every test
    video: 'on',         // Records video from start to finish for every test
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  // ...
});
```

---

## 3. Permanent Evidence Vault Structure

Every test execution automatically creates a new timestamped directory inside `QA-Automation-Evidence/`:

```text
QA-Automation-Evidence/
├── index.html                                 <-- Master Historical Catalog of all runs
├── 2026-10-22_14-23-02/                       <-- Unique Timestamped Execution Run
│   ├── single-file-evidence-report.html      <-- 100% SELF-CONTAINED (BEST FOR SHARING! All videos embedded)
│   ├── index.html                             <-- Standalone Evidence Dashboard (with Expand All)
│   ├── view-report.bat                        <-- Windows 1-Click Launcher
│   ├── README.txt                             <-- Recipient instructions
│   ├── complete-evidence.zip                 <-- Standalone compressed package containing all files
│   ├── evidence-manifest.json                 <-- Audit manifest with SHA-256 hashes
│   ├── test-results.json                      <-- Structured results, metadata & steps
│   ├── execution.log                          <-- Formatted test execution logs
│   ├── playwright-report/                     <-- Complete Playwright HTML report
│   └── test-results/
│       ├── videos/                            <-- Descriptive uniquely-named .webm videos
│       ├── screenshots/                       <-- Uniquely-named screenshots (.png)
│       └── traces/                            <-- Playwright zip traces
└── ...
```

---

## 4. Evidence Assets Captured Per Test

| Evidence Type | File Format | Location in Archive | Description |
| :--- | :--- | :--- | :--- |
| **All-In-One Portable Report** | `.html` | `single-file-evidence-report.html` | **Single-file report with ALL videos (.webm) and screenshots embedded directly as Base64 data.** Can be sent as a single email attachment or Slack message. Requires zero extraction and zero web server. |
| **Screen Recording** | `.webm` | `test-results/videos/` | Browser video recording capturing all clicks, text inputs, modal dialogues, page navigations, and animations from test start to test end. Saved for **both passed and failed** tests. |
| **Screenshot** | `.png` | `test-results/screenshots/` | High-resolution viewport screenshot captured at the final validation or failure point. |
| **Playwright Trace** | `.zip` | `test-results/traces/` | Complete interaction timeline, DOM snapshots before and after every action, network request/response headers and bodies, and console logs. |
| **Execution Log** | `.log` | `execution.log` | Step-by-step chronological log with timestamps, hooks, and assertion results. |
| **Structured Results**| `.json` | `test-results.json` | JSON output containing test ID, module name, status, duration, platform info, and step metrics. |
| **Integrity Manifest**| `.json` | `evidence-manifest.json` | List of every file in the vault with byte sizes, MIME types, and cryptographic SHA-256 checksums. |
| **ZIP Archive** | `.zip` | `complete-evidence.zip` | Single compressed package containing the entire vault for sharing, archival, or regulatory compliance. |

---

## 5. How to Share Evidence with Another Person

### Why did other people see "no evidence" previously?
1. **Playwright's default `playwright-report/index.html` blocks local `file://` access**: Modern browsers (Chrome, Edge, Safari) block JavaScript fetches across local files due to CORS policy (`origin 'null'`).
2. **Opening HTML files directly inside a ZIP without extracting**: When someone double-clicks an HTML file directly inside Windows Explorer's ZIP preview, Windows only extracts the HTML into a temporary folder, omitting the `test-results/videos/` subfolder, causing video files to fail to load.

### The Solution: 2 Easy Ways to Share

#### Option 1: Send the Single Portable Report File (Recommended & Easiest)
1. Send just **`single-file-evidence-report.html`** (or click **"Download Single-File Report"**).
2. The recipient double-clicks the file.
3. **All videos, screenshots, and test logs load instantly on ANY device** (Windows, Mac, iPhone, Android) without needing any ZIP extraction or web server!

#### Option 2: Send the ZIP File
1. Send **`complete-evidence.zip`**.
2. Tell the recipient:
   - **Right-click the ZIP -> "Extract All..."**
   - Double-click **`single-file-evidence-report.html`** or **`view-report.bat`**.


---

## 6. Security and Compliance Safeguards

1. **Credential & Sensitive Data Redaction**:
   - [`utils/sanitizer.js`](file:///c:/Users/LENOVO/Desktop/EMR/utils/sanitizer.js) scans all logs and JSON files before writing to disk.
   - Passwords, bearer tokens, API keys, CVVs, and test credit card numbers are masked with `[REDACTED_FOR_SECURITY]` or `[REDACTED_PASSWORD]`.
2. **Assertion Integrity**:
   - The test reporter strictly preserves test outcomes. Failed tests are recorded as `failed` with stack traces and assertion messages; they are never artificially marked as passed.
3. **Data Integrity & Non-Repudiation**:
   - `evidence-manifest.json` records the SHA-256 hash of each file immediately upon creation. Any modification or tampering with recorded videos or logs will invalidate the checksum.

---

## 7. Technical Distinctions & Browser Recording Scope

- **Browser Context Screen Recording**:
  Playwright's `video: 'on'` records the internal browser context viewport. This records everything that occurs inside the browser window (page navigation, DOM interaction, dropdowns, canvas, typing, dialogs, alerts) with high fidelity and zero overhead on the host OS.
- **Full Desktop Screen Recording Distinction**:
  Playwright does not record areas outside the browser window (such as the Windows taskbar, desktop background, or other OS applications). If whole-desktop OS screen capture is required for specific regulatory demands, it can be run via external tools (e.g., FFmpeg screen capture or OBS) without interfering with Playwright.
