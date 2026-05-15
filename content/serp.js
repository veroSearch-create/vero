// Search Sanity - Content Script
// Professional, Apple HIG inspired modification of Google Search results page

console.log('Search Sanity content script loaded');

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  // Load settings and initialize features
  loadAndInitialize();
}

// Load settings from storage
function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      hideAiOverviews: true,
      forceUdm14: false,
      demoteSpamDomains: true,
      boostForumResults: true
    }, (items) => {
      window.searchSanitySettings = items;
      resolve();
    });
  });
}

// Initialize all features based on settings
async function loadAndInitialize() {
  await loadSettings();
  const settings = window.searchSanitySettings;
  
  if (settings.hideAiOverviews) {
    initAiOverviewFeature();
  }
  
  if (settings.forceUdm14) {
    initUdm14Feature();
  }
  
  if (settings.demoteSpamDomains) {
    initSpamDemotionFeature();
  }
  
  if (settings.boostForumResults) {
    initForumBoostFeature();
  }
  
  // Listen for setting changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      // Update settings
      if (changes.hideAiOverviews !== undefined) {
        window.searchSanitySettings.hideAiOverviews = changes.hideAiOverviews.newValue;
        if (changes.hideAiOverviews.newValue) {
          initAiOverviewFeature();
        } else {
          disposeAiOverviewFeature();
        }
      }
      
      if (changes.forceUdm14 !== undefined) {
        window.searchSanitySettings.forceUdm14 = changes.forceUdm14.newValue;
        if (changes.forceUdm14.newValue) {
          initUdm14Feature();
        } else {
          disposeUdm14Feature();
        }
      }
      
      if (changes.demoteSpamDomains !== undefined) {
        window.searchSanitySettings.demoteSpamDomains = changes.demoteSpamDomains.newValue;
        if (changes.demoteSpamDomains.newValue) {
          initSpamDemotionFeature();
        } else {
          disposeSpamDemotionFeature();
        }
      }
      
      if (changes.boostForumResults !== undefined) {
        window.searchSanitySettings.boostForumResults = changes.boostForumResults.newValue;
        if (changes.boostForumResults.newValue) {
          initForumBoostFeature();
        } else {
          disposeForumBoostFeature();
        }
      }
    }
  });
}

// Feature 1: AI Overview hide toggle
let aiOverviewObserver = null;

function initAiOverviewFeature() {
  disposeAiOverviewFeature(); // Clean up first
  
  // Hide existing overviews
  hideAiOverviews();
  
  // Watch for dynamically inserted overviews
  aiOverviewObserver = new MutationObserver((mutations) => {
    let needsHide = false;
    
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (isAiOverview(node)) {
            needsHide = true;
          }
          // Also check descendants
          const found = node.querySelector ? node.querySelector('div') : null;
          if (found && isAiOverview(found)) {
            needsHide = true;
          }
        }
      }
    }
    
    if (needsHide) {
      hideAiOverviews();
    }
  });
  
  aiOverviewObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function disposeAiOverviewFeature() {
  if (aiOverviewObserver) {
    aiOverviewObserver.disconnect();
    aiOverviewObserver = null;
  }
  // Show any hidden overviews
  showAiOverviews();
}

function isAiOverview(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
  
  // Check for obvious AI Overview text
  const textContent = (element.textContent || '').toLowerCase();
  if (textContent.includes('ai overview') || 
      textContent.includes('generative ai is experimental') ||
      textContent.includes('ai-powered overview')) {
    return true;
  }
  
  // Check for structural patterns commonly found in AI Overviews
  const hasShowMore = element.querySelector('[data-mdc-action="show-more"], [role="button"]') !== null;
  const hasCitations = element.querySelector('sup, .citation, [data-attrid*="kc:/"]') !== null;
  
  // If it has both show more and citations, likely AI Overview
  if (hasShowMore && hasCitations) return true;
  
  // Additional check: look for specific containers that Google uses
  const aiContainers = element.querySelectorAll('[data-attrid*="wa:/"], [data-attrid*="kc:/"]');
  if (aiContainers.length > 0 && hasShowMore) return true;
  
  return false;
}

