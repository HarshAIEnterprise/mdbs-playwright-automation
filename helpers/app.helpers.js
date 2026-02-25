// =============================================================
// helpers/app.helpers.js
// =============================================================
"use strict";

const { expect } = require("@playwright/test");

const CREDENTIALS = { username: "411116", password: "matcotools#1" };

async function isLoggedIn(mainWindow) {
    try {
        await mainWindow.locator("#sideMenu_dailyRoute_routeList").waitFor({ state: "visible", timeout: 3000 });
        return true;
    } catch { return false; }
}

async function isOnLoginScreen(mainWindow) {
    try {
        await mainWindow.locator('input[placeholder="Username"]').waitFor({ state: "visible", timeout: 3000 });
        return true;
    } catch { return false; }
}

async function performLogin(mainWindow) {
    console.log("[Recovery] Performing login...");
    await mainWindow.waitForSelector('input[placeholder="Username"]', { state: "visible", timeout: 15000 });
    await mainWindow.getByPlaceholder("Username").fill(CREDENTIALS.username);
    await mainWindow.locator("#password").fill(CREDENTIALS.password);
    const loginButton = mainWindow.locator("#login");
    await expect(loginButton).toBeVisible();
    await mainWindow.waitForFunction(() => { const btn = document.querySelector("#login"); return btn && !btn.disabled; });
    await loginButton.click();


    console.log("[Recovery] Login successful.");
    const settingsButton = mainWindow.locator('[data-translate="SETTINGS"]');
    await settingsButton.waitFor({ state: 'visible' });
    await settingsButton.click();

    // Open Language submenu
    const languageMenu = mainWindow.locator('[data-translate="LANGUAGE"]');
    await languageMenu.waitFor({ state: 'visible' });
    await languageMenu.hover();

    // Click requested language ALWAYS
    const languageOption = mainWindow.locator(
        `[ng-click="layout.changeLanguage('en')"]`
    );

    await languageOption.waitFor({ state: 'visible' });
    await languageOption.click();

    // Wait for Angular to refresh translations
    await mainWindow.waitForTimeout(1500);

    await expect(mainWindow.getByText('SUN')).toBeVisible();

}

async function performLoginES(mainWindow) {
    console.log("[Recovery] Performing login...");
    await mainWindow.waitForSelector('input[placeholder="Username"]', { state: "visible", timeout: 15000 });
    await mainWindow.getByPlaceholder("Username").fill(CREDENTIALS.username);
    await mainWindow.locator("#password").fill(CREDENTIALS.password);
    const loginButton = mainWindow.locator("#login");
    await expect(loginButton).toBeVisible();
    await mainWindow.waitForFunction(() => { const btn = document.querySelector("#login"); return btn && !btn.disabled; });
    await loginButton.click();
    await expect(mainWindow.locator("#sideMenu_dailyRoute_routeList")).toBeVisible({ timeout: 30000 });
    const routelistLink = mainWindow.locator("#sideMenu_dailyRoute_routeList");
    await expect(routelistLink).toBeVisible();
    await expect(routelistLink).toBeEnabled();

    const settingsButton = mainWindow.locator('[data-translate="SETTINGS"]');
    await settingsButton.waitFor({ state: 'visible' });
    await settingsButton.click();

    // Open Language submenu
    const languageMenu = mainWindow.locator('[data-translate="LANGUAGE"]');
    await languageMenu.waitFor({ state: 'visible' });
    await languageMenu.hover();

    // Click requested language ALWAYS
    const languageOption = mainWindow.locator(
        `[ng-click="layout.changeLanguage('es')"]`
    );

    await languageOption.waitFor({ state: 'visible' });
    await languageOption.click();

    // Wait for Angular to refresh translations
    await mainWindow.waitForTimeout(1500);

    await expect(mainWindow.getByText('DOM')).toBeVisible();

    console.log("[Recovery] Login successful.");
}


