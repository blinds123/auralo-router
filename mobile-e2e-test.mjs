import { chromium } from "playwright";

const URL = "https://auralo.store/ivera-rhinestone-hoodie";

async function runMobileE2ETest() {
  console.log("\\n=== MOBILE E2E TEST - Full Scroll & Checkout ===\\n");

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
  });
  const page = await context.newPage();

  // Log all console messages
  page.on("console", msg => console.log("  [Browser]", msg.text()));

  try {
    console.log("1. Loading page...");
    await page.goto(URL, { waitUntil: "networkidle" });
    console.log("   ✅ Page loaded");

    // Get initial stats
    const initialImages = await page.$$eval("img", imgs => 
      imgs.filter(img => img.complete && img.naturalHeight !== 0).length
    );
    console.log("\\n2. Initial Images Loaded: " + initialImages);

    // SCROLL THROUGH ENTIRE PAGE
    console.log("\\n3. Scrolling from top to bottom...");
    
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = 667;
    const scrollSteps = Math.ceil(scrollHeight / viewportHeight);
    
    console.log("   Scroll height: " + scrollHeight + "px");
    console.log("   Scroll steps: " + scrollSteps);

    for (let i = 1; i <= scrollSteps; i++) {
      const scrollY = i * viewportHeight;
      await page.evaluate(y => window.scrollTo(0, y), scrollY);
      await page.waitForTimeout(800); // Wait for lazy-loaded images
      
      const loadedImages = await page.$$eval("img", imgs => 
        imgs.filter(img => img.complete && img.naturalHeight !== 0).length
      );
      console.log("   Step " + i + "/" + scrollSteps + ": Loaded " + loadedImages + " images");
    }

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // CHECK ELEMENTS
    console.log("\\n4. Checking page elements...");
    
    const checks = {
      "Announcement Bar": await page.$(".announcement") !== null,
      "Hero Section": await page.$(".hero, [class*=\"hero\"]") !== null,
      "TikTok Overlays": (await page.$$(".tiktok-overlay")).length,
      "Pricing Options": (await page.$$("[class*=\"bundle\"], [class*=\"price\"]")).length,
      "Order Bump": await page.$("#orderBumpCheck, [class*=\"order-bump\"]") !== null,
      "FAQ Items": (await page.$$(".faq-item, .accordion-item")).length,
      "Reviews": (await page.$$(".review, .testimonial")).length,
      "Checkout Button": await page.$("button:has-text(\"Buy Now\"), [class*=\"checkout\"]") !== null
    };

    for (const [element, found] of Object.entries(checks)) {
      console.log("   " + element + ": " + (typeof found === "number" ? found + " found" : found ? "✅" : "❌"));
    }

    // TEST CHECKOUT CLICK
    console.log("\\n5. Testing Checkout Button...");
    
    // Find any checkout/buy button
    const buyButtons = await page.$$("button");
    let checkoutClicked = false;
    
    for (const btn of buyButtons) {
      const text = await btn.textContent();
      if (text && text.toLowerCase().includes("buy")) {
        console.log("   Found button: \"" + text.trim() + "\"");
        
        try {
          await btn.click();
          checkoutClicked = true;
          console.log("   ✅ Clicked!");
          await page.waitForTimeout(2000);
          
          // Check if modal appeared
          const modalVisible = await page.$(".checkout-modal, #checkout-modal") !== null;
          const bodyClass = await page.$eval("body", b => b.className);
          const checkoutOpen = bodyClass.includes("checkout");
          
          console.log("   Modal visible: " + modalVisible);
          console.log("   Body class checkout-open: " + checkoutOpen);
          break;
        } catch (e) {
          console.log("   ❌ Click failed: " + e.message);
        }
      }
    }

    if (!checkoutClicked) {
      console.log("   ❌ No checkout button was clicked");
    }

    // FINAL SCREENSHOT
    console.log("\\n6. Taking final screenshot...");
    await page.screenshot({ 
      path: "/Users/nelsonchan/auralo-router/screenshots/mobile-final.png", 
      fullPage: true 
    });
    console.log("   ✅ Saved: screenshots/mobile-final.png");

    // FINAL STATS
    console.log("\\n=== FINAL RESULTS ===");
    
    const finalStats = await page.evaluate(() => {
      const imgs = document.querySelectorAll("img");
      const loaded = Array.from(imgs).filter(img => img.complete && img.naturalHeight !== 0).length;
      const overlays = document.querySelectorAll(".tiktok-overlay").length;
      
      return {
        totalImages: imgs.length,
        loadedImages: loaded,
        tikTokOverlays: overlays,
        pageHeight: document.body.scrollHeight
      };
    });

    console.log("Total Images: " + finalStats.totalImages);
    console.log("Loaded Images: " + finalStats.loadedImages);
    console.log("TikTok Overlays: " + finalStats.tikTokOverlays);
    console.log("Page Height: " + finalStats.pageHeight + "px");

  } catch (error) {
    console.error("\\n❌ Test Error:", error.message);
  } finally {
    console.log("\\nPress Ctrl+C to close browser...");
    await browser.close();
  }
}

runMobileE2ETest().catch(console.error);
