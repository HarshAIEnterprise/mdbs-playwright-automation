// =============================================================
// tests/daily-route/04_customerList_createCustomer.spec.js
// Test: Daily Route - Customer List - Create Customer
// =============================================================
"use strict";

const { test, expect } = require("../../../fixtures/electron.fixture");
const {
    loginIfNeeded,
    safeNavigateToRouteList,
    navigateToCustomerList,
    waitForSaveEnabled,
} = require("../../../helpers/app.helpers");

test.describe.serial("Daily Route - Customer List - Create Customer", () => {

    test.beforeEach(async({ mainWindow }) => {
        await loginIfNeeded(mainWindow);
    });

    test.afterEach(async({ mainWindow }) => {
        await safeNavigateToRouteList(mainWindow);
    });

    // -----------------------------------------------------------
    // TC-04: Create Customer from Customer List
    // -----------------------------------------------------------
    test("Daily Route - Customer List - Create Customer", async({ mainWindow }) => {

        await navigateToCustomerList(mainWindow);

        // Open Add form
        await mainWindow.locator(".fa-plus").first().click();

        // Fill First Name
        const firstName = mainWindow.locator("#firstName");
        await expect(firstName).toBeEditable();
        await firstName.fill("PWFN");

        // Fill Last Name
        const lastName = mainWindow.locator("#lastName");
        await expect(lastName).toBeEditable();
        await lastName.fill("Customer");

        // Select Route Stop — skip empty placeholder at index 0
        const routeStopDropdown = mainWindow.locator("#routeStopId");
        await expect(routeStopDropdown).toBeVisible();
        await routeStopDropdown.selectOption({ index: 1 });

        // Save
        const saveButton = mainWindow.locator('[ng-click="vm.validateAndSave()"]');
        await expect(saveButton).toBeVisible();
        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        await expect(saveButton).toBeHidden();
        await mainWindow.waitForTimeout(1000);
        await expect(mainWindow.locator("#sideMenu_dailyRoute_customerList")).toBeVisible();
    });
});