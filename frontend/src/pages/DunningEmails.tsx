import React, { useEffect, useState } from 'react';
import { Mail, Eye, Clock, CheckCircle, MousePointerClick, Edit3, X, Save } from 'lucide-react';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';

interface DunningEmail {
  id: number;
  template_name: string;
  sent_at: string;
  opened_at: string | null;
  clicked_at: string | null;
  status: string;
}

interface EmailTemplate {
  name: string;
  subject: string;
  body_html: string;
}

export const DunningEmails: React.FC = () => {
  const { showToast } = useToast();
  const [emails, setEmails] = useState<DunningEmail[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'templates'>('history');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [emailsData, templatesData] = await Promise.all([
        apiClient.getEmailHistory(),
        apiClient.getEmailTemplates(),
      ]);
      setEmails(emailsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (email: DunningEmail) => {
    if (email.clicked_at) return <MousePointerClick className="h-4 w-4 text-emerald-400" />;
    if (email.opened_at) return <CheckCircle className="h-4 w-4 text-blue-400" />;
    return <Clock className="h-4 w-4 text-slate-500" />;
  };

  const stats = {
    total: emails.length,
    openRate: emails.length > 0 ? ((emails.filter(e => e.opened_at).length / emails.length) * 100).toFixed(1) : '0',
    clickRate: emails.length > 0 ? ((emails.filter(e => e.clicked_at).length / emails.length) * 100).toFixed(1) : '0',
  };

  const startEdit = (t: EmailTemplate) => {
    setEditingTemplate(t);
    setEditSubject(t.subject);
    setEditBody(t.body_html);
    setShowPreview(false);
  };

  const saveTemplate = async () => {
    if (!editingTemplate) return;
    try {
      await apiClient.updateEmailTemplate(editingTemplate.name, { subject: editSubject, body_html: editBody });
      showToast('Template saved successfully', 'success');
      setEditingTemplate(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save template', 'error');
    }
  };

  const getTemplateStats = (templateName: string) => {
    const related = emails.filter(e => e.template_name === templateName);
    return {
      sent: related.length,
      opened: related.filter(e => e.opened_at).length,
      clicked: related.filter(e => e.clicked_at).length,
    };
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="dunning-emails-page">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-1">Dunning Emails</h1>
          <p className="text-slate-400">Manage email templates and track campaign performance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="card p-5" data-testid="dunning-stat-sent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Sent</span>
              <Mail className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">{stats.total}</div>
          </div>
          <div className="card p-5" data-testid="dunning-stat-open">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Open Rate</span>
              <Eye className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">{stats.openRate}%</div>
          </div>
          <div className="card p-5" data-testid="dunning-stat-click">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Click Rate</span>
              <MousePointerClick className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">{stats.clickRate}%</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-[#1e293b] flex">
            <button
              data-testid="dunning-tab-history"
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'history' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Email History
            </button>
            <button
              data-testid="dunning-tab-templates"
              onClick={() => setActiveTab('templates')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'templates' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Templates
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Loading your recovery data...</p>
              </div>
            ) : activeTab === 'history' ? (
              emails.length === 0 ? (
                <div className="text-center py-16" data-testid="dunning-empty-history">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-500/10 border border-slate-500/20 mb-4">
                    <Mail className="h-7 w-7 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-2">No emails sent yet</h3>
                  <p className="text-slate-400 text-sm">Dunning emails will be sent automatically when payments fail.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="dunning-history-table">
                    <thead>
                      <tr className="border-b border-[#1e293b]">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Template</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sent</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Opened</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Clicked</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emails.map(email => (
                        <tr key={email.id} className="border-b border-[#1e293b]/50 hover:bg-surface-tertiary/30 transition-colors">
                          <td className="py-3 px-4 text-sm text-slate-200">{email.template_name.replace(/_/g, ' ')}</td>
                          <td className="py-3 px-4 text-sm text-slate-400">{new Date(email.sent_at).toLocaleString()}</td>
                          <td className="py-3 px-4 text-sm text-slate-400">{email.opened_at ? new Date(email.opened_at).toLocaleString() : '-'}</td>
                          <td className="py-3 px-4 text-sm text-slate-400">{email.clicked_at ? new Date(email.clicked_at).toLocaleString() : '-'}</td>
                          <td className="py-3 px-4"><div className="flex items-center gap-2">{getStatusIcon(email)}<span className="text-sm text-slate-300">{email.status}</span></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="space-y-6" data-testid="dunning-templates-list">
                {templates.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-500/10 border border-slate-500/20 mb-4">
                      <Mail className="h-7 w-7 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">No templates yet</h3>
                    <p className="text-slate-400 text-sm">Email templates will appear here once configured.</p>
                  </div>
                ) : templates.map(t => {
                  const tStats = getTemplateStats(t.name);
                  return (
                    <div key={t.name} className="border border-[#1e293b] rounded-xl p-6 hover:border-[#334155] transition-all" data-testid={`template-card-${t.name}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-100">{t.name.replace(/_/g, ' ')}</h3>
                          <p className="text-sm text-slate-400 mt-0.5">Subject: {t.subject}</p>
                        </div>
                        <button
                          onClick={() => startEdit(t)}
                          data-testid={`template-edit-${t.name}`}
                          className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex gap-4 text-xs text-slate-500 mb-4">
                        <span>Sent: {tStats.sent}</span>
                        <span>Opened: {tStats.opened}</span>
                        <span>Clicked: {tStats.clicked}</span>
                      </div>
                      <div className="bg-surface-primary p-4 rounded-lg border border-[#1e293b] max-h-48 overflow-y-auto">
                        <div className="text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: t.body_html }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Edit Template Modal */}
        {editingTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="template-edit-modal">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingTemplate(null)} />
            <div className="relative bg-surface-secondary border border-[#1e293b] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-100">Edit: {editingTemplate.name.replace(/_/g, ' ')}</h3>
                <button onClick={() => setEditingTemplate(null)} data-testid="template-edit-close" className="p-2 text-slate-400 hover:text-slate-200">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                  <input data-testid="template-edit-subject" value={editSubject} onChange={(e) => setEditSubject(e.target.value)} className="input-field" />
                </div>
                <div className="flex gap-2 mb-2">
                  <button onClick={() => setShowPreview(false)} className={`px-3 py-1.5 text-xs rounded-lg ${!showPreview ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400'}`}>
                    Edit
                  </button>
                  <button onClick={() => setShowPreview(true)} data-testid="template-preview-toggle" className={`px-3 py-1.5 text-xs rounded-lg ${showPreview ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400'}`}>
                    Preview
                  </button>
                </div>
                {showPreview ? (
                  <div className="bg-surface-primary p-4 rounded-lg border border-[#1e293b] min-h-[200px]">
                    <div className="text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: editBody }} />
                  </div>
                ) : (
                  <textarea
                    data-testid="template-edit-body"
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="input-field min-h-[200px] font-mono text-sm"
                    placeholder="HTML content..."
                  />
                )}
                <div className="flex justify-end gap-3">
                  <button onClick={() => setEditingTemplate(null)} className="btn-secondary px-5 py-2.5">Cancel</button>
                  <button onClick={saveTemplate} data-testid="template-save-btn" className="btn-primary px-5 py-2.5 flex items-center gap-2">
                    <Save className="h-4 w-4" /> Save Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
