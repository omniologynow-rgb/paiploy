const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'Request failed');
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
}

export const apiClient = new ApiClient();
