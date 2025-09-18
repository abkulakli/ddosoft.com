/**
 * Homepage Articles Filtering and Management
 * Handles article filtering, search, and load more functionality on the main page
 */

class HomepageArticles {
    constructor() {
        this.container = document.querySelector('#articles-grid');
        this.filterButtons = document.querySelectorAll('.filter__btn');
        this.searchInput = document.querySelector('.filter__search-input');
        this.searchButton = document.querySelector('.filter__search-btn');
        this.loadMoreButton = document.querySelector('#load-more-articles');
        
        this.currentFilter = 'all';
        this.currentSearchTerm = '';
        this.hiddenArticles = document.querySelectorAll('.article--hidden');
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        this.bindEvents();
        this.updateArticleVisibility();
    }
    
    bindEvents() {
        // Filter buttons
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleFilterClick(e.target);
            });
        });
        
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
            
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
        
        // Load more button
        if (this.loadMoreButton) {
            this.loadMoreButton.addEventListener('click', () => {
                this.showMoreArticles();
            });
        }
    }
    
    handleFilterClick(button) {
        const category = button.dataset.category;
        
        // Update active button
        this.filterButtons.forEach(btn => btn.classList.remove('filter__btn--active'));
        button.classList.add('filter__btn--active');
        
        // Update current filter
        this.currentFilter = category;
        this.updateArticleVisibility();
    }
    
    handleSearch(searchTerm) {
        this.currentSearchTerm = searchTerm.toLowerCase().trim();
        this.updateArticleVisibility();
    }
    
    updateArticleVisibility() {
        const articles = this.container.querySelectorAll('.article');
        let visibleCount = 0;
        
        articles.forEach(article => {
            const shouldShow = this.shouldShowArticle(article);
            
            if (shouldShow) {
                article.style.display = 'block';
                article.classList.remove('article--filtered');
                visibleCount++;
            } else {
                article.style.display = 'none';
                article.classList.add('article--filtered');
            }
        });
        
        // Update load more button visibility
        this.updateLoadMoreButton();
        
        // Show no results message if needed
        this.showNoResultsMessage(visibleCount === 0);
    }
    
    shouldShowArticle(article) {
        // Check if article is hidden by default (for load more functionality)
        const isHidden = article.classList.contains('article--hidden');
        
        // Category filter
        const articleCategory = article.dataset.category || '';
        const categoryMatch = this.currentFilter === 'all' || articleCategory === this.currentFilter;
        
        // Search filter
        let searchMatch = true;
        if (this.currentSearchTerm) {
            const title = article.querySelector('.article__title')?.textContent.toLowerCase() || '';
            const excerpt = article.querySelector('.article__excerpt')?.textContent.toLowerCase() || '';
            const category = article.querySelector('.article__category')?.textContent.toLowerCase() || '';
            
            searchMatch = title.includes(this.currentSearchTerm) || 
                         excerpt.includes(this.currentSearchTerm) || 
                         category.includes(this.currentSearchTerm);
        }
        
        // Show if it matches filters and is either visible by default or we're showing more
        return categoryMatch && searchMatch && !isHidden;
    }
    
    showMoreArticles() {
        const hiddenArticles = this.container.querySelectorAll('.article--hidden');
        let shown = 0;
        const showCount = 3; // Show 3 more articles at a time
        
        hiddenArticles.forEach(article => {
            if (shown < showCount) {
                article.classList.remove('article--hidden');
                shown++;
            }
        });
        
        // Update visibility based on current filters
        this.updateArticleVisibility();
    }
    
    updateLoadMoreButton() {
        if (!this.loadMoreButton) return;
        
        const hiddenArticles = this.container.querySelectorAll('.article--hidden');
        const hasHiddenArticles = hiddenArticles.length > 0;
        
        if (hasHiddenArticles) {
            this.loadMoreButton.style.display = 'block';
        } else {
            this.loadMoreButton.style.display = 'none';
        }
    }
    
    showNoResultsMessage(show) {
        let noResultsMessage = this.container.querySelector('.no-results-message');
        
        if (show && !noResultsMessage) {
            noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'no-results-message';
            noResultsMessage.innerHTML = `
                <div class="no-results-content">
                    <p>No articles found matching your criteria.</p>
                    <button class="btn btn--secondary" onclick="homepageArticles.clearFilters()">Clear Filters</button>
                </div>
            `;
            this.container.appendChild(noResultsMessage);
        } else if (!show && noResultsMessage) {
            noResultsMessage.remove();
        }
    }
    
    clearFilters() {
        // Reset filter to all
        this.filterButtons.forEach(btn => btn.classList.remove('filter__btn--active'));
        const allButton = document.querySelector('[data-category="all"]');
        if (allButton) allButton.classList.add('filter__btn--active');
        
        // Clear search
        if (this.searchInput) this.searchInput.value = '';
        
        // Reset state
        this.currentFilter = 'all';
        this.currentSearchTerm = '';
        
        // Update visibility
        this.updateArticleVisibility();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.homepageArticles = new HomepageArticles();
});