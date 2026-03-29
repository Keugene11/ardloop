import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const BASE_URL = 'https://ardloop.vercel.app';
const OUTPUT_DIR = join(process.cwd(), 'screenshots');

// App Store requires 6.7" (1290x2796) and 6.5" (1284x2778) screenshots
const DEVICE = {
  width: 430,
  height: 932,
  deviceScaleFactor: 3, // 430*3 = 1290 for 6.7"
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  isMobile: true,
  hasTouch: true,
};

async function takeScreenshots() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport(DEVICE);
  await page.setUserAgent(DEVICE.userAgent);

  // Screenshot 1: Feed / Home page
  console.log('Taking screenshot: Feed...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('h1', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: join(OUTPUT_DIR, '01-feed.png'), fullPage: false });

  // Screenshot 2: Login page
  console.log('Taking screenshot: Login...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: join(OUTPUT_DIR, '02-login.png'), fullPage: false });

  // Screenshot 3: Try to get a post detail page
  console.log('Taking screenshot: Post detail...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Click the first post if available
  const firstPost = await page.$('article');
  if (firstPost) {
    await firstPost.click();
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: join(OUTPUT_DIR, '03-post.png'), fullPage: false });
  }

  await browser.close();
  console.log(`Screenshots saved to ${OUTPUT_DIR}`);
}

takeScreenshots().catch(console.error);
