import puppeteer from "puppeteer";

const BASE_URL = "https://ardsleypost.vercel.app";

// iPad Pro 12.9" (2nd gen) / 13-inch: 2048x2732 at 2x = 1024x1366 viewport
const VIEWPORT = { width: 1024, height: 1366, deviceScaleFactor: 2 };

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  // Step 1: Demo login to get an authenticated session
  console.log("Logging in with demo account...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2", timeout: 30000 });

  // Tap the subtitle 5 times to reveal demo buttons
  const subtitle = await page.waitForSelector("p.text-\\[15px\\]");
  for (let i = 0; i < 5; i++) {
    await subtitle.click();
    await new Promise((r) => setTimeout(r, 100));
  }
  await new Promise((r) => setTimeout(r, 500));

  // Click "Demo User 1"
  const buttons = await page.$$("button");
  let demoBtn = null;
  for (const btn of buttons) {
    const text = await btn.evaluate((el) => el.textContent);
    if (text?.includes("Demo User 1")) {
      demoBtn = btn;
      break;
    }
  }

  if (!demoBtn) {
    console.error("Could not find Demo User 1 button");
    await browser.close();
    return;
  }

  await demoBtn.click();
  console.log("Clicked demo login, waiting for redirect...");

  // Wait for navigation to complete (demo login redirects to /)
  await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 2000));

  // Ensure we're on the feed
  if (!page.url().includes("/login")) {
    console.log("Logged in! Current URL:", page.url());
  } else {
    // Try navigating to home
    await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));
  }

  // Screenshot 1: Feed
  console.log("Taking feed screenshot...");
  await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: "screenshots/ipad-01-feed.png", fullPage: false });
  console.log("  Saved ipad-01-feed.png");

  // Screenshot 2: Profile
  console.log("Taking profile screenshot...");
  await page.goto(`${BASE_URL}/profile`, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: "screenshots/ipad-02-profile.png", fullPage: false });
  console.log("  Saved ipad-02-profile.png");

  // Screenshot 3: Messages
  console.log("Taking messages screenshot...");
  await page.goto(`${BASE_URL}/messages`, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: "screenshots/ipad-03-messages.png", fullPage: false });
  console.log("  Saved ipad-03-messages.png");

  // Screenshot 4: Try to find a post to screenshot
  console.log("Taking post detail screenshot...");
  await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1000));

  // Click first post link
  const postLink = await page.$('a[href^="/post/"]');
  if (postLink) {
    await postLink.click();
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: "screenshots/ipad-04-post.png", fullPage: false });
    console.log("  Saved ipad-04-post.png");
  } else {
    console.log("  No posts found, skipping post detail screenshot");
  }

  await browser.close();
  console.log("\nDone! iPad screenshots saved to screenshots/");
}

run().catch(console.error);
