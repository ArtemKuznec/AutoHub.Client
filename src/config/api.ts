const DEFAULT_API_BASE_URL = "https://localhost:7194/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (window as unknown as { __API_BASE_URL__?: string }).__API_BASE_URL ??
  DEFAULT_API_BASE_URL;
