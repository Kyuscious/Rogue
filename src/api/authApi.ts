import { apiClient } from "./client.js";

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export const authApi = {
  register: async (
    email: string,
    password: string,
    username: string
  ): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/api/auth/register", {
      email,
      password,
      username,
    });
    apiClient.setToken(response.token);
    return response;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/api/auth/login", {
      email,
      password,
    });
    apiClient.setToken(response.token);
    return response;
  },

  loginAnonymous: async (): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/login-anonymous",
      {}
    );
    apiClient.setToken(response.token);
    return response;
  },

  logout: () => {
    apiClient.clearToken();
  },
};
