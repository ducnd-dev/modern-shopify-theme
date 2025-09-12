# Modern Shopify Theme with TailwindCSS

A comprehensive, modern Shopify theme built with TailwindCSS, featuring responsive design, dark mode support, and extensive customization options.

## 🚀 Features

### Design & UI
- **Modern TailwindCSS Design** - Utility-first CSS framework
- **Responsive Layout** - Mobile-first design that works on all devices
- **Dark Mode Support** - Automatic and manual dark mode switching
- **4 Demo Presets** - Fashion, Electronics, Beauty, and Dark Minimal styles
- **Accessibility First** - WCAG compliant with keyboard navigation support
- **Animation System** - Smooth animations with reduced motion support

### E-commerce Features
- **Cart Drawer** - Slide-out cart with quantity controls and shipping progress
- **Product Quick Add** - Add products to cart without leaving the page
- **Advanced Search** - Predictive search with product suggestions
- **Color Swatches** - Visual color options for products
- **Product Filtering** - Advanced filtering and sorting capabilities
- **Mega Menu** - Rich navigation with product previews
- **Newsletter Integration** - Built-in newsletter signup forms

### Performance & SEO
- **Lazy Loading** - Images load on-demand for better performance
- **Critical CSS** - Inline critical styles for faster loading
- **Font Optimization** - Preload custom fonts with font-display: swap
- **SEO Optimized** - Structured data and semantic markup
- **Progressive Enhancement** - Works without JavaScript

### Customization
- **Theme Settings** - Extensive customization through Shopify admin
- **Color System** - Full color palette customization
- **Typography Control** - Font selection and sizing options
- **Layout Options** - Flexible grid and spacing controls
- **Component Variations** - Multiple styles for buttons, cards, and layouts

## 📁 Project Structure

```
modern-shopify-theme/
├── assets/
│   ├── theme.css.liquid      # Compiled TailwindCSS with Liquid variables
│   ├── theme.js              # Main JavaScript functionality
│   └── demo-setup.js         # Demo configuration manager
├── config/
│   ├── settings_schema.json  # Theme customization settings
│   └── demo-presets.json     # Pre-configured theme styles
├── docs/
│   └── DEMO_GUIDE.md         # Demo configuration guide
├── layout/
│   └── theme.liquid          # Main layout template
├── sections/
│   ├── hero.liquid           # Hero/banner section
│   ├── product-grid.liquid   # Product grid display
│   ├── product-carousel.liquid # Product carousel
│   ├── collection-showcase.liquid # Collection display
│   ├── newsletter.liquid     # Newsletter signup
│   ├── header.liquid         # Site header and navigation
│   ├── footer.liquid         # Site footer
│   └── announcement-bar.liquid # Promotional announcements
├── snippets/
│   ├── cart-drawer.liquid    # Shopping cart drawer
│   └── product-card.liquid   # Reusable product card
├── templates/
│   ├── index.liquid          # Homepage template
│   ├── product.liquid        # Product page template
│   ├── collection.liquid     # Collection page template
│   └── cart.liquid           # Cart page template
├── tailwind.config.js        # TailwindCSS configuration
├── package.json              # Build dependencies
└── README.md                 # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Shopify CLI (optional but recommended)

### Quick Start

1. **Clone or download the theme files**
   ```bash
   # Upload theme files to your Shopify store
   # OR use Shopify CLI:
   shopify theme push
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build TailwindCSS** (if making customizations)
   ```bash
   npm run build
   # OR for development with watch mode:
   npm run dev
   ```

4. **Activate the theme**
   - Go to Online Store > Themes in your Shopify admin
   - Find "Modern TailwindCSS Theme" and click "Publish"

### Development Setup

```bash
# Watch for changes and rebuild automatically
npm run dev

# Build for production
npm run build

# Preview theme locally (requires Shopify CLI)
shopify theme dev
```

## 🎨 Demo Presets

Choose from 4 pre-configured styles:

### 1. Fashion Store
- **Style**: Elegant and sophisticated
- **Colors**: Black and gold theme
- **Features**: Large hero sections, vendor display, minimal product cards

### 2. Electronics Store
- **Style**: Modern and tech-focused
- **Colors**: Blue and cyan theme
- **Features**: Fast animations, product specifications, performance optimized

### 3. Beauty Store
- **Style**: Soft and luxurious
- **Colors**: Pink and orange theme
- **Features**: Color swatches, soft animations, newsletter popup

### 4. Dark Minimal Store
- **Style**: Clean and minimalist
- **Colors**: Dark theme with white text
- **Features**: Large spacing, minimal UI elements, premium feel

### Applying Demo Presets

**Method 1**: Theme Settings
1. Go to `Online Store > Themes > Customize`
2. Navigate to `Theme Settings > Demo Configurations`
3. Select your preferred preset
4. Click `Save`

