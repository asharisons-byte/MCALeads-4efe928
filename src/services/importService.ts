import * as XLSX from 'xlsx';
import { Lead, PipelineStage } from '../types';
import { calculateLeadScore } from './scoringService';

export interface ColumnMapping {
  rawColumn: string;
  mappedField: keyof Lead | 'ignore';
  confidence: number;
}

export interface DuplicateDetectionResult {
  existingLead: Lead;
  incomingRow: Record<string, any>;
  matchReason: string;
  similarity: number;
  action: 'keep_both' | 'merge' | 'ignore';
}

export interface ImportPreviewResult {
  totalRows: number;
  validRows: number;
  potentialDuplicates: DuplicateDetectionResult[];
  missingContactCount: number;
  missingWebsiteCount: number;
  missingGmbCount: number;
  fatalErrorCount: number;
  headers: string[];
  mappings: ColumnMapping[];
  sampleRows: Record<string, any>[];
  allRawRows: Record<string, any>[];
}

// Known column aliases for deterministic auto-mapping
const ALIASES: Partial<Record<keyof Lead, string[]>> = {
  business_name: [
    'business name',
    'businessname',
    'business n',
    'gmb name',
    'gmbname',
    'company',
    'company name',
    'companyname',
    'business',
    'account name',
    'name',
    'organization',
    'contractor',
    'firm',
  ],
  contact_name: ['contact name', 'contactname', 'contact n', 'contact', 'owner', 'decision maker', 'full name', 'lead contact', 'principal'],
  phone: ['phone', 'gmb phone', 'gmbphone', 'telephone', 'mobile', 'cell', 'contact number', 'phone number', 'tel', 'phone_number'],
  email: ['email', 'email address', 'contact email', 'e-mail'],
  website: ['website', 'website u', 'website url', 'gmb website', 'gmbwebsite', 'url', 'domain', 'web', 'site', 'homepage'],
  address: ['address', 'gmb address', 'gmbaddress', 'street address', 'street', 'location'],
  city: ['city', 'town', 'municipality'],
  state: ['state', 'region', 'province', 'st'],
  postal_code: ['zip', 'zipcode', 'postal code', 'postalcode', 'postal coc', 'postal cod', 'postal', 'postcode'],
  country: ['country', 'nation'],
  niche: [
    'niche',
    'category',
    'gmb category',
    'gmbcategory',
    'endorsement text',
    'endorsementtext',
    'endorsement',
    'license type',
    'licensetype',
    'industry',
    'business type',
    'sector',
    'trade',
    'niche / ind',
    'niche ind',
  ],
  gmb_status: ['gmb status', 'gmb statu', 'google business profile', 'gbp status', 'google my business', 'gmb'],
  gmb_rating: ['rating', 'gmb rating', 'gmb ratin', 'gmbrating', 'google rating', 'stars', 'review score'],
  gmb_review_count: ['reviews', 'gmb reviews', 'gmb revie', 'gmbreviews', 'review count', 'total reviews', 'number of reviews', 'gmb review count'],
  gmb_url: ['gmb url', 'gmburl', 'gbp url', 'google business url'],
  google_maps_url: ['google maps', 'maps url', 'google maps url', 'google ma', 'gmb maps url', 'gmbmapsurl', 'map url', 'place url', 'maps link'],
  pagespeed_score: ['pagespeed', 'pagespeed score', 'pagespeec', 'website score', 'speed score', 'performance score', 'website audit'],
  cms: ['cms', 'platform', 'technology', 'web engine'],
  google_ads_status: ['google ads', 'google ad', 'google ad:', 'google ads status', 'ads', 'ppc', 'search ads'],
  meta_pixel_status: ['meta pixel', 'facebook pixel', 'pixel', 'meta pixel status', 'pixel status'],
  seo_status: ['seo', 'seo status', 'seo audit', 'technical seo'],
  // remaining fields
  lead_id: ['lead id', 'id', 'license number', 'licensenumber', 'license'],
  latitude: ['lat', 'latitude'],
  longitude: ['lng', 'lon', 'longitude'],
  opening_hours: ['hours', 'opening hours', 'business hours', 'gmb extra', 'gmbextra'],
  website_status: ['website status', 'site status'],
  mobile_pagespeed: ['mobile speed', 'mobile pagespeed'],
  desktop_pagespeed: ['desktop speed', 'desktop pagespeed'],
  technology: ['tech stack', 'technologies'],
  lead_score: ['lead score', 'score'],
  score_breakdown: [],
  gaps: ['gaps', 'marketing gaps'],
  opportunity_angle: ['opportunity', 'opportunity angle'],
  recommended_service: ['recommended service', 'service'],
  secondary_services: [],
  estimated_retainer: ['retainer', 'estimated retainer', 'mrr'],
  estimated_revenue_lift: ['revenue lift', 'estimated revenue'],
  pain_points: [],
  is_hot_target: ['hot', 'hot target'],
  pipeline_stage: ['stage', 'pipeline stage', 'status'],
  owner: ['owner', 'assigned to'],
  created_at: ['created', 'date', 'orig regis date', 'origregisdate', 'processed at', 'processedat'],
  updated_at: [],
  notes: ['notes'],
  original_data: [],
  ai_enrichment: [],
  tags: ['tags', 'endorsement', 'county'],
};

