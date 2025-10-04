class ProductForm extends HTMLElement {
  constructor() {
    super();

    this.form = this.querySelector('form');
    this.form.querySelector('[name=id]').disabled = false;
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
    this.submitButton = this.querySelector('[type="submit"]');
    if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');
  }

  onSubmitHandler(evt) {
    evt.preventDefault();
    if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

    this.handleErrorMessage();

    this.submitButton.setAttribute('aria-disabled', true);
    this.submitButton.classList.add('loading');
    this.querySelector('.loading-overlay__spinner').classList.remove('hidden');

    const config = fetchConfig('javascript');
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    delete config.headers['Content-Type'];

    const formData = new FormData(this.form);
    if (this.cart) {
      formData.append('sections', this.cart.getSectionsToRender().map((section) => section.id));
      formData.append('sections_url', window.location.pathname);
      config.body = formData;
    }

    fetch(`${routes.cart_add_url}`, config)
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          this.handleErrorMessage(response.description);

          const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
          if (!soldOutMessage) return;
          soldOutMessage.classList.remove('hidden');
          this.submitButton.setAttribute('aria-disabled', true);
          this.submitButton.querySelector('span').classList.add('hidden');
        } else if (!this.cart) {
          window.location = window.routes.cart_url;
          return;
        } else {
          this.handleErrorMessage();
          this.cart.renderContents(response);
        }
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        this.submitButton.classList.remove('loading');
        if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
        if (!this.submitButton.getAttribute('aria-disabled')) this.submitButton.removeAttribute('aria-disabled');
        this.querySelector('.loading-overlay__spinner').classList.add('hidden');
      });
  }

  handleErrorMessage(errorMessage = false) {
    this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
    if (!this.errorMessageWrapper) return;
    this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

    this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

    if (errorMessage) {
      this.errorMessage.textContent = errorMessage;
    }
  }
}

customElements.define('product-form', ProductForm);

if (!customElements.get('product-info')) {
  customElements.define('product-info', class ProductInfo extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector('.quantity__input');
      this.currentVariant = this.querySelector('.product-variant-id');
      this.submitButton = this.querySelector('[type="submit"]');
      this.submitButtonText = this.querySelector('[type="submit"] > span');
    }

    cartUpdateUnsubscriber = undefined;

    connectedCallback() {
      if (!this.input) return;
      this.quantityForm = this.querySelector('.product-form__quantity');
      if (!this.quantityForm) return;
      this.setQuantityBoundries();
      if (!this.dataset.originalSection) {
        this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, this.fetchQuantityRules.bind(this));
      }
    }

    disconnectedCallback() {
      if (this.cartUpdateUnsubscriber) {
        this.cartUpdateUnsubscriber();
      }
    }

    setQuantityBoundries() {
      const data = {
        cartQuantity: this.input.dataset.cartQuantity ? parseInt(this.input.dataset.cartQuantity) : 0,
        min: this.input.dataset.min ? parseInt(this.input.dataset.min) : 1,
        max: this.input.dataset.max ? parseInt(this.input.dataset.max) : null,
        step: this.input.dataset.step ? parseInt(this.input.dataset.step) : 1,
      };

      let min = data.min;
      const max = data.max === null ? data.max : data.max - data.cartQuantity;
      if (max !== null) min = Math.min(min, max);
      if (data.cartQuantity >= data.min) min = Math.min(min, data.step);

      this.input.min = min;
      this.input.max = max;
      this.input.step = data.step;
      this.input.value = min;

      publish(PUB_SUB_EVENTS.quantityUpdate, undefined);
    }

    fetchQuantityRules() {
      const currentVariantId = this.currentVariant ? this.currentVariant.value : null;
      if (!currentVariantId) return;

      this.querySelector('.quantity__rules-cart .loading-overlay').classList.remove('hidden');
      fetch(`${this.dataset.url}?variant=${currentVariantId}&section_id=${this.dataset.section}`)
        .then((response) => {
          return response.text();
        })
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          this.setQuantityRules(html);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.querySelector('.quantity__rules-cart .loading-overlay').classList.add('hidden');
        });
    }

    setQuantityRules(html) {
      const quantityRulesCart = this.querySelector('.quantity__rules-cart');
      const quantityRulesCartSource = html.querySelector('.quantity__rules-cart');

      if (quantityRulesCart && quantityRulesCartSource) {
        quantityRulesCart.innerHTML = quantityRulesCartSource.innerHTML;
      }

      const quantityInput = this.querySelector('.quantity__input');
      const quantityInputSource = html.querySelector('.quantity__input');

      if (quantityInput && quantityInputSource) {
        quantityInput.dataset.cartQuantity = quantityInputSource.dataset.cartQuantity;
        quantityInput.dataset.min = quantityInputSource.dataset.min;
        quantityInput.dataset.max = quantityInputSource.dataset.max;
        quantityInput.dataset.step = quantityInputSource.dataset.step;
        this.setQuantityBoundries();
      }
    }
  });
}

// Quantity Input functionality
class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });

    this.querySelectorAll('button').forEach((button) =>
      button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

// Utility functions
function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: `application/${type}` },
  };
}

// Routes configuration
window.routes = window.routes || {};
window.routes.cart_add_url = window.routes.cart_add_url || '/cart/add';
window.routes.cart_url = window.routes.cart_url || '/cart';

// PubSub system for cart updates
const PUB_SUB_EVENTS = {
  cartUpdate: 'cart-update',
  quantityUpdate: 'quantity-update',
};

let subscribers = {};

function subscribe(eventName, callback) {
  if (subscribers[eventName] === undefined) {
    subscribers[eventName] = [];
  }
  subscribers[eventName].push(callback);

  return function unsubscribe() {
    subscribers[eventName] = subscribers[eventName].filter((cb) => {
      return cb !== callback;
    });
  };
}

function publish(eventName, data) {
  if (subscribers[eventName]) {
    subscribers[eventName].forEach((callback) => {
      callback(data);
    });
  }
}