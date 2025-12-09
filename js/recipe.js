/**
 * Recipe Detail Page JavaScript
 * Handles dynamic recipe page rendering from JSON
 */

(function () {
    'use strict';

    // Get recipe ID from URL
    function getRecipeId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    // Load and display recipe
    async function loadRecipe() {
        const recipeId = getRecipeId();
        if (!recipeId) {
            showError('No recipe ID provided');
            return;
        }

        try {
            const response = await fetch('/data/recipes.json');
            if (!response.ok) {
                throw new Error('Failed to load recipes');
            }
            const data = await response.json();
            const recipe = data.recipes.find(r => r.id === recipeId);

            if (!recipe) {
                showError('Recipe not found');
                return;
            }

            renderRecipe(recipe);
            updateMetaTags(recipe);
            addStructuredData(recipe);
        } catch (error) {
            console.error('Error loading recipe:', error);
            showError('Failed to load recipe. Please try again.');
        }
    }

    // Render recipe content
    function renderRecipe(recipe) {
        const container = document.querySelector('.recipe-container');
        if (!container) return;

        container.innerHTML = `
      <div class="recipe-header">
        <h1>${escapeHtml(recipe.title)}</h1>
        <div class="recipe-meta">
          <div class="meta-item">
            <strong><span class="material-icons" style="font-size: 1rem; vertical-align: middle;">schedule</span> Time:</strong> ${escapeHtml(recipe.time)}
          </div>
          <div class="meta-item">
            <strong><span class="material-icons" style="font-size: 1rem; vertical-align: middle;">assessment</span> Difficulty:</strong> ${escapeHtml(recipe.difficulty)}
          </div>
          <div class="meta-item">
            <strong><span class="material-icons" style="font-size: 1rem; vertical-align: middle;">folder</span> Categories:</strong> ${recipe.category.map(cat => escapeHtml(cat)).join(', ')}
          </div>
        </div>
        ${recipe.image ? `
          <img 
            src="/assets/images/${recipe.image}" 
            alt="${escapeHtml(recipe.title)}"
            class="recipe-image"
            data-src="/assets/images/${recipe.image}"
            loading="lazy"
            onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'800\' height=\'400\'%3E%3Crect fill=\'%23ddd\' width=\'800\' height=\'400\'/%3E%3Ctext fill=\'%23999\' font-family=\'sans-serif\' font-size=\'24\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3E${encodeURIComponent(recipe.title)}%3C/text%3E%3C/svg%3E'"
          >
        ` : ''}
        ${recipe.description ? `<p class="recipe-description">${escapeHtml(recipe.description)}</p>` : ''}
      </div>

      <div class="action-buttons">
        <button class="btn btn-primary" onclick="window.print()"><span class="material-icons" style="font-size: 1rem; vertical-align: middle;">print</span> Print Recipe</button>
        <button class="btn btn-secondary" onclick="shareRecipe()"><span class="material-icons" style="font-size: 1rem; vertical-align: middle;">share</span> Share Recipe</button>
      </div>

      ${recipe.youtube ? `
        <div class="youtube-embed">
          <iframe 
            src="https://www.youtube.com/embed/${getYouTubeId(recipe.youtube)}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
      ` : ''}

      <div class="recipe-content">
        <div class="ingredients-section">
          <h2>Ingredients</h2>
          <ul class="ingredients-list">
            ${recipe.ingredients.map(ing => `<li>${escapeHtml(ing)}</li>`).join('')}
          </ul>
        </div>

        <div class="steps-section">
          <h2>Instructions</h2>
          <ol class="steps-list">
            ${recipe.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}
          </ol>
        </div>
      </div>

      ${recipe.nutrition ? `
        <div class="nutrition-info">
          <h3>Nutrition Information</h3>
          <p>${escapeHtml(recipe.nutrition)}</p>
        </div>
      ` : ''}
    `;

        // Re-initialize lazy loading
        if (window.PrashantCooks && window.PrashantCooks.utils) {
            window.PrashantCooks.utils.initLazyLoading();
        }
    }

    // Update meta tags for SEO
    function updateMetaTags(recipe) {
        const title = `${recipe.title} | Prashant Cooks`;
        document.title = title;

        // Update or create meta tags
        updateMetaTag('og:title', title);
        updateMetaTag('og:description', recipe.description || '');
        updateMetaTag('og:image', recipe.image ? `/assets/images/${recipe.image}` : '');
        updateMetaTag('og:url', window.location.href);
        updateMetaTag('og:type', 'article');
        updateMetaTag('description', recipe.description || '');
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', title);
        updateMetaTag('twitter:description', recipe.description || '');
        updateMetaTag('twitter:image', recipe.image ? `/assets/images/${recipe.image}` : '');
    }

    // Helper to update or create meta tag
    function updateMetaTag(property, content) {
        let meta = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            if (property.startsWith('og:') || property.startsWith('twitter:')) {
                meta.setAttribute('property', property);
            } else {
                meta.setAttribute('name', property);
            }
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    }

    // Add structured data (JSON-LD) for SEO
    function addStructuredData(recipe) {
        // Remove existing structured data
        const existing = document.querySelector('script[type="application/ld+json"][data-recipe]');
        if (existing) {
            existing.remove();
        }

        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'Recipe',
            name: recipe.title,
            description: recipe.description || '',
            image: recipe.image ? `/assets/images/${recipe.image}` : '',
            prepTime: recipe.time,
            cookTime: recipe.time,
            totalTime: recipe.time,
            recipeCategory: recipe.category.join(', '),
            recipeDifficulty: recipe.difficulty,
            recipeIngredient: recipe.ingredients,
            recipeInstructions: recipe.steps.map((step, index) => ({
                '@type': 'HowToStep',
                position: index + 1,
                text: step
            })),
            nutrition: recipe.nutrition ? {
                '@type': 'NutritionInformation',
                calories: recipe.nutrition
            } : undefined
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-recipe', 'true');
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }

    // Extract YouTube video ID from URL
    function getYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    }

    // Share recipe functionality
    function shareRecipe() {
        if (navigator.share) {
            navigator.share({
                title: document.title,
                text: document.querySelector('.recipe-description')?.textContent || '',
                url: window.location.href
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('Recipe link copied to clipboard!');
            }).catch(() => {
                // Final fallback
                prompt('Copy this link:', window.location.href);
            });
        }
    }

    // Show error message
    function showError(message) {
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
        <div class="error-message">
          <h2><span class="material-icons" style="vertical-align: middle; margin-right: 0.5rem;">error_outline</span>Error</h2>
          <p>${escapeHtml(message)}</p>
          <a href="/recipes.html" class="btn btn-primary" style="margin-top: 1rem; display: inline-block;">
            <span class="material-icons">arrow_back</span>
            Back to Recipes
          </a>
        </div>
      `;
        }
    }

    // Use shared utility function
    const escapeHtml = window.PrashantCooks?.utils?.escapeHtml || function (text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // Make shareRecipe available globally
    window.shareRecipe = shareRecipe;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        loadRecipe();
    });
})();