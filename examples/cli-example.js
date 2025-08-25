#!/usr/bin/env node

/**
 * Example script showing how to use the Perishable proxy server CLI
 */

// This is just an example - in practice you would run the CLI directly:
// OPENAI_API_KEY=your-key perishable-proxy --config ./perishable.config.json

console.log('To run the Perishable proxy server:');
console.log('');
console.log('1. Set your OpenAI API key:');
console.log('   export OPENAI_API_KEY=your-actual-api-key');
console.log('');
console.log('2. Run the server with default config:');
console.log('   npx perishable-proxy');
console.log('');
console.log('3. Or run with a specific config file:');
console.log('   npx perishable-proxy --config ./perishable.config.json');
console.log('');
console.log('4. Or run with specific options:');
console.log('   OPENAI_API_KEY=your-key npx perishable-proxy --port 8080');