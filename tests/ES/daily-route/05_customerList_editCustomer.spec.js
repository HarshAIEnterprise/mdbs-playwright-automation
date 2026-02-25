// =============================================================
// tests/daily-route/05_customerList_editCustomer.spec.js
// Test: Daily Route - Customer List - Edit Customer
// =============================================================
"use strict";

const { test, expect } = require("../../../fixtures/electron.fixture");
const {
    loginIfNeededES,
    safeNavigateToRouteList,
    navigateToCustomerList,
} = require("../../../helpers/app.helpers");

test.describe.serial("Daily Route - Customer List - Edit Customer", () => {

    test.beforeEach(async({ mainWindow }) => {
        await loginIfNeededES(mainWindow);
    });

    test.afterEach(async({ mainWindow }) => {
        await safeNavigateToRouteList(mainWindow);
    });

    // -----------------------------------------------------------
    // TC-05: Edit Customer from Customer List
    // -----------------------------------------------------------
    test("Daily Route - Customer List - Edit Customer", async({ mainWindow }) => {

        await navigateToCustomerList(mainWindow);

        // Search for the customer created in TC-04
        const customerNameInput = mainWindow.locator("#customerName");
        await expect(customerNameInput).toBeVisible();
        await expect(customerNameInput).toBeEditable();
        await customerNameInput.fill("PWFN");
        await mainWindow.waitForTimeout(1000);

        // Locate matching row in ag-grid
        const row = mainWindow
            .locator(".ag-center-cols-container .ag-row")
            .filter({ hasText: "PWFN" })
            .first();
        await expect(row).toBeVisible();

        // Hover to reveal edit button
        await row.hover();
        await row.locator('[title="Editar cliente"]').click();
        await mainWindow.waitForTimeout(500);

        // Update Middle Name
        const middleNameInput = mainWindow.locator("#middleName");
        await expect(middleNameInput).toBeVisible();
        await expect(middleNameInput).toBeEditable();
        await middleNameInput.fill("Michael");

        // Save
        const saveButton = mainWindow.locator('[ng-click="vm.validateAndSave()"]');
        await expect(saveButton).toBeVisible();
        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        await expect(mainWindow.locator("#sideMenu_dailyRoute_customerList")).toBeVisible();
    });
});