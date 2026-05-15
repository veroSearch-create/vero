# Search Sanity Chrome Extension

A Chrome extension that fixes the Google Search results page: hides AI Overviews on demand, demotes SEO-spam domains, boosts forum results, and cross-checks AI Overview claims against their cited sources.

## Features

1. **AI Overview hide toggle** - Remove AI Overviews with a single click
2. **Auto `udm=14` mode** - Force Web-only results 
3. **SEO-spam domain demotion** - Visually deprioritize low-quality sites
4. **Reddit / forum result boost** - Highlight and optionally reorder high-signal results
5. **AI Overview source verification** (stretch) - Check if cited sources actually support claims

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `search-sanity` directory

## Development

See [BUILD_SPEC.md](BUILD_SPEC.md) for the complete specification and build order.

## Privacy

This extension runs entirely client-side with no external backend. It only makes requests to Google domains (and optionally to cited sources for verification on user action).

## License

MIT