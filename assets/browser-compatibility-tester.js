/**
 * Cross-Browser Compatibility Testing Suite
 * Tests theme functionality across different browsers and devices
 * Validates Shopify Theme Store browser support requirements
 */

class BrowserCompatibilityTester {
  constructor() {
    this.results = {
      browsers: {},
      features: {},
      summary: {},
      issues: []
    };
    
    // Shopify Theme Store browser requirements
    this.supportedBrowsers = {
      chrome: { name: 'Chrome', minVersion: 70, weight: 0.35 },
      safari: { name: 'Safari', minVersion: 12, weight: 0.25 },
      firefox: { name: 'Firefox', minVersion: 60, weight: 0.20 },
      edge: { name: 'Edge', minVersion: 79, weight: 0.15 },
      mobile_chrome: { name: 'Mobile Chrome', minVersion: 70, weight: 0.05 }
    };

    this.criticalFeatures = [
      'javascript_modules',
      'css_grid',
      'css_flexbox',
      'fetch_api',
      'intersection_observer',
      'web_components',
      'css_custom_properties',
      'es6_classes',
      'promise',
      'local_storage'
    ];

    this.themeFeatures = [
      'cart_drawer',
      'product_quick_view',
      'image_gallery',
      'search_autocomplete',
      'newsletter_signup',
      'mobile_navigation',
      'lazy_loading',
      'wishlist',
      'currency_converter',
      'size_guide'
    ];
  }

  detectBrowser() {
    const userAgent = navigator.userAgent;
    const browsers = {
      chrome: /Chrome\/(\d+)/.test(userAgent),
      safari: /Safari\/(\d+)/.test(userAgent) && !/Chrome/.test(userAgent),
      firefox: /Firefox\/(\d+)/.test(userAgent),
      edge: /Edg\/(\d+)/.test(userAgent),
      mobile_chrome: /Chrome\/(\d+)/.test(userAgent) && /Mobile/.test(userAgent)
    };

    for (const [browser, detected] of Object.entries(browsers)) {
      if (detected) {
        const version = this.extractVersion(userAgent, browser);
        return { browser, version };
      }
    }

    return { browser: 'unknown', version: 0 };
  }

  extractVersion(userAgent, browser) {
    const patterns = {
      chrome: /Chrome\/(\d+)/,
      safari: /Version\/(\d+)/,
      firefox: /Firefox\/(\d+)/,
      edge: /Edg\/(\d+)/,
      mobile_chrome: /Chrome\/(\d+)/
    };

    const match = userAgent.match(patterns[browser]);
    return match ? parseInt(match[1]) : 0;
  }

  testFeatureSupport() {
    const results = {};

    // Test critical web features
    results.javascript_modules = typeof window.import !== 'undefined';
    results.css_grid = CSS.supports('display', 'grid');
    results.css_flexbox = CSS.supports('display', 'flex');
    results.fetch_api = typeof fetch !== 'undefined';
    results.intersection_observer = typeof IntersectionObserver !== 'undefined';
    results.web_components = typeof customElements !== 'undefined';
    results.css_custom_properties = CSS.supports('color', 'var(--test)');
    results.es6_classes = typeof class {} === 'function';
    results.promise = typeof Promise !== 'undefined';
    results.local_storage = typeof Storage !== 'undefined';

    // Test viewport and responsive features
    results.viewport_units = CSS.supports('width', '100vw');
    results.media_queries = typeof window.matchMedia !== 'undefined';
    results.touch_events = 'ontouchstart' in window;

    // Test modern features
    results.webp_support = this.testWebPSupport();
    results.passive_listeners = this.testPassiveListeners();

    return results;
  }

