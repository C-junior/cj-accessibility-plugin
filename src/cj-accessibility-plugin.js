/**
 * CJ Accessibility Plugin v1.1
 * Features: Font size control, contrast toggle, persistent settings
 * License: MIT
 */

(function(global) {
    'use strict';
  
    // Default configuration
    const defaults = {
      fontSizeStep: 0.1,
      minFontSize: 0.5,
      maxFontSize: 2.0,
      storageKey: 'a11ySettings',
      buttonSize: '40px',
      position: 'top-right',
      icons: {
        decrease: '−A',
        increase: '+A',
        contrast: '☼'
      }
    };
  
    // Merge user config with defaults
    const config = Object.assign({}, defaults, global.A11Y_CONFIG || {});
  
    // State management
    let settings = {
      fontSize: 1.0,
      contrast: false
    };
  
    // DOM elements
    const elements = {
      container: null,
      buttons: {}
    };
  
    // LocalStorage safety
    const storage = {
      get: () => {
        try {
          return JSON.parse(localStorage.getItem(config.storageKey));
        } catch (e) {
          return null;
        }
      },
      set: (data) => {
        try {
          localStorage.setItem(config.storageKey, JSON.stringify(data));
        } catch (e) {
          console.warn('A11Y: Failed to save settings');
        }
      }
    };
  
    // Apply settings to DOM
    function applySettings() {
      document.body.style.fontSize = `${settings.fontSize * 100}%`;
      document.body.classList.toggle('a11y-high-contrast', settings.contrast);
    }
  
    // Create controls
    function createControls() {
      elements.container = document.createElement('div');
      elements.container.className = 'a11y-controls';
      
      // Position classes
      const positions = {
        'top-right': 'top:20px;right:20px;',
        'bottom-right': 'bottom:20px;right:20px;',
        'top-left': 'top:20px;left:20px;',
        'bottom-left': 'bottom:20px;left:20px;'
      };
      elements.container.style = positions[config.position];
  
      // Create buttons
      elements.buttons.decrease = createButton(
        config.icons.decrease,
        'Decrease text size',
        decreaseFontSize
      );
      
      elements.buttons.increase = createButton(
        config.icons.increase,
        'Increase text size',
        increaseFontSize
      );
      
      elements.buttons.contrast = createButton(
        config.icons.contrast,
        'Toggle high contrast',
        toggleContrast
      );
  
      // Add ARIA labels
      Object.values(elements.buttons).forEach(btn => {
        btn.setAttribute('aria-label', btn.title);
      });
  
      elements.container.append(...Object.values(elements.buttons));
      document.body.appendChild(elements.container);
      addStyles();
    }
  
    function createButton(content, title, handler) {
      const btn = document.createElement('button');
      btn.innerHTML = content;
      btn.title = title;
      btn.style.width = config.buttonSize;
      btn.style.height = config.buttonSize;
      btn.addEventListener('click', handler);
      return btn;
    }
  
    // Font size controls
    function updateFontSize(operation) {
      let newSize = operation === 'increase' 
        ? settings.fontSize + config.fontSizeStep
        : settings.fontSize - config.fontSizeStep;
  
      newSize = Math.max(config.minFontSize, Math.min(config.maxFontSize, newSize));
      
      if (newSize !== settings.fontSize) {
        settings.fontSize = newSize;
        applySettings();
        storage.set(settings);
      }
    }
  
    const decreaseFontSize = () => updateFontSize('decrease');
    const increaseFontSize = () => updateFontSize('increase');
  
    // Contrast toggle
    function toggleContrast() {
      settings.contrast = !settings.contrast;
      applySettings();
      storage.set(settings);
    }
  
    // Add CSS
    function addStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .a11y-controls {
          position: fixed;
          z-index: 9999;
          display: flex;
          gap: 8px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: opacity 0.3s;
        }
        
        .a11y-controls:hover {
          opacity: 1 !important;
        }
        
        .a11y-controls button {
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
        }
        
        .a11y-controls button:hover {
          background: #f8f8f8;
        }
        
        .a11y-high-contrast {
          background: #000 !important;
          color: #fff !important;
        }
        
        .a11y-high-contrast *:not(.a11y-controls):not(button) {
          background: #000 !important;
          color: #fff !important;
          border-color: #fff !important;
        }
      `;
      document.head.appendChild(style);
    }
  
    // Initialize
    function init() {
      const saved = storage.get();
      if (saved) {
        settings = Object.assign(settings, saved);
      }
      
      if (!document.body) {
        return setTimeout(init, 50);
      }
      
      createControls();
      applySettings();
      
      // Watch for dynamic content changes
      new MutationObserver(applySettings).observe(document.body, {
        subtree: true,
        childList: true
      });
    }
  
    // Start when ready
    if (document.readyState === 'complete') {
      init();
    } else {
      window.addEventListener('load', init);
    }
  })(window);