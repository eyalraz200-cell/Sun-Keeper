const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  
  await page.waitForTimeout(300);
  
  // Find and click first button with an img (deity card)
  const hasImage = await page.locator('button img').first();
  if (hasImage) {
    await hasImage.locator('..').click();
    await page.waitForTimeout(300);
  }
  
  await page.screenshot({ path: '/tmp/ritual_cards.png' });
  await browser.close();
  process.exit(0);
})();
