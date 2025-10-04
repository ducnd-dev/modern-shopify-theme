// Quick test to verify all classes are working
console.log('🧪 Testing JavaScript Classes...');

try {
    // Test PerformanceTester
    if (typeof PerformanceTester !== 'undefined') {
        console.log('✅ PerformanceTester loaded successfully');
        const _perfTester = new PerformanceTester();
        console.log('✅ PerformanceTester instance created');
    } else {
        console.log('❌ PerformanceTester not found');
    }

    // Test AccessibilityTester
    if (typeof AccessibilityTester !== 'undefined') {
        console.log('✅ AccessibilityTester loaded successfully');
        const _accTester = new AccessibilityTester();
        console.log('✅ AccessibilityTester instance created');
    } else {
        console.log('❌ AccessibilityTester not found');
    }

    // Test BrowserCompatibilityTester
    if (typeof BrowserCompatibilityTester !== 'undefined') {
        console.log('✅ BrowserCompatibilityTester loaded successfully');
        const _compTester = new BrowserCompatibilityTester();
        console.log('✅ BrowserCompatibilityTester instance created');
    } else {
        console.log('❌ BrowserCompatibilityTester not found');
    }

    // Test ShopifyThemeTestSuite
    if (typeof ShopifyThemeTestSuite !== 'undefined') {
        console.log('✅ ShopifyThemeTestSuite loaded successfully');
        const _testSuite = new ShopifyThemeTestSuite();
        console.log('✅ ShopifyThemeTestSuite instance created');
    } else {
        console.log('❌ ShopifyThemeTestSuite not found');
    }

    console.log('🎯 All classes verification complete!');
    
} catch (error) {
    console.error('❌ Error during class testing:', error);
}

// Test a simple performance test
async function runQuickTest() {
    try {
        console.log('\n🔄 Running quick performance test...');
        const perfTester = new PerformanceTester();
        const result = await perfTester.testPage({
            name: 'Quick Test',
            template: 'test',
            url: window.location.href
        });
        
        if (result) {
            console.log(`✅ Quick test completed: ${result.score}% score`);
        }
    } catch (error) {
        console.error('❌ Quick test failed:', error);
    }
}

// Run quick test after a short delay
setTimeout(runQuickTest, 1000);