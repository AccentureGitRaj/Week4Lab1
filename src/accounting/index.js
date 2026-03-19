const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

function defaultWriter(message) {
  console.log(message);
}

class DataProgram {
  constructor() {
    this.storageBalance = 1000.0;
  }

  execute(passedOperation, balance) {
    const operationType = String(passedOperation || "");

    if (operationType === "READ") {
      return this.storageBalance;
    }

    if (operationType === "WRITE") {
      this.storageBalance = balance;
      return this.storageBalance;
    }

    return balance;
  }
}

class Operations {
  constructor(dataProgram, rl, writer = defaultWriter) {
    this.dataProgram = dataProgram;
    this.rl = rl;
    this.writer = writer;
    this.finalBalance = 1000.0;
  }

  async execute(passedOperation) {
    const operationType = String(passedOperation || "");

    if (operationType === "TOTAL ") {
      this.finalBalance = this.dataProgram.execute("READ", this.finalBalance);
      this.writer(`Current balance: ${this.formatBalance(this.finalBalance)}`);
      return;
    }

    if (operationType === "CREDIT") {
      const amount = await this.acceptAmount("Enter credit amount: ");
      this.finalBalance = this.dataProgram.execute("READ", this.finalBalance);
      this.finalBalance += amount;
      this.dataProgram.execute("WRITE", this.finalBalance);
      this.writer(`Amount credited. New balance: ${this.formatBalance(this.finalBalance)}`);
      return;
    }

    if (operationType === "DEBIT ") {
      const amount = await this.acceptAmount("Enter debit amount: ");
      this.finalBalance = this.dataProgram.execute("READ", this.finalBalance);

      if (this.finalBalance >= amount) {
        this.finalBalance -= amount;
        this.dataProgram.execute("WRITE", this.finalBalance);
        this.writer(`Amount debited. New balance: ${this.formatBalance(this.finalBalance)}`);
      } else {
        this.writer("Insufficient funds for this debit.");
      }
    }
  }

  async acceptAmount(promptText) {
    while (true) {
      const value = await this.rl.question(`${promptText}\n`);
      const amount = Number(value);
      if (!Number.isNaN(amount) && Number.isFinite(amount)) {
        return amount;
      }
      this.writer("Invalid amount. Please enter a numeric value.");
    }
  }

  formatBalance(value) {
    // Match COBOL-like 2-decimal rendering while keeping numeric behavior.
    return value.toFixed(2);
  }
}

async function runApp({ rl, writer = defaultWriter } = {}) {
  const dataProgram = new DataProgram();
  const operations = new Operations(dataProgram, rl, writer);

  let continueFlag = "YES";

  while (continueFlag !== "NO") {
    writer("--------------------------------");
    writer("Account Management System");
    writer("1. View Balance");
    writer("2. Credit Account");
    writer("3. Debit Account");
    writer("4. Exit");
    writer("--------------------------------");

    const choiceInput = await rl.question("Enter your choice (1-4): \n");
    const userChoice = Number(choiceInput);

    switch (userChoice) {
      case 1:
        await operations.execute("TOTAL ");
        break;
      case 2:
        await operations.execute("CREDIT");
        break;
      case 3:
        await operations.execute("DEBIT ");
        break;
      case 4:
        continueFlag = "NO";
        break;
      default:
        writer("Invalid choice, please select 1-4.");
    }
  }

  writer("Exiting the program. Goodbye!");

  return dataProgram.execute("READ", operations.finalBalance);
}

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    await runApp({ rl });
  } finally {
    rl.close();
  }
}

module.exports = {
  DataProgram,
  Operations,
  runApp,
};

if (require.main === module) {
  main().catch((error) => {
    console.error("Unexpected error:", error);
    process.exitCode = 1;
  });
}
