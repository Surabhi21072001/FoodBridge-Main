import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import api from './api';
import apiClient from './apiClient';

// Feature: foodbridge-frontend, Property 79: API errors are thrown with response details

// Mock the apiClient
vi.mock('./apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('API Error Handling - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Property 79: API errors are thrown with response details', () => {
    it('should throw errors for any HTTP error status code', () => {
      fc.assert(
        fc.asyncProperty(
          // Generate various HTTP error status codes
          fc.constantFrom(400, 401, 403, 404, 500, 502, 503),
          fc.string({ minLength: 5, maxLength: 100 }),
          async (statusCode, errorMessage) => {
            const error = {
              response: {
                status: statusCode,
                data: { message: errorMessage },
              },
            };

            vi.mocked(apiClient.get).mockRejectedValue(error);

            try {
              await api.get('/test');
              return false; // Should not reach here
            } catch (e: any) {
              // Error should be thrown with response details
              return (
                e.response?.status === statusCode &&
                e.response?.data?.message === errorMessage
              );
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve error message for any error string', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 200 }),
          async (errorMessage) => {
            const error = {
              response: {
                status: 500,
                data: { message: errorMessage },
              },
            };

            vi.mocked(apiClient.post).mockRejectedValue(error);

            try {
              await api.post('/test', {});
              return false;
            } catch (e: any) {
              return e.response?.data?.message === errorMessage;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle errors with various response data structures', () => {
      fc.assert(
        fc.asyncProperty(
          fc.record({
            message: fc.string(),
            code: fc.string(),
            details: fc.array(fc.string()),
          }),
          async (errorData) => {
            const error = {
              response: {
                status: 400,
                data: errorData,
              },
            };

            vi.mocked(apiClient.put).mockRejectedValue(error);

            try {
              await api.put('/test', {});
              return false;
            } catch (e: any) {
              return (
                e.response?.data?.message === errorData.message &&
                e.response?.data?.code === errorData.code &&
                JSON.stringify(e.response?.data?.details) === JSON.stringify(errorData.details)
              );
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should throw errors for all HTTP methods', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('get', 'post', 'put', 'patch', 'delete'),
          fc.integer({ min: 400, max: 599 }),
          async (method, statusCode) => {
            const error = {
              response: {
                status: statusCode,
                data: { message: 'Error' },
              },
            };

            // Mock the appropriate method
            vi.mocked(apiClient[method as keyof typeof apiClient] as any).mockRejectedValue(
              error
            );

            try {
              await (api[method as keyof typeof api] as any)('/test', {});
              return false;
            } catch (e: any) {
              return e.response?.status === statusCode;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle network errors without response', () => {
      fc.assert(
        fc.asyncProperty(fc.string({ minLength: 5 }), async (errorMessage) => {
          const error = new Error(errorMessage);

          vi.mocked(apiClient.get).mockRejectedValue(error);

          try {
            await api.get('/test');
            return false;
          } catch (e: any) {
            return e.message === errorMessage;
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve error status codes across different endpoints', () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 400, max: 599 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (statusCode, endpoint) => {
            const error = {
              response: {
                status: statusCode,
                data: {},
              },
            };

            vi.mocked(apiClient.get).mockRejectedValue(error);

            try {
              await api.get(`/${endpoint}`);
              return false;
            } catch (e: any) {
              return e.response?.status === statusCode;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Error response data integrity', () => {
    it('should maintain validation error arrays', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              field: fc.string(),
              message: fc.string(),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (validationErrors) => {
            const error = {
              response: {
                status: 400,
                data: {
                  errors: validationErrors,
                },
              },
            };

            vi.mocked(apiClient.post).mockRejectedValue(error);

            try {
              await api.post('/test', {});
              return false;
            } catch (e: any) {
              const receivedErrors = e.response?.data?.errors;
              return (
                Array.isArray(receivedErrors) &&
                receivedErrors.length === validationErrors.length &&
                receivedErrors.every(
                  (err: any, idx: number) =>
                    err.field === validationErrors[idx].field &&
                    err.message === validationErrors[idx].message
                )
              );
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle errors with nested error objects', () => {
      fc.assert(
        fc.asyncProperty(
          fc.record({
            error: fc.record({
              code: fc.string(),
              message: fc.string(),
              details: fc.record({
                field: fc.string(),
                value: fc.string(),
              }),
            }),
          }),
          async (errorData) => {
            const error = {
              response: {
                status: 422,
                data: errorData,
              },
            };

            vi.mocked(apiClient.patch).mockRejectedValue(error);

            try {
              await api.patch('/test', {});
              return false;
            } catch (e: any) {
              return (
                e.response?.data?.error?.code === errorData.error.code &&
                e.response?.data?.error?.message === errorData.error.message &&
                e.response?.data?.error?.details?.field === errorData.error.details.field
              );
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: HTTP status code categorization', () => {
    it('should correctly identify client errors (4xx)', () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 400, max: 499 }),
          async (statusCode) => {
            const error = {
              response: {
                status: statusCode,
                data: {},
              },
            };

            vi.mocked(apiClient.get).mockRejectedValue(error);

            try {
              await api.get('/test');
              return false;
            } catch (e: any) {
              const status = e.response?.status;
              return status >= 400 && status < 500;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify server errors (5xx)', () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 500, max: 599 }),
          async (statusCode) => {
            const error = {
              response: {
                status: statusCode,
                data: {},
              },
            };

            vi.mocked(apiClient.get).mockRejectedValue(error);

            try {
              await api.get('/test');
              return false;
            } catch (e: any) {
              const status = e.response?.status;
              return status >= 500 && status < 600;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
