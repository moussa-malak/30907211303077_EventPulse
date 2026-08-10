
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const APP_URL = process.env.APP_URL || 'http://localhost:3000';

  try {
    console.log('Opening app...');
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });

    const title = await page.title();
    console.log('Page title:', title);

    const requiredSelectors = [
      'body',
      'main',
      'nav',
      'button',
      'a',
      'input',
      'form',
      'h1',
      'h2',
    ];

    for (const selector of requiredSelectors) {
      const exists = await page.locator(selector).first().count();
      if (exists > 0) {
        console.log(`Found ${selector} element.`);
      }
    }

    const interactiveButtons = await page.locator('button, a[href], input[type="submit"], input[type="button"]').count();
    console.log('Interactive elements found:', interactiveButtons);

    const visibleText = await page.locator('body').innerText();
    console.log('Page text length:', visibleText.length);

    const forms = await page.locator('form').count();
    if (forms > 0) {
      console.log('Forms found:', forms);
      const firstForm = page.locator('form').first();
      const formInputs = await firstForm.locator('input, textarea, select').count();
      console.log('Inputs in first form:', formInputs);
    }

    const navigationLinks = await page.locator('a[href]').allTextContents();
    console.log('Navigation links:', navigationLinks.slice(0, 10));

    const hasError = await page.locator('text=/error|404|not found/i').count();
    if (hasError > 0) {
      throw new Error('The app rendered an error state.');
    }

    console.log('E2E smoke test passed.');
  } catch (error) {
    console.error('E2E test failed:', error.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
