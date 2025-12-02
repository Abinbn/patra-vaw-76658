# Patra API Documentation

Welcome to the Patra API! This API allows developers to integrate Patra's digital card functionality into their own applications. You can fetch user details, embed cards, and more.

## Base URL

All API requests should be made to:

```
https://api.patra.app/v1
```

*(Note: For this client-side demo, we simulate these requests using the Supabase client directly.)*

## Authentication

The Patra API uses API keys to authenticate requests. You can view and manage your API keys in the [Developer Dashboard](/settings/developer).

Authentication to the API is performed via HTTP Basic Auth. Provide your API key as the basic auth username value. You do not need to provide a password.

```bash
curl https://api.patra.app/v1/cards/johndoe \
  -u YOUR_API_KEY_HERE:
```

## Endpoints

### 1. Get User Card Details

Retrieve public details for a specific user card using their vanity URL (username).

**Endpoint:** `GET /cards/:username`

**Parameters:**
- `username` (string, required): The vanity URL/username of the Patra card.

**Response:**

```json
{
  "id": "card_123456789",
  "username": "johndoe",
  "displayName": "John Doe",
  "jobTitle": "Senior Software Engineer",
  "company": "Tech Corp",
  "bio": "Building the future of digital identity.",
  "avatarUrl": "https://patra.app/storage/avatars/johndoe.jpg",
  "theme": "modern-dark",
  "socialLinks": [
    { "platform": "linkedin", "url": "https://linkedin.com/in/johndoe" },
    { "platform": "twitter", "url": "https://twitter.com/johndoe" }
  ]
}
```

### 2. Search Users

Search for users by name or job title.

**Endpoint:** `GET /cards/search`

**Query Parameters:**
- `q` (string, required): The search query.
- `limit` (integer, optional): Number of results to return (default: 10).

**Response:**

```json
{
  "data": [
    {
      "username": "johndoe",
      "displayName": "John Doe",
      "jobTitle": "Senior Software Engineer"
    },
    {
      "username": "janedoe",
      "displayName": "Jane Doe",
      "jobTitle": "Product Manager"
    }
  ],
  "total": 2
}
```

## Embedding

You can easily embed a Patra card on your website using our pre-built script or iframe.

### Option 1: Script Tag (Recommended)

Add the following script to your HTML. This will automatically find any element with the class `patra-card-embed` and render the card inside it.

```html
<div class="patra-card-embed" data-username="johndoe" data-theme="light"></div>
<script src="https://patra.app/embed.js" async></script>
```

### Option 2: Iframe

If you prefer isolation, use an iframe:

```html
<iframe
  src="https://patra.app/embed/johndoe"
  width="400"
  height="600"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
></iframe>
```

## Implementation Details for Developers

### Fetching User Data (Client-Side Example)

If you are building a React application, you can use our SDK or standard `fetch`:

```javascript
async function getPatraUser(username) {
  const response = await fetch(`https://api.patra.app/v1/cards/${username}`, {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  
  if (!response.ok) {
    throw new Error('User not found');
  }
  
  return response.json();
}
```

### Webhooks

We support webhooks for the following events:
- `card.updated`: Triggered when a user updates their card details.
- `contact.shared`: Triggered when someone shares their contact info via a card.

Configure webhooks in your [Developer Dashboard](/settings/webhooks).
