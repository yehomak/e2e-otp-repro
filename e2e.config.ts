import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_API_KEY,
});

export default {
  targets: [{
    engine: web(),
    app: {
      url: 'http://localhost:3200',
      command: { executable: 'node', args: ['server.mjs'], reuseExisting: true },
    },
  }],
  agents: { default: { model: google('gemini-flash-lite-latest') } },
} satisfies E2EConfig;
