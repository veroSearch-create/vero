// Background service worker for Search Sanity
// Handles extension-level events, messaging, and storage management

console.log('Search Sanity background service worker started');

// Storage keys
const STORAGE_KEYS = {
  HIDE_AI_OVERVIEWS: 'hideAiOverviews',
  FORCE_UDM14: 'forceUdm14',
  DEMOTE_SPAM_DOMAINS: 'demoteSpamDomains',
  BOOST_FORUM_RESULTS: 'boostForumResults',
  SPAM_DOMAINS: 'spamDomains',
  BOOST_DOMAINS: 'boostDomains'
};

// Default settings
const DEFAULT_SETTINGS = {
  [STORAGE_KEYS.HIDE_AI_OVERVIEWS]: true,
  [STORAGE_KEYS.FORCE_UDM14]: false,
  [STORAGE_KEYS.DEMOTE_SPAM_DOMAINS]: true,
  [STORAGE_KEYS.BOOST_FORUM_RESULTS]: true,
  [STORAGE_KEYS.SPAM_DOMAINS]: [], // Will be populated from bundled data
  [STORAGE_KEYS.BOOST_DOMAINS]: ['reddit.com', 'stackoverflow.com', 'news.ycombinator.com', 'github.com']
};

// Initialize extension
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Search Sanity installed', details.reason);
  
  // Initialize default settings if not already set
  chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => {
    const toSet = {};
    for (const key in DEFAULT_SETTINGS) {
      if (!(key in items)) {
        toSet[key] = DEFAULT_SETTINGS[key];
      }
    }
    
    if (Object.keys(toSet).length > 0) {
      chrome.storage.sync.set(toSet, () => {
        console.log('Default settings initialized', toSet);
      });
    }
  });
  
  // Load and cache domain lists from bundled files
  loadDomainLists();
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // console.log('Background received message:', message);
  
  // Handle different message types
  switch (message.type) {
    case 'GET_SETTINGS':
      chrome.storage.sync.get(null, (settings) => {
        sendResponse({settings});
      });
      return true; // Will respond asynchronously
      
    case 'UPDATE_SETTING':
      const update = {};
      update[message.key] = message.value;
      chrome.storage.sync.set(update, () => {
        sendResponse({success: true});
        
        // Notify content scripts of the change
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'SETTINGS_UPDATED',
              key: message.key,
              value: message.value
            });
          }
        });
      });
      return true;
      
    case 'GET_STORAGE_LISTS':
      chrome.storage.sync.get([STORAGE_KEYS.SPAM_DOMAINS, STORAGE_KEYS.BOOST_DOMAINS], (items) => {
        sendResponse({
          spamDomains: items[STORAGE_KEYS.SPAM_DOMAINS] || [],
          boostDomains: items[STORAGE_KEYS.BOOST_DOMAINS] || []
        });
      });
      return true;
      
    case 'UPDATE_SPAM_DOMAINS':
      chrome.storage.sync.set({[STORAGE_KEYS.SPAM_DOMAINS]: message.domains}, () => {
        sendResponse({success: true});
        
        // Notify content scripts to refresh
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            if (tab.url && tab.url.includes('google.com/search')) {
              chrome.tabs.sendMessage(tab.id, {
                type: 'REFRESH_SPAM_LIST'
              });
            }
          });
        });
      });
      return true;
      
    case 'UPDATE_BOOST_DOMAINS':
      chrome.storage.sync.set({[STORAGE_KEYS.BOOST_DOMAINS]: message.domains}, () => {
        sendResponse({success: true});
        
        // Notify content scripts to refresh
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            if (tab.url && tab.url.includes('google.com/search')) {
              chrome.tabs.sendMessage(tab.id, {
                type: 'REFRESH_BOOST_LIST'
              });
            }
          });
        });
      });
      return true;
      
    default:
      sendResponse({error: 'Unknown message type'});
  }
});

// Load domain lists from bundled JSON files
async function loadDomainLists() {
  try {
      // Load spam domains
      const spamResponse = await fetch(chrome.runtime.getURL('data/spam-domains.json'));
      const spamDomains = await spamResponse.json();
      
      // Load boost domains
      const boostResponse = await fetch(chrome.runtime.getURL('data/boost-domains.json'));
      const boostDomains = await boostResponse.json();
      
      // Update storage if we got valid data
      if (Array.isArray(spamDomains)) {
        chrome.storage.sync.set({[STORAGE_KEYS.SPAM_DOMAINS]: spamDomains});
      }
      if (Array.isArray(boostDomains)) {
        chrome.storage.sync.set({[STORAGE_KEYS.BOOST_DOMAINS]: boostDomains});
      }
      
      console.log('Domain lists loaded:', {spamDomains: spamDomains.length, boostDomains: boostDomains.length});
  } catch (error) {
      console.error('Failed to load domain lists:', error);
      // Set defaults if loading fails
      chrome.storage.sync.set({
        [STORAGE_KEYS.SPAM_DOMAINS]: [],
        [STORAGE_KEYS.BOOST_DOMAINS]: ['reddit.com', 'stackoverflow.com', 'news.ycombinator.com', 'github.com']
      });
  }
}

// Listen for storage changes to keep domain lists updated
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    if (changes[STORAGE_KEYS.SPAM_DOMAINS]) {
      console.log('Spam domains updated:', changes[STORAGE_KEYS.SPAM_DOMAINS].newValue);
      // Notify content scripts
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.url && tab.url.includes('google.com/search')) {
            chrome.tabs.sendMessage(tab.id, {
              type: 'REFRESH_SPAM_LIST'
            });
          }
        });
      });
    }
    
    if (changes[STORAGE_KEYS.BOOST_DOMAINS]) {
      console.log('Boost domains updated:', changes[STORAGE_KEYS.BOOST_DOMAINS].newValue);
      // Notify content scripts
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.url && tab.url.includes('google.com/search')) {
            chrome.tabs.sendMessage(tab.id, {
              type: 'REFRESH_BOOST_LIST'
            });
          }
        });
      });
    }
  }
});

// Optional: Handle alarms, etc.