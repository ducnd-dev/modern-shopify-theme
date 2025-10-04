
const THEME_CONFIG = {
  animations: {
    enabled: true,
    speed: 300,
    scrollAnimations: true,
    hoverEffects: true
  },
  cart: {
    type: 'drawer',
    notesEnabled: true,
    freeShippingThreshold: 10000
  },
  search: {
    predictive: true,
    resultsLimit: 6
  },
  accessibility: {
    focusOutlines: true,
    skipToContent: true,
    reduceMotion: false
  }
};
const utils = {

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
  },

  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  formatMoney(cents, format = '${{amount}}') {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }

    let value = '';
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    const formatString = format || '${{amount}}';

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = (cents / 100).toFixed(2);
        break;
      case 'amount_no_decimals':
        value = (cents / 100).toFixed(0);
        break;
      case 'amount_with_comma_separator':
        value = (cents / 100).toFixed(2).replace('.', ',');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  },

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  },

  setCookie(name, value, days = 30) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  },

  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  animateIntoView(element, className = 'animate') {
    if (THEME_CONFIG.animations.scrollAnimations && this.isInViewport(element)) {
      element.classList.add(className);
    }
  }
};
class DarkModeManager {
  constructor() {
    this.darkMode = this.getDarkModePreference();
    this.init();
  }

  init() {
    this.applyDarkMode();
    this.bindEvents();
  }

  getDarkModePreference() {
    const saved = utils.getCookie('darkMode');
    if (saved) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  applyDarkMode() {
    document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
    const toggles = document.querySelectorAll('[data-dark-mode-toggle]');
    toggles.forEach(toggle => {
      const icon = toggle.querySelector('.dark-mode-icon');
      if (icon) {
        icon.textContent = this.darkMode ? '☀️' : '🌙';
      }
    });
  }

  toggle() {
    this.darkMode = !this.darkMode;
    utils.setCookie('darkMode', this.darkMode);
    this.applyDarkMode();
  }

  bindEvents() {
    const toggles = document.querySelectorAll('[data-dark-mode-toggle]');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => this.toggle());
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!utils.getCookie('darkMode')) {
        this.darkMode = e.matches;
        this.applyDarkMode();
      }
    });
  }
}
class MobileMenuManager {
  constructor() {
    this.menu = document.querySelector('.mobile-menu');
    this.toggles = document.querySelectorAll('[data-mobile-menu-toggle]');
    this.overlay = document.querySelector('.overlay');
    this.isOpen = false;

    if (this.menu) {
      this.init();
    }
  }

  init() {
    this.bindEvents();
  }

  open() {
    this.isOpen = true;
    this.menu.classList.add('active');
    this.overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
    const firstFocusable = this.menu.querySelector('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    firstFocusable?.focus();
  }

  close() {
    this.isOpen = false;
    this.menu.classList.remove('active');
    this.overlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  bindEvents() {
    this.toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        this.isOpen ? this.close() : this.open();
      });
    });

    this.overlay?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
}
class CartDrawerManager {
  constructor() {
    this.drawer = document.querySelector('.cart-drawer');
    this.overlay = document.querySelector('.overlay');
    this.toggles = document.querySelectorAll('[data-cart-toggle]');
    this.isOpen = false;

    if (this.drawer) {
      this.init();
    }
  }

  init() {
    this.bindEvents();
    this.updateCartCount();
  }

  async open() {
    await this.fetchCartContents();
    this.isOpen = true;
    this.drawer.classList.add('active');
    this.overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    this.drawer.classList.remove('active');
    this.overlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  async fetchCartContents() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      this.renderCartContents(cart);
      this.updateCartCount(cart.item_count);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }

