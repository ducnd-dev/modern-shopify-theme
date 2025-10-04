/**
 * Advanced Predictive Search with Smart Features
 * Features:
 * - Real-time search with debouncing
 * - Product previews with images
 * - Category filtering
 * - Search suggestions
 * - Recent searches with localStorage
 * - Keyboard navigation
 * - Cache management
 * - Mobile-responsive design
 * - Accessibility support
 */

class PredictiveSearch {
  constructor(options = {}) {
    this.container = options.container || document.querySelector('[data-predictive-search]');
    this.input = options.input || this.container?.querySelector('input[type="search"]');
    this.resultsContainer = options.resultsContainer || this.container?.querySelector('[data-search-results]');
    
    // Configuration
    this.config = {
      debounceDelay: 300,
      minQueryLength: 2,
      maxResults: 8,
      maxRecentSearches: 5,
      cacheExpiry: 5 * 60 * 1000, // 5 minutes
      ...options.config
    };

    // State
    this.state = {
      query: '',
      loading: false,
      showResults: false,
      selectedIndex: -1,
      results: {
        products: [],
        collections: [],
        suggestions: [],
        queries: []
      },
      recentSearches: []
    };

    // Cache and utilities
    this.searchCache = new Map();
    this.debounceTimer = null;
    this.abortController = null;

    this.init();
  }

  init() {
    if (!this.container || !this.input) {
      console.warn('PredictiveSearch: Required elements not found');
      return;
    }

    this.loadRecentSearches();
    this.bindEvents();
    this.setupAccessibility();
  }

