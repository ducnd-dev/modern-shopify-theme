#!/usr/bin/env node

/**
 * Performance Testing Script
 * Runs Lighthouse and performance audits on theme
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import shared utilities
const { log } = require('./setup-dev.js');

const PERFORMANCE_THRESHOLDS = {
  performance: 75,
  accessibility: 90,
  bestPractices: 90,
  seo: 90,
  loadTime: 3000, // milliseconds
  firstContentfulPaint: 2000 // milliseconds
};

class PerformanceTester {
  constructor() {
    this.results = {};
    this.reportDir = path.join(process.cwd(), 'lighthouse-reports');
    this.ensureReportDir();
  }

  ensureReportDir() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  async testStore(storeUrl, storeName) {
    log(`\n🔍 Testing performance for ${storeName}`, 'cyan');
    log(`URL: ${storeUrl}`, 'blue');

    const testUrls = [
      { url: storeUrl, name: 'Homepage' },
      { url: `${storeUrl}/?demo=fashion`, name: 'Fashion Demo' },
      { url: `${storeUrl}/?demo=electronics`, name: 'Electronics Demo' },
      { url: `${storeUrl}/?demo=beauty`, name: 'Beauty Demo' },
      { url: `${storeUrl}/?demo=minimal`, name: 'Minimal Demo' }
    ];

    const storeResults = {};

    for (const testUrl of testUrls) {
      try {
        log(`\n  📊 Testing: ${testUrl.name}`, 'yellow');
        const result = await this.runLighthouse(testUrl.url, testUrl.name, storeName);
        storeResults[testUrl.name] = result;
        
        // Display results
        this.displayResults(result, testUrl.name);
        
      } catch (error) {
        log(`  ❌ Failed to test ${testUrl.name}: ${error.message}`, 'red');
        storeResults[testUrl.name] = { error: error.message };
      }
    }

    this.results[storeName] = storeResults;
    return storeResults;
  }

  async runLighthouse(url, pageName, storeName) {
    const reportFile = path.join(this.reportDir, `${storeName}-${pageName.toLowerCase().replace(/\s+/g, '-')}.json`);
    
    try {
      // Run Lighthouse CLI
      const command = `npx lighthouse "${url}" --output=json --output-path="${reportFile}" --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo`;
      
      log(`    Running Lighthouse...`, 'blue');
      execSync(command, { stdio: 'pipe' });

      // Read and parse results
      const reportData = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
      
      return {
        url,
        performance: Math.round(reportData.categories.performance.score * 100),
        accessibility: Math.round(reportData.categories.accessibility.score * 100),
        bestPractices: Math.round(reportData.categories['best-practices'].score * 100),
        seo: Math.round(reportData.categories.seo.score * 100),
        loadTime: reportData.audits['speed-index'].displayValue,
        firstContentfulPaint: reportData.audits['first-contentful-paint'].displayValue,
        reportFile
      };

    } catch (error) {
      throw new Error(`Lighthouse test failed: ${error.message}`);
    }
  }

  displayResults(result, pageName) {
    if (result.error) {
      log(`    ❌ ${pageName}: ${result.error}`, 'red');
      return;
    }

    log(`    📈 Results for ${pageName}:`, 'bright');
    
    // Performance
    const perfColor = result.performance >= PERFORMANCE_THRESHOLDS.performance ? 'green' : 'red';
    log(`      Performance: ${result.performance}% ${result.performance >= PERFORMANCE_THRESHOLDS.performance ? '✅' : '❌'}`, perfColor);
    
    // Accessibility
    const a11yColor = result.accessibility >= PERFORMANCE_THRESHOLDS.accessibility ? 'green' : 'red';
    log(`      Accessibility: ${result.accessibility}% ${result.accessibility >= PERFORMANCE_THRESHOLDS.accessibility ? '✅' : '❌'}`, a11yColor);
    
    // Best Practices
    const bpColor = result.bestPractices >= PERFORMANCE_THRESHOLDS.bestPractices ? 'green' : 'red';
    log(`      Best Practices: ${result.bestPractices}% ${result.bestPractices >= PERFORMANCE_THRESHOLDS.bestPractices ? '✅' : '❌'}`, bpColor);
    
    // SEO
    const seoColor = result.seo >= PERFORMANCE_THRESHOLDS.seo ? 'green' : 'red';
    log(`      SEO: ${result.seo}% ${result.seo >= PERFORMANCE_THRESHOLDS.seo ? '✅' : '❌'}`, seoColor);
    
    // Timing metrics
    log(`      Load Time: ${result.loadTime}`, 'blue');
    log(`      First Contentful Paint: ${result.firstContentfulPaint}`, 'blue');
  }

  generateSummaryReport() {
    log('\n📊 Performance Test Summary', 'bright');
    log('='.repeat(60), 'cyan');

    let totalTests = 0;
    let passedTests = 0;

    for (const [storeName, storeResults] of Object.entries(this.results)) {
      log(`\n🏪 ${storeName}:`, 'bright');
      
      for (const [pageName, result] of Object.entries(storeResults)) {
        if (result.error) {
          log(`  ❌ ${pageName}: ${result.error}`, 'red');
          totalTests++;
          continue;
        }

        totalTests++;
        const passed = this.isTestPassed(result);
        if (passed) passedTests++;

        const status = passed ? '✅ PASS' : '❌ FAIL';
        log(`  ${status} ${pageName}: ${result.performance}% perf, ${result.accessibility}% a11y`, passed ? 'green' : 'red');
      }
    }

    // Overall summary
    log(`\n📈 Overall Results:`, 'bright');
    log(`Tests Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`, passedTests === totalTests ? 'green' : 'red');
    
    if (passedTests === totalTests) {
      log('🎉 All performance tests passed! Ready for submission.', 'green');
    } else {
      log('⚠️  Some tests failed. Review results and optimize before submission.', 'yellow');
    }

    // Save summary report
    this.saveSummaryReport(totalTests, passedTests);
  }

  isTestPassed(result) {
    return result.performance >= PERFORMANCE_THRESHOLDS.performance &&
           result.accessibility >= PERFORMANCE_THRESHOLDS.accessibility &&
           result.bestPractices >= PERFORMANCE_THRESHOLDS.bestPractices &&
           result.seo >= PERFORMANCE_THRESHOLDS.seo;
  }

  saveSummaryReport(totalTests, passedTests) {
    const summaryPath = path.join(this.reportDir, 'performance-summary.json');
    const summary = {
      timestamp: new Date().toISOString(),
      thresholds: PERFORMANCE_THRESHOLDS,
      results: this.results,
      summary: {
        totalTests,
        passedTests,
        passRate: Math.round(passedTests/totalTests*100)
      }
    };

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    log(`\n📄 Summary report saved: ${summaryPath}`, 'blue');
  }
}

async function main() {
  log('🚀 Starting Performance Testing', 'bright');
  log('='.repeat(60), 'cyan');

  const tester = new PerformanceTester();

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

  if (process.env.DEV_STORE && process.env.DEV_STORE !== 'your-dev-store.myshopify.com') {
    storesToTest.push({
      url: `https://${process.env.DEV_STORE}`,
      name: 'Development Store'
    });
  }

  if (process.env.STAGING_STORE && process.env.STAGING_STORE !== 'allstore-staging.myshopify.com') {
    storesToTest.push({
      url: `https://${process.env.STAGING_STORE}`,
      name: 'Staging Store'
    });
  }

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

  log('\n✅ Performance testing complete!', 'green');
  log(`📁 Reports saved in: ${tester.reportDir}`, 'blue');
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Performance testing failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = PerformanceTester;