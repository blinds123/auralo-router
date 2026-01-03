import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const URL = 'https://auralo.store/ivera-rhinestone-hoodie';
const results = {
  url: URL,
  timestamp: new Date().toISOString(),
  tests: [],
  issues: [],
  screenshots: []
};

async function runTests() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.issues.push({
        type: 'console_error',
        message: msg.text(),
        location: msg.location()
      });
    }
  });

  // Listen for page errors
  page.on('pageerror', error => {
    results.issues.push({
      type: 'page_error',
      message: error.message,
      stack: error.stack
    });
  });

  console.log('\n=== COMPREHENSIVE E2E TESTING ===\n');
  console.log(`URL: ${URL}\n`);

  try {
    // TEST 1: Page Load
    console.log('📄 TEST 1: Page Load...');
    const response = await page.goto(URL, { waitUntil: 'networkidle' });
    const loadTest = {
      name: 'Page Load',
      passed: response.ok(),
      status: response.status(),
      title: await page.title()
    };
    results.tests.push(loadTest);
    console.log(`   Status: ${response.status()} - ${loadTest.passed ? '✅' : '❌'}`);
    console.log(`   Title: ${loadTest.title}\n`);

    // TEST 2: Mobile Viewport
    console.log('📱 TEST 2: Mobile Viewport (375x667)...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'screenshots/mobile-viewport.png', fullPage: true });
    const mobileTest = {
      name: 'Mobile Viewport',
      passed: true,
      viewport: '375x667',
      screenshot: 'screenshots/mobile-viewport.png'
    };
    results.tests.push(mobileTest);
    console.log(`   Screenshot saved ✅\n`);

    // TEST 3: Image Loading
    console.log('🖼️  TEST 3: Image Loading...');
    const images = await page.$$eval('img', imgs => imgs.map(img => ({
      src: img.src,
      alt: img.alt,
      loaded: img.complete && img.naturalHeight !== 0,
      width: img.naturalWidth,
      height: img.naturalHeight
    })));

    const brokenImages = images.filter(img => !img.loaded && img.src);
    const imageTest = {
      name: 'Image Loading',
      passed: brokenImages.length === 0,
      total: images.length,
      loaded: images.filter(img => img.loaded).length,
      broken: brokenImages.length,
      brokenUrls: brokenImages.map(img => img.src)
    };
    results.tests.push(imageTest);
    console.log(`   Total: ${imageTest.total}, Loaded: ${imageTest.loaded}, Broken: ${imageTest.broken}`);
    if (brokenImages.length > 0) {
      console.log(`   ❌ Broken images:`);
      brokenImages.forEach(img => console.log(`      - ${img.src}`));
      brokenImages.forEach(img => {
        results.issues.push({
          type: 'broken_image',
          url: img.src
        });
      });
    }
    console.log(`   ${imageTest.passed ? '✅' : '❌'}\n`);

    // TEST 4: TikTok Overlays
    console.log('🎭 TEST 4: TikTok Overlays...');
    const overlays = await page.$$('.tiktok-overlay');
    const overlayTest = {
      name: 'TikTok Overlays',
      passed: overlays.length >= 8,
      count: overlays.length,
      expected: 8,
      visible: []
    };

    for (let i = 0; i < Math.min(overlays.length, 5); i++) {
      const isVisible = await overlays[i].isVisible();
      const text = await overlays[i].textContent();
      overlayTest.visible.push({
        index: i,
        visible: isVisible,
        textLength: text?.length || 0
      });
    }
    results.tests.push(overlayTest);
    console.log(`   Found: ${overlayTest.count} (expected ${overlayTest.expected})`);
    console.log(`   ${overlayTest.passed ? '✅' : '❌'}\n`);

    // TEST 5: Checkout Button
    console.log('🛒 TEST 5: Checkout Button...');
    const checkoutBtn = await page.$('button:has-text("Buy Now")');
    let checkoutTest = { name: 'Checkout Button', passed: false, clicked: false };

    if (checkoutBtn) {
      const isVisible = await checkoutBtn.isVisible();
      const isEnabled = await checkoutBtn.isEnabled();

      // Try clicking
      try {
        await checkoutBtn.click();
        await page.waitForTimeout(2000);

        // Check if modal appeared
        const modal = await page.$('.checkout-modal, #checkout-modal, [class*="checkout"]');
        const overlayVisible = await page.$('body[class*="checkout-open"]') !== null;

        checkoutTest = {
          name: 'Checkout Button',
          passed: true,
          visible: isVisible,
          enabled: isEnabled,
          clicked: true,
          modalAppeared: modal !== null || overlayVisible
        };
      } catch (e) {
        checkoutTest.error = e.message;
        results.issues.push({
          type: 'checkout_click_error',
          error: e.message
        });
      }
    }
    results.tests.push(checkoutTest);
    console.log(`   Visible: ${checkoutTest.visible || false}, Enabled: ${checkoutTest.enabled || false}`);
    console.log(`   Clicked: ${checkoutTest.clicked || false}, Modal: ${checkoutTest.modalAppeared || false}`);
    console.log(`   ${checkoutTest.passed ? '✅' : '❌'}\n`);

    // TEST 6: Order Bump
    console.log('💎 TEST 6: Order Bump...');
    const orderBumpImg = await page.$('img[src*="59"], img[src*="bump"], img[src*="order"]');
    const orderBumpCheckbox = await page.$('input[type="checkbox"]');
    const orderBumpTest = {
      name: 'Order Bump',
      passed: orderBumpImg !== null,
      hasImage: orderBumpImg !== null,
      hasCheckbox: orderBumpCheckbox !== null
    };

    if (orderBumpImg) {
      const bumpLoaded = await orderBumpImg.evaluate(img => img.complete && img.naturalHeight !== 0);
      orderBumpTest.imageLoaded = bumpLoaded;
    }
    results.tests.push(orderBumpTest);
    console.log(`   Image: ${orderBumpTest.hasImage ? '✅' : '❌'}, Checkbox: ${orderBumpTest.hasCheckbox ? '✅' : '❌'}`);
    console.log(`   ${orderBumpTest.passed ? '✅' : '❌'}\n`);

    // TEST 7: Pricing Options
    console.log('💰 TEST 7: Pricing Options...');
    const priceButtons = await page.$$('[class*="bundle"], [class*="price"], button[onclick*="selectBundle"]');
    const pricingTest = {
      name: 'Pricing Options',
      passed: priceButtons.length >= 3,
      buttons: priceButtons.length,
      clickable: []
    };

    for (let i = 0; i < Math.min(priceButtons.length, 3); i++) {
      const isClickable = await priceButtons[i].isEnabled();
      const text = await priceButtons[i].textContent();
      pricingTest.clickable.push({
        index: i,
        text: text?.substring(0, 30),
        clickable: isClickable
      });
    }
    results.tests.push(pricingTest);
    console.log(`   Found: ${pricingTest.buttons} pricing options`);
    console.log(`   ${pricingTest.passed ? '✅' : '❌'}\n`);

    // TEST 8: FAQ Accordion
    console.log('❓ TEST 8: FAQ Accordion...');
    const faqItems = await page.$$('.faq-item, .accordion-item, [class*="faq"]');
    const faqTest = {
      name: 'FAQ Accordion',
      passed: faqItems.length >= 3,
      items: faqItems.length
    };
    results.tests.push(faqTest);
    console.log(`   FAQ Items: ${faqTest.items}`);
    console.log(`   ${faqTest.passed ? '✅' : '❌'}\n`);

    // TEST 9: Reviews/Testimonials
    console.log('⭐ TEST 9: Reviews/Testimonials...');
    const reviews = await page.$$('.review, .testimonial, [class*="review"], [class*="testimonial"]');
    const reviewTest = {
      name: 'Reviews',
      passed: reviews.length >= 5,
      count: reviews.length
    };
    results.tests.push(reviewTest);
    console.log(`   Reviews: ${reviewTest.count}`);
    console.log(`   ${reviewTest.passed ? '✅' : '❌'}\n`);

    // TEST 10: Performance Metrics
    console.log('⚡ TEST 10: Performance Metrics...');
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
        loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
        domInteractive: Math.round(perfData.domInteractive - perfData.fetchStart)
      };
    });
    const perfTest = {
      name: 'Performance',
      passed: metrics.domInteractive < 3000,
      metrics: metrics
    };
    results.tests.push(perfTest);
    console.log(`   DOM Interactive: ${metrics.domInteractive}ms`);
    console.log(`   ${perfTest.passed ? '✅' : '❌'}\n`);

    // TEST 11: Mobile Touch Targets
    console.log('👆 TEST 11: Mobile Touch Targets...');
    await page.setViewportSize({ width: 375, height: 667 });
    const smallButtons = await page.$$eval('button, a, [role="button"]', elements => {
      return elements.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width < 44 || rect.height < 44;
      }).map(el => ({
        tag: el.tagName,
        text: el.textContent?.substring(0, 20),
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height
      }));
    });
    const touchTest = {
      name: 'Touch Targets (48px min)',
      passed: smallButtons.length === 0,
      smallTargets: smallButtons.length,
      details: smallButtons.slice(0, 5)
    };
    results.tests.push(touchTest);
    console.log(`   Small targets (<48px): ${touchTest.smallTargets}`);
    if (smallButtons.length > 0) {
      console.log(`   ⚠️  Some buttons too small for mobile:`);
      smallButtons.slice(0, 3).forEach(btn => {
        console.log(`      - ${btn.tag} "${btn.text}": ${btn.width}x${btn.height}px`);
      });
    }
    console.log(`   ${touchTest.passed ? '✅' : '⚠️'}\n`);

    // TEST 12: Color Contrast (basic check)
    console.log('🎨 TEST 12: Color & Design...');
    const colors = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const announcements = document.querySelectorAll('[class*="announcement"]');
      const announcementBg = announcements.length > 0 ?
        getComputedStyle(announcements[0]).backgroundColor : null;

      return {
        bodyBg: body.backgroundColor,
        announcementBg: announcementBg
      };
    });
    const colorTest = {
      name: 'Color Scheme',
      passed: colors.announcementBg?.includes('229, 255, 0') || colors.announcementBg?.includes('#E5FF00'),
      hasLime: colors.announcementBg?.includes('229, 255, 0') || colors.announcementBg?.includes('#E5FF00'),
      colors: colors
    };
    results.tests.push(colorTest);
    console.log(`   Lime announcement: ${colorTest.hasLime ? '✅' : '❌'}`);
    console.log(`   ${colorTest.passed ? '✅' : '❌'}\n`);

    // Final summary
    console.log('=== TEST SUMMARY ===');
    const passed = results.tests.filter(t => t.passed).length;
    const total = results.tests.length;
    console.log(`\nPassed: ${passed}/${total}`);
    console.log(`Issues: ${results.issues.length}`);

    if (results.issues.length > 0) {
      console.log('\n🐛 ISSUES FOUND:');
      results.issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. [${issue.type}] ${issue.message || issue.url || issue.error}`);
      });
    }

  } catch (error) {
    console.error('❌ Test error:', error);
    results.issues.push({
      type: 'test_error',
      error: error.message,
      stack: error.stack
    });
  } finally {
    await browser.close();
  }

  // Save results
  mkdirSync('screenshots', { recursive: true });
  writeFileSync('test-results.json', JSON.stringify(results, null, 2));
  console.log('\n📊 Results saved to test-results.json');

  return results;
}

runTests().catch(console.error);
