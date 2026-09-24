import { request } from '@playwright/test';
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HEALTH_URL = 'http://localhost:5000/api/health';
const BACKEND_DIR = path.resolve(__dirname, '../backend');

export default async function globalSetup() {
  await waitForBackend();

  console.log('\nResetting database schema for E2E run...');
  execFileSync('node', ['e2e/reset-db.mjs'], { stdio: 'inherit' });

  console.log('Seeding database for E2E run...');
  execFileSync('node', ['src/start.js', '--seed'], { cwd: BACKEND_DIR, stdio: 'inherit' });
  console.log('Seed complete.\n');
}

async function waitForBackend() {
  const context = await request.newContext({ baseURL: HEALTH_URL });

  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await context.get('');
      const body = await res.json();
      if (body.status === 'ok') {
        await context.dispose();
        return;
      }
    } catch {
      // server not up yet — keep polling
    }
    await new Promise((r) => setTimeout(r, 2_000));
  }

  await context.dispose();
  throw new Error(
    'Backend did not become ready with a connected database. ' +
      'Start PostgreSQL first: docker compose up -d, then run npm run test:e2e.',
  );
}