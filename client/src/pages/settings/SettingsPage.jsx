import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService, systemService } from '../../api/services';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  User,
  Building,
  Palette,
  Bell,
  Lock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Shield,
  CreditCard
} from 'lucide-react';

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: '', isError: false });

  // Reset Demo State
  const [resetting, setResetting] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');

    try {
      await updateProfile({ name, businessName, bio, avatar });
      setProfileMsg('Profile information updated successfully!');
    } catch (err) {
      alert('Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match', isError: true });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg({ text: '', isError: false });

    try {
      const res = await authService.updatePassword({ currentPassword, newPassword });
      setPasswordMsg({ text: res.data?.message || 'Password updated!', isError: false });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({ text: err.response?.data?.message || 'Failed to update password', isError: true });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleResetDemoData = async () => {
    if (window.confirm('Reset all demo data back to clean production state? This will reseed funnels, products, contacts, and orders.')) {
      setResetting(true);
      try {
        await systemService.resetDemo();
        alert('Demo database successfully reset! Reloading page...');
        window.location.reload();
      } catch (err) {
        alert('Failed to reset demo data');
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Platform Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage your account profile, business branding, security credentials, and demo environment
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'profile', label: 'Profile & Account', icon: User },
          { id: 'business', label: 'Business & Branding', icon: Building },
          { id: 'security', label: 'Security & Password', icon: Lock },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'demo', label: 'Demo Environment Reset', icon: RotateCcw }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === t.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          {profileMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{profileMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="flex items-center gap-4">
              <img
                src={avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
              />
              <div className="flex-1">
                <label className="block font-semibold mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Bio / Role Headline</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="7-Figure SaaS Architect & Direct-Response Funnel Strategist"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" loading={savingProfile}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: BUSINESS & BRANDING */}
      {activeTab === 'business' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Business Information</h3>
          <div>
            <label className="block font-semibold mb-1">Company / Brand Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Default Store Currency</label>
              <select className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <option value="USD">USD ($) — United States Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Brand Accent Color</label>
              <div className="flex items-center gap-2">
                <input type="color" defaultValue="#6366f1" className="w-9 h-9 rounded cursor-pointer border" />
                <span className="font-mono">#6366f1 (Indigo Accent)</span>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <Button variant="primary" onClick={handleSaveProfile} loading={savingProfile}>
              Save Business Details
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY */}
      {activeTab === 'security' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Account Password</h3>

          {passwordMsg.text && (
            <div className={`p-3 rounded-xl border text-xs ${
              passwordMsg.isError
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-700'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-700'
            }`}>
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-3.5 max-w-md">
            <div>
              <label className="block font-semibold mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <Button type="submit" variant="primary" loading={savingPassword}>
              Update Password
            </Button>
          </form>
        </div>
      )}

      {/* TAB 4: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Email & In-App Notification Preferences</h3>
          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">New Order Alerts</p>
                <p className="text-[11px] text-slate-400">Receive instant notifications whenever a customer completes a checkout.</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
            </label>

            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Opt-in Lead Captures</p>
                <p className="text-[11px] text-slate-400">Receive notification when a prospect submits a funnel lead form.</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
            </label>

            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Weekly Funnel Performance Summary</p>
                <p className="text-[11px] text-slate-400">Automated summary of top-performing funnels and conversion rates.</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
            </label>
          </div>
        </div>
      )}

      {/* TAB 5: DEMO RESET */}
      {activeTab === 'demo' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Reset Demo Database to Initial Factory State</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Wipes test modifications and cleanly reseeds 4 multi-step funnels, 12 templates, 15 CRM contacts, 6 products with order bumps, and sample analytics.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="danger"
              size="md"
              icon={RotateCcw}
              onClick={handleResetDemoData}
              loading={resetting}
            >
              Reset Demo Environment Now
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default SettingsPage;