**Method 2**: URL Parameter (Preview)
Add `?demo=preset_name` to any URL:
- `?demo=fashion`
- `?demo=electronics`
- `?demo=beauty`
- `?demo=minimal`

## ⚙️ Customization

### Theme Settings

Access comprehensive customization options through `Online Store > Themes > Customize`:

- **Colors**: Primary, accent, and background colors
- **Typography**: Font selection and sizing
- **Layout**: Page width, spacing, grid columns
- **Buttons**: Style, size, and shadow options
- **Animations**: Speed and motion preferences
- **Features**: Cart type, search settings, product display options

### Custom CSS

Add custom styles in `assets/theme.css.liquid`:

```css
/* Custom styles */
.my-custom-class {
  @apply bg-blue-500 text-white p-4 rounded-lg;
}
```

### Custom JavaScript

Add functionality in `assets/theme.js`:

```javascript
// Custom theme functionality
class MyCustomFeature {
  constructor() {
    this.init();
  }
  
  init() {
    // Your custom code here
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new MyCustomFeature();
});
```

## 🎯 Key Components

### Header & Navigation
- Sticky navigation with scroll effects
- Mega menu with product previews
- Mobile-optimized hamburger menu
- Search modal with predictive results
- Dark mode toggle

### Product Display
- Responsive product grids
- Product carousels with touch support
- Quick add functionality
- Color swatch options
- Hover effects and animations

### Shopping Cart
- Slide-out cart drawer
- Quantity controls
- Shipping progress indicator
- Cart notes support
- Free shipping calculator

### Forms & Interactions
- Newsletter signup with validation
- Contact forms with AJAX submission
- Search functionality
- Filter and sort options

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### Mobile Features
- Touch-friendly navigation
- Swipe gestures for carousels
- Optimized image sizes
- Simplified layouts

## ♿ Accessibility

### Features Included
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader optimization
- Focus management
- Alt text for images
- Semantic HTML structure
- Color contrast compliance

### Skip Links
- Skip to main content
- Skip navigation
- Skip to search

## 🚀 Performance

### Optimization Features
- Lazy loading for images
- Critical CSS inlining option
- Font preloading
- Minified assets
- Efficient animations
- Reduced JavaScript payload

### Core Web Vitals
- Optimized for LCP (Largest Contentful Paint)
- Minimal CLS (Cumulative Layout Shift)
- Fast FID (First Input Delay)

## 🔧 Build Process

### NPM Scripts

```bash
# Development with watch mode
npm run dev

# Production build
npm run build

# Build TailwindCSS only
npm run build:css

# Watch TailwindCSS changes
npm run watch:css

# Lint code
npm run lint

# Format code
npm run format
```

### TailwindCSS Configuration

The theme uses a custom TailwindCSS configuration with:
- Extended color palette
- Custom font families
- Responsive breakpoints
- Custom animations
- Dark mode support

## 🧪 Testing

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- iOS Safari
- Chrome Mobile

### Device Testing
- Desktop computers
- Tablets (iPad, Android)
- Mobile phones (iOS, Android)

## 🔐 Security

### Features
- HTTPS enforcement
- Secure form handling
- XSS protection
- CSRF protection
- Content Security Policy ready

## 📈 Analytics & Tracking

### Supported Platforms
- Google Analytics 4
- Facebook Pixel
- Pinterest Tag
- Custom tracking code support

## 🛟 Support & Documentation

### Getting Help
1. Check the [Demo Guide](docs/DEMO_GUIDE.md)
2. Review theme settings in Shopify admin
3. Test with demo presets
4. Check browser console for errors

### Common Issues

**Styles not loading**
- Ensure TailwindCSS is compiled: `npm run build`
- Check browser cache
- Verify file paths

**JavaScript errors**
- Check browser console
- Ensure all dependencies are loaded
- Verify DOM element selectors

**Mobile display issues**
- Test on actual devices
- Check responsive breakpoints
- Verify touch interactions

## 📝 Changelog

### Version 1.0.0
- Initial release
- Complete TailwindCSS integration
- 4 demo presets
- Full responsive design
- Accessibility compliance
- Dark mode support

## 📄 License

This theme is provided as-is for use with Shopify stores. Please ensure compliance with Shopify's theme requirements and your store's terms of service.

## 🤝 Contributing

When contributing to this theme:
1. Follow TailwindCSS conventions
2. Ensure accessibility compliance
3. Test across multiple devices
4. Document new features
5. Update demo presets if needed

## 🏷️ Tags

`shopify` `theme` `tailwindcss` `responsive` `dark-mode` `accessibility` `performance` `ecommerce` `modern` `customizable`

---

**Happy building! 🎉**

For support and updates, please refer to the documentation and demo guides included with this theme.