class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.supportedLanguages = ['en', 'tr'];
        this.languageData = {};
        this.defaultLanguage = 'en';

        // Pages that carry their own prose declare their language on <html>.
        // Article pages do this: each language is a separate URL with its own
        // hand-written title, canonical, OG tags and hreflang pair, so the
        // JSON-driven meta below must leave them alone.
        const declared = document.documentElement.getAttribute('data-page-lang');
        this.pageLanguage = this.supportedLanguages.includes(declared) ? declared : null;

        this.init();
    }

    /**
     * True when the page authored its own SEO meta and we must not overwrite it.
     */
    ownsOwnMeta() {
        return this.pageLanguage !== null;
    }

    /**
     * URL of this page's counterpart in another language, from the static
     * hreflang alternates in the document head.
     *
     * Those are absolute because Google requires fully-qualified hreflang URLs,
     * but navigation is kept on whichever host actually served us so the pair
     * still works on localhost and on preview deployments.
     */
    getAlternateUrl(language) {
        const alternate = document.querySelector(`link[rel="alternate"][hreflang="${language}"]`);
        if (!alternate) return null;

        const url = new URL(alternate.getAttribute('href'), window.location.href);
        return url.pathname + url.search + url.hash;
    }

    async init() {
        try {
            // Other modules (structured data) need to find us and need to know
            // when the translations are actually in place.
            window.languageManager = this;

            this.currentLanguage = this.detectLanguage();
            await this.loadLanguageData(this.currentLanguage);
            this.applyLanguage();
            document.dispatchEvent(new CustomEvent('languageApplied'));

            // Re-apply after header/footer components are dynamically injected
            document.addEventListener('componentsLoaded', () => {
                this.applyLanguage();
            });
        } catch (error) {
            console.error('LanguageManager error:', error);
        }
    }

    detectLanguage() {
        const urlLang = new URLSearchParams(window.location.search).get('lang');

        if (urlLang && this.supportedLanguages.includes(urlLang)) {
            // On a page written in one language, a request for another means
            // the reader wants the counterpart page, not this text under a
            // translated header.
            if (this.pageLanguage && urlLang !== this.pageLanguage) {
                const alternate = this.getAlternateUrl(urlLang);
                if (alternate) {
                    window.location.replace(alternate);
                    return urlLang;
                }
                // No counterpart exists — serve this page in its own language.
                return this.pageLanguage;
            }

            localStorage.setItem('ddosoft-language', urlLang);
            return urlLang;
        }

        // No lang param — redirect to the canonical default, which for a page
        // that declares its own language is that language.
        const target = this.pageLanguage || this.defaultLanguage;
        window.location.replace(`?lang=${target}` + window.location.hash);
        return target;
    }

    async loadLanguageData(language) {
        // Determine the correct path based on current location
        const pathToLang = this.getLanguageFilePath();
        const response = await fetch(`${pathToLang}lang/${language}.json`);
        this.languageData = await response.json();
    }

    /**
     * Relative prefix back to the site root, derived from directory depth, so
     * that nested article directories (articles/tr/) resolve correctly.
     */
    getLanguageFilePath() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);
        const depth = path.endsWith('/') ? segments.length : Math.max(0, segments.length - 1);
        return '../'.repeat(depth);
    }

    updateContent() {
        const elements = document.querySelectorAll('[data-lang-key]');
        elements.forEach(el => {
            const key = el.getAttribute('data-lang-key');
            const text = this.getTranslation(key);
            if (text) el.innerHTML = text;
        });

        // Article links differ per language — each language file points at its
        // own translation of the article, so the href is a translated value too.
        document.querySelectorAll('[data-lang-href]').forEach(el => {
            const href = this.getTranslation(el.getAttribute('data-lang-href'));
            if (href) el.setAttribute('href', href);
        });
    }

    updateMetaTags() {
        // A page that declares its own language authored its own title,
        // description, canonical, Open Graph tags and hreflang pair. Rewriting
        // them from lang/*.json would point canonical at the homepage and drop
        // the cross-language pairing.
        if (this.ownsOwnMeta()) {
            this.updateLanguageSwitchLinks();
            this.updateLanguageButton();
            return;
        }

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
            hreflangTag.setAttribute('href', `${baseUrl}?lang=${lang}`);
            document.head.appendChild(hreflangTag);
        });

        // Add x-default hreflang
        const defaultTag = document.createElement('link');
        defaultTag.setAttribute('rel', 'alternate');
        defaultTag.setAttribute('hreflang', 'x-default');
        defaultTag.setAttribute('href', `${baseUrl}?lang=en`);
        document.head.appendChild(defaultTag);
    }

    /**
     * Point the header's language buttons at this page's counterparts.
     *
     * The buttons are authored as absolute homepage URLs, which would drop a
     * reader out of the article they are reading.
     */
    updateLanguageSwitchLinks() {
        document.querySelectorAll('[data-lang-switch]').forEach(button => {
            const language = button.getAttribute('data-lang-switch');
            const target = language === this.pageLanguage
                ? `?lang=${language}`
                : this.getAlternateUrl(language);
            if (target) {
                button.setAttribute('href', target);
            }
        });
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

    applyLanguage() {
        document.documentElement.lang = this.currentLanguage;
        this.updateContent();
        this.updateMetaTags();
    }
}
