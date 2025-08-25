import { PerishableServer } from '../dist/server/perishable-server';

// Get the OpenAI API key from environment variables
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.error('OPENAI_API_KEY environment variable is required');
  process.exit(1);
}

// Create and start the server with enhanced security options
const server = new PerishableServer({
  openaiApiKey,
  port: parseInt(process.env.PORT || '3000', 10),
  rateLimitOptions: {
    points: 100,
    duration: 60,
    blockDuration: 60
  },
  clientValidationOptions: {
    enableFingerprintValidation: true,
    maxSessionsPerFingerprint: 5,
    enableEntropyValidation: true,
    minEntropyThreshold: 50
  },
  sessionOptions: {
    timeout: 30 * 60 * 1000 // 30 minutes
  },
  securityOptions: {
    enableCORS: true,
    allowedOrigins: ['*']
  }
});

server.start();