/**
 * Component Loader for DDOSoft Website
 * Dynamically loads header and footer components to eliminate code duplication
 */

class ComponentLoader {
    constructor() {
        this.componentsPath = this.getComponentsPath();
        this.loadedComponents = new Map();
    }

    /**
     * Determine the correct path to components based on current page location
     */
    getComponentsPath() {
        const currentPath = window.location.pathname;
        
        // If we're in an article subdirectory, use relative path
        if (currentPath.includes('/articles/')) {
            return '../components/';
        }
        
        // For root directory pages
        return 'components/';
    }

    /**
     * Load a component from the components directory
     * @param {string} componentName - Name of the component file (without .html)
     * @returns {Promise<string>} - HTML content of the component
     */
    async loadComponent(componentName) {
        // Check if component is already loaded
        if (this.loadedComponents.has(componentName)) {
            return this.loadedComponents.get(componentName);
        }

        try {
            const response = await fetch(`${this.componentsPath}${componentName}.html`);
            
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentName} (${response.status})`);
            }
            
            const html = await response.text();
            
            // Cache the component
            this.loadedComponents.set(componentName, html);
            
            return html;
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            return `<!-- Component ${componentName} failed to load -->`;
        }
    }

    /**
     * Insert header component into the page
     */
    async loadHeader() {
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (!headerPlaceholder) {
            console.warn('Header placeholder not found');
            return;
        }

        try {
            const headerHtml = await this.loadComponent('header');
            headerPlaceholder.outerHTML = headerHtml;
            
            // Update navigation links for article pages
            this.updateNavigationLinks();
            
            console.log('Header component loaded successfully');
        } catch (error) {
            console.error('Failed to load header component:', error);
        }
    }

    /**
     * Insert footer component into the page
     */
    async loadFooter() {
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (!footerPlaceholder) {
            console.warn('Footer placeholder not found');
            return;
        }

        try {
            const footerHtml = await this.loadComponent('footer');
            footerPlaceholder.outerHTML = footerHtml;
            
            // Update footer links for article pages
            this.updateFooterLinks();
            
            console.log('Footer component loaded successfully');
        } catch (error) {
            console.error('Failed to load footer component:', error);
        }
    }

    /**
     * Update navigation links for article pages
     */
    updateNavigationLinks() {
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('/articles/')) {
            // Update navigation links to point back to index.html
            const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    link.setAttribute('href', `../index.html${href}`);
                }
            });

            // Update logo link
            const logoLink = document.querySelector('.nav__logo');
            if (logoLink) {
                logoLink.setAttribute('href', '../index.html');
            }
        }
    }

    /**
     * Update footer links for article pages
     */
    updateFooterLinks() {
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('/articles/')) {
            // Update footer links to point back to index.html
            const footerLinks = document.querySelectorAll('.footer__link[href^="#"]');
            footerLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    link.setAttribute('href', `../index.html${href}`);
                }
            });
        }
    }

    /**
     * Load all components (header and footer)
     */
    async loadAllComponents() {
        await Promise.all([
            this.loadHeader(),
            this.loadFooter()
        ]);
    }
}

// Create global instance and initialize when DOM is ready
let componentLoader;

document.addEventListener('DOMContentLoaded', async () => {
    componentLoader = new ComponentLoader();
    await componentLoader.loadAllComponents();
});

// Export for use in other scripts
window.ComponentLoader = ComponentLoader;
window.componentLoader = componentLoader;