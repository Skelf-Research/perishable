# Installation

## Requirements

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)

## Install via npm

```bash
npm install perishable
```

## Install via yarn

```bash
yarn add perishable
```

## Install via pnpm

```bash
pnpm add perishable
```

## Global Installation (for CLI)

To use the `perishable-proxy` CLI command globally:

```bash
npm install -g perishable
```

## Verify Installation

Check that Perishable is installed correctly:

```bash
# If installed globally
perishable-proxy --version

# If installed locally
npx perishable-proxy --version
```

## Peer Dependencies

Perishable includes the OpenAI SDK as a dependency. If you need a specific version:

```bash
npm install openai@^5.0.0
```

## TypeScript Support

Perishable is written in TypeScript and includes type definitions out of the box. No additional `@types` packages are needed.

```typescript
import { client, server } from 'perishable';
import type { PerishableClientOptions } from 'perishable/dist/client';
import type { PerishableServerOptions } from 'perishable/dist/server';
```

## Development Setup

For contributing or local development:

```bash
# Clone the repository
git clone https://github.com/nicksarkar/perishable.git
cd perishable

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run in development mode
npm run dev
```

## Project Structure

After installation, Perishable exports:

```javascript
import { client, server } from 'perishable';

// Client exports
client.PerishableClient    // Core client class
client.PerishableOpenAI    // OpenAI-compatible wrapper
client.Fingerprinter       // Fingerprint utility

// Server exports
server.PerishableServer    // Proxy server class
```
