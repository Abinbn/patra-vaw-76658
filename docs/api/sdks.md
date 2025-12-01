# SDKs & Libraries

Official and community SDKs for integrating Patra into your applications.

## Official SDKs

### Node.js / JavaScript

```bash
npm install @patra/node
```

```javascript
const Patra = require('@patra/node');

const patra = new Patra('sk_live_xxxxxxxxxxxxx');

// Get a card
const card = await patra.cards.get('johndoe');

// Search cards
const results = await patra.cards.search({ q: 'engineer', limit: 10 });

// Create user quickly
const user = await patra.users.quickCreate({ patraUsername: 'johndoe' });
```

### Python

```bash
pip install patra-python
```

```python
import patra

patra.api_key = 'sk_live_xxxxxxxxxxxxx'

# Get a card
card = patra.Card.get('johndoe')

# Search cards
results = patra.Card.search(q='engineer', limit=10)

# Create user quickly
user = patra.User.quick_create(patra_username='johndoe')
```

### React

```bash
npm install @patra/react
```

```jsx
import { PatraCard, usePatraCard } from '@patra/react';

function App() {
  return (
    <PatraCard 
      username="johndoe"
      theme="light"
      onContactShare={(data) => console.log('Contact shared', data)}
    />
  );
}

// Or use the hook
function CustomCard() {
  const { card, loading, error } = usePatraCard('johndoe');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{card.displayName}</h1>
      <p>{card.jobTitle} at {card.company}</p>
    </div>
  );
}
```

### PHP

```bash
composer require patra/patra-php
```

```php
<?php
require_once('vendor/autoload.php');

\Patra\Patra::setApiKey('sk_live_xxxxxxxxxxxxx');

// Get a card
$card = \Patra\Card::retrieve('johndoe');

// Search cards
$results = \Patra\Card::search([
  'q' => 'engineer',
  'limit' => 10
]);
```

### Ruby

```bash
gem install patra
```

```ruby
require 'patra'

Patra.api_key = 'sk_live_xxxxxxxxxxxxx'

# Get a card
card = Patra::Card.retrieve('johndoe')

# Search cards
results = Patra::Card.search(q: 'engineer', limit: 10)
```

### Go

```bash
go get github.com/patra/patra-go
```

```go
package main

import (
    "github.com/patra/patra-go"
    "github.com/patra/patra-go/card"
)

func main() {
    patra.Key = "sk_live_xxxxxxxxxxxxx"
    
    // Get a card
    c, _ := card.Get("johndoe", nil)
    
    // Search cards
    params := &patra.CardSearchParams{
        Query: patra.String("engineer"),
        Limit: patra.Int64(10),
    }
    results := card.Search(params)
}
```

## Community SDKs

### Java

```xml
<dependency>
    <groupId>com.patra</groupId>
    <artifactId>patra-java</artifactId>
    <version>1.0.0</version>
</dependency>
```

```java
import com.patra.Patra;
import com.patra.model.Card;

Patra.apiKey = "sk_live_xxxxxxxxxxxxx";

Card card = Card.retrieve("johndoe");
```

### .NET / C#

```bash
dotnet add package Patra.net
```

```csharp
using Patra;

var patra = new PatraClient("sk_live_xxxxxxxxxxxxx");

var card = await patra.Cards.GetAsync("johndoe");
```

## REST API

If there's no SDK for your language, use the REST API directly:

```bash
curl https://api.patra.app/v1/cards/johndoe \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxx"
```

## SDK Features

All official SDKs include:

- ✅ Type definitions / IntelliSense
- ✅ Automatic retries
- ✅ Error handling
- ✅ Webhook verification helpers
- ✅ Pagination support
- ✅ Rate limit handling
- ✅ Test mode support

## Examples

### Quick User Creation

```javascript
// Node.js
const user = await patra.users.quickCreate({
  patraUsername: 'johndoe'
});

console.log(`Created user: ${user.displayName}`);
```

```python
# Python
user = patra.User.quick_create(patra_username='johndoe')
print(f"Created user: {user.display_name}")
```

### Embedding in React

```jsx
import { PatraProvider, PatraCard } from '@patra/react';

function App() {
  return (
    <PatraProvider apiKey="pk_live_xxxxxxxxxxxxx">
      <div className="team-grid">
        <PatraCard username="johndoe" />
        <PatraCard username="janedoe" />
        <PatraCard username="bobsmith" />
      </div>
    </PatraProvider>
  );
}
```

### Webhook Verification

```javascript
// Node.js
const patra = require('@patra/node');

app.post('/webhooks/patra', (req, res) => {
  const signature = req.headers['x-patra-signature'];
  const event = patra.webhooks.verify(req.body, signature);
  
  if (event.type === 'card.updated') {
    console.log('Card updated:', event.data);
  }
  
  res.status(200).send('OK');
});
```

```python
# Python
import patra

@app.route('/webhooks/patra', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Patra-Signature')
    event = patra.Webhook.verify(request.data, signature)
    
    if event.type == 'card.updated':
        print(f"Card updated: {event.data}")
    
    return 'OK', 200
```

## Contributing

Want to create an SDK for your favorite language? Check out our [SDK Development Guide](https://github.com/patra/sdk-template).

## Support

- **Documentation**: https://docs.patra.app
- **GitHub**: https://github.com/patra
- **Discord**: https://discord.gg/patra
- **Email**: developers@patra.app
