#!/usr/bin/env node

/**
 * Browser Compatibility Testing Script
 * Tests theme across different browsers and devices
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Import shared utilities
const { log } = require('./setup-dev.js');

const BROWSERS = [
  { name: 'Chrome', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  { name: 'Firefox', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0' },
  { name: 'Safari', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15' },
  { name: 'Edge', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0' }
];

const DEVICES = [
  { name: 'Desktop', viewport: { width: 1920, height: 1080 } },
  { name: 'Tablet', viewport: { width: 768, height: 1024 } },
  { name: 'Mobile', viewport: { width: 375, height: 812 } }
];

class BrowserTester {
  constructor() {
    this.results = {};
    this.reportDir = path.join(process.cwd(), 'browser-test-reports');
    this.screenshotDir = path.join(this.reportDir, 'screenshots');
    this.ensureReportDirs();
  }

  ensureReportDirs() {
    [this.reportDir, this.screenshotDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async testStore(storeUrl, storeName) {
    log(`\n🌐 Testing browser compatibility for ${storeName}`, 'cyan');
    log(`URL: ${storeUrl}`, 'blue');

    const testUrls = [
      { url: storeUrl, name: 'Homepage' },
      { url: `${storeUrl}/?demo=fashion`, name: 'Fashion Demo' },
      { url: `${storeUrl}/?demo=electronics`, name: 'Electronics Demo' }
    ];

    const storeResults = {};

    for (const testUrl of testUrls) {
      log(`\n  📱 Testing: ${testUrl.name}`, 'yellow');
      storeResults[testUrl.name] = {};

      for (const device of DEVICES) {
        log(`    📐 Testing on ${device.name}`, 'blue');
        
        for (const browser of BROWSERS) {
          try {
            const result = await this.runBrowserTest(testUrl.url, testUrl.name, device, browser, storeName);
            storeResults[testUrl.name][`${device.name}-${browser.name}`] = result;
            
            const status = result.success ? '✅' : '❌';
            log(`      ${status} ${browser.name}: ${result.loadTime}ms`, result.success ? 'green' : 'red');
            
          } catch (error) {
            log(`      ❌ ${browser.name}: ${error.message}`, 'red');
            storeResults[testUrl.name][`${device.name}-${browser.name}`] = { 
              success: false, 
              error: error.message 
            };
          }
        }
      }
    }

    this.results[storeName] = storeResults;
    return storeResults;
  }

  async runBrowserTest(url, pageName, device, browser, storeName) {
    const browserInstance = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browserInstance.newPage();

    try {
      // Set user agent to simulate browser
      await page.setUserAgent(browser.userAgent);
      
      // Set viewport for device
      await page.setViewport(device.viewport);

      // Navigate and measure performance
      const startTime = Date.now();
      
      await page.goto(url, { 
        waitUntil: 'networkidle0', 
        timeout: 30000 
      });

      // Wait for demo setup if needed
      if (url.includes('?demo=')) {
        await page.waitForTimeout(2000);
      }

      const loadTime = Date.now() - startTime;

      // Check for JavaScript errors
      const jsErrors = [];
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });

      page.on('console', msg => {
        if (msg.type() === 'error') {
          jsErrors.push(msg.text());
        }
      });

      // Take screenshot
      const screenshotName = `${storeName}-${pageName.replace(/\s+/g, '-')}-${device.name}-${browser.name}.png`;
      const screenshotPath = path.join(this.screenshotDir, screenshotName);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });

      // Test specific functionality
      const functionalityTests = await this.runFunctionalityTests(page);

      return {
        success: jsErrors.length === 0 && functionalityTests.allPassed,
        loadTime,
        jsErrors,
        screenshot: screenshotPath,
        functionality: functionalityTests,
        viewport: device.viewport,
        userAgent: browser.userAgent
      };

    } finally {
      await page.close();
      await browserInstance.close();
    }
  }

  async runFunctionalityTests(page) {
    const tests = {
      navigationMenu: false,
      searchForm: false,
      cartDrawer: false,
      productQuickView: false,
      demoSwitcher: false
    };

    try {
      // Test navigation menu
      const navMenu = await page.$('nav, .navigation, [role="navigation"]');
      tests.navigationMenu = !!navMenu;

      // Test search form
      const searchForm = await page.$('input[type="search"], .search-form, [aria-label*="search"]');
      tests.searchForm = !!searchForm;

      // Test cart functionality
      const cartButton = await page.$('.cart-button, [aria-label*="cart"], .cart-icon');
      tests.cartDrawer = !!cartButton;

      // Test quick view functionality
      const quickViewButtons = await page.$$('.quick-view, [data-quick-view]');
      tests.productQuickView = quickViewButtons.length > 0;

      // Test demo switcher
      const demoElements = await page.$$('[data-demo-products], [data-demo-collections]');
      tests.demoSwitcher = demoElements.length > 0;

    } catch (error) {
      log(`      ⚠️  Functionality test error: ${error.message}`, 'yellow');
    }

    const passedTests = Object.values(tests).filter(Boolean).length;
    const totalTests = Object.keys(tests).length;

    return {
      tests,
      passedTests,
      totalTests,
      allPassed: passedTests === totalTests
    };
  }

  generateSummaryReport() {
    log('\n🌐 Browser Compatibility Test Summary', 'bright');
    log('='.repeat(60), 'cyan');

    let totalTests = 0;
    let passedTests = 0;
    let totalErrors = 0;

    const browserCompatibility = {};
    const deviceCompatibility = {};

    for (const [storeName, storeResults] of Object.entries(this.results)) {
      log(`\n🏪 ${storeName}:`, 'bright');
      
      for (const [pageName, pageResults] of Object.entries(storeResults)) {
        log(`\n  📄 ${pageName}:`, 'bright');
        
        for (const [testKey, result] of Object.entries(pageResults)) {
          totalTests++;
          
          if (result.success) {
            passedTests++;
          }

          if (result.jsErrors) {
            totalErrors += result.jsErrors.length;
          }

          // Track browser compatibility
          const [device, browser] = testKey.split('-');
          if (!browserCompatibility[browser]) {
            browserCompatibility[browser] = { passed: 0, total: 0 };
          }
          browserCompatibility[browser].total++;
          if (result.success) browserCompatibility[browser].passed++;

          // Track device compatibility
          if (!deviceCompatibility[device]) {
            deviceCompatibility[device] = { passed: 0, total: 0 };
          }
          deviceCompatibility[device].total++;
          if (result.success) deviceCompatibility[device].passed++;

          const status = result.success ? '✅' : '❌';
          const loadTime = result.loadTime || 'N/A';
          log(`    ${status} ${testKey}: ${loadTime}ms`, result.success ? 'green' : 'red');
          
          if (result.error) {
            log(`      Error: ${result.error}`, 'red');
          }
          
          if (result.jsErrors && result.jsErrors.length > 0) {
            log(`      JS Errors: ${result.jsErrors.length}`, 'red');
          }
        }
      }
    }

    // Browser compatibility summary
    log(`\n📊 Browser Compatibility:`, 'bright');
    for (const [browser, stats] of Object.entries(browserCompatibility)) {
      const rate = Math.round((stats.passed / stats.total) * 100);
      const color = rate >= 90 ? 'green' : rate >= 75 ? 'yellow' : 'red';
      log(`  ${browser}: ${stats.passed}/${stats.total} (${rate}%)`, color);
    }

    // Device compatibility summary
    log(`\n📱 Device Compatibility:`, 'bright');
    for (const [device, stats] of Object.entries(deviceCompatibility)) {
      const rate = Math.round((stats.passed / stats.total) * 100);
      const color = rate >= 90 ? 'green' : rate >= 75 ? 'yellow' : 'red';
      log(`  ${device}: ${stats.passed}/${stats.total} (${rate}%)`, color);
    }

    // Overall summary
    const overallRate = Math.round((passedTests / totalTests) * 100);
    log(`\n📈 Overall Results:`, 'bright');
    log(`Tests Passed: ${passedTests}/${totalTests} (${overallRate}%)`, overallRate >= 90 ? 'green' : 'red');
    log(`JavaScript Errors: ${totalErrors}`, totalErrors === 0 ? 'green' : 'red');
    
    if (overallRate >= 90 && totalErrors === 0) {
      log('🎉 Excellent browser compatibility! Theme works well across all tested environments.', 'green');
    } else if (overallRate >= 75) {
      log('✅ Good browser compatibility with minor issues to address.', 'yellow');
    } else {
      log('⚠️  Browser compatibility issues detected. Review and fix before submission.', 'red');
    }

    // Save summary report
    this.saveSummaryReport(totalTests, passedTests, totalErrors, browserCompatibility, deviceCompatibility);
  }

  saveSummaryReport(totalTests, passedTests, totalErrors, browserCompatibility, deviceCompatibility) {
    const summaryPath = path.join(this.reportDir, 'browser-compatibility-summary.json');
    const summary = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        totalTests,
        passedTests,
        passRate: Math.round((passedTests / totalTests) * 100),
        totalErrors,
        browserCompatibility,
        deviceCompatibility
      }
    };

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    log(`\n📄 Summary report saved: ${summaryPath}`, 'blue');
    log(`📷 Screenshots saved in: ${this.screenshotDir}`, 'blue');
  }
}

async function main() {
  log('🚀 Starting Browser Compatibility Testing', 'bright');
  log('='.repeat(60), 'cyan');

  const tester = new BrowserTester();

  // Load environment variables
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    const lines = env.split('\n');
    for (const line of lines) {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        process.env[key.trim()] = value.trim();
      }
    }
  }

  // Test stores based on environment
  const storesToTest = [];

  if (process.env.PRODUCTION_STORE && process.env.PRODUCTION_STORE !== 'allstore-blueprint.myshopify.com') {
    storesToTest.push({
      url: `https://${process.env.PRODUCTION_STORE}`,
      name: 'Production Store'
    });
  }

  // Fallback to default production store
  if (storesToTest.length === 0) {
    storesToTest.push({
      url: 'https://allstore-blueprint.myshopify.com',
      name: 'Production Store (Default)'
    });
  }

  // Run tests
  for (const store of storesToTest) {
    try {
      await tester.testStore(store.url, store.name);
    } catch (error) {
      log(`❌ Failed to test ${store.name}: ${error.message}`, 'red');
    }
  }

  // Generate summary
  tester.generateSummaryReport();

  log('\n✅ Browser compatibility testing complete!', 'green');
  log(`📁 Reports saved in: ${tester.reportDir}`, 'blue');
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Browser testing failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = BrowserTester;