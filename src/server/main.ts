#!/usr/bin/env node

import { PerishableServer } from './perishable-server';

// Get the OpenAI API key from environment variables
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.error('OPENAI_API_KEY environment variable is required');
  process.exit(1);
}

// Prepare server options
const serverOptions: any = {
  openaiApiKey,
  port: parseInt(process.env.PORT || '3000', 10)
};

// Add base URL if provided
if (process.env.OPENAI_BASE_URL) {
  serverOptions.openaiBaseUrl = process.env.OPENAI_BASE_URL;
}

// Create and start the server
const server = new PerishableServer(serverOptions);

server.start();