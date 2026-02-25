// =============================================================
// AzureDevOpsReporter.js
// =============================================================

const axios = require("axios");
const { lookupTestCase } = require("./ado-test-case-map");

class AzureDevOpsReporter {
  constructor(config) {
    this.cfg = { apiVersion: "7.1", ...config };

    const token = Buffer.from(`:${this.cfg.pat}`).toString("base64");

    this.client = axios.create({
      baseURL: `https://dev.azure.com/${this.cfg.organization}/${this.cfg.project}/_apis`,
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/json",
      },
      params: { "api-version": this.cfg.apiVersion },
    });
  }

  async getTestPoints(suiteId, testCaseIds) {
    const { data } = await this.client.get(
      `/test/Plans/${this.cfg.planId}/Suites/${suiteId}/points`,
      {
        params: {
          testCaseId: testCaseIds.join(","),
        },
      }
    );

    return data.value ?? [];
  }

  async createTestRun(name, pointIds) {
    const { data } = await this.client.post(`/test/runs`, {
      name,
      plan: { id: String(this.cfg.planId) },
      pointIds,
      automated: true,
    });

    console.log(`[ADO] Created Test Run: ${data.id}`);
    return data;
  }

  async updateTestResults(runId, results) {
    const { data: resultData } = await this.client.get(
      `/test/runs/${runId}/results`
    );

    const runResults = resultData.value ?? [];

    const payload = results
      .map((r) => {
        const stub = runResults.find(
          (s) => s.testCase.id === String(r.testCaseId)
        );
        if (!stub) return null;

        return {
          id: stub.id,
          outcome: r.outcome,
          state: "Completed",
          ...(r.errorMessage ? { errorMessage: r.errorMessage } : {}),
        };
      })
      .filter(Boolean);

    if (!payload.length) return;

    await this.client.patch(`/test/runs/${runId}/results`, payload);
  }

  async closeTestRun(runId) {
    await this.client.patch(`/test/runs/${runId}`, { state: "Completed" });
    console.log(`[ADO] Closed Test Run: ${runId}`);
  }

  // ✅ FIXED AND PROPERLY INSIDE CLASS
  async reportResult({ testTitle, filePath, outcome, errorMessage }) {
    const mapping = lookupTestCase(testTitle, filePath);

    if (!mapping) return;

    try {
      const points = await this.getTestPoints(
        mapping.suiteId,
        [mapping.testCaseId]
      );

      if (!points.length) {
        console.warn(
          `[ADO] No Test Points found for Test Case ${mapping.testCaseId}`
        );
        return;
      }

      const pointIds = points.map((p) => p.id);

      const run = await this.createTestRun(
        `Playwright — ${testTitle} — ${new Date().toISOString()}`,
        pointIds
      );

      await this.updateTestResults(run.id, [
        { testCaseId: mapping.testCaseId, outcome, errorMessage },
      ]);

      await this.closeTestRun(run.id);

    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(
          `[ADO] API error for "${testTitle}":`,
          err.response?.status,
          JSON.stringify(err.response?.data, null, 2)
        );
      } else {
        console.error(`[ADO] Unexpected error for "${testTitle}":`, err);
      }
    }
  }
}

module.exports = { AzureDevOpsReporter };