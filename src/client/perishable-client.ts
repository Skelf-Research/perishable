import { OpenAI } from 'openai';
import { Fingerprinter } from './fingerprint';

export interface PerishableClientOptions {
  /**
   * The URL of the perishable proxy server
   */
  proxyUrl: string;
  
  /**
   * Optional API key for direct access (for testing purposes)
   */
  apiKey?: string;
  
  /**
   * Abuse prevention options
   */
  abusePreventionOptions?: {
    maxRetries?: number;
    retryDelay?: number;
    requestTimeout?: number;
    requireUserInteraction?: boolean;
  };
  
  /**
   * Session options
   */
  sessionOptions?: {
    expiryBuffer?: number; // Buffer time before session expiry (in milliseconds)
    enableRequestSigning?: boolean; // Enable request signing
  };
  
  /**
   * Security options
   */
  securityOptions?: {
    jwtSecret?: string; // Secret for JWT signing (should match server)
  };
}

export interface SessionData {
  token: string;
  sessionId: string;
  expiresAt: number;
  fingerprint: string;
}

export class PerishableClient {
  private openai: OpenAI | null = null;
  private proxyUrl: string;
  private apiKey: string | undefined;
  private sessionData: SessionData | null = null;
  private sessionExpiryBuffer: number;
  private maxRetries: number;
  private retryDelay: number;
  private requestTimeout: number;
  private requireUserInteraction: boolean;
  private enableRequestSigning: boolean;
  private jwtSecret: string | undefined;

  constructor(options: PerishableClientOptions) {
    this.proxyUrl = options.proxyUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = options.apiKey;
    
    // Set up abuse prevention options
    const { 
      maxRetries = 3, 
      retryDelay = 1000, 
      requestTimeout = 30000,
      requireUserInteraction = true
    } = options.abusePreventionOptions || {};
    
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.requestTimeout = requestTimeout;
    this.requireUserInteraction = requireUserInteraction;
    
    // Set up session options
    const { 
      expiryBuffer = 5 * 60 * 1000, // 5 minutes default
      enableRequestSigning = true
    } = options.sessionOptions || {};
    
    this.sessionExpiryBuffer = expiryBuffer;
    this.enableRequestSigning = enableRequestSigning;
    
    // Set up security options
    const { jwtSecret } = options.securityOptions || {};
    this.jwtSecret = jwtSecret;
    
    // Initialize entropy collection if required
    if (this.requireUserInteraction) {
      Fingerprinter.initEntropyCollection();
    }
    
    // If an API key is provided, create a direct OpenAI client
    // This is useful for testing or local development
    if (this.apiKey) {
      this.openai = new OpenAI({ apiKey: this.apiKey });
    }
  }

  /**
   * Get client fingerprint
   */
  private async getClientFingerprint(): Promise<string> {
    return await Fingerprinter.generate();
  }

  /**
   * Create a new session with the proxy server
   */
  public async createSession(): Promise<string> {
    // Check if we already have a valid session
    if (this.sessionData && !this.isSessionExpired()) {
      return this.sessionData.token;
    }

    // Generate client fingerprint
    const fingerprint = await this.getClientFingerprint();
    
    // Make request to proxy server to create session
    try {
      const response = await this.fetchWithTimeout(`${this.proxyUrl}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fingerprint,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`);
      }

      const data = await response.json();
      const { token, sessionId } = data;
      
      // Store session data
      this.sessionData = {
        token,
        sessionId,
        expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes from now
        fingerprint,
      };
      
      return token;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Check if the current session is expired
   */
  private isSessionExpired(): boolean {
    if (!this.sessionData) {
      return true;
    }
    
    return Date.now() > (this.sessionData.expiresAt - this.sessionExpiryBuffer);
  }

  /**
   * Get the current session token, creating a new session if necessary
   */
  private async getSessionToken(): Promise<string> {
    // If we're using direct API access, we don't need sessions
    if (this.apiKey && this.openai) {
      throw new Error('Session not needed when using direct API access');
    }
    
    // Create a new session if we don't have one or it's expired
    if (!this.sessionData || this.isSessionExpired()) {
      await this.createSession();
    }
    
    if (!this.sessionData) {
      throw new Error('Failed to create session');
    }
    
    return this.sessionData.token;
  }

  /**
   * Generate a request signature
   */
  private generateRequestSignature(method: string, url: string, body: any): string {
    // Create a signature string from request details
    const signatureString = `${method}|${url}|${JSON.stringify(body)}|${this.sessionData?.sessionId || ''}|${Date.now()}`;
    
    // In a real implementation, we would use a proper HMAC signature
    // For now, we'll use a simple hash
    return this.simpleHash(signatureString);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Make a request to the OpenAI API through the proxy
   */
  public async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    // If we have a direct API key, use it instead of the proxy
    if (this.apiKey && this.openai) {
      // For direct API access, we would normally use the OpenAI SDK directly
      // But for consistency with the proxy approach, we'll throw an error
      // In a real implementation, you would use the OpenAI SDK methods
      throw new Error('Direct API access should use the OpenAI SDK directly');
    }
    
    // Get session token
    const token = await this.getSessionToken();
    
    // Generate fingerprint for this request
    const fingerprint = await this.getClientFingerprint();
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers as Record<string, string>,
    };
    
    // Add request signature if enabled
    if (this.enableRequestSigning) {
      const signature = this.generateRequestSignature(
        options.method || 'GET',
        endpoint,
        options.body ? JSON.parse(options.body.toString()) : {}
      );
      
      headers['X-Request-Signature'] = signature;
      headers['X-Timestamp'] = Date.now().toString();
    }
    
    // Add fingerprint to body
    const body = options.body ? JSON.parse(options.body.toString()) : {};
    body.fingerprint = fingerprint;
    
    // Make request to proxy server with retry logic
    return await this.fetchWithRetry(`${this.proxyUrl}${endpoint}`, {
      ...options,
      headers,
      body: JSON.stringify(body),
    });
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Fetch with retry logic
   */
  private async fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let i = 0; i <= this.maxRetries; i++) {
      try {
        return await this.fetchWithTimeout(url, options);
      } catch (error: any) {
        lastError = error;
        
        // If this is the last attempt, throw the error
        if (i === this.maxRetries) {
          throw lastError;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, i)));
      }
    }
    
    throw lastError;
  }
}