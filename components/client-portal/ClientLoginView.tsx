import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle,
  HelpCircle,
  Key,
} from 'lucide-react';
import { ClientPortalSession, ClientPortalUser } from '../../types/clientPortal';
import {
  getClientUsers,
  seedClientPortalData,
  createClientPortalSession,
  isClientPortalAccessDisabled,
} from '../../services/clientPortalService';

interface ClientLoginViewProps {
  onLoginSuccess: (user: ClientPortalUser) => void;
  onExitToAgencySuite: () => void;
}

export const ClientLoginView: React.FC<ClientLoginViewProps> = ({
  onLoginSuccess,
  onExitToAgencySuite,
}) => {
  const [email, setEmail] = useState('dave@westcoastplumbing.com');
  const [demoClient, setDemoClient] = useState('west_coast_plumbing');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const demoAccounts = [
    {
      id: 'west_coast_plumbing',
      name: 'Dave Miller',
      businessName: 'West Coast Plumbing Experts',
      email: 'dave@westcoastplumbing.com',
      role: 'Client Owner',
      desc: 'Owner access • Full approval & team management privileges',
    },
    {
      id: 'apex_roofing',
      name: 'Sarah Jenkins',
      businessName: 'Apex Roofing & Restoration',
      email: 'sarah@apexroofing.com',
      role: 'Client Admin',
      desc: 'Admin access • Campaign review & deliverables sign-off',
    },
    {
      id: 'cascade_hvac',
      name: 'Michael Chang',
      businessName: 'Cascade Heating & Air',
      email: 'michael@cascadehvac.com',
      role: 'Client Member',
      desc: 'Team member access • Read reports & submit requests',
    },
  ];

  const handleLogin = (selectedEmail?: string, selectedClientId?: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    const targetEmail = (selectedEmail || email).trim().toLowerCase();
    const targetClientId = selectedClientId || demoClient;

    // Check if client portal access has been disabled by agency operations
    if (isClientPortalAccessDisabled(targetClientId)) {
      setIsLoading(false);
      setErrorMessage(
        'Portal access for this organization has been temporarily suspended by Marketing Charm Agency Operations. Please contact your dedicated account lead.'
      );
      return;
    }

    setTimeout(() => {
      // Ensure data is seeded
      seedClientPortalData();

      const users = getClientUsers(targetClientId);
      let matchedUser = users.find((u) => u.email.toLowerCase() === targetEmail);

      // If logging in with demo account, fall back to owner or create user
      if (!matchedUser && users.length > 0) {
        matchedUser = users[0];
      }

      if (matchedUser) {
        createClientPortalSession(matchedUser);
        onLoginSuccess(matchedUser);
      } else {
        // Fallback demo user
        const fallbackUser: ClientPortalUser = {
          user_id: 'usr_demo',
          client_id: targetClientId,
          email: targetEmail,
          name: 'Dave Miller',
          role: 'Client Owner',
          title: 'Managing Principal',
          status: 'Active',
          created_at: new Date().toISOString(),
          notification_preferences: {
            email_notifications: true,
            portal_notifications: true,
            report_notifications: true,
            approval_notifications: true,
            service_updates: true,
          },
        };
        createClientPortalSession(fallbackUser);
        onLoginSuccess(fallbackUser);
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-8 font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-500/20">
            MCA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">
                Marketing Charm Agency
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Client Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Your Digital Growth Command Center</p>
          </div>
        </div>

        <button
          onClick={onExitToAgencySuite}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>Return to Internal Agency Suite</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md mx-auto my-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Client Portal Sign-In</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Secure, isolated client access for campaign tracking, approvals, and monthly reports.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-xl text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Quick 1-Click Demo Profiles */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Select Client Organization (1-Click Demo):
            </label>
            <div className="space-y-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => {
                    setEmail(acc.email);
                    setDemoClient(acc.id);
                    handleLogin(acc.email, acc.id);
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between group ${
                    demoClient === acc.id
                      ? 'bg-indigo-950/40 border-indigo-500/60'
                      : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {acc.businessName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 font-mono">
                        {acc.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{acc.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all mt-1" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider absolute">
              Or Sign In With Email
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Authorized Client Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@yourcompany.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Authenticating Secure Session...</span>
              ) : (
                <>
                  <span>Enter Client Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy & Zero Leakage Guarantee Notice */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Strict Data Isolation Standard</span>
            </div>
            <p className="leading-relaxed">
              Client organization boundaries are enforced with cryptographic isolation. Clients can only access approved deliverables, published monthly reports, and direct communication channels.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center py-4 text-[11px] text-slate-500">
        Marketing Charm Agency White-Label Client Experience Platform • Powered by Google Gemini AI
      </footer>
    </div>
  );
};
