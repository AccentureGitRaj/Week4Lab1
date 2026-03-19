const { DataProgram, runApp } = require("./index");

function createFakeReadline(responses) {
  const queue = [...responses];

  return {
    async question() {
      if (queue.length === 0) {
        throw new Error("No more scripted input available.");
      }

      return queue.shift();
    },
  };
}

async function runWithResponses(responses) {
  const output = [];
  const rl = createFakeReadline(responses);

  const finalBalance = await runApp({
    rl,
    writer: (message) => output.push(message),
  });

  return {
    finalBalance,
    output,
    text: output.join("\n"),
  };
}

describe("accounting application test plan coverage", () => {
  test("TC-001 Launch and menu display", async () => {
    const { text } = await runWithResponses(["4"]);

    expect(text).toContain("Account Management System");
    expect(text).toContain("1. View Balance");
    expect(text).toContain("2. Credit Account");
    expect(text).toContain("3. Debit Account");
    expect(text).toContain("4. Exit");
  });

  test("TC-002 Initial balance visibility", async () => {
    const { text } = await runWithResponses(["1", "4"]);

    expect(text).toContain("Current balance: 1000.00");
  });

  test("TC-003 Option 1 routing and loop continuation", async () => {
    const { output } = await runWithResponses(["1", "4"]);
    const menuDisplays = output.filter((line) => line === "Account Management System").length;

    expect(output).toContain("Current balance: 1000.00");
    expect(menuDisplays).toBe(2);
  });

  test("TC-004 Credit updates balance correctly", async () => {
    const { text, finalBalance } = await runWithResponses(["2", "250.00", "1", "4"]);

    expect(text).toContain("Amount credited. New balance: 1250.00");
    expect(text).toContain("Current balance: 1250.00");
    expect(finalBalance).toBe(1250);
  });

  test("TC-005 Debit updates balance when funds are sufficient", async () => {
    const { text, finalBalance } = await runWithResponses(["3", "200.00", "1", "4"]);

    expect(text).toContain("Amount debited. New balance: 800.00");
    expect(text).toContain("Current balance: 800.00");
    expect(finalBalance).toBe(800);
  });

  test("TC-006 Debit is rejected when funds are insufficient", async () => {
    const { text, finalBalance } = await runWithResponses(["3", "1000.01", "1", "4"]);

    expect(text).toContain("Insufficient funds for this debit.");
    expect(text).toContain("Current balance: 1000.00");
    expect(finalBalance).toBe(1000);
  });

  test("TC-007 Invalid menu input handling", async () => {
    const { output, text } = await runWithResponses(["9", "4"]);
    const menuDisplays = output.filter((line) => line === "Account Management System").length;

    expect(text).toContain("Invalid choice, please select 1-4.");
    expect(menuDisplays).toBe(2);
  });

  test("TC-008 Exit behavior", async () => {
    const { text } = await runWithResponses(["4"]);

    expect(text).toContain("Exiting the program. Goodbye!");
  });

  test("TC-009 State persists across multiple transactions", async () => {
    const { text, finalBalance } = await runWithResponses(["2", "100.00", "3", "40.00", "1", "4"]);

    expect(text).toContain("Amount credited. New balance: 1100.00");
    expect(text).toContain("Amount debited. New balance: 1060.00");
    expect(text).toContain("Current balance: 1060.00");
    expect(finalBalance).toBe(1060);
  });

  test("TC-010 Failed debit does not write data", async () => {
    const { text, finalBalance } = await runWithResponses(["3", "1500.00", "1", "4"]);

    expect(text).toContain("Insufficient funds for this debit.");
    expect(text).toContain("Current balance: 1000.00");
    expect(finalBalance).toBe(1000);
  });

  test("TC-011 Exact-balance debit boundary", async () => {
    const { text, finalBalance } = await runWithResponses(["3", "1000.00", "1", "4"]);

    expect(text).toContain("Amount debited. New balance: 0.00");
    expect(text).toContain("Current balance: 0.00");
    expect(finalBalance).toBe(0);
  });

  test("TC-012 Zero credit behavior", async () => {
    const { text, finalBalance } = await runWithResponses(["2", "0.00", "1", "4"]);

    expect(text).toContain("Amount credited. New balance: 1000.00");
    expect(text).toContain("Current balance: 1000.00");
    expect(finalBalance).toBe(1000);
  });

  test("TC-013 Zero debit behavior", async () => {
    const { text, finalBalance } = await runWithResponses(["3", "0.00", "1", "4"]);

    expect(text).toContain("Amount debited. New balance: 1000.00");
    expect(text).toContain("Current balance: 1000.00");
    expect(finalBalance).toBe(1000);
  });

  test("TC-014 Consecutive invalid entries and recovery", async () => {
    const { output, text } = await runWithResponses(["0", "7", "9", "1", "4"]);
    const invalidMessageCount = output.filter((line) => line === "Invalid choice, please select 1-4.").length;

    expect(invalidMessageCount).toBe(3);
    expect(text).toContain("Current balance: 1000.00");
    expect(text).toContain("Exiting the program. Goodbye!");
  });

  test("TC-015 DataProgram READ returns latest written value", () => {
    const dataProgram = new DataProgram();

    dataProgram.execute("WRITE", 1234.56);

    expect(dataProgram.execute("READ", 0)).toBe(1234.56);
  });

  test("TC-016 DataProgram WRITE persists updated value", () => {
    const dataProgram = new DataProgram();

    dataProgram.execute("WRITE", 1100.0);
    expect(dataProgram.execute("READ", 0)).toBe(1100);

    dataProgram.execute("WRITE", 1060.0);
    expect(dataProgram.execute("READ", 0)).toBe(1060);
  });
});
