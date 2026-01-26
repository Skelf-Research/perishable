# CLI Usage Guide

Perishable includes a command-line interface for easily running the proxy server.

## Installation

Install Perishable globally to use the CLI:

```bash
npm install -g perishable
```

Or use `npx` to run without global installation:

```bash
npx perishable-proxy
```

## Basic Usage

### With Environment Variable

```bash
OPENAI_API_KEY=your-api-key perishable-proxy
```

### With Command-Line Option

```bash
perishable-proxy --openai-api-key your-api-key
```

### With Configuration File

```bash
perishable-proxy --config ./perishable.config.json
```

## Command-Line Options

| Option | Description |
|--------|-------------|
| `-c, --config <path>` | Path to configuration file |
| `-p, --port <number>` | Port to run the server on |
| `--openai-api-key <key>` | OpenAI API key |
| `--openai-base-url <url>` | OpenAI API base URL |
| `-h, --help` | Display help |
| `-V, --version` | Display version |

## Configuration File

Create a `perishable.config.json` file:

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

The CLI automatically looks for `perishable.config.json` in the current directory if no config file is specified.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_BASE_URL` | OpenAI API base URL |

Environment variables can be combined with CLI options and config files. Priority order:

1. Command-line options (highest)
2. Environment variables
3. Configuration file (lowest)

## Example Configurations

### Standard OpenAI

```json
{
  "port": 3000,
  "rateLimitOptions": {
    "points": 100,
    "duration": 60
  }
}
```

Run with:
```bash
OPENAI_API_KEY=sk-... perishable-proxy --config openai.config.json
```

### Anthropic (Claude)

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

Run with:
```bash
OPENAI_API_KEY=sk-ant-... perishable-proxy --config anthropic.config.json
```

### OpenRouter

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

Run with:
```bash
OPENAI_API_KEY=sk-or-... perishable-proxy --config openrouter.config.json
```

### High-Security Configuration

```json
{
  "port": 3000,
  "rateLimitOptions": {
    "points": 30,
    "duration": 60,
    "blockDuration": 300
  },
  "clientValidationOptions": {
    "enableFingerprintValidation": true,
    "maxSessionsPerFingerprint": 2,
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

### Development Configuration

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

## Running in Production

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start the proxy
OPENAI_API_KEY=your-key pm2 start perishable-proxy --name perishable

# Save the process list
pm2 save

# Set up startup script
pm2 startup
```

### Using systemd

Create `/etc/systemd/system/perishable.service`:

```ini
[Unit]
Description=Perishable Proxy Server
After=network.target

[Service]
Type=simple
User=www-data
Environment=OPENAI_API_KEY=your-key
WorkingDirectory=/opt/perishable
ExecStart=/usr/bin/perishable-proxy --config /opt/perishable/config.json
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable perishable
sudo systemctl start perishable
```

### Using Docker

```dockerfile
FROM node:18-alpine
RUN npm install -g perishable
WORKDIR /app
COPY perishable.config.json .
EXPOSE 3000
CMD ["perishable-proxy", "--config", "perishable.config.json"]
```

Build and run:

```bash
docker build -t perishable .
docker run -d -p 3000:3000 -e OPENAI_API_KEY=your-key perishable
```

## Logging

The CLI logs startup information:

```
Loaded configuration from /path/to/perishable.config.json
Perishable proxy server running on port 3000
Rate limiting: 100 requests per 60 seconds
Fingerprint validation: enabled
Max sessions per fingerprint: 5
Entropy validation: enabled
JWT secret: abc123...
```

For more verbose logging, you can use environment variables or a logging library in your custom server setup.
