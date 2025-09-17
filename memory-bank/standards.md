# DDOSoft Website Development Standards

## Code Quality Standards

### HTML Standards
- Use semantic HTML5 elements
- Proper document structure with DOCTYPE, lang attribute
- Accessibility-first approach (ARIA labels, alt text, semantic markup)
- Valid HTML (no syntax errors)
- SEO-optimized meta tags and structured data
- Clean, readable indentation (2 spaces)

### CSS Standards
- Mobile-first responsive design
- Modern CSS features (Grid, Flexbox, custom properties)
- BEM-like naming conventions for clarity
- Organized CSS structure (reset, variables, layout, components, utilities)
- Smooth transitions and animations (respecting prefers-reduced-motion)
- Cross-browser compatibility
- Performance-optimized (minimize reflows, use efficient selectors)

### JavaScript Standards
- Modern ES6+ features
- Event delegation where appropriate
- Clean, readable functions with single responsibility
- Progressive enhancement (works without JS)
- No jQuery dependency (vanilla JS only)
- Performance-conscious (avoid blocking operations)
- Accessible interactions (keyboard navigation, screen readers)

## Design Principles

### Visual Design
- **Color Palette**: Professional with green sustainability theme
- **Typography**: Modern, readable fonts with proper hierarchy
- **Layout**: Clean, spacious, logical flow
- **Imagery**: High-quality, relevant, optimized for web
- **Consistency**: Uniform spacing, colors, and patterns

### User Experience
- **Navigation**: Intuitive, accessible, mobile-friendly
- **Performance**: Fast loading times (<3s initial load)
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsiveness**: Perfect on all device sizes
- **Interactions**: Smooth, purposeful, not distracting

## Content Standards

### Writing Style
- **Tone**: Professional yet approachable
- **Clarity**: Clear, concise, jargon-free where possible
- **Technical**: Accurate technical information
- **Benefits-focused**: Highlight value propositions clearly
- **SEO**: Natural keyword integration

### Content Structure
- **Headlines**: Clear hierarchy (H1, H2, H3)
- **Paragraphs**: Scannable, well-spaced
- **Lists**: Used for easy reading
- **CTAs**: Clear, action-oriented

## File Organization

### Project Structure
```
/
├── index.html
├── css/
│   ├── styles.css
│   └── reset.css (if needed)
├── js/
│   └── main.js
├── images/
│   ├── logo/
│   ├── products/
│   └── team/
└── assets/
    ├── icons/
    └── fonts/ (if custom fonts)
```

### Naming Conventions
- **Files**: kebab-case (my-file.html)
- **CSS Classes**: BEM-inspired (.component__element--modifier)
- **IDs**: camelCase (getElementById compatibility)
- **Images**: descriptive-name.format

## Performance Standards

### Loading Requirements
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **Total page size**: <2MB initial load

### Optimization Techniques
- Minified CSS/JS (for production)
- Optimized images (WebP where supported, proper sizing)
- Lazy loading for below-fold content
- Efficient CSS selectors
- Minimal HTTP requests

## Browser Support
- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Graceful degradation**: Basic functionality in older browsers
- **Testing**: Cross-browser validation required

## Accessibility Requirements
- **Keyboard navigation**: Full site navigable without mouse
- **Screen readers**: Proper ARIA labels and semantic markup
- **Color contrast**: WCAG AA compliant ratios
- **Focus indicators**: Visible and clear
- **Alt text**: Descriptive for all images
- **Semantic HTML**: Proper heading hierarchy and landmarks

## SEO Requirements
- **Meta tags**: Title, description, keywords, Open Graph
- **Schema markup**: Company and product structured data
- **URL structure**: Clean, descriptive URLs
- **Page speed**: Optimized for Core Web Vitals
- **Mobile-friendly**: Responsive design verified

## Testing Standards
- **Cross-device testing**: Desktop, tablet, mobile
- **Browser testing**: All supported browsers
- **Accessibility testing**: Screen reader and keyboard testing
- **Performance testing**: Lighthouse audit >90 scores
- **Functional testing**: All interactive elements work correctly

## MANDATORY MULTILINGUAL STANDARDS

### Internationalization (i18n) Requirements
- **Language Support**: English (EN) and Turkish (TR) required for all content
- **Language Detection**: URL parameter → localStorage → browser → default (EN)
- **Content Translation**: Professional technical translation maintaining tone and accuracy
- **SEO Multilingual**: Proper lang attributes, translated meta tags, hreflang implementation
- **User Experience**: Seamless language switching without page reload
- **Accessibility**: Language toggle with ARIA labels and keyboard navigation

### Language Implementation Standards
- **Data Attributes**: Use `data-lang-key` for all translatable content
- **JSON Structure**: Hierarchical translation keys (e.g., "nav.home", "hero.title")
- **LanguageManager**: Central JavaScript class for all i18n functionality
- **CSS Integration**: Language-specific styling support, RTL-ready structure
- **Storage Persistence**: User language preference stored in localStorage
- **URL Integration**: Language parameter in URL for sharing and SEO

### Turkish Translation Standards
- **Technical Accuracy**: Proper software/technical terminology
- **Professional Tone**: Business-appropriate Turkish for B2B context
- **Cultural Adaptation**: Culturally appropriate messaging and structure
- **Company Names**: Preserve brand names (DDOSoft, DDOGreen) in original form
- **Technical Terms**: Use accepted Turkish IT terminology where appropriate

## Development Workflow & Testing Standards

### MANDATORY TESTING APPROACH
- **Test Every Change**: Always run local server and verify changes work correctly
- **Cross-Device Validation**: Test on multiple screen sizes during development
- **Functional Testing**: Verify all links, navigation, and interactive elements
- **Performance Monitoring**: Ensure changes don't degrade loading speed
- **User Experience Testing**: Validate from end-user perspective

### Local Development Standards
- **Server**: Use `python3 -m http.server 8080` for local testing
- **Port Management**: Kill existing servers before starting new ones
- **Browser Testing**: Use Simple Browser for quick validation
- **Change Verification**: Test immediately after each modification

### Contact Section Standards (Current Implementation)
- **Simplified Approach**: Email and LinkedIn contact methods only
- **No Forms**: Avoid complex contact forms that require maintenance
- **Direct Communication**: Provide direct links to email and social profiles
- **Product Separation**: Never mix product information with contact methods
- **Professional Layout**: Clean, card-based contact presentation

### Memory Bank Update Requirements
- **Update Frequency**: After major changes, user requests, or architectural discoveries
- **Content Accuracy**: Reflect current state only, remove outdated information
- **Universal vs Local**: Keep machine-specific information in local.md only
- **Documentation Priority**: Standards > Context > Active > Local

### Development Workflow
1. **Planning**: Define requirements and validate approach with user
2. **Implementation**: Build changes incrementally
3. **Testing**: Verify each change works correctly (MANDATORY)
4. **Validation**: Test user experience and functionality
5. **Documentation**: Update memory bank when significant changes made
6. **User Feedback**: Incorporate feedback and iterate as needed

### Quality Gates
- **Expert Review Standard**: Target 9+ out of 10 rating
- **Performance**: Fast loading (<3s initial load)
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsiveness**: Perfect on all device sizes
- **Professional Presentation**: Modern, clean, purposeful design

### Code Maintenance Standards
- **Clean Architecture**: Separate HTML structure, CSS styling, JS functionality
- **Semantic HTML**: Use proper HTML5 semantic elements
- **CSS Organization**: Mobile-first, BEM-style naming, logical structure
- **JavaScript Quality**: Modern ES6+, event delegation, performance-conscious
- **No Dependencies**: Pure vanilla web technologies only