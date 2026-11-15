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
            "logo": `${this.baseUrl}/logo.png`,
            "description": this.languageManager.getTranslation('meta.site.description'),
            "foundingDate": "2024",
            "founder": {
                "@type": "Person",
                "name": "Dr. Ayşe Pınar KULAKLI",
                "sameAs": "https://www.linkedin.com/in/apkulakli"
            },
            "contactPoint": {
                "@type": "ContactPoint",
                "email": "info@ddosoft.com",
                "contactType": "customer service",
                "availableLanguage": ["English", "Turkish"]
            },
            "sameAs": [
                "https://www.linkedin.com/company/ddosoft"
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
        const currentPage = this.getCurrentPageType();

        switch (currentPage) {
            case 'home':
                this.generateHomePageData();
                break;
        }
    }

    generateHomePageData() {
        const productData = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Zekky",
            "applicationCategory": "GameApplication",
            "operatingSystem": "Web browser",
            "url": "https://zekky.ddosoft.com",
            "description": this.languageManager.getTranslation('products.zekky.description'),
            "inLanguage": ["en", "tr"],
            "creator": {
                "@type": "Organization",
                "name": "DDOSoft"
            },
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            }
        };

        this.insertStructuredData('product', productData);
    }

    getCurrentPageType() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';

        if (filename === 'index.html' || filename === '') return 'home';

        if (filename.includes('.html')) {
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