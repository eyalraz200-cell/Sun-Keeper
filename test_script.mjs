import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  
  await page.waitForTimeout(300);
  
  // Find and click first button with an img (deity card)
  const imgElement = await page.locator('button img').first();
  const parentButton = await imgElement.evaluate(el => el.closest('button'));
  if (parentButton) {
    await imgElement.click();
    await page.waitForTimeout(300);
  }
  
  await page.screenshot({ path: '/tmp/ritual_cards.png' });
  await browser.close();
})();
