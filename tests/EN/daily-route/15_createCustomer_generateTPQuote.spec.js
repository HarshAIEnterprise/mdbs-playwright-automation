// =============================================================
// tests/daily-route/17_createCustomer_generateTPQuote.spec.js
// Test: Create Customer and Generate TP Quote
// =============================================================
"use strict";

const { test, expect } = require("../../../fixtures/electron.fixture");
const fs = require("fs");
const path = require("path");

const {
    loginIfNeeded,
    safeNavigateToRouteList,
} = require("../../../helpers/app.helpers");

test.describe.serial("Daily Route - Create Customer and Generate TP Quote", () => {
    test.setTimeout(120000); // 2 minutes
    test.beforeEach(async ({ mainWindow }) => {
        await loginIfNeeded(mainWindow);
    });

    test.afterEach(async ({ mainWindow }) => {
        try {
            if (typeof mainWindow.isClosed === 'function' && mainWindow.isClosed()) {
                console.log('Main window closed — skipping afterEach navigation');
            } else {
                await safeNavigateToRouteList(mainWindow);
            }
        } catch (err) {
            console.log('afterEach navigation error:', err.message);
        }
    });

    test("Create Customer and Generate TP Quote", async ({ mainWindow }) => {

        // Navigate to Customer List
        const customersLink = mainWindow.locator('#sideMenu_dailyRoute_customerList');
        await expect(customersLink).toBeVisible();
        await expect(customersLink).toBeEnabled();
        await customersLink.click();
        await mainWindow.waitForTimeout(2000);

        // Generate unique customer name
        const uniqueNumber = Date.now().toString().slice(-4);
        const customerFirstName = "Auto";
        const customerLastName = `Play${uniqueNumber}`;

        // Open Add customer form
        await mainWindow.locator(".fa-plus").first().click();
        await mainWindow.waitForTimeout(1000);

        // Fill First Name
        const firstName = mainWindow.locator("#firstName");
        await expect(firstName).toBeEditable();
        await firstName.fill(customerFirstName);
        await mainWindow.waitForTimeout(500);

        // Fill Last Name (Dynamic)
        const lastName = mainWindow.locator("#lastName");
        await expect(lastName).toBeEditable();
        await lastName.fill(customerLastName);
        await mainWindow.waitForTimeout(500);

        // Select Route Stop
        const routeStopDropdown = mainWindow.locator("#routeStopId");
        await expect(routeStopDropdown).toBeVisible();
        await routeStopDropdown.selectOption({ index: 1 });
        await mainWindow.waitForTimeout(1000);

        // Save customer
        const saveButton = mainWindow.locator('[ng-click="vm.validateAndSave()"]');
        await expect(saveButton).toBeVisible();
        await expect(saveButton).toBeEnabled();
        await saveButton.click();
        await mainWindow.waitForTimeout(2000);

        // Wait for list page to load
        await expect(mainWindow.locator("#sideMenu_dailyRoute_customerList")).toBeVisible();
        await mainWindow.waitForTimeout(2000);

        // Search for the created customer
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

        // Extract customer information
        const customerNumberElement = row.locator('.ag-cell').nth(0);
        const customerNumber = await customerNumberElement.textContent();

        const customerNameElement = row.locator('.ag-cell').nth(1);
        const fullCustomerName = await customerNameElement.textContent();

        const cleanCustomerNumber = customerNumber.trim();
        const cleanCustomerName = fullCustomerName.trim();

        // Hover and click on Sales icon
        await row.hover();
        await row.locator('[title="Sales"]').click();
        await mainWindow.waitForTimeout(1500);

        // ========================================
        // Click on Sale Toggle
        // ========================================
        console.log("\n========================================");
        console.log("Attempting to click Sale Toggle");
        console.log("========================================\n");

        // Debug: Check what's on the page
        const pageText = await mainWindow.locator('body').innerText();
        const hasSaleText = pageText.includes('Sale') || pageText.includes('SALE');
        const hasQuoteText = pageText.includes('Quote') || pageText.includes('QUOTE');
        console.log(`Page has 'Sale' text: ${hasSaleText}`);
        console.log(`Page has 'Quote' text: ${hasQuoteText}`);

        // Strategy: Click the label that's associated with the checkbox
        const checkboxInput = mainWindow.locator('input[type="checkbox"][id="saleType"]');
        const checkboxCount = await checkboxInput.count();
        console.log(`Found ${checkboxCount} checkbox input elements in DOM`);

        let toggleClicked = false;
        let initialState = null;
        let newState = null;
        let isQuoteMode = false;

        // Try clicking the associated label for each checkbox
        for (let i = 0; i < checkboxCount; i++) {
            const checkbox = checkboxInput.nth(i);

            const isEnabled = await checkbox.isEnabled();
            const isChecked = await checkbox.isChecked();
            console.log(`Checkbox ${i} - enabled: ${isEnabled}, checked: ${isChecked}`);

            if (isEnabled) {
                initialState = isChecked;
                console.log(`Initial checkbox state: ${initialState}`);

                let labelClicked = false;

                // Method 1: Find label with for="saleType"
                let label = mainWindow.locator(`label[for="saleType"]`).nth(i);
                let labelVisible = await label.isVisible();
                console.log(`Label ${i} (method 1) visible: ${labelVisible}`);

                if (labelVisible) {
                    await label.click();
                    await mainWindow.waitForTimeout(1500);
                    console.log("✓ Clicked label element");
                    labelClicked = true;
                } else {
                    label = mainWindow.locator(`label[for="saleType"]`);
                    const allLabels = await label.count();
                    console.log(`Total labels with for="saleType": ${allLabels}`);

                    if (allLabels > 0) {
                        for (let j = 0; j < allLabels; j++) {
                            const currentLabel = label.nth(j);
                            if (await currentLabel.isVisible()) {
                                await currentLabel.click();
                                await mainWindow.waitForTimeout(1500);
                                console.log(`✓ Clicked label ${j}`);
                                labelClicked = true;
                                break;
                            }
                        }
                    }
                }

                if (labelClicked) {
                    toggleClicked = true;
                    newState = await checkbox.isChecked();
                    console.log(`New checkbox state: ${newState}`);

                    if (initialState !== newState) {
                        console.log("✓ Checkbox state changed successfully");
                        break;
                    } else {
                        console.log("⚠ Warning: Checkbox state did not change, trying next");
                    }
                }
            }
        }

        if (!toggleClicked) {
            console.log("✗ Could not click any checkbox label");
        }

        // Verify we're in Quote mode by checking if Complete Quote button appears
        const completeQuoteBtn = mainWindow.locator('span[data-translate="COMPLETE_QUOTE"]');
        const quoteButtonCount = await completeQuoteBtn.count();

        if (quoteButtonCount > 0) {
            isQuoteMode = true;
            console.log("✓ Quote mode verified - Complete Quote button is visible");
        } else {
            console.log("✗ Quote mode not verified - Complete Quote button not found");
        }

        if (!isQuoteMode) {
            throw new Error("Failed to enter Quote mode. Complete Quote button not found.");
        }

        // Add Item
        const itemInput = mainWindow.locator('input#itemNumber0');
        await expect(itemInput).toBeVisible();
        await itemInput.fill('01A515LD');
        await mainWindow.waitForTimeout(1000);

        const dropdownItem = mainWindow.locator('.uib-typeahead-match');
        await expect(dropdownItem.first()).toBeVisible();
        await dropdownItem.first().click();
        await mainWindow.waitForTimeout(1000);

        // Click Complete Quote Button
        const completeQuoteBtnClick = mainWindow.locator('span[data-translate="COMPLETE_QUOTE"]');
        await expect(completeQuoteBtnClick).toBeVisible();
        await completeQuoteBtnClick.scrollIntoViewIfNeeded();
        await mainWindow.waitForTimeout(1000);
        await completeQuoteBtnClick.click();

        // wait 2 seconds as specified then click Done & No Print
        await mainWindow.waitForTimeout(2000);
        const doneNoPrintBtnImmediate = mainWindow.locator('span[data-translate="DONE_NO_PRINT"]');
        if (await doneNoPrintBtnImmediate.count() > 0) {
            const btn = doneNoPrintBtnImmediate.first();
            try {
                const overlay = mainWindow.locator('div.swal-overlay');
                if (await overlay.count() > 0 && await overlay.first().isVisible()) {
                    await overlay.first().waitFor({ state: 'hidden', timeout: 3000 }).catch(() => { });
                }
                await btn.waitFor({ state: 'visible', timeout: 5000 });
                try {
                    await btn.click();
                } catch (clickErr) {
                    await btn.click({ force: true });
                }
                await mainWindow.waitForTimeout(1000);
                console.log('Clicked Done & No Print');
            } catch (err) {
                console.log('Could not click Done & No Print:', err.message);
            }
        } else {
            console.log('Done & No Print button not found after Complete Quote');
        }


        // Prepare output storage path
        const outputDir = path.join(process.cwd(), 'output');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        const outputFile = path.join(outputDir, 'tp_quote_details.txt');

        // Log Results
        console.log("\n========================================");
        console.log("TP QUOTE GENERATION REPORT");

        // Extract Invoice/Quote Number (guarded)
        let invoiceNumber = "N/A";
        try {
            if (typeof mainWindow.isClosed === 'function' && mainWindow.isClosed()) {
                console.log('Main window closed — skipping invoice extraction');
            } else {
                await mainWindow.waitForTimeout(2000);
                const saleNumberElement = mainWindow.locator('span.sale-number, [class*="sale-number"], [class*="invoice"], [class*="quote"]').first();
                if (await saleNumberElement.count() > 0 && await saleNumberElement.first().isVisible()) {
                    invoiceNumber = (await saleNumberElement.textContent()).trim();
                }
                if (invoiceNumber === "N/A" || invoiceNumber === "") {
                    const pageContent = await mainWindow.locator('body').innerText();
                    const patterns = [
                        /Sale\s*#?\s*:?\s*(\d+)/i,
                        /Sale\s*Number\s*:?\s*(\d+)/i,
                        /Invoice\s*#?\s*:?\s*(\d+)/i,
                        /Quote\s*#?\s*:?\s*(\d+)/i,
                        /Receipt\s*#?\s*:?\s*(\d+)/i,
                        /\b(\d{4,})\b/
                    ];
                    for (const pattern of patterns) {
                        const match = pageContent.match(pattern);
                        if (match) {
                            invoiceNumber = match[1];
                            break;
                        }
                    }
                }
            }
        } catch (err) {
            console.log('Error extracting invoice number or window closed:', err.message);
        }

        const outputContent = `Customer Number: ${cleanCustomerNumber}\nCustomer Name: ${cleanCustomerName}\nInvoice/Quote: ${invoiceNumber}\nMessage: tp quote has been generated.\n`;
        fs.writeFileSync(outputFile, outputContent, 'utf8');
        console.log(`Report saved to: ${outputFile}`);

        await expect(mainWindow.locator('#sideMenu_dailyRoute_customerList')).toBeVisible();

        await expect(mainWindow.locator('#sideMenu_dailyRoute_customerList')).toBeVisible();
    });
});