  renderCartContents(cart) {
    const cartItemsContainer = this.drawer.querySelector('.cart-items');
    const cartTotalContainer = this.drawer.querySelector('.cart-total');

    if (!cartItemsContainer) return;

    if (cart.items.length === 0) {
      cartItemsContainer.innerHTML = '<p class="text-center text-gray-500 py-8">Your cart is empty</p>';
      cartTotalContainer.innerHTML = '';
      return;
    }

    const itemsHTML = cart.items.map(item => `
      <div class="cart-item flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700" data-key="${item.key}">
        <img src="${item.featured_image?.url}" alt="${item.product_title}" class="w-16 h-16 object-cover rounded-lg" loading="lazy">
        <div class="flex-1">
          <h3 class="font-medium">${item.product_title}</h3>
          <p class="text-sm text-gray-500">${item.variant_title || ''}</p>
          <div class="flex items-center justify-between mt-2">
            <div class="quantity-selector">
              <button type="button" class="quantity-btn" data-quantity-change="-1" data-key="${item.key}">-</button>
              <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-key="${item.key}">
              <button type="button" class="quantity-btn" data-quantity-change="1" data-key="${item.key}">+</button>
            </div>
            <span class="font-medium">${utils.formatMoney(item.final_line_price)}</span>
          </div>
        </div>
        <button type="button" class="text-red-500 hover:text-red-700" data-remove-item data-key="${item.key}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `).join('');

    cartItemsContainer.innerHTML = itemsHTML;

    if (cartTotalContainer) {
      cartTotalContainer.innerHTML = `
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-center mb-4">
            <span class="text-lg font-medium">Total:</span>
            <span class="text-xl font-bold">${utils.formatMoney(cart.total_price)}</span>
          </div>
          ${this.renderFreeShippingProgress(cart.total_price)}
          <button type="button" class="btn btn-primary w-full" onclick="window.location.href='/checkout'">
            Checkout
          </button>
        </div>
      `;
    }

    this.bindCartEvents();
  }

  renderFreeShippingProgress(totalPrice) {
    if (!THEME_CONFIG.cart.freeShippingThreshold) return '';

    const threshold = THEME_CONFIG.cart.freeShippingThreshold;
    const remaining = threshold - totalPrice;
    const progress = Math.min((totalPrice / threshold) * 100, 100);

    if (remaining <= 0) {
      return `
        <div class="mb-4">
          <div class="flex items-center text-green-600 mb-2">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            You qualify for free shipping!
          </div>
        </div>
      `;
    }

    return `
      <div class="mb-4">
        <div class="flex justify-between text-sm mb-2">
          <span>Free shipping</span>
          <span>${utils.formatMoney(remaining)} away</span>
        </div>
        <div class="shipping-progress">
          <div class="shipping-progress-bar" style="width: ${progress}%"></div>
        </div>
      </div>
    `;
  }

  async updateQuantity(key, quantity) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: key,
          quantity: quantity
        })
      });

      const cart = await response.json();
      this.renderCartContents(cart);
      this.updateCartCount(cart.item_count);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }

  async removeItem(key) {
    await this.updateQuantity(key, 0);
  }

  updateCartCount(count) {
    const countElements = document.querySelectorAll('.cart-count');
    countElements.forEach(element => {
      element.textContent = count || 0;
      element.style.display = count > 0 ? 'block' : 'none';
    });
  }

  bindEvents() {
    this.toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        this.isOpen ? this.close() : this.open();
      });
    });

    this.overlay?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  bindCartEvents() {
    this.drawer.querySelectorAll('[data-quantity-change]').forEach(button => {
      button.addEventListener('click', (e) => {
        const change = parseInt(e.target.dataset.quantityChange);
        const key = e.target.dataset.key;
        const input = this.drawer.querySelector(`input[data-key="${key}"]`);
        const newQuantity = Math.max(1, parseInt(input.value) + change);
        this.updateQuantity(key, newQuantity);
      });
    });
    this.drawer.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const key = e.target.dataset.key;
        const quantity = Math.max(1, parseInt(e.target.value));
        this.updateQuantity(key, quantity);
      });
    });
    this.drawer.querySelectorAll('[data-remove-item]').forEach(button => {
      button.addEventListener('click', (e) => {
        const key = e.target.closest('[data-key]').dataset.key;
        this.removeItem(key);
      });
    });
  }
}
class SearchManager {
  constructor() {
    this.searchModal = document.querySelector('.search-modal');
    this.searchInput = document.querySelector('.search-input');
    this.searchResults = document.querySelector('.search-results');
    this.searchToggles = document.querySelectorAll('[data-search-toggle]');

    if (this.searchModal) {
      this.init();
    }
  }

  init() {
    this.bindEvents();
  }

