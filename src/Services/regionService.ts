import { API_BASE_URL } from "../config/api";

const REGIONS_SESSION_KEY = "regions";

export type Region = {
  id: string;
  name: string;
};

export class RegionService {
  private readonly baseUrl: string;
  private cachedRegions: Region[] | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getAllRegions(): Promise<Region[]> {
    if (this.cachedRegions) {
      return this.cachedRegions;
    }

    if (typeof window !== "undefined" && window.sessionStorage) {
      const cached = window.sessionStorage.getItem(REGIONS_SESSION_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            this.cachedRegions = parsed as Region[];
            return this.cachedRegions;
          }
        } catch {}
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
      } catch {}

      throw new Error(message);
    }

    const data = (await response.json()) as unknown;

    let regions: Region[] = [];

    if (Array.isArray(data)) {
      if (data.length === 0) {
        regions = [];
      } else if (typeof data[0] === "string") {
        regions = (data as string[]).map((value) => ({ id: value, name: value }));
      } else {
        regions = (data as Array<{ id?: string; name?: string; title?: string }>).map(
          (item, index) => {
            const name =
              typeof item.name === "string"
                ? item.name
                : typeof item.title === "string"
                  ? item.title
                  : String(item);
            const id =
              typeof item.id === "string" && item.id.length > 0
                ? item.id
                : `${index}-${name}`;
            return { id, name };
          },
        );
      }
    }

    regions.sort((a, b) => a.name.localeCompare(b.name, "ru-RU"));

    this.cachedRegions = regions;

    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        window.sessionStorage.setItem(REGIONS_SESSION_KEY, JSON.stringify(regions));
      } catch {}
    }

    return regions;
  }
}

export const regionService = new RegionService();