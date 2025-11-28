# SEO & Social Sharing Strategy

## The Problem: Client-Side Rendering (CSR) vs. Bots
Currently, `PublicProfile.tsx` uses `updateOGMetaTags` to change Open Graph (OG) tags via JavaScript.
- **Issue**: Social media crawlers (Facebook, Twitter/X, LinkedIn, WhatsApp) do not execute JavaScript. They only read the static `index.html`.
- **Result**: When a user shares `patra.me/john-doe`, the preview shows the generic "Patra" title and image instead of John's details.

## Short-Term Fix: React Helmet Async
While this doesn't solve the crawler issue entirely without SSR, it improves head management within the React app.

1.  **Install**: `npm install react-helmet-async`
2.  **Usage**:
    ```tsx
    <Helmet>
      <title>{cardData.fullName} - Patra</title>
      <meta property="og:title" content={cardData.fullName} />
      <meta property="og:image" content={cardData.avatarUrl} />
    </Helmet>
    ```

## Long-Term Solution: Prerendering or Edge Rendering (Recommended)

To ensure every shared card looks professional, you must serve static HTML to bots.

### Option A: Cloudflare Workers (Edge)
If hosting on Vercel or Netlify, use Edge Functions to intercept requests.
1.  Detect the User-Agent (is it a bot?).
2.  If it's a bot, fetch the card data from Supabase.
3.  Inject the meta tags into the HTML template.
4.  Return the modified HTML.

### Option B: Prerender.io
A middleware service that renders your page in a headless browser and serves the static HTML to bots.

### Option C: Next.js Migration
If SEO is critical, migrating the public profile routes to **Next.js** (which supports Server-Side Rendering natively) is the most robust solution. You can keep the Editor in Vite/React if desired, but a unified Next.js app is often easier to maintain.
