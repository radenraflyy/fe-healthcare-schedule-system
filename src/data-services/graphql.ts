import { safeGraphQLError } from './graphql-errors';
import { clearSession, getSessionToken } from './session';

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql';
const GRAPHQL_TIMEOUT_MS = 8_000;

export class GraphQLRequestError extends Error {
  code?: string;
  limit?: number;
  remaining?: number;
  retryAfterSeconds?: number;

  constructor(
    message: string,
    code?: string,
    rateLimit?: { limit?: number; remaining?: number; retryAfterSeconds?: number },
  ) {
    super(message);
    this.name = 'GraphQLRequestError';
    this.code = code;
    this.limit = rateLimit?.limit;
    this.remaining = rateLimit?.remaining;
    this.retryAfterSeconds = rateLimit?.retryAfterSeconds;
  }
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const token = getSessionToken();
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), GRAPHQL_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });
  } catch {
    window.clearTimeout(timeoutId);
    if (controller.signal.aborted) {
      throw new GraphQLRequestError(
        'Permintaan ke server terlalu lama. Pastikan API Gateway dan service backend berjalan lalu coba lagi.',
        'SERVICE_UNAVAILABLE',
      );
    }
    throw new GraphQLRequestError('Layanan sedang tidak tersedia. Periksa koneksi lalu coba lagi.');
  }

  let payload: {
    data?: T;
    errors?: Array<{
      message?: string;
      extensions?: {
        code?: string;
        limit?: number;
        remaining?: number;
        retryAfterSeconds?: number;
      };
    }>;
  };
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    window.clearTimeout(timeoutId);
    if (controller.signal.aborted) {
      throw new GraphQLRequestError(
        'Respons server terlalu lama. Pastikan API Gateway dan service backend berjalan lalu coba lagi.',
        'SERVICE_UNAVAILABLE',
      );
    }
    throw new GraphQLRequestError(
      'Layanan mengirim respons yang tidak dapat dibaca. Coba lagi sebentar.',
    );
  }
  window.clearTimeout(timeoutId);
  if (!response.ok || payload.errors?.length || !payload.data) {
    const error = payload.errors?.[0];
    const code = error?.extensions?.code;
    const retryAfterSeconds =
      (error?.extensions?.retryAfterSeconds ?? Number(response.headers.get('Retry-After') ?? 0)) ||
      undefined;
    const rateLimit = {
      limit: error?.extensions?.limit,
      remaining: error?.extensions?.remaining,
      retryAfterSeconds,
    };
    if (code === 'UNAUTHENTICATED') clearSession();
    throw new GraphQLRequestError(
      safeGraphQLError(error?.message, code, response.status, rateLimit),
      code,
      rateLimit,
    );
  }
  return payload.data;
}
