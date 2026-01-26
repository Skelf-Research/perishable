# Getting Started

Get Perishable up and running in 5 minutes.

## Prerequisites

- Node.js 18 or higher
- An OpenAI API key

## Step 1: Install Perishable

```bash
npm install perishable
```

## Step 2: Start the Proxy Server

The quickest way to start the proxy server is using the CLI:

```bash
OPENAI_API_KEY=your-api-key perishable-proxy
```

You should see:

```
Perishable proxy server running on port 3000
Rate limiting: 100 requests per 60 seconds
Fingerprint validation: enabled
Max sessions per fingerprint: 5
Entropy validation: enabled
```

## Step 3: Use the Client Library

In your frontend application:

```javascript
import { client } from 'perishable';

// Initialize entropy collection (call once on page load)
client.PerishableOpenAI.initEntropyCollection();

// Create a client instance
const perishable = new client.PerishableOpenAI({
  proxyUrl: 'http://localhost:3000'
});

// Make API requests
async function chat(message) {
  const response = await perishable.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: message }]
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

## Step 4: Test Your Setup

Create a simple HTML page to test:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Perishable Test</title>
</head>
<body>
  <button id="test">Send Message</button>
  <div id="response"></div>

  <script type="module">
    import { client } from 'perishable';

    client.PerishableOpenAI.initEntropyCollection();

    const perishable = new client.PerishableOpenAI({
      proxyUrl: 'http://localhost:3000'
    });

    document.getElementById('test').addEventListener('click', async () => {
      const response = await perishable.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello!' }]
      });

      const data = await response.json();
      document.getElementById('response').textContent =
        data.choices[0].message.content;
    });
  </script>
</body>
</html>
```

!!! note "Entropy Collection"
    The client requires user interaction (mouse movements or key presses) before it can create a session. This is a security feature to prevent automated abuse.

## What's Next?

- [Server Guide](guides/server.md) - Learn about server configuration options
- [Client Guide](guides/client.md) - Deep dive into the client library
- [CLI Usage](guides/cli.md) - Run the server with a configuration file
- [Configuration](configuration.md) - Full configuration reference
