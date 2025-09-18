/**
 * Global Cart Management
 * Handles all cart-related functionality across the theme
 */

class GlobalCart {
  constructor() {
    this.cart = null;
    this.isUpdating = false;
    this.init();
  }

  async init() {
    await this.getCart();
    this.setupEventListeners();
    this.setupAddToCartForms();
  }

  setupEventL  // Enhanced Cart Drawer with quantity controls
  async getCart() {
    try {
      const response = await fetch('/cart.js');
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching cart:', error);
      return null;
    }
  }steners() {
    // Listen for cart events
    document.addEventListener('cart:add', (e) => this.handleAddToCart(e.detail));
    document.addEventListener('cart:update', (e) => this.handleCartUpdate(e.detail));
    document.addEventListener('cart:remove', (e) => this.handleRemoveFromCart(e.detail));
    
    // Setup cart icon click
    const cartButton = document.getElementById('cart-icon-bubble');
    if (cartButton) {
      cartButton.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('cart:open'));
      });
    }
  }

  setupAddToCartForms() {
    // Handle add to cart buttons in product cards
    document.addEventListener('click', async (e) => {
      const addToCartBtn = e.target.closest('.product-card-add-to-cart, [data-add-to-cart]');
      if (!addToCartBtn) return;

      e.preventDefault();
      await this.addToCart(addToCartBtn);
    });

    // Handle product forms
    document.addEventListener('submit', async (e) => {
      if (e.target.matches('form[action*="/cart/add"]')) {
        e.preventDefault();
        await this.addToCartFromForm(e.target);
      }
    });
  }

  async addToCart(button) {
    if (button.disabled || this.isUpdating) return;

    const variantId = button.dataset.variantId || button.closest('[data-variant-id]')?.dataset.variantId;
    const quantity = parseInt(button.dataset.quantity || '1');

    if (!variantId) {
      console.error('No variant ID found');
      return;
    }

    try {
      this.setButtonLoading(button, true);
      
      const item = await this.addItemToCart(variantId, quantity);
      
      // Update UI
      this.showAddedNotification(item);
      await this.refreshCart();
      
      // Open cart drawer
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('cart:open'));
      }, 500);

    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showErrorMessage(error.message || 'Failed to add item to cart');
    } finally {
      this.setButtonLoading(button, false);
    }
  }

  async addToCartFromForm(form) {
    const formData = new FormData(form);
    const button = form.querySelector('[type="submit"]');

    try {
      this.setButtonLoading(button, true);
      
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.description || 'Failed to add to cart');
      }

      const item = await response.json();
      
      this.showAddedNotification(item);
      await this.refreshCart();
      
      // Open cart drawer
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('cart:open'));
      }, 500);

    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showErrorMessage(error.message || 'Failed to add item to cart');
    } finally {
      this.setButtonLoading(button, false);
    }
  }

  async addItemToCart(variantId, quantity = 1) {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: variantId,
        quantity: quantity
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.description || 'Failed to add to cart');
    }

    return response.json();
  }

  async updateCartItem(key, quantity) {
    try {
      this.isUpdating = true;
      
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

      if (!response.ok) {
        throw new Error('Failed to update cart');
      }

      const cart = await response.json();
      await this.setCart(cart);
      
      return cart;
    } finally {
      this.isUpdating = false;
    }
  }

  async removeCartItem(key) {
    return this.updateCartItem(key, 0);
  }

  async refreshCart() {
    const cart = await this.getCart();
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
    return cart;
  }

  async setCart(cart) {
    this.cart = cart;
    this.updateCartCount(cart.item_count);
    this.updateCartTotal(cart.total_price);
  }

  updateCartCount(count) {
    // Update header cart badge
    const cartBadges = document.querySelectorAll('.cart-count-bubble');
    cartBadges.forEach(badge => {
      const countSpan = badge.querySelector('span[aria-hidden="true"]') || badge;
      countSpan.textContent = count;
      
      if (count === 0) {
        badge.classList.add('hidden');
      } else {
        badge.classList.remove('hidden');
      }
    });

    // Update cart drawer count
    const drawerCount = document.getElementById('cart-drawer-count');
    if (drawerCount) {
      drawerCount.textContent = count;
    }
  }

  updateCartTotal(total) {
    const totalElements = document.querySelectorAll('#cart-subtotal, [data-cart-total]');
    totalElements.forEach(element => {
      // Format price - this is a simple implementation
      // In a real Shopify theme, you'd use proper money formatting
      const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(total / 100);
      
      element.textContent = formattedPrice;
    });
  }

  setButtonLoading(button, loading) {
    if (!button) return;

    if (loading) {
      button.disabled = true;
      button.classList.add('loading');
      
      const originalText = button.innerHTML;
      button.dataset.originalText = originalText;
      button.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Adding...
      `;
    } else {
      button.disabled = false;
      button.classList.remove('loading');
      
      if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
        delete button.dataset.originalText;
      }
    }
  }

  showAddedNotification(item) {
    // Create or update notification
    let notification = document.getElementById('cart-added-notification');
    
    if (!notification) {
      notification = this.createNotification();
      document.body.appendChild(notification);
    }

    // Update notification content
    const image = notification.querySelector('.notification-image');
    const title = notification.querySelector('.notification-title');
    const message = notification.querySelector('.notification-message');

    if (item.image && image) {
      image.src = item.image;
      image.alt = item.product_title;
    }
    
    if (title) title.textContent = item.product_title;
    if (message) message.textContent = 'Added to cart successfully!';

    // Show notification
    notification.classList.remove('translate-x-full', 'opacity-0');
    notification.classList.add('translate-x-0', 'opacity-100');

    // Hide after 3 seconds
    setTimeout(() => {
      notification.classList.remove('translate-x-0', 'opacity-100');
      notification.classList.add('translate-x-full', 'opacity-0');
    }, 3000);
  }

  createNotification() {
    const notification = document.createElement('div');
    notification.id = 'cart-added-notification';
    notification.className = 'fixed top-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-50 transform translate-x-full opacity-0 transition-all duration-300 max-w-sm';
    
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <img class="notification-image w-12 h-12 object-cover rounded-lg" src="" alt="">
        <div class="flex-1 min-w-0">
          <p class="notification-title text-sm font-medium text-gray-900 dark:text-gray-100 truncate"></p>
          <p class="notification-message text-sm text-gray-500 dark:text-gray-400"></p>
        </div>
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </div>
      </div>
    `;

    return notification;
  }

  showErrorMessage(message) {
    // Simple error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  handleAddToCart(detail) {
    // Handle custom cart:add events
    if (detail.variantId) {
      this.addToCart({ dataset: { variantId: detail.variantId, quantity: detail.quantity || '1' } });
    }
  }

  handleCartUpdate(detail) {
    // Handle cart update events
    this.refreshCart();
  }

  handleRemoveFromCart(detail) {
    // Handle remove from cart events
    if (detail.key) {
      this.removeCartItem(detail.key);
    }
  }
}

