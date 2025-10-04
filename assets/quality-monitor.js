/**
 * Modern Shopify Theme - Performance & Quality Monitoring Script
 * Automated testing and monitoring for theme performance
 */

class ThemeQualityMonitor {
  constructor() {
    this.performanceMetrics = {};
    this.accessibilityIssues = [];
    this.errors = [];
    this.init();
  }

  init() {
    console.log('🔍 Starting Theme Quality Monitor...');
    this.monitorPerformance();
    this.checkAccessibility();
    this.monitorErrors();
    this.generateReport();
  }

  monitorPerformance() {
    console.log('📊 Monitoring performance metrics...');
    
    // Web Vitals monitoring
    this.measureWebVitals();
    
    // Resource loading monitoring
    this.monitorResourceLoading();
    
    // Animation performance
    this.monitorAnimationPerformance();
    
    // Memory usage
    this.monitorMemoryUsage();
  }

  measureWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.performanceMetrics.lcp = entry.startTime;
        console.log(`📏 LCP: ${entry.startTime.toFixed(2)}ms`);
        
        if (entry.startTime > 2500) {
          this.addWarning('LCP', `LCP is ${entry.startTime.toFixed(2)}ms (should be < 2500ms)`);
        }
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID) - requires user interaction
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.performanceMetrics.fid = entry.processingStart - entry.startTime;
        console.log(`⚡ FID: ${this.performanceMetrics.fid.toFixed(2)}ms`);
        
        if (this.performanceMetrics.fid > 100) {
          this.addWarning('FID', `FID is ${this.performanceMetrics.fid.toFixed(2)}ms (should be < 100ms)`);
        }
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.performanceMetrics.cls = clsValue;
      console.log(`📐 CLS: ${clsValue.toFixed(3)}`);
      
      if (clsValue > 0.1) {
        this.addWarning('CLS', `CLS is ${clsValue.toFixed(3)} (should be < 0.1)`);
      }
    }).observe({ entryTypes: ['layout-shift'] });

    // Time to Interactive (TTI) estimation
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigationTiming = performance.getEntriesByType('navigation')[0];
        const tti = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
        this.performanceMetrics.tti = tti;
        console.log(`🚀 TTI: ${tti.toFixed(2)}ms`);
        
        if (tti > 3800) {
          this.addWarning('TTI', `TTI is ${tti.toFixed(2)}ms (should be < 3800ms)`);
        }
      }, 5000);
    });
  }

  monitorResourceLoading() {
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource');
      
      // Check for large images
      const images = resources.filter(r => r.initiatorType === 'img');
      images.forEach(img => {
        if (img.transferSize > 500000) { // 500KB
          this.addWarning('Image Size', `Large image detected: ${img.name} (${(img.transferSize / 1024).toFixed(2)}KB)`);
        }
      });

      // Check for slow loading resources
      const slowResources = resources.filter(r => r.duration > 1000);
      slowResources.forEach(resource => {
        this.addWarning('Slow Resource', `Slow loading resource: ${resource.name} (${resource.duration.toFixed(2)}ms)`);
      });

      // Check total page weight
      const totalSize = resources.reduce((total, resource) => total + (resource.transferSize || 0), 0);
      this.performanceMetrics.totalPageSize = totalSize;
      console.log(`📦 Total page size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
      
      if (totalSize > 3000000) { // 3MB
        this.addWarning('Page Size', `Page size is ${(totalSize / 1024 / 1024).toFixed(2)}MB (recommended < 3MB)`);
      }
    });
  }

  monitorAnimationPerformance() {
    // Monitor for janky animations
    let frameCount = 0;
    let lastTime = performance.now();
    const targetFPS = 60;
    const frameThreshold = 1000 / targetFPS;

    const checkFrame = (currentTime) => {
      const timeSinceLastFrame = currentTime - lastTime;
      
      if (timeSinceLastFrame > frameThreshold * 2) { // Frame took more than 2x expected time
        this.addWarning('Animation', `Janky frame detected: ${timeSinceLastFrame.toFixed(2)}ms (expected ~${frameThreshold.toFixed(2)}ms)`);
      }
      
      frameCount++;
      lastTime = currentTime;
      
      if (frameCount < 300) { // Monitor for 5 seconds at 60fps
        requestAnimationFrame(checkFrame);
      } else {
        const avgFrameTime = (performance.now() - (lastTime - frameCount * frameThreshold)) / frameCount;
        this.performanceMetrics.avgFrameTime = avgFrameTime;
        console.log(`🎬 Average frame time: ${avgFrameTime.toFixed(2)}ms`);
      }
    };

    requestAnimationFrame(checkFrame);
  }

  monitorMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      this.performanceMetrics.memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
      
      console.log(`🧠 Memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      
      if (memory.usedJSHeapSize > 50000000) { // 50MB
        this.addWarning('Memory', `High memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      }
    }
  }

  checkAccessibility() {
    console.log('♿ Checking accessibility...');
    
    setTimeout(() => {
      this.checkColorContrast();
      this.checkKeyboardNavigation();
      this.checkAriaLabels();
      this.checkImageAltTexts();
      this.checkHeadingStructure();
    }, 2000);
  }

  checkColorContrast() {
    const elements = document.querySelectorAll('*');
    const problemElements = [];
    
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      // Simple contrast check (would need more sophisticated calculation in production)
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        // This is a simplified check - would need proper contrast ratio calculation
        if (this.isLowContrast(color, backgroundColor)) {
          problemElements.push(el);
        }
      }
    });
    
    if (problemElements.length > 0) {
      this.addAccessibilityIssue('Color Contrast', `${problemElements.length} elements may have insufficient color contrast`);
    }
  }

  checkKeyboardNavigation() {
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    let issuesFound = 0;
    
    focusableElements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.outline === 'none' && !el.classList.contains('focus:outline')) {
        issuesFound++;
      }
    });
    
    if (issuesFound > 0) {
      this.addAccessibilityIssue('Keyboard Navigation', `${issuesFound} focusable elements missing focus indicators`);
    }
  }

  checkAriaLabels() {
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    let missingLabels = 0;
    
    interactiveElements.forEach(el => {
      const hasLabel = el.getAttribute('aria-label') || 
                      el.getAttribute('aria-labelledby') || 
                      el.textContent.trim() ||
                      (el.tagName === 'INPUT' && document.querySelector(`label[for="${el.id}"]`));
      
      if (!hasLabel) {
        missingLabels++;
      }
    });
    
    if (missingLabels > 0) {
      this.addAccessibilityIssue('ARIA Labels', `${missingLabels} interactive elements missing accessible labels`);
    }
  }

  checkImageAltTexts() {
    const images = document.querySelectorAll('img');
    let missingAltTexts = 0;
    
    images.forEach(img => {
      if (!img.getAttribute('alt')) {
        missingAltTexts++;
      }
    });
    
    if (missingAltTexts > 0) {
      this.addAccessibilityIssue('Image Alt Text', `${missingAltTexts} images missing alt text`);
    }
  }

  checkHeadingStructure() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
    
    let structureIssues = 0;
    
    for (let i = 1; i < headingLevels.length; i++) {
      const current = headingLevels[i];
      const previous = headingLevels[i - 1];
      
      if (current - previous > 1) {
        structureIssues++;
      }
    }
    
    if (structureIssues > 0) {
      this.addAccessibilityIssue('Heading Structure', `${structureIssues} heading level skips detected`);
    }
  }

  monitorErrors() {
    window.addEventListener('error', (event) => {
      this.errors.push({
        type: 'JavaScript Error',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        timestamp: new Date().toISOString()
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.errors.push({
        type: 'Unhandled Promise Rejection',
        message: event.reason.toString(),
        timestamp: new Date().toISOString()
      });
    });
  }

  isLowContrast(_color1, _color2) {
    // Simplified contrast check - in production would use proper WCAG calculation
    return false; // Placeholder
  }

  addWarning(category, message) {
    console.warn(`⚠️ ${category}: ${message}`);
    if (!this.performanceMetrics.warnings) {
      this.performanceMetrics.warnings = [];
    }
    this.performanceMetrics.warnings.push({ category, message });
  }

  addAccessibilityIssue(category, message) {
    console.warn(`♿ Accessibility Issue - ${category}: ${message}`);
    this.accessibilityIssues.push({ category, message });
  }

  generateReport() {
    setTimeout(() => {
      console.log('\n📋 === THEME QUALITY REPORT ===');
      
      // Performance Summary
      console.log('\n📊 PERFORMANCE METRICS:');
      console.log(`LCP: ${this.performanceMetrics.lcp?.toFixed(2) || 'N/A'}ms`);
      console.log(`FID: ${this.performanceMetrics.fid?.toFixed(2) || 'N/A'}ms`);
      console.log(`CLS: ${this.performanceMetrics.cls?.toFixed(3) || 'N/A'}`);
      console.log(`TTI: ${this.performanceMetrics.tti?.toFixed(2) || 'N/A'}ms`);
      console.log(`Page Size: ${this.performanceMetrics.totalPageSize ? (this.performanceMetrics.totalPageSize / 1024 / 1024).toFixed(2) + 'MB' : 'N/A'}`);
      
      // Performance Warnings
      if (this.performanceMetrics.warnings?.length > 0) {
        console.log('\n⚠️ PERFORMANCE WARNINGS:');
        this.performanceMetrics.warnings.forEach(warning => {
          console.log(`- ${warning.category}: ${warning.message}`);
        });
      }
      
      // Accessibility Issues
      if (this.accessibilityIssues.length > 0) {
        console.log('\n♿ ACCESSIBILITY ISSUES:');
        this.accessibilityIssues.forEach(issue => {
          console.log(`- ${issue.category}: ${issue.message}`);
        });
      }
      
      // JavaScript Errors
      if (this.errors.length > 0) {
        console.log('\n🚨 JAVASCRIPT ERRORS:');
        this.errors.forEach(error => {
          console.log(`- ${error.type}: ${error.message}`);
        });
      }
      
      // Overall Score
      const score = this.calculateOverallScore();
      console.log(`\n🎯 OVERALL QUALITY SCORE: ${score}/100`);
      
      if (score >= 90) {
        console.log('✅ Excellent quality! Theme is ready for production.');
      } else if (score >= 75) {
        console.log('⚠️ Good quality, but consider addressing the warnings above.');
      } else {
        console.log('❌ Quality issues detected. Please fix before deploying.');
      }
      
      console.log('\n=== END REPORT ===\n');
      
      // Store report for external access
      window.themeQualityReport = {
        performance: this.performanceMetrics,
        accessibility: this.accessibilityIssues,
        errors: this.errors,
        score: score,
        timestamp: new Date().toISOString()
      };
    }, 10000); // Generate report after 10 seconds
  }

  calculateOverallScore() {
    let score = 100;
    
    // Deduct points for performance issues
    if (this.performanceMetrics.warnings) {
      score -= this.performanceMetrics.warnings.length * 5;
    }
    
    // Deduct points for accessibility issues
    score -= this.accessibilityIssues.length * 10;
    
    // Deduct points for JavaScript errors
    score -= this.errors.length * 15;
    
    // Performance penalties
    if (this.performanceMetrics.lcp > 2500) score -= 10;
    if (this.performanceMetrics.fid > 100) score -= 10;
    if (this.performanceMetrics.cls > 0.1) score -= 10;
    if (this.performanceMetrics.tti > 3800) score -= 10;
    
    return Math.max(0, score);
  }

  // Manual testing helpers
  static runPerformanceTest() {
    console.log('🧪 Running manual performance test...');
    
    // Simulate user interactions for FID measurement
    document.body.click();
    
    // Test lazy loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    console.log(`📷 Found ${images.length} lazy-loaded images`);
    
    // Test service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        console.log('✅ Service Worker is active');
      });
    }
  }

  static runAccessibilityTest() {
    console.log('🧪 Running manual accessibility test...');
    
    // Test keyboard navigation
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    console.log(`⌨️ Found ${focusableElements.length} focusable elements`);
    
    // Test skip links
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    console.log(`🔗 Found ${skipLinks.length} skip/anchor links`);
  }
}

// Auto-initialize in development/demo mode
if (window.location.hostname.includes('localhost') || 
    window.location.search.includes('qa=true') ||
    localStorage.getItem('theme-qa-mode') === 'true') {
  
  document.addEventListener('DOMContentLoaded', () => {
    new ThemeQualityMonitor();
  });
}

// Export for manual testing
window.ThemeQualityMonitor = ThemeQualityMonitor;