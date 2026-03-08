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
  OwnersCount: number;
  Mileage: number;
  HasDocumentIssues: boolean;
  NeedsRepair: boolean;
  Region: NamedEntityRef;
  City: string;
  PhoneNumber: string;
};

export class CarAdService {
  private readonly baseUrl: string;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? {
      'Authorization': `Bearer ${token}`
    } : {};
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
    if (request.ColorDescription != null) formData.append("ColorDescription", request.ColorDescription);
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
        'Authorization': `Bearer ${token}`
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
      } catch {
      }

      throw new Error(message);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

}

export const carAdService = new CarAdService();

