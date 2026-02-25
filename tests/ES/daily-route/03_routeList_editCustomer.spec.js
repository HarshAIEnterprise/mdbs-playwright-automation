// =============================================================
// tests/daily-route/03_routeList_editCustomer.spec.js
// Test: Daily Route - Route List - Edit Customer
// =============================================================
"use strict";

const { test, expect } = require("../../../fixtures/electron.fixture");
const {
    loginIfNeededES,
    safeNavigateToRouteList,
    waitForSaveEnabled,
    selectRouteListShop,
} = require("../../../helpers/app.helpers");

test.describe.serial("Daily Route - Route List - Edit Customer", () => {

    test.beforeEach(async({ mainWindow }) => {
        await loginIfNeededES(mainWindow);
    });

    test.afterEach(async({ mainWindow }) => {
        await safeNavigateToRouteList(mainWindow);
    });

    // -----------------------------------------------------------
    // TC-03: Edit Customer from Route List
    // -----------------------------------------------------------
    test("Daily Route - Route List - Edit Customer", async({ mainWindow }) => {

        // Navigate to THU stop at Rick Case Honda
        await selectRouteListShop(mainWindow, "JUE", "Rick Case Honda");

        // Search for the customer created in TC-02
        const custSearchInput = mainWindow.locator("#custAutoComplete");
        await expect(custSearchInput).toBeVisible({ timeout: 10000 });
        await custSearchInput.fill("playrightFname");

        // Wait for matching row in ag-grid
        const customerRow = mainWindow
            .locator(".ag-center-cols-container .ag-row", { hasText: "playrightFname" })
            .first();
        await expect(customerRow).toBeVisible({ timeout: 40000 });

        // Hover to reveal edit button
        await customerRow.hover();
        const editButton = customerRow.locator('[title="Editar cliente"]');
        await expect(editButton).toBeVisible({ timeout: 10000 });
        await editButton.click();

        // Update Middle Name
        const middleNameInput = mainWindow.locator("#middleName");
        await expect(middleNameInput).toBeVisible({ timeout: 10000 });
        await expect(middleNameInput).toBeEditable({ timeout: 10000 });
        await middleNameInput.fill("updatedplayrightMname");

        // Save
        const saveButton = mainWindow.locator('[ng-click="vm.validateAndSave()"]');
        await expect(saveButton).toBeVisible();
        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        await expect(mainWindow.locator("#sideMenu_dailyRoute_routeList")).toBeVisible();
    });
});