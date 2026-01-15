# Global CSS Styling Guide

## Overview

This project now uses a **unified, comprehensive global CSS file** (`styles/global.css`) that provides beautiful, elegant, and adorable styling for the entire Flower Delivery application.

## File Structure

```
frontend/src/styles/
├── global.css       # NEW: Main unified stylesheet (replaces individual CSS files)
└── theme.css        # Legacy (can be deprecated)
```

## Key Features

### 🎨 Color Palette
- **Primary Pink**: `#ff6b9d` - Main accent color for CTAs and highlights
- **Primary Purple**: `#c44569` - Secondary accent for gradients
- **Cream**: `#fef9f3` - Soft background color
- **Gold**: `#d4a574` - Warm accent
- **Green**: `#6db584` - Success state color

### 🎭 Design Philosophy
- **Elegant**: Smooth gradients, refined typography, and sophisticated spacing
- **Adorable**: Rounded corners, soft shadows, and flower emoji accents (🌸)
- **Accessible**: Dark mode support, reduced motion preferences, and semantic HTML

### 📦 CSS Variables

All colors, spacing, and animations are defined as CSS custom properties for easy customization:

```css
/* Colors */
--primary-pink: #ff6b9d;
--primary-purple: #c44569;
--primary-cream: #fef9f3;

/* Spacing (incremental scale) */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 24px;
--spacing-2xl: 32px;

/* Shadows */
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.08);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 10px 30px rgba(123, 63, 97, 0.15);

/* Transitions */
--transition-fast: 0.1s ease;
--transition-base: 0.2s ease;
--transition-smooth: 0.3s ease;
```

## Components Styled

### Navigation
- `.home-nav` / `.top-nav` - Sticky navigation bar
- `.mobile-menu` - Responsive mobile menu
- `.nav-toggle` - Mobile menu toggle button

### Buttons
- `.btn-primary` - Primary action buttons (pink gradient)
- `.btn-secondary` - Secondary action buttons
- `.btn-danger` - Destructive actions (delete, logout)
- `.btn-success` - Success states

### Forms & Inputs
- `input`, `textarea`, `select` - All form elements with consistent styling
- `.auth-input` - Authentication form inputs
- Focus states with colored borders and shadows

### Cards & Containers
- `.card` / `.auth-card` - Standard card styling
- `.flower-card` - Individual flower product cards
- Hover animations with lift effect and shadow enhancement

### Flower Grid
- `.flower-grid` - Responsive grid layout (auto-fill, minmax 240px)
- Automatic mobile responsiveness (150px minimum on mobile)
- Smooth image zoom on hover

### Dashboards
- `.bdb-container` - Buyer dashboard
- `.fd-container` - Florist dashboard
- `.fd-grid` - Product grid for florist view
- `.fd-modal` - Popup for adding/editing flowers

### Authentication
- `.auth-container` - Login/register page wrapper
- `.auth-card` - Form card with pink top border
- `.auth-error` - Error message with animation
- `.auth-input-group` - Input group with labels

### Page Layouts
- `.landing-hero` - Hero section for landing page
- `.browse-header` - Browse flowers page header
- `.cart-container` - Shopping cart layout
- `.checkout-container` - Checkout process
- `.profile-container` - User profile page
- `.tracking-container` - Order tracking page

## Responsive Breakpoints

The CSS uses mobile-first approach with three main breakpoints:

```css
/* Small screens (default) */
@media (max-width: 480px) { ... }

/* Tablets */
@media (max-width: 768px) { ... }

/* Large screens */
@media (max-width: 700px) for navigation { ... }
```

## Animation & Transitions

### Built-in Animations
- `slideInError` - Error message entrance
- `fadeInGrid` - Grid content fade-in
- `fadeIn` - Modal overlay fade
- `slideUp` - Modal content slide up
- Smooth hover effects on all interactive elements

### Accessibility
- Respects `prefers-reduced-motion` media query
- All animations have fallback states
- Semantic color usage for colorblind-friendly design

## Dark Mode Support

The stylesheet includes automatic dark mode detection:

```css
@media (prefers-color-scheme: dark) {
  /* Inverted colors for dark backgrounds */
}
```

## Typography

### Font Stack
- **Serif** (primary): Georgia, Times New Roman, serif
- **Sans-serif** (fallback): System fonts for better performance

### Heading Sizes
- `h1`: 2.5rem (40px)
- `h2`: 2rem (32px)
- `h3`: 1.5rem (24px)
- `h4`: 1.25rem (20px)

## Usage

### Import in index.js
```javascript
import "./styles/global.css";
```

### Using CSS Classes

**Button Examples:**
```html
<button class="btn-primary">Sign Up</button>
<button class="btn-secondary">Cancel</button>
<button class="btn-danger">Delete</button>
```

**Card Examples:**
```html
<div class="flower-card">
  <div class="img-wrapper">
    <img src="flower.jpg" alt="Rose" />
  </div>
  <div class="content">
    <h3 class="title">Beautiful Rose</h3>
    <p class="description">Premium red roses</p>
    <div class="price">$29.99</div>
    <div class="actions">
      <button class="btn-primary">Add to Cart</button>
    </div>
  </div>
</div>
```

**Grid Examples:**
```html
<div class="flower-grid">
  <!-- Cards automatically arrange in responsive grid -->
</div>
```

## Customization

### Change Primary Colors
Edit the CSS custom properties in `global.css`:

```css
:root {
  --primary-pink: #ff6b9d;  /* Change this */
  --primary-purple: #c44569; /* Or this */
}
```

### Add Custom Spacing
```css
:root {
  --spacing-custom: 20px;
}

/* Use it */
.my-element {
  padding: var(--spacing-custom);
}
```

### Create New Button Variants
```css
.btn-custom {
  background: var(--primary-gold);
  color: white;
  /* ... other styles */
}
```

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

1. **CSS is minified in production** - Webpack will handle this
2. **No unused CSS** - All styles are actively used
3. **Custom properties avoid duplication** - Smaller file size
4. **No external font dependencies** - Uses system fonts
5. **Optimized shadows** - Minimal blur radius for performance

## Migration from Old CSS Files

Old CSS files that can now be removed:
- `App.css` - Absorbed into `global.css`
- Individual `TopNav.css`, `BuyerDashboard.css`, etc. - All merged
- Keep `theme.css` as backup (contains legacy variables)

To complete migration, remove import statements from component files if they exist.

## Image Integration for Flowers

To display flower images beautifully:

```html
<div class="flower-card">
  <div class="img-wrapper">
    <img 
      src="https://images.unsplash.com/photo-rose" 
      alt="Red Rose"
    />
  </div>
  <div class="content">
    <h3 class="title">Red Rose</h3>
    <p class="description">Beautiful fresh roses</p>
    <div class="price">$35.00</div>
  </div>
</div>
```

Recommended flower image sources:
- **Unsplash**: unsplash.com (free, high quality)
- **Pexels**: pexels.com (free stock photos)
- **Pixabay**: pixabay.com (free and commercial)
- **Shutterstock**: shutterstock.com (professional)

## Future Enhancements

- [ ] Add flower emoji icons throughout the design
- [ ] Implement seasonal color themes
- [ ] Add parallax effects on landing page
- [ ] Create animation library for micro-interactions
- [ ] Add theme switcher component

---

**Last Updated**: January 15, 2026
**Maintainer**: Wambui

For questions or improvements, please refer to the project README.
