import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

// The code is new on every page load. Run this file twice: the second run replays
// the first run's digits and the page shows "Incorrect code" before the agent recovers.
test('enters the code shown on the page', async ({ app, agent, screen }) => {
  await app.open('/');
  await agent.act('type the code shown on the page into the code boxes, one digit per box');
  await expect(screen.getByRole('status')).toHaveText('Code verified');
});
