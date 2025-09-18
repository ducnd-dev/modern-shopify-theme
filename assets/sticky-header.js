class StickyHeader extends HTMLElement {
  constructor() {
    super();
    this.header = this.querySelector('.header');
    this.headerMain = this.querySelector('.header-main');
    this.lastScrollY = 0;
    this.isScrollingUp = false;
    this.isVisible = true;
    this.threshold = 100; // pixels to scroll before hiding/showing
    
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.onScrollHandler = this.onScroll.bind(this);
    window.addEventListener('scroll', this.onScrollHandler, { passive: true });
  }

  setupIntersectionObserver() {
    // Create a sentinel element to detect when we should start the sticky behavior
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.position = 'absolute';
    sentinel.style.top = '0';
    sentinel.style.left = '0';
    sentinel.style.pointerEvents = 'none';
    
    this.insertBefore(sentinel, this.header);

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.onHeaderIntersecting();
          } else {
            this.onHeaderNotIntersecting();
          }
        });
      },
      {
        rootMargin: '0px 0px -100% 0px'
      }
    );

    this.observer.observe(sentinel);
  }

  onHeaderIntersecting() {
    // Header is at the top, remove sticky effects
    this.header.classList.remove('header--scrolled');
    this.headerMain.style.backgroundColor = '';
  }

  onHeaderNotIntersecting() {
    // Header is being scrolled, add sticky effects
    this.header.classList.add('header--scrolled');
  }

  onScroll() {
    const currentScrollY = window.pageYOffset;
    
    // Determine scroll direction
    this.isScrollingUp = currentScrollY < this.lastScrollY;
    
    // Add/remove scrolled class for styling
    if (currentScrollY > 50) {
      this.header.classList.add('header--scrolled');
      
      // Hide/show header based on scroll direction
      if (currentScrollY > this.threshold) {
        if (this.isScrollingUp && !this.isVisible) {
          this.showHeader();
        } else if (!this.isScrollingUp && this.isVisible && currentScrollY > 200) {
          this.hideHeader();
        }
      }
    } else {
      this.header.classList.remove('header--scrolled');
      this.showHeader();
    }
    
    this.lastScrollY = currentScrollY;
  }

  showHeader() {
    this.header.style.transform = 'translateY(0)';
    this.isVisible = true;
  }

  hideHeader() {
    this.header.style.transform = 'translateY(-100%)';
    this.isVisible = false;
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.onScrollHandler);
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

customElements.define('sticky-header', StickyHeader);

// Add CSS for smooth transitions and scrolled state
const stickyHeaderStyles = `
  <style>
    .header {
      transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
                  background-color 0.3s ease,
                  box-shadow 0.3s ease;
    }
    
    .header--scrolled {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .header--scrolled .header-main {
      background-color: rgba(255, 255, 255, 0.95) !important;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    
    .dark .header--scrolled .header-main {
      background-color: rgba(23, 23, 23, 0.95) !important;
    }
    
    .header-main {
      transition: background-color 0.3s ease;
    }
    
    /* Ensure the header doesn't create layout shift */
    sticky-header {
      display: block;
      position: relative;
    }
    
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 50;
    }
    
    /* Add top padding to body to compensate for fixed header */
    body {
      padding-top: var(--header-height, 80px);
    }
    
    @media (max-width: 1023px) {
      body {
        padding-top: var(--header-height-mobile, 64px);
      }
    }
  </style>
`;

// Inject styles into head
document.head.insertAdjacentHTML('beforeend', stickyHeaderStyles);

// Set CSS custom properties for header height
document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('.header');
  if (header) {
    const setHeaderHeight = () => {
      const headerHeight = header.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      
      // Set mobile height
      if (window.innerWidth < 1024) {
        document.documentElement.style.setProperty('--header-height-mobile', `${headerHeight}px`);
      }
    };
    
    setHeaderHeight();
    window.addEventListener('resize', setHeaderHeight);
  }
});