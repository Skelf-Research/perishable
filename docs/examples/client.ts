import { PerishableOpenAI } from '../dist/client/perishable-openai';

// Initialize entropy collection for enhanced security
PerishableOpenAI.initEntropyCollection();

async function main() {
  const perishableClient = new PerishableOpenAI({
    proxyUrl: 'http://localhost:3000',
    abusePreventionOptions: {
      maxRetries: 3,
      retryDelay: 1000,
      requestTimeout: 30000,
      requireUserInteraction: true
    },
    sessionOptions: {
      expiryBuffer: 5 * 60 * 1000 // 5 minutes
    }
  });

  try {
    // Create a chat completion
    const response = await perishableClient.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Hello! What is the capital of France?'
        }
      ]
    });

    const data = await response.json();
    console.log(data.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();