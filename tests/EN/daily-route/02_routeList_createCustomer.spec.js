// =============================================================
// tests/daily-route/02_routeList_createCustomer.spec.js
// Test: Daily Route - Route List - Create Customer
// =============================================================
"use strict";

const { test, expect } = require("../../../fixtures/electron.fixture");
const {
    loginIfNeeded,
    safeNavigateToRouteList,
    waitForSaveEnabled,
    selectRouteListShop,
} = require("../../../helpers/app.helpers");

test.describe.serial("Daily Route - Route List - Create Customer", () => {

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
    // TC-02: Create Customer from Route List
    // -----------------------------------------------------------
    test("Daily Route - Route list - Create Customer", async({ mainWindow }) => {

        // Navigate to THU stop at Rick Case Honda
        await selectRouteListShop(mainWindow, "THU", "Rick Case Honda");
        await mainWindow.waitForTimeout(500);
        // Open Add New Customer form
        const addCustomerButton = mainWindow.locator(
            'a[ng-click="vm.addNewCustomer($event, vm.customerLevelAdd, null)"]'
        );
        await expect(addCustomerButton).toBeVisible();
        await addCustomerButton.click();

        // Fill First Name
        const firstName = mainWindow.locator("#firstName");
        await expect(firstName).toBeEditable();
        await firstName.fill("playrightFname");

        // Fill Last Name
        const lastName = mainWindow.locator("#lastName");
        await expect(lastName).toBeEditable();
        await lastName.fill("playwrightLname");

        // Save
        const saveButton = mainWindow.locator('[ng-click="vm.validateAndSave()"]');
        await expect(saveButton).toBeVisible();
        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        await expect(mainWindow.locator("#sideMenu_dailyRoute_routeList")).toBeVisible();
    });
});