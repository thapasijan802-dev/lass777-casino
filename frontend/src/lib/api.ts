const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('9casino_token') || localStorage.getItem('lass777_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data as T;
  }

  // Auth
  async register(payload: any) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async login(payload: any) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Games
  async getGames(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return this.request<any>(`/games?${query.toString()}`);
  }

  async getGameBySlug(slug: string) {
    return this.request<any>(`/games/${slug}`);
  }

  async getCategories() {
    return this.request<any[]>('/games/categories');
  }

  async getProviders() {
    return this.request<any[]>('/games/providers');
  }

  // Game Provider Launch & Callbacks
  async launchGame(gameSlug: string, mode: 'REAL' | 'DEMO' = 'REAL') {
    return this.request<any>('/provider/launch', {
      method: 'POST',
      body: JSON.stringify({ gameSlug, mode }),
    });
  }

  async sendBetCallback(payload: {
    sessionToken: string;
    roundId: string;
    transactionId: string;
    amount: number;
    gameSlug: string;
  }) {
    return this.request<any>('/provider/callback/bet', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async sendWinCallback(payload: {
    sessionToken: string;
    roundId: string;
    transactionId: string;
    amount: number;
    gameSlug: string;
  }) {
    return this.request<any>('/provider/callback/win', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Wallet
  async getBalance() {
    return this.request<any>('/wallet/balance');
  }

  async deposit(payload: { amount: number; method: string; bonusCode?: string }) {
    return this.request<any>('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async withdraw(payload: { amount: number; method: string; destinationAddress: string }) {
    return this.request<any>('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getTransactions(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val) query.append(key, String(val));
    });
    return this.request<any[]>(`/wallet/transactions?${query.toString()}`);
  }

  // Bonus
  async getMyBonuses() {
    return this.request<any[]>('/bonus/my-bonuses');
  }

  async claimBonus(code: string) {
    return this.request<any>('/bonus/claim', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Admin
  async getAdminDashboard() {
    return this.request<any>('/admin/dashboard');
  }

  async getAdminUsers(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params);
    return this.request<any>(`/admin/users?${query.toString()}`);
  }

  async adjustUserBalance(id: string, payload: { amount: number; isCredit: boolean; reason: string }) {
    return this.request<any>(`/admin/users/${id}/balance`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async toggleUserStatus(id: string, status: string) {
    return this.request<any>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getAdminGames() {
    return this.request<any[]>('/admin/games');
  }

  async toggleGameActive(id: string, active: boolean) {
    return this.request<any>(`/admin/games/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    });
  }

  async getAdminTransactions(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params);
    return this.request<any>(`/admin/transactions?${query.toString()}`);
  }

  async reviewWithdrawal(id: string, action: 'APPROVE' | 'REJECT', reason?: string) {
    return this.request<any>(`/admin/transactions/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ action, reason }),
    });
  }
}

export const api = new ApiClient();
