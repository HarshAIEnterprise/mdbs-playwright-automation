// =============================================================
// playwright-ado-integration.js
//
// Two integration strategies — pick ONE:
//
//   Option A  →  test.afterEach   (per-spec, simple setup)
//   Option B  →  Global Reporter  (whole suite, best for CI)
//
// =============================================================

"use strict";

require("dotenv").config(); // load .env before anything else

const { test, expect } = require("@playwright/test");
const { AzureDevOpsReporter }         = require("./AzureDevOpsReporter");
const { ADO_TEST_CASE_MAP, loadAdoConfig } = require("./ado-test-case-map");


// =============================================================
// OPTION A — test.afterEach (add to individual spec files)
//
// Creates one Test Run per Playwright test.
// Good for small suites or pinpointed debugging.
// =============================================================

const adoReporter = new AzureDevOpsReporter(loadAdoConfig());

// Map Playwright status → ADO outcome string
function toAdoOutcome(status) {
  switch (status) {
    case "passed":  return "Passed";
    case "failed":  return "Failed";
    case "skipped": return "NotApplicable";
    default:        return "Blocked";
  }
}

test.afterEach(async ({}, testInfo) => {
  await adoReporter.reportResult({
    testTitle:    testInfo.title,
    outcome:      toAdoOutcome(testInfo.status),
    errorMessage: testInfo.errors.map((e) => e.message).join("\n") || undefined,
    testCaseMap:  ADO_TEST_CASE_MAP,
  });
});

// Example spec — title must match a key in ADO_TEST_CASE_MAP
test("login should succeed with valid credentials", async ({ page }) => {
  await page.goto(process.env.BASE_URL + "/login");
  await page.fill("#username", "testuser");
  await page.fill("#password",  "secret");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
});

test("login should fail with invalid credentials", async ({ page }) => {
  await page.goto(process.env.BASE_URL + "/login");
  await page.fill("#username", "bad");
  await page.fill("#password",  "bad");
  await page.click('button[type="submit"]');
  await expect(page.locator(".error-message")).toBeVisible();
});


// =============================================================
// OPTION B — Global Reporter (ado-global-reporter.js)
//
// Batches ALL test results and reports them together in onEnd().
// Best for CI pipelines and large suites.
//
// SETUP in playwright.config.js:
//   reporter: [["list"], ["./ado-global-reporter.js"]]
//
// This class lives in its own file — see ado-global-reporter.js
// below. It is shown here for reference.
// =============================================================

/*

// ── ado-global-reporter.js ───────────────────────────────────

"use strict";

require("dotenv").config();

const { AzureDevOpsReporter }              = require("./AzureDevOpsReporter");
const { ADO_TEST_CASE_MAP, loadAdoConfig } = require("./ado-test-case-map");

class AdoGlobalReporter {
  constructor() {
    this.client  = new AzureDevOpsReporter(loadAdoConfig());
    this.pending = [];
  }

  onTestEnd(test, result) {
    let outcome;
    switch (result.status) {
      case "passed":  outcome = "Passed";         break;
      case "failed":  outcome = "Failed";          break;
      case "skipped": outcome = "NotApplicable";   break;
      default:        outcome = "Blocked";
    }

    this.pending.push({
      testTitle:    test.title,
      outcome,
      errorMessage: result.errors.map((e) => e.message).join("\n") || undefined,
    });
  }

  async onEnd(_result) {
    console.log(
      `[ADO Global Reporter] Reporting ${this.pending.length} test(s) to Azure DevOps…`
    );

    for (const item of this.pending) {
      await this.client.reportResult({
        ...item,
        testCaseMap: ADO_TEST_CASE_MAP,
      });
    }

    console.log("[ADO Global Reporter] Done.");
  }
}

module.exports = AdoGlobalReporter;

*/
