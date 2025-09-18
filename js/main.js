/**
 * DDOSoft Website JavaScript
 * Modern, accessible, and performant interactions
 */

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Debounce function to limit the rate of function execution
 */
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

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Smooth scroll to element with offset for fixed header
 */
function smoothScrollTo(element, offset = 70) {
    const targetPosition = element.offsetTop - offset;
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

// =============================================================================
// Mobile Navigation
// =============================================================================

class MobileNavigation {
    constructor() {
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav__link');
        this.body = document.body;

        this.isMenuOpen = false;

        this.init();
    }

    init() {
        if (!this.navToggle || !this.navMenu) return;

        // Toggle menu on button click
        this.navToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMenu();
        });

        // Close menu on link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isMenuOpen) {
                    this.closeMenu();
                }
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen &&
                !this.navMenu.contains(e.target) &&
                !this.navToggle.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > 768 && this.isMenuOpen) {
                this.closeMenu();
            }
        }, 250));
    }

    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.navMenu.classList.add('nav__menu--active');
        this.navToggle.classList.add('nav__toggle--active');
        this.navToggle.setAttribute('aria-expanded', 'true');
        this.body.style.overflow = 'hidden';
        this.isMenuOpen = true;

        // Focus first menu item for accessibility
        const firstLink = this.navMenu.querySelector('.nav__link');
        if (firstLink) {
            firstLink.focus();
        }
    }

    closeMenu() {
        this.navMenu.classList.remove('nav__menu--active');
        this.navToggle.classList.remove('nav__toggle--active');
        this.navToggle.setAttribute('aria-expanded', 'false');
        this.body.style.overflow = '';
        this.isMenuOpen = false;
    }
}

// =============================================================================
// Smooth Scrolling Navigation
// =============================================================================

class SmoothScrollNavigation {
    constructor() {
        this.navLinks = document.querySelectorAll('a[href^="#"]');
        this.sections = document.querySelectorAll('section[id]');
        this.header = document.getElementById('header');
        this.headerHeight = 70;

        this.init();
    }

    init() {
        // Add smooth scroll behavior to navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    smoothScrollTo(targetElement, this.headerHeight);

                    // Update URL without jumping
                    if (history.pushState) {
                        history.pushState(null, null, `#${targetId}`);
                    }
                }
            });
        });

        // Update active nav link based on scroll position
        window.addEventListener('scroll', debounce(() => {
            this.updateActiveNavLink();
        }, 100));
    }

    updateActiveNavLink() {
        const scrollPosition = window.scrollY + this.headerHeight + 50;

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all nav links
                this.navLinks.forEach(link => {
                    link.classList.remove('nav__link--active');
                });

                // Add active class to current nav link
                const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('nav__link--active');
                }
            }
        });
    }
}

// =============================================================================
// Header Scroll Effects
// =============================================================================

class HeaderScrollEffects {
    constructor() {
        this.header = document.getElementById('header');
        this.lastScrollTop = 0;
        this.scrollThreshold = 100;

        this.init();
    }

    init() {
        if (!this.header) return;

        window.addEventListener('scroll', debounce(() => {
            this.handleScroll();
        }, 10));
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add/remove scrolled class for styling
        if (scrollTop > this.scrollThreshold) {
            this.header.classList.add('header--scrolled');
        } else {
            this.header.classList.remove('header--scrolled');
        }

        this.lastScrollTop = scrollTop;
    }
}

// =============================================================================
// Intersection Observer for Animations
// =============================================================================

class ScrollAnimations {
    constructor() {
        this.animateElements = document.querySelectorAll('.about__stats, .benefit, .team__member, .product');
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.init();
    }

    init() {
        // Check if user prefers reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                this.handleIntersection(entries);
            }, this.observerOptions);

            this.animateElements.forEach(element => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                this.observer.observe(element);
            });
        }
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                this.observer.unobserve(entry.target);
            }
        });
    }
}

// =============================================================================
// Performance Optimizations
// =============================================================================

class PerformanceOptimizations {
    constructor() {
        this.init();
    }

    init() {
        // Lazy load images when they exist
        this.initLazyLoading();

        // Add smooth scrolling fallback for older browsers
        this.initSmoothScrollPolyfill();

        // Preload critical resources
        this.preloadCriticalResources();
    }

    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const images = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    initSmoothScrollPolyfill() {
        // Fallback for browsers that don't support smooth scrolling
        if (!('scrollBehavior' in document.documentElement.style)) {
            const script = document.createElement('script');
            script.src = 'https://polyfill.io/v3/polyfill.min.js?features=smoothscroll';
            document.head.appendChild(script);
        }
    }

