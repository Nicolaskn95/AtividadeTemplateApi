import { User, ContentItem, DatabaseStatus } from '../types.ts';

const TOKEN_KEY = 'technologic_auth_token';

export const tokenStorage = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Erro HTTP ${response.status}: ${response.statusText}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, senha: string): Promise<{ token: string; user: User; message: string }> {
    const res = await apiRequest<{ token: string; user: User; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    tokenStorage.set(res.token);
    return res;
  },

  async register(data: { nome: string; email: string; senha: string; telefone?: string; cpf?: string; avatar?: string }): Promise<{ token: string; user: User; message: string }> {
    const res = await apiRequest<{ token: string; user: User; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    tokenStorage.set(res.token);
    return res;
  },

  async getMe(): Promise<User> {
    return apiRequest<User>('/api/auth/me');
  },

  async updateProfile(data: { nome?: string; email?: string; telefone?: string; cpf?: string; senha?: string; avatar?: string }): Promise<{ user: User; message: string }> {
    return apiRequest<{ user: User; message: string }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  logout() {
    tokenStorage.clear();
  },

  // Contents
  async getContents(categoria?: string, q?: string): Promise<{ total: number; isAuthenticated: boolean; data: ContentItem[] }> {
    const params = new URLSearchParams();
    if (categoria && categoria !== 'TODAS') params.append('categoria', categoria);
    if (q) params.append('q', q);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<{ total: number; isAuthenticated: boolean; data: ContentItem[] }>(`/api/contents${query}`);
  },

  async getContentById(id: string): Promise<{ isAuthenticated: boolean; data: ContentItem }> {
    return apiRequest<{ isAuthenticated: boolean; data: ContentItem }>(`/api/contents/${id}`);
  },

  async createContent(data: Omit<ContentItem, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ message: string; data: ContentItem }> {
    return apiRequest<{ message: string; data: ContentItem }>('/api/contents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateContent(id: string, data: Partial<ContentItem>): Promise<{ message: string; data: ContentItem }> {
    return apiRequest<{ message: string; data: ContentItem }>(`/api/contents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteContent(id: string): Promise<{ message: string; deletedId: string }> {
    return apiRequest<{ message: string; deletedId: string }>(`/api/contents/${id}`, {
      method: 'DELETE',
    });
  },

  // Image management
  async updateContentImage(id: string, imagem: string): Promise<{ message: string; data: ContentItem }> {
    return apiRequest<{ message: string; data: ContentItem }>(`/api/contents/${id}/image`, {
      method: 'PUT',
      body: JSON.stringify({ imagem }),
    });
  },

  async deleteContentImage(id: string): Promise<{ message: string; data: ContentItem }> {
    return apiRequest<{ message: string; data: ContentItem }>(`/api/contents/${id}/image`, {
      method: 'DELETE',
    });
  },

  // Search
  async search(query: string, categoria?: string): Promise<{ termo: string; total: number; data: ContentItem[] }> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (categoria && categoria !== 'TODAS') params.append('categoria', categoria);
    return apiRequest<{ termo: string; total: number; data: ContentItem[] }>(`/api/search?${params.toString()}`);
  },

  // Database
  async getDbStatus(): Promise<DatabaseStatus> {
    return apiRequest<DatabaseStatus>('/api/db/status');
  },

  async resetSeed(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/api/db/seed', {
      method: 'POST',
    });
  },
};
