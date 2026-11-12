const { chromium } = require('playwright');

(async () => {
  // Launch browser in headed mode to visually see the entire flow and UI
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to Self Registration...');
  await page.goto('https://qa_care.amerck.com/signup');
  await page.waitForTimeout(1500);

  // ==========================================
  // STEP 1: ACCOUNT CREDENTIALS
  // ==========================================
  console.log('--- Step 1: Filling Account Details ---');
  const timestamp = Date.now();
  const username = `dr_ravee_${timestamp}`;
  const password = 'Pass@word123!';
  const email = `dr_ravee_${timestamp}@example.com`;

  await page.locator('input[name="firstName"]').fill('ravee');
  await page.locator('input[name="lastName"]').fill('Rathnayeke 1');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="mobileNumber"]').fill('+94771234567');
  await page.locator('input[name="nic"]').fill('199012345678');
  await page.locator('input[name="licenseNumber"]').fill('SLMC-78945');
  await page.locator('input[name="password"]').fill(password);
  await page.locator('input[name="confirmPassword"]').fill(password);

  console.log('Advancing to Step 2 (Package)...');
  await page.locator('button', { hasText: 'Next' }).click();
  await page.waitForTimeout(2000);

  // ==========================================
  // STEP 2: SELECT SUBSCRIPTION PACKAGE
  // ==========================================
  console.log('--- Step 2: Selecting Subscription Plan ---');
  await page.waitForSelector('text=Standard Plan', { timeout: 15000 });
  const standardPlan = page.locator('text=Standard Plan').first();
  await standardPlan.click();
  await page.waitForTimeout(500);

  console.log('Advancing to Step 3 (Payment)...');
  await page.locator('button', { hasText: 'Proceed to Payment' }).click();
  await page.waitForSelector('text=Payment & Activation', { timeout: 15000 });

  // ==========================================
  // STEP 3: PAYMENT & ACTIVATION (NO ZIP CODE)
  // ==========================================
  console.log('--- Step 3: Card Details (Card Number, MM/YY, CVC - No ZIP) ---');
  // Apply 3 Months Free promo code to streamline
  const promoInput = page.locator('input[placeholder*="THREE_MONTHS_FREE"], input[placeholder*="Coupon" i]');
  if (await promoInput.count() > 0) {
    await promoInput.fill('THREE_MONTHS_FREE');
    await page.locator('button', { hasText: 'Apply' }).click();
    await page.waitForTimeout(1000);
  }

  await page.waitForSelector('iframe[name^="__privateStripeFrame"]', { timeout: 15000 });
  const cardFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();

  await cardFrame.locator('input[name="cardnumber"]').fill('4242424242424242');
  await cardFrame.locator('input[name="exp-date"]').fill('12/34');
  await cardFrame.locator('input[name="cvc"]').fill('123');
  await page.waitForTimeout(500);

  const postalLocator = cardFrame.locator('input[name="postal"]');
  if (await postalLocator.count() > 0) {
    await postalLocator.fill('10001').catch(() => {});
  }

  console.log('Submitting Payment...');
  const payBtn = page.locator('button:has-text("Pay"), button:has-text("Start Subscription")').first();
  await payBtn.click();

  // ==========================================
  // STEP 4: COMPLETE & ACCOUNT CONFIRMATION
  // ==========================================
  console.log('--- Step 4: Account Ready Confirmation ---');
  await page.waitForSelector('text=Account Ready!', { timeout: 30000 });
  console.log('Registration completed! Proceeding to Login Dashboard...');

  const proceedBtn = page.locator('button:has-text("Proceed to Login Dashboard")').first();
  await proceedBtn.click();
  await page.waitForURL(/login/, { timeout: 15000 });
  console.log('Landed on Login URL:', page.url());

  // ==========================================
  // STEP 5: LOGIN WITH NEW DOCTOR CREDENTIALS
  // ==========================================
  console.log(`--- Logging in as newly registered doctor (${username}) ---`);
  const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  const signInBtn = page.locator('button:has-text("Sign In"), button:has-text("Login")').first();

  await usernameInput.fill(username);
  await passwordInput.fill(password);
  await signInBtn.click();

  // ==========================================
  // STEP 6: DOCTOR PROFILE ONBOARDING UI
  // ==========================================
  console.log('--- Landed on Doctor Profile Onboarding UI ---');
  await page.waitForSelector('text=Complete your doctor profile and review agreement to get started.', { timeout: 20000 });

  // Fill in the exact fields shown in the reference figure:
  console.log('Filling Doctor Profile:');
  console.log('  Display Name: Dr. ravee Rathnayeke 1');
  await page.locator('input[name="display_name"]').fill('Dr. ravee Rathnayeke 1');

  console.log('  Specification / Speciality: Neurosurgeon');
  await page.locator('select[name="speciality"]').selectOption({ label: 'Neurosurgeon' });

  console.log('  Qualification: MBBS');
  await page.locator('input[name="qualification"]').fill('MBBS');

  // Pause so you can inspect the UI in browser
  console.log('Successfully reached and filled the Doctor Profile Onboarding UI!');
  await page.waitForTimeout(5000);

  // Click Continue to EULA Agreement
  console.log('Clicking Continue to EULA Agreement ->');
  await page.locator('button:has-text("Continue to EULA Agreement")').click();
  await page.waitForSelector('text=END USER LICENSE AGREEMENT', { timeout: 15000 });

  // Accept EULA
  console.log('Accepting EULA and proceeding to Dashboard...');
  await page.locator('input[type="checkbox"]').check();
  await page.locator('button:has-text("Accept & Continue to Dashboard")').click();
  await page.waitForTimeout(4000);

  console.log('Successfully onboarded! Dashboard URL:', page.url());
  await browser.close();
  console.log('Done!');
})();
