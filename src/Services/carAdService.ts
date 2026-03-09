import { API_BASE_URL } from "../config/api";

export type SteeringWheelSide = 1 | 2;

export type BodyType = 1 | 2 | 3 | 4;

export type CarColor =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 99;

export type EngineType = 1 | 2;

export type NamedEntityRef = {
  id: string;
  name: string;
};

export type CreateAdRequest = {
  VinOrBodyNumber: string;
  StsNumber: string | null;
  Brand: NamedEntityRef;
  Model: string;
  SteeringWheelSide: SteeringWheelSide;
  BodyType: BodyType;
  Generation: string | null;
  EngineVolume: number;
  EngineType: EngineType;
  HasGBO: boolean;
  Color: CarColor;
  ColorDescription: string | null;
  Price: number;
  OwnersCount: number;
  Mileage: number;
  HasDocumentIssues: boolean;
  NeedsRepair: boolean;
  Region: NamedEntityRef;
  City: string;
  PhoneNumber: string;
};

export type CarAdDetails = {
  id: string;
  brand: string;
  model: string;
  generation: string | null;
  bodyType: string;
  engineVolume: number;
  engineType: number;
  mileage: number;
  price: number;
  ownersCount: number;
  steeringWheelSide: number | null;
  hasDocumentIssues: boolean;
  needsRepair: boolean;
  region: string;
  city: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string | null;
  status: string | number;
  linkedPhoto: string | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  regionId: string | null;
};