    preloadCriticalResources() {
        // Preload hero section resources if they exist
        const heroImages = document.querySelectorAll('.hero img');
        heroImages.forEach(img => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = img.src;
            document.head.appendChild(link);
        });
    }
}

// =============================================================================
// Accessibility Enhancements
// =============================================================================

class AccessibilityEnhancements {
    constructor() {
        this.init();
    }

    init() {
        // Skip to content link
        this.addSkipLink();

        // Focus management
        this.manageFocus();

        // Keyboard navigation
        this.enhanceKeyboardNavigation();
    }

    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--color-primary);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.2s ease;
        `;

        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    manageFocus() {
        // Ensure focus is visible
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('using-keyboard');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('using-keyboard');
        });
    }

    enhanceKeyboardNavigation() {
        // Enhanced keyboard support for interactive elements
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    }
}

// =============================================================================
// Main Initialization
// =============================================================================

class DDOSoftWebsite {
    constructor() {
        this.components = [];
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeComponents();
            });
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Initialize all components
            this.components = [
                new LanguageManager(),
                new MobileNavigation(),
                new SmoothScrollNavigation(),
                new HeaderScrollEffects(),
                new ScrollAnimations(),
                new PerformanceOptimizations(),
                new AccessibilityEnhancements(),
                new ProductModal()
            ];

            console.log('DDOSoft website initialized successfully');
        } catch (error) {
            console.error('Error initializing website components:', error);
        }
    }

    // Public method to reinitialize if needed
    reinitialize() {
        this.initializeComponents();
    }
}

// =============================================================================
// Initialize Website
// =============================================================================

// Create global instance
window.ddosoftWebsite = new DDOSoftWebsite();

// Add CSS for JavaScript-enhanced elements
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    /* Form Error Styles */
    .form__input--error,
    .form__textarea--error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }

    .form__error {
        color: #ef4444;
        font-size: var(--font-size-sm);
        margin-top: var(--spacing-xs);
        display: block;
    }

    /* Button Loading State */
    .btn--loading {
        opacity: 0.7;
        cursor: not-allowed;
    }

    /* Skip Link Enhancement */
    .using-keyboard *:focus {
        outline: 2px solid var(--color-primary) !important;
        outline-offset: 2px !important;
    }

    /* Smooth reveal animation fallback */
    @media (prefers-reduced-motion: reduce) {
        .about__stats,
        .benefit,
        .team__member,
        .product {
            opacity: 1 !important;
            transform: none !important;
        }
    }
`;

document.head.appendChild(dynamicStyles);

// =============================================================================
// Product Modal
// =============================================================================

class ProductModal {
    constructor() {
        this.modal = document.getElementById('product-detail-modal');
        this.modalContent = document.getElementById('product-detail-content');
        this.closeButton = null;
        this.productCards = document.querySelectorAll('.product-card');
        this.isOpen = false;

        this.init();
    }

    init() {
        if (!this.modal || !this.modalContent) return;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Product card click events
        this.productCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('product-card__details-btn') &&
                    !e.target.closest('.product-card__details-btn')) return;

