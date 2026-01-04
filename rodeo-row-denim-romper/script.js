// ==================================
// WAISTMAFIA TEMPLATE - JAVASCRIPT
// ==================================

// ========== MOBILE MENU ==========
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
const mobileMenu = document.getElementById("mobileMenu");
const mobileMenuClose = document.querySelector(".mobile-menu-close");

if (mobileMenuToggle) {
  mobileMenuToggle.addEventListener("click", () => {
    mobileMenu.classList.add("active");
  });
}

if (mobileMenuClose) {
  mobileMenuClose.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
  });
}

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (
    mobileMenu &&
    mobileMenu.classList.contains("active") &&
    !mobileMenu.contains(e.target) &&
    !mobileMenuToggle.contains(e.target)
  ) {
    mobileMenu.classList.remove("active");
  }
});

// ========== PRODUCT GALLERY ==========
const mainImage = document.getElementById("mainImage");
const thumbnails = document.querySelectorAll(".thumbnail");
const tiktokOverlay = document.querySelector(".hero-section .tiktok-overlay");

thumbnails.forEach((thumbnail) => {
  thumbnail.addEventListener("click", function () {
    // Remove active class from all thumbnails
    thumbnails.forEach((t) => t.classList.remove("active"));

    // Add active class to clicked thumbnail
    this.classList.add("active");

    // Get image source and overlay data
    const imageSrc = this.getAttribute("data-image");
    const overlayData = JSON.parse(this.getAttribute("data-overlay"));

    // Update main image
    if (mainImage) {
      mainImage.src = imageSrc;
      mainImage.alt = `Product view ${this.querySelector("img").alt}`;
    }

    // Update TikTok overlay
    if (tiktokOverlay && overlayData) {
      const usernameEl = tiktokOverlay.querySelector(".tiktok-username");
      const questionEl = tiktokOverlay.querySelector(
        ".tiktok-question .tiktok-comment",
      );
      const answerEl = tiktokOverlay.querySelector(
        ".tiktok-answer .tiktok-comment",
      );

      if (usernameEl && overlayData.question && overlayData.question.username) {
        usernameEl.textContent = `@${overlayData.question.username}`;
      }

      if (questionEl && overlayData.question && overlayData.question.text) {
        questionEl.textContent = overlayData.question.text;
      }

      if (answerEl && overlayData.answer) {
        answerEl.textContent = overlayData.answer;
      }
    }
  });
});

// ========== COMPARISON SLIDER ==========
const comparisonSlider = document.getElementById("comparisonSlider");
const comparisonHandle = document.getElementById("comparisonHandle");
const comparisonOverlay = document.querySelector(".comparison-overlay");

