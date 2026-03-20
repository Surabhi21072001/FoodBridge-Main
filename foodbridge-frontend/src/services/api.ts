import apiClient from './apiClient';
import type { AxiosResponse } from 'axios';

/**
 * API service wrapper providing typed HTTP methods
 * Supports GET, POST, PUT, PATCH, DELETE
 */
class ApiService {
  /**
   * GET request
   * @param url - API endpoint
   * @param params - Query parameters
   */
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.get(url, { params });
    return response.data;
  }

  /**
   * POST request
   * @param url - API endpoint
   * @param data - Request body
   */
  async post<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.post(url, data);
    return response.data;
  }

  /**
   * PUT request
   * @param url - API endpoint
   * @param data - Request body
   */
  async put<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.put(url, data);
    return response.data;
  }

  /**
   * PATCH request
   * @param url - API endpoint
   * @param data - Request body
   */
  async patch<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.patch(url, data);
    return response.data;
  }

  /**
   * DELETE request
   * @param url - API endpoint
   */
  async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.delete(url);
    return response.data;
  }
}

// Export singleton instance
export const api = new ApiService();
export default api;
