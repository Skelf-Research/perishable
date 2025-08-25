We want to build a library that works in two parts
1. It provides a shim layer on top of the openAI npm sdk allowing a client side application to create a session and then connect wth a pershable proxy. This shim layer will also do client side fingerprinting, and other techniques to prevent open key abuse
2. There will be a perishable proxy server that will make calls to the openAI sdk for valid API calls. Its primary goal is to provide rate limiting, client validation

The key goal is to allow the developer to not have to expose their openAI keys, while being able to develop their frontend. We want as many safeguards to prevent API abuse on the browser without crippling the developer from using the entire openai sdk
