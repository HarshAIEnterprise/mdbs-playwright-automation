"use strict";

require("dotenv").config();

const { AzureDevOpsReporter } = require("./AzureDevOpsReporter");
const { loadAdoConfig } = require("./ado-test-case-map");

class AdoGlobalReporter {
  constructor() {
    this.client = new AzureDevOpsReporter(loadAdoConfig());
    this.pending = [];
  }

  onTestEnd(test, result) {
    let outcome;

    switch (result.status) {
      case "passed":
        outcome = "Passed";
        break;
      case "failed":
        outcome = "Failed";
        break;
      case "skipped":
        outcome = "NotApplicable";
        break;
      default:
        outcome = "Blocked";
    }

    this.pending.push({
      testTitle: test.title,
      filePath: test.location?.file,
      outcome,
      errorMessage:
        result.errors?.map((e) => e.message).join("\n") || undefined,
    });
  }

  async onEnd() {
    console.log(
      `[ADO Global Reporter] Reporting ${this.pending.length} test(s) to Azure DevOps...`
    );

    for (const item of this.pending) {
      await this.client.reportResult(item);
    }

    console.log("[ADO Global Reporter] Done.");
  }
}

module.exports = AdoGlobalReporter;