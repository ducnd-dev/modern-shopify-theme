#!/usr/bin/env node

/**
 * Accessibility Testing Script
 * Runs accessibility audits using axe-core
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');

// Import shared utilities
const { log } = require('./setup-dev.js');

const ACCESSIBILITY_THRESHOLD = 90;

class AccessibilityTester {
  constructor() {
    this.results = {};
    this.reportDir = path.join(process.cwd(), 'accessibility-reports');
    this.ensureReportDir();
  }

  ensureReportDir() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  async testStore(storeUrl, storeName) {
    log(`\n♿ Testing accessibility for ${storeName}`, 'cyan');
    log(`URL: ${storeUrl}`, 'blue');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const testUrls = [
      { url: storeUrl, name: 'Homepage' },
      { url: `${storeUrl}/?demo=fashion`, name: 'Fashion Demo' },
      { url: `${storeUrl}/?demo=electronics`, name: 'Electronics Demo' },
      { url: `${storeUrl}/?demo=beauty`, name: 'Beauty Demo' },
      { url: `${storeUrl}/?demo=minimal`, name: 'Minimal Demo' }
    ];

    const storeResults = {};

    try {
      for (const testUrl of testUrls) {
        try {
          log(`\n  🔍 Testing: ${testUrl.name}`, 'yellow');
          const result = await this.runAxeTest(browser, testUrl.url, testUrl.name, storeName);
          storeResults[testUrl.name] = result;
          
          // Display results
          this.displayResults(result, testUrl.name);
          
        } catch (error) {
          log(`  ❌ Failed to test ${testUrl.name}: ${error.message}`, 'red');
          storeResults[testUrl.name] = { error: error.message };
        }
      }
    } finally {
      await browser.close();
    }

    this.results[storeName] = storeResults;
    return storeResults;
  }

  async runAxeTest(browser, url, pageName, storeName) {
    const page = await browser.newPage();
    
    try {
      // Set viewport for consistent testing
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Navigate to the page
      log(`    Loading page...`, 'blue');
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Wait for demo setup to complete if URL has demo parameter
      if (url.includes('?demo=')) {
        await page.waitForTimeout(2000);
      }

      // Run axe accessibility test
      log(`    Running accessibility audit...`, 'blue');
      const results = await new AxePuppeteer(page).analyze();

      // Calculate score
      const totalRules = results.passes.length + results.violations.length + results.incomplete.length;
      const passedRules = results.passes.length;
      const score = Math.round((passedRules / totalRules) * 100);

      // Save detailed report
      const reportFile = path.join(this.reportDir, `${storeName}-${pageName.toLowerCase().replace(/\s+/g, '-')}.json`);
      fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));

      return {
        url,
        score,
        violations: results.violations.length,
        passes: results.passes.length,
        incomplete: results.incomplete.length,
        criticalIssues: results.violations.filter(v => v.impact === 'critical').length,
        seriousIssues: results.violations.filter(v => v.impact === 'serious').length,
        moderateIssues: results.violations.filter(v => v.impact === 'moderate').length,
        minorIssues: results.violations.filter(v => v.impact === 'minor').length,
        reportFile,
        violationDetails: results.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          help: v.help,
          nodes: v.nodes.length
        }))
      };

    } finally {
      await page.close();
    }
  }

  displayResults(result, pageName) {
    if (result.error) {
      log(`    ❌ ${pageName}: ${result.error}`, 'red');
      return;
    }

    log(`    📊 Results for ${pageName}:`, 'bright');
    
    // Overall score
    const scoreColor = result.score >= ACCESSIBILITY_THRESHOLD ? 'green' : 'red';
    const scoreStatus = result.score >= ACCESSIBILITY_THRESHOLD ? '✅' : '❌';
    log(`      Accessibility Score: ${result.score}% ${scoreStatus}`, scoreColor);
    
    // Rule counts
    log(`      Passed Rules: ${result.passes}`, 'green');
    log(`      Failed Rules: ${result.violations}`, result.violations > 0 ? 'red' : 'green');
    log(`      Incomplete Rules: ${result.incomplete}`, result.incomplete > 0 ? 'yellow' : 'green');

    // Issue breakdown
    if (result.violations > 0) {
      log(`    🚨 Issue Breakdown:`, 'red');
      if (result.criticalIssues > 0) log(`      Critical: ${result.criticalIssues}`, 'red');
      if (result.seriousIssues > 0) log(`      Serious: ${result.seriousIssues}`, 'red');
      if (result.moderateIssues > 0) log(`      Moderate: ${result.moderateIssues}`, 'yellow');
      if (result.minorIssues > 0) log(`      Minor: ${result.minorIssues}`, 'blue');

      // Show top violations
      if (result.violationDetails.length > 0) {
        log(`    🔍 Top Issues:`, 'yellow');
        result.violationDetails.slice(0, 3).forEach(violation => {
          log(`      ${violation.impact.toUpperCase()}: ${violation.description}`, 'yellow');
        });
      }
    }
  }

  generateSummaryReport() {
    log('\n♿ Accessibility Test Summary', 'bright');
    log('='.repeat(60), 'cyan');

    let totalTests = 0;
    let passedTests = 0;
    let totalViolations = 0;
    let criticalIssues = 0;

    for (const [storeName, storeResults] of Object.entries(this.results)) {
      log(`\n🏪 ${storeName}:`, 'bright');
      
      for (const [pageName, result] of Object.entries(storeResults)) {
        if (result.error) {
          log(`  ❌ ${pageName}: ${result.error}`, 'red');
          totalTests++;
          continue;
        }

        totalTests++;
        const passed = result.score >= ACCESSIBILITY_THRESHOLD;
        if (passed) passedTests++;

        totalViolations += result.violations;
        criticalIssues += result.criticalIssues;

        const status = passed ? '✅ PASS' : '❌ FAIL';
        log(`  ${status} ${pageName}: ${result.score}% (${result.violations} violations)`, passed ? 'green' : 'red');
      }
    }

    // Overall summary
    log(`\n📈 Overall Results:`, 'bright');
    log(`Tests Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`, passedTests === totalTests ? 'green' : 'red');
    log(`Total Violations: ${totalViolations}`, totalViolations === 0 ? 'green' : 'red');
    log(`Critical Issues: ${criticalIssues}`, criticalIssues === 0 ? 'green' : 'red');
    
    if (passedTests === totalTests && criticalIssues === 0) {
      log('🎉 All accessibility tests passed! WCAG compliance achieved.', 'green');
    } else if (criticalIssues > 0) {
      log('🚨 Critical accessibility issues found. Must be fixed before submission.', 'red');
    } else {
      log('⚠️  Some accessibility tests failed. Review results and improve scores.', 'yellow');
    }

    // WCAG compliance check
    this.checkWCAGCompliance();

    // Save summary report
    this.saveSummaryReport(totalTests, passedTests, totalViolations, criticalIssues);
  }

  checkWCAGCompliance() {
    log(`\n📋 WCAG 2.1 AA Compliance Check:`, 'bright');
    
    const complianceItems = [
      { name: 'Color Contrast', check: () => this.hasNoContrastViolations() },
      { name: 'Keyboard Navigation', check: () => this.hasNoKeyboardViolations() },
      { name: 'Screen Reader Support', check: () => this.hasNoScreenReaderViolations() },
      { name: 'Focus Management', check: () => this.hasNoFocusViolations() },
      { name: 'Alternative Text', check: () => this.hasNoImageViolations() }
    ];

    let compliantItems = 0;
    
    complianceItems.forEach(item => {
      const isCompliant = item.check();
      const status = isCompliant ? '✅' : '❌';
      const color = isCompliant ? 'green' : 'red';
      log(`  ${status} ${item.name}`, color);
      if (isCompliant) compliantItems++;
    });

    const complianceRate = Math.round((compliantItems / complianceItems.length) * 100);
    log(`\nWCAG Compliance: ${complianceRate}%`, complianceRate >= 80 ? 'green' : 'red');
  }

  hasNoContrastViolations() {
    return !this.hasViolationType('color-contrast');
  }

  hasNoKeyboardViolations() {
    return !this.hasViolationType(['focus-order-semantics', 'focusable-content']);
  }

  hasNoScreenReaderViolations() {
    return !this.hasViolationType(['label', 'aria-*']);
  }

  hasNoFocusViolations() {
    return !this.hasViolationType(['focus', 'tabindex']);
  }

  hasNoImageViolations() {
    return !this.hasViolationType(['image-alt', 'object-alt']);
  }

  hasViolationType(violationTypes) {
    const types = Array.isArray(violationTypes) ? violationTypes : [violationTypes];
    
    for (const storeResults of Object.values(this.results)) {
      for (const result of Object.values(storeResults)) {
        if (result.violationDetails) {
          for (const violation of result.violationDetails) {
            if (types.some(type => violation.id.includes(type))) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  saveSummaryReport(totalTests, passedTests, totalViolations, criticalIssues) {
    const summaryPath = path.join(this.reportDir, 'accessibility-summary.json');
    const summary = {
      timestamp: new Date().toISOString(),
      threshold: ACCESSIBILITY_THRESHOLD,
      results: this.results,
      summary: {
        totalTests,
        passedTests,
        passRate: Math.round(passedTests/totalTests*100),
        totalViolations,
        criticalIssues
      }
    };

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    log(`\n📄 Summary report saved: ${summaryPath}`, 'blue');
  }
}

async function main() {
  log('🚀 Starting Accessibility Testing', 'bright');
  log('='.repeat(60), 'cyan');

  const tester = new AccessibilityTester();

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

  log('\n✅ Accessibility testing complete!', 'green');
  log(`📁 Reports saved in: ${tester.reportDir}`, 'blue');
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Accessibility testing failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = AccessibilityTester;