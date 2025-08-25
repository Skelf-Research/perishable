# Perishable Testing Strategy

## Current Testing Status

We currently have:

1. **Client Unit Tests** - Testing PerishableClient creation and configuration
2. **Server Unit Tests** - Basic instantiation tests (currently failing due to Express issues)
3. **Integration Tests** - Basic instantiation tests (currently failing due to Express issues)

## Recommended Testing Approach

### Client Testing

1. **Unit Tests** (Current tests are good)
   - Test client instantiation with various configurations
   - Test default and custom options
   - Mock browser APIs for testing

2. **Behavioral Tests**
   - Test session creation flow
   - Test request making with retries
   - Test timeout handling
   - Test entropy collection initialization

### Server Testing

1. **Unit Tests**
   - Test server instantiation with various configurations
   - Test default and custom options
   - Test middleware setup

2. **Behavioral Tests**
   - Test session creation endpoint
   - Test rate limiting behavior
   - Test fingerprint validation
   - Test entropy validation
   - Test OpenAI API proxying

3. **Integration Tests**
   - Test full client-server communication
   - Test session lifecycle
   - Test security features

### Testing Challenges

1. **Express in Tests**
   - The current test failures are due to Express routing issues in the test environment
   - Need to mock or stub Express for unit tests
   - For integration tests, need to properly set up and tear down Express servers

2. **Browser APIs**
   - Client tests need to mock browser APIs (document, navigator, screen)
   - Current client tests handle this well

3. **Async Operations**
   - Many operations are async (session creation, API calls)
   - Need to properly handle async in tests

## Test Coverage Plan

### Client Tests

1. PerishableClient instantiation
2. Configuration options
3. Session management
4. Request handling
5. Retry logic
6. Timeout handling
7. Entropy collection

### Server Tests

1. PerishableServer instantiation
2. Configuration options
3. Middleware setup
4. Session endpoint
5. Rate limiting
6. Fingerprint validation
7. Entropy validation
8. OpenAI proxying

### Integration Tests

1. Client-server communication
2. Full session lifecycle
3. Security features end-to-end
4. Error handling

## Implementation Approach

1. Fix Express-related test issues by mocking Express or using proper test setup
2. Add behavioral tests for both client and server
3. Implement integration tests for end-to-end functionality
4. Add test coverage reporting
5. Set up continuous integration testing

This approach will provide comprehensive test coverage without relying on obfuscation for security.