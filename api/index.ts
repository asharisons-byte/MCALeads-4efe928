import { app } from '../dist/server.cjs';

// Vercel Serverless Function Handler
// Uses the compiled Express server generated during the build.

export default function handler(req: any, res: any) {
  return app(req, res);
}
