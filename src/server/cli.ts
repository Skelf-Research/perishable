#!/usr/bin/env node

import { PerishableServer, PerishableServerOptions } from './perishable-server';
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';

// Initialize commander
const program = new Command();

program
  .name('perishable-proxy')
  .description('CLI to run the Perishable proxy server')
  .version('1.0.0')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-p, --port <number>', 'Port to run the server on')
  .option('--openai-api-key <key>', 'OpenAI API key')
  .option('--openai-base-url <url>', 'OpenAI API base URL')
  .action(async (options) => {
    let config: Partial<PerishableServerOptions> = {};
    
    // Determine config file path
    let configPath = '';
    if (options.config) {
      configPath = path.resolve(options.config);
    } else {
      // Check for default config file in current directory
      const defaultConfigPath = path.join(process.cwd(), 'perishable.config.json');
      if (fs.existsSync(defaultConfigPath)) {
        configPath = defaultConfigPath;
      }
    }
    
    // Load configuration from file if found
    if (configPath) {
      try {
        const configFile = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(configFile);
        console.log(`Loaded configuration from ${configPath}`);
      } catch (error) {
        console.error(`Error loading config file: ${error}`);
        process.exit(1);
      }
    }
    
    // Override with command line options
    if (options.port) {
      config.port = parseInt(options.port, 10);
    }
    
    if (options.openaiBaseUrl) {
      config.openaiBaseUrl = options.openaiBaseUrl;
    }
    
    // Get OpenAI API key from options, environment, or config
    const openaiApiKey = 
      options.openaiApiKey || 
      process.env.OPENAI_API_KEY || 
      config.openaiApiKey;
    
    // Get OpenAI base URL from options, environment, or config
    const openaiBaseUrl = 
      options.openaiBaseUrl || 
      process.env.OPENAI_BASE_URL || 
      config.openaiBaseUrl;
    
    if (!openaiApiKey) {
      console.error('OpenAI API key is required. Provide it via --openai-api-key, OPENAI_API_KEY environment variable, or in the config file.');
      process.exit(1);
    }
    
    // Create and start the server
    const server = new PerishableServer({
      openaiApiKey,
      openaiBaseUrl,
      ...config
    });
    
    server.start();
  });

program.parse();