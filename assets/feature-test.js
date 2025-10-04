/**
 * Modern Shopify Theme - Feature Testing Suite
 * Automated testing for core theme features
 */

class FeatureTestSuite {
  constructor() {
    this.testResults = {
      demoSystem: [],
      socialProof: [],
      quickView: [],
      cart: [],
      search: [],
      testimonials: [],
      reviews: [],
      settings: []
    };
    this.init();
  }

  init() {
    console.log('🧪 Starting Feature Testing Suite...');
    
    // Wait for page to fully load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.runAllTests());
    } else {
      this.runAllTests();
    }
  }

  async runAllTests() {
    console.log('🚀 Running all feature tests...');
    
    await this.testDemoSystem();
    await this.testSocialProof();
    await this.testQuickView();
    await this.testCartFunctionality();
    await this.testSearchFunctionality();
    await this.testTestimonials();
    await this.testReviews();
    await this.testThemeSettings();
    
    this.generateFeatureReport();
  }

  async testDemoSystem() {
    console.log('🎨 Testing demo system...');
    
    const tests = [
      {
        name: 'Demo Setup Script Loaded',
        test: () => typeof window.DemoSetup !== 'undefined',
        critical: true
      },
      {
        name: 'Demo Products Container Exists',
        test: () => document.querySelector('[data-demo-products]') !== null,
        critical: false
      },
      {
        name: 'Demo Collections Container Exists',
        test: () => document.querySelector('[data-demo-collections]') !== null,
        critical: false
      },
      {
        name: 'Demo Testimonials Container Exists',
        test: () => document.querySelector('[data-demo-testimonials]') !== null,
        critical: false
      },
      {
        name: 'Demo Reviews Container Exists',
        test: () => document.querySelector('[data-demo-reviews]') !== null,
        critical: false
      },
      {
        name: 'Demo Content Populated',
        test: () => {
          const productGrid = document.querySelector('[data-demo-products]');
          return productGrid ? productGrid.children.length > 0 : false;
        },
        critical: true
      },
      {
        name: 'Demo Store Type Detection',
        test: () => {
          const urlParams = new URLSearchParams(window.location.search);
          const demoParam = urlParams.get('demo');
          return demoParam || document.body.classList.contains('demo-fashion') || 
                 document.body.classList.contains('demo-electronics') ||
                 document.body.classList.contains('demo-beauty') ||
                 document.body.classList.contains('demo-minimal');
        },
        critical: false
      }
    ];

    for (const test of tests) {
      const result = this.runTest(test);
      this.testResults.demoSystem.push(result);
    }
  }

  async testSocialProof() {
    console.log('📢 Testing social proof notifications...');
    
    const tests = [
      {
        name: 'Social Proof Container Created',
        test: () => document.querySelector('.social-proof-container') !== null,
        critical: true
      },
      {
        name: 'Social Proof Notifications Show',
        test: () => {
          // Wait for notifications to appear
          return new Promise(resolve => {
            setTimeout(() => {
              const notifications = document.querySelectorAll('.social-proof-notification');
              resolve(notifications.length > 0);
            }, 4000);
          });
        },
        critical: true
      },
      {
        name: 'Notification Animation Works',
        test: () => {
          const notification = document.querySelector('.social-proof-notification');
          return notification ? getComputedStyle(notification).transform !== 'none' : false;
        },
        critical: false
      }
    ];

    for (const test of tests) {
      const result = await this.runAsyncTest(test);
      this.testResults.socialProof.push(result);
    }
  }

  async testQuickView() {
    console.log('👀 Testing quick view functionality...');
    
    const tests = [
      {
        name: 'Quick View Buttons Exist',
        test: () => document.querySelectorAll('.btn--quick-view').length > 0,
        critical: true
      },
      {
        name: 'Quick View Modal Structure',
        test: () => {
          // Simulate quick view button click
          const quickViewBtn = document.querySelector('.btn--quick-view');
          if (quickViewBtn) {
            quickViewBtn.click();
            setTimeout(() => {
              const modal = document.querySelector('.quick-view-modal, [data-quick-view-modal]');
              return modal !== null;
            }, 100);
          }
          return false;
        },
        critical: false
      },
      {
        name: 'Quick View Close Functionality',
        test: () => {
          const closeBtn = document.querySelector('.quick-view-close, [data-quick-view-close]');
          return closeBtn !== null;
        },
        critical: false
      }
    ];

    for (const test of tests) {
      const result = this.runTest(test);
      this.testResults.quickView.push(result);
    }
  }

  async testCartFunctionality() {
    console.log('🛒 Testing cart functionality...');
    
    const tests = [
      {
        name: 'Add to Cart Buttons Exist',
        test: () => document.querySelectorAll('.btn--add-to-cart, [data-add-to-cart]').length > 0,
        critical: true
      },
      {
        name: 'Cart Drawer Structure',
        test: () => document.querySelector('.cart-drawer, [data-cart-drawer]') !== null,
        critical: true
      },
      {
        name: 'Cart Count Display',
        test: () => document.querySelector('.cart-count, [data-cart-count]') !== null,
        critical: true
      },
      {
        name: 'Cart Items Container',
        test: () => document.querySelector('.cart-items, [data-cart-items]') !== null,
        critical: false
      },
      {
        name: 'Cart Total Display',
        test: () => document.querySelector('.cart-total, [data-cart-total]') !== null,
        critical: false
      }
    ];

    for (const test of tests) {
      const result = this.runTest(test);
      this.testResults.cart.push(result);
    }
  }

  async testSearchFunctionality() {
    console.log('🔍 Testing search functionality...');
    
    const tests = [
      {
        name: 'Search Input Exists',
        test: () => document.querySelector('input[type="search"], [data-search-input]') !== null,
        critical: true
      },
      {
        name: 'Search Results Container',
        test: () => document.querySelector('.search-results, [data-search-results]') !== null,
        critical: true
      },
      {
        name: 'Predictive Search Enabled',
        test: () => {
          const searchInput = document.querySelector('input[type="search"], [data-search-input]');
          return searchInput ? searchInput.hasAttribute('data-predictive-search') : false;
        },
        critical: false
      },
      {
        name: 'Search Suggestions Container',
        test: () => document.querySelector('.search-suggestions, [data-search-suggestions]') !== null,
        critical: false
      }
    ];

    for (const test of tests) {
      const result = this.runTest(test);
      this.testResults.search.push(result);
    }
  }

  async testTestimonials() {
    console.log('💬 Testing testimonials functionality...');
    
    const tests = [
      {
        name: 'Testimonials Section Exists',
        test: () => document.querySelector('.testimonials, [data-testimonials]') !== null,
        critical: true
      },
      {
        name: 'Individual Testimonials Present',
        test: () => document.querySelectorAll('.testimonial').length > 0,
        critical: true
      },
      {
        name: 'Testimonial Ratings Display',
        test: () => document.querySelector('.testimonial__rating') !== null,
        critical: false
      },
      {
        name: 'Testimonial Authors Display',
        test: () => document.querySelector('.testimonial__author') !== null,
        critical: false
      },
      {
        name: 'Testimonial Navigation',
        test: () => {
          const prevBtn = document.querySelector('.testimonial-prev, [data-testimonial-prev]');
          const nextBtn = document.querySelector('.testimonial-next, [data-testimonial-next]');
          return prevBtn !== null || nextBtn !== null;
        },
        critical: false
      }
    ];

    for (const test of tests) {
      const result = this.runTest(test);
      this.testResults.testimonials.push(result);
    }
  }

  async testReviews() {
    console.log('⭐ Testing reviews functionality...');
    
    const tests = [
      {
        name: 'Reviews Section Exists',
        test: () => document.querySelector('.reviews, [data-reviews]') !== null,
        critical: true
      },
      {
        name: 'Individual Reviews Present',
        test: () => document.querySelectorAll('.review').length > 0,
        critical: true
      },
      {
        name: 'Review Ratings Display',
        test: () => document.querySelector('.review__rating') !== null,
        critical: false
      },
      {
        name: 'Review Authors Display',
        test: () => document.querySelector('.review__author') !== null,
        critical: false
      },
      {
        name: 'Verified Purchase Badges',
        test: () => document.querySelector('.review__verified') !== null,
        critical: false
      },
      {
        name: 'Helpful Vote Buttons',
        test: () => document.querySelector('.review__helpful') !== null,
        critical: false
      }
    ];

    for (const test of tests) {
      const result = this.runTest(test);
      this.testResults.reviews.push(result);
    }
  }

  async testThemeSettings() {
    console.log('⚙️ Testing theme settings functionality...');
    
    const tests = [
      {
        name: 'CSS Custom Properties Applied',
        test: () => {
          const root = document.documentElement;
          const primaryColor = getComputedStyle(root).getPropertyValue('--color-primary');
          return primaryColor.trim() !== '';
        },
        critical: true
      },
      {
        name: 'Theme Settings Available',
        test: () => typeof window.themeSettings !== 'undefined' || typeof window.theme !== 'undefined',
        critical: false
      },
      {
        name: 'Demo Preset Selector Exists',
        test: () => document.querySelector('.demo-preset-selector') !== null,
        critical: false
      },
      {
        name: 'Performance Features Enabled',
        test: () => {
          const lazyImages = document.querySelectorAll('img[loading="lazy"]');
          return lazyImages.length > 0;
        },
        critical: false
      }
    ];

    for (const test of tests) {
      const result = this.runTest(test);
      this.testResults.settings.push(result);
    }
  }

  runTest(test) {
    try {
      const passed = test.test();
      const result = {
        name: test.name,
        passed: Boolean(passed),
        critical: test.critical,
        timestamp: new Date().toISOString()
      };
      
      console.log(`${result.passed ? '✅' : '❌'} ${test.name}${test.critical ? ' (Critical)' : ''}`);
      return result;
    } catch (error) {
      const result = {
        name: test.name,
        passed: false,
        critical: test.critical,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      console.error(`❌ ${test.name} - Error: ${error.message}`);
      return result;
    }
  }

  async runAsyncTest(test) {
    try {
      const passed = await test.test();
      const result = {
        name: test.name,
        passed: Boolean(passed),
        critical: test.critical,
        timestamp: new Date().toISOString()
      };
      
      console.log(`${result.passed ? '✅' : '❌'} ${test.name}${test.critical ? ' (Critical)' : ''}`);
      return result;
    } catch (error) {
      const result = {
        name: test.name,
        passed: false,
        critical: test.critical,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      console.error(`❌ ${test.name} - Error: ${error.message}`);
      return result;
    }
  }

  generateFeatureReport() {
    console.log('\n📋 === FEATURE TESTING REPORT ===');
    
    const allResults = [
      ...this.testResults.demoSystem,
      ...this.testResults.socialProof,
      ...this.testResults.quickView,
      ...this.testResults.cart,
      ...this.testResults.search,
      ...this.testResults.testimonials,
      ...this.testResults.reviews,
      ...this.testResults.settings
    ];
    
    const totalTests = allResults.length;
    const passedTests = allResults.filter(r => r.passed).length;
    const criticalTests = allResults.filter(r => r.critical);
    const criticalPassed = criticalTests.filter(r => r.passed).length;
    const failedTests = allResults.filter(r => !r.passed);
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${failedTests.length}`);
    console.log(`Critical Tests: ${criticalTests.length}`);
    console.log(`Critical Passed: ${criticalPassed}/${criticalTests.length}`);
    
    if (failedTests.length > 0) {
      console.log(`\n❌ FAILED TESTS:`);
      failedTests.forEach(test => {
        console.log(`- ${test.name}${test.critical ? ' (CRITICAL)' : ''}`);
        if (test.error) {
          console.log(`  Error: ${test.error}`);
        }
      });
    }
    
    // Feature-specific summaries
    Object.entries(this.testResults).forEach(([feature, results]) => {
      if (results.length > 0) {
        const passed = results.filter(r => r.passed).length;
        console.log(`\n${this.getFeatureIcon(feature)} ${this.getFeatureName(feature)}: ${passed}/${results.length} passed`);
      }
    });
    
    // Overall assessment
    const overallScore = (passedTests / totalTests) * 100;
    const criticalScore = criticalTests.length > 0 ? (criticalPassed / criticalTests.length) * 100 : 100;
    
    console.log(`\n🎯 OVERALL ASSESSMENT:`);
    if (criticalScore === 100 && overallScore >= 90) {
      console.log('✅ All critical features working, excellent overall quality!');
    } else if (criticalScore === 100 && overallScore >= 75) {
      console.log('⚠️ All critical features working, some minor issues to address.');
    } else if (criticalScore < 100) {
      console.log('❌ Critical features failing - immediate attention required!');
    } else {
      console.log('⚠️ Multiple issues detected - review and fix before deployment.');
    }
    
    console.log('\n=== END FEATURE REPORT ===\n');
    
    // Store results for external access
    window.featureTestResults = {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests.length,
        critical: criticalTests.length,
        criticalPassed: criticalPassed,
        overallScore: overallScore,
        criticalScore: criticalScore
      },
      results: this.testResults,
      timestamp: new Date().toISOString()
    };
  }

  getFeatureIcon(feature) {
    const icons = {
      demoSystem: '🎨',
      socialProof: '📢',
      quickView: '👀',
      cart: '🛒',
      search: '🔍',
      testimonials: '💬',
      reviews: '⭐',
      settings: '⚙️'
    };
    return icons[feature] || '🧪';
  }

  getFeatureName(feature) {
    const names = {
      demoSystem: 'Demo System',
      socialProof: 'Social Proof',
      quickView: 'Quick View',
      cart: 'Cart Functionality',
      search: 'Search Functionality',
      testimonials: 'Testimonials',
      reviews: 'Reviews',
      settings: 'Theme Settings'
    };
    return names[feature] || feature;
  }

  // Manual testing utilities
  static runQuickTest() {
    console.log('🚀 Running quick feature test...');
    const suite = new FeatureTestSuite();
    return suite;
  }

  static testSpecificFeature(featureName) {
    console.log(`🧪 Testing specific feature: ${featureName}`);
    const suite = new FeatureTestSuite();
    
    switch (featureName.toLowerCase()) {
      case 'demo':
        suite.testDemoSystem();
        break;
      case 'social':
        suite.testSocialProof();
        break;
      case 'quickview':
        suite.testQuickView();
        break;
      case 'cart':
        suite.testCartFunctionality();
        break;
      case 'search':
        suite.testSearchFunctionality();
        break;
      case 'testimonials':
        suite.testTestimonials();
        break;
      case 'reviews':
        suite.testReviews();
        break;
      case 'settings':
        suite.testThemeSettings();
        break;
      default:
        console.log('Available features: demo, social, quickview, cart, search, testimonials, reviews, settings');
    }
  }
}

// Auto-initialize in test mode
if (window.location.search.includes('feature-test=true') ||
    localStorage.getItem('theme-feature-test') === 'true') {
  
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => new FeatureTestSuite(), 2000);
  });
}

// Export for manual testing
window.FeatureTestSuite = FeatureTestSuite;