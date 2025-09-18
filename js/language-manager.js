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
        const response = await fetch(`/lang/${language}.json`);
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
        // Update page title
        const title = this.getTranslation('meta.title');
        if (title) {
            document.title = title;
        }

        // Update meta description
        const description = this.getTranslation('meta.description');
        if (description) {
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', description);
            }
        }

        // Update meta keywords
        const keywords = this.getTranslation('meta.keywords');
        if (keywords) {
            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) {
                metaKeywords.setAttribute('content', keywords);
            }
        }

        // Update Open Graph meta tags
        if (title) {
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) {
                ogTitle.setAttribute('content', title);
            }
        }

        if (description) {
            const ogDescription = document.querySelector('meta[property="og:description"]');
            if (ogDescription) {
                ogDescription.setAttribute('content', description);
            }
        }

        // Update Twitter Card meta tags
        if (title) {
            const twitterTitle = document.querySelector('meta[name="twitter:title"]');
            if (twitterTitle) {
                twitterTitle.setAttribute('content', title);
            }
        }

        if (description) {
            const twitterDescription = document.querySelector('meta[name="twitter:description"]');
            if (twitterDescription) {
                twitterDescription.setAttribute('content', description);
            }
        }

        // Update language button text
        this.updateLanguageButton();
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
        const toggle = document.querySelector('.nav__lang-switch');
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const target = this.currentLanguage === 'en' ? 'tr' : 'en';
                this.switchLanguage(target);
            });
        }
    }
}
