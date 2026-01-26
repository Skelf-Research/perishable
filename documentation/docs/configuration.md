# Configuration Reference

Complete configuration reference for Perishable server and client.

## Server Configuration

### Configuration File

Create a `perishable.config.json` file:

```json
{
  "port": 3000,
  "openaiBaseUrl": "https://api.openai.com/v1",
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

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `OPENAI_BASE_URL` | OpenAI API base URL | `https://api.openai.com/v1` |
| `PORT` | Server port | `3000` |

### Server Options Reference

#### Core Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `openaiApiKey` | `string` | - | OpenAI API key (required) |
| `openaiBaseUrl` | `string` | `https://api.openai.com/v1` | Base URL for OpenAI API |
| `port` | `number` | `3000` | Port to run the server on |

#### Rate Limit Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `rateLimitOptions.points` | `number` | `100` | Requests allowed per window |
| `rateLimitOptions.duration` | `number` | `60` | Time window in seconds |
| `rateLimitOptions.blockDuration` | `number` | `60` | Block duration when exceeded (seconds) |

#### Client Validation Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `clientValidationOptions.enableFingerprintValidation` | `boolean` | `true` | Validate client fingerprints |
| `clientValidationOptions.maxSessionsPerFingerprint` | `number` | `5` | Max concurrent sessions per client |
| `clientValidationOptions.enableEntropyValidation` | `boolean` | `true` | Require user interaction entropy |
| `clientValidationOptions.minEntropyThreshold` | `number` | `50` | Minimum entropy score required |

#### Session Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sessionOptions.timeout` | `number` | `1800000` | Session timeout in ms (30 min) |
| `sessionOptions.jwtSecret` | `string` | Auto-generated | Secret for JWT signing |

#### Security Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `securityOptions.enableCORS` | `boolean` | `true` | Enable CORS headers |
| `securityOptions.allowedOrigins` | `string[]` | `['*']` | Allowed origins for CORS |

---

## Client Configuration

### Client Options Reference

#### Core Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `proxyUrl` | `string` | Yes | - | URL of the Perishable proxy server |
| `apiKey` | `string` | No | - | Direct OpenAI API key (development only) |

#### Abuse Prevention Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `abusePreventionOptions.maxRetries` | `number` | `3` | Maximum retry attempts |
| `abusePreventionOptions.retryDelay` | `number` | `1000` | Base retry delay in ms |
| `abusePreventionOptions.requestTimeout` | `number` | `30000` | Request timeout in ms |
| `abusePreventionOptions.requireUserInteraction` | `boolean` | `true` | Require entropy collection |

#### Session Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sessionOptions.expiryBuffer` | `number` | `300000` | Refresh session this many ms before expiry |
| `sessionOptions.enableRequestSigning` | `boolean` | `true` | Enable request signatures |

#### Security Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `securityOptions.jwtSecret` | `string` | - | Secret for JWT (should match server) |

---

## Example Configurations

### Development

```json
{
  "port": 3000,
  "rateLimitOptions": {
    "points": 1000,
    "duration": 60
  },
  "clientValidationOptions": {
    "enableFingerprintValidation": false,
    "enableEntropyValidation": false
  },
  "securityOptions": {
    "enableCORS": true,
    "allowedOrigins": ["*"]
  }
}
```

### Production

```json
{
  "port": 3000,
  "rateLimitOptions": {
    "points": 100,
    "duration": 60,
    "blockDuration": 300
  },
  "clientValidationOptions": {
    "enableFingerprintValidation": true,
    "maxSessionsPerFingerprint": 3,
    "enableEntropyValidation": true,
    "minEntropyThreshold": 100
  },
  "sessionOptions": {
    "timeout": 900000
  },
  "securityOptions": {
    "enableCORS": true,
    "allowedOrigins": ["https://myapp.com"]
  }
}
```

### High Security

```json
{
  "port": 3000,
  "rateLimitOptions": {
    "points": 30,
    "duration": 60,
    "blockDuration": 600
  },
  "clientValidationOptions": {
    "enableFingerprintValidation": true,
    "maxSessionsPerFingerprint": 1,
    "enableEntropyValidation": true,
    "minEntropyThreshold": 150
  },
  "sessionOptions": {
    "timeout": 300000,
    "jwtSecret": "your-very-strong-secret-key"
  },
  "securityOptions": {
    "enableCORS": true,
    "allowedOrigins": ["https://secure.myapp.com"]
  }
}
```

### OpenAI Compatible APIs

#### Anthropic

```json
{
  "port": 3000,
  "openaiBaseUrl": "https://api.anthropic.com/v1",
  "rateLimitOptions": {
    "points": 50,
    "duration": 60
  }
}
```

#### OpenRouter

```json
{
  "port": 3000,
  "openaiBaseUrl": "https://openrouter.ai/api/v1",
  "rateLimitOptions": {
    "points": 200,
    "duration": 60
  }
}
```

#### Local LLM (Ollama)

```json
{
  "port": 3000,
  "openaiBaseUrl": "http://localhost:11434/v1",
  "clientValidationOptions": {
    "enableFingerprintValidation": false,
    "enableEntropyValidation": false
  }
}
```

---

## TypeScript Interfaces

### Server Configuration

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

### Client Configuration

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
```

---

## Configuration Priority

When using the CLI, configuration is merged in this order (later overrides earlier):

1. Default values (lowest priority)
2. Configuration file (`perishable.config.json`)
3. Environment variables
4. Command-line options (highest priority)

**Example:**

```bash
# Config file sets port to 3000
# Environment sets port to 4000
# CLI overrides to 5000
OPENAI_API_KEY=key PORT=4000 perishable-proxy --config config.json --port 5000
# Server runs on port 5000
```
