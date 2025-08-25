import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PerishableServer } from '../../dist/server/perishable-server';
import { PerishableOpenAI } from '../../dist/client/perishable-openai';

describe('Perishable Integration', () => {
  let server: PerishableServer;
  let client: PerishableOpenAI;
  
  beforeAll(() => {
    // Create a mock server instance
    server = new PerishableServer({
      openaiApiKey: 'test-key',
      port: 3001
    });
    
    // Create a client instance
    client = new PerishableOpenAI({
      proxyUrl: 'http://localhost:3001'
    });
  });
  
  it('should create a server instance', () => {
    expect(server).toBeInstanceOf(PerishableServer);
  });
  
  it('should create a client instance', () => {
    expect(client).toBeInstanceOf(PerishableOpenAI);
  });
});