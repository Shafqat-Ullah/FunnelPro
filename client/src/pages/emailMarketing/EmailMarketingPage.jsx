import React, { useState, useEffect } from 'react';
import { campaignService } from '../../api/services';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Mail,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  MousePointer,
  Trash2,
  Edit,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const EmailMarketingPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [smtpStatus, setSmtpStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Campaign Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [content, setContent] = useState('');
  const [creating, setCreating] = useState(false);

  // Test Email Modal
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [testSubject, setTestSubject] = useState('');
  const [testBody, setTestBody] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await campaignService.getAll();
      if (res.data?.success) {
        setCampaigns(res.data.data);
        setSmtpStatus(res.data.smtpStatus);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!title || !subject) return;
    setCreating(true);

    try {
      const res = await campaignService.create({
        title,
        subject,
        previewText,
        content
      });
      if (res.data?.success) {
        setIsCreateOpen(false);
        setTitle('');
        setSubject('');
        setPreviewText('');
        setContent('');
        fetchCampaigns();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating campaign');
    } finally {
      setCreating(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testRecipient) return;
    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await campaignService.sendTest({
        recipientEmail: testRecipient,
        subject: testSubject || 'Test Campaign',
        content: testBody || 'Test email content from FunnelPro.'
      });
      setTestResult({
        success: res.data?.success,
        message: res.data?.message || 'Test email sent successfully!'
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || 'Delivery failed: SMTP credentials required'
      });
    } finally {
      setSendingTest(false);
    }
  };

  const handleLaunchCampaign = async (id) => {
    if (window.confirm('Send this email broadcast to all matching contacts now?')) {
      try {
        const res = await campaignService.send(id);
        if (res.data?.success) {
          alert(res.data.message);
          fetchCampaigns();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Error launching campaign');
      }
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (window.confirm('Delete this campaign?')) {
      try {
        await campaignService.delete(id);
        fetchCampaigns();
      } catch (err) {
        alert('Failed to delete campaign');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Email Marketing & Broadcasts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Create automated broadcasts, target audience segments, and track deliverability
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={Send}
            onClick={() => {
              setTestSubject('Special Announcement: 50% Off');
              setTestBody('Hi there,\n\nWe wanted to thank you personally for being an active subscriber.\n\nBest regards,\nThe Team');
              setTestEmailOpen(true);
            }}
          >
            Send Test Email
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsCreateOpen(true)}
          >
            Create Campaign
          </Button>
        </div>
      </div>

      {/* SMTP Deliverability Status Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Nodemailer SMTP Dispatch Engine
              </span>
              <Badge variant={smtpStatus?.configured ? 'emerald' : 'amber'} size="xs">
                {smtpStatus?.configured ? 'SMTP CONNECTED' : 'MAILTRAP SIMULATION ACTIVE'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {smtpStatus?.message || 'Configurable in Settings > Email Settings or .env file'}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setTestEmailOpen(true);
          }}
        >
          Verify Delivery
        </Button>
      </div>

      {/* Campaigns List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading email campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Mail className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No email campaigns created</p>
            <p className="text-xs mt-1">Start by creating your first broadcast campaign.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {campaigns.map((camp) => (
              <div key={camp._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={camp.status === 'sent' ? 'emerald' : camp.status === 'scheduled' ? 'blue' : 'slate'} size="xs">
                      {camp.status.toUpperCase()}
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      {camp.sentAt ? `Sent on ${new Date(camp.sentAt).toLocaleDateString()}` : 'Draft'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {camp.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    Subject: {camp.subject}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Recipients</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{camp.stats?.recipients || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Opened</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{camp.stats?.opened || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Clicked</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{camp.stats?.clicked || 0}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {camp.status !== 'sent' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleLaunchCampaign(camp._id)}
                        icon={Send}
                      >
                        Send Broadcast
                      </Button>
                    )}
                    <button
                      onClick={() => handleDeleteCampaign(camp._id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Email Broadcast Campaign"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Campaign Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. VIP 50% Off Early Access Blast"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject Line *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. 🔥 [Limited Time] Exclusive Offer Inside"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Preview Text / Sub-header</label>
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="e.g. Claim your discount before midnight..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Body Content</label>
            <textarea
              rows="6"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Hi {{first_name}},\n\nThank you for being part of our community...\n\nClick here: https://funnelpro.io"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={creating}>Save Campaign</Button>
          </div>
        </form>
      </Modal>

      {/* Test Email Modal */}
      <Modal
        isOpen={testEmailOpen}
        onClose={() => setTestEmailOpen(false)}
        title="Dispatch Test Email via Nodemailer"
      >
        <form onSubmit={handleSendTestEmail} className="space-y-3.5 text-xs">
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-700'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Recipient Email *</label>
            <input
              type="email"
              required
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Test Subject</label>
            <input
              type="text"
              value={testSubject}
              onChange={(e) => setTestSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Test Body</label>
            <textarea
              rows="3"
              value={testBody}
              onChange={(e) => setTestBody(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setTestEmailOpen(false)}>Close</Button>
            <Button type="submit" variant="primary" loading={sendingTest}>Send Now</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmailMarketingPage;

