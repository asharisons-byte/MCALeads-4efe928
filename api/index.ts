import express from 'express';
import type { Request, Response } from 'express';

// Inline a minimal bootstrap that re-uses the compiled server bundle
// produced by the build script: esbuild server.ts → dist/server.cjs
let appHandler: ((req: Request, res: Response) => void) | null = null;

async function getApp() {
  if (!appHandler) {
    const mod = await import('../dist/server.cjs');
    appHandler = mod.app || mod.default;
  }
  return appHandler;
}

export default async function handler(req: Request, res: Response) {
  const app = await getApp();
  if (!app) {
    return res.status(500).json({ error: 'Server failed to initialize' });
  }
  return (app as any)(req, res);
}
