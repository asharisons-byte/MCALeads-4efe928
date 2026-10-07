// PREVIEW-ONLY entry: mocks the API (483 leads / 318 hot, mirroring the Stitch screenshot) then mounts the REAL App.
const NICHES = ['Residential General Contractor', 'HVAC', 'Plumbing', 'Roofing', 'Electrical', 'Landscaping', 'Painting'];
const CITIES = ['PORTLAND', 'SALEM', 'EUGENE', 'BEND', 'GRESHAM', 'MEDFORD', 'HILLSBORO'];
const STAGES = ['New Lead', 'Contacted', 'Audit Sent', 'Proposal Sent', 'Negotiation', 'Won'];
const NAMES = ['DAVID LEE ARIAS', 'Crown Plumbing PDX', 'West Coast Plumbing', 'Summit Roofing Co', 'Evergreen HVAC', 'Cascade Electric', 'Rose City Painting'];

function mkLead(i: number) {
  const hot = i < 318;
  const score = hot ? 98 - (i % 18) - (i === 0 ? 9 : 0) : 62 + (i % 17);
  return {
    leadId: `L-${1000 + i}`,
    businessName: i < NAMES.length ? NAMES[i] : `${['Bridge','Pioneer','Oak','Maple','Lakeview','Ridge','Harbor'][i % 7]} ${NICHES[i % 7]} LLC`,
    contactName: 'Owner',
    phone: `(503) 555-${String(1000 + i).slice(-4)}`,
    email: `owner${i}@example.com`,
    website: i % 3 === 0 ? 'Not provided' : `https://example${i}.com`,
    city: CITIES[i % 7], stateRegion: 'OR',
    niche: i === 0 ? 'Residential General Contractor' : NICHES[i % 7],
    gmbStatus: i % 4 === 0 ? 'No GMB' : 'Thin GMB',
    leadScore: score, isHotTarget: hot,
    estimatedRetainer: i === 0 ? 1500 : 1500 + (i % 5) * 400,
    leadStatus: i < 6 ? STAGES[i % 6] : i % 9 === 0 ? 'Contacted' : 'New Lead',
    websiteStatus: i % 3 === 0 ? 'No website' : 'Outdated',
  };
}
const leads = Array.from({ length: 483 }, (_, i) => mkLead(i));

const realFetch = window.fetch.bind(window);
window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
  if (url.startsWith('/api/leads')) return json({ leads, total: leads.length });
  if (url.startsWith('/api/users/me')) return json({ role: 'AGENCY_DIRECTOR', name: 'Marketing Charm' });
  if (url.startsWith('/api/')) return json({});
  return realFetch(input as any, init);
}) as typeof window.fetch;

// open a specific page via ?tab=… (App keeps tab in state; we click the sidebar button after mount)
const tab = new URLSearchParams(location.search).get('tab');
import('../main.tsx').then(() => {
  if (!tab) return;
  const t = setInterval(() => {
    const el = document.getElementById(tab);
    if (el) { (el as HTMLElement).click(); clearInterval(t); }
  }, 150);
});
