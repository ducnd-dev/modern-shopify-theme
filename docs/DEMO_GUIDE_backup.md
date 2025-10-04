# Demo Configuration Guide

This theme includes 4 pre-configured demo setups that showcase different styles and use cases.

## Available Demo Presets

### 1. Fashion Store (`fashion`)
- **Target**: High-end fashion retailers
- **Style**: Elegant and sophisticated
- **Colors**: Black primary with gold accents
- **Typography**: Modern Era font family
- **Features**: 
  - Minimalist product cards
  - Elegant animations
  - Large hero sections
  - Vendor display enabled

### 2. Electronics Store (`electronics`) 
- **Target**: Tech and electronics retailers
- **Style**: Modern and tech-focused
- **Colors**: Blue primary with cyan accents
- **Typography**: Helvetica Neue font family
- **Features**:
  - Fast animations
  - Product specifications display
  - Tech-focused color scheme
  - Performance optimized

### 3. Beauty Store (`beauty`)
- **Target**: Cosmetics and beauty retailers  
- **Style**: Soft and luxurious
- **Colors**: Pink primary with orange accents
- **Typography**: Playfair Display headers
- **Features**:
  - Color swatches enabled
  - Soft animations
  - Newsletter popup enabled
  - Beauty-focused styling

### 4. Dark Minimal Store (`minimal`)
- **Target**: Premium/luxury brands
- **Style**: Clean and minimalist
- **Colors**: Dark theme with white text
- **Typography**: Inter font family
- **Features**:
  - Dark background
  - Minimal UI elements
  - Large spacing
  - No distracting elements

## How to Apply Demo Presets

### Method 1: URL Parameter (Temporary Preview)
Add `?demo=preset_name` to any page URL:
```
https://your-store.myshopify.com/?demo=fashion
https://your-store.myshopify.com/?demo=electronics
https://your-store.myshopify.com/?demo=beauty
https://your-store.myshopify.com/?demo=minimal
```

### Method 2: Theme Settings (Permanent)
1. Go to **Online Store > Themes > Customize**
2. Navigate to **Theme Settings > Demo Configurations**
3. Select your preferred preset from the dropdown
4. Click **Save**

### Method 3: Manual Configuration
Use the preset values from `config/demo-presets.json` to manually configure:

1. **Colors**: Theme Settings > Colors
2. **Typography**: Theme Settings > Typography  
3. **Layout**: Theme Settings > Layout
4. **Features**: Various theme settings sections

## Customizing Demo Presets

### Adding New Presets
1. Edit `config/demo-presets.json`
2. Add your new preset configuration
3. Update `assets/demo-setup.js` to include the new preset
4. Update the settings schema if needed

### Modifying Existing Presets
1. Edit the preset values in `config/demo-presets.json`
2. Test the changes using the URL parameter method
3. Deploy when satisfied

## Preset Configuration Structure

```json
{
  "preset_name": {
    "name": "Display Name",
    "description": "Preset description",
    "settings": {
      // All theme settings with their values
      "primary_color": "#000000",
      "button_style": "rounded-none",
      // ... more settings
    },
    "sections": {
      // Section-specific configurations
      "hero": {
        "heading": "Custom heading",
        "button_text": "Custom button"
      }
    }
  }
}
```

## Development Tips

### Testing Presets
1. Use URL parameters for quick testing
2. Check all pages with the preset applied
3. Test responsive behavior
4. Verify accessibility compliance

### Performance Considerations
- Electronics preset enables critical CSS inlining
- Beauty preset uses slower animations
- Minimal preset disables some features for performance
- All presets enable lazy loading by default

### Accessibility Features
All presets include:
- Focus outline support
- Skip to content links
- Reduced motion preference respect
- Proper color contrast ratios

## Troubleshooting

### Preset Not Applying
1. Check browser console for JavaScript errors
2. Verify the preset name is spelled correctly
3. Ensure `demo-setup.js` is loading properly
4. Clear browser cache and reload

### Styling Issues
1. Check if custom CSS is overriding preset styles
2. Verify TailwindCSS is compiling correctly
3. Ensure CSS custom properties are supported

### Performance Issues
1. Disable animations if needed
2. Enable critical CSS inlining
3. Reduce section spacing for faster loading
4. Optimize images and fonts

## Demo Data Recommendations

### Fashion Store
- High-quality fashion photography
- Model lifestyle images  
- Elegant product descriptions
- Size guides and fit information

### Electronics Store
- Product specification tables
- Technical feature highlights
- Comparison charts
- Video demonstrations

### Beauty Store
- Before/after images
- Ingredient lists
- Tutorial videos
- Color swatches and samples

### Minimal Store
- Clean product photography
- Minimal text descriptions
- High-contrast images
- Focus on product quality