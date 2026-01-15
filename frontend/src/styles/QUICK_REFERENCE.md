# 🌸 Flower Delivery App - CSS Quick Reference

## ⚡ Quick Start

```javascript
// In src/index.js (already added)
import "./styles/global.css";
```

## 🎨 Common Classes

### Buttons
```html
<button class="btn-primary">Save</button>
<button class="btn-secondary">Cancel</button>
<button class="btn-danger">Delete</button>
<button class="btn-success">Confirm</button>
```

### Cards
```html
<div class="card">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</div>

<div class="flower-card">
  <div class="img-wrapper">
    <img src="flower.jpg" />
  </div>
  <div class="content">
    <h3 class="title">Flower Name</h3>
    <p class="description">Description</p>
    <div class="price">$29.99</div>
    <div class="actions">
      <button class="btn-primary">Add</button>
    </div>
  </div>
</div>
```

### Forms
```html
<div class="auth-input-group">
  <label>Email</label>
  <input class="auth-input" type="email" />
</div>
```

### Grids
```html
<div class="flower-grid">
  <!-- Auto-responsive grid: 240px min width -->
</div>

<div class="container">
  <!-- Max-width 1100px container -->
</div>
```

### Navigation
```html
<nav class="home-nav">
  <div class="home-brand">
    <h2>Brand</h2>
  </div>
  <div class="home-cta">
    <button class="btn-primary">Action</button>
  </div>
</nav>
```

### Dashboards
```html
<div class="bdb-container"><!-- Buyer dashboard --></div>
<div class="fd-container"><!-- Florist dashboard --></div>

<div class="fd-modal-overlay">
  <div class="fd-modal">
    <!-- Modal content -->
  </div>
</div>
```

## 🎯 Color Quick Reference

| Variable | Color | Hex | Use |
|----------|-------|-----|-----|
| `--primary-pink` | 🩷 Pink | #ff6b9d | Main accent, CTAs |
| `--primary-purple` | 💜 Purple | #c44569 | Gradients, hover states |
| `--primary-cream` | 🟡 Cream | #fef9f3 | Backgrounds |
| `--primary-gold` | ✨ Gold | #d4a574 | Warm highlights |
| `--primary-green` | 💚 Green | #6db584 | Success states |
| `--danger` | ❌ Red | #e74c3c | Errors, delete buttons |
| `--success` | ✅ Green | #22c55e | Success states |

## 📏 Spacing Scale

| Class | Size | Use |
|-------|------|-----|
| `--spacing-xs` | 4px | Minimal spacing |
| `--spacing-sm` | 8px | Small gaps |
| `--spacing-md` | 12px | Default spacing |
| `--spacing-lg` | 16px | Sections |
| `--spacing-xl` | 24px | Large sections |
| `--spacing-2xl` | 32px | Hero sections |

## 🎬 Animation Classes

### Built-in Animations
- `slideInError` - Error message entrance
- `fadeInGrid` - Grid content fade
- `fadeIn` - Modal overlay
- `slideUp` - Modal content

### Transition Variables
```css
--transition-fast: 0.1s ease
--transition-base: 0.2s ease
--transition-smooth: 0.3s ease
```

## 🎭 Responsive Breakpoints

```css
/* Mobile first (default) */
@media (max-width: 480px) { ... }  /* Small phones */
@media (max-width: 768px) { ... }  /* Tablets */
@media (max-width: 700px) { ... }  /* Navigation */
```

## ✨ Shadow Utilities

```css
--shadow-sm    /* 2px, small elements */
--shadow-md    /* 4px, cards */
--shadow-lg    /* 10px, modals */
--shadow-xl    /* 12px, overlays */
--shadow-hover /* 12px with color tint */
```

## 🌐 Flower Image Resources

### Free Stock Photo Sites
- **Unsplash**: `https://unsplash.com/` (Free, premium quality)
- **Pexels**: `https://www.pexels.com/` (Free, no attribution needed)
- **Pixabay**: `https://pixabay.com/` (Free for commercial use)

### Example Image URLs
```html
<!-- Red Roses -->
<img src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=300&h=300&fit=crop" />

<!-- Sunflowers -->
<img src="https://images.unsplash.com/photo-1520763213473-82ed92cefc9e?w=300&h=300&fit=crop" />

<!-- Tulips -->
<img src="https://images.unsplash.com/photo-1500628346881-b72b27e84530?w=300&h=300&fit=crop" />
```

## 🎯 Component Patterns

### Button Group
```html
<div style="display: flex; gap: var(--spacing-md);">
  <button class="btn-primary">Save</button>
  <button class="btn-secondary">Cancel</button>
</div>
```

### Error State
```html
<div class="auth-error">
  Something went wrong!
</div>
```

### Loading State
```html
<button class="btn-primary" disabled>
  Loading...
</button>
```

### Card with Actions
```html
<div class="card">
  <h3>Title</h3>
  <p>Content</p>
  <div style="display: flex; gap: 8px; margin-top: 20px;">
    <button class="btn-primary">Action</button>
    <button class="btn-secondary">Cancel</button>
  </div>
</div>
```

## 🔧 Customization Examples

### Change Primary Color
```css
:root {
  --primary-pink: #ff1493;  /* Deep pink */
  --primary-purple: #9d4edd; /* Deep purple */
}
```

### Add Custom Shadow
```css
:root {
  --shadow-custom: 0 20px 50px rgba(255, 107, 157, 0.2);
}

.custom-element {
  box-shadow: var(--shadow-custom);
}
```

### Create Button Variant
```css
.btn-custom {
  background: linear-gradient(135deg, var(--primary-gold) 0%, var(--primary-green) 100%);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-custom:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

## 📱 Responsive Example

```html
<!-- Auto-responsive grid (no media queries needed!) -->
<div class="flower-grid">
  <!-- Desktop: 4-5 columns (240px each) -->
  <!-- Tablet: 2-3 columns -->
  <!-- Mobile: 1 column (150px becomes 100%) -->
</div>
```

## 🎨 Hover Effects

All interactive elements automatically have:
- ✅ Smooth transition
- ✅ Color change on hover
- ✅ Subtle transform (lift/scale)
- ✅ Enhanced shadow on hover

No extra CSS needed!

## 🐛 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full Support |
| Firefox | 88+ | ✅ Full Support |
| Safari | 14+ | ✅ Full Support |
| Edge | 90+ | ✅ Full Support |
| IE 11 | - | ❌ Not Supported |

## 📚 Full Documentation

For detailed documentation, see: [CSS_GUIDE.md](./CSS_GUIDE.md)

For interactive showcase: Open [DESIGN_SHOWCASE.html](./DESIGN_SHOWCASE.html) in browser

---

**Pro Tips:**
1. Always use CSS variables - never hard-code colors
2. Use `--spacing-*` variables for consistent spacing
3. Add `aria-label` to buttons for accessibility
4. Test on mobile (responsive by default!)
5. Use semantic HTML (`<button>`, not `<div>`)

**Last Updated:** January 15, 2026
