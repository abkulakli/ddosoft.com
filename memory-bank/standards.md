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

### Language Selection UX Best Practices
- **Clear Visibility**: Dropdown options must have high contrast (dark text on white background)
- **Readable Text**: Minimum 14px font size for dropdown options, medium font weight
- **Sufficient Padding**: 8px+ padding in dropdown options for comfortable selection
- **Current State Indication**: Selected option should be visually distinct (bold, colored background)
- **Hover Feedback**: Visual feedback on hover with background color change
- **Focus States**: Clear focus indicators for keyboard navigation
- **Accessibility**: Proper ARIA labels and screen reader support
- **Cross-browser Compatibility**: Test dropdown appearance in all major browsers
- **Mobile Optimization**: Larger touch targets (minimum 44px) and readable text on mobile
- **Simple Selection**: Use native select element for 2 languages instead of complex dropdowns

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

## MANDATORY PROJECT REQUIREMENTS

### Core Implementation Mandates
1. **Make site SEO friendly**: Complete technical SEO implementation required
   - XML sitemap with multilingual support
   - Comprehensive meta tags (title, description, keywords, Open Graph, Twitter Cards)
   - Schema.org structured data for all content types
   - robots.txt with proper crawler directives
   - Canonical URLs and hreflang implementation

2. **All content shall be both English and Turkish**: Bilingual content requirement
   - Every text element must support EN/TR switching
   - Professional Turkish translations with technical accuracy
   - Language-specific SEO optimization
   - Cultural adaptation for Turkish market

3. **Review website after changes and fix problems**: Mandatory validation process
   - Test on local development server after every change
   - Cross-device and browser testing
   - Functional verification of all features
   - User experience validation

4. **Review code after changes and fix problems**: Code quality assurance
   - Validate HTML syntax and semantics
   - Check JavaScript functionality and errors
   - CSS validation and responsive behavior
   - Performance impact assessment

### MANDATORY MULTILINGUAL STANDARDS

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

### Language Selector UI Standards (CRITICAL)
- **Use Native Select Element**: For 2 languages, use HTML `<select>` instead of custom dropdowns
- **High Contrast Options**: White background (#ffffff) with dark text (#374151) for dropdown options
- **Readable Typography**: Minimum 14px font size, medium weight for options
- **Proper Padding**: 8px+ padding in dropdown options for comfortable selection
- **Current State Indication**: Selected option bold with primary color background
- **Hover States**: Light gray background (#f3f4f6) on option hover
- **Focus Management**: Clear focus indicators for keyboard accessibility
- **Mobile Optimization**: 44px minimum touch targets, larger font sizes on mobile
- **Cross-browser Testing**: Verify dropdown appearance in Chrome, Firefox, Safari, Edge

### Turkish Translation Standards
- **Technical Accuracy**: Proper software/technical terminology
- **Professional Tone**: Business-appropriate Turkish for B2B context
- **Cultural Adaptation**: Culturally appropriate messaging and structure
- **Company Names**: Preserve brand names (DDOSoft, DDOGreen) in original form
- **Technical Terms**: Use accepted Turkish IT terminology where appropriate

## Development Workflow & Testing Standards

### MANDATORY TESTING APPROACH
- **CRITICAL**: Always check generated website and review changes after generation
- **Test Every Change**: Always run local server and verify changes work correctly
- **Cross-Device Validation**: Test on multiple screen sizes during development
- **Functional Testing**: Verify all links, navigation, and interactive elements
- **Performance Monitoring**: Ensure changes don't degrade loading speed
- **User Experience Testing**: Validate from end-user perspective

### Local Development Standards
- **Static Website**: Pure HTML/CSS/JavaScript with no server-side processing
- **Server Requirement**: Local HTTP server needed for AJAX/fetch operations (language data loading)
- **CORS Limitation**: Cannot test multilingual features by opening files directly due to browser CORS policy
- **Server Command**: Use local HTTP server for testing (specific command in local.md)
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
4. **Website Review**: ALWAYS check generated website and review changes after generation
5. **Code Review**: Validate code quality and fix any issues discovered
6. **SEO Validation**: Ensure SEO-friendly implementation maintained
7. **Multilingual Testing**: Verify both English and Turkish content work correctly
8. **Documentation**: Update memory bank when significant changes made
9. **User Feedback**: Incorporate feedback and iterate as needed

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

## Working Restrictions and Patterns

### File Edit Safety Requirements
- **MANDATORY**: Always check current file contents before making edits
- **Context Validation**: Read files that user has manually edited since last interaction
- **Replace String Tool**: Always include 3-5 lines of unchanged code before and after target
- **Ambiguity Prevention**: Use sufficient context to make edits unambiguous
- **Edit Validation**: Verify edits don't break existing functionality

### User Communication Patterns
- **"Try Again" Requests**: Continue with current implementation, check for manual user edits first
- **Manual Edit Detection**: When user edits files between interactions, validate current state
- **Progress Updates**: Use todo list management for complex multi-step work
- **Implementation Approach**: Plan first, then implement incrementally with testing

### Development Response Standards
- **No Assumptions**: Always gather context before performing tasks
- **Tool Usage Priority**: Use appropriate tools rather than assuming or guessing
- **Testing Requirement**: Test implementations on local development server
- **Memory Bank Updates**: Update memory bank after significant feature completions
- **Code Review**: Validate implementations meet quality standards before completion

### Communication Guidelines
- **Clarity First**: Explain what was accomplished and current status
- **Technical Details**: Include specific files modified and features implemented
- **Business Impact**: Connect technical work to business value and user experience
- **Next Steps**: Clear indication of what remains to be done if applicable

### Error Prevention Protocols
- **File State Verification**: Check if files were manually edited before making changes
- **Context Gathering**: Use file reading tools to understand current implementation
- **Incremental Changes**: Make smaller, testable changes rather than large modifications
- **Validation Steps**: Test each significant change before moving to next step

## File Edit Safety Requirements (MANDATORY)
- **Always Check Current State**: Read file contents before making any edits to verify current state
- **Manual Edit Detection**: When user has manually edited files between interactions, validate current state
- **Replace String Context**: Always include 3-5 lines of unchanged code before and after target changes
- **Ambiguity Prevention**: Use sufficient context to make string replacements unambiguous
- **Edit Validation**: Verify edits don't break existing functionality after changes

## Communication and Response Patterns
- **"Try Again" Requests**: Continue with current implementation, check for manual user edits first
- **Manual Edit Handling**: When user edits files between interactions, validate current state before proceeding
- **Progress Communication**: Use todo list management for complex multi-step work
- **Implementation Approach**: Plan first, then implement incrementally with testing
- **No Assumptions Policy**: Always gather context before performing tasks
- **Tool Usage Priority**: Use appropriate tools rather than assuming or guessing
- **Testing Requirement**: Test implementations on local development server
- **Memory Bank Updates**: Update memory bank after significant feature completions

## Development Response Standards
- **Context First**: Always gather necessary context before starting work
- **Incremental Work**: Make smaller, testable changes rather than large modifications
- **Testing Mandate**: Test each significant change before moving to next step
- **Code Quality**: Validate implementations meet established quality standards before completion
- **Clear Communication**: Explain what was accomplished and current project status
- **Business Focus**: Connect technical work to business value and user experience