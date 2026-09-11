import express, { Request, Response } from 'express';
import {
  initDatabaseDefaults,
  getDbLeads,
  getDbLeadById,
  checkLeadDuplicate,
  createDbLead,
  updateDbLead,
  archiveOrDeleteDbLead,
  addDbLeadNote,
  deleteDbLeadNote,
  addDbLeadCall,
  addDbLeadEmail,
  addDbLeadSms,
  addDbLeadTask,
  convertDbLeadToClient,
  getDbClients,
  getDbDashboardMetrics,
  getDbActivities,
  getDbAuditLogs,
  getDbAgencySettings,
  updateDbAgencySettings,
  getDbSystemHealth,
  batchImportDbLeads,
} from '../db/repository.ts';

const router = express.Router();

// 1. Health & Database Probe
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await getDbSystemHealth();
    return res.json(health);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Leads: List & Search
router.get('/leads', async (req: Request, res: Response) => {
  try {
    const { search, status, niche, city, isHotTarget, limit, offset } = req.query;
    const leads = await getDbLeads({
      search: search ? String(search) : undefined,
      status: status ? String(status) : undefined,
      niche: niche ? String(niche) : undefined,
      city: city ? String(city) : undefined,
      isHotTarget: isHotTarget === 'true',
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
    return res.json({ leads, total: leads.length });
  } catch (err: any) {
    console.error('API /leads error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 3. Leads: Check Duplicates
router.post('/leads/check-duplicate', async (req: Request, res: Response) => {
  try {
    const { businessName, phone, email, website } = req.body;
    const result = await checkLeadDuplicate({ businessName, phone, email, website });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Leads: Batch Import
router.post('/leads/batch-import', async (req: Request, res: Response) => {
  try {
    const { rows, meta } = req.body;
    if (!Array.isArray(rows)) {
      return res.status(400).json({ error: 'rows must be an array' });
    }
    const result = await batchImportDbLeads(rows, meta || { fileName: 'upload.csv' });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. Leads: Get by ID
router.get('/leads/:id', async (req: Request, res: Response) => {
  try {
    const lead = await getDbLeadById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    return res.json({ lead });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. Leads: Create
router.post('/leads', async (req: Request, res: Response) => {
  try {
    const lead = await createDbLead(req.body);
    return res.status(201).json({ lead });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 7. Leads: Update
router.put('/leads/:id', async (req: Request, res: Response) => {
  try {
    const updated = await updateDbLead(req.params.id, req.body);
    return res.json({ lead: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 8. Leads: Delete / Archive
router.delete('/leads/:id', async (req: Request, res: Response) => {
  try {
    const soft = req.query.soft !== 'false';
    const deleted = await archiveOrDeleteDbLead(req.params.id, soft);
    return res.json({ success: true, lead: deleted });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 9. Lead Notes: Add
router.post('/leads/:id/notes', async (req: Request, res: Response) => {
  try {
    const note = await addDbLeadNote(req.params.id, req.body);
    return res.status(201).json({ note });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 10. Notes: Delete
router.delete('/notes/:id', async (req: Request, res: Response) => {
  try {
    await deleteDbLeadNote(Number(req.params.id));
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 11. Lead Calls: Log
router.post('/leads/:id/calls', async (req: Request, res: Response) => {
  try {
    const call = await addDbLeadCall(req.params.id, req.body);
    return res.status(201).json({ call });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 12. Lead Emails: Log
router.post('/leads/:id/emails', async (req: Request, res: Response) => {
  try {
    const email = await addDbLeadEmail(req.params.id, req.body);
    return res.status(201).json({ email });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 13. Lead SMS: Log
router.post('/leads/:id/sms', async (req: Request, res: Response) => {
  try {
    const sms = await addDbLeadSms(req.params.id, req.body);
    return res.status(201).json({ sms });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 14. Lead Tasks: Schedule
router.post('/leads/:id/tasks', async (req: Request, res: Response) => {
  try {
    const task = await addDbLeadTask(req.params.id, req.body);
    return res.status(201).json({ task });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 15. Convert Lead to Client (Transactional)
router.post('/leads/:id/convert-client', async (req: Request, res: Response) => {
  try {
    const client = await convertDbLeadToClient(req.params.id, req.body);
    return res.status(201).json({ client });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 16. Clients: List
router.get('/clients', async (req: Request, res: Response) => {
  try {
    const clients = await getDbClients();
    return res.json({ clients, total: clients.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 17. Dashboard Metrics
router.get('/dashboard/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await getDbDashboardMetrics();
    return res.json(metrics);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 18. Activities Feed
router.get('/activities', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const activities = await getDbActivities(limit);
    return res.json({ activities });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 19. Audit Logs
router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const logs = await getDbAuditLogs(limit);
    return res.json({ logs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 20. Agency Settings
router.get('/settings/agency', async (req: Request, res: Response) => {
  try {
    const settings = await getDbAgencySettings();
    return res.json({ settings });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/settings/agency', async (req: Request, res: Response) => {
  try {
    const updated = await updateDbAgencySettings(req.body);
    return res.json({ settings: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export { router as databaseRoutes };
