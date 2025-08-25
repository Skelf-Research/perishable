# Perishable API Documentation

## Overview

Perishable provides a secure proxy for OpenAI API calls, preventing direct exposure of API keys in client-side applications. It consists of a client library and a proxy server.

## Server API Endpoints

### POST /session

Create a new session for making API requests.

**Request Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "fingerprint": "string",   // Client fingerprint
  "entropyData": "string"    // Entropy data from user interactions
}
```

**Response:**
```json
{
  "sessionId": "string", // Session identifier
  "expiresAt": "number"  // Unix timestamp of expiration
}
```

**Status Codes:**
- `200 OK` - Session created successfully
- `400 Bad Request` - Missing fingerprint or insufficient entropy
- `429 Too Many Requests` - Maximum sessions per fingerprint exceeded
- `500 Internal Server Error` - Server error

### POST /openai/*

Proxy endpoint for OpenAI API calls.

**Request Headers:**
- `Content-Type: application/json`
- `X-Session-ID: string` // Session identifier from /session endpoint

**Request Body:**
Same as OpenAI API request body, with additional fields:
```json
{
  "fingerprint": "string", // Client fingerprint
  // ... OpenAI API request parameters
}
```

**Response:**
Same as OpenAI API response.

**Status Codes:**
- `200 OK` - Request successful
- `401 Unauthorized` - Missing or invalid session ID
- `401 Unauthorized` - Session expired
- `401 Unauthorized` - Fingerprint mismatch
- `401 Unauthorized` - Insufficient entropy
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Error communicating with OpenAI API

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "string", // ISO timestamp
  "uptime": "number"     // Server uptime in seconds
}
```

**Status Codes:**
- `200 OK` - Server is running

## Client API

### PerishableClient

The main client class for interacting with the Perishable proxy server.

#### Constructor

```typescript
new PerishableClient(options: PerishableClientOptions)
```

**Options:**
```typescript
interface PerishableClientOptions {
  proxyUrl: string; // URL of the Perishable proxy server
  apiKey?: string;  // Optional direct OpenAI API key for development
  
  abusePreventionOptions?: {
    maxRetries?: number;          // Maximum number of retries (default: 3)
    retryDelay?: number;          // Delay between retries in ms (default: 1000)
    requestTimeout?: number;      // Request timeout in ms (default: 30000)
    requireUserInteraction?: boolean; // Require user interaction for entropy (default: true)
  };
  
  sessionOptions?: {
    expiryBuffer?: number; // Buffer time before session expiry in ms (default: 300000)
  };
}
```

#### Methods

##### createSession()

Create a new session with the proxy server.

```typescript
async createSession(): Promise<string>
```

**Returns:** Session ID

##### makeRequest()

Make a request to the OpenAI API through the proxy.

```typescript
async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response>
```

**Parameters:**
- `endpoint: string` - OpenAI API endpoint (e.g., '/openai/chat/completions')
- `options: RequestInit` - Fetch request options

**Returns:** Fetch Response object

### PerishableOpenAI

A wrapper class that provides an interface similar to the OpenAI SDK.

#### Constructor

```typescript
new PerishableOpenAI(options: PerishableOpenAIOptions)
```

**Options:**
Same as PerishableClientOptions

#### Methods

##### createChatCompletion()

Create a chat completion.

```typescript
async createChatCompletion(options: any): Promise<Response>
```

##### createCompletion()

Create a completion.

```typescript
async createCompletion(options: any): Promise<Response>
```

##### createEmbedding()

Create an embedding.

```typescript
async createEmbedding(options: any): Promise<Response>
```

##### listModels()

List available models.

```typescript
async listModels(): Promise<Response>
```

##### getModel()

Get information about a specific model.

```typescript
async getModel(modelId: string): Promise<Response>
```

##### initEntropyCollection()

Initialize entropy collection for enhanced security.

```typescript
static initEntropyCollection(): void
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

## Configuration

### Server Configuration

The Perishable server can be configured with the following options:

```typescript
interface PerishableServerOptions {
  openaiApiKey: string;
  port?: number;
  
  rateLimitOptions?: {
    points?: number;        // Number of requests allowed (default: 100)
    duration?: number;      // Time window in seconds (default: 60)
    blockDuration?: number; // Block duration in seconds (default: 60)
  };
  
  clientValidationOptions?: {
    enableFingerprintValidation?: boolean;  // Enable fingerprint validation (default: true)
    maxSessionsPerFingerprint?: number;     // Max sessions per fingerprint (default: 5)
    enableEntropyValidation?: boolean;      // Enable entropy validation (default: true)
    minEntropyThreshold?: number;           // Minimum entropy threshold (default: 50)
  };
  
  sessionOptions?: {
    timeout?: number; // Session timeout in milliseconds (default: 1800000 - 30 minutes)
  };
  
  securityOptions?: {
    enableCORS?: boolean;    // Enable CORS (default: true)
    allowedOrigins?: string[]; // Allowed origins for CORS (default: ['*'])
  };
}
```

### Client Configuration

The Perishable client can be configured with the following options:

```typescript
interface PerishableClientOptions {
  proxyUrl: string;
  apiKey?: string;
  
  abusePreventionOptions?: {
    maxRetries?: number;          // Maximum number of retries (default: 3)
    retryDelay?: number;          // Delay between retries in ms (default: 1000)
    requestTimeout?: number;      // Request timeout in ms (default: 30000)
    requireUserInteraction?: boolean; // Require user interaction for entropy (default: true)
  };
  
  sessionOptions?: {
    expiryBuffer?: number; // Buffer time before session expiry in ms (default: 300000 - 5 minutes)
  };
}
```