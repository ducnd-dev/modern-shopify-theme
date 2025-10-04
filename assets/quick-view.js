/**
 * Product Quick View Modal
 * Beautiful lightbox product preview with full functionality
 */

class QuickViewModal {
  constructor() {
    this.modal = document.getElementById('quick-view-modal');
    this.imageZoomModal = document.getElementById('image-zoom-modal');
    this.currentProduct = null;
    this.currentVariant = null;
    this.currentImageIndex = 0;
    this.productImages = [];
    this.zoomLevel = 1;
    this.zoomStep = 0.25;
    this.maxZoom = 3;
    this.minZoom = 0.5;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.createQuickViewButtons();
  }

  bindEvents() {
    // Modal close events
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });

    // Close on backdrop click
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.imageZoomModal && !this.imageZoomModal.classList.contains('hidden')) {
          this.closeImageZoom();
        } else if (this.modal && !this.modal.classList.contains('hidden')) {
          this.closeModal();
        }
      }
    });

    // Image navigation
    const prevBtn = document.querySelector('.image-nav-prev');
    const nextBtn = document.querySelector('.image-nav-next');
    
    if (prevBtn) prevBtn.addEventListener('click', () => this.previousImage());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextImage());

    // Quantity controls
    const quantityDecrease = document.querySelector('.quantity-decrease');
    const quantityIncrease = document.querySelector('.quantity-increase');
    const quantityInput = document.getElementById('quick-view-quantity');

    if (quantityDecrease) {
      quantityDecrease.addEventListener('click', () => this.decreaseQuantity());
    }
    if (quantityIncrease) {
      quantityIncrease.addEventListener('click', () => this.increaseQuantity());
    }
    if (quantityInput) {
      quantityInput.addEventListener('change', () => this.validateQuantity());
    }

    // Add to cart button
    const addToCartBtn = document.getElementById('quick-view-add-to-cart');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => this.addToCart());
    }

    // Buy now button
    const buyNowBtn = document.getElementById('quick-view-buy-now');
    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', () => this.buyNow());
    }

    // Image zoom functionality
    const mainImage = document.getElementById('quick-view-main-image');
    if (mainImage) {
      mainImage.addEventListener('click', () => this.openImageZoom());
    }

    // Image zoom modal events
    const closeZoomBtn = document.querySelector('.close-zoom');
    if (closeZoomBtn) {
      closeZoomBtn.addEventListener('click', () => this.closeImageZoom());
    }

    const zoomInBtn = document.querySelector('.zoom-in');
    const zoomOutBtn = document.querySelector('.zoom-out');
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoomIn());
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoomOut());

    // Image pan functionality
    this.setupImagePan();

    // Read more functionality
    const readMoreBtn = document.querySelector('.read-more');
    if (readMoreBtn) {
      readMoreBtn.addEventListener('click', () => this.toggleDescription());
    }
  }

  createQuickViewButtons() {
    // Add quick view buttons to existing product cards
    const productCards = document.querySelectorAll('.product-card-beautiful');
    
    productCards.forEach(card => {
      if (card.querySelector('.quick-view-btn')) return; // Already has button

      const productId = card.dataset.productId;
      const actionsContainer = card.querySelector('.product-actions');
      
      if (actionsContainer && productId) {
        const quickViewBtn = document.createElement('button');
        quickViewBtn.className = 'quick-view-btn absolute top-3 right-3 w-10 h-10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white dark:hover:bg-neutral-900 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2';
        quickViewBtn.innerHTML = `
          <svg class="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
        `;
        quickViewBtn.setAttribute('aria-label', 'Quick view product');
        quickViewBtn.setAttribute('data-product-id', productId);
        
        quickViewBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.openQuickView(productId);
        });

        card.appendChild(quickViewBtn);
      }
    });
  }

  async openQuickView(productId) {
    try {
      // Show loading state
      this.showModal();
      this.showLoadingState();

      // Fetch product data
      const productData = await this.fetchProductData(productId);
      
      if (productData) {
        this.currentProduct = productData;
        this.currentVariant = productData.variants[0]; // Default to first variant
        this.productImages = productData.images;
        this.currentImageIndex = 0;

        // Populate modal with product data
        this.populateProductInfo();
        this.populateImages();
        this.populateVariants();
        this.updatePricing();
        this.updateAvailability();
        
        // Hide loading state
        this.hideLoadingState();
      }
    } catch (error) {
      console.error('Error opening quick view:', error);
      this.showError('Failed to load product details');
    }
  }

  async fetchProductData(productId) {
    try {
      const response = await fetch(`/products/${productId}.js`);
      if (!response.ok) throw new Error('Product not found');
      
      const productData = await response.json();
      return productData;
    } catch (error) {
      // Fallback: try to get data from product card
      const productCard = document.querySelector(`[data-product-id="${productId}"]`);
      if (productCard) {
        return this.extractProductDataFromCard(productCard);
      }
      throw error;
    }
  }

  extractProductDataFromCard(card) {
    // Extract basic product data from the card's data attributes and DOM
    const title = card.dataset.title || card.querySelector('.product-title')?.textContent?.trim();
    const vendor = card.dataset.vendor;
    const price = parseFloat(card.dataset.price) || 0;
    const comparePrice = parseFloat(card.dataset.comparePrice) || 0;
    const available = card.dataset.available === 'true';
    
    const imageElements = card.querySelectorAll('img');
    const images = Array.from(imageElements).map(img => ({
      src: img.src,
      alt: img.alt,
      width: img.naturalWidth || 800,
      height: img.naturalHeight || 800
    }));

    const productUrl = card.querySelector('a')?.href || '#';

    return {
      id: card.dataset.productId,
      title: title,
      vendor: vendor,
      price: price * 100, // Convert to cents
      compare_at_price: comparePrice * 100,
      available: available,
      images: images,
      variants: [{
        id: `variant-${card.dataset.productId}`,
        title: 'Default',
        price: price * 100,
        compare_at_price: comparePrice * 100,
        available: available,
        inventory_quantity: available ? 10 : 0
      }],
      description: 'This is a beautiful product with amazing features.',
      url: productUrl,
      type: card.dataset.type || '',
      tags: []
    };
  }

  populateProductInfo() {
    const product = this.currentProduct;
    
    // Update title
    const titleElement = document.getElementById('quick-view-title-text');
    if (titleElement) titleElement.textContent = product.title;

    // Update vendor
    const vendorElement = document.getElementById('quick-view-vendor');
    if (vendorElement && product.vendor) {
      vendorElement.textContent = product.vendor;
      vendorElement.classList.remove('hidden');
    }

    // Update description
    const descriptionElement = document.getElementById('quick-view-description');
    if (descriptionElement) {
      descriptionElement.innerHTML = product.description || 'A beautiful product with amazing features.';
    }

    // Update full details link
    const fullDetailsLink = document.getElementById('quick-view-full-details');
    if (fullDetailsLink) {
      fullDetailsLink.href = product.url || '#';
    }

    // Update modal title
    const modalTitle = document.getElementById('quick-view-title');
    if (modalTitle) modalTitle.textContent = `Quick View: ${product.title}`;
  }

  populateImages() {
    const mainImage = document.getElementById('quick-view-main-image');
    const thumbnailsContainer = document.getElementById('quick-view-thumbnails');
    
    if (!this.productImages.length) return;

    // Set main image
    if (mainImage) {
      const currentImage = this.productImages[this.currentImageIndex];
      mainImage.src = currentImage.src || currentImage;
      mainImage.alt = currentImage.alt || this.currentProduct.title;
    }

    // Create thumbnails
    if (thumbnailsContainer) {
      thumbnailsContainer.innerHTML = '';
      
      this.productImages.forEach((image, index) => {
        const thumbnail = document.createElement('button');
        thumbnail.className = `thumbnail-btn flex-shrink-0 w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:border-primary-500 focus:outline-none focus:border-primary-500 ${
          index === this.currentImageIndex ? 'border-primary-500' : 'border-transparent'
        }`;
        
        thumbnail.innerHTML = `
          <img 
            src="${image.src || image}" 
            alt="${image.alt || this.currentProduct.title}" 
            class="w-full h-full object-cover"
          >
        `;
        
        thumbnail.addEventListener('click', () => {
          this.currentImageIndex = index;
          this.updateMainImage();
        });
        
        thumbnailsContainer.appendChild(thumbnail);
      });
    }

    // Show/hide navigation arrows
    const prevBtn = document.querySelector('.image-nav-prev');
    const nextBtn = document.querySelector('.image-nav-next');
    
    if (this.productImages.length > 1) {
      if (prevBtn) prevBtn.classList.remove('hidden');
      if (nextBtn) nextBtn.classList.remove('hidden');
    } else {
      if (prevBtn) prevBtn.classList.add('hidden');
      if (nextBtn) nextBtn.classList.add('hidden');
    }
  }

  populateVariants() {
    const variantsContainer = document.getElementById('quick-view-variants');
    if (!variantsContainer || !this.currentProduct.variants) return;

    variantsContainer.innerHTML = '';

    // Group variants by option (size, color, etc.)
    const variantOptions = this.groupVariantOptions();

    Object.entries(variantOptions).forEach(([optionName, values]) => {
      const optionContainer = document.createElement('div');
      optionContainer.className = 'variant-option mb-4';
      
      optionContainer.innerHTML = `
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">${optionName}</label>
        <div class="variant-values flex flex-wrap gap-2">
          ${values.map(value => `
            <button 
              type="button" 
              class="variant-btn px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-medium transition-all duration-300 hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
              data-option="${optionName}" 
              data-value="${value}"
            >
              ${value}
            </button>
          `).join('')}
        </div>
      `;
      
      variantsContainer.appendChild(optionContainer);
    });

    // Add variant selection event listeners
    const variantButtons = variantsContainer.querySelectorAll('.variant-btn');
    variantButtons.forEach(btn => {
      btn.addEventListener('click', () => this.selectVariant(btn));
    });

    // Select default variant
    this.selectDefaultVariant();
  }

  groupVariantOptions() {
    const options = {};
    
    this.currentProduct.variants.forEach(variant => {
      if (variant.option1) {
        if (!options['Size']) options['Size'] = new Set();
        options['Size'].add(variant.option1);
      }
      if (variant.option2) {
        if (!options['Color']) options['Color'] = new Set();
        options['Color'].add(variant.option2);
      }
      if (variant.option3) {
        if (!options['Style']) options['Style'] = new Set();
        options['Style'].add(variant.option3);
      }
    });

    // Convert Sets to Arrays
    Object.keys(options).forEach(key => {
      options[key] = Array.from(options[key]);
    });

    return options;
  }

  selectVariant(button) {
    // Update button states
    const optionButtons = button.closest('.variant-values').querySelectorAll('.variant-btn');
    optionButtons.forEach(btn => {
      btn.classList.remove('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900', 'text-primary-700', 'dark:text-primary-300');
      btn.classList.add('border-neutral-200', 'dark:border-neutral-700');
    });

    button.classList.add('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900', 'text-primary-700', 'dark:text-primary-300');
    button.classList.remove('border-neutral-200', 'dark:border-neutral-700');

    // Find matching variant
    this.findMatchingVariant();
    this.updatePricing();
    this.updateAvailability();
  }

  selectDefaultVariant() {
    const firstButtons = document.querySelectorAll('.variant-values .variant-btn:first-child');
    firstButtons.forEach(btn => {
      btn.classList.add('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900', 'text-primary-700', 'dark:text-primary-300');
    });
  }

  findMatchingVariant() {
    const selectedOptions = {};
    
    document.querySelectorAll('.variant-btn.border-primary-500').forEach(btn => {
      selectedOptions[btn.dataset.option] = btn.dataset.value;
    });

    // Find variant that matches selected options
    const matchingVariant = this.currentProduct.variants.find(variant => {
      let matches = true;
      if (selectedOptions['Size'] && variant.option1 !== selectedOptions['Size']) matches = false;
      if (selectedOptions['Color'] && variant.option2 !== selectedOptions['Color']) matches = false;
      if (selectedOptions['Style'] && variant.option3 !== selectedOptions['Style']) matches = false;
      return matches;
    });

    if (matchingVariant) {
      this.currentVariant = matchingVariant;
    }
  }

  updatePricing() {
    if (!this.currentVariant) return;

    const priceElement = document.getElementById('quick-view-price');
    const comparePriceElement = document.getElementById('quick-view-compare-price');
    const savingsElement = document.getElementById('quick-view-price-savings');
    const saleBadge = document.getElementById('quick-view-sale-badge');
    const discountPercent = document.getElementById('quick-view-discount-percent');

    const price = this.currentVariant.price / 100;
    const comparePrice = this.currentVariant.compare_at_price / 100;

    if (priceElement) {
      priceElement.textContent = this.formatMoney(price);
    }

    if (comparePrice > price) {
      if (comparePriceElement) {
        comparePriceElement.textContent = this.formatMoney(comparePrice);
        comparePriceElement.classList.remove('hidden');
      }
      
      if (savingsElement) {
        const savings = comparePrice - price;
        document.getElementById('savings-amount').textContent = this.formatMoney(savings);
        savingsElement.classList.remove('hidden');
      }

      if (saleBadge && discountPercent) {
        const discount = Math.round(((comparePrice - price) / comparePrice) * 100);
        discountPercent.textContent = discount;
        saleBadge.classList.remove('hidden');
      }
    } else {
      if (comparePriceElement) comparePriceElement.classList.add('hidden');
      if (savingsElement) savingsElement.classList.add('hidden');
      if (saleBadge) saleBadge.classList.add('hidden');
    }
  }

  updateAvailability() {
    const addToCartBtn = document.getElementById('quick-view-add-to-cart');
    const buyNowBtn = document.getElementById('quick-view-buy-now');
    const quantityControls = document.querySelectorAll('.quantity-decrease, .quantity-increase, #quick-view-quantity');

    const isAvailable = this.currentVariant && this.currentVariant.available;

    if (addToCartBtn) {
      addToCartBtn.disabled = !isAvailable;
      addToCartBtn.querySelector('.btn-text').textContent = isAvailable ? 'Add to Cart' : 'Sold Out';
    }

    if (buyNowBtn) {
      buyNowBtn.disabled = !isAvailable;
    }

    quantityControls.forEach(control => {
      control.disabled = !isAvailable;
    });
  }

  updateMainImage() {
    const mainImage = document.getElementById('quick-view-main-image');
    const thumbnails = document.querySelectorAll('.thumbnail-btn');

    if (mainImage && this.productImages[this.currentImageIndex]) {
      const currentImage = this.productImages[this.currentImageIndex];
      mainImage.src = currentImage.src || currentImage;
      mainImage.alt = currentImage.alt || this.currentProduct.title;
    }

    // Update thumbnail selection
    thumbnails.forEach((thumbnail, index) => {
      if (index === this.currentImageIndex) {
        thumbnail.classList.add('border-primary-500');
        thumbnail.classList.remove('border-transparent');
      } else {
        thumbnail.classList.remove('border-primary-500');
        thumbnail.classList.add('border-transparent');
      }
    });
  }

  previousImage() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.updateMainImage();
    }
  }

  nextImage() {
    if (this.currentImageIndex < this.productImages.length - 1) {
      this.currentImageIndex++;
      this.updateMainImage();
    }
  }

  decreaseQuantity() {
    const quantityInput = document.getElementById('quick-view-quantity');
    const currentValue = parseInt(quantityInput.value) || 1;
    
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
      this.validateQuantity();
    }
  }

  increaseQuantity() {
    const quantityInput = document.getElementById('quick-view-quantity');
    const currentValue = parseInt(quantityInput.value) || 1;
    const maxQuantity = this.currentVariant?.inventory_quantity || 99;
    
    if (currentValue < maxQuantity) {
      quantityInput.value = currentValue + 1;
      this.validateQuantity();
    }
  }

  validateQuantity() {
    const quantityInput = document.getElementById('quick-view-quantity');
    const decreaseBtn = document.querySelector('.quantity-decrease');
    const increaseBtn = document.querySelector('.quantity-increase');
    
    const value = parseInt(quantityInput.value) || 1;
    const maxQuantity = this.currentVariant?.inventory_quantity || 99;
    
    // Ensure value is within bounds
    if (value < 1) quantityInput.value = 1;
    if (value > maxQuantity) quantityInput.value = maxQuantity;
    
    // Update button states
    if (decreaseBtn) decreaseBtn.disabled = value <= 1;
    if (increaseBtn) increaseBtn.disabled = value >= maxQuantity;
  }

  async addToCart() {
    const addToCartBtn = document.getElementById('quick-view-add-to-cart');
    const quantity = parseInt(document.getElementById('quick-view-quantity').value) || 1;
    
    if (!this.currentVariant || !this.currentVariant.available) return;

    try {
      // Show loading state
      this.setButtonLoading(addToCartBtn, true);

      // Add to cart via Shopify Cart API
      const formData = {
        items: [{
          id: this.currentVariant.id,
          quantity: quantity
        }]
      };

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Success - update cart and show notification
        this.showSuccessMessage('Product added to cart!');
        
        // Update cart count if global cart is available
        if (window.globalCart) {
          window.globalCart.fetchCart();
        }
        
        // Auto-close modal after short delay
        setTimeout(() => {
          this.closeModal();
        }, 1500);
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      this.showError('Failed to add product to cart');
    } finally {
      this.setButtonLoading(addToCartBtn, false);
    }
  }

  buyNow() {
    // Add to cart then redirect to checkout
    this.addToCart().then(() => {
      window.location.href = '/checkout';
    });
  }

  openImageZoom() {
    const mainImage = document.getElementById('quick-view-main-image');
    const zoomedImage = document.getElementById('zoomed-image');
    
    if (mainImage && zoomedImage && this.imageZoomModal) {
      zoomedImage.src = mainImage.src;
      zoomedImage.alt = mainImage.alt;
      
      this.imageZoomModal.classList.remove('hidden');
      this.imageZoomModal.classList.remove('opacity-0');
      
      this.zoomLevel = 1;
      this.updateZoomLevel();
    }
  }

  closeImageZoom() {
    if (this.imageZoomModal) {
      this.imageZoomModal.classList.add('opacity-0');
      setTimeout(() => {
        this.imageZoomModal.classList.add('hidden');
      }, 300);
    }
  }

  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel = Math.min(this.zoomLevel + this.zoomStep, this.maxZoom);
      this.updateZoomLevel();
    }
  }

  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel = Math.max(this.zoomLevel - this.zoomStep, this.minZoom);
      this.updateZoomLevel();
    }
  }

  updateZoomLevel() {
    const zoomedImage = document.getElementById('zoomed-image');
    const zoomLevelDisplay = document.querySelector('.zoom-level');
    
    if (zoomedImage) {
      zoomedImage.style.transform = `scale(${this.zoomLevel})`;
    }
    
    if (zoomLevelDisplay) {
      zoomLevelDisplay.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }
  }

  setupImagePan() {
    const zoomedImage = document.getElementById('zoomed-image');
    let isPanning = false;
    let startX, startY, currentX = 0, currentY = 0;

    if (!zoomedImage) return;

    zoomedImage.addEventListener('mousedown', (e) => {
      if (this.zoomLevel > 1) {
        isPanning = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        zoomedImage.style.cursor = 'grabbing';
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isPanning) {
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
        
        zoomedImage.style.transform = `scale(${this.zoomLevel}) translate(${currentX}px, ${currentY}px)`;
      }
    });

    document.addEventListener('mouseup', () => {
      isPanning = false;
      if (zoomedImage) zoomedImage.style.cursor = 'move';
    });
  }

  toggleDescription() {
    const description = document.getElementById('quick-view-description');
    const readMoreBtn = document.querySelector('.read-more');
    
    if (description.classList.contains('line-clamp-4')) {
      description.classList.remove('line-clamp-4');
      readMoreBtn.textContent = 'Read less';
    } else {
      description.classList.add('line-clamp-4');
      readMoreBtn.textContent = 'Read more';
    }
  }

  showModal() {
    if (this.modal) {
      document.body.style.overflow = 'hidden';
      this.modal.classList.remove('hidden');
      this.modal.setAttribute('aria-hidden', 'false');
      
      requestAnimationFrame(() => {
        this.modal.classList.remove('opacity-0');
        this.modal.querySelector('.modal-content').classList.remove('scale-95');
        this.modal.querySelector('.modal-content').classList.add('scale-100');
      });

      // Focus management
      const firstFocusable = this.modal.querySelector('button, input, select, textarea');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.add('opacity-0');
      this.modal.querySelector('.modal-content').classList.add('scale-95');
      this.modal.querySelector('.modal-content').classList.remove('scale-100');
      
      setTimeout(() => {
        this.modal.classList.add('hidden');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }, 300);
    }
  }

  showLoadingState() {
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="loading-state flex items-center justify-center py-16">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p class="text-neutral-600 dark:text-neutral-400">Loading product details...</p>
          </div>
        </div>
      `;
    }
  }

  hideLoadingState() {
    // The modal body will be repopulated with actual content
  }

  setButtonLoading(button, loading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    
    if (loading) {
      btnText.classList.add('hidden');
      btnLoading.classList.remove('hidden');
      button.disabled = true;
    } else {
      btnText.classList.remove('hidden');
      btnLoading.classList.add('hidden');
      button.disabled = false;
    }
  }

  showSuccessMessage(message) {
    // Create and show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
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

  showError(message) {
    // Create and show error notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
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

  formatMoney(amount) {
    // Simple money formatting - can be enhanced based on shop currency
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}

// Initialize Quick View Modal when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new QuickViewModal();
});

// Reinitialize when new products are loaded (for AJAX pagination)
document.addEventListener('products:loaded', () => {
  new QuickViewModal();
});