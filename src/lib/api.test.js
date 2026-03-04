import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiService, ApiError } from '@/lib/api';

describe('ApiService', () => {
  let apiService;
  let mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    apiService = new ApiService({
      baseUrl: 'http://localhost:8080',
      getAccessToken: async () => 'test_token_123'
    });
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { id: '123', name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockResponse
      });

      const result = await apiService.request('/test');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.any(Object)
      );
    });

    it('should include auth token in headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({})
      });

      await apiService.request('/test');

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.headers.Authorization).toBe('Bearer test_token_123');
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request with body', async () => {
      const mockResponse = { id: '456', created: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockResponse
      });

      const payload = { name: 'New Item' };
      const result = await apiService.request('/test', {
        method: 'POST',
        body: payload
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload)
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should throw ApiError on 4xx response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ 
          code: 'NOT_FOUND',
          message: 'Resource not found'
        })
      });

      await expect(apiService.request('/notfound'))
        .rejects
        .toThrow(ApiError);
    });

    it('should throw ApiError on 5xx response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ 
          code: 'INTERNAL_ERROR',
          message: 'Server error'
        })
      });

      await expect(apiService.request('/error'))
        .rejects
        .toThrow(ApiError);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failed'));

      await expect(apiService.request('/test'))
        .rejects
        .toThrow();
    });

    it('should handle timeout', async () => {
      const shortTimeoutService = new ApiService({
        baseUrl: 'http://localhost:8080',
        getAccessToken: async () => 'test_token_123'
      });

      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => {
          throw new Error('Timeout');
        }, 100))
      );

      await expect(
        shortTimeoutService.request('/test', { timeoutMs: 50 })
      ).rejects.toThrow();
    });
  });

  describe('Query parameters', () => {
    it('should append query parameters to URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ([])
      });

      await apiService.request('/items', {
        query: { page: 1, limit: 10 }
      });

      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain('page=1');
      expect(callUrl).toContain('limit=10');
    });

    it('should skip null/undefined query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ([])
      });

      await apiService.request('/items', {
        query: { page: 1, filter: undefined, sort: null }
      });

      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain('page=1');
      expect(callUrl).not.toContain('filter');
      expect(callUrl).not.toContain('sort');
    });
  });
});
