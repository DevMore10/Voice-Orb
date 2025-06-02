# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Voice Orb Integration

The Voice Orb component uses a webhook URL from an n8n AI agent workflow to process chat messages and handle AI responses. The n8n workflow consists of the following components:

- **Webhook - Chat Input**: Entry point that receives POST requests from the Voice Orb
- **Validate Message**: Validates incoming message format
- **Extract Request Data**: Processes the incoming data (manual operation)
- **If**: Conditional check that routes to different paths
- **Process File Context**: Handles file attachments (manual operation)
- **Gemini AI Request**: Sends request to Google's Gemini AI (POST to generativelanguage endpoint)
- **Process Text Only**: Handles text-only messages (manual operation)
- **Extract AI Response**: Extracts the AI's response (manual operation)
- **Success Response**: Returns the successful response to the client
- **Error Response**: Returns error information when validation fails
- **Check for API Errors**: Validates API responses
- **API Error Response**: Returns specific API error information

To use this integration, set your webhook URL in the environment variable:

```
VITE_WEBHOOK_URL=https://your-n8n-instance-url/webhook/your-endpoint-path
```

## ElevenLabs Conversational AI

Voice Orb integrates ElevenLabs' conversational AI capabilities to provide a natural voice interface. The integration offers:

- **Real-time Voice Conversations**: Talk directly with the AI assistant "Kiaan" through the microphone
- **Multi-mode Support**:

  - **Talk Mode**: One-on-one conversations with the AI assistant
  - **Meeting Mode**: Enhanced conversation mode designed for meeting scenarios
  - **Chat Mode**: Text-based interaction with optional voice responses

- **Voice Feedback**: The system provides real-time feedback when the AI is speaking or listening
- **Error Handling**: Built-in error management for connection issues and conversation failures

To use ElevenLabs Conversational AI, ensure you have the required dependencies:

```
npm install @elevenlabs/react
```

The Voice Panel component utilizes the `useConversation` hook from ElevenLabs React SDK to manage voice interactions:

```jsx
// Example usage of ElevenLabs conversation hook
const conversation = useConversation({
  onConnect: () => console.log("Connected"),
  onDisconnect: () => console.log("Disconnected"),
  onMessage: (message) => console.log("Message received:", message),
  onError: (error) => console.error("Conversation error:", error),
});
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
