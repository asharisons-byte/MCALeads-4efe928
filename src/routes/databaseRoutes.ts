import express, { Request, Response } from 'express';
import { getDatabaseDetails, db, schema } from '../db/index.js';
import { sql, eq, and, desc, count, sum } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { normalizeAppRole, canAccessTeamManagement, canAssignSophia } from '../utils/roleUtils.js';
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
  truncateAllLeads,
  deleteAllDbLeads,
  getDbTeamPerformance,
} from '../db/repository.js';

const router = express.Router();

// 1. User Info (New Endpoint)
router.get('/users/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!db) return res.status(503).json({ error: 'Database not configured' });
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ error: 'Unauthorized' });

    let result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.uid, firebaseUid))
      .limit(1);

    if (result.length === 0 && req.user?.email) {
      const email = req.user.email.toLowerCase();
      const existing = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);

      if (existing.length > 0) {
        // Link existing user to new UID
        await db
          .update(schema.users)
          .set({ uid: firebaseUid, updatedAt: new Date() })
          .where(eq(schema.users.id, existing[0].id));
        result = [ { ...existing[0], uid: firebaseUid } ];
      }
    }

    if (result.length === 0) {
      // Auto-provision user on first login
      const orgs = await db.select({ id: schema.organizations.id }).from(schema.organizations).limit(1);
      const organizationId = orgs[0]?.id;
      
      const nameParts = (req.user?.name || '').split(' ');
      
      await db.insert(schema.users).values({
        uid: firebaseUid,
        email: req.user?.email?.toLowerCase() || '',
        displayName: req.user?.name || req.user?.email || 'New User',
        firstName: nameParts[0] || null,
        lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : null,
        role: 'Admin', // default legacy role
        status: 'active',
        organizationId,
      });
      return res.json({ role: 'Admin', provisioned: true });
    }

    return res.json({ role: result[0].role, userId: result[0].id });
  } catch (error) {
    console.error('GET /users/me error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Team Performance endpoint with proper authentication and authorization
router.get('/team/performance', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Get Firebase UID from authenticated request
    const firebaseUid = req.user?.uid;
    
    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }
    
    // Load user from Neon database using Firebase UID
    const userResult = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.uid, firebaseUid))
      .limit(1);
    
    if (userResult.length === 0) {
      return res.status(401).json({ error: 'Unauthorized: User not found in database' });
    }
    
    const dbUser = userResult[0];
    
    // Normalize role to canonical form
    const canonicalRole = normalizeAppRole(dbUser.role);
    
    // Check if user has AGENCY_DIRECTOR role for team access
    if (!canonicalRole || !canAccessTeamManagement(canonicalRole)) {
      return res.status(403).json({ 
        error: 'Forbidden: Only Agency Director can access team management',
        requiredRole: 'AGENCY_DIRECTOR',
        userRole: canonicalRole || dbUser.role
      });
    }
    
    // Get period from query parameter
    const period = req.query.period as string || 'This Month';
    
    // Fetch team performance data from Neon
    const performance = await getDbTeamPerformance(period);
    
    return res.json({ 
      success: true,
      performance,
      period,
      currentUser: {
        id: dbUser.id,
        displayName: dbUser.displayName,
        role: dbUser.role,
        canonicalRole
      }
    });
  } catch (error: any) {
    console.error('Team performance API error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch team performance',
      details: error.message 
    });
  }
});

// 1b. Database Diagnostic
router.get('/debug/db-diagnostic', async (req: Request, res: Response) => {
  try {
    const details = getDatabaseDetails();
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(schema.leads);
    return res.json({
      databaseConfigured: details.configured,
      databaseProvider: details.provider,
      databaseHost: details.host,
      databaseName: details.database,
      databaseConnection: details.configured ? 'SUCCESS' : 'FAIL',
      leadTableExists: true, // If query didn't throw, table exists
      totalDatabaseLeads: Number(countResult[0]?.count || 0),
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Database diagnostic failed',
      details: err.message
    });
  }
});

