# Patra API - Getting Started

Welcome to the Patra API! This guide will help you get started with integrating Patra's digital identity platform into your application.

## Quick Start

### 1. Get Your API Key

1. Sign up for a Patra account at [https://patra.app](https://patra.app)
2. Navigate to Settings → Developer
3. Generate a new API key
4. Keep your API key secure - treat it like a password!

### 2. Make Your First Request

```bash
curl https://api.patra.app/v1/cards/johndoe \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 3. Parse the Response

```json
{
  "id": "card_abc123",
  "username": "johndoe",
  "displayName": "John Doe",
  "jobTitle": "Software Engineer",
  "company": "Tech Corp",
  "bio": "Building amazing products",
  "avatarUrl": "https://...",
  "socialLinks": [...]
}
```

## Base URL

All API requests should be made to:

```
https://api.patra.app/v1
```

## Authentication

The Patra API uses Bearer token authentication. Include your API key in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

## Rate Limits

| Plan | Rate Limit |
|------|------------|
| Free | 100 requests/hour |
| Pro | 1,000 requests/hour |
| Enterprise | Custom |

## Error Handling

The API uses conventional HTTP response codes:

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Server Error

Error responses include a JSON body:

```json
{
  "error": "not_found",
  "message": "User not found"
}
```

## Next Steps

- [Authentication Guide](./authentication.md)
- [Endpoints Reference](./endpoints.md)
- [Embedding Guide](./embedding.md)
- [Webhooks](./webhooks.md)
