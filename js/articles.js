/**
 * Articles Page JavaScript
 * Handles filtering, searching, and loading functionality for articles
 */

class ArticlesPage {
    constructor() {
        this.articles = [];
        this.filteredArticles = [];
        this.currentCategory = 'all';
        this.currentSearchTerm = '';
        this.articlesPerPage = 8;
        this.currentPage = 1;
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadArticles();
    }
    
    cacheElements() {
        this.filterButtons = document.querySelectorAll('.filter__btn');
        this.searchInput = document.querySelector('.filter__search-input');
        this.searchButton = document.querySelector('.filter__search-btn');
        this.articlesGrid = document.querySelector('.articles-grid');
        this.loadMoreButton = document.getElementById('load-more-articles');
        
        // Get all article elements
        this.articleElements = document.querySelectorAll('.article');
    }
    
    bindEvents() {
        // Category filter buttons
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleCategoryFilter(e.target.dataset.category);
            });
        });
        
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
            
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSearch(e.target.value);
                }
            });
        }
        
        if (this.searchButton) {
            this.searchButton.addEventListener('click', () => {
                this.handleSearch(this.searchInput.value);
            });
        }
        
        // Load more functionality
        if (this.loadMoreButton) {
            this.loadMoreButton.addEventListener('click', () => {
                this.loadMoreArticles();
            });
        }
    }
    
    loadArticles() {
        // Convert article elements to article objects
        this.articles = Array.from(this.articleElements).map((element, index) => {
            const category = element.dataset.category || 'all';
            const title = element.querySelector('.article__title a')?.textContent || '';
            const excerpt = element.querySelector('.article__excerpt')?.textContent || '';
            const date = element.querySelector('.article__date')?.textContent || '';
            
            return {
                element,
                category,
                title: title.toLowerCase(),
                excerpt: excerpt.toLowerCase(),
                date,
                index,
                visible: true
            };
        });
        
        this.filteredArticles = [...this.articles];
        this.updateDisplay();
    }
    
    handleCategoryFilter(category) {
        this.currentCategory = category;
        this.currentPage = 1;
        
        // Update active button
        this.filterButtons.forEach(btn => {
            btn.classList.remove('filter__btn--active');
        });
        
        const activeButton = document.querySelector(`[data-category="${category}"]`);
        if (activeButton) {
            activeButton.classList.add('filter__btn--active');
        }
        
        this.applyFilters();
    }
    
    handleSearch(searchTerm) {
        this.currentSearchTerm = searchTerm.toLowerCase();
        this.currentPage = 1;
        this.applyFilters();
    }
    
    applyFilters() {
        // Filter by category
        let filtered = this.articles;
        
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(article => 
                article.category === this.currentCategory
            );
        }
        
        // Filter by search term
        if (this.currentSearchTerm) {
            filtered = filtered.filter(article => 
                article.title.includes(this.currentSearchTerm) || 
                article.excerpt.includes(this.currentSearchTerm)
            );
        }
        
        this.filteredArticles = filtered;
        this.updateDisplay();
    }
    
    updateDisplay() {
        const startIndex = 0;
        const endIndex = this.currentPage * this.articlesPerPage;
        const visibleArticles = this.filteredArticles.slice(startIndex, endIndex);
        
        // Hide all articles first
        this.articles.forEach(article => {
            article.element.classList.add('article--hidden');
            article.visible = false;
        });
        
        // Show filtered articles
        visibleArticles.forEach(article => {
            article.element.classList.remove('article--hidden');
            article.visible = true;
        });
        
        // Update load more button
        this.updateLoadMoreButton();
        
        // Show "no results" message if needed
        this.updateNoResultsMessage();
        
        // Animate visible articles
        this.animateArticles();
    }
    
    updateLoadMoreButton() {
        if (!this.loadMoreButton) return;
        
        const totalVisible = this.currentPage * this.articlesPerPage;
        const hasMore = totalVisible < this.filteredArticles.length;
        
        if (hasMore) {
            this.loadMoreButton.style.display = 'inline-block';
            this.loadMoreButton.textContent = `Load More Articles (${this.filteredArticles.length - totalVisible} remaining)`;
        } else {
            this.loadMoreButton.style.display = 'none';
        }
    }
    
    updateNoResultsMessage() {
        // Remove existing no results message
        const existing = document.querySelector('.articles__no-results');
        if (existing) {
            existing.remove();
        }
        
        // Add no results message if needed
        if (this.filteredArticles.length === 0) {
            const message = document.createElement('div');
            message.className = 'articles__no-results';
            message.style.cssText = `
                text-align: center;
                padding: var(--spacing-4xl);
                color: var(--color-gray-500);
                font-size: var(--font-size-lg);
                grid-column: 1 / -1;
            `;
            message.innerHTML = `
                <div style="margin-bottom: var(--spacing-md);">📝</div>
                <h3>No articles found</h3>
                <p style="margin-top: var(--spacing-sm); font-size: var(--font-size-base);">
                    Try adjusting your search terms or category filter.
                </p>
            `;
            
            this.articlesGrid.appendChild(message);
        }
    }
    
    loadMoreArticles() {
        this.currentPage++;
        this.updateDisplay();
        
        // Smooth scroll to new content
        const newArticles = document.querySelectorAll('.article:not(.article--hidden)');
        const lastVisibleIndex = (this.currentPage - 1) * this.articlesPerPage;
        
        if (newArticles[lastVisibleIndex]) {
            setTimeout(() => {
                newArticles[lastVisibleIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    }
    
    animateArticles() {
        // Only animate if user doesn't prefer reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        const visibleArticles = document.querySelectorAll('.article:not(.article--hidden)');
        
        visibleArticles.forEach((article, index) => {
            article.style.opacity = '0';
            article.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                article.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                article.style.opacity = '1';
                article.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    // Public method to get current filter state
    getFilterState() {
        return {
            category: this.currentCategory,
            searchTerm: this.currentSearchTerm,
            totalArticles: this.articles.length,
            filteredCount: this.filteredArticles.length,
            currentPage: this.currentPage
        };
    }
}

// Enhanced Search Functionality
class ArticlesSearch {
    constructor(articlesPage) {
        this.articlesPage = articlesPage;
        this.searchHistory = [];
        this.init();
    }
    
    init() {
        this.setupSearchSuggestions();
        this.setupKeyboardShortcuts();
    }
    
    setupSearchSuggestions() {
        const searchInput = document.querySelector('.filter__search-input');
        if (!searchInput) return;
        
        // Create suggestions dropdown
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'search__suggestions';
        suggestionsContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid var(--color-gray-300);
            border-top: none;
            border-radius: 0 0 var(--border-radius) var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            display: none;
        `;
        
        // Make search container relative
        const searchContainer = searchInput.closest('.filter__search');
        searchContainer.style.position = 'relative';
        searchContainer.appendChild(suggestionsContainer);
        
        // Add search suggestions logic
        searchInput.addEventListener('input', debounce((e) => {
            this.showSuggestions(e.target.value, suggestionsContainer);
        }, 200));
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                suggestionsContainer.style.display = 'none';
            }
        });
    }
    
    showSuggestions(query, container) {
        if (query.length < 2) {
            container.style.display = 'none';
            return;
        }
        
        // Get suggestions from article titles and content
        const suggestions = this.generateSuggestions(query);
        
        if (suggestions.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.innerHTML = suggestions.map(suggestion => `
            <div class="search__suggestion" style="
                padding: var(--spacing-xs) var(--spacing-md);
                cursor: pointer;
                border-bottom: 1px solid var(--color-gray-100);
                transition: background-color var(--transition-fast);
            " data-query="${suggestion}">
                ${this.highlightMatch(suggestion, query)}
            </div>
        `).join('');
        
        container.style.display = 'block';
        
        // Add click handlers to suggestions
        container.querySelectorAll('.search__suggestion').forEach(item => {
            item.addEventListener('click', () => {
                const searchInput = document.querySelector('.filter__search-input');
                searchInput.value = item.dataset.query;
                this.articlesPage.handleSearch(item.dataset.query);
                container.style.display = 'none';
            });
            
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = 'var(--color-gray-50)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'white';
            });
        });
    }
    
    generateSuggestions(query) {
        const suggestions = new Set();
        const queryLower = query.toLowerCase();
        
        // Extract keywords from articles
        this.articlesPage.articles.forEach(article => {
            const words = (article.title + ' ' + article.excerpt).split(/\s+/);
            words.forEach(word => {
                const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
                if (cleanWord.includes(queryLower) && cleanWord.length > 2) {
                    suggestions.add(cleanWord);
                }
            });
        });
        
        // Add category names as suggestions
        const categories = ['sustainable development', 'green technology', 'power management', 'ddogreen'];
        categories.forEach(cat => {
            if (cat.includes(queryLower)) {
                suggestions.add(cat);
            }
        });
        
        return Array.from(suggestions).slice(0, 5);
    }
    
    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong style="color: var(--color-primary);">$1</strong>');
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('.filter__search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on articles page
    if (document.querySelector('.articles-listing')) {
        const articlesPage = new ArticlesPage();
        new ArticlesSearch(articlesPage);
        
        // Make articlesPage globally accessible for debugging
        window.ddosoftArticles = articlesPage;
        
        console.log('Articles page initialized successfully');
    }
});

// Utility function for debouncing (if not already defined)
if (typeof debounce === 'undefined') {
    function debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }
}