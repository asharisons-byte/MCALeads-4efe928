import React, { useState } from 'react';
import { X, Plus, Sparkles, Building, Phone, Mail, Globe, MapPin } from 'lucide-react';
import { Lead } from '../types';
import { calculateLeadScore } from '../services/scoringService';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Lead) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  onAddLead,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState('Portland');
  const [state, setState] = useState('Oregon');
  const [postalCode, setPostalCode] = useState('97201');
  const [niche, setNiche] = useState('Plumbers');
  const [gmbRating, setGmbRating] = useState('4.5');
  const [gmbReviews, setGmbReviews] = useState('15');
  const [websiteStatus, setWebsiteStatus] = useState<'Active' | 'No Website' | 'Slow / Unreachable Server'>('Active');
  const [metaPixelStatus, setMetaPixelStatus] = useState<'Installed' | 'No Pixel'>('No Pixel');
  const [googleAdsStatus, setGoogleAdsStatus] = useState<'Active' | 'No Ads'>('No Ads');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    const rating = parseFloat(gmbRating) || 4.5;
    const reviews = parseInt(gmbReviews, 10) || 12;

    const gaps: string[] = [];
    if (websiteStatus === 'No Website' || !website.trim()) {
      gaps.push('No Website');
    } else if (websiteStatus === 'Slow / Unreachable Server') {
      gaps.push('Slow / Unreachable Server');
    }
    if (metaPixelStatus === 'No Pixel') gaps.push('No Pixel');
    if (googleAdsStatus === 'No Ads') gaps.push('No Ads');
    if (reviews < 10) gaps.push('Thin Reviews');

    let service = 'Website SEO & Technical Optimization';
    let retainer = 1800;
    if (gaps.includes('No Website')) {
      service = 'Website Development + Voice Search Optimization';
      retainer = 1800;
    } else if (gaps.includes('Slow / Unreachable Server')) {
      service = 'Website SEO & Technical Optimization';
      retainer = 2400;
    } else if (gaps.includes('No Ads')) {
      service = 'Local Search Ads & Retargeting';
      retainer = 2400;
    }

    const partialLead: Partial<Lead> = {
      lead_id: `MCA-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 900 + 100)}`,
      business_name: businessName.trim(),
      contact_name: contactName.trim() || undefined,
      phone: phone.trim() || 'Not provided',
      email: email.trim() || 'Not provided',
      website: websiteStatus === 'No Website' ? 'No Website' : website.trim() || 'Not provided',
      address: `${city}, ${state} ${postalCode}`,
      city,
      state,
      country: 'USA',
      postal_code: postalCode,
      niche,
      gmb_status: reviews > 20 ? 'Established' : 'Thin GMB',
      gmb_rating: rating,
      gmb_review_count: reviews,
      google_maps_url: `https://maps.google.com/?q=${encodeURIComponent(businessName + ' ' + city)}`,
      website_status: websiteStatus,
      google_ads_status: googleAdsStatus,
      meta_pixel_status: metaPixelStatus,
      seo_status: 'Average',
      gaps,
      opportunity_angle: `${service} • ${niche} • ${city}`,
      recommended_service: service,
      secondary_services: ['Meta Ads & Retargeting', 'Voice Search Optimization'],
      estimated_retainer: retainer,
      estimated_revenue_lift: '$4,000–$9,000/month',
      pipeline_stage: 'New Lead',
      owner: 'Sophia (AI Sales Rep)',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: [],
      original_data: {
        'Business Name': businessName,
        City: city,
        Phone: phone,
        Email: email,
      },
    };

    const scoring = calculateLeadScore(partialLead);
    const completeLead: Lead = {
      ...partialLead,
      lead_score: scoring.score,
      score_breakdown: scoring.breakdown,
      is_hot_target: scoring.isHot,
    } as Lead;

    onAddLead(completeLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0e1322] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Add New Lead</h2>
              <p className="text-xs text-slate-400">
                Direct entry with automated 0–100 scoring and gap detection
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Business Name <span className="text-rose-400">*</span>
            </label>
            <input
              required
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Pacific Northwest Electrical"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contact Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Niche / Industry</label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option value="Plumbers">Plumbers</option>
                <option value="HVAC">HVAC Contractors</option>
                <option value="Electricians">Electricians</option>
                <option value="Roofing">Roofing Contractors</option>
                <option value="Dental">Dental Clinics</option>
                <option value="Auto Repair">Auto Repair</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 503-555-0199"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@business.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ZIP Code</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Website URL</label>
            <input
              type="text"
              value={website}
              onChange={(e) => {
                setWebsite(e.target.value);
                if (e.target.value.trim()) setWebsiteStatus('Active');
              }}
              placeholder="e.g. www.business.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Website Status</label>
              <select
                value={websiteStatus}
                onChange={(e) => setWebsiteStatus(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option value="Active">Active Website</option>
                <option value="No Website">No Website</option>
                <option value="Slow / Unreachable Server">Slow Server</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">GMB Rating</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={gmbRating}
                onChange={(e) => setGmbRating(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Review Count</label>
              <input
                type="number"
                min="0"
                value={gmbReviews}
                onChange={(e) => setGmbReviews(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Save &amp; Calculate Score</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
