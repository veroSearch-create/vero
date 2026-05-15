// Search Sanity - Storage Utility Wrapper
// Provides helper functions for chrome.storage with Promises

const storage = {
  // Get item from storage area
  get: (area, key, defaultValue) => {
    return new Promise((resolve) => {
      const obj = {};
      obj[key] = defaultValue;
      chrome.storage[area].get(obj, (result) => {
        resolve(result[key]);
      });
    });
  },
  
  // Get multiple items from storage area
  getAll: (area, defaults = {}) => {
    return new Promise((resolve) => {
      chrome.storage[area].get(defaults, (result) => {
        resolve(result);
      });
    });
  },
  
  // Set item in storage area
  set: (area, key, value) => {
    return new Promise((resolve) => {
      const obj = {};
      obj[key] = value;
      chrome.storage[area].set(obj, () => {
        resolve();
      });
    });
  },
  
  // Set multiple items in storage area
  setAll: (area, items) => {
    return new Promise((resolve) => {
      chrome.storage[area].set(items, () => {
        resolve();
      });
    });
  },
  
  // Remove item from storage area
  remove: (area, key) => {
    return new Promise((resolve) => {
      chrome.storage[area].remove(key, () => {
        resolve();
      });
    });
  }
};

// Export for use in other files (content script, popup, etc.)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = storage;
}
// Make it available globally for simple script inclusion
window.storage = storage;