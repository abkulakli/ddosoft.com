class StructuredDataManager {
    constructor(languageManager) {
        this.languageManager = languageManager;
        this.baseUrl = window.location.protocol + '//' + window.location.host;
        this.init();
    }

    init() {
        this.generateOrganizationData();
        this.generateWebSiteData();
        this.generatePageSpecificData();
    }

    generateOrganizationData() {
        const lang = this.languageManager.currentLanguage;

        const organizationData = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "DDOSoft",
            "alternateName": "DDO Software",
            "url": this.baseUrl,
            "logo": `${this.baseUrl}/images/logo.svg`,
            "description": this.languageManager.getTranslation('meta.site.description'),
            "foundingDate": "2024",
            "founder": {
                "@type": "Person",
                "name": "Ayşe Pınar KULAKLI",
                "sameAs": "https://www.linkedin.com/in/apkulakli"
            },
            "contactPoint": {
                "@type": "ContactPoint",
                "email": "info@ddosoft.com",
                "contactType": "customer service",
                "availableLanguage": ["English", "Turkish"]
            },
            "sameAs": [
                "https://www.linkedin.com/company/ddosoft",
                "https://github.com/abkulakli/ddogreen"
            ],
            "industry": "Software Development",
            "speciality": "Sustainable Software Solutions",
            "keywords": this.languageManager.getTranslation('meta.site.keywords')
        };

        this.insertStructuredData('organization', organizationData);
    }

    generateWebSiteData() {
        const lang = this.languageManager.currentLanguage;

        const websiteData = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "DDOSoft",
            "url": this.baseUrl,
            "description": this.languageManager.getTranslation('meta.site.description'),
            "inLanguage": lang === 'tr' ? 'tr-TR' : 'en-US',
            "publisher": {
                "@type": "Organization",
                "name": "DDOSoft"
            }
        };

        this.insertStructuredData('website', websiteData);
    }

    generatePageSpecificData() {
        // Article pages embed their own Article schema in the HTML so that
        // crawlers see it without running JavaScript. Don't add a second one.
        if (this.hasStaticArticleSchema()) {
            return;
        }

        const currentPage = this.getCurrentPageType();

        switch (currentPage) {
            case 'home':
                this.generateHomePageData();
                break;
            case 'articles':
                this.generateBlogData();
                break;
        }
    }

    generateHomePageData() {
        const productData = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "DDOGreen",
            "applicationCategory": "SystemUtility",
            "operatingSystem": ["Linux", "Windows"],
            "description": this.languageManager.getTranslation('products.ddogreen.description'),
            "creator": {
                "@type": "Organization",
                "name": "DDOSoft"
            },
            "downloadUrl": "https://github.com/abkulakli/ddogreen",
            "codeRepository": "https://github.com/abkulakli/ddogreen",
            "programmingLanguage": "C++",
            "version": "0.3.1",
            "license": "https://opensource.org/licenses/MIT",
            "features": [
                "Automatic power mode switching",
                "CPU load monitoring",
                "20-30% battery life extension",
                "Zero configuration required"
            ],
            "requirements": "Linux or Windows operating system"
        };

        this.insertStructuredData('product', productData);
    }

    generateBlogData() {
        const blogData = {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": this.languageManager.getTranslation('meta.pages.articles.title'),
            "description": this.languageManager.getTranslation('meta.pages.articles.description'),
            "url": `${this.baseUrl}/articles.html`,
            "inLanguage": this.languageManager.currentLanguage === 'tr' ? 'tr-TR' : 'en-US',
            "publisher": {
                "@type": "Organization",
                "name": "DDOSoft"
            },
            "about": [
                "Sustainable Software Development",
                "Green Technology",
                "Energy Efficient Computing",
                "Software Performance Optimization"
            ]
        };

        this.insertStructuredData('blog', blogData);
    }

    /**
     * True when the document already ships an Article schema of its own.
     */
    hasStaticArticleSchema() {
        return Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .some(script => {
                try {
                    return JSON.parse(script.textContent)['@type'] === 'Article';
                } catch {
                    return false;
                }
            });
    }

    getCurrentPageType() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';

        if (filename === 'index.html' || filename === '') return 'home';
        if (filename === 'articles.html') return 'articles';

        if (path.includes('/articles/') || filename.includes('.html')) {
            return filename.replace('.html', '');
        }

        return 'home';
    }

    insertStructuredData(id, data) {
        // Remove existing structured data with same id
        const existingScript = document.getElementById(`structured-data-${id}`);
        if (existingScript) {
            existingScript.remove();
        }

        // Create new structured data script
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = `structured-data-${id}`;
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }

    updateStructuredData() {
        // Remove all existing structured data
        const existingScripts = document.querySelectorAll('script[id^="structured-data-"]');
        existingScripts.forEach(script => script.remove());

        // Regenerate all structured data
        this.init();
    }
}

// Build the schema once the translations it reads from are actually loaded.
// Waiting on the event rather than a fixed delay is what makes this reliable —
// the language data arrives over the network, so no timeout is long enough to
// be correct and short enough to be fast.
document.addEventListener('languageApplied', () => {
    if (!window.languageManager) return;

    window.structuredDataManager = new StructuredDataManager(window.languageManager);
}, { once: true });