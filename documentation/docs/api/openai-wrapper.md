# PerishableOpenAI API

The `PerishableOpenAI` class provides an OpenAI SDK-like interface for making API requests through the Perishable proxy.

## Import

```javascript
import { client } from 'perishable';
const { PerishableOpenAI } = client;
```

## Constructor

```typescript
new PerishableOpenAI(options: PerishableOpenAIOptions)
```

`PerishableOpenAIOptions` extends `PerishableClientOptions` with the same properties.

### Options

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `proxyUrl` | `string` | Yes | - | URL of the Perishable proxy server |
| `apiKey` | `string` | No | - | Direct OpenAI API key (for development) |
| `abusePreventionOptions` | `object` | No | See PerishableClient | Retry and timeout settings |
| `sessionOptions` | `object` | No | See PerishableClient | Session handling settings |
| `securityOptions` | `object` | No | See PerishableClient | Security settings |

## Example

```javascript
import { client } from 'perishable';

// Initialize entropy collection first
client.PerishableOpenAI.initEntropyCollection();

const openai = new client.PerishableOpenAI({
  proxyUrl: 'http://localhost:3000'
});

const response = await openai.createChatCompletion({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Hello!' }]
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

---

## Static Methods

### initEntropyCollection()

Initialize entropy collection for enhanced security. Call this once when your application loads.

```typescript
static initEntropyCollection(): void
```

**Example:**

```javascript
// Call on page load
client.PerishableOpenAI.initEntropyCollection();
```

**Behavior:**

This method starts collecting entropy from user interactions:

- Mouse movements
- Key presses
- Touch events

The collected entropy is required before a session can be created (when `requireUserInteraction` is enabled).

---

## Instance Methods

### createChatCompletion()

Create a chat completion (ChatGPT-style API).

```typescript
async createChatCompletion(options: ChatCompletionOptions): Promise<Response>
```

**Parameters:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `model` | `string` | Yes | Model ID (e.g., `gpt-3.5-turbo`, `gpt-4`) |
| `messages` | `array` | Yes | Array of message objects |
| `temperature` | `number` | No | Sampling temperature (0-2) |
| `max_tokens` | `number` | No | Maximum tokens to generate |
| `top_p` | `number` | No | Nucleus sampling parameter |
| `n` | `number` | No | Number of completions to generate |
| `stream` | `boolean` | No | Stream partial responses |
| `stop` | `string\|array` | No | Stop sequences |

**Example:**

```javascript
const response = await openai.createChatCompletion({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is the capital of France?' }
  ],
  temperature: 0.7,
  max_tokens: 100
});

const data = await response.json();
console.log(data.choices[0].message.content);
// "The capital of France is Paris."
```

---

### createCompletion()

Create a text completion (legacy completions API).

```typescript
async createCompletion(options: CompletionOptions): Promise<Response>
```

**Parameters:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `model` | `string` | Yes | Model ID (e.g., `gpt-3.5-turbo-instruct`) |
| `prompt` | `string\|array` | Yes | Prompt text(s) |
| `max_tokens` | `number` | No | Maximum tokens to generate |
| `temperature` | `number` | No | Sampling temperature (0-2) |
| `top_p` | `number` | No | Nucleus sampling parameter |
| `n` | `number` | No | Number of completions |
| `stop` | `string\|array` | No | Stop sequences |

**Example:**

```javascript
const response = await openai.createCompletion({
  model: 'gpt-3.5-turbo-instruct',
  prompt: 'Write a haiku about programming:\n\n',
  max_tokens: 50,
  temperature: 0.8
});

const data = await response.json();
console.log(data.choices[0].text);
```

---

### createEmbedding()

Create embeddings for text input.

```typescript
async createEmbedding(options: EmbeddingOptions): Promise<Response>
```

**Parameters:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `model` | `string` | Yes | Model ID (e.g., `text-embedding-ada-002`) |
| `input` | `string\|array` | Yes | Text(s) to embed |

**Example:**

```javascript
const response = await openai.createEmbedding({
  model: 'text-embedding-ada-002',
  input: 'The quick brown fox jumps over the lazy dog'
});

const data = await response.json();
console.log(data.data[0].embedding);
// [0.0023, -0.0094, 0.0156, ...]
```

---

### listModels()

List all available models.

```typescript
async listModels(): Promise<Response>
```

**Example:**

```javascript
const response = await openai.listModels();
const data = await response.json();

data.data.forEach(model => {
  console.log(model.id);
});
// gpt-4
// gpt-3.5-turbo
// text-embedding-ada-002
// ...
```

---

### getModel()

Get information about a specific model.

```typescript
async getModel(modelId: string): Promise<Response>
```

**Parameters:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `modelId` | `string` | Yes | Model ID to retrieve |

**Example:**

```javascript
const response = await openai.getModel('gpt-3.5-turbo');
const data = await response.json();

console.log(data);
// {
//   id: 'gpt-3.5-turbo',
//   object: 'model',
//   created: 1677610602,
//   owned_by: 'openai'
// }
```

---

### createSession()

Manually create a session with the proxy server.

```typescript
async createSession(): Promise<string>
```

**Returns:** The session token string.

**Example:**

```javascript
const token = await openai.createSession();
console.log('Session created:', token);
```

Note: Sessions are created automatically when you make your first API request. This method is useful if you want to pre-create a session.

---

## Error Handling

```javascript
try {
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Hello!' }]
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(`Error ${response.status}:`, error.message);
    return;
  }

  const data = await response.json();
  console.log(data.choices[0].message.content);
} catch (error) {
  console.error('Request failed:', error);
}
```

### Common Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| 401 | Session expired | JWT token expired |
| 401 | Fingerprint mismatch | Client changed |
| 429 | Rate limit exceeded | Too many requests |
| 500 | OpenAI API error | Error from OpenAI |

---

## Type Definitions

```typescript
interface PerishableOpenAIOptions extends PerishableClientOptions {
  // Additional options specific to the OpenAI wrapper
}

interface ChatCompletionOptions {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
}

interface CompletionOptions {
  model: string;
  prompt: string | string[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stop?: string | string[];
}

interface EmbeddingOptions {
  model: string;
  input: string | string[];
}
```

---

## Comparison with OpenAI SDK

| OpenAI SDK | PerishableOpenAI |
|------------|------------------|
| `new OpenAI({ apiKey })` | `new PerishableOpenAI({ proxyUrl })` |
| `openai.chat.completions.create()` | `openai.createChatCompletion()` |
| `openai.completions.create()` | `openai.createCompletion()` |
| `openai.embeddings.create()` | `openai.createEmbedding()` |
| `openai.models.list()` | `openai.listModels()` |
| `openai.models.retrieve()` | `openai.getModel()` |

The main differences:

1. PerishableOpenAI uses a proxy URL instead of an API key
2. Methods return raw `Response` objects (call `.json()` to parse)
3. Sessions are managed automatically
4. Requires entropy collection initialization
