class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.supportedLanguages = ['en', 'tr'];
        this.languageData = {};
        this.defaultLanguage = 'en';
        this.init();
    }

    async init() {
        try {
            this.currentLanguage = this.detectLanguage();
            await this.loadLanguageData(this.currentLanguage);
            this.applyLanguage();
            this.setupLanguageToggle();
        } catch (error) {
            console.error('LanguageManager error:', error);
        }
    }

    detectLanguage() {
        const urlLang = new URLSearchParams(window.location.search).get('lang');
        if (urlLang && this.supportedLanguages.includes(urlLang)) {
            localStorage.setItem('ddosoft-language', urlLang);
            return urlLang;
        }

        const stored = localStorage.getItem('ddosoft-language');
        if (stored && this.supportedLanguages.includes(stored)) {
            return stored;
        }

        const browser = navigator.language.substring(0, 2);
        if (this.supportedLanguages.includes(browser)) {
            return browser;
        }

        return this.defaultLanguage;
    }

    async loadLanguageData(language) {
        const response = await fetch(`./lang/${language}.json`);
        this.languageData = await response.json();
    }

    applyLanguage() {
        document.documentElement.lang = this.currentLanguage;
        this.updateContent();
        this.updateMetaTags();
    }

    updateContent() {
        const elements = document.querySelectorAll('[data-lang-key]');
        elements.forEach(el => {
            const key = el.getAttribute('data-lang-key');
            const text = this.getTranslation(key);
            if (text) el.textContent = text;
        });
    }

    updateMetaTags() {
        // Get current page type for specific meta data
        const currentPage = this.getCurrentPageType();

        // Update page title
        const title = this.getPageMeta(currentPage, 'title') || this.getTranslation('meta.site.title');
        if (title) {
            document.title = title;
        }

        // Update meta description
        const description = this.getPageMeta(currentPage, 'description') || this.getTranslation('meta.site.description');
        if (description) {
            this.updateMetaTag('name', 'description', 'content', description);
        }

        // Update meta keywords
        const keywords = this.getPageMeta(currentPage, 'keywords') || this.getTranslation('meta.site.keywords');
        if (keywords) {
            this.updateMetaTag('name', 'keywords', 'content', keywords);
        }

        // Update canonical URL
        const canonical = this.getTranslation('meta.site.canonical');
        if (canonical) {
            this.updateMetaTag('rel', 'canonical', 'href', canonical);
        }

        // Update robots meta
        const robots = this.getTranslation('meta.site.robots');
        if (robots) {
            this.updateMetaTag('name', 'robots', 'content', robots);
        }

        // Update Open Graph meta tags
        const ogTitle = this.getTranslation('meta.openGraph.title');
        const ogDescription = this.getTranslation('meta.openGraph.description');
        const ogUrl = this.getTranslation('meta.openGraph.url');
        const ogImage = this.getTranslation('meta.openGraph.image');
        const ogType = this.getTranslation('meta.openGraph.type');
        const ogSiteName = this.getTranslation('meta.openGraph.siteName');

        if (ogTitle) this.updateMetaTag('property', 'og:title', 'content', ogTitle);
        if (ogDescription) this.updateMetaTag('property', 'og:description', 'content', ogDescription);
        if (ogUrl) this.updateMetaTag('property', 'og:url', 'content', ogUrl);
        if (ogImage) this.updateMetaTag('property', 'og:image', 'content', ogImage);
        if (ogType) this.updateMetaTag('property', 'og:type', 'content', ogType);
        if (ogSiteName) this.updateMetaTag('property', 'og:site_name', 'content', ogSiteName);

        // Update Twitter Card meta tags
        const twitterCard = this.getTranslation('meta.twitter.card');
        const twitterSite = this.getTranslation('meta.twitter.site');
        const twitterTitle = this.getTranslation('meta.twitter.title');
        const twitterDescription = this.getTranslation('meta.twitter.description');
        const twitterImage = this.getTranslation('meta.twitter.image');

        if (twitterCard) this.updateMetaTag('name', 'twitter:card', 'content', twitterCard);
        if (twitterSite) this.updateMetaTag('name', 'twitter:site', 'content', twitterSite);
        if (twitterTitle) this.updateMetaTag('name', 'twitter:title', 'content', twitterTitle);
        if (twitterDescription) this.updateMetaTag('name', 'twitter:description', 'content', twitterDescription);
        if (twitterImage) this.updateMetaTag('name', 'twitter:image', 'content', twitterImage);

        // Update hreflang
        this.updateHreflangTags();

        // Update language button text
        this.updateLanguageButton();
    }

    getCurrentPageType() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';

        if (filename === 'index.html' || filename === '') return 'home';
        if (filename === 'articles.html') return 'articles';
        if (filename.includes('about')) return 'about';
        if (filename.includes('contact')) return 'contact';

        // Check if it's an article page
        if (path.includes('/articles/') || filename.includes('.html')) {
            const articleKey = filename.replace('.html', '');
            if (this.getTranslation(`meta.articles.${articleKey}`)) {
                return articleKey;
            }
        }

        return 'home';
    }

    getPageMeta(pageType, metaType) {
        // First try page-specific meta
        const pageMeta = this.getTranslation(`meta.pages.${pageType}.${metaType}`);
        if (pageMeta) return pageMeta;

        // Then try article-specific meta
        const articleMeta = this.getTranslation(`meta.articles.${pageType}.${metaType}`);
        if (articleMeta) return articleMeta;

        return null;
    }

    updateMetaTag(attribute, value, contentAttribute, content) {
        let tag = document.querySelector(`meta[${attribute}="${value}"]`);
        if (!tag && (attribute === 'rel')) {
            tag = document.querySelector(`link[${attribute}="${value}"]`);
        }

        if (tag) {
            tag.setAttribute(contentAttribute, content);
        } else {
            // Create new meta tag if it doesn't exist
            const newTag = document.createElement(attribute === 'rel' ? 'link' : 'meta');
            newTag.setAttribute(attribute, value);
            newTag.setAttribute(contentAttribute, content);
            document.head.appendChild(newTag);
        }
    }

    updateHreflangTags() {
        // Remove existing hreflang tags
        const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
        existingHreflang.forEach(tag => tag.remove());

        // Add hreflang tags for all supported languages
        const baseUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;

        this.supportedLanguages.forEach(lang => {
            const hreflangTag = document.createElement('link');
            hreflangTag.setAttribute('rel', 'alternate');
            hreflangTag.setAttribute('hreflang', lang);
            hreflangTag.setAttribute('href', `${baseUrl}${lang === 'en' ? '' : '?lang=' + lang}`);
            document.head.appendChild(hreflangTag);
        });

        // Add x-default hreflang
        const defaultTag = document.createElement('link');
        defaultTag.setAttribute('rel', 'alternate');
        defaultTag.setAttribute('hreflang', 'x-default');
        defaultTag.setAttribute('href', baseUrl);
        document.head.appendChild(defaultTag);
    }

    updateLanguageButton() {
        const langButton = document.querySelector('.nav__lang-switch');
        if (langButton) {
            const buttonText = this.getTranslation('nav.languageSwitch');
            if (buttonText) {
                langButton.textContent = buttonText;
            }
        }
    }

    getTranslation(key) {
        const keys = key.split('.');
        let value = this.languageData;
        for (const k of keys) {
            if (value && value[k]) value = value[k];
            else return null;
        }
        return value;
    }

    async switchLanguage(lang) {
        if (this.supportedLanguages.includes(lang) && lang !== this.currentLanguage) {
            await this.loadLanguageData(lang);
            this.currentLanguage = lang;
            localStorage.setItem('ddosoft-language', lang);
            this.applyLanguage();
        }
    }

    setupLanguageToggle() {
        const select = document.querySelector('.nav__lang-select');
        if (select) {
            // Set initial value to current language
            select.value = this.currentLanguage;
            
            // Listen for changes
            select.addEventListener('change', async (e) => {
                const newLanguage = e.target.value;
                if (newLanguage !== this.currentLanguage) {
                    await this.switchLanguage(newLanguage);
                }
            });
        }
    }

    updateLanguageDisplay() {
        const select = document.querySelector('.nav__lang-select');
        if (select) {
            // Set the select value to current language
            select.value = this.currentLanguage;
        }
    }

    applyLanguage() {
        document.documentElement.lang = this.currentLanguage;
        this.updateContent();
        this.updateMetaTags();
        this.updateLanguageDisplay(); // Update the select display after switching
    }
}
