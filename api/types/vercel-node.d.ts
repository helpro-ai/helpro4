declare module '@vercel/node' {
  export interface VercelRequest {
    body?: unknown;
    method?: string;
    query?: Record<string, string | string[]>;
    headers?: Record<string, string | string[]>;
  }

  export interface VercelResponse {
    status: (statusCode: number) => VercelResponse;
    json: (body: unknown) => VercelResponse;
    setHeader: (name: string, value: string) => void;
    end: () => VercelResponse;
  }
}