export function detectColumnMapping(columnName: string): { field: keyof Lead | 'ignore'; confidence: number } {
  const clean = columnName.trim().toLowerCase().replace(/[_\-\.:\/]+/g, ' ').replace(/\s+/g, ' ').trim();
  const cleanNoSpaces = clean.replace(/[^a-z0-9]/g, '');

  // PASS 1 — Exact matching: Iterate through ALL fields/aliases first
  for (const [field, aliases] of Object.entries(ALIASES)) {
    if (aliases.includes(clean) || aliases.some((a) => a.replace(/\s+/g, '') === cleanNoSpaces)) {
      return { field: field as keyof Lead, confidence: 0.99 };
    }
  }

  // PASS 2 — Partial matching: Only if PASS 1 found no exact match
  for (const [field, aliases] of Object.entries(ALIASES)) {
    for (const alias of aliases) {
      if (alias.length < 3) {
        // Very short 1-2 char aliases (like 'st') must match whole words only
        const wordRegex = new RegExp('(?:^|\\s+)' + alias + '(?:$|\\s+)');
        if (wordRegex.test(clean)) {
          return { field: field as keyof Lead, confidence: 0.88 };
        }
      } else if (alias === 'gmb') {
        // Skip bare 'gmb' prefix in partial matching so it doesn't steal gmb_rating or gmb_review_count
        continue;
      } else if (clean.includes(alias) || alias.includes(clean)) {
        return { field: field as keyof Lead, confidence: 0.88 };
      }
    }
  }

  return { field: 'ignore', confidence: 0.0 };
}

/**
 * Parses raw pasted CSV, TSV, or JSON text into headers and rows
 */
