export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

class ApiService {
  private base = '/api';

  private authHeader(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const res = await fetch(`${this.base}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.authHeader(),
          ...(options.headers || {}),
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const err = new Error(`API ${res.status} ${res.statusText}: ${text}`);
        
        if (res.status === 401) {
          // her kan vi lage outo logout
        }
        throw err;
      }
      
      if (res.status === 204) return undefined as T;

      // JSON svar
      return (await res.json()) as T;
    } catch (e) {
      console.error('[ApiService] request error:', e);
      throw e;
    }
  }

  public get<T>(path: string) {
    return this.request<T>(path, { method: 'GET' });
  }
  public post<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  }
  public put<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
  }
  public delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export default new ApiService();