// =============================================================
// tests/daily-route/13_removeFromWishList.spec.js
// Test: Daily Route - Remove From Wish List
// =============================================================
"use strict";

const { test, expect } = require("../../../fixtures/electron.fixture");
const {
    loginIfNeeded,
    safeNavigateToRouteList,
    waitForSaveEnabled,
    selectRouteListShop,
} = require("../../../helpers/app.helpers");

test.describe.serial("Daily Route - Remove From Wish List", () => {

    // beforeEach — if previous test failed and app is on login
    // screen or broken state, loginIfNeeded() fixes it before
    // this test starts — preventing a false cascade failure

    test.setTimeout(120000); // 2 minutes

    test.beforeEach(async ({ mainWindow }) => {
        await loginIfNeeded(mainWindow);
    });

    // afterEach — safe, never throws even if app is broken
    test.afterEach(async ({ mainWindow }) => {
        await safeNavigateToRouteList(mainWindow);
    });

    test("Daily Route - Remove From Wish List", async ({ mainWindow }) => {

        // ==================================
        // REMOVE FROM WISH LIST
        // ==================================
        // Go to Customers by clicking on the link in left navigation

        // Generate unique last name

        const uniqueNumber = Date.now().toString().slice(-4);
        const customerLastName = `Play${uniqueNumber}`;


        // -----------------------------------------------------------
        // Create Customer from Customer List
        // -----------------------------------------------------------

        const customersLink = mainWindow.locator('#sideMenu_dailyRoute_customerList');
        await expect(customersLink).toBeVisible();
        await expect(customersLink).toBeEnabled();
        await customersLink.click();


        // Open Add form
        await mainWindow.locator(".fa-plus").first().click();

        // Fill First Name
        const firstName = mainWindow.locator("#firstName");
        await expect(firstName).toBeEditable();
        await firstName.fill("Auto");
        await mainWindow.waitForTimeout(1000);

        // Fill Last Name (Dynamic)
        const lastName = mainWindow.locator("#lastName");
        await expect(lastName).toBeEditable();
        await lastName.fill(customerLastName);
        await mainWindow.waitForTimeout(1000);

        // Select Route Stop
        const routeStopDropdown = mainWindow.locator("#routeStopId");
        await expect(routeStopDropdown).toBeVisible();
        await routeStopDropdown.selectOption({ index: 2 });
        await mainWindow.waitForTimeout(2000);

        // Save
        const saveButton = mainWindow.locator('[ng-click="vm.validateAndSave()"]');
        await expect(saveButton).toBeVisible();
        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        // Wait for list page
        await expect(mainWindow.locator("#sideMenu_dailyRoute_customerList")).toBeVisible();

        // -----------------------------
        // Search using SAME last name
        // -----------------------------
        const customerNameInput = mainWindow.locator('#customerName');
        await expect(customerNameInput).toBeVisible();
        await expect(customerNameInput).toBeEditable();
        await customerNameInput.fill(customerLastName);
        await mainWindow.waitForTimeout(2000);

        // Find the row containing the unique customer
        const row = mainWindow
            .locator('.ag-center-cols-container .ag-row')
            .filter({ hasText: customerLastName })
            .first();

        await expect(row).toBeVisible();
        await row.hover();


        

        // Click on Sales icon
        await row.locator('[title="Sales"]').click();

        await mainWindow.waitForTimeout(1000);


        
        // Typeahead input selection
        // Locate the input field
        const itemInput = mainWindow.locator('input#itemNumber0');

        // Type a partial value to trigger typeahead
        // await expect(itemInput).toBeVisible();
        // await expect(itemInput).toBeEditable();
        await itemInput.fill('0402002');
        await mainWindow.waitForTimeout(1000);

        // Wait for the typeahead dropdown to appear
        const dropdownItem = mainWindow.locator('.uib-typeahead-match'); // Angular UI Bootstrap default class
        await expect(dropdownItem.first()).toBeVisible();

        // Select the first item from suggestions
        await dropdownItem.first().click();





        // Click "Set Status to Request"
        const requestBtn = mainWindow.getByText('Set Status to Request', { exact: true });
        await expect(requestBtn).toBeVisible();
        await requestBtn.click();

        // Wait for "Need"
        const needBtn = mainWindow.getByText('Set Status to Need', { exact: true });
        await expect(needBtn).toBeVisible({ timeout: 5000 });

        // Click "Need"
        await needBtn.click();

        // Wait for "Sold"
        const soldBtn = mainWindow.getByText('Set Status to Sold', { exact: true });
        await expect(soldBtn).toBeVisible({ timeout: 5000 });


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

        


        // Click Customers link again to ensure navigation
        await mainWindow.locator('#sideMenu_dailyRoute_customerList').click();

        

        // Wait for the actual search input (real page indicator)
        const newCustomerNameInput = mainWindow.locator('#customerName');
        await expect(newCustomerNameInput).toBeVisible({ timeout: 15000 });
        await newCustomerNameInput.fill(customerLastName);
        


        // Search for the customer
        // await customerNameInput.fill(customerLastName);
        // await mainWindow.waitForTimeout(2000);

        // Find the row containing the unique customer
        const newRow = mainWindow
            .locator('.ag-center-cols-container .ag-row')
            .filter({ hasText: customerLastName })
            .first();

        await expect(newRow).toBeVisible({ timeout: 10000 });
        await newRow.hover();
        


        // Click on Shop Name link
        const customerLink = mainWindow.locator('a[ng-click*="gotoRouteCustomer"]').first();

        await expect(customerLink).toBeVisible();
        await customerLink.click();
        await mainWindow.waitForTimeout(3000);

        // Search for customer
        const custInput = mainWindow.locator('#custAutoComplete');
        await expect(custInput).toBeVisible({ timeout: 15000 });
        await custInput.fill(customerLastName);

        
        // Find the row containing the unique customer
        const cusRow = mainWindow
            .locator('.ag-center-cols-container .ag-row')
            .filter({ hasText: customerLastName })
            .first();

        await expect(cusRow).toBeVisible({ timeout: 10000 });
        await cusRow.hover();

        // Needs badge is visible
        const badge = mainWindow.locator('.cust-needs').first();
        await expect(badge).toBeVisible();
        await badge.click();
        await mainWindow.waitForTimeout(2000);

        // Click Trash Icon Opens Confirmation Modal
        // Confirm Deletion Removes Item
        
        const trashIcon = mainWindow.locator('i.fa-trash');

        // Click trash icon
        await trashIcon.first().click();

        // Click confirmation button
        await mainWindow.locator('button.swal-button--confirm').click();

        // Click Close Button
        const closeButton = mainWindow.locator('#btnBack');

        // Click the button
        await closeButton.click();
        await mainWindow.waitForTimeout(2000);

        await expect(mainWindow.locator("#sideMenu_dailyRoute_routeList")).toBeVisible();
    });
});