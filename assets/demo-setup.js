/**
 * Demo Configuration Setup Script
 * Applies preset configurations to the theme
 */

(function() {
  'use strict';

  // Demo presets data (this would normally be loaded from demo-presets.json)
  const DEMO_PRESETS = {
    fashion: {
      name: "Fashion Store",
      colors: {
        primary: "#000000",
        accent: "#d4af37",
        background: "#ffffff",
        secondary_bg: "#f9fafb"
      },
      styles: {
        button_style: "rounded-none",
        animation_speed: "normal",
        section_spacing: 80
      }
    },
    electronics: {
      name: "Electronics Store", 
      colors: {
        primary: "#2563eb",
        accent: "#0ea5e9",
        background: "#ffffff",
        secondary_bg: "#f1f5f9"
      },
      styles: {
        button_style: "rounded-md",
        animation_speed: "fast",
        section_spacing: 60
      }
    },
    beauty: {
      name: "Beauty Store",
      colors: {
        primary: "#ec4899",
        accent: "#f97316", 
        background: "#fefcfb",
        secondary_bg: "#fdf2f8"
      },
      styles: {
        button_style: "rounded-full",
        animation_speed: "slow",
        section_spacing: 70
      }
    },
    minimal: {
      name: "Dark Minimal Store",
      colors: {
        primary: "#ffffff",
        accent: "#6366f1",
        background: "#0f172a",
        secondary_bg: "#1e293b"
      },
      styles: {
        button_style: "rounded-none",
        animation_speed: "normal",
        section_spacing: 100
      }
    }
  };

  class DemoSetup {
    constructor() {
      this.currentPreset = this.getCurrentPreset();
      this.init();
    }

    init() {
      this.applyPresetStyles();
      this.bindPresetSelector();
      this.showPresetInfo();
    }

    getCurrentPreset() {
      // Check URL parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const urlPreset = urlParams.get('demo');
      
      if (urlPreset && DEMO_PRESETS[urlPreset]) {
        return urlPreset;
      }

      // Check theme settings
      const themeSettings = window.theme?.settings;
      if (themeSettings?.demo_preset && DEMO_PRESETS[themeSettings.demo_preset]) {
        return themeSettings.demo_preset;
      }

      // Default to custom (no preset)
      return 'custom';
    }

    applyPresetStyles() {
      if (this.currentPreset === 'custom') return;

      const preset = DEMO_PRESETS[this.currentPreset];
      if (!preset) return;

      // Apply CSS custom properties
      const root = document.documentElement;
      
      Object.entries(preset.colors).forEach(([key, value]) => {
        const cssVar = `--color-${key.replace('_', '-')}`;
        root.style.setProperty(cssVar, value);
      });

      // Apply style classes
      document.body.classList.add(`demo-${this.currentPreset}`);

      // Apply button styles
      if (preset.styles.button_style) {
        root.style.setProperty('--border-radius', this.getButtonRadius(preset.styles.button_style));
      }

      // Apply animation speed
      if (preset.styles.animation_speed) {
        root.style.setProperty('--animation-speed', this.getAnimationSpeed(preset.styles.animation_speed));
      }

      // Apply section spacing
      if (preset.styles.section_spacing) {
        root.style.setProperty('--section-spacing', `${preset.styles.section_spacing}px`);
      }

      console.log(`🎨 Applied ${preset.name} demo preset`);
    }

    getButtonRadius(style) {
      switch(style) {
        case 'rounded-full': return '9999px';
        case 'rounded-none': return '0px';
        case 'rounded-md': 
        default: return '0.375rem';
      }
    }

    getAnimationSpeed(speed) {
      switch(speed) {
        case 'fast': return '150ms';
        case 'slow': return '500ms';
        case 'normal':
        default: return '300ms';
      }
    }

    bindPresetSelector() {
      // Create preset selector if it doesn't exist
      if (!document.querySelector('.demo-preset-selector')) {
        this.createPresetSelector();
      }

      // Bind existing selector
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
      selector.className = 'demo-preset-selector fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border dark:border-gray-700';
      selector.innerHTML = `
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Demo Theme:
        </label>
        <select class="form-select text-sm">
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

      // Update URL parameter
      const url = new URL(window.location);
      if (presetKey === 'custom') {
        url.searchParams.delete('demo');
      } else {
        url.searchParams.set('demo', presetKey);
      }
      
      // Update URL without page reload
      window.history.replaceState({}, '', url);

      // Reload page to apply new preset
      window.location.reload();
    }

    showPresetInfo() {
      if (this.currentPreset === 'custom') return;

      const preset = DEMO_PRESETS[this.currentPreset];
      if (!preset) return;

      // Show notification about current preset
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

      // Auto-hide after 5 seconds
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 5000);
    }

    // Static method to get preset data
    static getPresetData(presetKey) {
      return DEMO_PRESETS[presetKey] || null;
    }

    // Static method to list all presets
    static getAllPresets() {
      return Object.keys(DEMO_PRESETS);
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new DemoSetup());
  } else {
    new DemoSetup();
  }

  // Export for external use
  window.DemoSetup = DemoSetup;

})();