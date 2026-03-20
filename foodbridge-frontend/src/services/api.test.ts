import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './api';
import apiClient from './apiClient';

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

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET requests', () => {
    it('should make GET request and return data', async () => {
      const mockData = { id: 1, name: 'Test' };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockData } as any);

      const result = await api.get('/test');

      expect(apiClient.get).toHaveBeenCalledWith('/test', { params: undefined });
      expect(result).toEqual(mockData);
    });

    it('should pass query parameters to GET request', async () => {
      const mockData = { items: [] };
      const params = { page: 1, limit: 10 };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockData } as any);

      await api.get('/test', params);

      expect(apiClient.get).toHaveBeenCalledWith('/test', { params });
    });
  });

  describe('POST requests', () => {
    it('should make POST request and return data', async () => {
      const mockData = { id: 1, created: true };
      const postData = { name: 'New Item' };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockData } as any);

      const result = await api.post('/test', postData);

      expect(apiClient.post).toHaveBeenCalledWith('/test', postData);
      expect(result).toEqual(mockData);
    });

    it('should handle POST request without data', async () => {
      const mockData = { success: true };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockData } as any);

      await api.post('/test');

      expect(apiClient.post).toHaveBeenCalledWith('/test', undefined);
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request and return data', async () => {
      const mockData = { id: 1, updated: true };
      const putData = { name: 'Updated Item' };
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockData } as any);

      const result = await api.put('/test/1', putData);

      expect(apiClient.put).toHaveBeenCalledWith('/test/1', putData);
      expect(result).toEqual(mockData);
    });
  });

  describe('PATCH requests', () => {
    it('should make PATCH request and return data', async () => {
      const mockData = { id: 1, patched: true };
      const patchData = { status: 'active' };
      vi.mocked(apiClient.patch).mockResolvedValue({ data: mockData } as any);

      const result = await api.patch('/test/1', patchData);

      expect(apiClient.patch).toHaveBeenCalledWith('/test/1', patchData);
      expect(result).toEqual(mockData);
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request and return data', async () => {
      const mockData = { deleted: true };
      vi.mocked(apiClient.delete).mockResolvedValue({ data: mockData } as any);

      const result = await api.delete('/test/1');

      expect(apiClient.delete).toHaveBeenCalledWith('/test/1');
      expect(result).toEqual(mockData);
    });
  });

  describe('Error handling', () => {
    it('should propagate errors from apiClient', async () => {
      const error = new Error('Network error');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(api.get('/test')).rejects.toThrow('Network error');
    });
  });
});
