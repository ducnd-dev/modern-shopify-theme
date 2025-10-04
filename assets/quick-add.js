// Quick Add Functionality
class QuickAdd {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.createModal();
  }

  bindEvents() {
    // Quick add button clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.quick-add__button')) {
        e.preventDefault();
        const button = e.target.closest('.quick-add__button');
        const productHandle = button.dataset.productHandle;
        const productId = button.dataset.productId;
        
        if (productHandle) {
          this.openModal(productHandle, productId);
        }
      }
    });

    // Modal close events
    document.addEventListener('click', (e) => {
      if (e.target.closest('.quick-add__modal-close') || 
          (e.target.classList.contains('quick-add__modal') && !e.target.closest('.quick-add__modal-content'))) {
        this.closeModal();
      }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('quick-add__modal--visible')) {
        this.closeModal();
      }
    });

    // Variant selection
    document.addEventListener('click', (e) => {
      if (e.target.closest('.quick-add__variant-option')) {
        this.handleVariantSelection(e.target.closest('.quick-add__variant-option'));
      }
    });

    // Quantity controls
    document.addEventListener('click', (e) => {
      if (e.target.closest('.quick-add__quantity-button')) {
        this.handleQuantityChange(e.target.closest('.quick-add__quantity-button'));
      }
    });

    // Add to cart
    document.addEventListener('click', (e) => {
      if (e.target.closest('.quick-add__add-button')) {
        e.preventDefault();
        this.addToCart(e.target.closest('.quick-add__add-button'));
      }
    });

    // Quantity input change
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('quick-add__quantity-input')) {
        this.validateQuantity(e.target);
      }
    });
  }

  createModal() {
    // Create modal if it doesn't exist
    if (!document.querySelector('.quick-add__modal')) {
      const modalHTML = `
        <div class="quick-add__modal" id="quick-add-modal">
          <div class="quick-add__modal-content">
            <button class="quick-add__modal-close" type="button" aria-label="Close">
              <svg class="quick-add__modal-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <div class="quick-add__content"></div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      this.modal = document.getElementById('quick-add-modal');
    }
  }

  async openModal(productHandle, productId) {
    if (!this.modal) return;

    this.showLoading();
    this.modal.classList.add('quick-add__modal--visible');
    document.body.style.overflow = 'hidden';

    try {
      const productData = await this.fetchProductData(productHandle);
      this.renderProductForm(productData);
    } catch (error) {
      console.error('Error loading product:', error);
      this.showError('Failed to load product information.');
    }
  }

  closeModal() {
    if (!this.modal) return;

    this.modal.classList.remove('quick-add__modal--visible');
    document.body.style.overflow = '';
    
    // Clear content after animation
    setTimeout(() => {
      const content = this.modal.querySelector('.quick-add__content');
      if (content) content.innerHTML = '';
    }, 300);
  }

  showLoading() {
    const content = this.modal.querySelector('.quick-add__content');
    content.innerHTML = `
      <div class="quick-add__loading" style="text-align: center; padding: 3rem;">
        <div class="loading-spinner">
          <div class="loading-spinner__element"></div>
        </div>
        <p style="margin-top: 1rem; color: #6b7280;">Loading product...</p>
      </div>
    `;
  }

  async fetchProductData(productHandle) {
    const response = await fetch(`/products/${productHandle}.js`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  renderProductForm(product) {
    const content = this.modal.querySelector('.quick-add__content');
    const selectedVariant = product.variants[0];
    
    content.innerHTML = `
      <form class="quick-add__form" data-product-id="${product.id}">
        ${product.featured_image ? `
          <img 
            src="${this.getImageUrl(product.featured_image, 400)}" 
            alt="${product.title}"
            class="quick-add__product-image"
            width="400"
            height="200"
          >
        ` : ''}
        
        <h3 class="quick-add__product-title">${product.title}</h3>
        
        <div class="quick-add__product-price">
          <span class="quick-add__price">${this.formatPrice(selectedVariant.price)}</span>
          ${selectedVariant.compare_at_price && selectedVariant.compare_at_price > selectedVariant.price ? 
            `<span class="quick-add__product-price--compare">${this.formatPrice(selectedVariant.compare_at_price)}</span>` : ''
          }
        </div>

        ${this.renderVariantSelectors(product)}
        ${this.renderQuantitySelector()}
        
        <div class="quick-add__add-to-cart">
          <button 
            type="submit" 
            class="quick-add__add-button"
            ${!selectedVariant.available ? 'disabled' : ''}
          >
            <svg class="quick-add__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10m-5-8v8m0-8l-3 3m3-3l3 3"></path>
            </svg>
            ${selectedVariant.available ? 'Add to Cart' : 'Sold Out'}
          </button>
          
          <a href="/products/${product.handle}" class="quick-add__view-full">
            View Full Details
          </a>
        </div>

        <div class="quick-add__success">
          <svg class="quick-add__success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Added to cart successfully!
        </div>

        <div class="quick-add__error">
          <svg class="quick-add__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="quick-add__error-message">Something went wrong. Please try again.</span>
        </div>
      </form>
    `;

    // Set up initial variant selection
    this.currentProduct = product;
    this.updateSelectedVariant();
  }

  renderVariantSelectors(product) {
    if (!product.options || product.options.length === 0 || 
        (product.options.length === 1 && product.options[0].name === 'Title')) {
      return '';
    }

    let html = '<div class="quick-add__variants">';
    
    product.options.forEach((option, index) => {
      html += `
        <div class="quick-add__variant-group">
          <label class="quick-add__variant-label">${option.name}:</label>
          <div class="quick-add__variant-options" data-option-index="${index}">
      `;
      
      option.values.forEach(value => {
        const isSelected = index === 0 && value === product.variants[0].options[index];
        html += `
          <button 
            type="button"
            class="quick-add__variant-option ${isSelected ? 'quick-add__variant-option--selected' : ''}"
            data-value="${value}"
            data-option-index="${index}"
          >
            ${value}
          </button>
        `;
      });
      
      html += '</div></div>';
    });
    
    html += '</div>';
    return html;
  }

  renderQuantitySelector() {
    return `
      <div class="quick-add__quantity">
        <label class="quick-add__quantity-label">Quantity:</label>
        <div class="quick-add__quantity-controls">
          <button type="button" class="quick-add__quantity-button" data-action="decrease">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <input 
            type="number" 
            class="quick-add__quantity-input" 
            value="1" 
            min="1" 
            max="999"
            name="quantity"
          >
          <button type="button" class="quick-add__quantity-button" data-action="increase">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  handleVariantSelection(button) {
    if (button.classList.contains('quick-add__variant-option--unavailable')) return;

    // Update selected state
    const optionGroup = button.closest('.quick-add__variant-options');
    optionGroup.querySelectorAll('.quick-add__variant-option').forEach(opt => {
      opt.classList.remove('quick-add__variant-option--selected');
    });
    button.classList.add('quick-add__variant-option--selected');

    // Update product state
    this.updateSelectedVariant();
  }

  updateSelectedVariant() {
    if (!this.currentProduct) return;

    const selectedOptions = [];
    const optionGroups = this.modal.querySelectorAll('.quick-add__variant-options');
    
    optionGroups.forEach(group => {
      const selectedOption = group.querySelector('.quick-add__variant-option--selected');
      if (selectedOption) {
        selectedOptions.push(selectedOption.dataset.value);
      }
    });

    // Find matching variant
    const selectedVariant = this.currentProduct.variants.find(variant => {
      return variant.options.every((option, index) => option === selectedOptions[index]);
    });

    if (selectedVariant) {
      this.currentVariant = selectedVariant;
      this.updatePrice(selectedVariant);
      this.updateAvailability(selectedVariant);
      this.updateVariantAvailability();
    }
  }

  updatePrice(variant) {
    const priceElement = this.modal.querySelector('.quick-add__price');
    if (priceElement) {
      priceElement.textContent = this.formatPrice(variant.price);
    }

    const compareElement = this.modal.querySelector('.quick-add__product-price--compare');
    if (compareElement) {
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        compareElement.textContent = this.formatPrice(variant.compare_at_price);
        compareElement.style.display = 'inline';
      } else {
        compareElement.style.display = 'none';
      }
    }
  }

  updateAvailability(variant) {
    const addButton = this.modal.querySelector('.quick-add__add-button');
    if (addButton) {
      if (variant.available) {
        addButton.disabled = false;
        addButton.textContent = 'Add to Cart';
      } else {
        addButton.disabled = true;
        addButton.textContent = 'Sold Out';
      }
    }
  }

  updateVariantAvailability() {
    // Mark unavailable variant combinations
    const optionGroups = this.modal.querySelectorAll('.quick-add__variant-options');
    
    optionGroups.forEach((group, groupIndex) => {
      const options = group.querySelectorAll('.quick-add__variant-option');
      
      options.forEach(option => {
        const testOptions = Array.from(this.modal.querySelectorAll('.quick-add__variant-option--selected'))
          .map(selected => selected.dataset.value);
        
        testOptions[groupIndex] = option.dataset.value;
        
        const matchingVariant = this.currentProduct.variants.find(variant => {
          return variant.options.every((opt, index) => opt === testOptions[index]);
        });
        
        if (matchingVariant && matchingVariant.available) {
          option.classList.remove('quick-add__variant-option--unavailable');
        } else {
          option.classList.add('quick-add__variant-option--unavailable');
        }
      });
    });
  }

  handleQuantityChange(button) {
    const input = button.parentNode.querySelector('.quick-add__quantity-input');
    const action = button.dataset.action;
    let currentValue = parseInt(input.value) || 1;

    if (action === 'increase') {
      currentValue++;
    } else if (action === 'decrease' && currentValue > 1) {
      currentValue--;
    }

    input.value = currentValue;
    this.validateQuantity(input);
  }

  validateQuantity(input) {
    let value = parseInt(input.value) || 1;
    const min = parseInt(input.min) || 1;
    const max = parseInt(input.max) || 999;

    if (value < min) value = min;
    if (value > max) value = max;

    input.value = value;

    // Update decrease button state
    const decreaseBtn = input.parentNode.querySelector('[data-action="decrease"]');
    if (decreaseBtn) {
      decreaseBtn.disabled = value <= min;
    }
  }

  async addToCart(button) {
    if (!this.currentVariant) return;

    const form = button.closest('.quick-add__form');
    const quantity = parseInt(form.querySelector('.quick-add__quantity-input').value) || 1;

    // Show loading state
    this.setButtonLoading(button, true);
    this.hideMessages();

    try {
      const formData = new FormData();
      formData.append('id', this.currentVariant.id);
      formData.append('quantity', quantity);

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      });

      if (response.ok) {
        this.showSuccess();
        this.updateCartCount();
        
        // Trigger cart drawer if it exists
        if (window.cartDrawer && window.cartDrawer.refresh) {
          window.cartDrawer.refresh();
        }
        
        // Close modal after success
        setTimeout(() => {
          this.closeModal();
        }, 1500);
      } else {
        const errorData = await response.json();
        this.showError(errorData.description || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      this.showError('Network error. Please try again.');
    } finally {
      this.setButtonLoading(button, false);
    }
  }

  setButtonLoading(button, loading) {
    if (loading) {
      button.classList.add('quick-add__button--loading');
      button.disabled = true;
    } else {
      button.classList.remove('quick-add__button--loading');
      button.disabled = !this.currentVariant?.available;
    }
  }

  showSuccess() {
    const successElement = this.modal.querySelector('.quick-add__success');
    if (successElement) {
      successElement.classList.add('quick-add__success--visible');
    }
  }

  showError(message) {
    const errorElement = this.modal.querySelector('.quick-add__error');
    const messageElement = this.modal.querySelector('.quick-add__error-message');
    
    if (errorElement && messageElement) {
      messageElement.textContent = message;
      errorElement.classList.add('quick-add__error--visible');
    }
  }

  hideMessages() {
    const success = this.modal.querySelector('.quick-add__success');
    const error = this.modal.querySelector('.quick-add__error');
    
    if (success) success.classList.remove('quick-add__success--visible');
    if (error) error.classList.remove('quick-add__error--visible');
  }

  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      // Update cart count in header if element exists
      const cartCountElements = document.querySelectorAll('.cart-count, [data-cart-count]');
      cartCountElements.forEach(element => {
        element.textContent = cart.item_count;
      });
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }

  formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price / 100);
  }

  getImageUrl(url, size) {
    if (!url) return '';
    return url.replace(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?.*)?$/i, `_${size}x.$1$2`);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new QuickAdd();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuickAdd;
}