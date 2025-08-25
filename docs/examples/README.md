# Perishable Example Application

This is a simple example of how to use the Perishable library.

## Server Setup

```javascript
// server.js
import { server } from 'perishable';

const serverInstance = new server.PerishableServer({
  openaiApiKey: process.env.OPENAI_API_KEY,
  port: 3000
});

serverInstance.start();
```

## Client Setup

```javascript
// client.js
import { client } from 'perishable';

async function main() {
  const perishableClient = new client.PerishableOpenAI({
    proxyUrl: 'http://localhost:3000'
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
```

## Running the Example

1. Start the server:
   ```bash
   node dist/server.js
   ```

2. Run the client:
   ```bash
   node dist/client.js
   ```

This example demonstrates how to use Perishable to securely access the OpenAI API without exposing your API key in the client-side code.