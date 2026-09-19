import { app } from '../server.ts';

// Vercel Serverless Function Handler
// This file wraps the existing Express application for Vercel deployment.
// When Vercel receives a request to /api/*, it executes this handler,
// which passes the request and response to the Express app.

export default function handler(req: any, res: any) {
  return app(req, res);
}