function findAiOverviewElements() {
  const elements = [];
  
  // Try semantic selectors first
  const semanticSelectors = [
    '[data-attrid*="wa:/description"]',
    '[data-attrid*="kc:/qa/answer"]',
    '[jsname*="cHzgkd"]',
    'div:has(> [role="button"]:contains("Show more"))'
  ];
  
  for (const selector of semanticSelectors) {
    try {
      const found = document.querySelectorAll(selector);
      found.forEach(el => {
        if (isAiOverview(el)) {
          elements.push(el);
        }
      });
    } catch (e) {
      // Selector might not be supported, continue
    }
  }
  
  // Fallback: look for elements containing AI Overview text
  const allElements = document.querySelectorAll('div, section');
  allElements.forEach(el => {
    if (isAiOverview(el) && !elements.includes(el)) {
      elements.push(el);
    }
  });
  
  return elements;
}

function hideAiOverviews() {
  const overviews = findAiOverviewElements();
  
  overviews.forEach(overview => {
    // Skip if already hidden by us
    if (overview.dataset.ssHidden === 'true') return;
    
    // Hide the overview
    overview.style.display = 'none';
    overview.dataset.ssHidden = 'true';
    
    // Create and insert banner
    const banner = document.createElement('div');
    banner.className = 'ss-banner';
    banner.innerHTML = `
      <span>AI Overview hidden</span>
      <button class="ss-show-button">Show anyway</button>
    `;
    
    // Insert after the overview
    overview.parentNode.insertBefore(banner, overview.nextSibling);
    
    // Add event listener to show button
    const showButton = banner.querySelector('.ss-show-button');
    showButton.addEventListener('click', (e) => {
      e.stopPropagation();
      overview.style.display = '';
      overview.removeAttribute('data-ss-hidden');
      banner.remove();
    });
  });
}

function showAiOverviews() {
  const hiddenOverviews = document.querySelectorAll('[data-ss-hidden="true"]');
  
  hiddenOverviews.forEach(overview => {
    overview.style.display = '';
    overview.removeAttribute('data-ss-hidden');
    
    // Remove associated banner
    const nextSibling = overview.nextSibling;
    if (nextSibling && nextSibling.classList.contains('ss-banner')) {
      nextSibling.remove();
    }
  });
}

// Feature 2: Auto udm=14 mode
function initUdm14Feature() {
  // Check if we need to redirect current page
  ensureUdm14();
  
  // Watch for URL changes (SPA-like behavior)
  if (!window.searchSanityUrlListener) {
    window.searchSanityUrlListener = () => {
      setTimeout(ensureUdm14, 100); // Delay to let URL change settle
    };
    window.addEventListener('popstate', window.searchSanityUrlListener);
    window.addEventListener('pushState', window.searchSanityUrlListener);
    // Override history.pushState/replaceState
    const originalPushState = history.pushState;
    history.pushState = function() {
      originalPushState.apply(this, arguments);
      window.searchSanityUrlListener();
    };
    const originalReplaceState = history.replaceState;
    history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      window.searchSanityUrlListener();
    };
  }
}

function disposeUdm14Feature() {
  if (window.searchSanityUrlListener) {
    window.removeEventListener('popstate', window.searchSanityUrlListener);
    window.removeEventListener('pushState', window.searchSanityUrlListener);
    window.searchSanityUrlListener = null;
    // Note: We don't restore history.pushState/replaceState as it could break other things
  }
}