if (comparisonSlider && comparisonHandle && comparisonOverlay) {
  let isDragging = false;

  function updateSlider(clientX) {
    const rect = comparisonSlider.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

    comparisonOverlay.style.width = `${percentage}%`;
    comparisonHandle.style.left = `${percentage}%`;
  }

  // Mouse events
  comparisonHandle.addEventListener("mousedown", (e) => {
    isDragging = true;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      updateSlider(e.clientX);
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Touch events
  comparisonHandle.addEventListener("touchstart", (e) => {
    isDragging = true;
    e.preventDefault();
  });

  document.addEventListener("touchmove", (e) => {
    if (isDragging && e.touches[0]) {
      updateSlider(e.touches[0].clientX);
    }
  });

  document.addEventListener("touchend", () => {
    isDragging = false;
  });

  // Click anywhere on slider
  comparisonSlider.addEventListener("click", (e) => {
    if (!comparisonHandle.contains(e.target)) {
      updateSlider(e.clientX);
    }
  });
}

// ========== BUNDLE SELECTION ==========
const bundleCards = document.querySelectorAll(".bundle-card");
const bundleInputs = document.querySelectorAll(
  '.bundle-card input[type="radio"]',
);

bundleInputs.forEach((input) => {
  input.addEventListener("change", function () {
    // Remove selected class from all cards
    bundleCards.forEach((card) => card.classList.remove("selected"));

    // Add selected class to parent card
    const parentCard = this.closest(".bundle-card");
    if (parentCard) {
      parentCard.classList.add("selected");
    }

    // Update add to cart button price if needed
    const price = parentCard.getAttribute("data-price");
    const addToCartBtn = document.querySelector(".add-to-cart-btn");
    if (addToCartBtn && price) {
      addToCartBtn.textContent = `Add to Cart - $${price}`;
    }
  });
});

// Click on card label to select
bundleCards.forEach((card) => {
  const label = card.querySelector("label");
  if (label) {
    label.addEventListener("click", (e) => {
      const input = card.querySelector('input[type="radio"]');
      if (input) {
        input.checked = true;
        input.dispatchEvent(new Event("change"));
      }
    });
  }
});

// ========== FAQ ACCORDION ==========
const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach((question) => {
  question.addEventListener("click", function () {
    const isExpanded = this.getAttribute("aria-expanded") === "true";

    // Close all other FAQs
    faqQuestions.forEach((q) => {
      if (q !== this) {
        q.setAttribute("aria-expanded", "false");
      }
    });

    // Toggle current FAQ
    this.setAttribute("aria-expanded", !isExpanded);
  });
});

// ========== ROTATING TESTIMONIALS ==========
const rotatingTestimonial = document.getElementById("rotatingTestimonial");

if (rotatingTestimonial) {
  // Testimonials array - will be populated by template engine
  const testimonials = [
    "{{TESTIMONIAL_1}}",
    "{{TESTIMONIAL_2}}",
    "{{TESTIMONIAL_3}}",
    "{{TESTIMONIAL_4}}",
    "{{TESTIMONIAL_5}}",
  ].filter((t) => t && !t.includes("{{")); // Filter out empty template variables

  if (testimonials.length > 0) {
    let currentIndex = 0;

    function rotateTestimonial() {
      currentIndex = (currentIndex + 1) % testimonials.length;
      const testimonialText =
        rotatingTestimonial.querySelector(".testimonial-text");

      if (testimonialText) {
        // Fade out
        testimonialText.style.opacity = "0";

        setTimeout(() => {
          testimonialText.textContent = testimonials[currentIndex];
          // Fade in
          testimonialText.style.opacity = "1";
        }, 300);
      }
    }

    // Add transition to testimonial text
    const testimonialText =
      rotatingTestimonial.querySelector(".testimonial-text");
    if (testimonialText) {
      testimonialText.style.transition = "opacity 0.3s ease";
    }

    // Rotate every 4 seconds
    setInterval(rotateTestimonial, 4000);
  }
}

// ========== SIMPLESWAP CHECKOUT INTEGRATION ==========
// Configuration
const SIMPLESWAP_API_KEY = "{{SIMPLESWAP_API_KEY}}";
const ONRENDER_SERVER_URL = "{{ONRENDER_SERVER_URL}}";

// Cart management
let cart = {
  quantity: 1,
  price: 0,
  productName: "{{PRODUCT_NAME}}",
  productSlug: "{{PRODUCT_SLUG}}",
};

// Add to cart button
const addToCartBtn = document.querySelector(".add-to-cart-btn");
const guaranteeCTA = document.querySelector(".guarantee-cta");

function initiateCheckout() {
  // Get selected bundle
  const selectedBundle = document.querySelector(".bundle-card.selected");
  if (selectedBundle) {
    cart.quantity = parseInt(selectedBundle.getAttribute("data-quantity")) || 1;
    cart.price = parseFloat(selectedBundle.getAttribute("data-price")) || 0;
  }

  // Redirect to checkout page with cart data
  const checkoutData = {
    product: cart.productName,
    quantity: cart.quantity,
    price: cart.price,
    total: cart.price,
  };

  // Store in sessionStorage
  sessionStorage.setItem("checkout_data", JSON.stringify(checkoutData));

  // Redirect to checkout page (will be created as separate page)
  window.location.href = "checkout.html";
}

if (addToCartBtn) {
  addToCartBtn.addEventListener("click", initiateCheckout);
}

if (guaranteeCTA) {
  guaranteeCTA.addEventListener("click", initiateCheckout);
}

// Update cart count badge
function updateCartCount(count) {
  const cartCount = document.querySelector(".cart-count");
  if (cartCount) {
    cartCount.textContent = count;
    cartCount.style.display = count > 0 ? "flex" : "none";
  }
}

// Initialize cart count
updateCartCount(0);

// ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");

    // Don't prevent default for just "#"
    if (href === "#") return;

    e.preventDefault();

    const target = document.querySelector(href);
    if (target) {
      const headerOffset = 140; // Announcement bar + header height
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  });
});

// ========== LAZY LOAD IMAGES (Performance) ==========
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        }
        observer.unobserve(img);
      }
    });
  });

  // Observe all images with data-src attribute
  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img);
  });
}

// ========== ANALYTICS TRACKING ==========
// Track add to cart events
function trackAddToCart(productName, price, quantity) {
  // Google Analytics 4
  if (typeof gtag !== "undefined") {
    gtag("event", "add_to_cart", {
      currency: "USD",
      value: price,
      items: [
        {
          item_name: productName,
          quantity: quantity,
          price: price,
        },
      ],
    });
  }

  // Facebook Pixel
  if (typeof fbq !== "undefined") {
    fbq("track", "AddToCart", {
      content_name: productName,
      content_type: "product",
      value: price,
      currency: "USD",
    });
  }

  // TikTok Pixel
  if (typeof ttq !== "undefined") {
    ttq.track("AddToCart", {
      content_name: productName,
      content_type: "product",
      quantity: quantity,
      price: price,
      value: price,
      currency: "USD",
    });
  }
}

