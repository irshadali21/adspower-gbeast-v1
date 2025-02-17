const { launchBrowser, saveSession, loadSession } = require("./backend/utils/puppeteerSetup");

(async () => {
    const { browser, page } = await launchBrowser("test-profile");

    await loadSession(page, "test-profile"); // Load saved session
    await page.goto("http://localhost:3000/login");

    console.log("✅ Opened Google Login Page");

    await saveSession(page, "test-profile"); // Save session on exit

    // Keep the browser open for testing
})();
