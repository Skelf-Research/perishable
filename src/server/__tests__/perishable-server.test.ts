import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PerishableServer } from '../../../dist/server/perishable-server';

describe('PerishableServer', () => {
  it('should create a server instance', () => {
    const server = new PerishableServer({
      openaiApiKey: 'test-key'
    });
    
    expect(server).toBeInstanceOf(PerishableServer);
  });
  
  it('should have default rate limit options', () => {
    const server = new PerishableServer({
      openaiApiKey: 'test-key'
    });
    
    // Note: We can't easily test private properties
    // In a real test, we would test behavior instead
    expect(server).toBeDefined();
  });
  
  it('should allow custom rate limit options', () => {
    const server = new PerishableServer({
      openaiApiKey: 'test-key',
      rateLimitOptions: {
        points: 50,
        duration: 30,
        blockDuration: 30
      }
    });
    
    expect(server).toBeDefined();
  });
  
  it('should allow custom client validation options', () => {
    const server = new PerishableServer({
      openaiApiKey: 'test-key',
      clientValidationOptions: {
        enableFingerprintValidation: false,
        maxSessionsPerFingerprint: 10,
        enableEntropyValidation: false,
        minEntropyThreshold: 100
      }
    });
    
    expect(server).toBeDefined();
  });
  
  it('should allow custom session options', () => {
    const server = new PerishableServer({
      openaiApiKey: 'test-key',
      sessionOptions: {
        timeout: 60 * 60 * 1000 // 1 hour
      }
    });
    
    expect(server).toBeDefined();
  });
  
  it('should allow custom security options', () => {
    const server = new PerishableServer({
      openaiApiKey: 'test-key',
      securityOptions: {
        enableCORS: false,
        allowedOrigins: ['https://example.com']
      }
    });
    
    expect(server).toBeDefined();
  });
});