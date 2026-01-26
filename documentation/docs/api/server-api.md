# PerishableServer API

The `PerishableServer` class creates a proxy server that validates requests and forwards them to OpenAI.

## Import

```javascript
import { server } from 'perishable';
const { PerishableServer } = server;
```

## Constructor

```typescript
new PerishableServer(options: PerishableServerOptions)
```

### PerishableServerOptions

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `openaiApiKey` | `string` | Yes | - | OpenAI API key |
| `openaiBaseUrl` | `string` | No | `https://api.openai.com/v1` | Base URL for OpenAI API |
| `port` | `number` | No | `3000` | Port to run the server on |
| `rateLimitOptions` | `object` | No | See below | Rate limiting settings |
| `clientValidationOptions` | `object` | No | See below | Client validation settings |
| `sessionOptions` | `object` | No | See below | Session settings |
| `securityOptions` | `object` | No | See below | Security settings |

### rateLimitOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `points` | `number` | `100` | Number of requests allowed |
| `duration` | `number` | `60` | Time window in seconds |
| `blockDuration` | `number` | `60` | Block duration when exceeded (seconds) |

### clientValidationOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enableFingerprintValidation` | `boolean` | `true` | Validate client fingerprints |
| `maxSessionsPerFingerprint` | `number` | `5` | Max sessions per fingerprint |
| `enableEntropyValidation` | `boolean` | `true` | Require user interaction entropy |
| `minEntropyThreshold` | `number` | `50` | Minimum entropy score |

### sessionOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `timeout` | `number` | `1800000` | Session timeout (30 minutes in ms) |
| `jwtSecret` | `string` | Auto-generated | Secret for JWT signing |

### securityOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enableCORS` | `boolean` | `true` | Enable CORS headers |
| `allowedOrigins` | `string[]` | `['*']` | Allowed origins for CORS |

## Example

```javascript
const server = new PerishableServer({
  openaiApiKey: process.env.OPENAI_API_KEY,
  port: 3000,
  rateLimitOptions: {
    points: 100,
    duration: 60,
    blockDuration: 60
  },
  clientValidationOptions: {
    enableFingerprintValidation: true,
    maxSessionsPerFingerprint: 5,
    enableEntropyValidation: true,
    minEntropyThreshold: 50
  },
  sessionOptions: {
    timeout: 30 * 60 * 1000
  },
  securityOptions: {
    enableCORS: true,
    allowedOrigins: ['https://myapp.com']
  }
});

server.start();
```

---

## Methods

### start()

Start the proxy server.

```typescript
start(): void
```

**Example:**

```javascript
const server = new PerishableServer({
  openaiApiKey: process.env.OPENAI_API_KEY
});

server.start();
// Perishable proxy server running on port 3000
```

**Console Output:**

```
Perishable proxy server running on port 3000
Rate limiting: 100 requests per 60 seconds
Fingerprint validation: enabled
Max sessions per fingerprint: 5
Entropy validation: enabled
JWT secret: abc123def4...
```

---

## HTTP Endpoints

The server exposes these REST endpoints:

### POST /session

Create a new authenticated session.

**Request:**

```http
POST /session
Content-Type: application/json

{
  "fingerprint": "client-fingerprint-string",
  "entropyData": "entropy-data-string"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionId": "abc123def456",
  "expiresAt": 1704067200000
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Missing fingerprint | Fingerprint is required |
| 400 | Insufficient entropy | Client needs more user interaction |
| 429 | Maximum sessions exceeded | Too many sessions for this fingerprint |
| 500 | Internal server error | Server error |

---

### POST /openai/*

Proxy endpoint for OpenAI API calls.

**Request:**

```http
POST /openai/chat/completions
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "fingerprint": "client-fingerprint-string",
  "model": "gpt-3.5-turbo",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

**Response:**

Same as OpenAI API response.

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Missing authorization header | No JWT token provided |
| 401 | Token expired | Session has expired |
| 401 | Fingerprint mismatch | Fingerprint doesn't match session |
| 401 | Insufficient entropy | Not enough user interaction |
| 401 | Invalid signature | Request signature is invalid |
| 401 | Invalid token | JWT token is malformed |
| 429 | Rate limit exceeded | Too many requests |
| 500 | Error communicating with OpenAI API | Proxy error |

---

### GET /health

Health check endpoint.

**Request:**

```http
GET /health
```

**Response (200 OK):**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600.5
}
```

---

## Middleware

The server applies these middleware in order:

### 1. JSON Body Parser

Parses JSON request bodies up to 10MB.

### 2. CORS Headers

When enabled, adds:

- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Methods`
- `Access-Control-Allow-Headers`
- `Access-Control-Allow-Credentials`

### 3. Security Headers

Always adds:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### 4. Rate Limiting

Tracks requests by `IP:sessionId` and enforces limits.

### 5. Session Validation (for /openai/* routes)

Validates:

- JWT token presence and validity
- Token expiration
- Fingerprint match (if enabled)
- Entropy validation (if enabled)
- Request signature (if provided)

---

## Session Management

### Session Data Structure

```typescript
interface SessionData {
  sessionId: string;
  fingerprint: string;
  createdAt: number;
  lastAccessed: number;
  entropyData?: string;
}
```

### Session Cleanup

The server automatically cleans up expired sessions every 5 minutes. Sessions that haven't been accessed within the timeout period are removed.

---

## Type Definitions

```typescript
interface PerishableServerOptions {
  openaiApiKey: string;
  openaiBaseUrl?: string;
  port?: number;

  rateLimitOptions?: {
    points?: number;
    duration?: number;
    blockDuration?: number;
  };

  clientValidationOptions?: {
    enableFingerprintValidation?: boolean;
    maxSessionsPerFingerprint?: number;
    enableEntropyValidation?: boolean;
    minEntropyThreshold?: number;
  };

  sessionOptions?: {
    timeout?: number;
    jwtSecret?: string;
  };

  securityOptions?: {
    enableCORS?: boolean;
    allowedOrigins?: string[];
    enableHelmet?: boolean;
    enableCompression?: boolean;
  };
}
```

---

## Error Handling

The server returns JSON error responses:

```json
{
  "error": "Error code",
  "message": "Human-readable description"
}
```

### Common Errors

| Error | Message | Cause |
|-------|---------|-------|
| `Missing authorization header` | Authorization header with JWT token is required | No token in request |
| `Token expired` | Session token has expired | JWT has expired |
| `Fingerprint mismatch` | Client fingerprint does not match session | Different client |
| `Insufficient entropy` | Client has not provided sufficient interaction entropy | Bot detection |
| `Invalid signature` | Request signature is invalid | Tampering detected |
| `Invalid token` | Session token is invalid or malformed | Bad JWT |
| `Rate limit exceeded` | Too many requests, please try again later | Too many requests |
| `Missing fingerprint` | Fingerprint is required to create a session | No fingerprint |
| `Maximum sessions exceeded` | Maximum sessions per fingerprint exceeded | Too many sessions |
