import { PerishableClient, PerishableClientOptions } from './perishable-client';
import { Fingerprinter } from './fingerprint';

export interface PerishableOpenAIOptions extends PerishableClientOptions {
  // Additional options specific to the OpenAI wrapper
}

export class PerishableOpenAI {
  private client: PerishableClient;
  
  constructor(options: PerishableOpenAIOptions) {
    this.client = new PerishableClient(options);
  }
  
  /**
   * Create a chat completion
   */
  public async createChatCompletion(options: any) {
    return await this.client.makeRequest('/openai/chat/completions', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }
  
  /**
   * Create a completion
   */
  public async createCompletion(options: any) {
    return await this.client.makeRequest('/openai/completions', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }
  
  /**
   * Create an embedding
   */
  public async createEmbedding(options: any) {
    return await this.client.makeRequest('/openai/embeddings', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }
  
  /**
   * List models
   */
  public async listModels() {
    return await this.client.makeRequest('/openai/models', {
      method: 'GET',
    });
  }
  
  /**
   * Get a model
   */
  public async getModel(modelId: string) {
    return await this.client.makeRequest(`/openai/models/${modelId}`, {
      method: 'GET',
    });
  }
  
  /**
   * Initialize entropy collection for enhanced security
   */
  public static initEntropyCollection(): void {
    Fingerprinter.initEntropyCollection();
  }
  
  /**
   * Create a new session
   */
  public async createSession(): Promise<string> {
    return await this.client.createSession();
  }
}