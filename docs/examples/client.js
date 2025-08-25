"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const perishable_openai_1 = require("../dist/client/perishable-openai");
async function main() {
    const perishableClient = new perishable_openai_1.PerishableOpenAI({
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
    }
    catch (error) {
        console.error('Error:', error);
    }
}
main();
//# sourceMappingURL=client.js.map