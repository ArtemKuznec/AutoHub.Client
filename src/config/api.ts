const DEFAULT_API_BASE_URL = "https://localhost:7194/api";

export const API_BASE_URL =
  // Vite-стиль переменных окружения
  import.meta.env.VITE_API_BASE_URL ??
  // fallback на глобальную переменную, если нужно настроить без пересборки
  (window as unknown as { __API_BASE_URL__?: string }).__API_BASE_URL ??
  // дефолт для локальной разработки
  DEFAULT_API_BASE_URL;
