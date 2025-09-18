/**
 * Collection Page JavaScript
 * Handles filtering, view switching, and responsive behavior
 */

class CollectionManager {
  constructor() {
    this.filterToggle = document.querySelector('[data-filter-toggle]');
    this.filterModal = document.querySelector('[data-filter-modal]');
    this.filterClose = document.querySelector('[data-filter-close]');
    this.viewButtons = document.querySelectorAll('.view-btn');
    this.filterInputs = document.querySelectorAll('input[type="checkbox"]');
    this.filterCount = document.getElementById('filter-count');
    this.sortSelect = document.getElementById('sort-by');
    
    this.activeFilters = new Set();
    this.currentView = 'grid';
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupViewPersistence();
    this.updateFilterCount();
    this.initInfiniteScroll();
  }

  bindEvents() {
    // Filter modal toggle
    if (this.filterToggle) {
      this.filterToggle.addEventListener('click', () => this.openFilterModal());
    }

    if (this.filterClose) {
      this.filterClose.addEventListener('click', () => this.closeFilterModal());
    }

    // Close modal on backdrop click
    if (this.filterModal) {
      this.filterModal.addEventListener('click', (e) => {
        if (e.target === this.filterModal) {
          this.closeFilterModal();
        }
      });
    }

    // View switching
    this.viewButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView(button.dataset.view);
      });
    });

    // Filter handling
    this.filterInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.handleFilterChange(input);
      });
    });

    // Apply filters on mobile
    const applyFiltersBtn = document.querySelector('[data-filter-apply]');
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', () => {
        this.applyFilters();
        this.closeFilterModal();
      });
    }

    // Keyboard accessibility
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.filterModal && !this.filterModal.classList.contains('hidden')) {
        this.closeFilterModal();
      }
    });

    // Resize handler for responsive behavior
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  openFilterModal() {
    if (this.filterModal) {
      this.filterModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      
      // Focus trap
      const firstFocusable = this.filterModal.querySelector('button, input, select, textarea');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }

  closeFilterModal() {
    if (this.filterModal) {
      this.filterModal.classList.add('hidden');
      document.body.style.overflow = '';
      
      if (this.filterToggle) {
        this.filterToggle.focus();
      }
    }
  }

  switchView(view) {
    this.currentView = view;
    
    // Update active button
    this.viewButtons.forEach(btn => {
      if (btn.dataset.view === view) {
        btn.classList.add('active');
        btn.classList.remove('bg-white', 'dark:bg-neutral-800', 'text-neutral-700', 'dark:text-neutral-300');
        btn.classList.add('bg-primary-600', 'text-white');
      } else {
        btn.classList.remove('active', 'bg-primary-600', 'text-white');
        btn.classList.add('bg-white', 'dark:bg-neutral-800', 'text-neutral-700', 'dark:text-neutral-300');
      }
    });

    // Switch view content
    const gridView = document.querySelector('[data-view-content="grid"]');
    const listView = document.querySelector('[data-view-content="list"]');

    if (view === 'grid') {
      if (gridView) gridView.classList.remove('hidden');
      if (listView) listView.classList.add('hidden');
    } else {
      if (gridView) gridView.classList.add('hidden');
      if (listView) listView.classList.remove('hidden');
    }

    // Save preference
    localStorage.setItem('collection-view-preference', view);
  }

  setupViewPersistence() {
    const savedView = localStorage.getItem('collection-view-preference');
    if (savedView && ['grid', 'list'].includes(savedView)) {
      this.switchView(savedView);
    }
  }

  handleFilterChange(input) {
    const filterValue = input.value || input.closest('label').textContent.trim();
    
    if (input.checked) {
      this.activeFilters.add(filterValue);
    } else {
      this.activeFilters.delete(filterValue);
    }

    this.updateFilterCount();
    
    // Auto-apply on desktop, manual on mobile
    if (window.innerWidth >= 1024) {
      this.debounce(() => this.applyFilters(), 300)();
    }
  }

  updateFilterCount() {
    if (this.filterCount) {
      const count = this.activeFilters.size;
      if (count > 0) {
        this.filterCount.textContent = count;
        this.filterCount.classList.remove('hidden');
      } else {
        this.filterCount.classList.add('hidden');
      }
    }
  }

  applyFilters() {
    // Show loading state
    this.showLoadingState();

    // Build filter URL
    const url = new URL(window.location);
    const searchParams = new URLSearchParams();

    // Preserve existing params
    if (url.searchParams.get('sort_by')) {
      searchParams.set('sort_by', url.searchParams.get('sort_by'));
    }

    // Add filter params
    this.activeFilters.forEach(filter => {
      searchParams.append('filter', filter);
    });

    // Update URL and reload
    const newUrl = `${url.pathname}?${searchParams.toString()}`;
    window.location.href = newUrl;
  }

  showLoadingState() {
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid) {
      productsGrid.style.opacity = '0.5';
      productsGrid.style.pointerEvents = 'none';
    }

    // Show loading spinner
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'fixed inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-50';
    loadingSpinner.innerHTML = `
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    `;
    document.body.appendChild(loadingSpinner);
  }

  clearFilters() {
    this.activeFilters.clear();
    
    // Uncheck all filters
    this.filterInputs.forEach(input => {
      input.checked = false;
    });

    this.updateFilterCount();
    
    // Redirect to clean collection URL
    const url = new URL(window.location);
    const cleanUrl = url.pathname + (url.searchParams.get('sort_by') ? `?sort_by=${url.searchParams.get('sort_by')}` : '');
    window.location.href = cleanUrl;
  }

  initInfiniteScroll() {
    const loadMoreBtn = document.querySelector('.pagination');
    if (!loadMoreBtn) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Auto-load more if preferred
          const autoLoad = localStorage.getItem('collection-auto-load') === 'true';
          if (autoLoad) {
            this.loadMoreProducts();
          }
        }
      });
    }, {
      rootMargin: '100px'
    });

    observer.observe(loadMoreBtn);
  }

  loadMoreProducts() {
    const nextButton = document.querySelector('.pagination a[aria-label="Next page"]');
    if (nextButton) {
      // Implement AJAX loading here
      console.log('Loading more products...');
    }
  }

  handleResize() {
    // Auto-close mobile filter modal on resize to desktop
    if (window.innerWidth >= 1024 && this.filterModal && !this.filterModal.classList.contains('hidden')) {
      this.closeFilterModal();
    }
  }

  // Utility function for debouncing
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CollectionManager();
});

