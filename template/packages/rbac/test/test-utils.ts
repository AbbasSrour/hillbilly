import { vi, type Mock } from 'vitest';

export type AdapterArgs = {
  model: string;
  where?: Array<{
    field: string;
    operator?: string;
    value: string | string[];
  }>;
  data?: Record<string, unknown>;
  update?: Record<string, unknown>;
  [key: string]: unknown;
};

type AdapterMock = Mock<(args: AdapterArgs) => unknown>;

/**
 * Mock adapter interface for testing Better Auth endpoints
 */
export interface MockAdapter {
  findMany: AdapterMock;
  findOne: AdapterMock;
  create: AdapterMock;
  update: AdapterMock;
  delete: AdapterMock;
  deleteMany: AdapterMock;
  count: AdapterMock;
}

/**
 * Mock context interface for testing Better Auth endpoints
 */
export interface MockContext {
  context: {
    adapter: MockAdapter;
    session: {
      user: {
        id: string;
        role: string;
      };
    } | null;
  };
  body: Record<string, unknown>;
  query: Record<string, unknown>;
  params: Record<string, string>;
  json: Mock<(data: unknown) => unknown>;
}

/**
 * Creates a mock adapter with all methods mocked
 */
export function createMockAdapter(): MockAdapter {
  return {
    findMany: vi.fn<(args: AdapterArgs) => unknown>(),
    findOne: vi.fn<(args: AdapterArgs) => unknown>(),
    create: vi.fn<(args: AdapterArgs) => unknown>(),
    update: vi.fn<(args: AdapterArgs) => unknown>(),
    delete: vi.fn<(args: AdapterArgs) => unknown>(),
    deleteMany: vi.fn<(args: AdapterArgs) => unknown>(),
    count: vi.fn<(args: AdapterArgs) => unknown>(),
  };
}

/**
 * Creates a mock context with default values
 */
export function createMockContext(
  adapter: MockAdapter,
  options: {
    session?: MockContext['context']['session'];
    body?: Record<string, unknown>;
    query?: Record<string, unknown>;
    params?: Record<string, string>;
  } = {},
): MockContext {
  return {
    context: {
      adapter,
      session:
        options.session === undefined
          ? {
              user: {
                id: 'user_id',
                role: 'admin',
              },
            }
          : options.session,
    },
    body: options.body ?? {},
    query: options.query ?? {},
    params: options.params ?? {},
    json: vi.fn<(data: unknown) => unknown>((data) => data),
  };
}
