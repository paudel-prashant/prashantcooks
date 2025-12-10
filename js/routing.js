/**
 * Routing for GitHub Pages
 * Handles clean URLs and base path detection
 */

(function() {
    'use strict';
    
    // Detect base path (repo name for project sites)
    function detectBasePath() {
        const pathname = window.location.pathname;
        const segments = pathname.split('/').filter(s => s);
        
        // If first segment doesn't have a file extension, it's likely the repo name
        if (segments.length > 0) {
            const firstSegment = segments[0];
            if (!firstSegment.includes('.')) {
                return '/' + firstSegment + '/';
            }
        }
        
        // Default to root for user sites
        return '/';
    }
    
    // Get clean URL (without .html)
    function getCleanUrl(path) {
        const basePath = detectBasePath();
        // Remove leading slash and .html extension
        const cleanPath = path.replace(/^\/+/, '').replace(/\.html$/, '');
        
        // Special case: home page
        if (cleanPath === '' || cleanPath === 'index') {
            return basePath;
        }
        
        return basePath + cleanPath;
    }
    
    // Update all internal links to use clean URLs
    function updateLinks() {
        const basePath = detectBasePath();
        const links = document.querySelectorAll('a[href]');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // Skip external links, anchors, and already processed links
            if (!href || 
                href.startsWith('http://') || 
                href.startsWith('https://') || 
                href.startsWith('mailto:') || 
                href.startsWith('tel:') ||
                href.startsWith('#') ||
                link.dataset.routed === 'true') {
                return;
            }
            
            // Convert .html links to clean URLs
            if (href.endsWith('.html') || href === 'index.html') {
                const cleanUrl = getCleanUrl(href);
                link.setAttribute('href', cleanUrl);
                link.dataset.routed = 'true';
            }
            // Convert relative paths without extension
            else if (!href.startsWith('/') && !href.includes('://') && !href.includes('?')) {
                // Already relative, just ensure no .html
                const cleanUrl = href.replace(/\.html$/, '');
                if (cleanUrl !== href) {
                    link.setAttribute('href', cleanUrl);
                }
                link.dataset.routed = 'true';
            }
            // Handle absolute paths starting with /
            else if (href.startsWith('/') && !href.startsWith('//')) {
                // Check if it's a known page
                const knownPages = ['/', '/recipes', '/about', '/contact', '/recipe'];
                const isKnownPage = knownPages.some(page => href.startsWith(page));
                
                if (isKnownPage) {
                    // Only modify if we have a base path (GitHub Pages project site)
                    // On Vercel or user sites, basePath will be '/' so don't modify
                    if (basePath && basePath !== '/') {
                        const pathWithoutSlash = href.replace(/^\/+/, '').replace(/\.html$/, '');
                        if (pathWithoutSlash === '' || pathWithoutSlash === 'index') {
                            link.setAttribute('href', basePath);
                        } else {
                            link.setAttribute('href', basePath + pathWithoutSlash);
                        }
                    }
                    // If basePath is '/', keep the absolute path as-is
                    link.dataset.routed = 'true';
                }
            }
        });
    }
    
    // Update onclick handlers in JavaScript-generated content
    const originalLocationHref = window.location.href;
    
    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateLinks);
    } else {
        updateLinks();
    }
    
    // Also update after dynamic content is added
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                shouldUpdate = true;
            }
        });
        if (shouldUpdate) {
            updateLinks();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Export for use in other scripts
    window.PrashantCooks = window.PrashantCooks || {};
    window.PrashantCooks.routing = {
        getCleanUrl: getCleanUrl,
        detectBasePath: detectBasePath
    };
})();

