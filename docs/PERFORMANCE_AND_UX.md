# Performance & UX Optimization

## 1. Code Splitting (Lazy Loading)

### Current State
`App.tsx` imports all pages directly. This results in a large initial bundle size. A user visiting a simple profile downloads the code for the entire Admin dashboard and Editor.

### Improvement
Use `React.lazy` and `Suspense` to split the code into chunks.

```tsx
// App.tsx
const EditorNew = React.lazy(() => import('./pages/EditorNew'));
const PublicProfile = React.lazy(() => import('./pages/PublicProfile'));

// Usage
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/editor" element={<EditorNew />} />
    {/* ... */}
  </Routes>
</Suspense>
```

## 2. Progressive Web App (PWA)

### Why?
Digital business cards are often used on mobile. A PWA allows users to:
- "Install" the app to their home screen.
- Access their card offline (cached).
- Experience a native-app-like feel.

### Implementation
1.  Install `vite-plugin-pwa`.
2.  Configure `vite.config.ts`:
    ```typescript
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Patra',
        short_name: 'Patra',
        theme_color: '#ffffff',
        icons: [...]
      }
    })
    ```

## 3. Image Optimization

### Current State
Images are likely served at full resolution.

### Improvement
1.  **Resize on Upload**: Use a client-side library (like `browser-image-compression`) to resize images before uploading to Supabase.
2.  **Supabase Image Transformations**: If using Supabase Storage, utilize their image transformation URL parameters (e.g., `?width=300&format=webp`) to serve optimized images based on the device.
3.  **Lazy Loading**: Ensure the `<img>` tags for gallery items have `loading="lazy"`.

## 4. Accessibility (a11y)

- **Alt Text**: Enforce alt text for all user-uploaded images.
- **Keyboard Navigation**: Ensure the profile page is fully navigable via keyboard (Tab/Enter).
- **Contrast**: Check that custom themes maintain sufficient color contrast for readability.
