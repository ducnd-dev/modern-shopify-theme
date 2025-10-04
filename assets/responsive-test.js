/**
 * Modern Shopify Theme - Responsive & Cross-Browser Testing Utilities
 * Tools for testing responsive design and browser compatibility
 */

class ResponsiveTestSuite {
  constructor() {
    this.breakpoints = {
      mobile: 375,
      tablet: 768,
      desktop: 1024,
      large: 1440
    };
    this.testResults = {
      responsive: [],
      compatibility: [],
      features: []
    };
    this.init();
  }

  init() {
    console.log('📱 Starting Responsive & Cross-Browser Test Suite...');
    this.testResponsiveBreakpoints();
    this.testBrowserFeatures();
    this.testTouchInteractions();
    this.generateResponsiveReport();
  }

  testResponsiveBreakpoints() {
    console.log('📐 Testing responsive breakpoints...');
    
    Object.entries(this.breakpoints).forEach(([name, width]) => {
      this.simulateViewport(name, width);
    });
  }

  simulateViewport(deviceName, width) {
    // Create a test iframe to simulate different viewport sizes
    const iframe = document.createElement('iframe');
    iframe.style.width = width + 'px';
    iframe.style.height = '600px';
    iframe.style.border = 'none';
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.src = window.location.href;
    
    document.body.appendChild(iframe);
    
    iframe.onload = () => {
      setTimeout(() => {
        this.checkResponsiveLayout(iframe, deviceName, width);
        document.body.removeChild(iframe);
      }, 2000);
    };
  }

