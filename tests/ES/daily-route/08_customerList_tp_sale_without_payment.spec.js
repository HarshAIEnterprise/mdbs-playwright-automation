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

test.describe.serial("Daily Route - Customer List - TP Sale Without Payment - Done & No Print", () => {

    // beforeEach — if previous test failed and app is on login
    // screen or broken state, loginIfNeeded() fixes it before
    // this test starts — preventing a false cascade failure
    test.beforeEach(async ({ mainWindow }) => {
        await loginIfNeeded(mainWindow);
    });

    // afterEach — safe, never throws even if app is broken
    test.afterEach(async ({ mainWindow }) => {
        await safeNavigateToRouteList(mainWindow);
    });

    test("Daily Route - Customer List - TP Sale Without Payment - Done & No Print", async ({ mainWindow }) => {

        // ==================================
        // CUSTOMER LIST - TP SALE WITHOUT PAYMENT - DONE & NO PRINT
        // ==================================
        // Go to Customers by clicking on the link in left nave
        const customersLink = mainWindow.locator('#sideMenu_dailyRoute_customerList');
        await expect(customersLink).toBeVisible();
        await expect(customersLink).toBeEnabled();
        await customersLink.click();

        // Search by a customer name
        const customerNameInput = mainWindow.locator('#customerName');
        await expect(customerNameInput).toBeVisible();
        await expect(customerNameInput).toBeEditable();
        await customerNameInput.fill('SAMMY');
        await mainWindow.waitForTimeout(1000);

        // Find the row containing the unique customer
        const row = mainWindow
            .locator('.ag-center-cols-container .ag-row')
            .filter({ hasText: 'SAMMY' })
            .first();

        await expect(row).toBeVisible();
        await row.hover();
        // Click on Sales icon
        await row.locator('[title="Ventas"]').click();
        await mainWindow.waitForTimeout(1000);



        // Typeahead input selection

        // Locate the input field
        const itemInput = mainWindow.locator('input#itemNumber0');

        // Type a partial value to trigger typeahead
        //await expect(itemInput).toBeVisible();
        //await expect(itemInput).toBeEditable();
        await itemInput.fill('0141140');
        await mainWindow.waitForTimeout(1000);

        // Wait for the typeahead dropdown to appear
        const dropdownItem = mainWindow.locator('.uib-typeahead-match'); // Angular UI Bootstrap default class
        await expect(dropdownItem.first()).toBeVisible();

        // Select the first item from suggestions
        await dropdownItem.first().click();

        // Scroll to Complete Sale button and click
        // Locate the element
        const completeSaleBtn = mainWindow.locator('span[data-translate="COMPLETE_SALE"]');

        // Scroll the element into view
        await completeSaleBtn.scrollIntoViewIfNeeded();

        // Check if it's visible
        if (await completeSaleBtn.isVisible()) {
            // Click the button
            await mainWindow.waitForTimeout(2000);
            await completeSaleBtn.click();
        };


        // Click Done & No Print button

        // Locate using stable attribute
        const doneNoPrintBtn = mainWindow.locator('span[data-translate="DONE_NO_PRINT"]');

        // Scroll into view (important if button is below fold)
        await doneNoPrintBtn.scrollIntoViewIfNeeded();

        // Verify button is visible
        await expect(doneNoPrintBtn).toBeVisible();

        // Click the button
        await doneNoPrintBtn.click();

        await mainWindow.waitForTimeout(5000);

        await expect(mainWindow.locator('#sideMenu_dailyRoute_customerList')).toBeVisible();
    });
});