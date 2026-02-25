"use strict";

const { test, expect } = require("../../../fixtures/electron.fixture");
const {
    loginIfNeeded,
    safeNavigateToRouteList,
    waitForSaveEnabled,
    selectRouteListShop,
} = require("../../../helpers/app.helpers");

test.describe.serial("Daily Route - Send Item Request", () => {

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

    test.skip("Daily Route - Send Item Request", async ({ mainWindow }) => {

        // ==================================
        // SEND ITEM REQUEST TO MATCO
        // ==================================
        // Go to Customers by clicking on the link in left navigation

        // Generate unique last name

        const uniqueNumber = Date.now().toString().slice(-4);
        const customerLastName = `Play${uniqueNumber}`;


        // -----------------------------------------------------------
        // TC-04: Create Customer from Customer List
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

        // Verify and click on "Set Status to Request
        // Locate the element by visible text (most reliable)
        const setStatusBtn = mainWindow.locator('span.ng-binding', {
            hasText: 'Set Status to Request'
        });

        // Verify it is visible
        await expect(setStatusBtn).toBeVisible();

        // Click the element
        await setStatusBtn.click();

        // Optional: Verify status changed after clicking
        await expect(
            mainWindow.locator('text=Set Status To Need')
        ).toBeVisible({ timeout: 5000 });


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

        // Verify and click on Orders navigation tab

        // Locate using visible text
        const ordersTab = mainWindow.locator('span[data-translate="ORDERS"]');


        // Validate visibility
        await expect(ordersTab).toBeVisible();

        // Click the element (if clickable)
        await ordersTab.click();


        // Verify and click on Build navigation tab

        // Locate using visible text
        const buildTab = mainWindow.locator('span[data-translate="BUILD"]');

        // Verify visibility
        await expect(buildTab).toBeVisible();

        // Click the element
        await buildTab.click();

        // Validate navigation

        await mainWindow.waitForTimeout(5000);



        // await expect(mainWindow.locator('#sideMenu_dailyRoute_customerList')).toBeVisible();

        // Click the plus icon

        // Locate the plus icon using its class
        const plusIcon = mainWindow.locator('span.fa.fa-plus.link-icon');

        // Verify the icon is visible
        // await expect(plusIcon).toBeVisible();

        // Click the icon
        await plusIcon.click();

        // Assert that on click of plus icon the Build Order modal opens
        const buildOrderModal = mainWindow.locator('#itemModal');
        await expect(buildOrderModal).toBeVisible();

        // Click Auto Build button in Build Order modal
        // Locate the Auto Build button using data-translate attribute
        const autoBuildButton = buildOrderModal.locator('button[data-translate="AUTO_BUILD"]');

        // Verify the button is visible and enabled
        await expect(autoBuildButton).toBeVisible();
        await expect(autoBuildButton).toBeEnabled();

        // Click the Auto Build button
        await autoBuildButton.click();

        // Optionally, verify modal closes after action
        await expect(buildOrderModal).toBeHidden({ timeout: 1000 });

        // await mainWindow.waitForTimeout(1000);


        // Sort by Create Date column in AG Grid for the latest order to be on top
        // Locate the Create Date column header by text
        const createDateHeader = mainWindow.locator('span.ag-header-cell-text', { hasText: 'Create Date' });

        // Verify the header is visible
        // await expect(createDateHeader).toBeVisible();

        // Optional: Click to sort the column
        await createDateHeader.click();
        // await createDateHeader.waitFor({ state: 'visible' });
        // await mainWindow.waitForTimeout(1000);
        await expect(createDateHeader).toBeVisible({ timeout: 2000 });
        await createDateHeader.click();


        // Read first row order number
        const firstRow = mainWindow.locator('.ag-center-cols-container .ag-row').first();
        await expect(firstRow).toBeVisible();

        const orderNumber = await firstRow
            .locator('[col-id="order"] .ag-cell-value')
            .innerText();

        const trimmedOrderNumber = orderNumber.trim();

        // Search using correct Order search input
        const orderSearchInput = mainWindow.getByPlaceholder('Order Number');
        await expect(orderSearchInput).toBeVisible();
        await orderSearchInput.fill(trimmedOrderNumber);

        // Wait for grid to filter automatically (no hard wait)
        const filteredRow = mainWindow
            .locator('.ag-row')
            .filter({
                has: mainWindow.locator('[col-id="order"]', {
                    hasText: trimmedOrderNumber
                })
            })
            .first();

        await expect(filteredRow).toBeVisible();

        // Click Edit inside filtered row
        const editButton = filteredRow.locator('button[title="Edit Order"]');
        await expect(editButton).toBeEnabled();
        await editButton.click();

        // Verify modal
        await expect(mainWindow.locator('#editOrderModal')).toBeVisible();
        await mainWindow.waitForTimeout(2000);


        // Enter 10 in "This" column and transmit order

        const rows = mainWindow.locator('.ag-center-cols-container .ag-row');
        await expect(rows.first()).toBeVisible();


        const thisQtyCell = rows.locator('[col-id="thisQty"]');
        await thisQtyCell.click();

        // Wait for inline editor
        const inputEditor = mainWindow.locator('.ag-text-field-input');
        await expect(inputEditor).toBeVisible();

        await inputEditor.fill('10');
        await inputEditor.press('Enter');


        // Send icon should be visible

        const sendIcon = mainWindow.getByRole('button', { name: 'Send' });

        await expect(sendIcon).toBeVisible();
        await sendIcon.click();


        // Handle SweetAlert confirmation modal
        const swalModal = mainWindow.locator('.swal-modal');
        // await expect(mainWindow.locator(swalModal)).toBeVisible();
        // await mainWindow.waitForTimeout(8000);
        // await expect(swalModal).toBeVisible();
        // await expect(swalModal).toContainText('Transmit Order');

        // Click Yes
        const yesButton = swalModal.locator('button.swal-button--confirm');
        await expect(yesButton).toBeVisible();
        await yesButton.click();

        // Wait for modal to disappear
        // await expect(swalModal).toBeHidden();
        await mainWindow.waitForTimeout(3000);
    });
});