// Global function for clear filters button
window.clearFilters = function() {
  const collectionManager = new CollectionManager();
  collectionManager.clearFilters();
};

// Advanced filtering helpers
class AdvancedFilters {
  static filterByPrice(products, minPrice, maxPrice) {
    return products.filter(product => {
      const price = parseFloat(product.dataset.price);
      return price >= minPrice && price <= maxPrice;
    });
  }

  static filterByAvailability(products, inStock) {
    return products.filter(product => {
      const available = product.dataset.available === 'true';
      return inStock ? available : !available;
    });
  }

  static filterByType(products, type) {
    return products.filter(product => {
      return product.dataset.type === type;
    });
  }

  static filterByVendor(products, vendor) {
    return products.filter(product => {
      return product.dataset.vendor === vendor;
    });
  }

  static sortProducts(products, sortBy) {
    const sortedProducts = Array.from(products);
    
    switch(sortBy) {
      case 'price-ascending':
        return sortedProducts.sort((a, b) => 
          parseFloat(a.dataset.price) - parseFloat(b.dataset.price)
        );
      case 'price-descending':
        return sortedProducts.sort((a, b) => 
          parseFloat(b.dataset.price) - parseFloat(a.dataset.price)
        );
      case 'title-ascending':
        return sortedProducts.sort((a, b) => 
          a.dataset.title.localeCompare(b.dataset.title)
        );
      case 'title-descending':
        return sortedProducts.sort((a, b) => 
          b.dataset.title.localeCompare(a.dataset.title)
        );
      case 'created-descending':
        return sortedProducts.sort((a, b) => 
          new Date(b.dataset.created) - new Date(a.dataset.created)
        );
      case 'created-ascending':
        return sortedProducts.sort((a, b) => 
          new Date(a.dataset.created) - new Date(b.dataset.created)
        );
      default:
        return sortedProducts;
    }
  }
}

// Performance optimization
class CollectionPerformance {
  static lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }
  }

  static preloadCriticalImages() {
    const criticalImages = document.querySelectorAll('.products-grid .product-card:nth-child(-n+6) img');
    criticalImages.forEach(img => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.src;
      document.head.appendChild(link);
    });
  }

  static optimizeGrid() {
    const grid = document.querySelector('.products-grid');
    if (grid && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-viewport');
          }
        });
      }, {
        rootMargin: '50px'
      });

      const products = grid.querySelectorAll('.product-card');
      products.forEach(product => observer.observe(product));
    }
  }
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => {
  CollectionPerformance.lazyLoadImages();
  CollectionPerformance.preloadCriticalImages();
  CollectionPerformance.optimizeGrid();
});