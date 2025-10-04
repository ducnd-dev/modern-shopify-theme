

(function() {
  'use strict';
  const DEMO_PRESETS = {
    fashion: {
      name: "Luxe Fashion",
      colors: {
        primary: "#0ea5e9",
        accent: "#d946ef",
        background: "#ffffff",
        secondary_bg: "#f8fafc"
      },
      products: [
        {
          title: 'Premium Cotton T-Shirt',
          price: '$49.99',
          image: 'https://via.placeholder.com/400x500/0ea5e9/ffffff?text=Cotton+Tee',
          vendor: 'Luxe Basics',
          tags: ['cotton', 'casual', 'premium']
        },
        {
          title: 'Designer Denim Jacket',
          price: '$129.99',
          image: 'https://via.placeholder.com/400x500/d946ef/ffffff?text=Denim+Jacket',
          vendor: 'Urban Style',
          tags: ['denim', 'jacket', 'designer']
        },
        {
          title: 'Silk Evening Dress',
          price: '$299.99',
          image: 'https://via.placeholder.com/400x500/8b5cf6/ffffff?text=Silk+Dress',
          vendor: 'Elegant Wear',
          tags: ['silk', 'dress', 'evening']
        },
        {
          title: 'Leather Handbag',
          price: '$189.99',
          image: 'https://via.placeholder.com/400x500/f59e0b/ffffff?text=Handbag',
          vendor: 'Luxury Bags',
          tags: ['leather', 'handbag', 'luxury']
        }
      ],
      collections: [
        { name: 'New Arrivals', handle: 'new-arrivals' },
        { name: 'Best Sellers', handle: 'best-sellers' },
        { name: 'Summer Collection', handle: 'summer-collection' },
        { name: 'Designer Picks', handle: 'designer-picks' }
      ],
      testimonials: [
        {
          name: 'Sarah Johnson',
          avatar: 'https://via.placeholder.com/60x60/ec4899/ffffff?text=SJ',
          rating: 5,
          text: 'Absolutely love the quality and style! These pieces have become staples in my wardrobe.',
          product: 'Premium Cotton T-Shirt'
        },
        {
          name: 'Emily Chen',
          avatar: 'https://via.placeholder.com/60x60/3b82f6/ffffff?text=EC',
          rating: 5,
          text: 'Fast shipping and excellent customer service. The dress fits perfectly!',
          product: 'Silk Evening Dress'
        },
        {
          name: 'Jessica Williams',
          avatar: 'https://via.placeholder.com/60x60/10b981/ffffff?text=JW',
          rating: 5,
          text: 'High-quality materials and beautiful designs. Will definitely shop here again!',
          product: 'Designer Denim Jacket'
        }
      ]
    },
    electronics: {
      name: "TechHub Pro",
      colors: {
        primary: "#1f2937",
        accent: "#3b82f6",
        background: "#f9fafb",
        secondary_bg: "#f1f5f9"
      },
      products: [
        {
          title: 'Wireless Bluetooth Headphones',
          price: '$199.99',
          image: 'https://via.placeholder.com/400x400/1f2937/ffffff?text=Headphones',
          vendor: 'AudioTech',
          tags: ['wireless', 'bluetooth', 'audio']
        },
        {
          title: 'Smart Fitness Watch',
          price: '$299.99',
          image: 'https://via.placeholder.com/400x400/3b82f6/ffffff?text=Smart+Watch',
          vendor: 'FitTech',
          tags: ['smartwatch', 'fitness', 'wearable']
        },
        {
          title: 'Ultra-Fast SSD Drive',
          price: '$149.99',
          image: 'https://via.placeholder.com/400x400/6366f1/ffffff?text=SSD+Drive',
          vendor: 'StorageMax',
          tags: ['ssd', 'storage', 'performance']
        },
        {
          title: 'Gaming Mechanical Keyboard',
          price: '$179.99',
          image: 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Keyboard',
          vendor: 'GameGear',
          tags: ['gaming', 'mechanical', 'keyboard']
        }
      ],
      collections: [
        { name: 'Latest Tech', handle: 'latest-tech' },
        { name: 'Gaming Gear', handle: 'gaming-gear' },
        { name: 'Audio Devices', handle: 'audio-devices' },
        { name: 'Smart Home', handle: 'smart-home' }
      ],
      testimonials: [
        {
          name: 'Mike Rodriguez',
          avatar: 'https://via.placeholder.com/60x60/1f2937/ffffff?text=MR',
          rating: 5,
          text: 'Amazing sound quality and battery life. Best headphones I\'ve ever owned!',
          product: 'Wireless Bluetooth Headphones'
        },
        {
          name: 'David Kim',
          avatar: 'https://via.placeholder.com/60x60/3b82f6/ffffff?text=DK',
          rating: 5,
          text: 'Super fast delivery and the watch exceeded my expectations. Great value!',
          product: 'Smart Fitness Watch'
        },
        {
          name: 'Alex Thompson',
          avatar: 'https://via.placeholder.com/60x60/8b5cf6/ffffff?text=AT',
          rating: 5,
          text: 'Incredible performance boost for my computer. Installation was a breeze!',
          product: 'Ultra-Fast SSD Drive'
        }
      ]
    },
    beauty: {
      name: "Glow Beauty",
      colors: {
        primary: "#ec4899",
        accent: "#f59e0b",
        background: "#fef7f7",
        secondary_bg: "#fdf2f8"
      },
      products: [
        {
          title: 'Hydrating Face Serum',
          price: '$79.99',
          image: 'https://via.placeholder.com/400x500/ec4899/ffffff?text=Face+Serum',
          vendor: 'Glow Labs',
          tags: ['skincare', 'serum', 'hydrating']
        },
        {
          title: 'Luxury Lipstick Set',
          price: '$59.99',
          image: 'https://via.placeholder.com/400x500/f59e0b/ffffff?text=Lipstick+Set',
          vendor: 'Luxe Cosmetics',
          tags: ['makeup', 'lipstick', 'luxury']
        },
        {
          title: 'Anti-Aging Night Cream',
          price: '$129.99',
          image: 'https://via.placeholder.com/400x500/8b5cf6/ffffff?text=Night+Cream',
          vendor: 'AgeLess Beauty',
          tags: ['skincare', 'anti-aging', 'night-cream']
        },
        {
          title: 'Professional Makeup Brush Set',
          price: '$89.99',
          image: 'https://via.placeholder.com/400x500/06b6d4/ffffff?text=Brush+Set',
          vendor: 'Pro Beauty Tools',
          tags: ['makeup', 'brushes', 'professional']
        }
      ],
      collections: [
        { name: 'Skincare Essentials', handle: 'skincare-essentials' },
        { name: 'Makeup Must-Haves', handle: 'makeup-must-haves' },
        { name: 'New Launches', handle: 'new-launches' },
        { name: 'Best Sellers', handle: 'best-sellers' }
      ],
      testimonials: [
        {
          name: 'Maria Garcia',
          avatar: 'https://via.placeholder.com/60x60/ec4899/ffffff?text=MG',
          rating: 5,
          text: 'My skin has never looked better! This serum is a game-changer.',
          product: 'Hydrating Face Serum'
        },
        {
          name: 'Lisa Wang',
          avatar: 'https://via.placeholder.com/60x60/f59e0b/ffffff?text=LW',
          rating: 5,
          text: 'Beautiful colors and long-lasting formula. Love this lipstick set!',
          product: 'Luxury Lipstick Set'
        },
        {
          name: 'Anna Martinez',
          avatar: 'https://via.placeholder.com/60x60/8b5cf6/ffffff?text=AM',
          rating: 5,
          text: 'Noticed visible results after just one week. Highly recommend!',
          product: 'Anti-Aging Night Cream'
        }
      ]
    },
    minimal: {
      name: "Minimal Studio",
      colors: {
        primary: "#1f2937",
        accent: "#6b7280",
        background: "#0f172a",
        secondary_bg: "#1e293b"
      },
      products: [
        {
          title: 'Minimalist Desk Lamp',
          price: '$149.99',
          image: 'https://via.placeholder.com/400x500/1f2937/ffffff?text=Desk+Lamp',
          vendor: 'Studio Design',
          tags: ['minimal', 'lighting', 'desk']
        },
        {
          title: 'Ceramic Coffee Mug',
          price: '$29.99',
          image: 'https://via.placeholder.com/400x500/6b7280/ffffff?text=Coffee+Mug',
          vendor: 'Minimal Home',
          tags: ['ceramic', 'coffee', 'minimal']
        },
        {
          title: 'Wooden Storage Box',
          price: '$79.99',
          image: 'https://via.placeholder.com/400x500/374151/ffffff?text=Storage+Box',
          vendor: 'Wood Craft',
          tags: ['wooden', 'storage', 'organizer']
        },
        {
          title: 'Stainless Steel Water Bottle',
          price: '$39.99',
          image: 'https://via.placeholder.com/400x500/9ca3af/ffffff?text=Water+Bottle',
          vendor: 'Eco Living',
          tags: ['stainless-steel', 'water-bottle', 'eco']
        }
      ],
      collections: [
        { name: 'Essential Items', handle: 'essential-items' },
        { name: 'Home & Office', handle: 'home-office' },
        { name: 'Sustainable Living', handle: 'sustainable-living' },
        { name: 'Designer Picks', handle: 'designer-picks' }
      ],
      testimonials: [
        {
          name: 'John Anderson',
          avatar: 'https://via.placeholder.com/60x60/1f2937/ffffff?text=JA',
          rating: 5,
          text: 'Perfect lighting for my workspace. Clean design and excellent build quality.',
          product: 'Minimalist Desk Lamp'
        },
        {
          name: 'Sophie Brown',
          avatar: 'https://via.placeholder.com/60x60/6b7280/ffffff?text=SB',
          rating: 5,
          text: 'Beautiful craftsmanship and perfect size. Love the minimalist aesthetic.',
          product: 'Ceramic Coffee Mug'
        },
        {
          name: 'Robert Lee',
          avatar: 'https://via.placeholder.com/60x60/374151/ffffff?text=RL',
          rating: 5,
          text: 'Great quality storage solution. Helps keep my desk organized and clutter-free.',
          product: 'Wooden Storage Box'
        }
      ]
    }
  };

  class DemoSetup {
    constructor() {
      this.currentPreset = this.getCurrentPreset();
      this.demoData = this.getDemoData();
      this.init();
    }

    init() {
      console.log(`🚀 Initializing ${this.demoData.name} demo store setup...`);
      this.applyPresetStyles();
      this.setupDemoContent();
      this.setupTestimonials();
      this.setupReviews();
      this.setupSocialProof();
      this.bindPresetSelector();
      this.showPresetInfo();
      console.log('✅ Demo setup completed successfully!');
    }

    getCurrentPreset() {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPreset = urlParams.get('demo');

      if (urlPreset && DEMO_PRESETS[urlPreset]) {
        return urlPreset;
      }
      const themeSettings = window.theme?.settings || window.themeSettings;
      if (themeSettings?.demo_store_type && DEMO_PRESETS[themeSettings.demo_store_type]) {
        return themeSettings.demo_store_type;
      }
      return 'fashion';
    }

    getDemoData() {
      return DEMO_PRESETS[this.currentPreset] || DEMO_PRESETS.fashion;
    }

    setupDemoContent() {
      console.log('📦 Setting up demo products and collections...');
      document.title = `${this.demoData.name} - Premium Shopify Store`;
      const logoText = document.querySelector('.header__logo-text, .logo__text, .site-nav__logo');
      if (logoText && !logoText.querySelector('img')) {
        logoText.textContent = this.demoData.name;
      }
      this.setupProductGrids();
      this.setupCollections();
      this.setupBlogPosts();
    }

    setupProductGrids() {
      const productGrids = document.querySelectorAll('[data-demo-products], .product-grid, .products-grid');

      productGrids.forEach(grid => {
        const productsHtml = this.demoData.products.map(product => `
          <div class="product-card group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
            <div class="product-card__image-wrapper relative overflow-hidden rounded-t-lg">
              <img
                src="${product.image}"
                alt="${product.title}"
                class="product-card__image w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              >
              <div class="product-card__badges absolute top-2 left-2">
                <span class="badge badge--new bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                  New
                </span>
              </div>
              <div class="product-card__actions absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button class="btn btn--icon btn--quick-view bg-white shadow-md hover:bg-gray-50"
                        data-product-title="${product.title}"
                        aria-label="Quick view ${product.title}">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div class="product-card__content p-4">
              <div class="product-card__vendor text-sm text-gray-500 mb-1">${product.vendor}</div>
              <h3 class="product-card__title font-medium text-gray-900 mb-2 line-clamp-2">${product.title}</h3>
              <div class="product-card__price text-lg font-semibold text-primary">${product.price}</div>
              <div class="product-card__tags mt-2 flex flex-wrap gap-1">
                ${product.tags.map(tag => `<span class="tag text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">${tag}</span>`).join('')}
              </div>
              <button class="product-card__add-to-cart btn btn--primary w-full mt-3">
                Add to Cart
              </button>
            </div>
          </div>
        `).join('');

        grid.innerHTML = productsHtml;
      });
    }

    setupCollections() {
      const collectionLists = document.querySelectorAll('[data-demo-collections], .collections-grid');

      collectionLists.forEach(list => {
        const collectionsHtml = this.demoData.collections.map(collection => `
          <div class="collection-card bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <div class="collection-card__image-wrapper relative h-48">
              <img
                src="https://via.placeholder.com/400x300/${this.demoData.colors.primary.slice(1)}/ffffff?text=${collection.name.replace(' ', '+')}"
                alt="${collection.name}"
                class="w-full h-full object-cover"
                loading="lazy"
              >
              <div class="collection-card__overlay absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <h3 class="collection-card__title text-white text-xl font-semibold text-center">${collection.name}</h3>
              </div>
            </div>
            <div class="collection-card__content p-4">
              <p class="text-gray-600 text-sm mb-3">Discover our curated ${collection.name.toLowerCase()} selection</p>
              <a href="/collections/${collection.handle}" class="btn btn--outline btn--small">
                Shop Collection
              </a>
            </div>
          </div>
        `).join('');

        list.innerHTML = collectionsHtml;
      });
    }

    setupBlogPosts() {
      const blogData = {
        fashion: [
          { title: 'Summer Fashion Trends 2024', excerpt: 'Discover the hottest trends this season...' },
          { title: 'How to Style Your Wardrobe', excerpt: 'Expert tips for creating versatile looks...' },
          { title: 'Sustainable Fashion Guide', excerpt: 'Make eco-conscious fashion choices...' }
        ],
        electronics: [
          { title: 'Latest Tech Innovations', excerpt: 'Explore cutting-edge technology trends...' },
          { title: 'Gaming Setup Guide', excerpt: 'Build the perfect gaming workstation...' },
          { title: 'Smart Home Automation', excerpt: 'Transform your home with smart devices...' }
        ],
        beauty: [
          { title: 'Skincare Routine for Glowing Skin', excerpt: 'Achieve radiant skin with these tips...' },
          { title: 'Makeup Trends This Season', excerpt: 'Latest beauty looks and techniques...' },
          { title: 'Natural Beauty Secrets', excerpt: 'Discover organic skincare solutions...' }
        ],
        minimal: [
          { title: 'Minimalist Living Guide', excerpt: 'Simplify your life with minimal design...' },
          { title: 'Choosing Quality Over Quantity', excerpt: 'Investment pieces that last...' },
          { title: 'Creating Calm Spaces', excerpt: 'Design principles for peaceful homes...' }
        ]
      };

      const posts = blogData[this.currentPreset] || blogData.fashion;
      const blogSections = document.querySelectorAll('[data-demo-blog], .blog-grid');

      blogSections.forEach(section => {
        const postsHtml = posts.map(post => `
          <article class="blog-post bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <div class="blog-post__image-wrapper h-48">
              <img
                src="https://via.placeholder.com/400x200/${this.demoData.colors.primary.slice(1)}/ffffff?text=Blog+Post"
                alt="${post.title}"
                class="w-full h-full object-cover"
                loading="lazy"
              >
            </div>
            <div class="blog-post__content p-4">
              <h3 class="blog-post__title font-semibold text-gray-900 mb-2">${post.title}</h3>
              <p class="blog-post__excerpt text-gray-600 text-sm mb-3">${post.excerpt}</p>
              <a href="#" class="blog-post__link text-primary hover:text-primary-dark text-sm font-medium">
                Read More →
              </a>
            </div>
          </article>
        `).join('');

        section.innerHTML = postsHtml;
      });
    }

    setupTestimonials() {
      console.log('💬 Setting up customer testimonials...');

      const testimonialSections = document.querySelectorAll('[data-demo-testimonials], .testimonials-grid');

      testimonialSections.forEach(section => {
        const testimonialsHtml = this.demoData.testimonials.map(testimonial => `
          <div class="testimonial bg-white p-6 rounded-lg shadow-sm">
            <div class="testimonial__rating mb-3">
              ${Array(testimonial.rating).fill().map(() => '⭐').join('')}
            </div>
            <blockquote class="testimonial__text text-gray-700 mb-4 italic">
              "${testimonial.text}"
            </blockquote>
            <div class="testimonial__author flex items-center">
              <img src="${testimonial.avatar}" alt="${testimonial.name}" class="w-10 h-10 rounded-full mr-3">
              <div>
                <div class="testimonial__name font-medium text-gray-900">${testimonial.name}</div>
                <div class="testimonial__product text-sm text-gray-500">Purchased: ${testimonial.product}</div>
              </div>
            </div>
          </div>
        `).join('');

        section.innerHTML = testimonialsHtml;
      });
    }

    setupReviews() {
      console.log('⭐ Setting up customer reviews...');

      const reviews = Array.from({length: 12}, (_, i) => ({
        id: i + 1,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        name: ['Alex', 'Jamie', 'Sam', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Phoenix'][i],
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        text: [
          'Great quality and fast shipping!',
          'Exactly as described, very happy with my purchase.',
          'Excellent customer service and product quality.',
          'Would definitely recommend to others.',
          'Perfect fit and beautiful design.',
          'Outstanding value for the price.',
          'Exceeded my expectations in every way.',
          'Will definitely be ordering again soon.',
          'Professional packaging and quick delivery.',
          'Amazing attention to detail.',
          'Fantastic product, highly satisfied.',
          'Best purchase I\'ve made this year!'
        ][i],
        helpful: Math.floor(Math.random() * 20) + 1,
        verified: Math.random() > 0.2 // 80% verified
      }));

      const reviewSections = document.querySelectorAll('[data-demo-reviews], .reviews-grid');

      reviewSections.forEach(section => {
        const reviewsHtml = reviews.map(review => `
          <div class="review bg-white p-4 rounded-lg border border-gray-200">
            <div class="review__header flex items-center justify-between mb-2">
              <div class="review__rating">
                ${Array(review.rating).fill().map(() => '⭐').join('')}
              </div>
              <div class="review__date text-sm text-gray-500">${review.date}</div>
            </div>
            <div class="review__author flex items-center mb-2">
              <div class="review__avatar w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium mr-2">
                ${review.name.charAt(0)}
              </div>
              <div class="review__name font-medium text-gray-900">${review.name}</div>
              ${review.verified ? '<span class="review__verified ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified</span>' : ''}
            </div>
            <p class="review__text text-gray-700 mb-3">${review.text}</p>
            <div class="review__actions flex items-center text-sm text-gray-500">
              <button class="review__helpful hover:text-primary">
                👍 Helpful (${review.helpful})
              </button>
            </div>
          </div>
        `).join('');

        section.innerHTML = reviewsHtml;
      });
    }

    setupSocialProof() {
      console.log('📱 Setting up social proof notifications...');

      const notifications = [
        { name: 'Someone in New York', product: this.demoData.products[0].title, time: '2 minutes ago' },
        { name: 'Someone in California', product: this.demoData.products[1].title, time: '5 minutes ago' },
        { name: 'Someone in Texas', product: this.demoData.products[2].title, time: '8 minutes ago' },
        { name: 'Someone in Florida', product: this.demoData.products[3].title, time: '12 minutes ago' }
      ];
      if (!document.querySelector('.social-proof-container')) {
        const container = document.createElement('div');
        container.className = 'social-proof-container fixed bottom-4 left-4 z-50';
        document.body.appendChild(container);

        let currentIndex = 0;
        const showNotification = () => {
          const notification = notifications[currentIndex];
          const notificationEl = document.createElement('div');
          notificationEl.className = 'social-proof-notification bg-white shadow-lg rounded-lg p-4 mb-2 transform translate-x-full transition-transform duration-300 max-w-sm';
          notificationEl.innerHTML = `
            <div class="flex items-center">
              <div class="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <div class="text-sm">
                <div class="font-medium text-gray-900">${notification.name}</div>
                <div class="text-gray-600">purchased "${notification.product}"</div>
                <div class="text-xs text-gray-500 mt-1">${notification.time}</div>
              </div>
            </div>
          `;

          container.appendChild(notificationEl);
          setTimeout(() => {
            notificationEl.style.transform = 'translateX(0)';
          }, 100);
          setTimeout(() => {
            notificationEl.style.transform = 'translateX(-100%)';
            setTimeout(() => {
              if (notificationEl.parentNode) {
                notificationEl.parentNode.removeChild(notificationEl);
              }
            }, 300);
          }, 4000);

          currentIndex = (currentIndex + 1) % notifications.length;
        };
        setTimeout(showNotification, 3000);
        setInterval(showNotification, 15000);
      }
    }

    applyPresetStyles() {
      if (this.currentPreset === 'custom') return;

      const preset = this.demoData;
      if (!preset) return;
      const root = document.documentElement;

      Object.entries(preset.colors).forEach(([key, value]) => {
        const cssVar = `--color-${key.replace('_', '-')}`;
        root.style.setProperty(cssVar, value);
      });
      document.body.classList.add(`demo-${this.currentPreset}`);

      console.log(`🎨 Applied ${preset.name} demo preset styles`);
    }

    bindPresetSelector() {
      if (!document.querySelector('.demo-preset-selector')) {
        this.createPresetSelector();
      }
      const selector = document.querySelector('.demo-preset-selector select');
      if (selector) {
        selector.value = this.currentPreset;
        selector.addEventListener('change', (e) => {
          this.switchPreset(e.target.value);
        });
      }
    }

    createPresetSelector() {
      const selector = document.createElement('div');
      selector.className = 'demo-preset-selector fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border dark:border-gray-700';
      selector.innerHTML = `
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Demo Theme:
        </label>
        <select class="form-select text-sm border border-gray-300 rounded px-3 py-1">
          <option value="custom">Custom</option>
          ${Object.entries(DEMO_PRESETS).map(([key, preset]) =>
            `<option value="${key}">${preset.name}</option>`
          ).join('')}
        </select>
        <p class="text-xs text-gray-500 mt-2">Preview different store styles</p>
      `;

      document.body.appendChild(selector);
    }

    switchPreset(presetKey) {
      if (presetKey === this.currentPreset) return;
      const url = new URL(window.location);
      if (presetKey === 'custom') {
        url.searchParams.delete('demo');
      } else {
        url.searchParams.set('demo', presetKey);
      }
      window.history.replaceState({}, '', url);
      window.location.reload();
    }

    showPresetInfo() {
      if (this.currentPreset === 'custom') return;

      const preset = this.demoData;
      if (!preset) return;
      const notification = document.createElement('div');
      notification.className = 'demo-notification fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
      notification.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-medium">Demo Mode</h4>
            <p class="text-sm opacity-90">${preset.name} theme active</p>
          </div>
          <button type="button" class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      `;

      document.body.appendChild(notification);
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 5000);
    }
    static getPresetData(presetKey) {
      return DEMO_PRESETS[presetKey] || null;
    }

    static getAllPresets() {
      return Object.keys(DEMO_PRESETS);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new DemoSetup());
  } else {
    new DemoSetup();
  }
  window.DemoSetup = DemoSetup;

})();