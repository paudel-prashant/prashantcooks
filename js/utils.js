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

    // Export utilities
    window.PrashantCooks = window.PrashantCooks || {};
    window.PrashantCooks.utils = {
        ...window.PrashantCooks.utils,
        escapeHtml,
        debounce,
        formatTime,
        getDifficultyColor,
        isInViewport,
        scrollToElement
    };
})();