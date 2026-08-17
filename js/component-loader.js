/**
 * Component Loader for DDOSoft Website
 * Dynamically loads header and footer components to eliminate code duplication
 */

class ComponentLoader {
    constructor() {
        this.pathPrefix = ComponentLoader.getPathPrefix();
        this.componentsPath = `${this.pathPrefix}components/`;
        this.loadedComponents = new Map();
    }

    /**
     * Relative prefix back to the site root, derived from directory depth.
     *
     * Root pages get '', articles/x.html gets '../', articles/tr/x.html gets
     * '../../'. Counting depth rather than matching '/articles/' is what makes
     * the nested per-language article directories resolve.
     */
    static getPathPrefix() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);
        // A trailing slash means every segment is a directory; otherwise the
        // last segment is the document itself and does not add depth.
        const depth = path.endsWith('/') ? segments.length : Math.max(0, segments.length - 1);
        return '../'.repeat(depth);
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

            console.log('Footer component loaded successfully');
        } catch (error) {
            console.error('Failed to load footer component:', error);
        }
    }

    /**
     * Rewrite the shared components' root-relative links for the current depth.
     *
     * Header and footer are authored for the homepage, so their section links
     * are bare fragments ('#about'). Away from the root those must point back
     * at index.html, and any link to another page needs the depth prefix.
     */
    resolveInternalLinks() {
        if (!this.pathPrefix) return;

        // Section fragments become links back to the homepage's sections.
        document.querySelectorAll('.nav__link[href^="#"], .footer__link[href^="#"]').forEach(link => {
            link.setAttribute('href', `${this.pathPrefix}index.html${link.getAttribute('href')}`);
        });

        // Links to sibling pages ('articles.html') need the prefix too.
        document.querySelectorAll('[data-internal-link]').forEach(link => {
            link.setAttribute('href', `${this.pathPrefix}${link.getAttribute('data-internal-link')}`);
        });

        const logoLink = document.querySelector('.nav__logo');
        if (logoLink) {
            logoLink.setAttribute('href', `${this.pathPrefix}index.html`);
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

        // Resolve component links once both components are in the DOM
        this.resolveInternalLinks();
    }
}

// Create global instance and initialize when DOM is ready
let componentLoader;

document.addEventListener('DOMContentLoaded', async () => {
    componentLoader = new ComponentLoader();
    await componentLoader.loadAllComponents();
    document.dispatchEvent(new CustomEvent('componentsLoaded'));
    window.componentLoader = componentLoader;
});

// Export for use in other scripts
window.ComponentLoader = ComponentLoader;
window.componentLoader = componentLoader;