/**
 * Enhanced Cart Drawer with Advanced Features
 * - Quantity controls with smooth animations
 * - Remove with undo functionality
 * - Discount codes application
 * - Cart notes management
 * - Free shipping progress
 * - Real-time updates
 */

class EnhancedCartDrawer {
  constructor() {
    this.drawer = document.getElementById('cart-drawer');
    this.overlay = document.getElementById('cart-drawer-overlay');
    this.isOpen = false;
    this.freeShippingThreshold = 50.00; // $50 for free shipping
    this.undoTimer = null;
    this.removedItem = null;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateShippingProgress();
    this.initDiscountToggle();
    this.initNotesToggle();
    this.updateCartCount();
  }

  bindEvents() {
    // Open/Close cart drawer
    const cartTriggers = document.querySelectorAll('[data-cart-drawer]');
    cartTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    // Close cart drawer
    const closeBtn = document.getElementById('cart-drawer-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDrawer());
    }

    // Close on overlay click
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.closeDrawer());
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeDrawer();
      }
    });

    // Quantity controls
    this.bindQuantityControls();

    // Remove item buttons
    this.bindRemoveButtons();

    // Discount code functionality
    this.bindDiscountCode();

    // Cart notes functionality
    this.bindCartNotes();

    // Checkout button
    this.bindCheckoutButton();

    // Continue shopping
    this.bindContinueShopping();

    // Undo functionality
    this.bindUndoButton();
  }

  bindQuantityControls() {
    // Quantity decrease buttons
    const decreaseButtons = document.querySelectorAll('.quantity-decrease');
    decreaseButtons.forEach(btn => {
      btn.addEventListener('click', () => this.decreaseQuantity(btn.dataset.itemKey));
    });

    // Quantity increase buttons
    const increaseButtons = document.querySelectorAll('.quantity-increase');
    increaseButtons.forEach(btn => {
      btn.addEventListener('click', () => this.increaseQuantity(btn.dataset.itemKey));
    });

    // Quantity input changes
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
      input.addEventListener('change', () => this.updateQuantity(input.dataset.itemKey, parseInt(input.value)));
    });
  }

  bindRemoveButtons() {
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.removeItem(btn.dataset.itemKey));
    });
  }

  bindDiscountCode() {
    const applyBtn = document.getElementById('apply-discount-btn');
    const discountInput = document.getElementById('discount-code-input');
    
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyDiscountCode());
    }
    
    if (discountInput) {
      discountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.applyDiscountCode();
        }
      });
    }
  }

  bindCartNotes() {
    const notesTextarea = document.getElementById('cart-notes-textarea');
    if (notesTextarea) {
      let debounceTimer;
      notesTextarea.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.updateCartNotes(notesTextarea.value);
        }, 1000); // Update after 1 second of no typing
      });
    }
  }

  bindCheckoutButton() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
    }
  }

  bindContinueShopping() {
    const continueBtn = document.getElementById('continue-shopping');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => this.closeDrawer());
    }
  }

  bindUndoButton() {
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => this.undoRemove());
    }
  }

  initDiscountToggle() {
    const discountToggle = document.getElementById('discount-toggle');
    const discountForm = document.getElementById('discount-form');
    const discountArrow = document.getElementById('discount-arrow');

    if (discountToggle && discountForm) {
      discountToggle.addEventListener('click', () => {
        const isHidden = discountForm.classList.contains('hidden');
        
        if (isHidden) {
          discountForm.classList.remove('hidden');
          discountArrow.style.transform = 'rotate(180deg)';
          
          // Focus the input
          const input = document.getElementById('discount-code-input');
          if (input) input.focus();
        } else {
          discountForm.classList.add('hidden');
          discountArrow.style.transform = 'rotate(0deg)';
        }
      });
    }
  }

  initNotesToggle() {
    const notesToggle = document.getElementById('notes-toggle');
    const notesForm = document.getElementById('notes-form');
    const notesArrow = document.getElementById('notes-arrow');

    if (notesToggle && notesForm) {
      notesToggle.addEventListener('click', () => {
        const isHidden = notesForm.classList.contains('hidden');
        
        if (isHidden) {
          notesForm.classList.remove('hidden');
          notesArrow.style.transform = 'rotate(180deg)';
          
          // Focus the textarea
          const textarea = document.getElementById('cart-notes-textarea');
          if (textarea) textarea.focus();
        } else {
          notesForm.classList.add('hidden');
          notesArrow.style.transform = 'rotate(0deg)';
        }
      });
    }
  }

  async decreaseQuantity(itemKey) {
    const currentQuantity = this.getCurrentQuantity(itemKey);
    if (currentQuantity > 1) {
      await this.updateQuantity(itemKey, currentQuantity - 1);
    }
  }

  async increaseQuantity(itemKey) {
    const currentQuantity = this.getCurrentQuantity(itemKey);
    await this.updateQuantity(itemKey, currentQuantity + 1);
  }

  getCurrentQuantity(itemKey) {
    const input = document.querySelector(`input[data-item-key="${itemKey}"]`);
    return input ? parseInt(input.value) || 1 : 1;
  }

  async updateQuantity(itemKey, newQuantity) {
    if (newQuantity < 1) return;

    try {
      this.showItemLoading(itemKey, true);

      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemKey,
          quantity: newQuantity
        })
      });

      if (response.ok) {
        const cart = await response.json();
        this.updateCartDisplay(cart);
        this.showSuccessMessage(`Quantity updated to ${newQuantity}`);
      } else {
        throw new Error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      this.showErrorMessage('Failed to update quantity');
    } finally {
      this.showItemLoading(itemKey, false);
    }
  }

  async removeItem(itemKey) {
    try {
      // Store item data for undo
      const itemElement = document.querySelector(`[data-item-key="${itemKey}"]`);
      if (itemElement) {
        const quantity = this.getCurrentQuantity(itemKey);
        this.removedItem = {
          key: itemKey,
          quantity: quantity,
          element: itemElement.cloneNode(true)
        };
      }

      this.showItemLoading(itemKey, true);

      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemKey,
          quantity: 0
        })
      });

      if (response.ok) {
        const cart = await response.json();
        this.updateCartDisplay(cart);
        this.showUndoNotification();
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      this.showErrorMessage('Failed to remove item');
    }
  }

  async undoRemove() {
    if (!this.removedItem) return;

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: this.removedItem.key,
          quantity: this.removedItem.quantity
        })
      });

      if (response.ok) {
        const cart = await this.fetchCart();
        this.updateCartDisplay(cart);
        this.hideUndoNotification();
        this.showSuccessMessage('Item restored to cart');
        this.removedItem = null;
      } else {
        throw new Error('Failed to restore item');
      }
    } catch (error) {
      console.error('Error restoring item:', error);
      this.showErrorMessage('Failed to restore item');
    }
  }

  async applyDiscountCode() {
    const input = document.getElementById('discount-code-input');
    const applyBtn = document.getElementById('apply-discount-btn');
    const messageDiv = document.getElementById('discount-message');
    
    if (!input || !input.value.trim()) return;

    const discountCode = input.value.trim();

    try {
      this.setButtonLoading(applyBtn, true);

      // Note: Shopify doesn't have a direct API for discount codes
      // This would need to be handled differently or through a backend service
      // For now, we'll simulate the behavior

      const response = await fetch('/discount/' + encodeURIComponent(discountCode), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        this.showDiscountMessage('Discount code applied successfully!', 'success');
        this.addAppliedDiscount(discountCode, result.discount);
        input.value = '';
        
        // Refresh cart to show updated pricing
        const cart = await this.fetchCart();
        this.updateCartDisplay(cart);
      } else {
        this.showDiscountMessage('Invalid discount code', 'error');
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      this.showDiscountMessage('Unable to apply discount code', 'error');
    } finally {
      this.setButtonLoading(applyBtn, false);
    }
  }

  async updateCartNotes(notes) {
    try {
      const response = await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: notes
        })
      });

      if (response.ok) {
        console.log('Cart notes updated');
      }
    } catch (error) {
      console.error('Error updating cart notes:', error);
    }
  }

  async proceedToCheckout() {
    const checkoutBtn = document.getElementById('checkout-btn');
    
    try {
      this.setButtonLoading(checkoutBtn, true);
      
      // Add a small delay for UX
      setTimeout(() => {
        window.location.href = '/checkout';
      }, 500);
    } catch (error) {
      console.error('Error proceeding to checkout:', error);
      this.setButtonLoading(checkoutBtn, false);
    }
  }

  async fetchCart() {
    try {
      const response = await fetch('/cart.js');
      return await response.json();
    } catch (error) {
      console.error('Error fetching cart:', error);
      return null;
    }
  }

  updateCartDisplay(cart) {
    // Update cart count
    this.updateCartCount(cart.item_count);
    
    // Update totals
    this.updateCartTotals(cart);
    
    // Update shipping progress
    this.updateShippingProgress(cart.total_price);
    
    // If cart is empty, show empty state
    if (cart.item_count === 0) {
      this.showEmptyCart();
    }
    
    // Re-bind events for new elements
    this.bindQuantityControls();
    this.bindRemoveButtons();
  }

  updateCartCount(count = null) {
    const countElements = document.querySelectorAll('#cart-drawer-count, .cart-count');
    const actualCount = count !== null ? count : this.getCartItemCount();
    
    countElements.forEach(element => {
      element.textContent = actualCount;
    });

    // Update checkout button state
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      if (actualCount === 0) {
        checkoutBtn.disabled = true;
        checkoutBtn.querySelector('.checkout-text').textContent = 'Cart is Empty';
      } else {
        checkoutBtn.disabled = false;
        checkoutBtn.querySelector('.checkout-text').textContent = 'Secure Checkout';
      }
    }
  }

  updateCartTotals(cart) {
    const subtotalElement = document.getElementById('cart-subtotal');
    const totalElement = document.getElementById('cart-total');
    
    if (subtotalElement && cart) {
      subtotalElement.textContent = this.formatMoney(cart.total_price);
    }
    
    if (totalElement && cart) {
      totalElement.textContent = this.formatMoney(cart.total_price);
    }
  }

  updateShippingProgress(cartTotal = null) {
    const progressBar = document.getElementById('shipping-progress-fill');
    const shippingText = document.getElementById('shipping-text');
    const remainingAmount = document.getElementById('remaining-amount');
    
    if (!progressBar || !shippingText) return;

    const total = cartTotal || this.getCartTotal();
    const totalInDollars = total / 100; // Convert from cents
    const remaining = Math.max(0, this.freeShippingThreshold - totalInDollars);
    const progress = Math.min(100, (totalInDollars / this.freeShippingThreshold) * 100);

    // Update progress bar
    progressBar.style.width = `${progress}%`;

    // Update text
    if (remaining > 0) {
      shippingText.innerHTML = `Add $<span id="remaining-amount">${remaining.toFixed(2)}</span> more for free shipping!`;
    } else {
      shippingText.innerHTML = `🎉 You qualify for free shipping!`;
      progressBar.parentElement.classList.add('bg-green-100', 'dark:bg-green-900/20');
    }
  }

  showEmptyCart() {
    const cartItemsContainer = document.getElementById('cart-drawer-items');
    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart flex flex-col items-center justify-center h-full p-6 sm:p-8 text-center">
          <div class="empty-cart-icon mb-4">
            <svg class="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Your cart is empty</h3>
          <p class="text-neutral-600 dark:text-neutral-400 mb-6 max-w-sm">Looks like you haven't added anything to your cart yet. Start shopping to fill it up!</p>
          <button 
            class="continue-shopping bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
            id="continue-shopping"
          >
            Continue Shopping
          </button>
        </div>
      `;
      
      // Re-bind continue shopping button
      this.bindContinueShopping();
    }
  }

  showUndoNotification() {
    const notification = document.getElementById('undo-notification');
    if (notification) {
      notification.classList.remove('hidden', 'translate-y-full');
      
      // Auto-hide after 5 seconds
      this.undoTimer = setTimeout(() => {
        this.hideUndoNotification();
      }, 5000);
    }
  }

  hideUndoNotification() {
    const notification = document.getElementById('undo-notification');
    if (notification) {
      notification.classList.add('translate-y-full');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 300);
    }
    
    if (this.undoTimer) {
      clearTimeout(this.undoTimer);
      this.undoTimer = null;
    }
  }

  showDiscountMessage(message, type) {
    const messageDiv = document.getElementById('discount-message');
    if (messageDiv) {
      messageDiv.textContent = message;
      messageDiv.className = `discount-message mt-2 text-xs ${type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`;
      messageDiv.classList.remove('hidden');
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        messageDiv.classList.add('hidden');
      }, 3000);
    }
  }

  addAppliedDiscount(code, discount) {
    const appliedDiscounts = document.getElementById('applied-discounts');
    if (appliedDiscounts) {
      const discountElement = document.createElement('div');
      discountElement.className = 'applied-discount flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2';
      discountElement.innerHTML = `
        <span class="text-sm text-green-700 dark:text-green-300">${code} (-${discount})</span>
        <button type="button" class="remove-discount text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200" data-code="${code}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      `;
      
      appliedDiscounts.appendChild(discountElement);
      appliedDiscounts.classList.remove('hidden');
      
      // Bind remove discount event
      discountElement.querySelector('.remove-discount').addEventListener('click', () => {
        this.removeDiscount(code);
      });
    }
  }

  removeDiscount(code) {
    // Implementation would depend on your discount system
    console.log('Removing discount:', code);
  }

  showItemLoading(itemKey, loading) {
    const itemElement = document.querySelector(`[data-item-key="${itemKey}"]`);
    if (itemElement) {
      if (loading) {
        itemElement.style.opacity = '0.5';
        itemElement.style.pointerEvents = 'none';
      } else {
        itemElement.style.opacity = '1';
        itemElement.style.pointerEvents = 'auto';
      }
    }
  }

  setButtonLoading(button, loading) {
    if (!button) return;
    
    const text = button.querySelector('.checkout-text, .btn-text');
    const loadingSpinner = button.querySelector('.checkout-loading, .btn-loading');
    
    if (loading) {
      if (text) text.classList.add('hidden');
      if (loadingSpinner) loadingSpinner.classList.remove('hidden');
      button.disabled = true;
    } else {
      if (text) text.classList.remove('hidden');
      if (loadingSpinner) loadingSpinner.classList.add('hidden');
      button.disabled = false;
    }
  }

  openDrawer() {
    if (this.drawer && this.overlay) {
      this.isOpen = true;
      document.body.style.overflow = 'hidden';
      
      this.overlay.classList.remove('invisible', 'opacity-0');
      this.drawer.classList.remove('translate-x-full');
      
      // Focus management
      const firstFocusable = this.drawer.querySelector('button, input, textarea, select');
      if (firstFocusable) {
        firstFocusable.focus();
      }

      // Update cart data
      this.refreshCartData();
    }
  }

  closeDrawer() {
    if (this.drawer && this.overlay) {
      this.isOpen = false;
      document.body.style.overflow = '';
      
      this.overlay.classList.add('invisible', 'opacity-0');
      this.drawer.classList.add('translate-x-full');
      
      // Hide undo notification if open
      this.hideUndoNotification();
    }
  }

  async refreshCartData() {
    try {
      const cart = await this.fetchCart();
      if (cart) {
        this.updateCartDisplay(cart);
      }
    } catch (error) {
      console.error('Error refreshing cart data:', error);
    }
  }

  getCartItemCount() {
    const cartItems = document.querySelectorAll('.cart-item');
    return cartItems.length;
  }

  getCartTotal() {
    // This would need to be extracted from the current cart data
    // For now, return 0 as a fallback
    return 0;
  }

  showSuccessMessage(message) {
    this.showNotification(message, 'success');
  }

  showErrorMessage(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-4 py-2 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    requestAnimationFrame(() => {
      notification.classList.remove('translate-x-full');
    });
    
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  formatMoney(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  }
}

// Initialize Enhanced Cart Drawer
document.addEventListener('DOMContentLoaded', () => {
  // Replace global cart with enhanced version if needed
  window.enhancedCart = new EnhancedCartDrawer();
});

// Export for global access
window.EnhancedCartDrawer = EnhancedCartDrawer;