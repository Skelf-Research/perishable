# Perishable

A secure proxy for OpenAI API that prevents key abuse while maintaining full SDK compatibility.

## Overview

Perishable is a library that allows frontend applications to use OpenAI's API without exposing API keys. It consists of two parts:

1. A client-side library that acts as a shim layer over the OpenAI SDK
2. A proxy server that validates requests and forwards them to OpenAI

The library includes multiple security features to prevent API abuse:
- Client fingerprinting with entropy collection
- Session management
- Rate limiting
- Request validation

## Installation

```bash
npm install perishable
```

## CLI Usage

Perishable includes a command-line interface for easily running the proxy server:

```bash
# Install globally to use the CLI directly
npm install -g perishable

# Run with environment variable for API key
OPENAI_API_KEY=your-api-key perishable-proxy

# Run with a configuration file
perishable-proxy --config ./perishable.config.json

# Run with specific options
OPENAI_API_KEY=your-api-key perishable-proxy --port 8080

# Run with a custom OpenAI-compatible API
OPENAI_API_KEY=your-api-key OPENAI_BASE_URL=https://api.anthropic.com/v1 perishable-proxy
```

The CLI will automatically look for a `perishable.config.json` file in the current directory if no config file is specified.

For detailed CLI documentation, see [CLI Usage Guide](docs/cli-usage.md).

## Usage

### Server Setup

First, set up the Perishable proxy server:

```javascript
import { server } from 'perishable';

const serverInstance = new server.PerishableServer({
  openaiApiKey: process.env.OPENAI_API_KEY,
  port: 3000,
  rateLimitOptions: {
    points: 100,        // requests
    duration: 60,       // per 60 seconds
    blockDuration: 60   // block for 60 seconds when rate limit exceeded
  },
  clientValidationOptions: {
    enableFingerprintValidation: true,
    maxSessionsPerFingerprint: 5,
    enableEntropyValidation: true,
    minEntropyThreshold: 50
  },
  sessionOptions: {
    timeout: 30 * 60 * 1000 // 30 minutes
  },
  securityOptions: {
    enableCORS: true,
    allowedOrigins: ['*']
  }
});

serverInstance.start();
```

### Client Setup

Then, use the client library in your frontend application:

```javascript
import { client } from 'perishable';

// Initialize entropy collection for enhanced security
client.PerishableOpenAI.initEntropyCollection();

const perishableClient = new client.PerishableOpenAI({
  proxyUrl: 'http://localhost:3000',
  abusePreventionOptions: {
    maxRetries: 3,
    retryDelay: 1000,
    requestTimeout: 30000,
    requireUserInteraction: true
  },
  sessionOptions: {
    expiryBuffer: 5 * 60 * 1000 // 5 minutes
  }
});

// Create a chat completion
const response = await perishableClient.createChatCompletion({
  model: 'gpt-3.5-turbo',
  messages: [
    {
      role: 'user',
      content: 'Hello!'
    }
  ]
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

### Direct API Access (for development/testing)

For development and testing, you can use the Perishable client with a direct OpenAI API key:

```javascript
import { client } from 'perishable';

const perishableClient = new client.PerishableOpenAI({
  proxyUrl: 'http://localhost:3000',
  apiKey: process.env.OPENAI_API_KEY // Direct API access
});

// This will use the OpenAI API directly, bypassing the proxy
const response = await perishableClient.createChatCompletion({
  model: 'gpt-3.5-turbo',
  messages: [
    {
      role: 'user',
      content: 'Hello!'
    }
  ]
});
```

## Security Features

### Client Fingerprinting with Entropy Collection

Perishable generates a fingerprint for each client based on various browser characteristics and requires user interaction entropy:

- User agent
- Language
- Timezone
- Screen dimensions
- Installed plugins
- Canvas rendering
- WebGL capabilities
- Mouse movements
- Key presses

The client must provide sufficient entropy through user interactions before a session can be created:
- Minimum 10 mouse movements OR
- Minimum 3 key presses OR
- 5 seconds of page activity

### Session Management

Clients must create sessions before making API requests:
- Sessions expire after 30 minutes of inactivity (configurable)
- Each session is tied to a specific client fingerprint
- Sessions are automatically cleaned up

### Rate Limiting

The proxy server implements rate limiting:
- By default, 100 requests per minute per client (configurable)
- Automatic IP and session-based tracking
- Configurable block duration when rate limit is exceeded

### Client Validation

The proxy server validates clients:
- Fingerprint validation (optional but recommended)
- Entropy validation (requires user interaction)
- Session validation
- Request validation

## API Endpoints

### POST /session

Create a new session.

**Request Body:**
```json
{
  "fingerprint": "client-fingerprint-string",
  "entropyData": "entropy-data-string"
}
```

**Response:**
```json
{
  "sessionId": "session-id-string",
  "expiresAt": 1234567890
}
```

### POST /openai/*

Proxy endpoint for OpenAI API calls.

**Headers:**
- `X-Session-ID`: Session ID obtained from /session endpoint

**Response:**
Forwarded from OpenAI API.

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "uptime": 1234.56
}
```