export class CarAdService {
  private readonly baseUrl: string;
  private readonly TOKEN_KEY = "auth_token";

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  }

  async createAd(request: CreateAdRequest, photos: File[] = []): Promise<void> {
    const token = this.getToken();

    if (!token) {
      throw new Error("Токен авторизации отсутствует. Пожалуйста, выполните вход.");
    }

    const formData = new FormData();

    formData.append("VinOrBodyNumber", request.VinOrBodyNumber);
    if (request.StsNumber != null) formData.append("StsNumber", request.StsNumber);
    formData.append("Brand.Id", request.Brand.id);
    formData.append("Brand.Name", request.Brand.name);
    formData.append("Model", request.Model);
    formData.append("SteeringWheelSide", String(request.SteeringWheelSide));
    formData.append("BodyType", String(request.BodyType));
    if (request.Generation != null) formData.append("Generation", request.Generation);
    formData.append("EngineVolume", request.EngineVolume.toString().replace(".", ","));
    formData.append("EngineType", String(request.EngineType));
    formData.append("HasGBO", String(request.HasGBO));
    formData.append("Color", String(request.Color));
    if (request.ColorDescription != null)
      formData.append("ColorDescription", request.ColorDescription);
    formData.append("Price", String(request.Price));
    formData.append("OwnersCount", String(request.OwnersCount));
    formData.append("Mileage", String(request.Mileage));
    formData.append("HasDocumentIssues", String(request.HasDocumentIssues));
    formData.append("NeedsRepair", String(request.NeedsRepair));
    formData.append("Region.Id", request.Region.id);
    formData.append("Region.Name", request.Region.name);
    formData.append("City", request.City);
    formData.append("PhoneNumber", request.PhoneNumber);

    photos.forEach((photo) => {
      formData.append("LinkedPhotos", photo);
    });

    const response = await fetch(`${this.baseUrl}/cars`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem(this.TOKEN_KEY);
        throw new Error("Сессия истекла. Пожалуйста, выполните вход заново.");
      }

      let message = `Не удалось создать объявление. Код статуса: ${response.status}`;
      try {
        const errorData = await response.text();
        if (errorData) {
          message = errorData;
        }
      } catch {}

      throw new Error(message);
    }
  }

  async getAds(
    page: number = 1,
    pageSize: number = 2,
    regionId: string | null = null,
  ): Promise<PaginatedResponse<CarAdDetails>> {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("pageSize", String(pageSize));

    if (regionId && regionId.trim().length > 0) {
      params.append("regionId", regionId.trim());
    }

    const response = await fetch(`${this.baseUrl}/cars?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let message = `Не удалось получить объявления. Код статуса: ${response.status}`;

      try {
        const text = await response.text();
        if (text) {
          message = text;
        }
      } catch {}

      throw new Error(message);
    }

    const raw = (await response.json()) as any;

    const items: CarAdDetails[] = (raw.items ?? raw.Items ?? []).map((item: any) => ({
      id: item.id ?? item.Id ?? "",
      brand: item.brand ?? item.Brand ?? "",
      model: item.model ?? item.Model ?? "",
      generation: item.generation ?? item.Generation ?? null,
      bodyType: item.bodyType ?? item.BodyType ?? "",
      engineVolume: item.engineVolume ?? item.EngineVolume ?? 0,
      engineType: item.engineType ?? item.EngineType ?? 0,
      mileage: item.mileage ?? item.Mileage ?? 0,
      price: item.price ?? item.Price ?? 0,
      ownersCount: item.ownersCount ?? item.OwnersCount ?? 0,
      steeringWheelSide: item.steeringWheelSide ?? item.SteeringWheelSide ?? null,
      hasDocumentIssues: item.hasDocumentIssues ?? item.HasDocumentIssues ?? false,
      needsRepair: item.needsRepair ?? item.NeedsRepair ?? false,
      region: item.region ?? item.Region ?? "",
      city: item.city ?? item.City ?? "",
      creatorId: item.creatorId ?? item.CreatorId ?? "",
      createdAt: item.createdAt ?? item.CreatedAt ?? "",
      updatedAt: item.updatedAt ?? item.UpdatedAt ?? null,
      status: item.status ?? item.Status ?? "",
      linkedPhoto: item.linkedPhoto ?? item.LinkedPhoto ?? null,
    }));

    const data: PaginatedResponse<CarAdDetails> = {
      items,
      page: raw.page ?? raw.Page ?? page,
      pageSize: raw.pageSize ?? raw.PageSize ?? pageSize,
      totalCount: raw.totalCount ?? raw.TotalCount ?? items.length,
      totalPages: raw.totalPages ?? raw.TotalPages ?? 1,
      hasPrevious: raw.hasPrevious ?? raw.HasPrevious ?? (page > 1),
      hasNext: raw.hasNext ?? raw.HasNext ?? (raw.page ?? raw.Page ?? 1) < (raw.totalPages ?? raw.TotalPages ?? 1),
      regionId: raw.regionId ?? raw.RegionId ?? regionId,
    };

    return data;
  }

  async getUserAds(): Promise<CarAdDetails[]> {
    const token = this.getToken();
    if (!token) {
      throw new Error("Токен авторизации отсутствует. Пожалуйста, выполните вход.");
    }

    const response = await fetch(`${this.baseUrl}/cars/user/ads`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let message = `Не удалось получить ваши объявления. Код статуса: ${response.status}`;
      try {
        const text = await response.text();
        if (text) {
          message = text;
        }
      } catch {}
      throw new Error(message);
    }

    const raw = (await response.json()) as any;
    const itemsSource = Array.isArray(raw) ? raw : raw.items ?? raw.Items ?? [];

    const items: CarAdDetails[] = itemsSource.map((item: any) => ({
      id: item.id ?? item.Id ?? "",
      brand: item.brand ?? item.Brand ?? "",
      model: item.model ?? item.Model ?? "",
      generation: item.generation ?? item.Generation ?? null,
      bodyType: item.bodyType ?? item.BodyType ?? "",
      engineVolume: item.engineVolume ?? item.EngineVolume ?? 0,
      engineType: item.engineType ?? item.EngineType ?? 0,
      mileage: item.mileage ?? item.Mileage ?? 0,
      price: item.price ?? item.Price ?? 0,
      ownersCount: item.ownersCount ?? item.OwnersCount ?? 0,
      steeringWheelSide: item.steeringWheelSide ?? item.SteeringWheelSide ?? null,
      hasDocumentIssues: item.hasDocumentIssues ?? item.HasDocumentIssues ?? false,
      needsRepair: item.needsRepair ?? item.NeedsRepair ?? false,
      region: item.region ?? item.Region ?? "",
      city: item.city ?? item.City ?? "",
      creatorId: item.creatorId ?? item.CreatorId ?? "",
      createdAt: item.createdAt ?? item.CreatedAt ?? "",
      updatedAt: item.updatedAt ?? item.UpdatedAt ?? null,
      status: item.status ?? item.Status ?? "",
      linkedPhoto: item.linkedPhoto ?? item.LinkedPhoto ?? null,
    }));

    return items;
  }

  async deleteAd(id: string): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error("Токен авторизации отсутствует. Пожалуйста, выполните вход.");
    }

    const response = await fetch(`${this.baseUrl}/cars/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let message = `Не удалось удалить объявление. Код статуса: ${response.status}`;
      try {
        const text = await response.text();
        if (text) {
          message = text;
        }
      } catch {}
      throw new Error(message);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const carAdService = new CarAdService();