// Track page view
function trackPageView() {
  // Google Analytics 4
  if (typeof gtag !== "undefined") {
    gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
    });
  }

  // Facebook Pixel
  if (typeof fbq !== "undefined") {
    fbq("track", "PageView");
  }

  // TikTok Pixel
  if (typeof ttq !== "undefined") {
    ttq.track("ViewContent", {
      content_type: "product",
      content_name: "{{PRODUCT_NAME}}",
    });
  }
}

// Initialize tracking on page load
window.addEventListener("load", trackPageView);

// ========== CONSOLE BRANDING ==========
console.log(
  "%cBuilt with WaistMafia Template",
  "color: #e5ff00; background: #111111; font-size: 16px; font-weight: bold; padding: 10px 20px; border-radius: 4px;",
);
console.log(
  "%cPixel-perfect conversion optimization 🚀",
  "color: #666666; font-size: 12px; padding: 5px 0;",
);

// ==================== CHECKOUT FUNCTIONS ====================

function openCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    updateModalTotal();
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function updateModalTotal() {
  const bundleRadio = document.querySelector('input[name="modalBundle"]:checked');
  const orderBumpCheck = document.getElementById('modalOrderBumpCheck');
  
  if (!bundleRadio || !orderBumpCheck) return;
  
  const bundlePrice = parseInt(bundleRadio.value);
  const bumpPrice = orderBumpCheck.checked ? 10 : 0;
  
  // For 2-pack ($59), order bump is FREE (included in price)
  const actualBumpPrice = bundlePrice === 59 ? 0 : bumpPrice;
  const total = bundlePrice + actualBumpPrice;
  
  // Update display
  document.getElementById('modalSubtotal').textContent = `$${bundlePrice}.00`;
  document.getElementById('modalTotal').textContent = `$${total}.00`;
  
  // Show/hide bump row
  const bumpRow = document.getElementById('modalBumpRow');
  if (bumpRow) {
    bumpRow.style.display = (actualBumpPrice > 0) ? 'flex' : 'none';
  }
  
  // Auto-check bump for single, uncheck for 2-pack
  if (bundlePrice === 19) {
    orderBumpCheck.checked = true;
  } else if (bundlePrice === 59) {
    orderBumpCheck.checked = false;
  }
}

async function processCheckout() {
  const bundleRadio = document.querySelector('input[name="modalBundle"]:checked');
  const orderBumpCheck = document.getElementById('modalOrderBumpCheck');
  
  if (!bundleRadio) {
    alert('Please select a quantity');
    return;
  }
  
  const bundlePrice = parseInt(bundleRadio.value);
  const bumpChecked = orderBumpCheck?.checked || false;
  
  // Calculate final amount
  let finalAmount = bundlePrice;
  if (bundlePrice === 19 && bumpChecked) {
    finalAmount = 29; // $19 + $10 bump
  }
  // Note: $59 2-pack bump is FREE (stays $59)
  
  try {
    // Show transition overlay
    const transition = document.getElementById('checkoutTransition');
    const modal = document.getElementById('checkoutModal');
    
    if (modal) modal.style.display = 'none';
    if (transition) {
      transition.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
    
    // Call Netlify function
    const response = await fetch('/.netlify/functions/buy-now', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        amountUSD: finalAmount,
        bundle: bundlePrice,
        orderBump: bumpChecked
      })
    });
    
    const data = await response.json();
    
    // CRITICAL: OnRender returns "exchangeUrl" not "url"
    const redirectUrl = data.exchangeUrl || data.url || data.checkoutUrl || data.redirectUrl;
    
    if (redirectUrl) {
      // Redirect to SimpleSwap
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);
    } else {
      throw new Error('No checkout URL received');
    }
    
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Error processing order. Please try again.');
    
    // Hide transition, show modal again
    const transition = document.getElementById('checkoutTransition');
    const modal = document.getElementById('checkoutModal');
    if (transition) transition.style.display = 'none';
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }
}

// Add click handlers to all buy buttons
document.addEventListener('DOMContentLoaded', () => {
  const buyButtons = document.querySelectorAll('.add-to-cart-btn, .btn-checkout, [class*="buy"]');
  buyButtons.forEach(btn => {
    if (!btn.onclick && !btn.getAttribute('onclick')) {
      btn.addEventListener('click', () => openCheckoutModal());
    }
  });
  
  // Initialize modal total
  const modal = document.getElementById('checkoutModal');
  if (modal) {
    updateModalTotal();
  }
});

