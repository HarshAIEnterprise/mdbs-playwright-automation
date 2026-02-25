// =============================================================
// tests/daily-route/01_login.spec.js
// Test: MDBS Login
// =============================================================
"use strict";

const { test, expect } = require("../../../fixtures/electron.fixture");
const { loginIfNeeded, safeNavigateToRouteList } = require("../../../helpers/app.helpers");

test.describe.serial("Login", () => {

    // beforeEach — if previous test failed and app is on login
    // screen or broken state, loginIfNeeded() fixes it before
    // this test starts — preventing a false cascade failure
    test.beforeEach(async({ mainWindow }) => {
        await loginIfNeeded(mainWindow);
    });

    // afterEach — safe, never throws even if app is broken
    test.afterEach(async({ mainWindow }) => {
        await safeNavigateToRouteList(mainWindow);
    });

    // -----------------------------------------------------------
    // TC-01: MDBS Login
    // -----------------------------------------------------------
    test("MDBS Login Set ES", async({ mainWindow }) => {
        test.setTimeout(120000);

        const settingsButton = mainWindow.locator('[data-translate="SETTINGS"]');
        await settingsButton.waitFor({ state: 'visible' });
        await settingsButton.click();

        // Open Language submenu
        const languageMenu = mainWindow.locator('[data-translate="LANGUAGE"]');
        await languageMenu.waitFor({ state: 'visible' });
        await languageMenu.hover();

        // Click requested language ALWAYS
        const languageOption = mainWindow.locator(
            `[ng-click="layout.changeLanguage('es')"]`
        );

        await languageOption.waitFor({ state: 'visible' });
        await languageOption.click();

        // Wait for Angular to refresh translations
        await mainWindow.waitForTimeout(1500);

        await expect(mainWindow.getByText('DOM')).toBeVisible();

        console.log("[Recovery] Login successful.");

    });
});