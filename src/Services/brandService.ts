import { API_BASE_URL } from "../config/api";

const BRANDS_SESSION_KEY = "brands";

export class BrandService {
  private readonly baseUrl: string;
  private cachedBrands: string[] | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getAllBrands(): Promise<string[]> {
    if (this.cachedBrands) {
      return this.cachedBrands;
    }

    if (typeof window !== "undefined" && window.sessionStorage) {
      const cached = window.sessionStorage.getItem(BRANDS_SESSION_KEY);
      if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          this.cachedBrands = parsed as string[];
          return this.cachedBrands;
        }
      } catch {}
      }
    }

    const response = await fetch(`${this.baseUrl}/brands`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let message = `Не удалось получить список брендов. Код статуса: ${response.status}`;

      try {
        const text = await response.text();
        if (text) {
          message = text;
        }
      } catch {}

      throw new Error(message);
    }

    const data = (await response.json()) as unknown;

    let brands: string[] = [];

    if (Array.isArray(data)) {
      if (data.length === 0 || typeof data[0] === "string") {
        brands = data as string[];
      } else {
        brands = (data as Array<{ name?: string; title?: string }>).map((item) => {
          if (typeof item.name === "string") return item.name;
          if (typeof item.title === "string") return item.title;
          return String(item);
        });
      }
    }

    this.cachedBrands = brands;

    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        window.sessionStorage.setItem(BRANDS_SESSION_KEY, JSON.stringify(brands));
      } catch {}
    }

    return brands;
  }
}

export const brandService = new BrandService();

