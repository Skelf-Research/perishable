import { describe, it, expect, vi } from 'vitest';
import { PerishableClient } from '../../../dist/client/perishable-client';

// Mock browser APIs for testing
const mockDocument = {
  addEventListener: vi.fn(),
};

const mockNavigator = {
  userAgent: 'test-agent',
  language: 'en-US',
  plugins: [],
};

const mockScreen = {
  width: 1920,
  height: 1080,
  colorDepth: 24,
  pixelDepth: 24,
};

// Mock global browser objects
Object.defineProperty(global, 'document', { value: mockDocument });
Object.defineProperty(global, 'navigator', { value: mockNavigator });
Object.defineProperty(global, 'screen', { value: mockScreen });
Object.defineProperty(global, 'window', { value: {} });

describe('PerishableClient', () => {
  it('should create a client instance', () => {
    const client = new PerishableClient({
      proxyUrl: 'http://localhost:3000'
    });
    
    expect(client).toBeInstanceOf(PerishableClient);
  });
  
  it('should have default abuse prevention options', () => {
    const client = new PerishableClient({
      proxyUrl: 'http://localhost:3000'
    });
    
    // Access private properties through reflection for testing
    // In a real test, we would have public getter methods
    expect((client as any).maxRetries).toBe(3);
    expect((client as any).retryDelay).toBe(1000);
    expect((client as any).requestTimeout).toBe(30000);
  });
  
  it('should allow custom abuse prevention options', () => {
    const client = new PerishableClient({
      proxyUrl: 'http://localhost:3000',
      abusePreventionOptions: {
        maxRetries: 5,
        retryDelay: 2000,
        requestTimeout: 60000
      }
    });
    
    expect((client as any).maxRetries).toBe(5);
    expect((client as any).retryDelay).toBe(2000);
    expect((client as any).requestTimeout).toBe(60000);
  });
});