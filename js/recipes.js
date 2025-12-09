/**
 * Recipes Listing Page JavaScript
 * Handles search, filters, and recipe grid display
 */

(function () {
    'use strict';

    let allRecipes = [];
    let filteredRecipes = [];

    // Load recipes from JSON
    async function loadRecipes() {
        try {
            const response = await fetch('/data/recipes.json');
            if (!response.ok) {
                throw new Error('Failed to load recipes');
            }
            const data = await response.json();
            allRecipes = data.recipes || [];
            filteredRecipes = [...allRecipes];
            renderRecipes();
            initFilters();
        } catch (error) {
            console.error('Error loading recipes:', error);
            showError('Failed to load recipes. Please refresh the page.');
        }
    }

    // Render recipes grid
    function renderRecipes() {
        const grid = document.querySelector('.recipes-grid');
        if (!grid) return;

        if (filteredRecipes.length === 0) {
            grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <span class="material-icons">search_off</span>
          <h3>No recipes found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      `;
            return;
        }

        grid.innerHTML = filteredRecipes.map(recipe => `
      <article class="recipe-card" onclick="window.location.href='/recipe.html?id=${recipe.id}'">
        <div class="recipe-card-image-wrapper">
          <img 
            src="/assets/images/${recipe.image}" 
            alt="${recipe.title}"
            class="recipe-card-image"
            data-src="/assets/images/${recipe.image}"
            loading="lazy"
            onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'200\'%3E%3Crect fill=\'%23ddd\' width=\'400\' height=\'200\'/%3E%3Ctext fill=\'%23999\' font-family=\'sans-serif\' font-size=\'18\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3E${encodeURIComponent(recipe.title)}%3C/text%3E%3C/svg%3E'"
          >
        </div>
        <div class="recipe-card-content">
          <h3 class="recipe-card-title">${escapeHtml(recipe.title)}</h3>
            <div class="recipe-card-meta">
                <span><span class="material-icons" style="font-size: 1rem; vertical-align: middle;">schedule</span> ${recipe.time}</span>
                <span><span class="material-icons" style="font-size: 1rem; vertical-align: middle;">assessment</span> ${recipe.difficulty}</span>
              </div>
          <p class="recipe-card-description">${escapeHtml(recipe.description || '')}</p>
          <div class="recipe-card-categories">
            ${recipe.category.map(cat => `<span class="category-tag">${escapeHtml(cat)}</span>`).join('')}
          </div>
        </div>
      </article>
    `).join('');

        // Re-initialize lazy loading for new images
        if (window.PrashantCooks && window.PrashantCooks.utils) {
            window.PrashantCooks.utils.initLazyLoading();
        }
    }

    // Initialize filters
    function initFilters() {
        const searchBox = document.querySelector('.search-box');
        const categoryFilters = document.querySelectorAll('.filter-btn[data-filter="category"]');
        const difficultyFilters = document.querySelectorAll('.filter-btn[data-filter="difficulty"]');

        // Search functionality with debouncing
        if (searchBox) {
            const debounceFn = window.PrashantCooks?.utils?.debounce;
            if (typeof debounceFn === 'function') {
                const debouncedSearch = debounceFn(applyFilters, 300);
                searchBox.addEventListener('input', debouncedSearch);
            } else {
                // Fallback if debounce is not available
                searchBox.addEventListener('input', applyFilters);
            }
        }

        // Category filters
        categoryFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                applyFilters();
            });
        });

        // Difficulty filters
        difficultyFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                applyFilters();
            });
        });
    }

    // Apply all filters
    function applyFilters() {
        const searchTerm = document.querySelector('.search-box')?.value.toLowerCase() || '';
        const activeCategories = Array.from(document.querySelectorAll('.filter-btn[data-filter="category"].active'))
            .map(btn => btn.dataset.value);
        const activeDifficulties = Array.from(document.querySelectorAll('.filter-btn[data-filter="difficulty"].active'))
            .map(btn => btn.dataset.value);

        filteredRecipes = allRecipes.filter(recipe => {
            // Search filter
            const matchesSearch = !searchTerm ||
                recipe.title.toLowerCase().includes(searchTerm) ||
                recipe.description.toLowerCase().includes(searchTerm) ||
                recipe.category.some(cat => cat.toLowerCase().includes(searchTerm));

            // Category filter
            const matchesCategory = activeCategories.length === 0 ||
                recipe.category.some(cat => activeCategories.includes(cat));

            // Difficulty filter
            const matchesDifficulty = activeDifficulties.length === 0 ||
                activeDifficulties.includes(recipe.difficulty);

            return matchesSearch && matchesCategory && matchesDifficulty;
        });

        renderRecipes();
    }

    // Show error message
    function showError(message) {
        const container = document.querySelector('.container');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            container.insertBefore(errorDiv, container.firstChild);
        }
    }

    // Use shared utility function
    const escapeHtml = window.PrashantCooks?.utils?.escapeHtml || function (text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Ensure utils are loaded before initializing
        if (window.PrashantCooks?.utils) {
            loadRecipes();
        } else {
            // Wait a bit for utils to load if not ready
            setTimeout(() => {
                loadRecipes();
            }, 100);
        }
    });
})();