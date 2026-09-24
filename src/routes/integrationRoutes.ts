import express, { Request, Response } from 'express';
import { getDbWebhookEvents, getDbAutomationRuns } from '../db/repository.js';

const router = express.Router();

router.get('/integrations/webhooks/history', async (req: Request, res: Response) => {
  try {
    const events = await getDbWebhookEvents();
    return res.json({ events });
  } catch (err: any) {
    console.error('Failed to fetch webhook events:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.get('/integrations/n8n/runs', async (req: Request, res: Response) => {
  try {
    const runs = await getDbAutomationRuns();
    return res.json({ runs });
  } catch (err: any) {
    console.error('Failed to fetch automation runs:', err);
    return res.status(500).json({ error: err.message });
  }
});

export { router as integrationRoutes };
