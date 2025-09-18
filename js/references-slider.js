/**
 * References Section - DDOSoft Website
 * Handles logo interactions and accessibility
 */

class ReferencesSection {
    constructor() {
        this.section = document.getElementById('references');
        this.logoItems = this.section?.querySelectorAll('.logo-item');
        this.metricItems = this.section?.querySelectorAll('.metric-item');

        this.init();
    }

    init() {
        if (!this.section) return;

        this.setupLogoInteractions();
        this.setupAccessibility();
        this.setupIntersectionObserver();
    }

    setupLogoInteractions() {
        // Add keyboard interaction for logo items
        this.logoItems?.forEach((item, index) => {
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');

            const label = item.querySelector('.logo-item__label');
            if (label) {
                item.setAttribute('aria-label', `Technology: ${label.textContent}`);
            }

            // Keyboard interaction
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleLogoClick(item);
                }
            });

            // Mouse interaction
            item.addEventListener('click', () => {
                this.handleLogoClick(item);
            });
        });
    }

    setupAccessibility() {
        // Add ARIA labels for metric items
        this.metricItems?.forEach((item) => {
            const number = item.querySelector('.metric-item__number');
            const label = item.querySelector('.metric-item__label');

            if (number && label) {
                item.setAttribute('aria-label', `Metric: ${number.textContent} ${label.textContent}`);
                item.setAttribute('tabindex', '0');
            }
        });

        // Set up section accessibility
        this.section.setAttribute('role', 'region');
        this.section.setAttribute('aria-label', 'Technologies and partnerships');
    }

    handleLogoClick(logoItem) {
        // Add a subtle click feedback
        logoItem.style.transform = 'scale(0.95)';
        setTimeout(() => {
            logoItem.style.transform = '';
        }, 150);

        // Optional: You can add more interactions here
        // For example, showing more details about the technology
        const label = logoItem.querySelector('.logo-item__label');
        if (label) {
            // Could trigger a modal or tooltip with more information
            console.log(`Clicked on: ${label.textContent}`);
        }
    }

    setupIntersectionObserver() {
        // Animate logos when they come into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const logos = entry.target.querySelectorAll('.logo-item, .metric-item');
                    logos.forEach((logo, index) => {
                        setTimeout(() => {
                            logo.style.opacity = '1';
                            logo.style.transform = 'translateY(0)';
                        }, index * 100); // Stagger the animations
                    });
                }
            });
        }, { threshold: 0.2 });

        // Initially hide items for animation
        const allItems = this.section.querySelectorAll('.logo-item, .metric-item');
        allItems.forEach((item) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });

        observer.observe(this.section);
    }

    // Public method to highlight a specific technology
    highlightTechnology(techName) {
        this.logoItems?.forEach((item) => {
            const label = item.querySelector('.logo-item__label');
            if (label && label.textContent.toLowerCase() === techName.toLowerCase()) {
                item.classList.add('logo-item--highlighted');
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // Public method to get all technologies
    getTechnologies() {
        const technologies = [];
        this.logoItems?.forEach((item) => {
            const label = item.querySelector('.logo-item__label');
            if (label) {
                technologies.push(label.textContent);
            }
        });
        return technologies;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const referencesSection = new ReferencesSection();

    // Make it globally accessible if needed
    window.ReferencesSection = referencesSection;
});