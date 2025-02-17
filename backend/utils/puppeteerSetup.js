const path = require("path");
const fs = require("fs-extra");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

//Add fingerprinting protection:
const UserAgentPlugin = require("puppeteer-extra-plugin-anonymize-ua")();
const BlockResourcesPlugin = require("puppeteer-extra-plugin-block-resources")();
const UserPreferencesPlugin = require("puppeteer-extra-plugin-user-preferences");
const AnonymizeUA = require("puppeteer-extra-plugin-anonymize-ua");


puppeteer.use(StealthPlugin()); // Hide Puppeteer fingerprints
puppeteer.use(AnonymizeUA()); // Spoof User-Agent
puppeteer.use(UserAgentPlugin);
puppeteer.use(BlockResourcesPlugin);
puppeteer.use(UserPreferencesPlugin({
    prefs: {
        webkit: { webRTC: { multipleRoutesEnabled: false } },
        browser: { enable_do_not_track: true },
    }
}));
const PROFILE_DIR = path.join(__dirname, "../profiles"); // Save browser profiles


const activeBrowsers = {}; // Store active browser instances

async function getRunningProfiles() {
  return Object.keys(activeBrowsers);
}


async function launchBrowser(profileName, proxy = null) {
    const userDataDir = path.join(PROFILE_DIR, profileName);
    await fs.ensureDir(userDataDir);

    const launchOptions = {
        headless: false,
        userDataDir,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };

    if (proxy) {
        launchOptions.args.push(`--proxy-server=${proxy}`);
    }

    const browser = await puppeteer.launch(launchOptions);
    activeBrowsers[profileName] = browser;

    // Open a new page
    const page = await browser.newPage();

      // Inject WebRTC Spoofing
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => false });
        Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
        Object.defineProperty(navigator, "platform", { get: () => "Win32" });
    });


    // Detect logins by checking authentication cookies
    page.on("requestfinished", async () => {
        const cookies = await page.cookies();
        let detectedLogin = "Unknown";

        for (const cookie of cookies) {
            console.log(cookie);
            if (cookie.name.includes("SSID") && cookie.domain.includes("google")) {
                detectedLogin = "Google";
            } else if (cookie.name.includes("c_user") && cookie.domain.includes("facebook")) {
                detectedLogin = "Facebook";
            } else if (cookie.name.includes("auth_token") && cookie.domain.includes("twitter")) {
                detectedLogin = "Twitter";
            }
        }

        if (detectedLogin !== "Unknown") {
            await BrowserProfile.findOneAndUpdate(
                { profileName },
                { loginType: detectedLogin, lastLogin: new Date() },
                { new: true }
            );
        }
    });
    console.log(`🚀 Browser launched for profile: ${profileName}`);



    return { browser, page };
}


async function saveSession(page, profileName) {
    const cookies = await page.cookies();
    const sessionPath = path.join(PROFILE_DIR, profileName, "cookies.json");
    await fs.writeJson(sessionPath, cookies, { spaces: 2 });
    console.log("✅ Session cookies saved.");
}

async function loadSession(page, profileName) {
    const sessionPath = path.join(PROFILE_DIR, profileName, "cookies.json");
    if (fs.existsSync(sessionPath)) {
        const cookies = await fs.readJson(sessionPath);
        await page.setCookie(...cookies);
        console.log("✅ Session cookies loaded.");
    }
}


// Stop a running browser instance
async function stopBrowser(profileName) {
    if (activeBrowsers[profileName]) {
        await activeBrowsers[profileName].close();
        delete activeBrowsers[profileName]; // Remove reference
        console.log(`🛑 Browser closed for profile: ${profileName}`);
    } else {
        console.log(`⚠️ No active browser found for: ${profileName}`);
    }
}

async function getRunningProfiles() {
    return Object.keys(activeBrowsers);
}
module.exports = { launchBrowser, saveSession, loadSession, stopBrowser, getRunningProfiles };

