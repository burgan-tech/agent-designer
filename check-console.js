const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Listen to console messages
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });

  // Listen to page errors
  page.on('pageerror', error => {
    console.log(`[ERROR] ${error.message}`);
  });

  await page.goto('http://localhost:5173');

  // Wait a bit to capture console messages
  await page.waitForTimeout(5000);

  await browser.close();
})();