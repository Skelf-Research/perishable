#!/usr/bin/env node

import { PerishableServer } from './perishable-server';

// Get the OpenAI API key from environment variables
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.error('OPENAI_API_KEY environment variable is required');
  process.exit(1);
}

// Create and start the server
const server = new PerishableServer({
  openaiApiKey,
  port: parseInt(process.env.PORT || '3000', 10)
});

server.start();