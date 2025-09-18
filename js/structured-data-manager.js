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
            "founders": [
                {
                    "@type": "Person",
                    "name": "Ayşe Pınar KULAKLI",
                    "sameAs": "https://www.linkedin.com/in/apkulakli"
                },
                {
                    "@type": "Person",
                    "name": "Ali Burak KULAKLI", 
                    "sameAs": [
                        "https://www.linkedin.com/in/abkulakli",
                        "https://www.github.com/abkulakli"
                    ]
                }
            ],
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
            },
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${this.baseUrl}/articles.html?search={search_term_string}`,
                "query-input": "required name=search_term_string"
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
            case 'articles':
                this.generateBlogData();
                break;
            default:
                if (this.isArticlePage(currentPage)) {
                    this.generateArticleData(currentPage);
                }
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

    generateArticleData(articleKey) {
        const articleTitle = this.languageManager.getTranslation(`meta.articles.${articleKey}.title`);
        const articleDescription = this.languageManager.getTranslation(`meta.articles.${articleKey}.description`);
        
        if (!articleTitle || !articleDescription) return;

        const articleData = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": articleTitle,
            "description": articleDescription,
            "url": `${this.baseUrl}/articles/${articleKey}.html`,
            "datePublished": this.getArticlePublishDate(articleKey),
            "dateModified": this.getArticleModifiedDate(articleKey),
            "author": {
                "@type": "Organization",
                "name": "DDOSoft"
            },
            "publisher": {
                "@type": "Organization",
                "name": "DDOSoft",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${this.baseUrl}/images/logo.svg`
                }
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `${this.baseUrl}/articles/${articleKey}.html`
            },
            "inLanguage": this.languageManager.currentLanguage === 'tr' ? 'tr-TR' : 'en-US',
            "about": [
                "Sustainable Software",
                "Green Technology",
                "Energy Efficiency"
            ],
            "keywords": this.languageManager.getTranslation(`meta.articles.${articleKey}.keywords`)
        };

        this.insertStructuredData('article', articleData);
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

    isArticlePage(pageType) {
        return ['calculating-carbon-footprint-software', 
                'ddogreen-case-study-enterprise-deployment',
                'green-algorithms-performance-vs-efficiency', 
                'sustainable-software-development-principles'].includes(pageType);
    }

    getArticlePublishDate(articleKey) {
        const publishDates = {
            'calculating-carbon-footprint-software': '2024-12-15',
            'ddogreen-case-study-enterprise-deployment': '2024-12-20', 
            'green-algorithms-performance-vs-efficiency': '2024-12-10',
            'sustainable-software-development-principles': '2024-12-05'
        };
        return publishDates[articleKey] || '2024-12-01';
    }

    getArticleModifiedDate(articleKey) {
        return this.getArticlePublishDate(articleKey);
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

// Initialize when language changes
document.addEventListener('DOMContentLoaded', () => {
    // Wait for language manager to be ready
    setTimeout(() => {
        if (window.languageManager) {
            window.structuredDataManager = new StructuredDataManager(window.languageManager);
            
            // Update structured data when language changes
            const originalSwitchLanguage = window.languageManager.switchLanguage.bind(window.languageManager);
            window.languageManager.switchLanguage = async function(lang) {
                await originalSwitchLanguage(lang);
                if (window.structuredDataManager) {
                    window.structuredDataManager.updateStructuredData();
                }
            };
        }
    }, 100);
});