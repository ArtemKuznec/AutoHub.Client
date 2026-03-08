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
  Make: string;
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
  Brand: NamedEntityRef;
  Region: NamedEntityRef;
  City: string;
  PhoneNumber: string;
};

export class CarAdService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async createAd(request: CreateAdRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/cars`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let message = `Не удалось создать объявление. Код статуса: ${response.status}`;

      try {
        const text = await response.text();
        if (text) {
          message = text;
        }
      } catch {
        
      }

      throw new Error(message);
    }
  }
}

export const carAdService = new CarAdService();

