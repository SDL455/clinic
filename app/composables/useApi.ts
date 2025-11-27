import type { ApiResponse } from "~/types";

export function useApi() {
  const { getAuthHeaders, logout } = useAuth();

  // Base fetch with auth
  const apiFetch = async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await $fetch<ApiResponse<T>>(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...(options.headers || {}),
        },
      });

      return response;
    } catch (error: unknown) {
      const err = error as { statusCode?: number; data?: { message?: string } };

      // Handle 401 - Unauthorized
      if (err?.statusCode === 401) {
        logout();
      }

      throw error;
    }
  };

  // GET request
  const get = <T>(url: string, query?: Record<string, unknown>) =>
    apiFetch<T>(url, {
      method: "GET",
      ...(query && { params: query }),
    });

  // POST request
  const post = <T>(url: string, body?: unknown) =>
    apiFetch<T>(url, {
      method: "POST",
      body: JSON.stringify(body),
    });

  // PUT request
  const put = <T>(url: string, body?: unknown) =>
    apiFetch<T>(url, {
      method: "PUT",
      body: JSON.stringify(body),
    });

  // DELETE request
  const del = <T>(url: string) =>
    apiFetch<T>(url, {
      method: "DELETE",
    });

  return {
    apiFetch,
    get,
    post,
    put,
    del,
  };
}

