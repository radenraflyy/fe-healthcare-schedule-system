import { safeGraphQLError } from './graphql-errors';
import { clearSession, getSessionToken } from './session';

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql';

export class GraphQLRequestError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'GraphQLRequestError';
    this.code = code;
  }
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const token = getSessionToken();
  let response: Response;
  try {
    response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    throw new GraphQLRequestError('Layanan sedang tidak tersedia. Periksa koneksi lalu coba lagi.');
  }

  let payload: { data?: T; errors?: Array<{ message?: string; extensions?: { code?: string } }> };
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    throw new GraphQLRequestError(
      'Layanan mengirim respons yang tidak dapat dibaca. Coba lagi sebentar.',
    );
  }
  if (!response.ok || payload.errors?.length || !payload.data) {
    const error = payload.errors?.[0];
    const code = error?.extensions?.code;
    if (code === 'UNAUTHENTICATED') clearSession();
    throw new GraphQLRequestError(safeGraphQLError(error?.message, code, response.status), code);
  }
  return payload.data;
}
