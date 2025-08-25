import express, { Request, Response } from 'express';
import { OpenAI } from 'openai';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import jwt from 'jsonwebtoken';

export interface PerishableServerOptions {
  /**
   * The OpenAI API key
   */
  openaiApiKey: string;
  
  /**
   * The port to run the server on
   */
  port?: number;
  
  /**
   * Rate limiting options
   */
  rateLimitOptions?: {
    points?: number; // Number of points
    duration?: number; // Per duration in seconds
    blockDuration?: number; // Block duration in seconds
  };
  
  /**
   * Client validation options
   */
  clientValidationOptions?: {
    enableFingerprintValidation?: boolean;
    maxSessionsPerFingerprint?: number;
    enableEntropyValidation?: boolean;
    minEntropyThreshold?: number;
  };
  
  /**
   * Session options
   */
  sessionOptions?: {
    timeout?: number; // Session timeout in milliseconds
    jwtSecret?: string; // Secret for JWT signing
  };
  
  /**
   * Security options
   */
  securityOptions?: {
    enableCORS?: boolean;
    allowedOrigins?: string[];
    enableHelmet?: boolean;
    enableCompression?: boolean;
  };
}

interface SessionData {
  sessionId: string;
  fingerprint: string;
  createdAt: number;
  lastAccessed: number;
  entropyData?: string; // Store entropy data for validation
}

export class PerishableServer {
  private app: express.Application;
  private openai: OpenAI;
  private port: number;
  private sessions: Map<string, SessionData>;
  private sessionTimeout: number;
  private rateLimiter: RateLimiterMemory;
  private enableFingerprintValidation: boolean;
  private maxSessionsPerFingerprint: number;
  private enableEntropyValidation: boolean;
  private minEntropyThreshold: number;
  private allowedOrigins: string[];
  private jwtSecret: string;

  constructor(options: PerishableServerOptions) {
    this.app = express();
    this.port = options.port || 3000;
    this.openai = new OpenAI({ apiKey: options.openaiApiKey });
    this.sessions = new Map();
    
    // Set up session options
    const { timeout = 30 * 60 * 1000, jwtSecret = this.generateSecret() } = options.sessionOptions || {}; // 30 minutes default
    this.sessionTimeout = timeout;
    this.jwtSecret = jwtSecret;
    
    // Set up rate limiting
    const { 
      points = 100, 
      duration = 60,
      blockDuration = 60
    } = options.rateLimitOptions || {};
    
    this.rateLimiter = new RateLimiterMemory({
      points,
      duration,
      blockDuration
    });
    
    // Set up client validation options
    const { 
      enableFingerprintValidation = true, 
      maxSessionsPerFingerprint = 5,
      enableEntropyValidation = true,
      minEntropyThreshold = 50
    } = options.clientValidationOptions || {};
    
    this.enableFingerprintValidation = enableFingerprintValidation;
    this.maxSessionsPerFingerprint = maxSessionsPerFingerprint;
    this.enableEntropyValidation = enableEntropyValidation;
    this.minEntropyThreshold = minEntropyThreshold;
    
    // Set up security options
    const { 
      enableCORS = true,
      allowedOrigins = ['*']
    } = options.securityOptions || {};
    
    this.allowedOrigins = allowedOrigins;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSessionCleanup();
  }

