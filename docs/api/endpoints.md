# API Endpoints Reference

Complete reference for all Patra API endpoints.

## Cards

### Get Card by Username

Retrieve public details for a specific user card.

**Endpoint:** `GET /v1/cards/:username`

**Parameters:**
- `username` (string, required): The vanity URL/username

**Example Request:**

```bash
curl https://api.patra.app/v1/cards/johndoe \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Example Response:**

```json
{
  "id": "card_abc123",
  "username": "johndoe",
  "displayName": "John Doe",
  "jobTitle": "Senior Software Engineer",
  "company": "Tech Corp",
  "bio": "Building the future of digital identity",
  "avatarUrl": "https://patra.app/storage/avatars/johndoe.jpg",
  "email": "john@example.com",
  "phone": "+1234567890",
  "location": "San Francisco, CA",
  "website": "https://johndoe.com",
  "socialLinks": [
    {
      "platform": "linkedin",
      "url": "https://linkedin.com/in/johndoe",
      "username": "johndoe"
    },
    {
      "platform": "twitter",
      "url": "https://twitter.com/johndoe",
      "username": "@johndoe"
    }
  ],
  "theme": {
    "primaryColor": "#3b82f6",
    "layout": "modern"
  },
  "qrCodeUrl": "https://patra.app/qr/johndoe.png",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-11-28T14:22:00Z"
}
```

---

### Search Cards

Search for user cards by name, job title, or company.

**Endpoint:** `GET /v1/cards/search`

**Query Parameters:**
- `q` (string, required): Search query
- `limit` (integer, optional): Number of results (default: 10, max: 100)
- `offset` (integer, optional): Pagination offset (default: 0)

**Example Request:**

```bash
curl "https://api.patra.app/v1/cards/search?q=engineer&limit=5" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Example Response:**

```json
{
  "data": [
    {
      "username": "johndoe",
      "displayName": "John Doe",
      "jobTitle": "Senior Software Engineer",
      "company": "Tech Corp",
      "avatarUrl": "https://..."
    },
    {
      "username": "janedoe",
      "displayName": "Jane Doe",
      "jobTitle": "Product Engineer",
      "company": "StartupXYZ",
      "avatarUrl": "https://..."
    }
  ],
  "total": 42,
  "limit": 5,
  "offset": 0
}
```

---

### Download vCard

Download a user's contact information in vCard format.

**Endpoint:** `GET /v1/cards/:username/vcard`

**Parameters:**
- `username` (string, required): The vanity URL/username

**Example Request:**

```bash
curl https://api.patra.app/v1/cards/johndoe/vcard \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -o johndoe.vcf
```

**Response:**

Returns a vCard file (text/vcard):

```
BEGIN:VCARD
VERSION:3.0
FN:John Doe
ORG:Tech Corp
TITLE:Senior Software Engineer
TEL:+1234567890
EMAIL:john@example.com
URL:https://johndoe.com
END:VCARD
```

---

### Get Card Analytics

Retrieve analytics data for a specific card (requires ownership).

**Endpoint:** `GET /v1/cards/:username/analytics`

**Parameters:**
- `username` (string, required): The vanity URL/username
- `period` (string, optional): Time period (`7d`, `30d`, `90d`, `1y`)

**Example Request:**

```bash
curl "https://api.patra.app/v1/cards/johndoe/analytics?period=30d" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Example Response:**

```json
{
  "views": {
    "total": 1234,
    "unique": 892
  },
  "shares": 45,
  "contactDownloads": 67,
  "linkClicks": {
    "linkedin": 123,
    "twitter": 89,
    "website": 234
  },
  "topLocations": [
    { "country": "US", "views": 456 },
    { "country": "UK", "views": 234 }
  ],
  "devices": {
    "mobile": 678,
    "desktop": 456,
    "tablet": 100
  }
}
```

---

## User Management

### Create User Account (Fast Onboarding)

Create a new user account by providing just the Patra username. User details will be fetched from our server.

**Endpoint:** `POST /v1/users/quick-create`

**Request Body:**
- `patraUsername` (string, required): The Patra username to fetch details from

**Example Request:**

```bash
curl -X POST https://api.patra.app/v1/users/quick-create \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"patraUsername": "johndoe"}'
```

**Example Response:**

```json
{
  "success": true,
  "user": {
    "id": "user_xyz789",
    "username": "johndoe",
    "displayName": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "https://...",
    "createdAt": "2024-12-01T10:30:00Z"
  }
}
```

---

### Get User Profile

Retrieve detailed profile information for a user.

**Endpoint:** `GET /v1/users/:username`

**Example Request:**

```bash
curl https://api.patra.app/v1/users/johndoe \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Embedding

### Generate Embed Code

Get the embed code for a specific card.

**Endpoint:** `GET /v1/embed/:username`

**Query Parameters:**
- `theme` (string, optional): `light` or `dark` (default: `light`)
- `width` (integer, optional): Width in pixels (default: 400)
- `height` (integer, optional): Height in pixels (default: 600)

**Example Request:**

```bash
curl "https://api.patra.app/v1/embed/johndoe?theme=dark" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Example Response:**

```json
{
  "embedCode": "<div class=\"patra-embed\" data-user=\"johndoe\" data-theme=\"dark\"></div><script src=\"https://patra.app/embed.js\" async></script>",
  "iframeCode": "<iframe src=\"https://patra.app/embed/johndoe?theme=dark\" width=\"400\" height=\"600\" frameborder=\"0\"></iframe>",
  "previewUrl": "https://patra.app/embed/johndoe?theme=dark"
}
```

---

## Rate Limits

All endpoints are subject to rate limiting based on your plan:

| Plan | Rate Limit |
|------|------------|
| Free | 100 requests/hour |
| Pro | 1,000 requests/hour |
| Enterprise | Custom |

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1638360000
```