                e.preventDefault();
                const productId = card.dataset.product;
                this.showProductDetail(productId);
            });

            // Add click event for the details button specifically
            const detailsBtn = card.querySelector('.product-card__details-btn');
            if (detailsBtn) {
                detailsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const productId = card.dataset.product;
                    this.showProductDetail(productId);
                });
            }
        });

        // Close modal events
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal || e.target.classList.contains('product-detail-modal__overlay')) {
                this.closeModal();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeModal();
            }
        });
    }

    showProductDetail(productId) {
        const productData = this.getProductData(productId);
        if (!productData) return;

        this.modalContent.innerHTML = this.renderProductDetail(productData);

        // Set up close button after content is rendered
        this.closeButton = this.modal.querySelector('.product-detail-modal__close');
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.closeModal());
        }

        this.openModal();
    }

    getProductData(productId) {
        // Product data definitions
        const products = {
            ddogreen: {
                id: 'ddogreen',
                name: 'DDOGreen',
                tagline: 'Smart Power Management That Just Works',
                version: 'v0.3.1',
                intro: 'DDOGreen is an intelligent, production-ready power management tool that automatically switches your laptop between high-performance and power-saving modes based on actual system usage.',
                highlight: '20-30% longer battery life with zero performance compromise',
                features: [
                    {
                        title: 'Automatic Power Management',
                        description: 'Intelligent switching based on CPU load monitoring'
                    },
                    {
                        title: 'Cross-Platform Support',
                        description: 'Native Linux (TLP) and Windows (Power Plans) integration'
                    },
                    {
                        title: 'Zero Configuration',
                        description: 'Works perfectly out of the box with hardcoded sensible defaults'
                    },
                    {
                        title: 'Enterprise Ready',
                        description: 'Full systemd and Windows Service Manager integration'
                    },
                    {
                        title: 'Production Quality',
                        description: '122 comprehensive unit tests and professional CI/CD validation'
                    }
                ],
                platforms: {
                    linux: {
                        title: 'Linux Systems',
                        features: [
                            'TLP integration (tlp ac / tlp bat)',
                            'Systemd service management',
                            'DEB, RPM, and TGZ packages',
                            'Native /proc/loadavg monitoring'
                        ]
                    },
                    windows: {
                        title: 'Windows Systems',
                        features: [
                            'Windows Power Plans integration',
                            'Service Manager integration',
                            'MSI installer package',
                            'Performance Counters monitoring'
                        ]
                    }
                },
                architecture: {
                    title: 'Technical Architecture',
                    features: [
                        'Modern C++20 with cross-platform compatibility',
                        'Smart hysteresis behavior (70% high performance, 30% power save)',
                        'Real-time CPU load monitoring with platform optimizations',
                        'Professional logging and error handling',
                        'Memory-efficient design with minimal system impact'
                    ]
                },
                links: {
                    download: 'https://github.com/abkulakli/ddogreen/releases/latest',
                    github: 'https://github.com/abkulakli/ddogreen'
                }
            }
        };

        return products[productId] || null;
    }

    renderProductDetail(product) {
        return `
            <div class="product-detail">
                <div class="product-detail__header">
                    <h3 class="product-detail__name">${product.name}</h3>
                    <p class="product-detail__tagline">${product.tagline}</p>
                    <p class="product-detail__version">Latest Version: ${product.version}</p>
                </div>

                <div class="product-detail__content">
                    <div class="product-detail__description">
                        <p class="product-detail__intro">${product.intro}</p>
                        <div class="product-detail__highlight">
                            <strong>${product.highlight}</strong>
                        </div>
                    </div>

                    <div class="product-detail__features">
                        <h4>Key Features</h4>
                        <ul class="feature-list">
                            ${product.features.map(feature => `
                                <li class="feature-item">
                                    <strong>${feature.title}:</strong>
                                    <span>${feature.description}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class="product-detail__platforms">
                        <h4>Platform Support</h4>
                        <div class="platforms">
                            <div class="platform">
                                <h5>${product.platforms.linux.title}</h5>
                                <ul>
                                    ${product.platforms.linux.features.map(feature => `<li>${feature}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="platform">
                                <h5>${product.platforms.windows.title}</h5>
                                <ul>
                                    ${product.platforms.windows.features.map(feature => `<li>${feature}</li>`).join('')}
                                </ul>
                            </div>
                        </div>

                        <div class="product-detail__architecture">
                            <h4>${product.architecture.title}</h4>
                            <ul class="feature-list">
                                ${product.architecture.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>
                    </div>

                    <div class="product-detail__cta">
                        <a href="${product.links.download}" class="btn btn--primary" target="_blank" rel="noopener">
                            Download ${product.name}
                        </a>
                        <a href="${product.links.github}" class="btn btn--secondary" target="_blank" rel="noopener">
                            View on GitHub
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    openModal() {
        this.modal.classList.add('is-active');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;

        // Focus trap setup
        this.setupFocusTrap();

        // Focus the close button
        setTimeout(() => {
            if (this.closeButton) {
                this.closeButton.focus();
            }
        }, 100);
    }

    closeModal() {
        this.modal.classList.remove('is-active');
        document.body.style.overflow = '';
        this.isOpen = false;

        // Return focus to the trigger element if possible
        const activeCard = document.querySelector('.product-card:focus-within');
        if (activeCard) {
            const detailsBtn = activeCard.querySelector('.product-card__details-btn');
            if (detailsBtn) {
                detailsBtn.focus();
            }
        }
    }

    setupFocusTrap() {
        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        this.modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        });
    }
}