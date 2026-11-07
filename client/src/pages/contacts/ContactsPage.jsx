import React, { useState, useEffect } from 'react';
import { contactService } from '../../api/services';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Users,
  Search,
  Plus,
  Download,
  Filter,
  Tag,
  Mail,
  Phone,
  Trash2,
  Edit,
  Clock,
  DollarSign,
  ShoppingCart,
  CheckCircle2,
  X
} from 'lucide-react';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Contact Drawer
  const [selectedContact, setSelectedContact] = useState(null);

  // Add Contact Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactTags, setContactTags] = useState('');
  const [contactStatus, setContactStatus] = useState('lead');
  const [saving, setSaving] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await contactService.getAll({
        search,
        tag: selectedTag === 'all' ? undefined : selectedTag,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      if (res.data?.success) {
        setContacts(res.data.data);
        setTags(res.data.tags || []);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search, selectedTag, statusFilter]);

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSaving(true);

    try {
      const tagArray = contactTags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await contactService.create({
        firstName,
        lastName,
        email,
        phone,
        tags: tagArray,
        status: contactStatus
      });
      if (res.data?.success) {
        setIsAddOpen(false);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setContactTags('');
        fetchContacts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create contact');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async (id, name, e) => {
    e.stopPropagation();
    if (window.confirm(`Delete contact "${name}"?`)) {
      try {
        await contactService.delete(id);
        if (selectedContact?._id === id) setSelectedContact(null);
        fetchContacts();
      } catch (err) {
        alert('Failed to delete contact');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Contact Management (CRM)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track leads, customers, lifetime value, and opt-in activity history
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a href="/api/contacts/export/csv" download="funnelpro_contacts.csv">
            <Button variant="secondary" size="md" icon={Download}>
              Export CSV
            </Button>
          </a>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsAddOpen(true)}
          >
            Add Contact
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">All Contacts (Leads & Buyers)</option>
            <option value="lead">Leads Only</option>
            <option value="customer">Paying Customers</option>
          </select>
        </div>

        <div>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">Filter by Tag (All Tags)</option>
            {tags.map((t, i) => (
              <option key={i} value={t}>Tag: {t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading CRM contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No contacts found</p>
            <p className="text-xs mt-1">Leads captured from funnel opt-in forms will appear automatically here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Tags</th>
                  <th className="py-3.5 px-4">Orders / Spent</th>
                  <th className="py-3.5 px-4">Lead Source</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {contacts.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => setSelectedContact(c)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {c.firstName} {c.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>
                        {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={c.status === 'customer' ? 'emerald' : 'blue'} size="xs">
                        {c.status.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(c.tags || []).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${(c.totalSpent || 0).toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {c.totalOrders || 0} order{c.totalOrders === 1 ? '' : 's'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-600 dark:text-slate-400 capitalize">
                        {c.source || 'direct'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => handleDeleteContact(c._id, `${c.firstName} ${c.lastName}`, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Contact Detail Drawer */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedContact(null)}
          />
          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-y-auto border-l border-slate-200 dark:border-slate-800 animate-fade-in flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <Badge variant={selectedContact.status === 'customer' ? 'emerald' : 'blue'} size="xs">
                    {selectedContact.status.toUpperCase()}
                  </Badge>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {selectedContact.firstName} {selectedContact.lastName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Info Details */}
              <div className="py-4 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold">{selectedContact.email}</span>
                </div>
                {selectedContact.phone && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{selectedContact.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span>Total Spent: <strong className="text-emerald-600">${(selectedContact.totalSpent || 0).toFixed(2)}</strong></span>
                </div>
              </div>

              {/* Tags */}
              <div className="py-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Assigned Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedContact.tags || []).map((t, idx) => (
                    <Badge key={idx} variant="indigo" size="xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Activity Log */}
              <div className="py-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Activity History</h4>
                <div className="space-y-3">
                  {(selectedContact.activityLog || []).map((act, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white mb-1">
                        <span>{act.action}</span>
                        <span className="text-[10px] text-slate-400">
                          {act.timestamp ? new Date(act.timestamp).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">{act.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => setSelectedContact(null)} className="w-full mt-4">
              Close Panel
            </Button>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create New CRM Contact"
      >
        <form onSubmit={handleAddContact} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Marcus"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sterling"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="marcus@apex.com"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={contactTags}
              onChange={(e) => setContactTags(e.target.value)}
              placeholder="lead, vip, coaching"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
            <select
              value={contactStatus}
              onChange={(e) => setContactStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            >
              <option value="lead">Lead</option>
              <option value="customer">Paying Customer</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>Save Contact</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ContactsPage;

