"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const perishable_server_1 = require("../dist/server/perishable-server");
// Get the OpenAI API key from environment variables
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
    console.error('OPENAI_API_KEY environment variable is required');
    process.exit(1);
}
// Create and start the server
const server = new perishable_server_1.PerishableServer({
    openaiApiKey,
    port: parseInt(process.env.PORT || '3000', 10)
});
server.start();
//# sourceMappingURL=server.js.map