  bindEvents() {
    // Input events
    this.input.addEventListener('input', (e) => this.handleInput(e));
    this.input.addEventListener('focus', () => this.handleFocus());
    this.input.addEventListener('blur', (e) => this.handleBlur(e));
    
    // Keyboard navigation
    this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
    
    // Clear button
    const clearButton = this.container.querySelector('[data-search-clear]');
    if (clearButton) {
      clearButton.addEventListener('click', () => this.clearSearch());
    }

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.hideResults();
      }
    });

    // Handle form submission
    const form = this.input.closest('form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  setupAccessibility() {
    // Set up ARIA attributes
    this.input.setAttribute('role', 'combobox');
    this.input.setAttribute('aria-autocomplete', 'list');
    this.input.setAttribute('aria-expanded', 'false');
    
    if (this.resultsContainer) {
      this.resultsContainer.setAttribute('role', 'listbox');
      this.resultsContainer.setAttribute('aria-label', 'Search suggestions');
    }
  }

  handleInput(e) {
    const query = e.target.value.trim();
    this.state.query = query;
    
    // Update clear button visibility
    this.updateClearButton();
    
    // Debounce search
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.performSearch(query);
    }, this.config.debounceDelay);
  }

  handleFocus() {
    if (this.state.query.length >= this.config.minQueryLength || this.state.recentSearches.length > 0) {
      this.showResults();
    }
  }

  handleBlur(e) {
    // Delay hiding to allow clicking on results
    setTimeout(() => {
      if (!this.container.contains(document.activeElement)) {
        this.hideResults();
      }
    }, 150);
  }

  handleKeyDown(e) {
    if (!this.state.showResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.navigateDown();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.navigateUp();
        break;
      case 'Enter':
        e.preventDefault();
        this.selectCurrent();
        break;
      case 'Escape':
        this.hideResults();
        this.input.blur();
        break;
    }
  }

  handleSubmit(e) {
    if (this.state.query.trim()) {
      this.saveRecentSearch(this.state.query);
    }
  }

  async performSearch(query) {
    if (query.length < this.config.minQueryLength) {
      this.clearResults();
      if (this.state.recentSearches.length > 0) {
        this.showResults();
      }
      return;
    }

    // Check cache first
    const cached = this.getCachedResult(query);
    if (cached) {
      this.state.results = cached;
      this.renderResults();
      this.showResults();
      return;
    }

    // Cancel previous request
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    this.state.loading = true;
    this.renderLoadingState();

    try {
      const searchParams = new URLSearchParams({
        q: query,
        'resources[type]': 'product,collection',
        'resources[limit]': this.config.maxResults,
        'resources[options][unavailable_products]': 'last',
        'resources[options][fields]': 'title,vendor,product_type,variants.title,handle'
      });

      const response = await fetch(`/search/suggest.json?${searchParams}`, {
        signal: this.abortController.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Process and format results
      this.state.results = this.processSearchResults(data);
      
      // Cache results
      this.cacheResult(query, this.state.results);
      
      // Render results
      this.renderResults();
      this.showResults();

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
        this.renderErrorState();
      }
    } finally {
      this.state.loading = false;
    }
  }

  processSearchResults(data) {
    const resources = data.resources?.results || {};
    
    return {
      products: this.processProducts(resources.products || []),
      collections: this.processCollections(resources.collections || []),
      suggestions: this.processSuggestions(resources.queries || []),
      queries: resources.queries || []
    };
  }

  processProducts(products) {
    return products.map(product => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      url: product.url,
      vendor: product.vendor,
      price: product.price,
      compareAtPrice: product.compare_at_price,
      priceFormatted: this.formatPrice(product.price),
      compareAtPriceFormatted: product.compare_at_price ? this.formatPrice(product.compare_at_price) : null,
      featuredImage: this.getProductImage(product),
      available: product.available,
      productType: product.product_type,
      tags: product.tags || [],
      variants: product.variants || []
    }));
  }

  processCollections(collections) {
    return collections.map(collection => ({
      id: collection.id,
      title: collection.title,
      handle: collection.handle,
      url: collection.url,
      productsCount: collection.products_count || 0,
      image: collection.featured_image || null
    }));
  }

  processSuggestions(queries) {
    return queries.slice(0, 5).map(query => query.text);
  }

  getProductImage(product) {
    if (product.featured_image) {
      return this.resizeImage(product.featured_image, '120x120');
    }
    return this.getPlaceholderImage();
  }

  renderResults() {
    if (!this.resultsContainer) return;

    const { products, collections, suggestions } = this.state.results;
    let html = '';

    // Suggestions
    if (suggestions.length > 0) {
      html += this.renderSuggestions(suggestions);
    }

    // Products
    if (products.length > 0) {
      html += this.renderProducts(products);
    }

    // Collections
    if (collections.length > 0) {
      html += this.renderCollections(collections);
    }

    // Recent searches (when no query)
    if (this.state.query.length === 0 && this.state.recentSearches.length > 0) {
      html += this.renderRecentSearches();
    }

    // No results
    if (this.state.query.length >= this.config.minQueryLength && 
        products.length === 0 && collections.length === 0 && suggestions.length === 0) {
      html += this.renderNoResults();
    }

    // View all results
    if (this.state.query.length > 0 && (products.length > 0 || collections.length > 0)) {
      html += this.renderViewAllLink();
    }

    this.resultsContainer.innerHTML = html;
    this.bindResultEvents();
  }

  renderSuggestions(suggestions) {
    return `
      <div class="search-suggestions" data-section="suggestions">
        <h3 class="search-section-title">Suggestions</h3>
        ${suggestions.map((suggestion, index) => `
          <button 
            class="search-suggestion-item" 
            data-suggestion="${this.escapeHtml(suggestion)}"
            data-index="${index}"
            role="option"
          >
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
            <span>${this.highlightQuery(suggestion)}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  renderProducts(products) {
    return `
      <div class="search-products" data-section="products">
        <h3 class="search-section-title">Products</h3>
        ${products.map((product, index) => `
          <a 
            href="${product.url}" 
            class="search-product-item"
            data-index="${index + this.state.results.suggestions.length}"
            role="option"
          >
            <div class="product-image">
              <img 
                src="${product.featuredImage}" 
                alt="${this.escapeHtml(product.title)}"
                loading="lazy"
              >
            </div>
            <div class="product-info">
              <h4 class="product-title">${this.highlightQuery(product.title)}</h4>
              <p class="product-vendor">${this.escapeHtml(product.vendor)}</p>
              <div class="product-price">
                <span class="price">${product.priceFormatted}</span>
                ${product.compareAtPriceFormatted ? `
                  <span class="compare-price">${product.compareAtPriceFormatted}</span>
                ` : ''}
              </div>
              <div class="product-availability">
                <span class="availability-badge ${product.available ? 'available' : 'sold-out'}">
                  ${product.available ? 'Available' : 'Sold Out'}
                </span>
              </div>
            </div>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </a>
        `).join('')}
      </div>
    `;
  }

  renderCollections(collections) {
    return `
      <div class="search-collections" data-section="collections">
        <h3 class="search-section-title">Collections</h3>
        ${collections.map(collection => `
          <a href="${collection.url}" class="search-collection-item">
            <div class="collection-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                <path d="M9 9h6v6H9z"></path>
              </svg>
            </div>
            <div class="collection-info">
              <h4 class="collection-title">${this.highlightQuery(collection.title)}</h4>
              <p class="collection-count">${collection.productsCount} products</p>
            </div>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </a>
        `).join('')}
      </div>
    `;
  }

  renderRecentSearches() {
    return `
      <div class="search-recent" data-section="recent">
        <div class="search-section-header">
          <h3 class="search-section-title">Recent Searches</h3>
          <button class="clear-recent-btn" data-clear-recent>Clear All</button>
        </div>
        ${this.state.recentSearches.map(search => `
          <button 
            class="search-recent-item" 
            data-suggestion="${this.escapeHtml(search)}"
          >
            <svg class="recent-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
            <span>${this.escapeHtml(search)}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  renderNoResults() {
    return `
      <div class="search-no-results">
        <svg class="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="M21 21l-4.35-4.35"></path>
        </svg>
        <h3>No results found</h3>
        <p>Try different keywords or check spelling</p>
      </div>
    `;
  }

  renderViewAllLink() {
    return `
      <div class="search-view-all">
        <a href="/search?q=${encodeURIComponent(this.state.query)}" class="view-all-link">
          View all results for "${this.escapeHtml(this.state.query)}"
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6"></path>
          </svg>
        </a>
      </div>
    `;
  }

  renderLoadingState() {
    if (!this.resultsContainer) return;
    
    this.resultsContainer.innerHTML = `
      <div class="search-loading">
        <div class="loading-spinner"></div>
        <p>Searching...</p>
      </div>
    `;
  }

  renderErrorState() {
    if (!this.resultsContainer) return;
    
    this.resultsContainer.innerHTML = `
      <div class="search-error">
        <p>Sorry, something went wrong. Please try again.</p>
      </div>
    `;
  }

  bindResultEvents() {
    // Suggestion clicks
    this.resultsContainer.querySelectorAll('[data-suggestion]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const suggestion = e.currentTarget.dataset.suggestion;
        this.selectSuggestion(suggestion);
      });
    });

    // Clear recent searches
    const clearButton = this.resultsContainer.querySelector('[data-clear-recent]');
    if (clearButton) {
      clearButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.clearRecentSearches();
      });
    }

    // Product and collection item hover
    this.resultsContainer.querySelectorAll('[data-index]').forEach((item, index) => {
      item.addEventListener('mouseenter', () => {
        this.state.selectedIndex = parseInt(item.dataset.index);
        this.updateSelectedItem();
      });
    });
  }

  selectSuggestion(suggestion) {
    this.input.value = suggestion;
    this.state.query = suggestion;
    this.saveRecentSearch(suggestion);
    this.performSearch(suggestion);
    this.input.focus();
  }

  selectCurrent() {
    const selectedItem = this.resultsContainer.querySelector(`[data-index="${this.state.selectedIndex}"]`);
    if (selectedItem) {
      if (selectedItem.tagName === 'A') {
        window.location.href = selectedItem.href;
      } else if (selectedItem.dataset.suggestion) {
        this.selectSuggestion(selectedItem.dataset.suggestion);
      }
    } else if (this.state.query.length > 0) {
      this.saveRecentSearch(this.state.query);
      window.location.href = `/search?q=${encodeURIComponent(this.state.query)}`;
    }
  }

  navigateDown() {
    const items = this.resultsContainer.querySelectorAll('[data-index], [data-suggestion]');
    if (this.state.selectedIndex < items.length - 1) {
      this.state.selectedIndex++;
      this.updateSelectedItem();
    }
  }

  navigateUp() {
    if (this.state.selectedIndex > 0) {
      this.state.selectedIndex--;
      this.updateSelectedItem();
    }
  }

  updateSelectedItem() {
    // Remove previous selection
    this.resultsContainer.querySelectorAll('.selected').forEach(item => {
      item.classList.remove('selected');
      item.setAttribute('aria-selected', 'false');
    });

    // Add selection to current item
    const currentItem = this.resultsContainer.querySelector(`[data-index="${this.state.selectedIndex}"]`);
    if (currentItem) {
      currentItem.classList.add('selected');
      currentItem.setAttribute('aria-selected', 'true');
      
      // Scroll into view if needed
      currentItem.scrollIntoView({ block: 'nearest' });
    }
  }

  showResults() {
    this.state.showResults = true;
    this.input.setAttribute('aria-expanded', 'true');
    this.container.classList.add('search-active');
    
    if (this.state.query.length === 0 && this.state.recentSearches.length > 0) {
      this.renderResults();
    }
  }

  hideResults() {
    this.state.showResults = false;
    this.state.selectedIndex = -1;
    this.input.setAttribute('aria-expanded', 'false');
    this.container.classList.remove('search-active');
  }

  clearResults() {
    this.state.results = {
      products: [],
      collections: [],
      suggestions: [],
      queries: []
    };
    
    if (this.resultsContainer) {
      this.resultsContainer.innerHTML = '';
    }
  }

  clearSearch() {
    this.input.value = '';
    this.state.query = '';
    this.clearResults();
    this.hideResults();
    this.updateClearButton();
    this.input.focus();
  }

  updateClearButton() {
    const clearButton = this.container.querySelector('[data-search-clear]');
    if (clearButton) {
      clearButton.style.display = this.state.query.length > 0 ? 'block' : 'none';
    }
  }

  // Recent searches management
  saveRecentSearch(query) {
    if (!query.trim() || query.length < 2) return;
    
    let recent = [...this.state.recentSearches];
    recent = recent.filter(search => search !== query);
    recent.unshift(query);
    recent = recent.slice(0, this.config.maxRecentSearches);
    
    this.state.recentSearches = recent;
    
    try {
      localStorage.setItem('shopify-recent-searches', JSON.stringify(recent));
    } catch (error) {
      console.warn('Could not save recent searches:', error);
    }
  }

  loadRecentSearches() {
    try {
      const stored = localStorage.getItem('shopify-recent-searches');
      this.state.recentSearches = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Could not load recent searches:', error);
      this.state.recentSearches = [];
    }
  }

  clearRecentSearches() {
    this.state.recentSearches = [];
    try {
      localStorage.removeItem('shopify-recent-searches');
    } catch (error) {
      console.warn('Could not clear recent searches:', error);
    }
    this.renderResults();
  }

  // Cache management
  cacheResult(query, results) {
    this.searchCache.set(query, {
      results,
      timestamp: Date.now()
    });

    // Clean old cache entries
    this.cleanCache();
  }

  getCachedResult(query) {
    const cached = this.searchCache.get(query);
    if (cached && (Date.now() - cached.timestamp) < this.config.cacheExpiry) {
      return cached.results;
    }
    return null;
  }

  cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.searchCache.entries()) {
      if (now - value.timestamp > this.config.cacheExpiry) {
        this.searchCache.delete(key);
      }
    }
  }

  // Utility methods
  highlightQuery(text) {
    if (!this.state.query || this.state.query.length < 2) return this.escapeHtml(text);
    
    const regex = new RegExp(`(${this.escapeRegex(this.state.query)})`, 'gi');
    return this.escapeHtml(text).replace(regex, '<mark>$1</mark>');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  formatPrice(price) {
    if (typeof price !== 'number') return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: window.Shopify?.currency?.active || 'USD'
    }).format(price / 100);
  }

  resizeImage(url, size) {
    if (!url) return this.getPlaceholderImage();
    return url.replace(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?.*)?$/i, `_${size}.$1$2`);
  }

  getPlaceholderImage() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEg4MFY4MEg0MFY0MFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
  }

  // Public API
  destroy() {
    // Clean up event listeners
    clearTimeout(this.debounceTimer);
    if (this.abortController) {
      this.abortController.abort();
    }
    this.searchCache.clear();
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const searchContainers = document.querySelectorAll('[data-predictive-search]');
  searchContainers.forEach(container => {
    new PredictiveSearch({ container });
  });
});

// Export for manual initialization
window.PredictiveSearch = PredictiveSearch;