// Enhanced Cart Drawer with quantity controls
class EnhancedCartDrawer {
  constructor() {
    this.drawer = document.getElementById('cart-drawer');
    this.overlay = document.getElementById('cart-drawer-overlay');
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Open/close events
    document.addEventListener('cart:open', () => this.open());
    
    const closeBtn = document.getElementById('cart-drawer-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    
    if (this.overlay) this.overlay.addEventListener('click', () => this.close());

    // Quantity controls
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-quantity-change]')) {
        e.preventDefault();
        this.handleQuantityChange(e.target);
      }
      
      if (e.target.matches('[data-remove-item]')) {
        e.preventDefault();
        this.handleRemoveItem(e.target);
      }
    });

    // Cart update events
    document.addEventListener('cart:updated', (e) => {
      this.updateCartContent(e.detail);
    });
  }

  async handleQuantityChange(button) {
    const change = parseInt(button.dataset.quantityChange);
    const key = button.dataset.key;
    
    if (!key) {
      console.error('No cart item key found');
      return;
    }
    
    try {
      // Get current cart to find the item
      const cart = await this.getCart();
      const item = cart.items.find(item => item.key === key);
      
      if (item) {
        const newQuantity = Math.max(0, item.quantity + change);
        button.disabled = true;
        await window.globalCart.updateCartItem(key, newQuantity);
        button.disabled = false;
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      button.disabled = false;
    }
  }

  async handleRemoveItem(button) {
    const key = button.dataset.key;
    
    if (!key) {
      console.error('No cart item key found');
      return;
    }
    
    try {
      button.disabled = true;
      await window.globalCart.removeCartItem(key);
      button.disabled = false;
    } catch (error) {
      console.error('Error removing item:', error);
      button.disabled = false;
    }
  }

  updateCartContent(cart) {
    // Update cart items in drawer
    this.updateCartItems(cart.items);
    
    // Update cart total
    const totalElement = document.getElementById('cart-subtotal');
    if (totalElement && cart.total_price !== undefined) {
      // Use Shopify's money formatting if available, otherwise use basic formatting
      if (window.Shopify && window.Shopify.formatMoney) {
        totalElement.textContent = window.Shopify.formatMoney(cart.total_price);
      } else {
        const formattedPrice = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(cart.total_price / 100);
        totalElement.textContent = formattedPrice;
      }
    }
    
    // Update item count in drawer
    const drawerCount = document.getElementById('cart-drawer-count');
    if (drawerCount) {
      drawerCount.textContent = cart.item_count;
    }
    
    // If cart is empty, reload to show empty state
    if (cart.item_count === 0) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }
  
  updateCartItems(items) {
    const cartItemsContainer = document.querySelector('#cart-drawer-items .space-y-4');
    if (!cartItemsContainer) return;
    
    // Update quantity displays for existing items
    items.forEach((item, index) => {
      const cartItem = cartItemsContainer.querySelector(`[data-key="${item.key}"]`);
      if (cartItem) {
        // Update quantity display
        const quantityDisplay = cartItem.querySelector('.w-8.text-center');
        if (quantityDisplay) {
          quantityDisplay.textContent = item.quantity;
        }
        
        // Update line price
        const linePrice = cartItem.querySelector('.text-sm.font-semibold');
        if (linePrice) {
          if (window.Shopify && window.Shopify.formatMoney) {
            linePrice.textContent = window.Shopify.formatMoney(item.final_line_price);
          } else {
            const formattedPrice = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(item.final_line_price / 100);
            linePrice.textContent = formattedPrice;
          }
        }
      }
    });
    
    // Remove items that are no longer in cart
    const currentItems = cartItemsContainer.querySelectorAll('.cart-item');
    currentItems.forEach(itemElement => {
      const key = itemElement.dataset.key;
      const itemExists = items.some(item => item.key === key);
      if (!itemExists) {
        itemElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        itemElement.style.opacity = '0';
        itemElement.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (itemElement.parentNode) {
            itemElement.parentNode.removeChild(itemElement);
          }
        }, 300);
      }
    });
  }

  open() {
    if (!this.drawer) return;
    
    this.drawer.classList.remove('translate-x-full');
    if (this.overlay) {
      this.overlay.classList.remove('opacity-0', 'invisible');
    }
    document.body.classList.add('overflow-hidden');
  }

  close() {
    if (!this.drawer) return;
    
    this.drawer.classList.add('translate-x-full');
    if (this.overlay) {
      this.overlay.classList.add('opacity-0', 'invisible');
    }
    document.body.classList.remove('overflow-hidden');
  }

  isOpen() {
    return this.drawer && !this.drawer.classList.contains('translate-x-full');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.globalCart = new GlobalCart();
  window.cartDrawer = new EnhancedCartDrawer();
});

// Export for use in other scripts
window.GlobalCart = GlobalCart;
window.EnhancedCartDrawer = EnhancedCartDrawer;