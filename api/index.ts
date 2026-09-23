import type { VercelRequest, VercelResponse } from '@vercel/node';

let handler: ((req: any, res: any) => void) | null = null;

async function getHandler() {
  if (!handler) {
    const mod = await import('../dist/server.mjs');
    handler = mod.app ?? mod.default;
  }
  return handler;
}

export default async function (req: VercelRequest, res: VercelResponse) {
  const h = await getHandler();
  if (!h) return res.status(500).json({ error: 'Server failed to initialize' });
  return h(req, res);
}
