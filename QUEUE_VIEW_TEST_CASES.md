# Amerck Care EMR - Queue View Specification & Quality Matrix

## 1. Executive Summary & Dual-Persona Quality Strategy
- **Application Under Test (AUT)**: Amerck Care EMR — Queue View (`/admin/queue-view`), the full-screen waiting-room display that shows which token is being served, by which doctor, in which room.
- **How the page works** (from its JavaScript bundle and observed traffic):
  1. It connects to a socket.io server (`wss://pg-socket-emr-dev.amerck.care`) with `org_id` and the session token.
  2. It emits `join-queue-room` with `{ org_id, date }` (today, local date).
  3. It renders every `queue-view-updated` event whose `date` and `org_id` match: token, doctor name + qualification, room (default *OPD*) and patient name.
  4. On load it also calls `GET /api/queue/current-patient` to show a patient already being served.
- **Why a fake server**: The realtime server is unreachable on QA (the display shows *"Failed to connect to server"*). The suite therefore replaces it with a fake socket.io server using Playwright `page.routeWebSocket`, so the "now calling" behaviour can be tested deterministically. The idle, no-server state is also covered in `dashboard.spec.js` (TC-DSH-QUE-001/002).
- **System Perspectives**:
  1. **Doctor / Healthcare Clinician Perspective**: Patients see the correct token, doctor and room for **their own practice and day**, and staff can tell when the display has lost its connection.
  2. **Senior QA Automation Architect Perspective**: Socket protocol contract (room join), event rendering, practice/date isolation, initial-state API.
- **Safety**: Nothing is sent to the real queue server; no data is created or changed.

---

## 2. Master Test Suite Architecture & Coverage Summary

| Suite # | Functional Area / Sub-Module | Test Scope & Clinical Purpose | Total Cases | Priority Breakdown | Execution Type |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | **Connection** | Unreachable server notice; room join contract | 2 | 2 High | Automated |
| **02** | **Calling Patients** | Now Serving card, OPD default, practice and date isolation, consecutive calls | 5 | 2 Crit, 2 High, 1 Medium | Automated |
| **03** | **Initial State** | Patient already being served when the display opens | 1 | 1 Medium | Automated |
| **TOTAL** | **Queue View Suite** | **Waiting-room display** | **8** | **2 Crit, 4 High, 2 Medium** | **8 Automated** |

---

## 3. Module 1: Connection

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-QV-CON-001** | Unreachable server shows a connection error | Fake server closes every connection | 1. Open Queue View | N/A | *"Failed to connect to server"* and *"Attempting to reconnect..."*; waiting card shown; no Now Serving card. | High | Automated |
| **TC-QV-CON-002** | Display joins today's room for its practice | Fake server accepts | 1. Open Queue View | Practice `org_id` from session; today's date | Socket URL carries `org_id`; client emits `join-queue-room` `{"org_id":<org>,"date":"<YYYY-MM-DD>"}`; *"Waiting for Next Patient"* shown; no connection error. | High | Automated |

---

## 4. Module 2: Calling Patients

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-QV-CALL-001** | Called patient is shown as Now Serving | Display joined room | 1. Server sends `queue-view-updated` | Token 7; Dr. PW Tester, MBBS; Room 3; PW Patient | *"Now Serving"*, *"TOKEN #7"*, Doctor *"Dr. PW Tester, MBBS"*, Location *"Room 3"*, Patient *"PW Patient"*; waiting card hidden. | Critical | Automated |
| **TC-QV-CALL-002** | Missing room defaults to OPD | Display joined room | 1. Server sends a call without `room` | Token 7 | Location *"OPD"*. | Medium | Automated |
| **TC-QV-CALL-003** | Calls for another practice are ignored | Display joined room | 1. Server sends a call with a different `org_id` | `org_id + 1` | Display keeps waiting; no Now Serving card. | Critical | Automated |
| **TC-QV-CALL-004** | Calls for another date are ignored | Display joined room | 1. Server sends a call dated yesterday | Yesterday's date | Display keeps waiting; no Now Serving card. | High | Automated |
| **TC-QV-CALL-005** | Next call replaces the previous one | Token 7 shown | 1. Server sends token 8 | Token 8; Room 5; PW Second Patient | *"TOKEN #8"*, Location *"Room 5"*, Patient *"PW Second Patient"*. | High | Automated |

---

## 5. Module 3: Initial State

| Test Case ID | Test Scenario | Preconditions | Test Steps | Clinical Test Data | Expected Clinical & Technical Result | Severity | Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-QV-API-001** | Display opened mid-session shows the current patient | `GET /api/queue/current-patient` mocked: token 12 | 1. Open Queue View | Token 12; Dr. PW Tester, MBBS; Room 2 | *"TOKEN #12"*, doctor and room shown without any live event. | Medium | Automated |

---

## 6. Observations Found During Automation

| ID | Linked Test | Summary | Observation | Recommendation | Severity |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **OBS-QV-001** | TC-QV-CALL-001 | Patient's name shown on the public waiting-room screen | The Now Serving card shows the patient's full name next to the token | Waiting-room displays usually show only the token, to protect patient privacy; confirm this is intended or make it configurable | Medium (privacy) |
| **OBS-QV-002** | TC-QV-CON-002 | Session token sent in the WebSocket URL | The socket URL is `…/socket.io/?org_id=…&token=<JWT>…`; URLs are often written to server and proxy logs | Send the token in the socket.io `auth` payload or a header instead of the query string | Low (security hardening) |
| **OBS-QV-003** | — (observed) | Realtime queue server unreachable on QA | `wss://pg-socket-emr-dev.amerck.care` never connects; the real display always shows *"Failed to connect to server"* | Restore the QA socket server so the live path can also be checked manually | Environment |
