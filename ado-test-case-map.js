"use strict";

// =============================================================
// Multi-language Test Case Map
// =============================================================

const ADO_TEST_CASE_MAP = {
  EN: {
    "MDBS Login": { testCaseId: 50415, suiteId: 50414 },

    "Daily Route - Route List - Create Customer": {
      testCaseId: 50422,
      suiteId: 50419,
    },
    "Daily Route - Route List - Edit Customer": {
      testCaseId: 50423,
      suiteId: 50419,
    },
    "Daily Route - Customer List - Create Customer": {
      testCaseId: 50424,
      suiteId: 50418,
    },
    "Daily Route - Customer List - Edit Customer": {
      testCaseId: 50425,
      suiteId: 50418,
    },
    "Daily Route - Route list - Add Shop": {
      testCaseId: 50420,
      suiteId: 50417,
    },
    "Daily Route - Route List - Edit Shop": {
      testCaseId: 50421,
      suiteId: 50417,
    },
    "Daily Route - Customer list - Submit credit application": {
      testCaseId: 50383,
      suiteId: 50382,
    },
    "Daily Route - Customer List - TP Sale Without Payment - Done & No Print": {
      testCaseId: 50385,
      suiteId: 50384,
    },
    "Daily Route - Send Item Request": {
      testCaseId: 50493,
      suiteId: 50419,
    },
  },

  ES: {
    "MDBS Login": { testCaseId: 50433, suiteId: 50427 },

    "Daily Route - Route List - Create Customer": {
      testCaseId: 50452,
      suiteId: 50449,
    },
    "Daily Route - Route List - Edit Customer": {
      testCaseId: 50453,
      suiteId: 50449,
    },
    "Daily Route - Customer List - Create Customer": {
      testCaseId: 50454,
      suiteId: 50450,
    },
    "Daily Route - Customer List - Edit Customer": {
      testCaseId: 50455,
      suiteId: 50450,
    },
    "Daily Route - Route list - Add Shop": {
      testCaseId: 50456,
      suiteId: 50451,
    },
    "Daily Route - Route List - Edit Shop": {
      testCaseId: 50457,
      suiteId: 50451,
    },
    "Daily Route - Customer list - Submit credit application": {
      testCaseId: 50444,
      suiteId: 50442,
    },
    "Daily Route - Customer List - TP Sale Without Payment - Done & No Print": {
      testCaseId: 50441,
      suiteId: 50440,
    },
    "Daily Route - Send Item Request": {
      testCaseId: 50494,
      suiteId: 50449,
    },
  },
};

// =============================================================
// Config Loader
// =============================================================

function loadAdoConfig() {
  const required = ["ADO_PAT", "ADO_ORG", "ADO_PROJECT", "ADO_PLAN_ID"];
  const missing = required.filter((k) => !process.env[k]);

  if (missing.length) {
    throw new Error(
      `[ADO] Missing required environment variables: ${missing.join(", ")}`
    );
  }

  return {
    organization: process.env.ADO_ORG,
    project: process.env.ADO_PROJECT,
    planId: Number(process.env.ADO_PLAN_ID),
    pat: process.env.ADO_PAT,
    apiVersion: process.env.ADO_API_VERSION ?? "7.1",
  };
}

// =============================================================
// Language Detection
// =============================================================

function detectLanguageFromPath(filePath) {
  if (!filePath) return "EN";

  const normalized = filePath.replace(/\\/g, "/");

  if (normalized.includes("/tests/ES/")) return "ES";
  if (normalized.includes("/tests/EN/")) return "EN";

  return "EN";
}

// =============================================================
// Case-Insensitive Lookup
// =============================================================

function lookupTestCase(testTitle, filePath) {
  const language = detectLanguageFromPath(filePath);
  const langMap = ADO_TEST_CASE_MAP[language];

  if (!langMap) return null;

  const normalizedTitle = testTitle.trim().toLowerCase();

  const matchKey = Object.keys(langMap).find(
    (key) => key.trim().toLowerCase() === normalizedTitle
  );

  if (!matchKey) {
    console.warn(
      `[ADO] No ADO mapping found for test: "${testTitle}". Skipping.`
    );
    return null;
  }

  return langMap[matchKey];
}

module.exports = {
  ADO_TEST_CASE_MAP,
  loadAdoConfig,
  lookupTestCase,
};