"use strict";

const { test, expect } = require("../../../fixtures/electron.fixture");
const {
    loginIfNeeded,
    safeNavigateToRouteList,
    waitForSaveEnabled,
    selectRouteListShop,
} = require("../../../helpers/app.helpers");

test.describe.serial("Daily Route - Customer list - Submit credit application", () => {

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

    test("Daily Route - Customer list - Submit credit application", async ({ mainWindow }) => {

        const customersLink = mainWindow.locator('#sideMenu_dailyRoute_customerList');
        await expect(customersLink).toBeVisible();
        await expect(customersLink).toBeEnabled();
        await customersLink.click();

        const customerNameInput = mainWindow.locator('#customerName');
        await expect(customerNameInput).toBeVisible();
        await expect(customerNameInput).toBeEditable();
        await customerNameInput.fill('PWFN');
        await mainWindow.waitForTimeout(1000);

        // Find the the customer
        const row = mainWindow
            .locator('.ag-center-cols-container .ag-row')
            .filter({ hasText: 'PWFN' })
            .first();

        await expect(row).toBeVisible();
        await row.hover();

        const creditAppButton = row.locator('button[title="Credit App"]');
        await mainWindow.waitForTimeout(1000);
        await creditAppButton.click();
        await expect(creditAppButton).toBeVisible();
        await mainWindow.waitForTimeout(1000);

        const credtDtBirth = mainWindow.locator('#dtBirth');
        await expect(credtDtBirth).toBeVisible();
        await expect(credtDtBirth).toBeEditable();
        await credtDtBirth.fill('1/8/2008');

        //Click next arrow
        const nextArrow = mainWindow
            .locator('span.fa-chevron-circle-right.cursorptr')
            .first();
        await expect(nextArrow).toBeVisible();
        await nextArrow.click();
        await mainWindow.waitForTimeout(1000);

        const occupancyStatus = mainWindow.locator('#occupancyStatus');
        await mainWindow.locator('#occupancyStatus').selectOption({
            label: 'Own'
        });

        const occupancyLength = mainWindow.locator('#yearsAtResidence');
        await expect(occupancyLength).toBeVisible();
        await expect(occupancyLength).toBeEditable();
        await occupancyLength.fill('2');
        await mainWindow.waitForTimeout(500);

        const nextArrow2 = mainWindow.locator('span.fa-chevron-circle-right');
        await expect(nextArrow2).toBeVisible();
        await nextArrow2.click();

        const nextArrow3 = mainWindow.locator('span.fa-chevron-circle-right');
        await expect(nextArrow3).toBeVisible();
        await nextArrow3.click();

        const jobTitle = mainWindow.locator('#employerOccupation');
        await expect(jobTitle).toBeVisible();
        await expect(jobTitle).toBeEditable();
        await jobTitle.fill('TECH');

        const employmentStatus = mainWindow.locator('#employmentStatus')
        await mainWindow.locator('#employmentStatus').selectOption({
            label: 'Full Time'
        });


        const employerContactName = mainWindow.locator('#employerContactName');
        await expect(employerContactName).toBeVisible();
        await expect(employerContactName).toBeEditable();
        await employerContactName.fill('TIM');

        const nextArrow4 = mainWindow.locator('span.fa-chevron-circle-right');
        await expect(nextArrow4).toBeVisible();
        await nextArrow4.click();

        await mainWindow.waitForTimeout(1000);
        const refName1 = mainWindow.locator('#referenceName1');
        await expect(refName1).toBeVisible();
        await expect(refName1).toBeEditable();
        await refName1.fill('Ref1');

        const refPhone1 = mainWindow.locator('#referencePhone1');
        await expect(refPhone1).toBeVisible();
        await expect(refPhone1).toBeEditable();
        await refPhone1.fill('(777) 777-7777');

        const refName2 = mainWindow.locator('#referenceName2');
        await expect(refName2).toBeVisible();
        await expect(refName2).toBeEditable();
        await refName2.fill('Ref2');

        const refPhone2 = mainWindow.locator('#referencePhone2');
        await expect(refPhone2).toBeVisible();
        await expect(refPhone2).toBeEditable();
        await refPhone2.fill('(888) 888-8888');

        const nextArrow5 = mainWindow.locator('span.fa-chevron-circle-right');
        await expect(nextArrow5).toBeVisible();
        await nextArrow5.click();

        const agreeCheckbox = mainWindow.locator('#agreeToTerms');

        // Wait for it to be attached to DOM instead of visible
        await agreeCheckbox.waitFor({ state: 'attached', timeout: 10000 });

        // Check even if hidden (common styled-checkbox pattern)
        await agreeCheckbox.check({ force: true });
        await expect(agreeCheckbox).toBeChecked();

        const signButton = mainWindow.locator('input[type="button"][value="Sign"]');
        await expect(signButton).toBeVisible();
        await expect(signButton).toBeEnabled();
        await signButton.click();

        // // Wait for signature dialog
        // const dialog = mainWindow.getByRole('dialog');
        // await expect(dialog).toBeVisible();

        // // Locate canvas inside dialog
        // const canvas = dialog.locator('canvas');
        // await expect(canvas).toBeVisible();

        // // Simulate signature drawing
        // const box = await canvas.boundingBox();

        // await mainWindow.mouse.move(box.x + 20, box.y + 20);
        // await mainWindow.mouse.down();
        // await mainWindow.mouse.move(box.x + 120, box.y + 60);
        // await mainWindow.mouse.move(box.x + 200, box.y + 40);
        // await mainWindow.mouse.up();

        await mainWindow.waitForTimeout(5000);
        // Click Save inside dialog
        const saveSignatureButton = dialog.getByRole('button', { name: /save/i });
        await expect(saveSignatureButton).toBeEnabled();
        await saveSignatureButton.click();

        // Wait for dialog to close
        await expect(dialog).toBeHidden();

        // const submitButton = mainWindow.locator('input[type="button"][value="Submit"]');
        // await expect(submitButton).toBeVisible();
        // await submitButton.click();

        await mainWindow.waitForTimeout(500);
        const actionButton = mainWindow
            .locator('input[type="button"][value="Finish"], input[type="button"][value="Resubmit"]')
            .first();

        await expect(actionButton).toBeVisible();
        await expect(actionButton).toBeEnabled({ timeout: 10000 });
        await actionButton.click();

        await expect(actionButton).toBeVisible();
        await expect(actionButton).toBeEnabled({ timeout: 10000 });
        await actionButton.click();

        await expect(actionButton).toBeEnabled({ timeout: 10000 });
        await actionButton.click();

        //Handle Application Status Details popup if it appears
        const modal = mainWindow.locator('.inmodal');

        try {
            await modal.waitFor({ state: 'visible', timeout: 5000 });

            const closeButton = modal.locator('a[data-translate="CLOSE"]');
            await expect(closeButton).toBeVisible();
            await closeButton.click();

            await modal.waitFor({ state: 'hidden' });
        } catch {
            // Popup did not appear — continue safely
        }
    });
});