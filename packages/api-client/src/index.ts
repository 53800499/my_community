import { ProblemDetails } from '@my-community/contracts';

export interface ApiClientConfig {
  baseUrl: string;
  getAuthToken?: () => string | null | Promise<string | null>;
}

export class ApiError extends Error {
  constructor(
    public readonly problem: ProblemDetails,
    message?: string,
  ) {
    super(message || problem.detail || problem.title);
    this.name = 'ApiError';
  }
}

export class MyCommunityApiClient {
  constructor(private readonly config: ApiClientConfig) {}

  public async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (this.config.getAuthToken) {
      const token = await this.config.getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let problem: ProblemDetails;
      try {
        problem = await response.json();
      } catch {
        problem = {
          type: 'about:blank',
          title: response.statusText,
          status: response.status,
          detail: 'Une erreur imprévue est survenue.',
          instance: path,
          timestamp: new Date().toISOString(),
        };
      }
      throw new ApiError(problem);
    }

    return response.json() as Promise<T>;
  }
}
