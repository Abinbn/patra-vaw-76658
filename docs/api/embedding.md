# Embedding Patra Cards

Embed Patra digital cards on any website, blog, or application with our simple embed solutions.

## Embedding Methods

### Method 1: Script Tag (Recommended)

The easiest way to embed a Patra card. The script automatically finds and renders cards.

```html
<div class="patra-embed" 
     data-user="johndoe" 
     data-theme="light">
</div>
<script src="https://patra.app/embed.js" async></script>
```

**Attributes:**
- `data-user` (required): The Patra username
- `data-theme` (optional): `light` or `dark` (default: `light`)
- `data-width` (optional): Width in pixels (default: `400`)
- `data-height` (optional): Height in pixels (default: `600`)

### Method 2: Iframe

For complete isolation and security:

```html
<iframe
  src="https://patra.app/embed/johndoe?theme=light"
  width="400"
  height="600"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
></iframe>
```

**Query Parameters:**
- `theme`: `light` or `dark`
- `compact`: `true` for a smaller version

### Method 3: React Component

For React applications, use our official React component:

```bash
npm install @patra/react
```

```jsx
import { PatraCard } from '@patra/react';

function App() {
  return (
    <PatraCard 
      username="johndoe"
      theme="light"
      width={400}
      height={600}
    />
  );
}
```

## Customization

### Themes

Choose between light and dark themes:

```html
<!-- Light Theme -->
<div class="patra-embed" data-user="johndoe" data-theme="light"></div>

<!-- Dark Theme -->
<div class="patra-embed" data-user="johndoe" data-theme="dark"></div>
```

### Sizing

Control the size of the embedded card:

```html
<div class="patra-embed" 
     data-user="johndoe" 
     data-width="500"
     data-height="700">
</div>
```

### Responsive Design

Make the card responsive:

```html
<div style="max-width: 400px; width: 100%;">
  <div class="patra-embed" 
       data-user="johndoe" 
       data-width="100%"
       data-height="600">
  </div>
</div>
<script src="https://patra.app/embed.js" async></script>
```

## Advanced Usage

### Multiple Cards

Embed multiple cards on the same page:

```html
<div class="patra-embed" data-user="johndoe"></div>
<div class="patra-embed" data-user="janedoe"></div>
<div class="patra-embed" data-user="bobsmith"></div>

<script src="https://patra.app/embed.js" async></script>
```

### Custom Styling

Override default styles with CSS:

```css
.patra-embed {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
```

### Event Listeners

Listen to embed events (Script Tag method only):

```javascript
window.addEventListener('patra:loaded', (event) => {
  console.log('Card loaded:', event.detail.username);
});

window.addEventListener('patra:contact-shared', (event) => {
  console.log('Contact shared:', event.detail.username);
});
```

## WordPress Integration

Add this to your WordPress post or page:

1. Switch to HTML/Code editor
2. Paste the embed code:

```html
<div class="patra-embed" data-user="johndoe"></div>
<script src="https://patra.app/embed.js" async></script>
```

## Webflow Integration

1. Add an **Embed** element to your page
2. Paste the embed code
3. Publish your site

## Squarespace Integration

1. Add a **Code Block**
2. Paste the embed code
3. Save and publish

## Security & Privacy

- All embeds are served over HTTPS
- No tracking cookies are set
- User data is only loaded when requested
- Embeds respect user privacy settings

## Performance

- Lazy loading by default
- Optimized assets (< 50KB total)
- CDN-delivered for fast loading worldwide
- No jQuery or heavy dependencies

## Troubleshooting

### Card Not Displaying

1. Check that the username is correct
2. Ensure the user's card is public
3. Verify the script tag is loaded
4. Check browser console for errors

### Styling Issues

1. Check for CSS conflicts
2. Use iframe method for complete isolation
3. Ensure container has sufficient width/height

### CORS Errors

Use the iframe method if you encounter CORS issues.

## Examples

### Blog Sidebar

```html
<aside class="sidebar">
  <h3>About the Author</h3>
  <div class="patra-embed" 
       data-user="johndoe" 
       data-theme="light"
       data-width="300"
       data-height="500">
  </div>
</aside>
<script src="https://patra.app/embed.js" async></script>
```

### Team Page

```html
<div class="team-grid">
  <div class="team-member">
    <div class="patra-embed" data-user="johndoe"></div>
  </div>
  <div class="team-member">
    <div class="patra-embed" data-user="janedoe"></div>
  </div>
  <div class="team-member">
    <div class="patra-embed" data-user="bobsmith"></div>
  </div>
</div>
<script src="https://patra.app/embed.js" async></script>
```

### Email Signature

For email signatures, use a linked image instead:

```html
<a href="https://patra.app/johndoe">
  <img src="https://patra.app/cards/johndoe/badge.png" alt="View my Patra card">
</a>
```
