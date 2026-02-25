// =============================================================
// tests/daily-route/01_login.spec.js
// Test: MDBS Login
// =============================================================
"use strict";

const { test, expect } = require("../../../fixtures/electron.fixture");
const { loginIfNeeded, safeNavigateToRouteList } = require("../../../helpers/app.helpers");

test.describe.serial("Login", () => {

    // beforeEach — ensure the app is in a recoverable state
    // before this test runs (handles cascades from prior failures)

    // -----------------------------------------------------------
    // TC-01: MDBS Login
    // -----------------------------------------------------------
    test("MDBS Login", async({ mainWindow }) => {
        test.setTimeout(120000);

        await mainWindow.waitForSelector('input[placeholder="Username"]', {
            state: "visible",
            timeout: 30000,
        });

        await mainWindow.getByPlaceholder("Username").fill("411116");
        await mainWindow.locator("#password").fill("matcotools#1");

        const loginButton = mainWindow.locator("#login");
        await expect(loginButton).toBeVisible();
        await mainWindow.waitForFunction(() => {
            const btn = document.querySelector("#login");
            return btn && !btn.disabled;
        });
        await loginButton.click();

        const routelistLink = mainWindow.locator("#sideMenu_dailyRoute_routeList");
        await expect(routelistLink).toBeVisible();
        await expect(routelistLink).toBeEnabled();
    });
});