## Configuration

### Server Options

```typescript
interface PerishableServerOptions {
  openaiApiKey: string;
  openaiBaseUrl?: string;  // Base URL for OpenAI API (default: https://api.openai.com/v1)
  port?: number;
  
  rateLimitOptions?: {
    points?: number;        // Number of requests allowed
    duration?: number;      // Time window in seconds
    blockDuration?: number; // Block duration in seconds
  };
  
  clientValidationOptions?: {
    enableFingerprintValidation?: boolean;  // Enable fingerprint validation
    maxSessionsPerFingerprint?: number;     // Max sessions per fingerprint
    enableEntropyValidation?: boolean;      // Enable entropy validation
    minEntropyThreshold?: number;           // Minimum entropy threshold
  };
  
  sessionOptions?: {
    timeout?: number; // Session timeout in milliseconds
  };
  
  securityOptions?: {
    enableCORS?: boolean;    // Enable CORS
    allowedOrigins?: string[]; // Allowed origins for CORS
  };
}
```

### Configuration File

You can create a `perishable.config.json` file in your project directory to configure the server:

```json
{
  "port": 3000,
  "rateLimitOptions": {
    "points": 100,
    "duration": 60,
    "blockDuration": 60
  },
  "clientValidationOptions": {
    "enableFingerprintValidation": true,
    "maxSessionsPerFingerprint": 5,
    "enableEntropyValidation": true,
    "minEntropyThreshold": 50
  },
  "sessionOptions": {
    "timeout": 1800000
  },
  "securityOptions": {
    "enableCORS": true,
    "allowedOrigins": ["*"]
  }
}
```

### CLI Options

```bash
perishable-proxy [options]

Options:
  -c, --config <path>     Path to configuration file
  -p, --port <number>     Port to run the server on
  --openai-api-key <key>  OpenAI API key
  -h, --help              Display help for command
  -V, --version           Display version information
```

### Client Options

```typescript
interface PerishableClientOptions {
  proxyUrl: string;
  apiKey?: string;
  
  abusePreventionOptions?: {
    maxRetries?: number;          // Maximum number of retries
    retryDelay?: number;          // Delay between retries in ms
    requestTimeout?: number;      // Request timeout in ms
    requireUserInteraction?: boolean; // Require user interaction for entropy
  };
  
  sessionOptions?: {
    expiryBuffer?: number; // Buffer time before session expiry (ms)
  };
}
```

## Testing

Perishable includes a comprehensive test suite:

### Unit Tests

```bash
npm test
```

### Client Tests

```bash
npm test src/client/__tests__/perishable-client.test.ts
```

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Security Approach

Perishable uses a defense-in-depth security approach:

1. **Server-side Validation** - All critical security checks happen on the server
2. **Client Fingerprinting** - Identifies and tracks clients to prevent abuse
3. **Entropy Collection** - Requires user interaction to prevent automated abuse
4. **Session Management** - Time-limited sessions with automatic expiration
5. **Rate Limiting** - Prevents abuse through request throttling
6. **CORS Protection** - Controls which origins can access the API

### Obfuscation

Perishable does not rely on obfuscation for security because:
- Client-side obfuscation provides minimal security since all code is visible in the browser
- Server-side obfuscation is unnecessary since server code should not be publicly accessible
- True security comes from API-level protections, not code obfuscation

Instead, Perishable focuses on strong server-side validation and multiple layers of protection.

## License

MIT
