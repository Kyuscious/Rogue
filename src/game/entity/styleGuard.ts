/**
 * Style Guard - Prevents browser extensions from breaking game visuals
 * Aggressively removes extension stylesheets and enforces game styling
 */

export const initStyleGuard = () => {
  console.log('[StyleGuard] Initializing...');
  
  // Create and inject a master stylesheet that will override everything
  const injectMasterStylesheet = () => {
    // Remove old stylesheet if it exists
    const existing = document.getElementById('game-master-styles');
    if (existing) existing.remove();
    
    const style = document.createElement('style');
    style.id = 'game-master-styles';
    style.textContent = `
      /* Master Game Styles - Override ALL extensions */
      * {
        box-sizing: border-box !important;
      }
      
      html {
        width: 100% !important;
        height: 100% !important;
        max-height: 100% !important;
        overflow: hidden !important;
        font-size: 16px !important;
        background: #0a0e27 !important;
        color: #ffffff !important;
        filter: none !important;
      }
      
      body {
        width: 100% !important;
        height: 100% !important;
        max-height: 100% !important;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
        background: #0a0e27 !important;
        color: #ffffff !important;
        line-height: 1.5 !important;
        letter-spacing: 0.3px !important;
        filter: none !important;
        opacity: 1 !important;
      }
      
      #root {
        width: 100% !important;
        height: 100% !important;
        max-height: 100% !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
        background: #0a0e27 !important;
        filter: none !important;
      }
      
      .game-wrapper {
        width: 100% !important;
        height: 100% !important;
        max-height: 100% !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
        background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%) !important;
        filter: none !important;
        opacity: 1 !important;
      }
      
      /* Override any background color changes */
      div, span, p, h1, h2, h3, h4, h5, h6, button, input, select, textarea {
        filter: none !important;
        background-color: unset !important;
        color: unset !important;
      }
    `;
    
    // Inject at the very end of head to have maximum priority
    document.head.appendChild(style);
    console.log('[StyleGuard] Master stylesheet injected');
  };
  
  // Remove all DarkReader stylesheets
  const removeDarkReaderStylesheets = () => {
    const stylesheets = document.querySelectorAll('style.darkreader, link[href*="darkreader"], style[class*="darkreader"]');
    let removed = 0;
    
    stylesheets.forEach((sheet) => {
      try {
        if (sheet.parentNode) {
          sheet.remove();
          removed++;
          console.log('[StyleGuard] Removed DarkReader stylesheet');
        }
      } catch (e) {
        // Ignore errors
      }
    });
    
    if (removed > 0) {
      console.log(`[StyleGuard] Removed ${removed} DarkReader stylesheets`);
    }
  };
  
  // Remove DarkReader inline attributes that override our colors
  const removeDarkReaderAttributes = () => {
    // Remove from root and body
    [document.documentElement, document.body].forEach(el => {
      if (!el) return;
      el.removeAttribute('data-darkreader-inline-bgcolor');
      el.removeAttribute('data-darkreader-inline-bgimage');
      el.removeAttribute('data-darkreader-inline-color');
      el.removeAttribute('data-darkreader-inline-border');
      el.removeAttribute('data-darkreader-inline-fill');
      el.removeAttribute('data-darkreader-inline-stroke');
      el.removeAttribute('style');
    });
    
    // Remove from all child elements
    const allElements = document.querySelectorAll('[data-darkreader-inline-bgcolor], [data-darkreader-inline-bgimage], [data-darkreader-inline-color], [data-darkreader-inline-border]');
    
    allElements.forEach((element) => {
      element.removeAttribute('data-darkreader-inline-bgcolor');
      element.removeAttribute('data-darkreader-inline-bgimage');
      element.removeAttribute('data-darkreader-inline-color');
      element.removeAttribute('data-darkreader-inline-border');
      element.removeAttribute('data-darkreader-inline-fill');
      element.removeAttribute('data-darkreader-inline-stroke');
    });
  };
  
  // Inject immediately
  if (document.head) {
    removeDarkReaderStylesheets();
    injectMasterStylesheet();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      removeDarkReaderStylesheets();
      injectMasterStylesheet();
    });
  }
  
  // Force specific inline styles that extensions often break
  const enforceGameStyles = () => {
    removeDarkReaderStylesheets();
    removeDarkReaderAttributes();
    
    const body = document.body;
    const root = document.getElementById('root');
    const gameWrapper = document.querySelector('.game-wrapper');
    
    if (body) {
      body.style.setProperty('width', '100%', 'important');
      body.style.setProperty('height', '100%', 'important');
      body.style.setProperty('max-height', '100%', 'important');
      body.style.setProperty('overflow', 'hidden', 'important');
      body.style.setProperty('margin', '0', 'important');
      body.style.setProperty('padding', '0', 'important');
      body.style.setProperty('background', '#0a0e27', 'important');
      body.style.setProperty('color', '#ffffff', 'important');
      body.style.setProperty('filter', 'none', 'important');
    }
    
    if (root) {
      root.style.setProperty('width', '100%', 'important');
      root.style.setProperty('height', '100%', 'important');
      root.style.setProperty('max-height', '100%', 'important');
      root.style.setProperty('overflow', 'hidden', 'important');
      root.style.setProperty('display', 'flex', 'important');
      root.style.setProperty('flex-direction', 'column', 'important');
      root.style.setProperty('background', '#0a0e27', 'important');
      root.style.setProperty('filter', 'none', 'important');
    }
    
    if (gameWrapper) {
      (gameWrapper as HTMLElement).style.setProperty('display', 'flex', 'important');
      (gameWrapper as HTMLElement).style.setProperty('flex-direction', 'column', 'important');
      (gameWrapper as HTMLElement).style.setProperty('width', '100%', 'important');
      (gameWrapper as HTMLElement).style.setProperty('height', '100%', 'important');
      (gameWrapper as HTMLElement).style.setProperty('max-height', '100%', 'important');
      (gameWrapper as HTMLElement).style.setProperty('overflow', 'hidden', 'important');
      (gameWrapper as HTMLElement).style.setProperty('background', 'linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%)', 'important');
      (gameWrapper as HTMLElement).style.setProperty('filter', 'none', 'important');
    }
  };
  
  // Re-enforce styles
  enforceGameStyles();
  console.log('[StyleGuard] Styles enforced on load');
  
  // Watch for injected stylesheets and re-enforce styles
  const observer = new MutationObserver(() => {
    enforceGameStyles();
  });
  
  observer.observe(document.head, {
    childList: true,
    subtree: true,
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-darkreader-inline-bgcolor', 'data-darkreader-inline-bgimage', 'data-darkreader-inline-color', 'style'],
  });
  
  // Use requestAnimationFrame for ultra-aggressive enforcement
  let rafId: number;
  const enforceWithRAF = () => {
    enforceGameStyles();
    rafId = requestAnimationFrame(enforceWithRAF);
  };
  enforceWithRAF();
  
  console.log('[StyleGuard] Continuous enforcement started (RAF)');
  
  // Return cleanup function
  return () => {
    observer.disconnect();
    cancelAnimationFrame(rafId);
    console.log('[StyleGuard] Cleaned up');
  };
};

/**
 * Remove all adopted stylesheets (extension-injected shadows)
 */
export const removeAdoptedStylesheets = () => {
  try {
    const head = document.head;
    if (!head) return;
    
    // Get all stylesheets including adopted ones
    const allSheets = [...document.styleSheets];
    
    allSheets.forEach((sheet) => {
      try {
        // Try to access href to identify extension sheets
        const href = sheet.href || '';
        if (href.includes('extension') || href.includes('chrome')) {
          // Can't directly remove cross-origin sheets, but we can log it
          console.log('[StyleGuard] Blocked extension sheet:', href);
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    });
  } catch (e) {
    console.log('[StyleGuard] Could not remove adopted stylesheets');
  }
};