export function parseTextToRawData(text: string): { headers: string[]; rows: Record<string, any>[] } {
  const trimmed = text.trim();
  if (!trimmed) return { headers: [], rows: [] };

  // Check if text is JSON (Array or Object containing list)
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    try {
      const parsed = JSON.parse(trimmed);
      let records: any[] = [];
      if (Array.isArray(parsed)) {
        records = parsed;
      } else if (parsed && typeof parsed === 'object') {
        records = parsed.leads || parsed.data || parsed.records || parsed.items || parsed.rows || [parsed];
      }

      if (Array.isArray(records) && records.length > 0) {
        const headerSet = new Set<string>();
        records.forEach((rec) => {
          if (rec && typeof rec === 'object') {
            Object.keys(rec).forEach((k) => {
              if (k.trim().length > 0) headerSet.add(k);
            });
          }
        });
        const headers = Array.from(headerSet);
        return { headers, rows: records };
      }
    } catch (e) {
      // fallback to delimited parsing
    }
  }

  // Parse as delimited text (CSV, TSV, Pipe, Semicolon)
  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  // Detect delimiter across comma, tab, pipe, semicolon
  const firstLine = lines[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const pipeCount = (firstLine.match(/\|/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;

  let delimiter = ',';
  let maxDelimCount = commaCount;
  if (tabCount > maxDelimCount) {
    delimiter = '\t';
    maxDelimCount = tabCount;
  }
  if (pipeCount > maxDelimCount) {
    delimiter = '|';
    maxDelimCount = pipeCount;
  }
  if (semiCount > maxDelimCount) {
    delimiter = ';';
    maxDelimCount = semiCount;
  }

  // Helper to parse a single delimited line with quotes
  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const rawHeaders = parseLine(firstLine)
    .map((h) => h.replace(/^["']|["']$/g, '').trim())
    .filter((h) => h.length > 0);
  const rows: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowValues = parseLine(lines[i]);
    const row: Record<string, any> = {};
    rawHeaders.forEach((header, idx) => {
      let val = rowValues[idx] ?? '';
      val = val.replace(/^["']|["']$/g, '').trim();
      row[header] = val;
    });
    // Ignore rows where all values are empty
    if (Object.values(row).some((v) => String(v).trim().length > 0)) {
      rows.push(row);
    }
  }

  return { headers: rawHeaders, rows };
}

export function parseFileToRawData(file: File): Promise<{ headers: string[]; rows: Record<string, any>[] }> {
  return new Promise((resolve, reject) => {
    const lowerName = file.name.toLowerCase();

    // 1. JSON file handling (.json)
    if (lowerName.endsWith('.json') || file.type === 'application/json') {
      const textReader = new FileReader();
      textReader.onload = (e) => {
        try {
          const rawText = String(e.target?.result || '');
          const result = parseTextToRawData(rawText);
          resolve(result);
        } catch (err) {
          reject(new Error(`Failed to parse JSON file: ${(err as any)?.message}`));
        }
      };
      textReader.onerror = (err) => reject(err);
      textReader.readAsText(file);
      return;
    }

    // 2. Plain Text file handling (.txt)
    if (lowerName.endsWith('.txt') || file.type.startsWith('text/plain')) {
      const textReader = new FileReader();
      textReader.onload = (e) => {
        try {
          const rawText = String(e.target?.result || '');
          const result = parseTextToRawData(rawText);
          resolve(result);
        } catch (err) {
          reject(new Error(`Failed to parse text file: ${(err as any)?.message}`));
        }
      };
      textReader.onerror = (err) => reject(err);
      textReader.readAsText(file);
      return;
    }

    // 3. Spreadsheet file handling (.xlsx, .xls, .csv)
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!json || json.length === 0) {
          return resolve({ headers: [], rows: [] });
        }

        const headers = Object.keys(json[0] || {}).filter(
          (h) => h.trim().length > 0 && !h.startsWith('__EMPTY')
        );
        resolve({ headers, rows: json });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Fetches and parses a public or shared Google Sheet directly
 */
export async function fetchGoogleSheetData(
  urlOrId: string
): Promise<{ headers: string[]; rows: Record<string, any>[] }> {
  const res = await fetch('/api/import/google-sheet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: urlOrId }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to fetch Google Sheet (HTTP ${res.status})`);
  }

  const data = await res.json();
  if (!data.csvText) {
    throw new Error('Google Sheet returned empty data.');
  }

  return parseTextToRawData(data.csvText);
}

/**
 * Fuzzy match similarity between two strings (Dice coefficient)
 */
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bigram = str.substring(i, i + 2);
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    }
    return bigrams;
  };

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);
  let intersection = 0;

  for (const [key, val] of b1.entries()) {
    if (b2.has(key)) {
      intersection += Math.min(val, b2.get(key)!);
    }
  }

  return (2.0 * intersection) / (s1.length - 1 + s2.length - 1);
}

export function analyzeImportRows(
  rows: Record<string, any>[],
  existingLeads: Lead[],
  mappings: ColumnMapping[]
): ImportPreviewResult {
  const headers = mappings.map((m) => m.rawColumn);
  let missingContactCount = 0;
  let missingWebsiteCount = 0;
  let missingGmbCount = 0;
  let fatalErrorCount = 0;
  let validRows = 0;

  const duplicates: DuplicateDetectionResult[] = [];

  // Map each row to inspect
  rows.forEach((row, idx) => {
    const businessNameCol = mappings.find((m) => m.mappedField === 'business_name')?.rawColumn;
    const phoneCol = mappings.find((m) => m.mappedField === 'phone')?.rawColumn;
    const emailCol = mappings.find((m) => m.mappedField === 'email')?.rawColumn;
    const websiteCol = mappings.find((m) => m.mappedField === 'website')?.rawColumn;

    const bName = businessNameCol ? String(row[businessNameCol] || '').trim() : '';
    const phone = phoneCol ? String(row[phoneCol] || '').trim() : '';
    const email = emailCol ? String(row[emailCol] || '').trim() : '';
    const website = websiteCol ? String(row[websiteCol] || '').trim() : '';

    if (!bName) {
      fatalErrorCount++;
      return;
    }

    if (!phone && !email) {
      missingContactCount++;
    }

    if (!website || website.toLowerCase().includes('no website')) {
      missingWebsiteCount++;
    }

    // Check duplicate against existing CRM leads
    for (const existing of existingLeads) {
      const nameSim = stringSimilarity(existing.business_name, bName);
      const isExactPhone = phone && existing.phone && phone.replace(/\D/g, '') === existing.phone.replace(/\D/g, '');
      const isExactEmail = email && existing.email && email.toLowerCase() === existing.email.toLowerCase();
      const isExactWebsite = website && existing.website && website.toLowerCase().replace(/^https?:\/\//, '') === existing.website.toLowerCase().replace(/^https?:\/\//, '');

      if (isExactPhone || isExactEmail || isExactWebsite || nameSim > 0.72) {
        let reason = 'Possible Duplicate (Fuzzy Name Match)';
        if (isExactPhone) reason = 'Exact Phone Match';
        else if (isExactEmail) reason = 'Exact Email Match';
        else if (isExactWebsite) reason = 'Exact Domain Match';

        duplicates.push({
          existingLead: existing,
          incomingRow: row,
          matchReason: reason,
          similarity: Math.round(nameSim * 100),
          action: 'keep_both',
        });
        break;
      }
    }

    validRows++;
  });

  return {
    totalRows: rows.length,
    validRows: Math.max(0, validRows - duplicates.length),
    potentialDuplicates: duplicates,
    missingContactCount,
    missingWebsiteCount,
    missingGmbCount,
    fatalErrorCount,
    headers,
    mappings,
    sampleRows: rows.slice(0, 5),
    allRawRows: rows,
  };
}

/**
 * Converts raw rows into full CRM Lead records
 */
export function convertRowsToLeads(
  rows: Record<string, any>[],
  mappings: ColumnMapping[],
  ownerName: string = 'Sophia'
): Lead[] {
  return rows.map((row, idx) => {
    const leadPartial: Record<string, any> = {};

    mappings.forEach((m) => {
      if (m.mappedField !== 'ignore') {
        const val = row[m.rawColumn];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          leadPartial[m.mappedField] = val;
        }
      }
    });

    const businessName = leadPartial.business_name || row['businessName'] || row['gmbName'] || row['Business Name'] || `Imported Business #${idx + 1}`;
    const rawPhone = leadPartial.phone || row['phone'] || row['gmbPhone'] || row['Phone'];
    let phone = 'Not provided';
    if (rawPhone !== undefined && rawPhone !== null && String(rawPhone).trim() !== '') {
      let strPhone = String(rawPhone).trim();
      const sciMatch = strPhone.match(/^(\d+(?:\.\d+)?)[eE]\+(\d+)$/);
      if (sciMatch) {
        const base = parseFloat(sciMatch[1]);
        const exp = parseInt(sciMatch[2], 10);
        strPhone = Math.round(base * Math.pow(10, exp)).toString();
      }
      phone = strPhone;
    }
    const email = leadPartial.email || row['email'] || row['Email'] || 'Not provided';
    const website = leadPartial.website || row['gmbWebsite'] || row['website'] || row['Website'] || 'Not provided';
    const niche = leadPartial.niche || row['gmbCategory'] || row['endorsementText'] || row['licenseType'] || 'Local Business';
    const city = leadPartial.city || row['city'] || row['City'] || null;
    const state = leadPartial.state || row['state'] || row['State'] || null;
    const postalCode = leadPartial.postal_code || row['zip'] || row['ZIP'] || row['postalCode'] || null;
    const address = leadPartial.address || row['gmbAddress'] || row['address'] || (city && state && postalCode ? `${city}, ${state} ${postalCode}` : null);

    // Parse numeric fields safely
    let gmbRating = undefined;
    const rawRating = leadPartial.gmb_rating ?? row['gmbRating'] ?? row['rating'] ?? row['Rating'];
    if (rawRating !== undefined && rawRating !== null && rawRating !== '') {
      const parsed = parseFloat(String(rawRating));
      if (!isNaN(parsed)) gmbRating = parsed;
    }

    let gmbReviews = undefined;
    const rawReviews = leadPartial.gmb_review_count ?? row['gmbReviews'] ?? row['reviews'] ?? row['Reviews'];
    if (rawReviews !== undefined && rawReviews !== null && rawReviews !== '') {
      const parsed = parseInt(String(rawReviews), 10);
      if (!isNaN(parsed)) gmbReviews = parsed;
    }

    let pageSpeed = undefined;
    const rawPageSpeed = leadPartial.pagespeed_score ?? row['pagespeed'] ?? row['PageSpeed'];
    if (rawPageSpeed !== undefined && rawPageSpeed !== null && rawPageSpeed !== '') {
      const clean = String(rawPageSpeed).replace('/100', '');
      const parsed = parseInt(clean, 10);
      if (!isNaN(parsed)) pageSpeed = parsed;
    }

    // Determine gaps
    const gaps: string[] = [];
    if (!website || website === 'Not provided' || website.toLowerCase().includes('no website')) {
      gaps.push('No Website');
    } else if (pageSpeed !== undefined && pageSpeed < 40) {
      gaps.push('Slow / Unreachable Server');
    }

    const metaPixel = leadPartial.meta_pixel_status || row['meta_pixel_status'] || 'No Pixel';
    if (metaPixel === 'No Pixel') gaps.push('No Pixel');

    const googleAds = leadPartial.google_ads_status || row['google_ads_status'] || 'No Ads';
    if (googleAds === 'No Ads') gaps.push('No Ads');

    if (gmbReviews !== undefined && gmbReviews < 10) {
      gaps.push('Thin Reviews');
    }

    // Recommended service & Retainer
    let recommendedService = 'Website SEO & Technical Optimization';
    let retainer = 1800;
    if (gaps.includes('No Website')) {
      recommendedService = 'Website Development + Voice Search Optimization';
      retainer = 1800;
    } else if (gaps.includes('Slow / Unreachable Server')) {
      recommendedService = 'Website SEO & Technical Optimization';
      retainer = 2400;
    } else if (gaps.includes('Thin Reviews')) {
      recommendedService = 'Reputation & Review Booster';
      retainer = 1800;
    } else if (gaps.includes('No Ads')) {
      recommendedService = 'Local Search Ads & Retargeting';
      retainer = 2400;
    }

    const mapsUrl = leadPartial.google_maps_url || row['gmbMapsUrl'] || row['google_maps_url'] || (businessName ? `https://maps.google.com/?q=${encodeURIComponent(businessName + ' ' + city)}` : undefined);

    const tags: string[] = [];
    if (row['licenseNumber']) tags.push(`CCB #${row['licenseNumber']}`);
    if (row['licenseType']) tags.push(String(row['licenseType']));
    if (row['county']) tags.push(`${row['county']} County`);
    if (row['status']) tags.push(`Status: ${row['status']}`);

    const initialLead: Partial<Lead> = {
      lead_id: row['licenseNumber'] ? `CCB-${row['licenseNumber']}` : `MCA-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 900 + 100)}`,
      business_name: businessName,
      contact_name: leadPartial.contact_name || row['contactName'] || row['owner'] || undefined,
      phone,
      email,
      website,
      address,
      city,
      state,
      country: leadPartial.country || 'USA',
      postal_code: postalCode,
      niche,
      gmb_status: leadPartial.gmb_status || (gmbReviews && gmbReviews > 20 ? 'Established' : gmbReviews ? 'Thin GMB' : 'Needs Optimization'),
      gmb_rating: gmbRating !== undefined ? gmbRating : 4.5,
      gmb_review_count: gmbReviews !== undefined ? gmbReviews : 0,
      gmb_url: leadPartial.gmb_url || mapsUrl,
      google_maps_url: mapsUrl,
      website_status: gaps.includes('No Website') ? 'No Website' : gaps.includes('Slow / Unreachable Server') ? 'Slow / Unreachable Server' : 'Active',
      pagespeed_score: pageSpeed,
      google_ads_status: googleAds as any,
      meta_pixel_status: metaPixel as any,
      seo_status: gaps.includes('Slow / Unreachable Server') ? 'Needs Technical SEO' : 'Average',
      gaps,
      opportunity_angle: `${recommendedService} • ${niche} • ${city}`,
      recommended_service: recommendedService,
      secondary_services: ['Meta Ads & Retargeting', 'Voice Search Optimization'],
      estimated_retainer: retainer,
      estimated_revenue_lift: '$4,000–$10,000/month',
      pipeline_stage: 'New Lead',
      owner: ownerName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: [],
      original_data: row,
      tags: tags.length > 0 ? tags : undefined,
    };

    const scoring = calculateLeadScore(initialLead);

    return {
      ...initialLead,
      lead_score: scoring.score,
      score_breakdown: scoring.breakdown,
      is_hot_target: scoring.isHot,
    } as Lead;
  });
}

/**
 * Generates a realistic 500-lead test array (e.g. for testing Acceptance Test 1 "500-lead.xlsx")
 */
export function generateTest500LeadDataset(): Record<string, any>[] {
  const niches = ['Plumbers', 'HVAC Contractors', 'Electricians', 'Roofing Contractors', 'Dental Clinics', 'Auto Repair'];
  const cities = ['Portland', 'Beaverton', 'Gresham', 'Hillsboro', 'Tigard', 'Lake Oswego'];
  const data: Record<string, any>[] = [];

  for (let i = 1; i <= 500; i++) {
    const niche = niches[i % niches.length];
    const city = cities[i % cities.length];
    const hasWebsite = i % 7 !== 0;
    const isSlow = hasWebsite && i % 4 === 0;

    data.push({
      'Business Name': `${city} ${niche.slice(0, -1)} Co #${i}`,
      'Contact Name': `Representative ${i}`,
      Phone: `+1 503-${String(100 + (i % 800)).padStart(3, '0')}-${String(1000 + (i * 7) % 8999)}`,
      Email: i % 15 === 0 ? '' : `contact@${city.toLowerCase()}${niche.toLowerCase().replace(/\s+/g, '')}${i}.com`,
      Website: hasWebsite ? `https://${city.toLowerCase()}${niche.toLowerCase().replace(/\s+/g, '')}${i}.com` : 'No Website',
      City: city,
      State: 'Oregon',
      ZIP: `9720${(i % 9) + 1}`,
      Niche: niche,
      Rating: (4.0 + (i % 10) * 0.1).toFixed(1),
      Reviews: ((i * 13) % 180) + 2,
      'Website Audit': hasWebsite ? (isSlow ? 28 + (i % 10) : 75 + (i % 20)) : '',
      'Meta Pixel': i % 5 === 0 ? 'Installed' : 'No Pixel',
      'Google Ads': i % 6 === 0 ? 'Active' : 'No Ads',
    });
  }

  return data;
}

export function downloadDatasetAsXlsx(dataset: Record<string, any>[], filename: string = '500-lead.xlsx'): void {
  const worksheet = XLSX.utils.json_to_sheet(dataset);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
  XLSX.writeFile(workbook, filename);
}
