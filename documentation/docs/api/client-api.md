# PerishableClient API

The `PerishableClient` class is the core client for interacting with the Perishable proxy server.

## Import

```javascript
import { client } from 'perishable';
const { PerishableClient } = client;
```

## Constructor

```typescript
new PerishableClient(options: PerishableClientOptions)
```

### PerishableClientOptions

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `proxyUrl` | `string` | Yes | - | URL of the Perishable proxy server |
| `apiKey` | `string` | No | - | Direct OpenAI API key (for development) |
| `abusePreventionOptions` | `object` | No | See below | Retry and timeout settings |
| `sessionOptions` | `object` | No | See below | Session handling settings |
| `securityOptions` | `object` | No | See below | Security settings |

### abusePreventionOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxRetries` | `number` | `3` | Maximum retry attempts for failed requests |
| `retryDelay` | `number` | `1000` | Base delay between retries (ms) |
| `requestTimeout` | `number` | `30000` | Request timeout (ms) |
| `requireUserInteraction` | `boolean` | `true` | Require entropy collection |

### sessionOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `expiryBuffer` | `number` | `300000` | Refresh session this many ms before expiry |
| `enableRequestSigning` | `boolean` | `true` | Enable request signatures |

### securityOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `jwtSecret` | `string` | - | Secret for JWT signing (should match server) |

## Example

```javascript
const client = new PerishableClient({
  proxyUrl: 'http://localhost:3000',
  abusePreventionOptions: {
    maxRetries: 3,
    retryDelay: 1000,
    requestTimeout: 30000,
    requireUserInteraction: true
  },
  sessionOptions: {
    expiryBuffer: 5 * 60 * 1000,
    enableRequestSigning: true
  }
});
```

---

## Methods

### createSession()

Create a new session with the proxy server.

```typescript
async createSession(): Promise<string>
```

**Returns:** The session token string.

**Throws:**
- `Error` if session creation fails

**Example:**

```javascript
const token = await client.createSession();
console.log('Session created:', token);
```

**Behavior:**

1. Checks if a valid session already exists
2. If valid session exists, returns the existing token
3. Otherwise, generates a client fingerprint
4. Sends fingerprint to proxy server's `/session` endpoint
5. Stores the returned token and session data
6. Returns the token

---

### makeRequest()

Make a request to the OpenAI API through the proxy.

```typescript
async makeRequest(endpoint: string, options?: RequestInit): Promise<Response>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `endpoint` | `string` | Yes | OpenAI API endpoint (e.g., `/openai/chat/completions`) |
| `options` | `RequestInit` | No | Fetch request options |

**Returns:** A `Response` object from the fetch API.

**Throws:**
- `Error` if using direct API access mode
- `Error` if all retry attempts fail

**Example:**

```javascript
const response = await client.makeRequest('/openai/chat/completions', {
  method: 'POST',
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

const data = await response.json();
```

**Behavior:**

1. Gets or creates a session token
2. Generates the client fingerprint
3. Prepares headers with authorization and optional signature
4. Adds fingerprint to request body
5. Makes request with retry logic (exponential backoff)

---

## Internal Methods

These methods are private but understanding them helps with debugging.

### isSessionExpired() (private)

```typescript
private isSessionExpired(): boolean
```

Checks if the current session has expired or will expire within the buffer period.

### getSessionToken() (private)

```typescript
private async getSessionToken(): Promise<string>
```

Gets the current session token, creating a new session if needed.

### generateRequestSignature() (private)

```typescript
private generateRequestSignature(method: string, url: string, body: any): string
```

Generates a signature for request integrity verification.

### fetchWithTimeout() (private)

```typescript
private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response>
```

Makes a fetch request with timeout using AbortController.

### fetchWithRetry() (private)

```typescript
private async fetchWithRetry(url: string, options: RequestInit): Promise<Response>
```

Makes a fetch request with exponential backoff retry logic.

---

## SessionData Interface

Internal structure for session data:

```typescript
interface SessionData {
  token: string;      // JWT token
  sessionId: string;  // Session identifier
  expiresAt: number;  // Expiration timestamp (ms)
  fingerprint: string; // Client fingerprint
}
```

---

## Error Handling

```javascript
try {
  const response = await client.makeRequest('/openai/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello!' }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    switch (response.status) {
      case 401:
        console.error('Session expired or invalid');
        break;
      case 429:
        console.error('Rate limit exceeded');
        break;
      default:
        console.error('API error:', error);
    }
  }
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('Request timed out');
  } else {
    console.error('Network error:', error);
  }
}
```

---

## Type Definitions

```typescript
interface PerishableClientOptions {
  proxyUrl: string;
  apiKey?: string;

  abusePreventionOptions?: {
    maxRetries?: number;
    retryDelay?: number;
    requestTimeout?: number;
    requireUserInteraction?: boolean;
  };

  sessionOptions?: {
    expiryBuffer?: number;
    enableRequestSigning?: boolean;
  };

  securityOptions?: {
    jwtSecret?: string;
  };
}

interface SessionData {
  token: string;
  sessionId: string;
  expiresAt: number;
  fingerprint: string;
}
```
