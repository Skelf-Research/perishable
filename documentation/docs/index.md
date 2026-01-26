# Perishable

A secure proxy for OpenAI APIs that prevents API key abuse while maintaining full SDK compatibility.

## What is Perishable?

Perishable is a library that allows frontend applications to use OpenAI's API without exposing API keys. It consists of two parts:

1. **Client Library** - A shim layer that works with the OpenAI SDK
2. **Proxy Server** - Validates requests and forwards them to OpenAI

## Key Features

- **API Key Protection** - Your OpenAI API key never leaves your server
- **Client Fingerprinting** - Identifies and tracks clients to prevent abuse
- **Entropy Collection** - Requires user interaction to prevent automated abuse
- **Session Management** - Time-limited sessions with automatic expiration
- **Rate Limiting** - Prevents abuse through request throttling
- **SDK Compatible** - Works seamlessly with the OpenAI SDK

## How It Works

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Browser   │────>│  Perishable      │────>│  OpenAI     │
│   Client    │<────│  Proxy Server    │<────│  API        │
└─────────────┘     └──────────────────┘     └─────────────┘
       │                     │
       │  Session Token      │  API Key
       │  Fingerprint        │  (secure)
       └─────────────────────┘
```

1. Client generates a fingerprint and collects entropy from user interactions
2. Client requests a session from the proxy server
3. Proxy server validates the client and issues a JWT token
4. Client makes API requests through the proxy using the token
5. Proxy server forwards validated requests to OpenAI

## Quick Example

**Server (Node.js):**

```javascript
import { server } from 'perishable';

const proxy = new server.PerishableServer({
  openaiApiKey: process.env.OPENAI_API_KEY,
  port: 3000
});

proxy.start();
```

**Client (Browser):**

```javascript
import { client } from 'perishable';

client.PerishableOpenAI.initEntropyCollection();

const perishable = new client.PerishableOpenAI({
  proxyUrl: 'http://localhost:3000'
});

const response = await perishable.createChatCompletion({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

## Next Steps

- [Getting Started](getting-started.md) - Set up Perishable in 5 minutes
- [Installation](installation.md) - Detailed installation instructions
- [Server Guide](guides/server.md) - Configure your proxy server
- [Client Guide](guides/client.md) - Integrate the client library