// Database Connection Details Endpoint
router.get('/database/details', async (req: Request, res: Response) => {
  try {
    const details = getDatabaseDetails();
    const health = await getDbSystemHealth();
    return res.json({
      success: true,
      details,
      health: health.services.cloudSqlPostgres,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/db-details', async (req: Request, res: Response) => {
  try {
    const details = getDatabaseDetails();
    const health = await getDbSystemHealth();
    return res.json({
      success: true,
      details,
      health: health.services.cloudSqlPostgres,
    });
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
    return res.json({
      success: result.success,
      validCount: result.validCount,
      duplicatesCount: result.duplicatesCount,
      failedCount: result.failedCount || 0,
      insertedCount: result.insertedCount,
      leads: result.leads || [],
      failures: result.failures || [],
    });
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
    if (lead._dbSource === 'failed') {
      return res.status(500).json({
        success: false,
        error: lead._error || 'Failed to persist lead to Neon database',
      });
    }
    if (lead._dbSource === 'memory_only') {
      return res.status(200).json({
        success: false,
        warning: 'Lead held in memory only; database is not configured.',
        lead,
      });
    }
    return res.status(201).json({ success: true, lead });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 6b. Leads: Bulk Create/Update
router.post('/leads/bulk', async (req: Request, res: Response) => {
  try {
    const { leads } = req.body;
    if (!Array.isArray(leads)) {
      return res.status(400).json({ error: 'leads must be an array' });
    }
    for (const lead of leads) {
      await createDbLead(lead);
    }
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 7. Leads: Update - Requires authentication for ownership changes
router.put('/leads/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const firebaseUid = req.user?.uid;
    
    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }
    
    // Load authenticated user from Neon database
    const userResult = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.uid, firebaseUid))
      .limit(1);
    
    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    
    const dbUser = userResult[0];
    const canonicalRole = normalizeAppRole(dbUser.role as string) || dbUser.role;
    
    // Load existing lead to check current ownership
    const existingLead = await getDbLeadById(req.params.id);
    if (!existingLead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    // Handle ownership assignment securely
    const updates: any = { ...req.body };
    
    // Check if ownership change is being requested
    if (updates.assigned_user !== undefined || updates.assignedTo !== undefined || updates.assigned_to !== undefined) {
      // Determine the requested owner
      let requestedOwner = updates.assigned_user || updates.assignedTo || updates.assigned_to;
      
      // Check if this is a Sophia assignment request
      const isSophiaRequest = requestedOwner === 'Sophia (AI Sales Rep)' || 
                              (typeof requestedOwner === 'object' && requestedOwner.firstName === 'Sophia');
      
      if (isSophiaRequest) {
        // Sophia assignment requires explicit authorization via canAssignSophia()
        if (!canAssignSophia(canonicalRole)) {
          return res.status(403).json({ 
            error: 'You are not authorized to assign leads to Sophia. Only Agency Director and other senior roles can assign Sophia.' 
          });
        }
        // Set Sophia ownership server-side using canonical format
        updates.assigned_user = {
          id: null,
          firstName: 'Sophia',
          role: 'AI_SALES_REP',
        };
      } else if (existingLead.assignedTo === 'Sophia (AI Sales Rep)') {
        // Protect existing Sophia-owned leads from being reassigned without explicit action
        // If no explicit new owner is provided, keep Sophia as owner
        if (!requestedOwner || requestedOwner === 'Sophia (AI Sales Rep)') {
          // No reassignment requested, preserve Sophia ownership
          delete updates.assigned_user;
          delete updates.assignedTo;
          delete updates.assigned_to;
        } else {
          // Explicit reassignment from Sophia - proceed with validation below
        }
      }
      
      // Handle non-Sophia ownership changes
      if (updates.assigned_user !== undefined && !isSophiaRequest) {
        const assignedUser = updates.assigned_user;
        
        // Self-claim operation: assign to authenticated user
        if (assignedUser.selfClaim === true || !assignedUser.id) {
          updates.assigned_user = {
            id: dbUser.id,
            firstName: dbUser.firstName || dbUser.displayName,
            role: canonicalRole,
          };
        } else {
          // Attempting to assign to another user - requires Agency Director
          if (canonicalRole !== 'AGENCY_DIRECTOR') {
            return res.status(403).json({ 
              error: 'You are not authorized to assign this lead to another team member. Only Agency Director can reassign leads.' 
            });
          }
          
          // Validate target user exists in Neon
          const targetUserResult = await db
            .select({ 
              id: schema.users.id, 
              firstName: schema.users.firstName, 
              displayName: schema.users.displayName, 
              role: schema.users.role 
            })
            .from(schema.users)
            .where(eq(schema.users.id, Number(assignedUser.id)))
            .limit(1);
          
          if (!targetUserResult || targetUserResult.length === 0) {
            return res.status(400).json({ error: 'Invalid assignment target: User not found' });
          }
          
          const targetUser = targetUserResult[0];
          const targetCanonicalRole = normalizeAppRole(targetUser.role as string) || targetUser.role;
          updates.assigned_user = {
            id: targetUser.id,
            firstName: targetUser.firstName || targetUser.displayName,
            role: targetCanonicalRole,
          };
        }
      } else if ((updates.assignedTo !== undefined || updates.assigned_to !== undefined) && !isSophiaRequest) {
        // Direct assignedTo/assigned_to field without proper authorization - block it
        // This prevents browser from directly setting owner strings
        console.warn('PUT /leads/:id: Direct assignedTo/assigned_to assignment blocked for security');
        // Do not update ownership fields - they will be handled by assigned_user logic or remain unchanged
        delete updates.assignedTo;
        delete updates.assigned_to;
      }
    }
    
    const updated = await updateDbLead(req.params.id, updates);
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

// 8b. Leads: DELETE ALL / TRUNCATE - Full database wipe endpoint
// This is the ONLY way to completely clear all leads from Neon
router.delete('/leads', async (req: Request, res: Response) => {
  try {
    const useTruncate = req.query.method === 'truncate';
    let result;
    
    if (useTruncate) {
      // TRUNCATE is faster and CASCADE deletes related records
      result = await truncateAllLeads();
    } else {
      // Standard DELETE respects foreign keys but may fail if constraints exist
      result = await deleteAllDbLeads();
    }
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
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

// 21. Google Sheet Fetch Proxy & Parser
router.post('/import/google-sheet', async (req: Request, res: Response) => {
  try {
    const { url, sheetId } = req.body;
    if (!url && !sheetId) {
      return res.status(400).json({ error: 'Google Sheet URL or Spreadsheet ID is required' });
    }

    let id = sheetId ? String(sheetId).trim() : '';
    let gid = '0';

    if (url) {
      const rawUrl = String(url).trim();
      const match = rawUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        id = match[1];
      } else if (rawUrl.startsWith('http')) {
        id = rawUrl;
      } else {
        id = rawUrl;
      }

      const gidMatch = rawUrl.match(/[#&?]gid=([0-9]+)/);
      if (gidMatch) {
        gid = gidMatch[1];
      }
    }

    const exportUrl = id.startsWith('http')
      ? id
      : `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;

    const fetchResponse = await fetch(exportUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!fetchResponse.ok) {
      return res.status(400).json({
        error: `Could not access Google Sheet (HTTP ${fetchResponse.status}). Please make sure the sheet is shared as "Anyone with the link can view".`,
      });
    }

    const text = await fetchResponse.text();

    if (
      text.includes('<!DOCTYPE html>') ||
      text.includes('<html') ||
      text.includes('accounts.google.com')
    ) {
      return res.status(403).json({
        error:
          'Google Sheet requires login. Please set permissions to "Anyone with the link can view" (Viewer), or export as CSV/XLSX and upload.',
      });
    }

    return res.json({ success: true, csvText: text, spreadsheetId: id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch Google Sheet' });
  }
});

// ==========================================
// USER MANAGEMENT & INVITE FLOW
// ==========================================

// POST /api/users/invite - Create a new user invite
router.post('/users/invite', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }

    // Verify inviter is authorized (Agency Director or Sales Manager)
    const inviterResult = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.uid, firebaseUid))
      .limit(1);

    if (inviterResult.length === 0) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    const inviter = inviterResult[0];
    const inviterRole = normalizeAppRole(inviter.role);
    
    if (!inviterRole || !['AGENCY_DIRECTOR', 'SALES_MANAGER'].includes(inviterRole)) {
      return res.status(403).json({ error: 'Forbidden: Only Agency Director or Sales Manager can send invites' });
    }

    const { email, firstName, lastName, role } = req.body;

    if (!email || !firstName || !role) {
      return res.status(400).json({ error: 'Email, first name, and role are required' });
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Email already exists in the system' });
    }

    // Generate invite token
    const crypto = await import('crypto');
    const inviteToken = crypto.randomUUID();
    const inviteExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    // Create displayName
    const displayName = `${firstName} ${lastName || ''}`.trim() || firstName;

    // Insert invited user
    const [newUser] = await db
      .insert(schema.users)
      .values({
        uid: `invite_${inviteToken}`, // Temporary UID for invited users
        email: email.toLowerCase(),
        firstName,
        lastName: lastName || null,
        displayName,
        role,
        status: 'invited',
        inviteToken,
        inviteExpiresAt,
        organizationId: inviter.organizationId,
      })
      .returning();

    return res.json({
      success: true,
      inviteLink: `/accept-invite?token=${inviteToken}`,
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error('Invite user error:', error);
    return res.status(500).json({ error: 'Failed to create invite', details: error.message });
  }
});

// GET /api/users/invite/accept?token=xxx - Accept an invite
router.get('/users/invite/accept', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing token' });
    }

    const userResult = await db
      .select()
      .from(schema.users)
      .where(
        and(
          eq(schema.users.inviteToken, token),
          eq(schema.users.status, 'invited')
        )
      )
      .limit(1);

    if (userResult.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired invite token' });
    }

    const user = userResult[0];

    // Check if invite has expired
    if (user.inviteExpiresAt && new Date(user.inviteExpiresAt) < new Date()) {
      return res.status(400).json({ error: 'Invite token has expired' });
    }

    return res.json({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
    });
  } catch (error: any) {
    console.error('Accept invite error:', error);
    return res.status(500).json({ error: 'Failed to process invite', details: error.message });
  }
});

// POST /api/users/invite/complete - Complete invite with Firebase UID
router.post('/users/invite/complete', async (req: Request, res: Response) => {
  try {
    const { token, firebaseUid } = req.body;

    if (!token || !firebaseUid) {
      return res.status(400).json({ error: 'Token and Firebase UID are required' });
    }

    const userResult = await db
      .select()
      .from(schema.users)
      .where(
        and(
          eq(schema.users.inviteToken, token),
          eq(schema.users.status, 'invited')
        )
      )
      .limit(1);

    if (userResult.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired invite token' });
    }

    const user = userResult[0];

    // Check if invite has expired
    if (user.inviteExpiresAt && new Date(user.inviteExpiresAt) < new Date()) {
      return res.status(400).json({ error: 'Invite token has expired' });
    }

    // Update user with Firebase UID and activate
    const [updatedUser] = await db
      .update(schema.users)
      .set({
        uid: firebaseUid,
        status: 'active',
        inviteToken: null,
        inviteExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, user.id))
      .returning();

    return res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    console.error('Complete invite error:', error);
    return res.status(500).json({ error: 'Failed to complete invite', details: error.message });
  }
});

// GET /api/users - List all users
router.get('/users', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }

    // Get current user to verify access
    const currentUserResult = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.uid, firebaseUid))
      .limit(1);

    if (currentUserResult.length === 0) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    const currentUser = currentUserResult[0];
    const canonicalRole = normalizeAppRole(currentUser.role);

    // Only Agency Director and Sales Manager can view all users
    if (!canonicalRole || !['AGENCY_DIRECTOR', 'SALES_MANAGER'].includes(canonicalRole)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const users = await db
      .select({
        id: schema.users.id,
        uid: schema.users.uid,
        displayName: schema.users.displayName,
        email: schema.users.email,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        role: schema.users.role,
        status: schema.users.status,
        lastLoginAt: schema.users.lastLoginAt,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .orderBy(desc(schema.users.createdAt));

    return res.json({ users });
  } catch (error: any) {
    console.error('List users error:', error);
    return res.status(500).json({ error: 'Failed to list users', details: error.message });
  }
});

// PUT /api/users/:id/role - Update user role
router.put('/users/:id/role', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const canonicalRole = normalizeAppRole(role);
    if (!canonicalRole) {
      return res.status(400).json({ error: 'Invalid role provided' });
    }

    // Get current user
    const currentUserResult = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.uid, firebaseUid))
      .limit(1);

    if (currentUserResult.length === 0) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    const currentUser = currentUserResult[0];
    const currentUserRole = normalizeAppRole(currentUser.role);

    // Only Agency Director can update roles
    if (currentUserRole !== 'AGENCY_DIRECTOR') {
      return res.status(403).json({ error: 'Forbidden: Only Agency Director can update roles' });
    }

    // Cannot update own role
    if (Number(id) === currentUser.id) {
      return res.status(400).json({ error: 'Cannot update your own role' });
    }

    // Get target user
    const targetUserResult = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, Number(id)))
      .limit(1);

    if (targetUserResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [updatedUser] = await db
      .update(schema.users)
      .set({ role: canonicalRole, updatedAt: new Date() })
      .where(eq(schema.users.id, Number(id)))
      .returning();

    return res.json({
      success: true,
      user: {
        id: updatedUser.id,
        displayName: updatedUser.displayName,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    console.error('Update role error:', error);
    return res.status(500).json({ error: 'Failed to update role', details: error.message });
  }
});

// PUT /api/users/:id/status - Update user status
router.put('/users/:id/status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "active" or "suspended"' });
    }

    // Get current user
    const currentUserResult = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.uid, firebaseUid))
      .limit(1);

    if (currentUserResult.length === 0) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    const currentUser = currentUserResult[0];
    const canonicalRole = normalizeAppRole(currentUser.role);

    // Only Agency Director can update status
    if (canonicalRole !== 'AGENCY_DIRECTOR') {
      return res.status(403).json({ error: 'Forbidden: Only Agency Director can update status' });
    }

    // Cannot suspend yourself
    if (Number(id) === currentUser.id) {
      return res.status(400).json({ error: 'Cannot suspend yourself' });
    }

    // Get target user
    const targetUserResult = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, Number(id)))
      .limit(1);

    if (targetUserResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [updatedUser] = await db
      .update(schema.users)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.users.id, Number(id)))
      .returning();

    return res.json({
      success: true,
      user: {
        id: updatedUser.id,
        displayName: updatedUser.displayName,
        email: updatedUser.email,
        status: updatedUser.status,
      },
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    return res.status(500).json({ error: 'Failed to update status', details: error.message });
  }
});

export { router as databaseRoutes };
