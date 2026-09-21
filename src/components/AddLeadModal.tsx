import React, { useState } from 'react';
import { COUNTRIES } from '../data/countries';
import { X, Plus, Sparkles, Building, Phone, Mail, Globe, MapPin, ShieldCheck, DollarSign, Star, FileText } from 'lucide-react';
import { Lead, PipelineStage } from '../types';
import { calculateLeadScore } from '../services/scoringService';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Lead) => Promise<any> | void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  onAddLead,
}) => {
  // Core Business Info
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  // Classification & Licensing
  const [industry, setIndustry] = useState('Contractor');
  const [serviceCategory, setServiceCategory] = useState('Residential & Commercial');
  const [niche, setNiche] = useState('General Contractor');
  const [ccbLicenseNumber, setCcbLicenseNumber] = useState('');

  // Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Portland');
  const [county, setCounty] = useState('Multnomah');
  const [state, setState] = useState('OR');
  const [postalCode, setPostalCode] = useState('97201');
  const [country, setCountry] = useState('USA');

  // Digital Presence & Audit Indicators
  const [websiteStatus, setWebsiteStatus] = useState<'Active' | 'No Website' | 'Slow / Unreachable Server'>('Active');
  const [gmbStatus, setGmbStatus] = useState<'Established' | 'Thin GMB' | 'Unclaimed' | 'No GMB'>('Established');
  const [gmbRating, setGmbRating] = useState('4.6');
  const [gmbReviews, setGmbReviews] = useState('18');
  const [googleAdsStatus, setGoogleAdsStatus] = useState<'Active' | 'No Ads'>('No Ads');
  const [metaPixelStatus, setMetaPixelStatus] = useState<'Installed' | 'No Pixel'>('No Pixel');

  // Commercial & Pipeline
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('New Lead');
  const [leadSource, setLeadSource] = useState('Manual Intake');
  const [estimatedRetainer, setEstimatedRetainer] = useState('2500');
  const [isHotTarget, setIsHotTarget] = useState(false);
  const [recommendedService, setRecommendedService] = useState('SEO & GMB Optimization');
  const [opportunityAngle, setOpportunityAngle] = useState('');
  const [initialNote, setInitialNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || isSubmitting) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    const rating = parseFloat(gmbRating) || 4.5;
    const reviews = parseInt(gmbReviews, 10) || 12;
    const retainer = parseInt(estimatedRetainer, 10) || 2500;

    // Detect marketing gaps
    const gaps: string[] = [];
    if (websiteStatus === 'No Website' || !website.trim()) {
      gaps.push('No Website');
    } else if (websiteStatus === 'Slow / Unreachable Server') {
      gaps.push('Slow / Unreachable Server');
    }
    if (metaPixelStatus === 'No Pixel') gaps.push('No Pixel');
    if (googleAdsStatus === 'No Ads') gaps.push('No Ads');
    if (reviews < 10) gaps.push('Thin Reviews');
    if (gmbStatus === 'No GMB' || gmbStatus === 'Unclaimed') gaps.push('Unclaimed GMB Profile');

    // Auto-calculate service and angle if not manually specified
    let effectiveService = recommendedService;
    if (!effectiveService || effectiveService === 'SEO & GMB Optimization') {
      if (gaps.includes('No Website')) {
        effectiveService = 'Website Development + Voice Search Optimization';
      } else if (gaps.includes('Slow / Unreachable Server')) {
        effectiveService = 'Website SEO & Technical Optimization';
      } else if (gaps.includes('No Ads')) {
        effectiveService = 'Local Search Ads & Retargeting';
      } else if (gaps.includes('Thin Reviews')) {
        effectiveService = 'Reputation & Review Booster';
      }
    }

    const effectiveAngle =
      opportunityAngle.trim() ||
      `${effectiveService} • ${niche} • ${city}, ${state}${ccbLicenseNumber ? ` (CCB #${ccbLicenseNumber})` : ''}`;

    const uniqueId = ccbLicenseNumber.trim()
      ? `CCB-${ccbLicenseNumber.trim()}`
      : `MCA-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 900 + 100)}`;

    const fullAddress = address.trim() ? address.trim() : `${city}, ${state} ${postalCode}`;
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(businessName.trim() + ' ' + city)}`;

    const partialLead: Partial<Lead> = {
      lead_id: uniqueId,
      business_name: businessName.trim(),
      contact_name: contactName.trim() || businessName.trim(),
      phone: phone.trim() || 'Not provided',
      phone_e164: phone.trim() || 'Not provided',
      email: email.trim() || 'Not provided',
      website: websiteStatus === 'No Website' ? 'No Website' : website.trim() || 'Not provided',
      industry,
      service_category: serviceCategory,
      niche,
      ccb_license_number: ccbLicenseNumber.trim() || undefined,
      address: fullAddress,
      city,
      county,
      state,
      country,
      postal_code: postalCode,
      gmb_status: gmbStatus,
      gmb_rating: rating,
      gmb_review_count: reviews,
      google_maps_url: mapsUrl,
      website_status: websiteStatus,
      google_ads_status: googleAdsStatus,
      meta_pixel_status: metaPixelStatus,
      seo_status: 'Average',
      gaps,
      opportunity_angle: effectiveAngle,
      recommended_service: effectiveService,
      secondary_services: ['Meta Ads & Retargeting', 'Voice Search Optimization'],
      estimated_retainer: retainer,
      estimated_revenue_lift: `$${(retainer * 2).toLocaleString()}–$${(retainer * 4.5).toLocaleString()}/mo`,
      pipeline_stage: pipelineStage,
      lead_source: leadSource,
      owner: 'Sophia (AI Sales Rep)',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: initialNote.trim()
        ? [
            {
              id: `note-${Date.now()}`,
              timestamp: new Date().toISOString(),
              author: 'Agency User',
              content: initialNote.trim(),
              activity_type: 'Note',
            },
          ]
        : [],
      original_data: {
        'Business Name': businessName.trim(),
        'Contact Name': contactName.trim(),
        City: city,
        County: county,
        Phone: phone.trim(),
        Email: email.trim(),
        'CCB License': ccbLicenseNumber.trim(),
        Source: leadSource,
      },
    };

    const scoring = calculateLeadScore(partialLead);
    const completeLead: Lead = {
      ...partialLead,
      lead_score: scoring.score,
      score_breakdown: scoring.breakdown,
      is_hot_target: isHotTarget || scoring.isHot,
    } as Lead;

    try {
      await onAddLead(completeLead);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to persist lead to Neon database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="add-lead-modal-overlay"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl bg-[#0e1322] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Add New Contractor Lead</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                  Neon PostgreSQL Schema
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct entry with automated 0–100 scoring, gap detection, and persistent database storage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Section 1: Business Identity */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              <span>Business Identity &amp; Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Business Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="lead-input-business-name"
                  required
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Cascade Summit Roofing &amp; Construction LLC"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Person Name</label>
                <input
                  id="lead-input-contact-name"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Michael Henderson"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number (Direct / E.164)</label>
                <input
                  id="lead-input-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 503-555-0142"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  id="lead-input-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. contact@cascaderoofing.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Website URL</label>
                <input
                  id="lead-input-website"
                  type="text"
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                    if (e.target.value.trim() && websiteStatus === 'No Website') {
                      setWebsiteStatus('Active');
                    }
                  }}
                  placeholder="e.g. https://cascaderoofing.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Industry, Trade & CCB License */}
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Classification &amp; CCB License</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Industry</label>
                <select
                  id="lead-select-industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                >
                  <option value="Contractor">Contractor / Trades</option>
                  <option value="Home Services">Home Services</option>
                  <option value="Commercial Construction">Commercial Construction</option>
                  <option value="Professional Services">Professional Services</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Niche / Trade</label>
                <select
                  id="lead-select-niche"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                >
                  <option value="General Contractor">General Contractor</option>
                  <option value="Plumbers">Plumber / Plumbing</option>
                  <option value="Electricians">Electrician / Electrical</option>
                  <option value="HVAC">HVAC &amp; Mechanical</option>
                  <option value="Roofing">Roofing Contractors</option>
                  <option value="Painting">Painting &amp; Coatings</option>
                  <option value="Landscaping">Landscaping &amp; Excavation</option>
                  <option value="Remodeling">Remodeling &amp; Framing</option>
                  <option value="Solar">Solar Installation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Service Category</label>
                <select
                  id="lead-select-service-category"
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                >
                  <option value="Residential & Commercial">Residential &amp; Commercial</option>
                  <option value="Residential Only">Residential Only</option>
                  <option value="Commercial Only">Commercial Only</option>
                  <option value="Service & Repair">Service &amp; Repair</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Oregon CCB License #</label>
                <input
                  id="lead-input-ccb-license"
                  type="text"
                  value={ccbLicenseNumber}
                  onChange={(e) => setCcbLicenseNumber(e.target.value)}
                  placeholder="e.g. 219842"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Location */}
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Location &amp; Service Radius</span>
            </h3>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              <div className="col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Street Address</label>
                <input
                  id="lead-input-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 1420 SE Powell Blvd"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">City</label>
                <input
                  id="lead-input-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">County</label>
                <input
                  id="lead-input-county"
                  type="text"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                >
                  <option value="">Select a country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">State / Zip</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-12 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs text-center"
                  />
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Digital Footprint & Audits */}
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Digital Presence &amp; Audit Indicators</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Website Status</label>
                <select
                  id="lead-select-website-status"
                  value={websiteStatus}
                  onChange={(e) => setWebsiteStatus(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                >
                  <option value="Active">Active Website</option>
                  <option value="No Website">No Website</option>
                  <option value="Slow / Unreachable Server">Slow Server</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">GMB Status</label>
                <select
                  id="lead-select-gmb-status"
                  value={gmbStatus}
                  onChange={(e) => setGmbStatus(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                >
                  <option value="Established">Established</option>
                  <option value="Thin GMB">Thin GMB (&lt;10 reviews)</option>
                  <option value="Unclaimed">Unclaimed</option>
                  <option value="No GMB">No GMB Profile</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Google Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={gmbRating}
                  onChange={(e) => setGmbRating(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs text-center"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Review Count</label>
                <input
                  type="number"
                  min="0"
                  value={gmbReviews}
                  onChange={(e) => setGmbReviews(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs text-center"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Google Ads Status</label>
                <select
                  value={googleAdsStatus}
                  onChange={(e) => setGoogleAdsStatus(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                >
                  <option value="No Ads">No Ads Detected</option>
                  <option value="Active">Active Ads</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Commercial Terms & Pipeline */}
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Commercial Terms &amp; Pipeline Progression</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pipeline Stage</label>
                <select
                  id="lead-select-pipeline-stage"
                  value={pipelineStage}
                  onChange={(e) => setPipelineStage(e.target.value as PipelineStage)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Audit Sent">Audit Sent</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won Retainer">Won Retainer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Lead Source</label>
                <select
                  id="lead-select-source"
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                >
                  <option value="Manual Intake">Manual Intake</option>
                  <option value="Oregon CCB Registry">Oregon CCB Registry</option>
                  <option value="Google Maps Scrape">Google Maps Scrape</option>
                  <option value="Inbound Referral">Inbound Referral</option>
                  <option value="Cold Call Campaign">Cold Call Campaign</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Est. Monthly Retainer ($)</label>
                <input
                  id="lead-input-retainer"
                  type="number"
                  step="100"
                  value={estimatedRetainer}
                  onChange={(e) => setEstimatedRetainer(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 bg-slate-800/80 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={isHotTarget}
                    onChange={(e) => setIsHotTarget(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                  />
                  <span className="font-semibold text-amber-300 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Hot Target Lead</span>
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Initial Lead Note / Context</label>
              <textarea
                value={initialNote}
                onChange={(e) => setInitialNote(e.target.value)}
                placeholder="Optional notes: Owner contact hours, specific project types, or referral notes..."
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 text-xs resize-none"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Persisting to Neon DB...' : 'Save Lead to Database'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