  checkResponsiveLayout(iframe, deviceName, width) {
    const iframeDoc = iframe.contentDocument;
    const issues = [];
    
    // Check for horizontal scroll
    if (iframeDoc.body.scrollWidth > width) {
      issues.push(`Horizontal scroll detected at ${width}px`);
    }
    
    // Check for overflow elements
    const elements = iframeDoc.querySelectorAll('*');
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > width) {
        issues.push(`Element ${el.tagName} overflows container`);
      }
    });
    
    // Check navigation menu
    const nav = iframeDoc.querySelector('nav, .navigation, .header__nav');
    if (nav) {
      const navStyle = iframe.contentWindow.getComputedStyle(nav);
      if (width < 768 && navStyle.display !== 'none') {
        // Should have mobile menu at small screens
        const mobileMenu = iframeDoc.querySelector('.mobile-menu, .header__mobile-menu');
        if (!mobileMenu) {
          issues.push('Missing mobile menu for small screens');
        }
      }
    }
    
    // Check text readability
    const textElements = iframeDoc.querySelectorAll('p, span, a, button');
    textElements.forEach(el => {
      const style = iframe.contentWindow.getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize);
      if (width < 768 && fontSize < 14) {
        issues.push(`Text too small for mobile: ${fontSize}px`);
      }
    });
    
    // Check touch targets
    const buttons = iframeDoc.querySelectorAll('button, a, input[type="button"]');
    buttons.forEach(btn => {
      const rect = btn.getBoundingClientRect();
      if (width < 768 && (rect.width < 44 || rect.height < 44)) {
        issues.push(`Touch target too small: ${rect.width}x${rect.height}px`);
      }
    });
    
    this.testResults.responsive.push({
      device: deviceName,
      width: width,
      issues: issues,
      passed: issues.length === 0
    });
    
    console.log(`📱 ${deviceName} (${width}px): ${issues.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`  - ${issue}`));
    }
  }

  testBrowserFeatures() {
    console.log('🌐 Testing browser compatibility...');
    
    const features = {
      'CSS Grid': this.supportsCSSGrid(),
      'CSS Flexbox': this.supportsCSSFlexbox(),
      'CSS Custom Properties': this.supportsCSSCustomProperties(),
      'ES6 Classes': this.supportsES6Classes(),
      'Fetch API': this.supportsFetch(),
      'Service Workers': this.supportsServiceWorkers(),
      'Web Components': this.supportsWebComponents(),
      'Intersection Observer': this.supportsIntersectionObserver(),
      'Local Storage': this.supportsLocalStorage(),
      'Session Storage': this.supportsSessionStorage()
    };
    
    Object.entries(features).forEach(([feature, supported]) => {
      this.testResults.compatibility.push({
        feature: feature,
        supported: supported
      });
      
      console.log(`${supported ? '✅' : '❌'} ${feature}: ${supported ? 'Supported' : 'Not supported'}`);
      
      if (!supported) {
        console.warn(`⚠️ ${feature} not supported - consider fallbacks`);
      }
    });
  }

  testTouchInteractions() {
    console.log('👆 Testing touch interactions...');
    
    // Test touch events
    const touchSupported = 'ontouchstart' in window;
    this.testResults.features.push({
      feature: 'Touch Events',
      supported: touchSupported
    });
    
    // Test hover interactions on touch devices
    if (touchSupported) {
      const hoverElements = document.querySelectorAll(':hover, .hover\\:');
      if (hoverElements.length > 0) {
        console.warn('⚠️ Hover effects detected - ensure touch alternatives exist');
      }
    }
    
    // Test gesture support
    const gestureSupported = 'ongesturestart' in window;
    this.testResults.features.push({
      feature: 'Gesture Events',
      supported: gestureSupported
    });
    
    console.log(`👆 Touch Events: ${touchSupported ? 'Supported' : 'Not supported'}`);
    console.log(`🤏 Gesture Events: ${gestureSupported ? 'Supported' : 'Not supported'}`);
  }

  // Browser feature detection methods
  supportsCSSGrid() {
    return CSS.supports('display', 'grid');
  }

  supportsCSSFlexbox() {
    return CSS.supports('display', 'flex');
  }

  supportsCSSCustomProperties() {
    return CSS.supports('--custom-property', 'value');
  }

  supportsES6Classes() {
    try {
      // eslint-disable-next-line no-new-func
      new Function('class Test {}')();
      return true;
    } catch {
      return false;
    }
  }

  supportsFetch() {
    return 'fetch' in window;
  }

  supportsServiceWorkers() {
    return 'serviceWorker' in navigator;
  }

  supportsWebComponents() {
    return 'customElements' in window;
  }

  supportsIntersectionObserver() {
    return 'IntersectionObserver' in window;
  }

  supportsLocalStorage() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  }

  supportsSessionStorage() {
    try {
      sessionStorage.setItem('test', 'test');
      sessionStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  }

  generateResponsiveReport() {
    setTimeout(() => {
      console.log('\n📋 === RESPONSIVE & COMPATIBILITY REPORT ===');
      
      // Responsive Results
      console.log('\n📱 RESPONSIVE TEST RESULTS:');
      this.testResults.responsive.forEach(result => {
        console.log(`${result.passed ? '✅' : '❌'} ${result.device} (${result.width}px)`);
        if (!result.passed) {
          result.issues.forEach(issue => console.log(`  - ${issue}`));
        }
      });
      
      // Browser Compatibility
      console.log('\n🌐 BROWSER COMPATIBILITY:');
      const unsupportedFeatures = this.testResults.compatibility.filter(f => !f.supported);
      if (unsupportedFeatures.length === 0) {
        console.log('✅ All required features are supported');
      } else {
        console.log('❌ Some features are not supported:');
        unsupportedFeatures.forEach(feature => {
          console.log(`  - ${feature.feature}`);
        });
      }
      
      // Touch & Mobile Features
      console.log('\n👆 TOUCH & MOBILE FEATURES:');
      this.testResults.features.forEach(feature => {
        console.log(`${feature.supported ? '✅' : '❌'} ${feature.feature}`);
      });
      
      // Overall Assessment
      const responsivePassed = this.testResults.responsive.every(r => r.passed);
      const criticalFeaturesSupported = this.testResults.compatibility
        .filter(f => ['CSS Grid', 'CSS Flexbox', 'ES6 Classes'].includes(f.feature))
        .every(f => f.supported);
      
      console.log('\n🎯 OVERALL ASSESSMENT:');
      if (responsivePassed && criticalFeaturesSupported) {
        console.log('✅ Theme is responsive and compatible across devices/browsers');
      } else {
        console.log('❌ Issues detected that need attention');
      }
      
      console.log('\n=== END RESPONSIVE REPORT ===\n');
      
      // Store results for external access
      window.responsiveTestResults = this.testResults;
      
    }, 5000);
  }

  // Manual testing utilities
  static showViewportInfo() {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      orientation: screen.orientation ? screen.orientation.angle : 'unknown',
      userAgent: navigator.userAgent
    };
    
    console.log('📱 Current Viewport Info:', viewport);
    return viewport;
  }

  static testBreakpoint(width) {
    const originalWidth = window.innerWidth;
    
    // This would require browser dev tools to actually resize
    console.log(`🧪 To test ${width}px breakpoint:`);
    console.log(`1. Open Chrome DevTools`);
    console.log(`2. Toggle device toolbar (Ctrl+Shift+M)`);
    console.log(`3. Set width to ${width}px`);
    console.log(`4. Check layout and functionality`);
    
    return {
      instruction: `Manual test required for ${width}px`,
      currentWidth: originalWidth
    };
  }

  static runQuickMobileTest() {
    console.log('🧪 Running quick mobile compatibility test...');
    
    const checks = {
      touchEvents: 'ontouchstart' in window,
      viewport: document.querySelector('meta[name="viewport"]') !== null,
      mobileFriendly: window.innerWidth < 768,
      fastClick: !document.querySelector('meta[name="format-detection"]')
    };
    
    console.log('Mobile Compatibility Checks:', checks);
    return checks;
  }
}

// Device-specific testing utilities
class DeviceTestUtils {
  static iPhone() {
    return {
      userAgent: 'iPhone',
      width: 375,
      height: 667,
      pixelRatio: 2
    };
  }

  static iPad() {
    return {
      userAgent: 'iPad',
      width: 768,
      height: 1024,
      pixelRatio: 2
    };
  }

  static android() {
    return {
      userAgent: 'Android',
      width: 360,
      height: 640,
      pixelRatio: 3
    };
  }

  static desktop() {
    return {
      userAgent: 'Desktop',
      width: 1920,
      height: 1080,
      pixelRatio: 1
    };
  }
}

// Auto-initialize in test mode
if (window.location.search.includes('responsive-test=true') ||
    localStorage.getItem('theme-responsive-test') === 'true') {
  
  document.addEventListener('DOMContentLoaded', () => {
    new ResponsiveTestSuite();
  });
}

// Export for manual testing
window.ResponsiveTestSuite = ResponsiveTestSuite;
window.DeviceTestUtils = DeviceTestUtils;