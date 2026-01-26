# Server Setup Guide

The Perishable proxy server validates client requests and forwards them to OpenAI, keeping your API key secure.

## Overview

The server provides:

- **JWT-based authentication** - Secure session tokens
- **Client fingerprint validation** - Prevents session hijacking
- **Rate limiting** - Protects against abuse
- **CORS support** - Configurable cross-origin access
- **Security headers** - XSS and clickjacking protection

## Quick Start

### Using the CLI

The simplest way to run the server:

```bash
OPENAI_API_KEY=your-api-key perishable-proxy
```

See the [CLI Guide](cli.md) for more options.

### Programmatic Setup

```javascript
import { server } from 'perishable';

const proxy = new server.PerishableServer({
  openaiApiKey: process.env.OPENAI_API_KEY,
  port: 3000
});

proxy.start();
```

## Configuration

### Basic Configuration

```javascript
const proxy = new server.PerishableServer({
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiBaseUrl: 'https://api.openai.com/v1',  // Optional: custom base URL
  port: 3000
});
```

### Rate Limiting

Control request frequency:

```javascript
const proxy = new server.PerishableServer({
  openaiApiKey: process.env.OPENAI_API_KEY,
  rateLimitOptions: {
    points: 100,        // Requests allowed
    duration: 60,       // Per 60 seconds
    blockDuration: 60   // Block for 60 seconds when exceeded
  }
});
```

### Client Validation

Configure security checks:

```javascript
const proxy = new server.PerishableServer({
  openaiApiKey: process.env.OPENAI_API_KEY,
  clientValidationOptions: {
    enableFingerprintValidation: true,   // Validate client fingerprints
    maxSessionsPerFingerprint: 5,        // Max concurrent sessions per client
    enableEntropyValidation: true,       // Require user interaction
    minEntropyThreshold: 50              // Minimum entropy score
  }
});
```

### Session Options

Configure session behavior:

```javascript
const proxy = new server.PerishableServer({
  openaiApiKey: process.env.OPENAI_API_KEY,
  sessionOptions: {
    timeout: 30 * 60 * 1000,  // 30 minutes
    jwtSecret: 'your-secret'   // Custom JWT secret (auto-generated if not set)
  }
});
```

### CORS Configuration

Configure cross-origin access:

```javascript
const proxy = new server.PerishableServer({
  openaiApiKey: process.env.OPENAI_API_KEY,
  securityOptions: {
    enableCORS: true,
    allowedOrigins: ['https://myapp.com', 'https://staging.myapp.com']
  }
});
```

## API Endpoints

The server exposes these endpoints:

### POST /session

Create a new session.

**Request:**
```json
{
  "fingerprint": "client-fingerprint-string",
  "entropyData": "entropy-data-string"
}
```

**Response:**
```json
{
  "token": "jwt-token-string",
  "sessionId": "session-id-string",
  "expiresAt": 1234567890000
}
```

### POST /openai/*

Proxy endpoint for OpenAI API calls.

**Headers:**
- `Authorization: Bearer <jwt-token>`
- `Content-Type: application/json`

**Request Body:**
Same as OpenAI API, plus:
```json
{
  "fingerprint": "client-fingerprint-string",
  "model": "gpt-3.5-turbo",
  "messages": [...]
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

## Security Features

### JWT Token Authentication

Sessions use JWT tokens containing:

- Session ID
- Client fingerprint
- Creation timestamp
- Expiration time

The token is signed with a secret key (auto-generated or configured).

### Fingerprint Validation

When enabled, the server:

1. Stores the fingerprint when a session is created
2. Validates the fingerprint on each request
3. Rejects requests with mismatched fingerprints

### Rate Limiting

Rate limiting uses IP address and session ID:

- Tracks requests per client
- Blocks clients that exceed limits
- Automatically unblocks after the block duration

### Security Headers

The server sets these headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## Using with OpenAI-Compatible APIs

Perishable works with any OpenAI-compatible API:

```javascript
// Anthropic (via compatibility layer)
const proxy = new server.PerishableServer({
  openaiApiKey: process.env.ANTHROPIC_API_KEY,
  openaiBaseUrl: 'https://api.anthropic.com/v1'
});

// OpenRouter
const proxy = new server.PerishableServer({
  openaiApiKey: process.env.OPENROUTER_API_KEY,
  openaiBaseUrl: 'https://openrouter.ai/api/v1'
});

// Local LLM (Ollama, LM Studio, etc.)
const proxy = new server.PerishableServer({
  openaiApiKey: 'not-needed',
  openaiBaseUrl: 'http://localhost:11434/v1'
});
```

## Session Cleanup

The server automatically cleans up expired sessions every 5 minutes. Sessions that haven't been accessed within the timeout period are removed.

## Production Deployment

### Environment Variables

```bash
export OPENAI_API_KEY=your-api-key
export PORT=3000
```

### Process Manager (PM2)

```bash
npm install -g pm2
pm2 start perishable-proxy --name "perishable"
pm2 save
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
RUN npm install -g perishable
EXPOSE 3000
CMD ["perishable-proxy"]
```

```bash
docker build -t perishable .
docker run -p 3000:3000 -e OPENAI_API_KEY=your-key perishable
```

### Behind a Reverse Proxy

When running behind nginx or similar:

```javascript
const proxy = new server.PerishableServer({
  openaiApiKey: process.env.OPENAI_API_KEY,
  securityOptions: {
    allowedOrigins: ['https://yourdomain.com']
  }
});
```

Configure your reverse proxy to forward the `X-Forwarded-For` header for proper rate limiting by client IP.
