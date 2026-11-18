import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';
import { gateway } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// AI_GATEWAY_API_KEY (any gateway model via E2E_MODEL) wins; else a Google key.
const model = process.env.AI_GATEWAY_API_KEY
  ? gateway(process.env.E2E_MODEL ?? 'openai/gpt-6-luna-fast')
  : createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_API_KEY,
    })('gemini-flash-lite-latest');

export default {
  targets: [{
    engine: web(),
    app: {
      url: 'http://localhost:3200',
      command: { executable: 'node', args: ['server.mjs'], reuseExisting: true },
    },
  }],
  agents: { default: { model } },
} satisfies E2EConfig;
