# Webhooks

Webhooks allow you to receive real-time notifications when events happen in Patra. Instead of polling our API, we'll send HTTP POST requests to your server when events occur.

## Overview

When an event occurs (like a card being updated), Patra sends a POST request to the webhook URL you've configured. Your server can then take action based on that event.

## Setting Up Webhooks

1. Go to **Settings** → **Developer** → **Webhooks**
2. Click **Add Webhook Endpoint**
3. Enter your endpoint URL (must be HTTPS)
4. Select the events you want to receive
5. Save your webhook

## Webhook Events

### Card Events

**`card.created`** - A new card was created
```json
{
  "event": "card.created",
  "data": {
    "id": "card_abc123",
    "username": "johndoe",
    "createdAt": "2024-12-01T10:30:00Z"
  }
}
```

**`card.updated`** - A card was updated
```json
{
  "event": "card.updated",
  "data": {
    "id": "card_abc123",
    "username": "johndoe",
    "updatedAt": "2024-12-01T14:22:00Z",
    "changes": ["bio", "jobTitle"]
  }
}
```

**`card.deleted`** - A card was deleted
```json
{
  "event": "card.deleted",
  "data": {
    "id": "card_abc123",
    "username": "johndoe",
    "deletedAt": "2024-12-01T16:00:00Z"
  }
}
```

### Contact Events

**`contact.shared`** - Someone shared their contact info
```json
{
  "event": "contact.shared",
  "data": {
    "cardId": "card_abc123",
    "username": "johndoe",
    "method": "vcard_download",
    "timestamp": "2024-12-01T12:00:00Z"
  }
}
```

**`contact.link_clicked`** - A social link was clicked
```json
{
  "event": "contact.link_clicked",
  "data": {
    "cardId": "card_abc123",
    "username": "johndoe",
    "platform": "linkedin",
    "timestamp": "2024-12-01T12:30:00Z"
  }
}
```

### Analytics Events

**`analytics.milestone`** - A milestone was reached
```json
{
  "event": "analytics.milestone",
  "data": {
    "cardId": "card_abc123",
    "username": "johndoe",
    "milestone": "1000_views",
    "value": 1000,
    "timestamp": "2024-12-01T15:00:00Z"
  }
}
```

## Webhook Payload

All webhook requests include:

### Headers

```
Content-Type: application/json
X-Patra-Signature: sha256=...
X-Patra-Event: card.updated
X-Patra-Delivery: uuid-here
```

### Body

```json
{
  "id": "evt_abc123",
  "event": "card.updated",
  "created": 1638360000,
  "data": {
    // Event-specific data
  }
}
```

## Verifying Webhooks

Always verify webhook signatures to ensure requests are from Patra:

### Node.js Example

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

app.post('/webhooks/patra', (req, res) => {
  const signature = req.headers['x-patra-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhook(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook
  const event = req.body;
  console.log('Received event:', event.event);
  
  res.status(200).send('OK');
});
```

### Python Example

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = 'sha256=' + hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)

@app.route('/webhooks/patra', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Patra-Signature')
    payload = request.get_data(as_text=True)
    
    if not verify_webhook(payload, signature, os.environ['WEBHOOK_SECRET']):
        return 'Invalid signature', 401
    
    event = request.json
    print(f"Received event: {event['event']}")
    
    return 'OK', 200
```

## Responding to Webhooks

Your endpoint should:

1. **Respond quickly** (within 5 seconds)
2. **Return 200 OK** to acknowledge receipt
3. **Process asynchronously** if needed

```javascript
app.post('/webhooks/patra', async (req, res) => {
  // Acknowledge immediately
  res.status(200).send('OK');
  
  // Process asynchronously
  processWebhook(req.body).catch(console.error);
});

async function processWebhook(event) {
  if (event.event === 'card.updated') {
    // Update your database
    await updateUserCard(event.data);
  }
}
```

## Retry Logic

If your endpoint doesn't respond with 200 OK, Patra will retry:

- Immediately
- After 5 minutes
- After 1 hour
- After 6 hours
- After 24 hours

After 5 failed attempts, the webhook will be disabled.

## Testing Webhooks

### Using the Dashboard

1. Go to **Settings** → **Developer** → **Webhooks**
2. Select your webhook
3. Click **Send Test Event**
4. Choose an event type
5. Check your server logs

### Using ngrok for Local Testing

```bash
# Install ngrok
npm install -g ngrok

# Start your local server
node server.js

# Expose it with ngrok
ngrok http 3000

# Use the ngrok URL in webhook settings
https://abc123.ngrok.io/webhooks/patra
```

## Best Practices

### ✅ DO

- Verify webhook signatures
- Respond with 200 OK quickly
- Process events asynchronously
- Log all webhook events
- Handle duplicate events (idempotency)
- Monitor webhook failures

### ❌ DON'T

- Perform long-running tasks synchronously
- Return errors for valid webhooks
- Expose your webhook secret
- Skip signature verification

## Webhook Security

1. **Use HTTPS** - Webhook URLs must use HTTPS
2. **Verify signatures** - Always verify the signature
3. **Whitelist IPs** - Optionally whitelist Patra's IPs
4. **Rate limiting** - Implement rate limiting on your endpoint
5. **Secrets** - Store webhook secrets securely

## Troubleshooting

### Webhook Not Receiving Events

1. Check that the URL is correct and accessible
2. Verify your server is responding with 200 OK
3. Check webhook logs in the dashboard
4. Ensure your firewall allows Patra's IPs

### Signature Verification Failing

1. Use the raw request body (not parsed JSON)
2. Ensure you're using the correct secret
3. Check for encoding issues
4. Verify the signature format

## Example: Sync to CRM

```javascript
app.post('/webhooks/patra', async (req, res) => {
  const event = req.body;
  
  if (event.event === 'card.updated') {
    // Sync to your CRM
    await crmClient.updateContact({
      email: event.data.email,
      name: event.data.displayName,
      jobTitle: event.data.jobTitle,
      company: event.data.company
    });
  }
  
  res.status(200).send('OK');
});
```

## Webhook Logs

View webhook delivery logs in the dashboard:

1. Go to **Settings** → **Developer** → **Webhooks**
2. Click on a webhook endpoint
3. View **Recent Deliveries**
4. See request/response details
5. Retry failed deliveries
