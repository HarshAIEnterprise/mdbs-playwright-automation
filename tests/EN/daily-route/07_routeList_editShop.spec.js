"use strict";

const { test, expect } = require("../../../fixtures/electron.fixture");
const {
    loginIfNeeded,
    safeNavigateToRouteList,
    selectRouteListShop,
} = require("../../../helpers/app.helpers");

test.describe.serial("Daily Route - Route List - Edit Shop", () => {

    test.beforeEach(async ({ mainWindow }) => {
        await loginIfNeeded(mainWindow);
    });

    test.afterEach(async ({ mainWindow }) => {
        await safeNavigateToRouteList(mainWindow);
    });

    test('Daily Route - Route List - Edit Shop', async ({ mainWindow }) => {

        // -------------------------
        // NAVIGATE TO ROUTE LIST
        // -------------------------
        const routelistLink = mainWindow.locator('#sideMenu_dailyRoute_routeList');
        await expect(routelistLink).toBeVisible({ timeout: 15000 });
        await routelistLink.click();

        const thuLabel = mainWindow.locator('label', { hasText: 'THU' });
        await expect(thuLabel).toBeVisible({ timeout: 15000 });
        await thuLabel.click();

        const addShopButton = mainWindow.locator('a[ng-click="vm.addNewShop($event)"]');
        await expect(addShopButton).toBeVisible({ timeout: 15000 });
        await addShopButton.click();

        // -------------------------
        // WAIT FOR SHOP MODAL
        // -------------------------
        const shopModal = mainWindow.locator('#shopEditModal');
        await expect(shopModal).toBeVisible({ timeout: 15000 });

        // -------------------------
        // BASIC FIELDS
        // -------------------------
        await mainWindow.waitForTimeout(500);
        await mainWindow.locator('#shopName').fill('playrightShop');
        await mainWindow.locator('#address1').fill('4403 Allen Rd');
        await mainWindow.locator('#city').fill('stow');

        const stateDropdown = mainWindow.locator('#state').locator('xpath=ancestor::span[contains(@class,"k-dropdown")]');
        await stateDropdown.click();
        const statePopup = mainWindow.locator('#state_listbox');
        await expect(statePopup).toBeVisible();
        await statePopup.getByRole('option', { name: 'Tennessee' }).click();

        const shopZipCode = mainWindow.locator('#postalCode');
        await shopZipCode.fill('44224');

        const shopPhone = mainWindow.locator('#phoneNumber');
        await shopPhone.fill('3345679098');

        await mainWindow.waitForTimeout(1000);
        const taxDropdown = mainWindow.locator('#taxAreaId').locator('xpath=ancestor::span[contains(@class,"k-dropdown")]');
        await taxDropdown.click();
        const taxPopup = mainWindow.locator('#taxAreaId_listbox');
        await expect(taxPopup).toBeVisible();
        await taxPopup.getByRole('option', { name: 'Piqua' }).click();

        // -------------------------
        // TOGGLE ADD SHOP CUSTOMER
        // -------------------------
        const shopSwitch = mainWindow
            .locator('#shopAddCustomer')
            .locator('xpath=ancestor::span[contains(@class,"km-switch")]');

        const switchClass = await shopSwitch.getAttribute('class');
        if (!switchClass?.includes('km-switch-on')) {
            await shopSwitch.click();
        }

        // -------------------------
        // ADD CONTACT
        // -------------------------
        const addContactBtn = mainWindow.getByTitle('Add Contact');
        await expect(addContactBtn).toBeVisible({ timeout: 10000 });
        await addContactBtn.click();

        const contactModal = mainWindow.locator('#contactModal');
        await expect(contactModal).toBeVisible({ timeout: 10000 });

        await mainWindow.locator('#name').fill('playrightContact');
        await mainWindow.locator('#title').fill('playrightTest');
        await mainWindow.locator('#cName0').fill('playright@gmail.com');
        await mainWindow.locator('#cName1').fill('(111)111-1111');

        const saveContact = contactModal.locator('button[data-translate="SAVE"]');
        await expect(saveContact).toBeEnabled();
        await saveContact.click();

        await expect(contactModal).toBeHidden({ timeout: 10000 });

        // -------------------------
        // SAVE SHOP
        // -------------------------
        const saveButton = shopModal.locator('input[data-translate="SAVE"]');
        await expect(saveButton).toBeEnabled({ timeout: 10000 });
        await saveButton.click();

        await expect(shopModal).toBeHidden({ timeout: 15000 });

        // Verify navigation
        await expect(
            mainWindow.locator('#sideMenu_dailyRoute_shops')
        ).toBeVisible({ timeout: 15000 });

    });
});