export type SteeringWheelSide = 1 | 2; // 1 = Left, 2 = Right

export type BodyType = 1 | 2 | 3 | 4; // 1 = Sedan, 2 = Hatchback, 3 = Suv, 4 = Wagon

export type CarColor =
  | 1 // White
  | 2 // Black
  | 3 // Silver
  | 4 // Gray
  | 5 // Red
  | 6 // Blue
  | 7 // Green
  | 8 // Yellow
  | 9 // Brown
  | 10 // Beige
  | 11 // Gold
  | 12 // Orange
  | 13 // Purple
  | 14 // Pink
  | 15 // LightBlue
  | 99; // Other

export type EngineType = 1 | 2; // 1 = Petrol, 2 = Diesel

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

const DEFAULT_BASE_URL = "https://localhost:7194/api";

export class CarAdService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = DEFAULT_BASE_URL) {
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