  private setupMiddleware(): void {
    // Parse JSON bodies
    this.app.use(express.json({ limit: '10mb' }));
    
    // Add CORS headers if enabled
    if (this.allowedOrigins.length > 0) {
      this.app.use((req, res, next) => {
        const origin = req.get('Origin');
        const allowedOrigin = this.allowedOrigins.includes('*') || 
                             this.allowedOrigins.includes(origin || '') ?
                             origin : this.allowedOrigins[0];
        
        res.header('Access-Control-Allow-Origin', allowedOrigin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Session-ID, X-Request-Signature');
        res.header('Access-Control-Allow-Credentials', 'true');
        next();
      });
    }
    
    // Add security headers
    this.app.use((req, res, next) => {
      res.header('X-Content-Type-Options', 'nosniff');
      res.header('X-Frame-Options', 'DENY');
      res.header('X-XSS-Protection', '1; mode=block');
      next();
    });
    
    // Rate limiting middleware
    this.app.use(async (req: Request, res: Response, next) => {
      try {
        // Use IP address and session ID for rate limiting
        const sessionId = req.header('X-Session-ID') || '';
        const clientId = `${req.ip}:${sessionId}`;
        
        await this.rateLimiter.consume(clientId);
        next();
      } catch (error) {
        res.status(429).json({ 
          error: 'Rate limit exceeded',
          message: 'Too many requests, please try again later'
        });
      }
    });
    
    // Session validation middleware using JWT
    this.app.use('/openai/*', (req: Request, res: Response, next) => {
      const authHeader = req.header('Authorization');
      const signatureHeader = req.header('X-Request-Signature');
      
      if (!authHeader) {
        return res.status(401).json({ 
          error: 'Missing authorization header',
          message: 'Authorization header with JWT token is required'
        });
      }
      
      // Extract token from "Bearer <token>" format
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      
      try {
        // Verify JWT token
        const decoded = jwt.verify(token, this.jwtSecret) as any;
        
        // Check if token is expired
        if (Date.now() > decoded.exp * 1000) {
          return res.status(401).json({ 
            error: 'Token expired',
            message: 'Session token has expired'
          });
        }
        
        // Validate fingerprint if enabled
        if (this.enableFingerprintValidation) {
          const { fingerprint } = req.body || {};
          if (fingerprint && decoded.fingerprint !== fingerprint) {
            return res.status(401).json({ 
              error: 'Fingerprint mismatch',
              message: 'Client fingerprint does not match session'
            });
          }
        }
        
        // Validate entropy if enabled
        if (this.enableEntropyValidation) {
          const { fingerprint } = req.body || {};
          if (fingerprint && !this.hasSufficientEntropy(fingerprint)) {
            return res.status(401).json({ 
              error: 'Insufficient entropy',
              message: 'Client has not provided sufficient interaction entropy'
            });
          }
        }
        
        // Validate request signature if provided
        if (signatureHeader && !this.validateRequestSignature(req, signatureHeader, decoded.sessionId)) {
          return res.status(401).json({ 
            error: 'Invalid signature',
            message: 'Request signature is invalid'
          });
        }
        
        // Add session data to request for use in routes
        (req as any).session = decoded;
        next();
      } catch (error) {
        return res.status(401).json({ 
          error: 'Invalid token',
          message: 'Session token is invalid or malformed'
        });
      }
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });
    
    // Session creation endpoint with JWT
    this.app.post('/session', async (req: Request, res: Response) => {
      try {
        const { fingerprint, entropyData } = req.body;
        
        if (!fingerprint) {
          return res.status(400).json({ 
            error: 'Missing fingerprint',
            message: 'Fingerprint is required to create a session'
          });
        }
        
        // Check if fingerprint validation is enabled
        if (this.enableFingerprintValidation) {
          // Count existing sessions for this fingerprint
          let sessionCount = 0;
          for (const session of this.sessions.values()) {
            if (session.fingerprint === fingerprint) {
              sessionCount++;
            }
          }
          
          // Check if we've exceeded the maximum sessions per fingerprint
          if (sessionCount >= this.maxSessionsPerFingerprint) {
            return res.status(429).json({ 
              error: 'Maximum sessions exceeded',
              message: `Maximum sessions per fingerprint exceeded (${this.maxSessionsPerFingerprint})`
            });
          }
        }
        
        // Validate entropy if enabled
        if (this.enableEntropyValidation) {
          if (!this.hasSufficientEntropy(fingerprint)) {
            return res.status(400).json({ 
              error: 'Insufficient entropy',
              message: 'Client has not provided sufficient interaction entropy'
            });
          }
        }
        
        // Generate a new session ID
        const sessionId = this.generateSessionId();
        
        // Create JWT token
        const token = jwt.sign(
          {
            sessionId,
            fingerprint,
            createdAt: Date.now(),
            exp: Math.floor(Date.now() / 1000) + (this.sessionTimeout / 1000)
          },
          this.jwtSecret
        );
        
        // Store session data
        const sessionData: SessionData = {
          sessionId,
          fingerprint,
          createdAt: Date.now(),
          lastAccessed: Date.now(),
          entropyData
        };
        
        this.sessions.set(sessionId, sessionData);
        
        // Return session data with JWT token
        res.status(200).json({
          token,
          sessionId,
          expiresAt: Date.now() + this.sessionTimeout,
        });
      } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ 
          error: 'Internal server error',
          message: 'An error occurred while creating the session'
        });
      }
    });
    
    // Proxy endpoint for OpenAI API calls
    this.app.use('/openai/*', async (req: Request, res: Response) => {
      try {
        // Extract the OpenAI API endpoint from the request
        const openaiEndpoint = req.url.replace('/openai', '');
        const session = (req as any).session;
        
        // Prepare the request to OpenAI
        const openaiResponse = await fetch(`https://api.openai.com/v1${openaiEndpoint}`, {
          method: req.method,
          headers: {
            'Authorization': `Bearer ${this.openai.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.body),
        });
        
        // Get response data
        const data = await openaiResponse.json();
        
        // Update last accessed time
        if (session && session.sessionId) {
          const sessionData = this.sessions.get(session.sessionId);
          if (sessionData) {
            sessionData.lastAccessed = Date.now();
          }
        }
        
        // Send response back to client
        res.status(openaiResponse.status).json(data);
      } catch (error) {
        console.error('Error proxying request to OpenAI:', error);
        res.status(500).json({ 
          error: 'Error communicating with OpenAI API',
          message: 'An error occurred while communicating with the OpenAI API'
        });
      }
    });
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private generateSecret(): string {
    return Math.random().toString(36).substring(2) + 
           Math.random().toString(36).substring(2) + 
           Math.random().toString(36).substring(2);
  }

  private setupSessionCleanup(): void {
    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [sessionId, session] of this.sessions.entries()) {
        if (now - session.lastAccessed > this.sessionTimeout) {
          this.sessions.delete(sessionId);
        }
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Check if a fingerprint has sufficient entropy
   */
  private hasSufficientEntropy(fingerprint: string): boolean {
    // In a real implementation, we would analyze the entropy data
    // For now, we'll use a simple heuristic based on fingerprint length
    // A real implementation would analyze mouse movements, key presses, etc.
    return fingerprint.length > this.minEntropyThreshold;
  }

  /**
   * Validate request signature
   */
  private validateRequestSignature(req: Request, signature: string, sessionId: string): boolean {
    // Create a signature string from request details
    const signatureString = `${req.method}|${req.url}|${JSON.stringify(req.body)}|${sessionId}|${req.header('X-Timestamp') || ''}`;
    
    // In a real implementation, we would use a proper HMAC signature
    // For now, we'll use a simple hash comparison
    const expectedSignature = this.simpleHash(signatureString);
    
    return signature === expectedSignature;
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

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Perishable proxy server running on port ${this.port}`);
      console.log(`Rate limiting: ${this.rateLimiter.points} requests per ${this.rateLimiter.duration} seconds`);
      console.log(`Fingerprint validation: ${this.enableFingerprintValidation ? 'enabled' : 'disabled'}`);
      console.log(`Max sessions per fingerprint: ${this.maxSessionsPerFingerprint}`);
      console.log(`Entropy validation: ${this.enableEntropyValidation ? 'enabled' : 'disabled'}`);
      console.log(`JWT secret: ${this.jwtSecret.substring(0, 10)}...`); // Show only first 10 chars
    });
  }
}