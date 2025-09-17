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
    }
    
    updateContent() {
        const elements = document.querySelectorAll('[data-lang-key]');
        elements.forEach(el => {
            const key = el.getAttribute('data-lang-key');
            const text = this.getTranslation(key);
            if (text) el.textContent = text;
        });
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