async function dismissModalIfOpen(mainWindow) {
    try {
        const closeBtn = mainWindow.locator('.modal .close, [data-dismiss="modal"], .btn-cancel, button:has-text("Cancel")');
        if (await closeBtn.count() > 0) {
            await closeBtn.first().click();
            await mainWindow.waitForTimeout(500);
            return;
        }
        await mainWindow.keyboard.press("Escape");
        await mainWindow.waitForTimeout(300);
    } catch { /* no modal — safe to ignore */ }
}

async function loginIfNeeded(mainWindow) {
    if (await isLoggedIn(mainWindow)) { console.log("[beforeEach] Already logged in."); return; }
    if (await isOnLoginScreen(mainWindow)) {
        console.log("[beforeEach] Login screen — logging in...");
        await performLogin(mainWindow);
        return;
    }
    console.log("[beforeEach] Unknown state — attempting recovery...");
    await dismissModalIfOpen(mainWindow);
    if (await isLoggedIn(mainWindow)) { console.log("[beforeEach] Recovered."); return; }
    if (await isOnLoginScreen(mainWindow)) { await performLogin(mainWindow); return; }
    throw new Error("[beforeEach] Could not recover app to a known state. Check screenshots.");
}

async function loginIfNeededES(mainWindow) {
    if (await isLoggedIn(mainWindow)) { console.log("[beforeEach] Already logged in."); return; }
    if (await isOnLoginScreen(mainWindow)) {
        console.log("[beforeEach] Login screen — logging in...");
        await performLoginES(mainWindow);
        return;
    }
    console.log("[beforeEach] Unknown state — attempting recovery...");
    await dismissModalIfOpen(mainWindow);
    if (await isLoggedIn(mainWindow)) { console.log("[beforeEach] Recovered."); return; }
    if (await isOnLoginScreen(mainWindow)) { await performLoginES(mainWindow); return; }
    throw new Error("[beforeEach] Could not recover app to a known state. Check screenshots.");
}


async function safeNavigateToRouteList(mainWindow) {
    try {
        const link = mainWindow.locator("#sideMenu_dailyRoute_routeList");
        await link.waitFor({ state: "visible", timeout: 5000 });
        await link.click();
        await mainWindow.waitForLoadState("domcontentloaded");
        console.log("[afterEach] Navigated to Route List.");
    } catch {
        console.warn("[afterEach] Route List not reachable — loginIfNeeded() will recover before next test.");
    }
}

async function navigateToRouteList(mainWindow) {
    const link = mainWindow.locator("#sideMenu_dailyRoute_routeList");
    await expect(link).toBeVisible();
    await expect(link).toBeEnabled();
    await link.click();
    await mainWindow.waitForTimeout(1000);
    await mainWindow.waitForLoadState("domcontentloaded");
}

async function navigateToCustomerList(mainWindow) {
    const link = mainWindow.locator("#sideMenu_dailyRoute_customerList");
    await expect(link).toBeVisible();
    await expect(link).toBeEnabled();
    await link.click();
    await mainWindow.waitForLoadState("domcontentloaded");
}

async function waitForSaveEnabled(mainWindow) {
    await mainWindow.waitForFunction(() => {
        const btn = document.querySelector('input[value="Save"]');
        return btn && !btn.classList.contains("disabled-section");
    });
}

async function selectRouteListShop(mainWindow, dayLabel, shopName) {
    const dayBtn = mainWindow.locator("label", { hasText: dayLabel });
    await expect(dayBtn).toBeVisible();
    await dayBtn.click();
    const shopCell = mainWindow.getByRole("gridcell", { name: shopName });
    await expect(shopCell).toBeVisible();
    await shopCell.click();
    await mainWindow.waitForTimeout(500);
}

module.exports = {
    isLoggedIn,
    isOnLoginScreen,
    loginIfNeeded,
    loginIfNeededES,
    performLogin,
    performLoginES,
    dismissModalIfOpen,
    safeNavigateToRouteList,
    navigateToRouteList,
    navigateToCustomerList,
    waitForSaveEnabled,
    selectRouteListShop,
};