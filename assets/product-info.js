class ProductInfo extends HTMLElement {
  constructor() {
    super();
    this.quantityInput = this.querySelector('.quantity__input');
    this.quantityForm = this.querySelector('.product-form__quantity');
    this.onVariantChangeUnsubscriber = undefined;
    this.cartUpdateUnsubscriber = undefined;

    if (!this.quantityInput) return;
    this.setQuantityBoundries();
    if (!this.dataset.originalSection) {
      this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, this.fetchQuantityRules.bind(this));
    }
  }

  connectedCallback() {
    this.initializeProductSwatches();
    this.initializeProductOptions();
    this.initializeProductGallery();
    this.initializeProductAccordions();
  }

  disconnectedCallback() {
    if (this.onVariantChangeUnsubscriber) {
      this.onVariantChangeUnsubscriber();
    }
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  initializeProductSwatches() {
    const swatches = this.querySelectorAll('.product-form__input input[type="radio"]');
    swatches.forEach((swatch) => {
      swatch.addEventListener('change', this.onSwatchChange.bind(this));
    });
  }

  initializeProductOptions() {
    const selects = this.querySelectorAll('.product-form__input select');
    selects.forEach((select) => {
      select.addEventListener('change', this.onSelectChange.bind(this));
    });
  }

  initializeProductGallery() {
    const thumbnails = this.querySelectorAll('.product__media-toggle');
    const mainImages = this.querySelectorAll('.product__media img');
    
    thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchMainImage(index);
      });
    });

    // Initialize zoom functionality
    this.initializeImageZoom();
  }

  initializeImageZoom() {
    const mainImages = this.querySelectorAll('.product__media img');
    mainImages.forEach((img) => {
      img.addEventListener('click', this.openImageModal.bind(this));
    });
  }

  initializeProductAccordions() {
    const accordions = this.querySelectorAll('.product-accordion');
    accordions.forEach((accordion) => {
      const header = accordion.querySelector('.product-accordion__header');
      const content = accordion.querySelector('.product-accordion__content');
      
      header.addEventListener('click', () => {
        const isOpen = accordion.classList.contains('is-open');
        
        // Close all other accordions
        accordions.forEach((otherAccordion) => {
          if (otherAccordion !== accordion) {
            otherAccordion.classList.remove('is-open');
          }
        });
        
        // Toggle current accordion
        accordion.classList.toggle('is-open', !isOpen);
      });
    });
  }

  onSwatchChange(event) {
    const swatch = event.target;
    const optionIndex = swatch.dataset.optionIndex;
    const value = swatch.value;
    
    this.updateVariantSelection(optionIndex, value);
    this.updateProductUrl();
    this.updateProductPrice();
    this.updateProductImages();
    this.updateProductAvailability();
  }

  onSelectChange(event) {
    const select = event.target;
    const optionIndex = select.dataset.optionIndex;
    const value = select.value;
    
    this.updateVariantSelection(optionIndex, value);
    this.updateProductUrl();
    this.updateProductPrice();
    this.updateProductImages();
    this.updateProductAvailability();
  }

  updateVariantSelection(optionIndex, value) {
    // Update the selected options array
    this.selectedOptions = this.selectedOptions || [];
    this.selectedOptions[optionIndex] = value;
    
    // Find the matching variant
    const productData = this.getProductData();
    this.currentVariant = productData.variants.find(variant => {
      return variant.options.every((option, index) => {
        return this.selectedOptions[index] === option;
      });
    });
  }

  updateProductUrl() {
    if (!this.currentVariant || !window.history.replaceState) return;
    
    const url = new URL(window.location);
    if (this.currentVariant) {
      url.searchParams.set('variant', this.currentVariant.id);
    } else {
      url.searchParams.delete('variant');
    }
    window.history.replaceState({}, '', url);
  }

  updateProductPrice() {
    const priceElement = this.querySelector('.price');
    if (!priceElement || !this.currentVariant) return;

    fetch(`${window.location.pathname}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`)
      .then(response => response.text())
      .then(responseText => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const newPrice = html.querySelector('.price');
        if (newPrice) {
          priceElement.innerHTML = newPrice.innerHTML;
        }
      })
      .catch(error => console.error('Error updating price:', error));
  }

  updateProductImages() {
    if (!this.currentVariant || !this.currentVariant.featured_media) return;
    
    const mainImage = this.querySelector('.product__media img');
    const thumbnails = this.querySelectorAll('.product__media-toggle');
    
    // Update main image
    if (mainImage && this.currentVariant.featured_media.preview_image) {
      const newImage = this.currentVariant.featured_media.preview_image;
      mainImage.src = newImage.src;
      mainImage.alt = newImage.alt || this.currentVariant.name;
    }
    
    // Update active thumbnail
    thumbnails.forEach((thumbnail, index) => {
      thumbnail.classList.remove('is-active');
      if (thumbnail.dataset.mediaId === this.currentVariant.featured_media.id) {
        thumbnail.classList.add('is-active');
      }
    });
  }

  updateProductAvailability() {
    const addToCartButton = this.querySelector('button[name="add"]');
    const addToCartText = addToCartButton?.querySelector('span');
    const priceElement = this.querySelector('.price');
    
    if (!addToCartButton || !addToCartText) return;
    
    if (!this.currentVariant) {
      addToCartButton.disabled = true;
      addToCartText.textContent = window.variantStrings.unavailable;
      priceElement?.classList.add('visibility-hidden');
    } else if (!this.currentVariant.available) {
      addToCartButton.disabled = true;
      addToCartText.textContent = window.variantStrings.soldOut;
      priceElement?.classList.remove('visibility-hidden');
    } else {
      addToCartButton.disabled = false;
      addToCartText.textContent = window.variantStrings.addToCart;
      priceElement?.classList.remove('visibility-hidden');
    }
  }

  switchMainImage(index) {
    const mainImages = this.querySelectorAll('.product__media img');
    const thumbnails = this.querySelectorAll('.product__media-toggle');
    
    // Hide all main images
    mainImages.forEach((img, imgIndex) => {
      img.style.display = imgIndex === index ? 'block' : 'none';
    });
    
    // Update active thumbnail
    thumbnails.forEach((thumbnail, thumbIndex) => {
      thumbnail.classList.toggle('is-active', thumbIndex === index);
    });
  }

  openImageModal(event) {
    const img = event.target;
    const modal = this.createImageModal(img);
    document.body.appendChild(modal);
    
    // Close modal on click outside or escape key
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeImageModal(modal);
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeImageModal(modal);
      }
    });
  }

  createImageModal(img) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
      <div class="image-modal__content">
        <button class="image-modal__close" aria-label="Close">&times;</button>
        <img src="${img.src}" alt="${img.alt}" class="image-modal__image">
      </div>
    `;
    
    const closeButton = modal.querySelector('.image-modal__close');
    closeButton.addEventListener('click', () => this.closeImageModal(modal));
    
    return modal;
  }

  closeImageModal(modal) {
    modal.remove();
  }

  setQuantityBoundries() {
    if (!this.quantityInput) return;
    
    const data = {
      cartQuantity: this.quantityInput.dataset.cartQuantity ? parseInt(this.quantityInput.dataset.cartQuantity) : 0,
      min: this.quantityInput.dataset.min ? parseInt(this.quantityInput.dataset.min) : 1,
      max: this.quantityInput.dataset.max ? parseInt(this.quantityInput.dataset.max) : null,
      step: this.quantityInput.dataset.step ? parseInt(this.quantityInput.dataset.step) : 1,
    };

    let min = data.min;
    const max = data.max === null ? data.max : data.max - data.cartQuantity;
    if (max !== null) min = Math.min(min, max);
    if (data.cartQuantity >= data.min) min = Math.min(min, data.step);

    this.quantityInput.min = min;
    this.quantityInput.max = max;
    this.quantityInput.step = data.step;
    this.quantityInput.value = min;
  }

  fetchQuantityRules() {
    const currentVariantId = this.querySelector('.product-variant-id')?.value;
    if (!currentVariantId) return;

    const loadingOverlay = this.querySelector('.quantity__rules-cart .loading-overlay');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    fetch(`${this.dataset.url}?variant=${currentVariantId}&section_id=${this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        this.setQuantityRules(html);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
      });
  }

  setQuantityRules(html) {
    const quantityRulesCart = this.querySelector('.quantity__rules-cart');
    const quantityRulesCartSource = html.querySelector('.quantity__rules-cart');

    if (quantityRulesCart && quantityRulesCartSource) {
      quantityRulesCart.innerHTML = quantityRulesCartSource.innerHTML;
    }

    const quantityInputSource = html.querySelector('.quantity__input');
    if (this.quantityInput && quantityInputSource) {
      this.quantityInput.dataset.cartQuantity = quantityInputSource.dataset.cartQuantity;
      this.quantityInput.dataset.min = quantityInputSource.dataset.min;
      this.quantityInput.dataset.max = quantityInputSource.dataset.max;
      this.quantityInput.dataset.step = quantityInputSource.dataset.step;
      this.setQuantityBoundries();
    }
  }

  getProductData() {
    return JSON.parse(this.querySelector('[type="application/json"]')?.textContent || '{}');
  }
}

if (!customElements.get('product-info')) {
  customElements.define('product-info', ProductInfo);
}

// Default variant strings for internationalization
window.variantStrings = window.variantStrings || {
  addToCart: 'Add to cart',
  soldOut: 'Sold out',
  unavailable: 'Unavailable'
};

// Default PubSub events
window.PUB_SUB_EVENTS = window.PUB_SUB_EVENTS || {
  cartUpdate: 'cart-update',
  quantityUpdate: 'quantity-update'
};

// Default subscribe function if not already defined
if (typeof subscribe === 'undefined') {
  let subscribers = {};

  window.subscribe = function(eventName, callback) {
    if (subscribers[eventName] === undefined) {
      subscribers[eventName] = [];
    }
    subscribers[eventName].push(callback);

    return function unsubscribe() {
      subscribers[eventName] = subscribers[eventName].filter((cb) => {
        return cb !== callback;
      });
    };
  };
}