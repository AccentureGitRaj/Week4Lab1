# COBOL Account System Test Plan

This test plan replaces the previous version and reflects the current business logic implemented in `main.cob`, `operations.cob`, and `data.cob`. It is suitable for stakeholder validation and later conversion into Node.js unit and integration tests.

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | Launch and menu display | Application is compiled and executable is available. | 1. Start the application. | The menu shows options 1 to 4 with input prompt. | TBD | TBD | Covers main entry point behavior. |
| TC-002 | Initial balance visibility | Fresh run with no prior updates in current session. | 1. Start app. 2. Choose option 1. | Current balance is shown as 1000.00 (format may display leading zeros). | TBD | TBD | Confirms default seeded balance. |
| TC-003 | Option 1 routing and loop continuation | App is at main menu. | 1. Choose option 1. 2. Observe next screen. | App calls balance inquiry, displays value, then returns to menu. | TBD | TBD | Validates `TOTAL ` operation path and loop behavior. |
| TC-004 | Credit updates balance correctly | App is running with known starting balance (for example 1000.00). | 1. Choose option 2. 2. Enter `250.00`. 3. Choose option 1. | Credit success message appears; balance becomes 1250.00. | TBD | TBD | Validates READ + ADD + WRITE flow. |
| TC-005 | Debit updates balance when funds are sufficient | App is running with known starting balance (for example 1000.00). | 1. Choose option 3. 2. Enter `200.00`. 3. Choose option 1. | Debit success message appears; balance becomes 800.00. | TBD | TBD | Validates sufficient-funds branch. |
| TC-006 | Debit is rejected when funds are insufficient | App is running with known starting balance (for example 1000.00). | 1. Choose option 3. 2. Enter `1000.01`. 3. Choose option 1. | Message indicates insufficient funds; balance remains unchanged. | TBD | TBD | Validates insufficient-funds business rule. |
| TC-007 | Invalid menu input handling | App is at main menu. | 1. Enter value outside 1 to 4 (for example `9`). | App displays invalid-choice message and returns to menu. | TBD | TBD | Validates `WHEN OTHER` path in menu evaluation. |
| TC-008 | Exit behavior | App is at main menu. | 1. Choose option 4. | App prints goodbye message and terminates cleanly. | TBD | TBD | Validates exit condition and end of loop. |
| TC-009 | State persists across multiple transactions | App is running with initial balance 1000.00. | 1. Credit `100.00`. 2. Debit `40.00`. 3. View balance. | Final balance is 1060.00. | TBD | TBD | Confirms cumulative update behavior in same session. |
| TC-010 | Failed debit does not write data | App is running with known balance (for example 1000.00). | 1. Attempt debit of `1500.00`. 2. View balance. | Balance remains at previous value; no unintended write occurs. | TBD | TBD | Confirms no write on failed debit path. |
| TC-011 | Exact-balance debit boundary | App is running with known balance (for example 1000.00). | 1. Choose option 3. 2. Enter exact balance amount. 3. View balance. | Debit succeeds and new balance is 0.00. | TBD | TBD | Validates `FINAL-BALANCE >= AMOUNT` boundary. |
| TC-012 | Zero credit behavior | App is running with known balance. | 1. Choose option 2. 2. Enter `0.00`. 3. View balance. | Operation completes and balance remains unchanged. | TBD | TBD | Documents current logic (no minimum amount check). |
| TC-013 | Zero debit behavior | App is running with known balance. | 1. Choose option 3. 2. Enter `0.00`. 3. View balance. | Operation completes and balance remains unchanged. | TBD | TBD | Documents current logic (no minimum amount check). |
| TC-014 | Consecutive invalid entries and recovery | App is at main menu. | 1. Enter `0`, `7`, and `9` sequentially. 2. Enter option 1. 3. Enter option 4. | App stays stable, keeps re-prompting, then performs valid actions and exits. | TBD | TBD | Validates robustness of input loop. |
| TC-015 | DataProgram READ returns latest written value | At least one successful credit or debit completed in session. | 1. Perform successful balance update. 2. Choose option 1 immediately. | Displayed balance matches the latest persisted balance. | TBD | TBD | Maps to DataProgram `READ` behavior. |
| TC-016 | DataProgram WRITE persists updated value | App is running with known balance. | 1. Perform one successful credit. 2. Perform one successful debit. 3. View balance after each action. | Each successful operation is reflected in subsequent reads. | TBD | TBD | Maps to DataProgram `WRITE` behavior. |

## Node.js Migration Notes

- Unit-test candidates: operation routing, arithmetic rules, insufficient-funds condition, and data adapter read/write behavior.
- Integration-test candidates: menu input to operation dispatch to persisted-balance verification.
- Assertion guidance: compare numeric values, not raw string formatting, because COBOL output may include leading zeros.
