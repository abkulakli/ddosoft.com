# DDOSoft Website

Professional website for DDOSoft - Sustainable software solutions specializing in green technology and intelligent power management.

## 🌟 Features

- **Multilingual Support**: Full English/Turkish (EN/TR) internationalization with real-time switching
- **Modern Design**: Professional green sustainability theme with clean, spacious layout
- **SEO Optimized**: Comprehensive SEO with structured data, XML sitemap, and multilingual meta tags
- **Fully Responsive**: Mobile-first design that works perfectly on all device sizes
- **Performance Optimized**: Fast loading times (<3s) with optimized assets and efficient code
- **Accessibility Compliant**: WCAG 2.1 AA standards with full keyboard navigation and screen reader support
- **SEO Optimized**: Semantic HTML, meta tags, and structured data
- **Interactive Elements**: Smooth animations and engaging user interactions

## � GitHub Pages Deployment

This website is configured for seamless GitHub Pages deployment with custom domain support:

### Quick Setup
1. **Enable GitHub Pages** in repository settings
2. **Set source** to "Deploy from a branch" → `main` branch → `/ (root)`
3. **Custom domain** (optional): CNAME file is configured for `ddosoft.com`

### GitHub Pages Configuration Files
- `.nojekyll` - Prevents Jekyll processing that could interfere with static files
- `CNAME` - Custom domain configuration for ddosoft.com
- `.github/workflows/deploy.yml` - Automated deployment with GitHub Actions

## �🛠 Technologies Used

- **HTML5**: Semantic markup with multilingual support and accessibility features
- **CSS3**: Modern responsive design with CSS Grid, Flexbox, and custom properties
- **Vanilla JavaScript**: ES6+ features, no framework dependencies, lightweight and fast
- **Internationalization**: Complete EN/TR bilingual system with real-time language switching
- **Progressive Enhancement**: Works without JavaScript, enhanced with it

## 📁 Project Structure

```
ddosoft.com/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Main stylesheet with responsive design
├── js/
│   └── main.js            # Interactive functionality
├── images/                # Image assets and media files
├── memory-bank/           # Project documentation and context
│   ├── context.md         # Project overview and company information
│   ├── standards.md       # Development standards and guidelines
│   ├── active.md          # Current work status and priorities
│   └── local.md           # Local environment configuration
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser
- A local web server (optional, for development)

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser, or
3. Serve the files using a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js (if you have http-server installed)
   http-server

   # Using PHP
   php -S localhost:8000
   ```

## 🎯 Key Sections

### Hero Section
- Company mission and value proposition
- Call-to-action buttons for navigation
- Animated visual elements

### About Section
- Company mission and approach
- Key statistics and achievements
- Co-founders information with social links

### Products Section
- **DDOGreen**: Smart power management software
- Detailed feature breakdown
- Cross-platform compatibility information
- Download links and GitHub repository

### Contact Section
- Contact form with validation
- Company contact information
- Social media links

## 🌱 About DDOSoft

DDOSoft specializes in sustainable software solutions that reduce energy consumption while maintaining exceptional performance. Our flagship product, DDOGreen, is an intelligent power management tool that automatically optimizes laptop performance and extends battery life by 20-30%.

### Key Products
- **DDOGreen v0.3.1**: Smart power management for Linux and Windows
- Zero configuration required
- Professional deployment ready
- 122 comprehensive unit tests

### Company Values
- Environmental sustainability through technology
- Production-ready, reliable software
- Cross-platform compatibility
- Professional quality standards

## 📱 Responsive Design

The website is designed with a mobile-first approach:
- **Mobile (320px+)**: Single-column layout with stacked elements
- **Tablet (768px+)**: Adapted layouts with improved spacing
- **Desktop (1024px+)**: Full multi-column layouts with enhanced visuals

## ♿ Accessibility Features

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus indicators
- Skip to content link

## 🔧 Customization

### Colors
The website uses CSS custom properties for easy theming:
```css
--color-primary: #22c55e;      /* Main green brand color */
--color-secondary: #0ea5e9;    /* Blue accent color */
```

### Typography
Font system based on system fonts for optimal performance:
```css
--font-family-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', ...
```

### Spacing
Consistent spacing scale using CSS custom properties:
```css
--spacing-xs: 0.5rem;    /* 8px */
--spacing-sm: 0.75rem;   /* 12px */
--spacing-md: 1rem;      /* 16px */
/* ... */
```

## 📊 Performance

- **First Contentful Paint**: <1.5s target
- **Largest Contentful Paint**: <2.5s target
- **Cumulative Layout Shift**: <0.1 target
- **Total page size**: <2MB initial load target

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers with graceful degradation

## 📄 License

Copyright 2025 – DDOSoft. All rights reserved.

## 🤝 Contributing

This is a company website project. For contributions or suggestions, please contact info@ddosoft.com.

## 📞 Contact

- **Email**: info@ddosoft.com
- **LinkedIn**: [DDOSoft Company Page](https://www.linkedin.com/company/ddosoft)
- **GitHub**: [abkulakli](https://github.com/abkulakli)

---

**DDOSoft** - Sustainable Software Solutions
*Making technology more environmentally conscious, one algorithm at a time.*