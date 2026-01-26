# Client Library Guide

The Perishable client library provides a secure way to make OpenAI API requests from browser applications without exposing your API key.

## Overview

The client library handles:

- **Client fingerprinting** - Generates a unique identifier for each client
- **Entropy collection** - Gathers user interaction data to prove human presence
- **Session management** - Creates and maintains authenticated sessions
- **Request signing** - Adds signatures to prevent request tampering
- **Retry logic** - Automatically retries failed requests with exponential backoff

## Basic Usage

### Initialize Entropy Collection

Before creating sessions, initialize entropy collection on page load:

```javascript
import { client } from 'perishable';

// Call this once when your app loads
client.PerishableOpenAI.initEntropyCollection();
```

This starts collecting user interaction data (mouse movements, key presses) which is required for session creation.

### Create a Client Instance

```javascript
const perishable = new client.PerishableOpenAI({
  proxyUrl: 'http://localhost:3000'
});
```

### Make API Requests

```javascript
// Chat completion
const response = await perishable.createChatCompletion({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ]
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

## Available Methods

### createChatCompletion()

Create a chat completion (ChatGPT-style API):

```javascript
const response = await perishable.createChatCompletion({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'user', content: 'Explain quantum computing' }
  ],
  temperature: 0.7,
  max_tokens: 500
});
```

### createCompletion()

Create a text completion (legacy API):

```javascript
const response = await perishable.createCompletion({
  model: 'gpt-3.5-turbo-instruct',
  prompt: 'Write a haiku about coding:',
  max_tokens: 50
});
```

### createEmbedding()

Generate embeddings for text:

```javascript
const response = await perishable.createEmbedding({
  model: 'text-embedding-ada-002',
  input: 'The quick brown fox jumps over the lazy dog'
});
```

### listModels()

List available models:

```javascript
const response = await perishable.listModels();
const data = await response.json();
console.log(data.data); // Array of model objects
```

### getModel()

Get information about a specific model:

```javascript
const response = await perishable.getModel('gpt-3.5-turbo');
const data = await response.json();
console.log(data);
```

## Configuration Options

### Abuse Prevention

Control retry behavior and timeouts:

```javascript
const perishable = new client.PerishableOpenAI({
  proxyUrl: 'http://localhost:3000',
  abusePreventionOptions: {
    maxRetries: 3,           // Number of retry attempts
    retryDelay: 1000,        // Base delay between retries (ms)
    requestTimeout: 30000,   // Request timeout (ms)
    requireUserInteraction: true  // Require entropy collection
  }
});
```

### Session Options

Configure session handling:

```javascript
const perishable = new client.PerishableOpenAI({
  proxyUrl: 'http://localhost:3000',
  sessionOptions: {
    expiryBuffer: 5 * 60 * 1000,    // Refresh session 5 minutes before expiry
    enableRequestSigning: true       // Sign requests for integrity
  }
});
```

## Session Management

Sessions are created automatically when you make your first request. The client:

1. Generates a fingerprint from browser characteristics
2. Sends the fingerprint to the proxy server
3. Receives a JWT token valid for 30 minutes
4. Includes the token in subsequent requests

### Manual Session Creation

You can manually create a session:

```javascript
const sessionId = await perishable.createSession();
console.log('Session created:', sessionId);
```

### Session Expiry

Sessions automatically refresh before expiry. The `expiryBuffer` option controls how early to refresh (default: 5 minutes).

## Error Handling

Handle errors from the client:

```javascript
try {
  const response = await perishable.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Hello!' }]
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('API error:', error);
    return;
  }

  const data = await response.json();
  // Handle success
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('Request timed out');
  } else {
    console.error('Network error:', error);
  }
}
```

## Using with Low-Level Client

For more control, use `PerishableClient` directly:

```javascript
import { client } from 'perishable';

const perishableClient = new client.PerishableClient({
  proxyUrl: 'http://localhost:3000'
});

// Create session manually
await perishableClient.createSession();

// Make raw requests
const response = await perishableClient.makeRequest('/openai/chat/completions', {
  method: 'POST',
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});
```

## Fingerprinting Details

The client generates a fingerprint from:

- User agent string
- Browser language
- Timezone
- Screen dimensions
- Browser plugins
- Canvas rendering characteristics
- WebGL capabilities
- Mouse movement patterns
- Key press patterns

This fingerprint helps the server identify clients and prevent abuse.

## Development Mode

For local development, you can use a direct API key (bypasses the proxy):

```javascript
const perishable = new client.PerishableOpenAI({
  proxyUrl: 'http://localhost:3000',
  apiKey: process.env.OPENAI_API_KEY  // Direct access for testing
});
```

!!! warning "Security Warning"
    Never use direct API access in production. The API key would be exposed in client-side code.
