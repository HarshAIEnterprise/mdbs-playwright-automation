// =============================================================
// fixtures/electron.fixture.js
//
// Shared Electron fixture that launches the app ONCE and
// exposes `mainWindow` to every test file that imports it.
// All test files use `test` from this fixture instead of
// importing directly from @playwright/test.
// =============================================================

"use strict";

const { test: base, expect, _electron: electron } = require("@playwright/test");

// Extend Playwright's base `test` with two custom fixtures:
//   app        → the ElectronApplication instance
//   mainWindow → the main BrowserWindow page object
const test = base.extend({

    // -----------------------------------------------------------
    // `app` fixture — scoped to the whole worker (shared across
    // all tests in a file when using serial mode)
    // -----------------------------------------------------------
    app: [
        async({}, use) => {
            console.log("Launching Electron app...");

            const app = await electron.launch({
                executablePath: "C:\\MDBS3\\Application\\MDBS3.exe",
                cwd: "C:\\MDBS3\\Application",
                ignoreDefaultArgs: ["--inspect", "--remote-debugging-port"],
            });

            await use(app); // hand the app to the test

            console.log("Closing Electron app...");
            await app.close();
        },
        { scope: "worker" }, // one instance per parallel worker
    ],

    // -----------------------------------------------------------
    // `mainWindow` fixture — depends on `app`, also worker-scoped
    // -----------------------------------------------------------
    mainWindow: [
        async({ app }, use) => {
            // Grab the first window, then wait for the real main window
            await app.firstWindow();
            const mainWindow = await app.waitForEvent("window");
            await mainWindow.waitForLoadState("domcontentloaded");

            await use(mainWindow);
        },
        { scope: "worker" },
    ],
});

module.exports = { test, expect };