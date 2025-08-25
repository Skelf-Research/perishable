# Perishable - Project Summary

Perishable is a secure proxy solution for OpenAI API that prevents key abuse while maintaining full SDK compatibility. It consists of two main components:

1. A client-side library that acts as a shim layer over the OpenAI SDK
2. A proxy server that validates requests and forwards them to OpenAI

## Key Features

### Security
- Client fingerprinting with entropy collection requiring user interaction
- Session management with automatic expiration
- Rate limiting to prevent abuse
- Client validation to ensure legitimate requests
- CORS protection
- Security headers

### Ease of Use
- Full compatibility with OpenAI SDK API
- Simple setup and configuration
- Direct API access option for development/testing
- Comprehensive documentation and examples

### Performance
- Efficient proxying of API requests
- Retry logic with exponential backoff
- Request timeout handling
- Optimized build for production use

## Architecture

```
Frontend Application
│
├── Perishable Client Library
│   ├── Shim layer for OpenAI SDK
│   ├── Client fingerprinting with entropy collection
│   ├── Session management
│   └── Abuse prevention
│
└── Perishable Proxy Server
    ├── Session validation
    ├── Rate limiting
    ├── Client validation
    └── OpenAI API proxy
```

## Implementation Details

### Client Library
- Written in TypeScript for type safety
- Provides a wrapper around the OpenAI SDK
- Implements client-side fingerprinting using browser characteristics
- Requires user interaction entropy (mouse movements, key presses) before allowing sessions
- Handles session management automatically
- Includes retry logic and timeout handling

### Proxy Server
- Built with Express.js for performance and reliability
- Implements session-based authentication
- Rate limiting using rate-limiter-flexible
- Client fingerprint validation
- Entropy validation requiring user interaction
- Direct proxying to OpenAI API
- CORS protection
- Security headers

### Security Measures
- Session tokens with expiration
- Client fingerprinting to detect abuse
- Entropy collection requiring user interaction
- Rate limiting per client
- Session validation on each request
- Fingerprint validation (optional)
- CORS protection
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)

## Testing
- Unit tests for client and server components
- Integration tests for client-server communication
- Automated build and test process

## Documentation
- Comprehensive README with usage instructions
- API documentation
- Example applications
- TypeScript definitions

## Configuration Options

### Server Configuration
- Rate limiting (requests per time period, block duration)
- Client validation (fingerprint validation, max sessions per fingerprint, entropy validation)
- Session management (timeout)
- Security (CORS, allowed origins)

### Client Configuration
- Abuse prevention (max retries, retry delay, request timeout, require user interaction)
- Session management (expiry buffer)

## Future Improvements
- Add more comprehensive integration tests
- Implement additional security measures
- Add support for more OpenAI API endpoints
- Create middleware for popular frameworks
- Add metrics and monitoring