const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Extract a human-readable error message from FastAPI error responses.
 * Handles both string detail and array-of-objects detail (validation errors).
 */
function extractErrorMessage(error: any): string {
  const detail = error?.detail;
  if (!detail) return error?.message || 'Request failed';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    // FastAPI validation error: [{msg: "...", loc: [...], type: "..."}]
    return detail.map((d: any) => d.msg || d.message || String(d)).join('. ');
  }
  if (typeof detail === 'object') return detail.msg || detail.message || JSON.stringify(detail);
  return String(detail);
}

export class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(extractErrorMessage(error));
    }

    return response.json();
  }

  async register(email: string, password: string, companyName?: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, company_name: companyName }),
    });
  }

  async login(email: string, password: string) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  async logout() {
    const result = await this.request('/api/auth/logout', { method: 'POST' });
    this.clearToken();
    return result;
  }

  async getDashboardStats() {
    return this.request('/api/recovery/stats');
  }

  async getFailedPayments(filters?: {
    status?: string;
    failure_code?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/payments/failed${query}`);
  }

  async getFailedPayment(id: number) {
    return this.request(`/api/payments/failed/${id}`);
  }

  async retryPayment(id: number) {
    return this.request(`/api/payments/failed/${id}/retry`, { method: 'POST' });
  }

  async cancelPayment(id: number) {
    return this.request(`/api/payments/failed/${id}/cancel`, { method: 'POST' });
  }

  async getSettings() {
    return this.request('/api/settings/');
  }

  async updateSettings(settings: any) {
    return this.request('/api/settings/', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getEmailTemplates() {
    return this.request('/api/dunning/templates');
  }

  async updateEmailTemplate(name: string, data: { subject: string; body_html: string }) {
    return this.request(`/api/dunning/templates/${name}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getEmailHistory() {
    return this.request('/api/dunning/history');
  }

  async getConnectionStatus() {
    return this.request('/api/connect/status');
  }

  async getAuthorizeUrl() {
    return this.request('/api/connect/authorize');
  }

  async disconnectStripe() {
    return this.request('/api/connect/disconnect', { method: 'DELETE' });
  }

  async getTimelineStats(days: number = 30) {
    return this.request(`/api/recovery/stats/timeline?days=${days}`);
  }

  async getFailureBreakdown() {
    return this.request('/api/recovery/stats/by-failure-type');
  }

  async sendDunningEmail(paymentId: number) {
    return this.request(`/api/payments/failed/${paymentId}/send-email`, { method: 'POST' });
  }

  // ─── Billing ────────────────────────────────────────────────
  async getBillingStatus() {
    return this.request('/api/billing/status');
  }

  async createCheckout(priceId: string) {
    return this.request('/api/billing/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ price_id: priceId }),
    });
  }

  async getBillingPortal() {
    return this.request('/api/billing/create-portal-session', { method: 'POST' });
  }

  // ─── Auth: Forgot / Reset Password ─────────────────────────
  async forgotPassword(email: string) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  }

  async verifyEmail(token: string) {
    return this.request('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async getRecentActivity(limit: number = 10) {
    return this.request(`/api/recovery/activity?limit=${limit}`);
  }
}

export const apiClient = new ApiClient();
