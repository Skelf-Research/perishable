# Perishable

[![npm version](https://img.shields.io/npm/v/perishable.svg?style=flat-square)](https://www.npmjs.com/package/perishable)
[![npm downloads](https://img.shields.io/npm/dm/perishable.svg?style=flat-square)](https://www.npmjs.com/package/perishable)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?style=flat-square)](https://nodejs.org/)

**Ship AI features without shipping your API keys.**

Perishable is a drop-in proxy that lets your frontend talk to OpenAI (or any compatible API) without exposing your secret keys. Built-in bot protection, rate limiting, and session management included.

<p align="center">
  <a href="https://perishable.skelfresearch.com"><b>Website</b></a> •
  <a href="https://docs.skelfresearch.com/perishable">Documentation</a> •
  <a href="https://skelfresearch.com">Skelf Research</a>
</p>

---

## Why Perishable?

Building AI-powered apps is fun until you realize you can't safely call OpenAI from the browser. You either:

- Build a backend just to proxy API calls *(boring)*
- Expose your API key and pray *(dangerous)*
- Use Perishable *(smart)*

```
Browser  →  Perishable Proxy  →  OpenAI
   ↑              ↓
   └── JWT + Fingerprint ──┘
```

Your API key stays on your server. Clients get short-lived tokens. Bots get blocked.

---

## Quick Start

### 1. Install

```bash
npm install perishable
```

### 2. Start the proxy

```bash
OPENAI_API_KEY=sk-... npx perishable-proxy
```

### 3. Use in your app

```javascript
import { client } from 'perishable';

// Initialize (call once on page load)
client.PerishableOpenAI.initEntropyCollection();

// Create client
const ai = new client.PerishableOpenAI({
  proxyUrl: 'http://localhost:3000'
});

// Make requests like normal
const response = await ai.createChatCompletion({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

That's it. Your API key never touches the browser.

---

## Features

| Feature | Description |
|---------|-------------|
| **Zero Config** | Works out of the box with sensible defaults |
| **Bot Protection** | Fingerprinting + entropy collection blocks automated abuse |
| **Rate Limiting** | Built-in per-client rate limits (configurable) |
| **Session Management** | JWT-based sessions with auto-expiry |
| **OpenAI Compatible** | Works with OpenAI, Anthropic, OpenRouter, local LLMs |
| **TypeScript** | Full type definitions included |
| **CLI & SDK** | Use the CLI for quick setup, SDK for full control |

---

## Works With

Perishable proxies any OpenAI-compatible API:

```bash
# OpenAI (default)
OPENAI_API_KEY=sk-... perishable-proxy

# Anthropic
OPENAI_API_KEY=sk-ant-... OPENAI_BASE_URL=https://api.anthropic.com/v1 perishable-proxy

# OpenRouter
OPENAI_API_KEY=sk-or-... OPENAI_BASE_URL=https://openrouter.ai/api/v1 perishable-proxy

# Local LLM (Ollama)
OPENAI_API_KEY=unused OPENAI_BASE_URL=http://localhost:11434/v1 perishable-proxy
```

---

## Configuration

### CLI Options

```bash
perishable-proxy [options]

Options:
  -c, --config <path>       Path to config file
  -p, --port <number>       Port (default: 3000)
  --openai-api-key <key>    API key
  --openai-base-url <url>   Base URL
  -V, --version             Version
  -h, --help                Help
```

### Config File

Create `perishable.config.json`:

```json
{
  "port": 3000,
  "rateLimitOptions": {
    "points": 100,
    "duration": 60
  },
  "clientValidationOptions": {
    "enableFingerprintValidation": true,
    "maxSessionsPerFingerprint": 5
  }
}
```

### Programmatic Usage

```javascript
import { server } from 'perishable';

const proxy = new server.PerishableServer({
  openaiApiKey: process.env.OPENAI_API_KEY,
  port: 3000,
  rateLimitOptions: {
    points: 100,        // requests per window
    duration: 60,       // window in seconds
    blockDuration: 60   // block duration when exceeded
  },
  clientValidationOptions: {
    enableFingerprintValidation: true,
    maxSessionsPerFingerprint: 5,
    enableEntropyValidation: true
  }
});

proxy.start();
```

---

## Client Usage

### Basic

```javascript
import { client } from 'perishable';

client.PerishableOpenAI.initEntropyCollection();

const ai = new client.PerishableOpenAI({
  proxyUrl: 'http://localhost:3000'
});

// Chat
const chat = await ai.createChatCompletion({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});

// Embeddings
const embed = await ai.createEmbedding({
  model: 'text-embedding-ada-002',
  input: 'Hello world'
});

// List models
const models = await ai.listModels();
```

### With Options

```javascript
const ai = new client.PerishableOpenAI({
  proxyUrl: 'http://localhost:3000',
  abusePreventionOptions: {
    maxRetries: 3,
    retryDelay: 1000,
    requestTimeout: 30000
  },
  sessionOptions: {
    expiryBuffer: 5 * 60 * 1000  // refresh 5 min before expiry
  }
});
```

---

## How Security Works

Perishable uses defense-in-depth:

1. **Client Fingerprinting** - Unique ID from browser characteristics
2. **Entropy Collection** - Requires mouse/keyboard activity (blocks bots)
3. **JWT Sessions** - Short-lived tokens tied to fingerprints
4. **Rate Limiting** - Per-client request throttling
5. **CORS Protection** - Whitelist allowed origins

The client must prove it's a real user before getting a session token. The token is tied to their fingerprint, so it can't be stolen and reused.

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/session` | POST | Create a session (returns JWT) |
| `/openai/*` | POST | Proxy to OpenAI API |
| `/health` | GET | Health check |

---

## Documentation

Full documentation available at [documentation/](./documentation/).

- [Getting Started](./documentation/docs/getting-started.md)
- [Server Guide](./documentation/docs/guides/server.md)
- [Client Guide](./documentation/docs/guides/client.md)
- [CLI Guide](./documentation/docs/guides/cli.md)
- [API Reference](./documentation/docs/api/)
- [Configuration](./documentation/docs/configuration.md)

---

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Format
npm run format
```

---

## License

MIT

---

<p align="center">
  <sub>Built for developers who ship fast but don't ship their secrets.</sub>
</p>

---

## Part of Skelf Research

`perishable` is built by **[Skelf Research](https://skelfresearch.com)** — an independent UK AI research lab publishing production-grade open-source projects.

🌐 [Website](https://perishable.skelfresearch.com) · 📚 [Documentation](https://docs.skelfresearch.com/perishable) · 🔬 [All projects](https://skelfresearch.com/projects) · 🤗 [Hugging Face](https://huggingface.co/skelfresearch)

**Related projects:** [route-switch](https://route-switch.skelfresearch.com) (self-improving LLM gateway), [promptel](https://promptel.skelfresearch.com) (declarative prompt DSL), [anouk](https://anouk.skelfresearch.com) (AI browser extensions)

<sub>Released under MIT / Apache-2.0. © Skelf Research Limited.</sub>
