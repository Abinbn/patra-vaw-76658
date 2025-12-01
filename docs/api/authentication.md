# Authentication

The Patra API uses API keys to authenticate requests. You can view and manage your API keys in the Developer Dashboard.

## API Keys

API keys are used to authenticate your application with the Patra API. Each key is associated with your account and has specific permissions.

### Types of API Keys

- **Test Keys** (`sk_test_...`): Use these for development and testing
- **Live Keys** (`sk_live_...`): Use these in production

### Getting Your API Key

1. Log in to your Patra account
2. Navigate to **Settings** → **Developer**
3. Click **Generate New API Key**
4. Copy your key immediately - it won't be shown again!
5. Store it securely (use environment variables)

## Making Authenticated Requests

Include your API key in the `Authorization` header using Bearer authentication:

```bash
curl https://api.patra.app/v1/cards/johndoe \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxx"
```

### JavaScript Example

```javascript
const response = await fetch('https://api.patra.app/v1/cards/johndoe', {
  headers: {
    'Authorization': 'Bearer sk_live_xxxxxxxxxxxxx'
  }
});

const data = await response.json();
```

### Python Example

```python
import requests

headers = {
    'Authorization': 'Bearer sk_live_xxxxxxxxxxxxx'
}

response = requests.get(
    'https://api.patra.app/v1/cards/johndoe',
    headers=headers
)

data = response.json()
```

### Node.js Example

```javascript
const axios = require('axios');

const response = await axios.get('https://api.patra.app/v1/cards/johndoe', {
  headers: {
    'Authorization': 'Bearer sk_live_xxxxxxxxxxxxx'
  }
});

console.log(response.data);
```

## Security Best Practices

### ✅ DO

- Store API keys in environment variables
- Use different keys for development and production
- Rotate keys regularly
- Revoke compromised keys immediately
- Use HTTPS for all requests

### ❌ DON'T

- Commit API keys to version control
- Share keys in public forums or chat
- Use production keys in client-side code
- Hardcode keys in your application

## Key Management

### Rotating Keys

We recommend rotating your API keys every 90 days:

1. Generate a new API key
2. Update your application to use the new key
3. Test thoroughly
4. Revoke the old key

### Revoking Keys

If a key is compromised:

1. Go to Settings → Developer
2. Find the compromised key
3. Click **Revoke**
4. Generate a new key immediately

## Permissions

API keys inherit the permissions of the user who created them. You can create keys with specific scopes:

- `cards:read` - Read card data
- `cards:write` - Create and update cards
- `analytics:read` - Access analytics data
- `webhooks:manage` - Manage webhooks

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid API key |
| `403` | API key doesn't have required permissions |
| `429` | Rate limit exceeded |