function ensureUdm14() {
  if (!window.searchSanitySettings || !window.searchSanitySettings.forceUdm14) return;
  
  const url = new URL(window.location.href);
  
  // Only apply to google.com search pages
  if (url.hostname !== 'www.google.com' && url.hostname !== 'google.com') return;
  
  // Only apply to search pages
  if (!url.pathname.startsWith('/search')) return;
  
  // If udm=14 is not present, add it
  if (!url.searchParams.has('udm') || url.searchParams.get('udm') !== '14') {
    url.searchParams.set('udm', '14');
    window.location.replace(url.toString());
  }
}

// Feature 3: SEO-spam domain demotion
function initSpamDemotionFeature() {
  // Load blocklist and apply
  loadSpamBlocklist().then(demoteSpamDomains);
  
  // Watch for dynamically inserted results
  if (!window.searchSanitySpamObserver) {
    window.searchSanitySpamObserver = new MutationObserver((mutations) => {
      // Debounce rapid mutations
      if (window.searchSanitySpamTimeout) clearTimeout(window.searchSanitySpamTimeout);
      window.searchSanitySpamTimeout = setTimeout(() => {
        loadSpamBlocklist().then(demoteSpamDomains);
      }, 300);
    });
    
    window.searchSanitySpamObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

function disposeSpamDemotionFeature() {
  if (window.searchSanitySpamObserver) {
    window.searchSanitySpamObserver.disconnect();
    window.searchSanitySpamObserver = null;
  }
  if (window.searchSanitySpamTimeout) {
    clearTimeout(window.searchSanitySpamTimeout);
    window.searchSanitySpamTimeout = null;
  }
  // Restore demoted results
  restoreSpamDomains();
}

async function loadSpamBlocklist() {
  try {
    // Try to fetch from extension storage
    const result = await new Promise((resolve) => {
      chrome.storage.sync.get({spamDomains: []}, (items) => {
        resolve(items.spamDomains);
      });
    });
    
    // If empty, try to fetch from bundled data (content script can't fetch directly)
    // We'll need to pass this from background or have it inline
    if (result.length === 0) {
      // Fallback to a basic list - in practice this would come from background
      return window.searchSanitySpamList || [];
    }
    
    return result;
  } catch (error) {
    console.warn('Failed to load spam blocklist:', error);
    return window.searchSanitySpamList || [];
  }
}

function demoteSpamDomains() {
  // This would normally load the blocklist from storage
  // For now, we'll use a placeholder that would be populated by background
  const spamDomains = window.searchSanitySpamList || [];
  
  if (spamDomains.length === 0) return;
  
  // Find all search result links
  const resultLinks = document.querySelectorAll('a[href]');
  
  resultLinks.forEach(link => {
    try {
      const href = link.href;
      if (!href) return;
      
      const url = new URL(href);
      const hostname = url.hostname.replace(/^www\./, '');
      
      // Check if hostname matches any spam domain
      const isSpam = spamDomains.some(domain => {
        const cleanDomain = domain.replace(/^www\./, '');
        return hostname === cleanDomain || hostname.endsWith('.' + cleanDomain);
      });
      
      if (isSpam) {
        // Apply demotion styling
        link.closest('div.g, div[data-sokoban-container], div.mnr-c')?.classList.add('ss-demoted');
        
        // Add visual indicator
        const existingTag = link.querySelector('.ss-low-quality-tag');
        if (!existingTag) {
          const tag = document.createElement('span');
          tag.className = 'ss-low-quality-tag';
          tag.textContent = 'Low quality';
          
          // Insert after the link or at end of container
          const container = link.closest('div.g, div[data-sokoban-container], div.mnr-c, div');
          if (container) {
            container.appendChild(tag);
          }
        }
      }
    } catch (e) {
      // Ignore invalid URLs
    }
  });
}

function restoreSpamDomains() {
  // Remove all our demotion styling and tags
  document.querySelectorAll('.ss-demoted').forEach(el => {
    el.classList.remove('ss-demoted');
  });
  
  document.querySelectorAll('.ss-low-quality-tag').forEach(tag => {
    tag.remove();
  });
}

// Feature 4: Reddit / forum result boost
function initForumBoostFeature() {
  loadBoostList().then(boostForumResults);
  
  // Watch for dynamically inserted results
  if (!window.searchSanityBoostObserver) {
    window.searchSanityBoostObserver = new MutationObserver((mutations) => {
      if (window.searchSanityBoostTimeout) clearTimeout(window.searchSanityBoostTimeout);
      window.searchSanityBoostTimeout = setTimeout(() => {
        loadBoostList().then(boostForumResults);
      }, 300);
    });
    
    window.searchSanityBoostObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

function disposeForumBoostFeature() {
  if (window.searchSanityBoostObserver) {
    window.searchSanityBoostObserver.disconnect();
    window.searchSanityBoostObserver = null;
  }
  if (window.searchSanityBoostTimeout) {
    clearTimeout(window.searchSanityBoostTimeout);
    window.searchSanityBoostTimeout = null;
  }
  // Remove boost styling
  removeForumBoost();
}

async function loadBoostList() {
  try {
    const result = await new Promise((resolve) => {
      chrome.storage.sync.get({boostDomains: []}, (items) => {
        resolve(items.boostDomains);
      });
    });
    
    if (result.length === 0) {
      // Default high-signal domains
      return ['reddit.com', 'stackoverflow.com', 'news.ycombinator.com', 'github.com'];
    }
    
    return result;
  } catch (error) {
    console.warn('Failed to load boost list:', error);
    return ['reddit.com', 'stackoverflow.com', 'news.ycombinator.com', 'github.com'];
  }
}

function boostForumResults() {
  const boostDomains = window.searchSanityBoostList || [];
  
  if (boostDomains.length === 0) return;
  
  // Find all search result links
  const resultLinks = document.querySelectorAll('a[href]');
  
  resultLinks.forEach(link => {
    try {
      const href = link.href;
      if (!href) return;
      
      const url = new URL(href);
      const hostname = url.hostname.replace(/^www\./, '');
      
      // Check if hostname matches any boost domain
      const isBoost = boostDomains.some(domain => {
        const cleanDomain = domain.replace(/^www\./, '');
        return hostname === cleanDomain || hostname.endsWith('.' + cleanDomain);
      });
      
      if (isBoost) {
        // Apply boost styling
        const container = link.closest('div.g, div[data-sokoban-container], div.mnr-c, div');
        if (container) {
          container.classList.add('ss-boosted');
          
          // Add visual indicator
          const existingTag = container.querySelector('.ss-forum-tag');
          if (!existingTag) {
            const tag = document.createElement('span');
            tag.className = 'ss-forum-tag';
            tag.textContent = 'Forum';
            
            // Insert at beginning of container
            container.insertBefore(tag, container.firstChild);
          }
        }
      }
    } catch (e) {
      // Ignore invalid URLs
    }
  });
}

function removeForumBoost() {
  // Remove all our boost styling and tags
  document.querySelectorAll('.ss-boosted').forEach(el => {
    el.classList.remove('ss-boosted');
  });
  
  document.querySelectorAll('.ss-forum-tag').forEach(tag => {
    tag.remove();
  });
}

// Initialize storage lists from background if available
// Background will populate these when it loads the JSON files
chrome.runtime.sendMessage({type: 'GET_STORAGE_LISTS'}, (response) => {
  if (response) {
    if (response.spamDomains) {
      window.searchSanitySpamList = response.spamDomains;
    }
    if (response.boostDomains) {
      window.searchSanityBoostList = response.boostDomains;
    }
  }
});

// Export functions for background to call
window.searchSanity = {
  initAiOverviewFeature,
  disposeAiOverviewFeature,
  initUdm14Feature,
  disposeUdm14Feature,
  initSpamDemotionFeature,
  disposeSpamDemotionFeature,
  initForumBoostFeature,
  disposeForumBoostFeature
};