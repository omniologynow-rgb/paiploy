import React, { useEffect, useState } from 'react';
import { Mail, Eye, Clock, CheckCircle, MousePointerClick } from 'lucide-react';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';

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
  const [emails, setEmails] = useState<DunningEmail[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'templates'>('history');

  useEffect(() => {
    fetchData();
  }, []);

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
    if (email.clicked_at) {
      return <MousePointerClick className="h-4 w-4 text-green-500" />;
    }
    if (email.opened_at) {
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  const calculateStats = () => {
    const total = emails.length;
    const opened = emails.filter((e) => e.opened_at).length;
    const clicked = emails.filter((e) => e.clicked_at).length;

    return {
      total,
      openRate: total > 0 ? ((opened / total) * 100).toFixed(1) : 0,
      clickRate: total > 0 ? ((clicked / total) * 100).toFixed(1) : 0,
    };
  };

  const stats = calculateStats();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dunning Emails</h1>
          <p className="text-gray-400">Manage email templates and track campaign performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Sent</span>
              <Mail className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Open Rate</span>
              <Eye className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.openRate}%</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Click Rate</span>
              <MousePointerClick className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.clickRate}%</div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="border-b border-gray-800">
            <div className="flex">
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'history'
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Email History
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'templates'
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Templates
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : activeTab === 'history' ? (
              <div className="overflow-x-auto">
                {emails.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No emails sent yet</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Template</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Sent At</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Opened</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Clicked</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emails.map((email) => (
                        <tr key={email.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-3 px-4 text-white">
                            {email.template_name.replace(/_/g, ' ')}
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {new Date(email.sent_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {email.opened_at
                              ? new Date(email.opened_at).toLocaleString()
                              : '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {email.clicked_at
                              ? new Date(email.clicked_at).toLocaleString()
                              : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(email)}
                              <span className="text-gray-300">{email.status}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {templates.map((template) => (
                  <div key={template.name} className="border border-gray-800 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {template.name.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-gray-400 mb-4">Subject: {template.subject}</p>
                    <div className="bg-gray-800 p-4 rounded border border-gray-700 max-h-64 overflow-y-auto">
                      <div
                        className="text-sm text-gray-300"
                        dangerouslySetInnerHTML={{ __html: template.body_html }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
