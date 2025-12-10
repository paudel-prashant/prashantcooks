/**
 * Utility Functions
 * Shared helper functions for the Prashant Cooks website
 */

(function () {
    'use strict';

    // Escape HTML to prevent XSS attacks
    function escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Debounce function for search input
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Format time string
    function formatTime(timeString) {
        return timeString || 'Not specified';
    }

    // Get difficulty color (for future use)
    function getDifficultyColor(difficulty) {
        const colors = {
            'Easy': '#4caf50',
            'Medium': '#ff9800',
            'Hard': '#f44336'
        };
        return colors[difficulty] || '#666';
    }

    // Check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Smooth scroll to element
    function scrollToElement(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // Get base path for GitHub Pages
    // Detects if we're on a project page (e.g., /repo-name/) or user page (/)
    function getBasePath() {
        const pathname = window.location.pathname;
        // Extract repository name from pathname
        // For project pages: /repo-name/ or /repo-name/page.html
        const parts = pathname.split('/').filter(p => p && p !== 'index.html');
        
        // If pathname contains what looks like a repo name (not just a page)
        // Check if we're at root of a project page
        if (pathname === '/' || pathname === '/index.html') {
            // At root - check if URL suggests project page
            // For GitHub Pages project sites, the URL is username.github.io/repo-name/
            // We can't reliably detect this from pathname alone, so we'll use a different approach
            return '';
        }
        
        // If we have parts and the first doesn't look like a file, it might be repo name
        if (parts.length > 0) {
            const firstPart = parts[0];
            // If it's not a file (no extension), it might be repo name
            if (!firstPart.includes('.')) {
                // Check if current page is in a subdirectory
                const currentPage = window.location.pathname.split('/').pop();
                if (currentPage && currentPage.includes('.')) {
                    // We're on a page, so the repo name is the parent directory
                    return '/' + firstPart + '/';
                }
            }
        }
        
        return '';
    }

    // Initialize base path on load
    (function initBasePath() {
        const pathname = window.location.pathname;
        let basePath = '';
        
        // Simple detection: if pathname is /repo-name/ or /repo-name/page.html
        const segments = pathname.split('/').filter(s => s);
        if (segments.length > 0) {
            const firstSegment = segments[0];
            // If first segment doesn't have a file extension, it's likely the repo name
            if (!firstSegment.includes('.')) {
                basePath = '/' + firstSegment + '/';
            }
        }
        
        window.PrashantCooks = window.PrashantCooks || {};
        window.PrashantCooks.basePath = basePath;
    })();

    // Helper to get asset path
    function getAssetPath(path) {
        const basePath = window.PrashantCooks?.basePath || '';
        // Remove leading slash from path if present
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return basePath + cleanPath;
    }

    // Export utilities
    window.PrashantCooks = window.PrashantCooks || {};
    window.PrashantCooks.utils = {
        ...window.PrashantCooks.utils,
        escapeHtml,
        debounce,
        formatTime,
        getDifficultyColor,
        isInViewport,
        scrollToElement,
        getBasePath,
        getAssetPath
    };
})();