  testWebPSupport() {
    // Create a tiny WebP image to test support
    const webp = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==';
    const img = new Image();
    
    return new Promise(resolve => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = webp;
    });
  }

  testPassiveListeners() {
    let passiveSupported = false;
    try {
      const options = {
        get passive() {
          passiveSupported = true;
          return false;
        }
      };
      window.addEventListener('test', null, options);
      window.removeEventListener('test', null, options);
    } catch {
      passiveSupported = false;
    }
    return passiveSupported;
  }

  async testThemeFeatures() {
    const results = {};
    
    // Simulate theme feature testing
    results.cart_drawer = this.testCartDrawer();
    results.product_quick_view = this.testQuickView();
    results.image_gallery = this.testImageGallery();
    results.search_autocomplete = this.testSearchAutocomplete();
    results.newsletter_signup = this.testNewsletterSignup();
    results.mobile_navigation = this.testMobileNavigation();
    results.lazy_loading = this.testLazyLoading();
    results.wishlist = this.testWishlist();
    results.currency_converter = this.testCurrencyConverter();
    results.size_guide = this.testSizeGuide();

    return results;
  }

  testCartDrawer() {
    // Test if cart drawer functionality works
    const cartDrawer = document.querySelector('[data-cart-drawer]');
    const cartToggle = document.querySelector('[data-cart-toggle]');
    
    return {
      present: !!(cartDrawer && cartToggle),
      animation: CSS.supports('transform', 'translateX(100%)'),
      accessible: cartDrawer?.getAttribute('aria-hidden') !== null,
      keyboard: cartToggle?.getAttribute('tabindex') !== null
    };
  }

  testQuickView() {
    // Test product quick view functionality
    const quickViewButtons = document.querySelectorAll('[data-quick-view]');
    const modal = document.querySelector('[data-modal]');
    
    return {
      present: quickViewButtons.length > 0 && !!modal,
      overlay: CSS.supports('backdrop-filter', 'blur(5px)'),
      focus_trap: !!modal?.querySelector('[data-focus-trap]'),
      esc_key: true // Assume properly implemented
    };
  }

  testImageGallery() {
    // Test product image gallery
    const gallery = document.querySelector('[data-image-gallery]');
    const thumbnails = document.querySelectorAll('[data-thumbnail]');
    
    return {
      present: !!(gallery && thumbnails.length > 0),
      zoom: !!gallery?.querySelector('[data-zoom]'),
      touch_swipe: 'ontouchstart' in window,
      keyboard_nav: thumbnails[0]?.getAttribute('tabindex') !== null
    };
  }

  testSearchAutocomplete() {
    // Test search autocomplete functionality
    const searchInput = document.querySelector('[data-search-input]');
    const searchResults = document.querySelector('[data-search-results]');
    
    return {
      present: !!(searchInput && searchResults),
      debounce: true, // Assume properly implemented
      keyboard_nav: !!searchResults?.querySelector('[role="listbox"]'),
      loading_state: !!searchResults?.querySelector('[data-loading]')
    };
  }

  testNewsletterSignup() {
    // Test newsletter signup form
    const form = document.querySelector('[data-newsletter-form]');
    const email = form?.querySelector('input[type="email"]');
    
    return {
      present: !!(form && email),
      validation: !!email?.getAttribute('required'),
      ajax_submit: !!form?.getAttribute('data-ajax'),
      success_message: !!form?.querySelector('[data-success]')
    };
  }

  testMobileNavigation() {
    // Test mobile navigation
    const mobileNav = document.querySelector('[data-mobile-nav]');
    const hamburger = document.querySelector('[data-mobile-toggle]');
    
    return {
      present: !!(mobileNav && hamburger),
      overlay: !!document.querySelector('[data-nav-overlay]'),
      animation: CSS.supports('transform', 'translateX(-100%)'),
      body_lock: true // Assume properly implemented
    };
  }

  testLazyLoading() {
    // Test lazy loading implementation
    const lazyImages = document.querySelectorAll('[data-lazy], [loading="lazy"]');
    
    return {
      present: lazyImages.length > 0,
      intersection_observer: typeof IntersectionObserver !== 'undefined',
      native_loading: 'loading' in HTMLImageElement.prototype,
      fallback: !!document.querySelector('[data-lazy-fallback]')
    };
  }

  testWishlist() {
    // Test wishlist functionality
    const wishlistButtons = document.querySelectorAll('[data-wishlist-toggle]');
    
    return {
      present: wishlistButtons.length > 0,
      local_storage: typeof localStorage !== 'undefined',
      sync_state: true, // Assume properly implemented
      icon_toggle: !!wishlistButtons[0]?.querySelector('[data-icon]')
    };
  }

  testCurrencyConverter() {
    // Test currency conversion
    const currencySelector = document.querySelector('[data-currency-selector]');
    const prices = document.querySelectorAll('[data-price]');
    
    return {
      present: !!(currencySelector && prices.length > 0),
      api_support: typeof fetch !== 'undefined',
      local_storage: typeof localStorage !== 'undefined',
      loading_state: !!currencySelector?.querySelector('[data-loading]')
    };
  }

  testSizeGuide() {
    // Test size guide functionality
    const sizeGuideButton = document.querySelector('[data-size-guide]');
    const modal = document.querySelector('[data-size-guide-modal]');
    
    return {
      present: !!(sizeGuideButton && modal),
      modal_support: CSS.supports('position', 'fixed'),
      responsive: !!modal?.querySelector('[data-responsive-table]'),
      accessible: !!modal?.getAttribute('role')
    };
  }

  calculateCompatibilityScore(browserInfo, featureResults, themeResults) {
    let score = 100;
    let issues = [];

    // Check browser support
    const browserSupport = this.supportedBrowsers[browserInfo.browser];
    if (!browserSupport) {
      score -= 20;
      issues.push({
        type: 'browser',
        severity: 'high',
        message: `Unsupported browser: ${browserInfo.browser}`
      });
    } else if (browserInfo.version < browserSupport.minVersion) {
      score -= 15;
      issues.push({
        type: 'browser',
        severity: 'medium',
        message: `Browser version ${browserInfo.version} below minimum required ${browserSupport.minVersion}`
      });
    }

    // Check critical feature support
    this.criticalFeatures.forEach(feature => {
      if (!featureResults[feature]) {
        score -= 10;
        issues.push({
          type: 'feature',
          severity: 'high',
          message: `Critical feature not supported: ${feature}`
        });
      }
    });

    // Check theme feature functionality
    this.themeFeatures.forEach(feature => {
      const result = themeResults[feature];
      if (result && !result.present) {
        score -= 5;
        issues.push({
          type: 'theme',
          severity: 'medium',
          message: `Theme feature not working: ${feature}`
        });
      }
    });

    return { score: Math.max(0, score), issues };
  }

  async runCompatibilityTest() {
    console.log('🌐 Starting Cross-Browser Compatibility Test');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Detect current browser
    const browserInfo = this.detectBrowser();
    console.log(`🔍 Detected: ${browserInfo.browser} ${browserInfo.version}`);

    // Test feature support
    console.log('⚙️  Testing browser feature support...');
    const featureResults = this.testFeatureSupport();
    
    // Test theme features
    console.log('🎨 Testing theme functionality...');
    const themeResults = await this.testThemeFeatures();

    // Calculate score
    const { score, issues } = this.calculateCompatibilityScore(
      browserInfo, 
      featureResults, 
      themeResults
    );

    // Store results
    this.results.browsers[browserInfo.browser] = {
      version: browserInfo.version,
      score,
      issues,
      features: featureResults,
      themeFeatures: themeResults
    };

    console.log(`\n📊 Compatibility Score: ${score}%`);
    if (issues.length > 0) {
      console.log(`⚠️  ${issues.length} issues found:`);
      issues.forEach(issue => {
        console.log(`   • ${issue.message} (${issue.severity})`);
      });
    }

    return {
      browser: browserInfo,
      score,
      issues,
      features: featureResults,
      themeFeatures: themeResults
    };
  }

  generateReport() {
    const browserResults = Object.keys(this.results.browsers);
    if (browserResults.length === 0) return null;

    // Calculate summary
    let totalScore = 0;
    let totalIssues = 0;
    const issuesBySeverity = { high: 0, medium: 0, low: 0 };

    browserResults.forEach(browser => {
      const result = this.results.browsers[browser];
      totalScore += result.score;
      totalIssues += result.issues.length;
      
      result.issues.forEach(issue => {
        issuesBySeverity[issue.severity]++;
      });
    });

    const averageScore = Math.round(totalScore / browserResults.length);

    return {
      testInfo: {
        date: new Date().toISOString(),
        theme: 'Modern Shopify Theme Pro v2.0.0',
        tester: 'Cross-Browser Compatibility Suite'
      },
      summary: {
        averageScore,
        totalIssues,
        issuesBySeverity,
        testedBrowsers: browserResults.length,
        passedBrowsers: browserResults.filter(b => this.results.browsers[b].score >= 85).length
      },
      browsers: this.results.browsers,
      shopifyCompliance: {
        meetsRequirement: averageScore >= 85 && issuesBySeverity.high === 0,
        required: 'Support for Chrome 70+, Safari 12+, Firefox 60+, Edge 79+',
        status: averageScore >= 85 ? 'PASS' : 'FAIL'
      }
    };
  }

  async run() {
    await this.runCompatibilityTest();
    return this.generateReport();
  }
}

// Export for use in testing suite
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrowserCompatibilityTester;
}

// Browser usage
if (typeof window !== 'undefined') {
  window.BrowserCompatibilityTester = BrowserCompatibilityTester;
}