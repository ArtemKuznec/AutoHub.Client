import { API_BASE_URL } from "../config/api";

const REGIONS_SESSION_KEY = "regions";

export class RegionService {
  private readonly baseUrl: string;
  private cachedRegions: string[] | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getAllRegions(): Promise<string[]> {
    if (this.cachedRegions) {
      return this.cachedRegions;
    }

    if (typeof window !== "undefined" && window.sessionStorage) {
      const cached = window.sessionStorage.getItem(REGIONS_SESSION_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            this.cachedRegions = parsed as string[];
            return this.cachedRegions;
          }
        } catch {
        }
      }
    }

    const response = await fetch(`${this.baseUrl}/regions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let message = `Не удалось получить список регионов. Код статуса: ${response.status}`;

      try {
        const text = await response.text();
        if (text) {
          message = text;
        }
      } catch {
      }

      throw new Error(message);
    }

    const data = (await response.json()) as unknown;

    let regions: string[] = [];

    if (Array.isArray(data)) {
      if (data.length === 0 || typeof data[0] === "string") {
        regions = data as string[];
      } else {
        regions = (data as Array<{ name?: string; title?: string }>).map((item) => {
          if (typeof item.name === "string") return item.name;
          if (typeof item.title === "string") return item.title;
          return String(item);
        });
      }
    }

    this.cachedRegions = regions;

    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        window.sessionStorage.setItem(REGIONS_SESSION_KEY, JSON.stringify(regions));
      } catch {
      }
    }

    return regions;
  }
}

export const regionService = new RegionService();