  open() {
    this.searchModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      this.searchInput?.focus();
    }, 100);
  }

  close() {
    this.searchModal.classList.remove('active');
    document.body.style.overflow = '';
    this.clearResults();
  }

  async search(query) {
    if (!query || query.length < 2) {
      this.clearResults();
      return;
    }

    try {
      const response = await fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=${THEME_CONFIG.search.resultsLimit}`);
      const data = await response.json();
      this.renderResults(data.resources.results.products);
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  renderResults(products) {
    if (!products || products.length === 0) {
      this.searchResults.innerHTML = '<p class="text-center text-gray-500 p-4">No products found</p>';
      return;
    }

    const resultsHTML = products.map(product => `
      <a href="${product.url}" class="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <img src="${product.featured_image}" alt="${product.title}" class="w-12 h-12 object-cover rounded-lg" loading="lazy">
        <div class="flex-1">
          <h3 class="font-medium">${product.title}</h3>
          <p class="text-sm text-gray-500">${utils.formatMoney(product.price)}</p>
        </div>
      </a>
    `).join('');

    this.searchResults.innerHTML = resultsHTML;
  }

  clearResults() {
    if (this.searchResults) {
      this.searchResults.innerHTML = '';
    }
    if (this.searchInput) {
      this.searchInput.value = '';
    }
  }

  bindEvents() {
    this.searchToggles.forEach(toggle => {
      toggle.addEventListener('click', () => this.open());
    });
    const closeButtons = this.searchModal?.querySelectorAll('[data-search-close]');
    closeButtons?.forEach(button => {
      button.addEventListener('click', () => this.close());
    });
    if (this.searchInput) {
      const debouncedSearch = utils.debounce((query) => this.search(query), 300);
      this.searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.searchModal?.classList.contains('active')) {
        this.close();
      }
    });
    this.searchModal?.addEventListener('click', (e) => {
      if (e.target === this.searchModal) {
        this.close();
      }
    });
  }
}
class CarouselManager {
  constructor(element) {
    this.carousel = element;
    this.track = element.querySelector('.carousel-track');
    this.slides = element.querySelectorAll('.carousel-slide');
    this.prevBtn = element.querySelector('.carousel-prev');
    this.nextBtn = element.querySelector('.carousel-next');
    this.indicators = element.querySelectorAll('.carousel-indicator');

    this.currentSlide = 0;
    this.totalSlides = this.slides.length;
    this.autoplayDelay = parseInt(element.dataset.autoplay) || 0;
    this.autoplayTimer = null;

    if (this.totalSlides > 0) {
      this.init();
    }
  }

  init() {
    this.updateCarousel();
    this.bindEvents();

    if (this.autoplayDelay > 0) {
      this.startAutoplay();
    }
  }

  goToSlide(index) {
    this.currentSlide = Math.max(0, Math.min(index, this.totalSlides - 1));
    this.updateCarousel();
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateCarousel();
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.updateCarousel();
  }

  updateCarousel() {
    if (this.track) {
      this.track.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    }
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentSlide);
    });
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentSlide === 0;
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
    }
  }

  startAutoplay() {
    this.autoplayTimer = setInterval(() => {
      this.nextSlide();
    }, this.autoplayDelay);
  }

  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  bindEvents() {
    this.nextBtn?.addEventListener('click', () => {
      this.nextSlide();
      this.stopAutoplay();
    });

    this.prevBtn?.addEventListener('click', () => {
      this.prevSlide();
      this.stopAutoplay();
    });

    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        this.goToSlide(index);
        this.stopAutoplay();
      });
    });
    let startX = 0;
    let isDragging = false;

    this.carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      this.stopAutoplay();
    });

    this.carousel.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
    });

    this.carousel.addEventListener('touchend', (e) => {
      if (!isDragging) return;

      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }

      isDragging = false;
    });
    this.carousel.addEventListener('mouseenter', () => this.stopAutoplay());
    this.carousel.addEventListener('mouseleave', () => {
      if (this.autoplayDelay > 0) {
        this.startAutoplay();
      }
    });
  }
}
class FormHandler {
  constructor() {
    this.forms = document.querySelectorAll('form[data-ajax-form]');
    this.init();
  }

  init() {
    this.forms.forEach(form => this.bindForm(form));
  }

  bindForm(form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit(form);
    });
  }

  async handleSubmit(form) {
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';
    }

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        this.showMessage('Success! Thank you for your submission.', 'success');
        form.reset();
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      this.showMessage('Something went wrong. Please try again.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  showMessage(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}
class ScrollAnimations {
  constructor() {
    this.elements = document.querySelectorAll('.fade-in, .slide-up, .scale-in');
    this.observer = null;

    if (THEME_CONFIG.animations.scrollAnimations && this.elements.length > 0) {
      this.init();
    }
  }

  init() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    this.elements.forEach(element => {
      this.observer.observe(element);
    });
  }
}
class CookieConsentManager {
  constructor() {
    this.banner = document.querySelector('.cookie-banner');
    this.acceptBtn = document.querySelector('[data-cookie-accept]');
    this.declineBtn = document.querySelector('[data-cookie-decline]');

    if (this.banner && !utils.getCookie('cookieConsent')) {
      this.init();
    }
  }

  init() {
    this.show();
    this.bindEvents();
  }

  show() {
    setTimeout(() => {
      this.banner.classList.add('active');
    }, 1000);
  }

  hide() {
    this.banner.classList.remove('active');
  }

  accept() {
    utils.setCookie('cookieConsent', 'accepted', 365);
    this.hide();
  }

  decline() {
    utils.setCookie('cookieConsent', 'declined', 365);
    this.hide();
  }

  bindEvents() {
    this.acceptBtn?.addEventListener('click', () => this.accept());
    this.declineBtn?.addEventListener('click', () => this.decline());
  }
}
class NewsletterPopupManager {
  constructor() {
    this.popup = document.querySelector('.newsletter-popup');
    this.closeBtn = document.querySelector('[data-newsletter-close]');
    this.delay = parseInt(document.body.dataset.newsletterDelay) * 1000 || 5000;

    if (this.popup && !utils.getCookie('newsletterShown')) {
      this.init();
    }
  }

  init() {
    setTimeout(() => {
      this.show();
    }, this.delay);

    this.bindEvents();
  }

  show() {
    this.popup.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  hide() {
    this.popup.classList.remove('active');
    document.body.style.overflow = '';
    utils.setCookie('newsletterShown', 'true', 7); // Don't show again for 7 days
  }

  bindEvents() {
    this.closeBtn?.addEventListener('click', () => this.hide());

    this.popup?.addEventListener('click', (e) => {
      if (e.target === this.popup) {
        this.hide();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.popup?.classList.contains('active')) {
        this.hide();
      }
    });
  }
}
class ThemeManager {
  constructor() {
    this.components = [];

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    this.components.push(new DarkModeManager());
    this.components.push(new MobileMenuManager());
    this.components.push(new CartDrawerManager());
    this.components.push(new SearchManager());
    this.components.push(new FormHandler());
    this.components.push(new ScrollAnimations());
    this.components.push(new CookieConsentManager());
    this.components.push(new NewsletterPopupManager());
    document.querySelectorAll('.carousel').forEach(carousel => {
      new CarouselManager(carousel);
    });
    this.initQuickAdd();
    this.initAnnouncementBar();
    this.initAccessibility();

    console.log('🎉 Modern Shopify Theme initialized successfully!');
  }

  initQuickAdd() {
    document.addEventListener('click', async (e) => {
      if (e.target.matches('[data-quick-add]')) {
        e.preventDefault();

        const button = e.target;
        const productId = button.dataset.productId;
        const originalText = button.textContent;

        button.disabled = true;
        button.textContent = 'Adding...';

        try {
          const response = await fetch('/cart/add.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: productId,
              quantity: 1
            })
          });

          if (response.ok) {
            button.textContent = 'Added!';
            const cartManager = this.components.find(c => c instanceof CartDrawerManager);
            if (cartManager) {
              await cartManager.fetchCartContents();
            }
            setTimeout(() => {
              button.textContent = originalText;
              button.disabled = false;
            }, 2000);
          } else {
            throw new Error('Failed to add to cart');
          }
        } catch (error) {
          button.textContent = 'Error';
          setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
          }, 2000);
        }
      }
    });
  }

  initAnnouncementBar() {
    const announcementBar = document.querySelector('.announcement-bar');
    const closeBtn = announcementBar?.querySelector('[data-announcement-close]');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        announcementBar.style.display = 'none';
        utils.setCookie('announcementClosed', 'true', 1); // Hide for 1 day
      });
    }
    if (utils.getCookie('announcementClosed') && announcementBar) {
      announcementBar.style.display = 'none';
    }
  }

  initAccessibility() {
    if (THEME_CONFIG.accessibility.skipToContent) {
      const skipLink = document.createElement('a');
      skipLink.href = '#main';
      skipLink.className = 'skip-link';
      skipLink.textContent = 'Skip to content';
      document.body.insertBefore(skipLink, document.body.firstChild);
    }
    const dropdowns = document.querySelectorAll('[data-dropdown]');
    dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('[data-dropdown-trigger]');
      const menu = dropdown.querySelector('[data-dropdown-menu]');

      if (trigger && menu) {
        trigger.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            trigger.click();
          }
        });
      }
    });
  }
}
window.Theme = {
  utils,
  formatMoney: utils.formatMoney
};
new ThemeManager();