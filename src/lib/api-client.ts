/**
 * API Client
 * Centralized HTTP client with error handling and request/response interceptors
 */

import { API_BASE_URL } from "@/config/api";
import type { ApiErrorResponse } from "@/types/contact";

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public status: number;
  public response?: ApiErrorResponse;

  constructor(message: string, status: number, response?: ApiErrorResponse) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
  }
}

/**
 * API Client configuration
 */
interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Create API client instance
 */
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || API_BASE_URL;
    this.timeout = config.timeout || 30000; // 30 seconds

    // Build headers object, ensuring no undefined values
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Merge any additional headers from config
    if (config.headers) {
      Object.assign(headers, config.headers);
    }

    this.defaultHeaders = headers;
  }

  /**
   * Build full URL from endpoint
   */
  private buildURL(endpoint: string): string {
    if (endpoint.startsWith("http")) {
      return endpoint;
    }
    return `${this.baseURL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  }

  /**
   * Create fetch request with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, this.timeout);
    const abort = () => controller.abort();
    options.signal?.addEventListener("abort", abort, { once: true });
    if (options.signal?.aborted) controller.abort();

    try {
      // Build headers object, ensuring proper merging
      const headers: Record<string, string> = { ...this.defaultHeaders };
      if (options.headers) {
        Object.assign(headers, options.headers);
      }

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (timedOut && error instanceof Error && error.name === "AbortError") {
        throw new ApiError("Request timeout", 408);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
      options.signal?.removeEventListener("abort", abort);
    }
  }

  /**
   * Handle response and parse JSON
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorData: ApiErrorResponse | undefined;

      if (isJson) {
        try {
          errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch {
          // Ignore JSON parse errors
        }
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    if (isJson) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = this.buildURL(endpoint);
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: "GET",
    });
    return this.handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    const url = this.buildURL(endpoint);
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    const url = this.buildURL(endpoint);
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    const url = this.buildURL(endpoint);
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = this.buildURL(endpoint);
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: "DELETE",
    });
    return this.handleResponse<T>(response);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export { ApiClient };
