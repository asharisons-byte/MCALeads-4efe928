import type { VercelRequest, VercelResponse } from '@vercel/node';

// Cache the handler and any initialization error separately so a
// transient cold-start failure doesn't permanently poison the cache.
let handler: ((req: any, res: any) => void) | null = null;
let initError: unknown = null;

async function getHandler() {
  // Re-attempt if the previous import failed (e.g. DB not ready yet)
  if (initError) {
    console.warn('Retrying server initialization after previous error:', initError);
    handler = null;
    initError = null;
  }

  if (!handler) {
    try {
      const mod = await import('../dist/server.mjs');
      // server.ts exports `export const app = express()` (named export, no default)
      handler = mod.app ?? mod.default;
      if (!handler) {
        throw new Error('dist/server.mjs did not export `app` or a default handler');
      }
    } catch (err) {
      initError = err;
      throw err;
    }
  }

  return handler;
}

export default async function (req: VercelRequest, res: VercelResponse) {
  // Surface /api/users/me (and every other /api route) to the Express app
  // that lives in dist/server.mjs.  All routing — including Firebase-JWT
  // auth middleware — is handled there; this file is just the Vercel
  // entrypoint that delegates to it.
  try {
    const h = await getHandler();
    return h(req, res);
  } catch (err: any) {
    console.error('Server initialization failed:', err);
    return res.status(500).json({
      error: 'Server failed to initialize',
      detail: process.env.NODE_ENV !== 'production' ? String(err?.message ?? err) : undefined,
    });
  }
}
