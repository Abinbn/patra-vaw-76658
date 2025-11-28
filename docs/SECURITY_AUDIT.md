# Security Audit & Improvements

## 1. CSS Injection Vulnerability

### Risk
In `PublicProfile.tsx`, the application injects user-defined CSS directly into the DOM:
```tsx
<style dangerouslySetInnerHTML={{ __html: cardData.customCSS }} />
```
This is a potential **Cross-Site Scripting (XSS)** vector. A malicious user could craft CSS that loads external resources or uses `behavior` properties (in older browsers) to execute scripts.

### Mitigation
1.  **Sanitization**: Use a library like `dompurify` (though it's mostly for HTML) or a specific CSS sanitizer.
2.  **Scoped CSS**: Wrap the user's CSS in a specific ID selector (e.g., `#user-card-root { ... }`) to prevent them from breaking the global UI (like the "Report" or "Home" buttons).
3.  **Strict Content Security Policy (CSP)**: Implement a CSP header that disallows loading images/fonts from unauthorized domains.

## 2. Data Validation

### Risk
Relying solely on client-side validation in `EditorNew.tsx` is insufficient.

### Mitigation
1.  **Supabase Row Level Security (RLS)**: Ensure your `digital_cards` table has strict RLS policies.
    - `UPDATE`: Only allow `auth.uid() == owner_user_id`.
    - `SELECT`: Allow public access for `is_active: true` cards.
2.  **Input Limits**: Enforce character limits on fields like `about`, `jobTitle`, etc., at the database level to prevent database bloating.

## 3. Asset Protection

### Risk
User uploads (avatars, gallery images) are stored in Supabase Storage.

### Mitigation
1.  **File Type Validation**: Ensure only images (jpg, png, webp) can be uploaded.
2.  **Size Limits**: Enforce strict file size limits (e.g., max 2MB) to prevent storage abuse.
3.  **Malware Scanning**: Ideally, scan uploaded files for malware before making them public.
