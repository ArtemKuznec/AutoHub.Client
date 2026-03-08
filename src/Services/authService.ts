import { API_BASE_URL } from "../config/api";

const TOKEN_STORAGE_KEY = "auth_token";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  FIO: string;
  password: string;
};

type AuthResponse = {
  token?: string;
  accessToken?: string;
};

export class AuthService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  clearToken(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return typeof token === "string" && token.length > 0;
  }

  async login(credentials: LoginRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      let message = "Ошибка входа.";
      try {
        const text = await response.text();
        if (text) message = text;
      } catch {
      }
      throw new Error(message);
    }

    const data = (await response.json()) as AuthResponse;
    const token = data.token ?? data.accessToken;
    if (!token) {
      throw new Error("Сервер не вернул токен.");
    }

    this.setToken(token);
    return token;
  }

  async register(data: RegisterRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let message = "Ошибка регистрации.";
      try {
        const text = await response.text();
        if (text) message = text;
      } catch {
      }
      throw new Error(message);
    }
  }

  logout(): void {
    this.clearToken();
  }
}

export const authService = new AuthService();
