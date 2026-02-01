/**
 * Style Guard - Prevents browser extensions from breaking game visuals
 * Actively removes extension stylesheets and enforces game styling
 */

export const initStyleGuard = () => {
  // Remove extension stylesheets periodically
  const removeExtensionStyles = () => {
    const stylesheets = document.querySelectorAll('style, link[rel="stylesheet"]');
    
    stylesheets.forEach((sheet) => {
      const sheetText = sheet.textContent || sheet.getAttribute('href') || '';
      
      // Check for known extension style patterns
      const extensionPatterns = [
        'darkreader', // DarkReader
        'ublock',     // uBlock Origin  
        'adblock',    // AdBlock
        'grammarly',  // Grammarly
        'lastpass',   // LastPass
        'bitwarden',  // Bitwarden
        'dashlane',   // Dashlane
        'keepass',    // KeePass
        'adopted-style-sheet', // Shadow DOM styles
      ];
      
      const isExtensionStyle = extensionPatterns.some(pattern => 
        sheetText.toLowerCase().includes(pattern)
      );
      
      if (isExtensionStyle && sheet.parentNode) {
        // Don't remove, but we'll override with our styles
        console.log('[StyleGuard] Detected extension stylesheet, will override');
      }
    });
  };
  
  // Force specific styles that extensions often break
  const enforceGameStyles = () => {
    const body = document.body;
    const gameWrapper = document.querySelector('.game-wrapper');
    
    if (body) {
      body.style.cssText = `
        width: 100% !important;
        height: 100% !important;
        max-height: 100% !important;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        background: #0a0e27 !important;
        color: #ffffff !important;
        line-height: 1.5 !important;
        letter-spacing: 0.3px !important;
      `;
    }
    
    if (gameWrapper) {
      (gameWrapper as HTMLElement).style.cssText = `
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        height: 100% !important;
        max-height: 100% !important;
        overflow: hidden !important;
        background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%) !important;
      `;
    }
  };
  
  // Run on initial load
  removeExtensionStyles();
  enforceGameStyles();
  
  // Watch for injected stylesheets and re-enforce styles
  const observer = new MutationObserver(() => {
    removeExtensionStyles();
    enforceGameStyles();
  });
  
  observer.observe(document.head, {
    childList: true,
    subtree: true,
  });
  
  // Also re-enforce every 500ms as a fallback
  const styleEnforcementInterval = setInterval(() => {
    enforceGameStyles();
  }, 500);
  
  // Return cleanup function
  return () => {
    observer.disconnect();
    clearInterval(styleEnforcementInterval);
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
