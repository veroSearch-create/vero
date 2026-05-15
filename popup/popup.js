// Search Sanity - Popup JavaScript
// Handles UI interactions and settings synchronization with Apple HIG feel

document.addEventListener('DOMContentLoaded', () => {
    // Get references to UI elements
    const hideAiOverviewsCheckbox = document.getElementById('hideAiOverviews');
    const forceUdm14Checkbox = document.getElementById('forceUdm14');
    const demoteSpamDomainsCheckbox = document.getElementById('demoteSpamDomains');
    const boostForumResultsCheckbox = document.getElementById('boostForumResults');
    const manageSitesButton = document.getElementById('manageSites');
    
    // Load settings from storage and update UI
    function loadSettings() {
        chrome.storage.sync.get({
            hideAiOverviews: true,
            forceUdm14: false,
            demoteSpamDomains: true,
            boostForumResults: true
        }, (items) => {
            hideAiOverviewsCheckbox.checked = items.hideAiOverviews;
            forceUdm14Checkbox.checked = items.forceUdm14;
            demoteSpamDomainsCheckbox.checked = items.demoteSpamDomains;
            boostForumResultsCheckbox.checked = items.boostForumResults;
        });
    }
    
    // Save setting when checkbox changes
    function saveSetting(key, value) {
        const update = {};
        update[key] = value;
        chrome.storage.sync.set(update, () => {
            // Optional: provide subtle feedback
            console.log(`Setting ${key} updated to ${value}`);
        });
    }
    
    // Event listeners for checkboxes
    hideAiOverviewsCheckbox.addEventListener('change', (e) => {
        saveSetting('hideAiOverviews', e.target.checked);
    });
    
    forceUdm14Checkbox.addEventListener('change', (e) => {
        saveSetting('forceUdm14', e.target.checked);
    });
    
    demoteSpamDomainsCheckbox.addEventListener('change', (e) => {
        saveSetting('demoteSpamDomains', e.target.checked);
    });
    
    boostForumResultsCheckbox.addEventListener('change', (e) => {
        saveSetting('boostForumResults', e.target.checked);
    });
    
    // Manage sites button
    manageSitesButton.addEventListener('click', () => {
        // Show a more professional alert/modal
        const confirmManage = confirm('Site management is coming in v1.1\\n\\nThis feature will allow you to:\\n• Add/remove domains from spam blocklist\\n• Add/remove domains from forum boost list\\n• Import/export lists for sharing\\n\\nFor now, you can manually edit the JSON files in the extension folder.');
        
        if (confirmManage) {
            // Could open options page here in future
            alert('Feature coming soon!');
        }
    });
    
    // Load initial settings
    loadSettings();
    
    // Listen for storage changes (in case settings are changed elsewhere)
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync') {
            if (changes.hideAiOverviews) {
                hideAiOverviewsCheckbox.checked = changes.hideAiOverviews.newValue;
            }
            if (changes.forceUdm14) {
                forceUdm14Checkbox.checked = changes.forceUdm14.newValue;
            }
            if (changes.demoteSpamDomains) {
                demoteSpamDomainsCheckbox.checked = changes.demoteSpamDomains.newValue;
            }
            if (changes.boostForumResults) {
                boostForumResultsCheckbox.checked = changes.boostForumResults.newValue;
            }
        }
    });
    
    // Add subtle animation on load
    const container = document.querySelector('.popup-container');
    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';
    
    // Trigger reflow for animation
    void container.offsetWidth;
    
    container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
});