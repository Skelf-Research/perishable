# Perishable CLI Documentation

## Overview

The Perishable CLI provides a simple way to run the Perishable proxy server without writing any code. It supports configuration files and command-line options for flexible deployment.

## Installation

You can use the CLI in several ways:

1. **Run directly with npx (no installation required):**
   ```bash
   npx perishable-proxy
   ```

2. **Install globally:**
   ```bash
   npm install -g perishable
   perishable-proxy
   ```

3. **Install as a project dependency:**
   ```bash
   npm install perishable
   npx perishable-proxy
   ```

## Usage

### Basic Usage

To run the proxy server, you need to provide your OpenAI API key:

```bash
OPENAI_API_KEY=your-api-key npx perishable-proxy
```

By default, the server will run on port 3000 with reasonable security defaults.

### Using a Custom OpenAI-Compatible API

You can use Perishable with any OpenAI-compatible API by specifying a custom base URL:

```bash
OPENAI_API_KEY=your-api-key OPENAI_BASE_URL=https://api.anthropic.com/v1 npx perishable-proxy
```

### Using a Configuration File

Create a `perishable.config.json` file in your project directory:

```json
{
  "openaiBaseUrl": "https://api.openai.com/v1",
  "port": 8080,
  "rateLimitOptions": {
    "points": 50,
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
    "allowedOrigins": ["https://yourdomain.com", "http://localhost:3000"]
  }
}
```

Then run the server:

```bash
OPENAI_API_KEY=your-api-key npx perishable-proxy
```

The CLI will automatically detect and use the configuration file.

### Specifying a Custom Configuration File

You can specify a custom configuration file path:

```bash
OPENAI_API_KEY=your-api-key npx perishable-proxy --config /path/to/your/config.json
```

### Command Line Options

You can override configuration with command line options:

```bash
OPENAI_API_KEY=your-api-key npx perishable-proxy --port 8080 --openai-base-url https://api.anthropic.com/v1
```

All available options:
- `-c, --config <path>`: Path to configuration file
- `-p, --port <number>`: Port to run the server on
- `--openai-api-key <key>`: OpenAI API key (can also use environment variable)
- `--openai-base-url <url>`: OpenAI API base URL (can also use environment variable)

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `OPENAI_BASE_URL`: OpenAI API base URL (optional, defaults to https://api.openai.com/v1)
- `PORT`: Port to run the server on (defaults to 3000)

## Configuration File Format

The configuration file is a JSON file with the following structure:

```json
{
  "openaiBaseUrl": "https://api.openai.com/v1",  // Base URL for OpenAI API
  "port": 3000,
  "openaiApiKey": "your-api-key", // Optional if using environment variable
  "rateLimitOptions": {
    "points": 100,        // Number of requests allowed
    "duration": 60,       // Time window in seconds
    "blockDuration": 60   // Block duration in seconds
  },
  "clientValidationOptions": {
    "enableFingerprintValidation": true,  // Enable fingerprint validation
    "maxSessionsPerFingerprint": 5,       // Max sessions per fingerprint
    "enableEntropyValidation": true,      // Enable entropy validation
    "minEntropyThreshold": 50             // Minimum entropy threshold
  },
  "sessionOptions": {
    "timeout": 1800000  // Session timeout in milliseconds (30 minutes)
  },
  "securityOptions": {
    "enableCORS": true,         // Enable CORS
    "allowedOrigins": ["*"]     // Allowed origins for CORS
  }
}
```

All options are optional except `openaiApiKey` (which can be provided via environment variable instead).

## Security Considerations

1. **API Key Security**: Never commit your API key to version control. Use environment variables instead.

2. **Configuration File Security**: If you include the API key in a configuration file, ensure the file is not committed to version control.

3. **Network Security**: In production, run the proxy server on the same machine as your frontend application or ensure communication is secured with TLS.