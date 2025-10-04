// Performance Optimization & Lazy Loading Enhancement
// Comprehensive performance utilities for modern Shopify theme

class PerformanceOptimizer {
  constructor() {
    this.imageObserver = null;
    this.elementObserver = null;
    this.performanceMetrics = {};
    this.lazyImages = new Set();
    this.init();
  }

  init() {
    this.setupImageLazyLoading();
    this.setupElementObserver();
    this.setupPerformanceMonitoring();
    this.optimizeScrolling();
    this.preloadCriticalResources();
    this.setupServiceWorker();
  }

  // Advanced Image Lazy Loading
  setupImageLazyLoading() {
    const imageObserverOptions = {
      root: null,
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.01
    };

    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.imageObserver.unobserve(entry.target);
        }
      });
    }, imageObserverOptions);

    // Observe all lazy images
    this.observeLazyImages();
  }

  observeLazyImages() {
    const lazyImages = document.querySelectorAll('img[data-src], img[loading="lazy"]');
    lazyImages.forEach(img => {
      this.lazyImages.add(img);
      this.imageObserver.observe(img);
      
      // Add placeholder while loading
      if (!img.src && img.dataset.src) {
        img.src = this.generatePlaceholder(img);
      }
    });
  }

  loadImage(img) {
    const src = img.dataset.src || img.src;
    
    // Create a new image to preload
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      // Fade in transition
      img.style.transition = 'opacity 0.3s ease-in-out';
      img.style.opacity = '0';
      
      setTimeout(() => {
        img.src = src;
        img.style.opacity = '1';
        img.classList.add('loaded');
        
        // Remove data-src to prevent reloading
        delete img.dataset.src;
        
        // Fire custom event
        img.dispatchEvent(new CustomEvent('imageLoaded', {
          detail: { src, loadTime: performance.now() }
        }));
      }, 10);
    };

    imageLoader.onerror = () => {
      img.classList.add('error');
      console.warn('Failed to load image:', src);
    };

    imageLoader.src = src;
  }

  generatePlaceholder(img) {
    const width = img.getAttribute('width') || 400;
    const height = img.getAttribute('height') || 300;
    
    // Generate SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui">
          Loading...
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  // Element Animation Observer
  setupElementObserver() {
    const elementObserverOptions = {
      root: null,
      rootMargin: '10px',
      threshold: 0.1
    };

    this.elementObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('observed');
          
          // Trigger animations
          if (entry.target.dataset.animation) {
            this.triggerAnimation(entry.target);
          }
        }
      });
    }, elementObserverOptions);

    // Observe elements with fade-in-observer class
    document.querySelectorAll('.fade-in-observer').forEach(el => {
      this.elementObserver.observe(el);
    });
  }

  triggerAnimation(element) {
    const animationType = element.dataset.animation;
    
    switch (animationType) {
      case 'fadeInUp':
        element.style.animation = 'fadeInUp 0.6s ease-out forwards';
        break;
      case 'slideInLeft':
        element.style.animation = 'slideInLeft 0.6s ease-out forwards';
        break;
      case 'zoomIn':
        element.style.animation = 'zoomIn 0.5s ease-out forwards';
        break;
      default:
        element.classList.add('animate-in');
    }
  }

  // Performance Monitoring
  setupPerformanceMonitoring() {
    // Measure Core Web Vitals
    this.measureCoreWebVitals();
    
    // Monitor JavaScript performance
    this.monitorJavaScriptPerformance();
    
    // Track resource loading times
    this.trackResourceTiming();
  }

  measureCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.performanceMetrics.lcp = lastEntry.startTime;
        
        if (lastEntry.startTime > 2500) {
          console.warn('LCP is slow:', lastEntry.startTime);
        }
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.performanceMetrics.fid = entry.processingStart - entry.startTime;
          
          if (entry.processingStart - entry.startTime > 100) {
            console.warn('FID is slow:', entry.processingStart - entry.startTime);
          }
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        this.performanceMetrics.cls = clsValue;
        
        if (clsValue > 0.1) {
          console.warn('CLS is high:', clsValue);
        }
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  monitorJavaScriptPerformance() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.duration > 50) {
            console.warn('Long task detected:', entry.duration);
          }
        });
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    }
  }

  trackResourceTiming() {
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource');
      const slowResources = resources.filter(resource => resource.duration > 1000);
      
      if (slowResources.length > 0) {
        console.warn('Slow loading resources:', slowResources);
      }
    });
  }

  // Optimize Scrolling Performance
  optimizeScrolling() {
    let ticking = false;
    
    const optimizedScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
  }

  handleScroll() {
    const scrollTop = window.pageYOffset;
    
    // Header scroll effect
    const header = document.querySelector('.header-wrapper');
    if (header) {
      if (scrollTop > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    
    // Parallax effect for hero section (optimized)
    const hero = document.querySelector('.hero-section');
    if (hero && scrollTop < window.innerHeight) {
      const offset = scrollTop * 0.5;
      hero.style.transform = `translateY(${offset}px)`;
    }
  }

  // Preload Critical Resources
  preloadCriticalResources() {
    // Preload critical CSS
    this.preloadCSS('/assets/performance-critical.css');
    
    // Preload critical fonts
    this.preloadFont('/assets/fonts/primary-regular.woff2');
    this.preloadFont('/assets/fonts/primary-semibold.woff2');
    
    // Preload hero images
    const heroImages = document.querySelectorAll('.hero-section img');
    heroImages.forEach(img => {
      if (img.dataset.src) {
        this.preloadImage(img.dataset.src);
      }
    });
  }

  preloadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  }

  preloadFont(href) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = href;
    document.head.appendChild(link);
  }

  preloadImage(src) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }

  // Service Worker Setup
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }

  // Image Format Detection and Optimization
  supportsWebP() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  supportsAVIF() {
    return new Promise((resolve) => {
      const avif = new Image();
      avif.onload = avif.onerror = () => {
        resolve(avif.height === 2);
      };
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
    });
  }

  // Progressive Enhancement
  progressivelyEnhance() {
    // Check for modern browser features
    const hasIntersectionObserver = 'IntersectionObserver' in window;
    const hasRequestIdleCallback = 'requestIdleCallback' in window;
    const hasPerformanceObserver = 'PerformanceObserver' in window;
    
    if (hasIntersectionObserver) {
      this.setupImageLazyLoading();
    } else {
      // Fallback for older browsers
      this.loadAllImages();
    }
    
    if (hasRequestIdleCallback) {
      requestIdleCallback(() => {
        this.setupPerformanceMonitoring();
      });
    }
    
    if (hasPerformanceObserver) {
      this.measureCoreWebVitals();
    }
  }

  loadAllImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      delete img.dataset.src;
    });
  }

  // Critical CSS Inlining
  inlineCriticalCSS() {
    const criticalCSS = `
      .header-wrapper { position: fixed; top: 0; left: 0; right: 0; z-index: 50; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .hero-section { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
      .product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
      .product-card { background: white; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
      .btn-primary { padding: 0.75rem 1.5rem; background: #2563eb; color: white; border-radius: 0.5rem; transition: background-color 0.2s; }
      .btn-primary:hover { background: #1d4ed8; }
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }

  // Defer Non-Critical Resources
  deferNonCriticalResources() {
    // Defer non-critical CSS
    const nonCriticalLinks = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
    nonCriticalLinks.forEach(link => {
      link.media = 'print';
      link.onload = () => {
        link.media = 'all';
      };
    });
    
    // Lazy load non-critical JavaScript
    const nonCriticalScripts = document.querySelectorAll('script[data-defer]');
    nonCriticalScripts.forEach(script => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          this.loadScript(script.src);
        });
      } else {
        setTimeout(() => {
          this.loadScript(script.src);
        }, 100);
      }
    });
  }

  loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
  }

  // Performance Analytics
  sendPerformanceData() {
    if ('sendBeacon' in navigator && this.performanceMetrics) {
      const data = JSON.stringify({
        lcp: this.performanceMetrics.lcp,
        fid: this.performanceMetrics.fid,
        cls: this.performanceMetrics.cls,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      
      navigator.sendBeacon('/analytics/performance', data);
    }
  }

  // Public API
  getPerformanceMetrics() {
    return this.performanceMetrics;
  }

  refreshLazyImages() {
    this.observeLazyImages();
  }

  destroy() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }
    if (this.elementObserver) {
      this.elementObserver.disconnect();
    }
  }
}

// Code Splitting Utility
class CodeSplitter {
  constructor() {
    this.loadedModules = new Set();
  }

  async loadModule(moduleName) {
    if (this.loadedModules.has(moduleName)) {
      return;
    }

    try {
      switch (moduleName) {
        case 'cart':
          await import('./cart-drawer-enhanced.js');
          break;
        case 'search':
          await import('./predictive-search.js');
          break;
        case 'quickview':
          await import('./quick-view.js');
          break;
        default:
          console.warn(`Unknown module: ${moduleName}`);
      }
      
      this.loadedModules.add(moduleName);
    } catch (error) {
      console.error(`Failed to load module ${moduleName}:`, error);
    }
  }

  preloadModule(moduleName) {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = `./assets/${moduleName}.js`;
    document.head.appendChild(link);
  }
}

// Initialize performance optimization
document.addEventListener('DOMContentLoaded', () => {
  window.performanceOptimizer = new PerformanceOptimizer();
  window.codeSplitter = new CodeSplitter();
  
  // Send performance data after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      window.performanceOptimizer.sendPerformanceData();
    }, 5000);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PerformanceOptimizer, CodeSplitter };
}