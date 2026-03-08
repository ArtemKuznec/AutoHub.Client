import type {
  SteeringWheelSide,
  BodyType,
  EngineType,
  CarColor,
} from "../Services/carAdService";
import type { SteeringPosition, BodyType as BodyTypeForm, EngineType as EngineTypeForm } from "../types/createAd";

export function mapSteeringToServer(value: SteeringPosition): SteeringWheelSide {
  return value === "left" ? 1 : 2;
}

export function mapBodyTypeToServer(value: BodyTypeForm): BodyType {
  switch (value) {
    case "sedan":
      return 1;
    case "hatchback":
      return 2;
    case "suv":
      return 3;
    case "wagon":
    default:
      return 4;
  }
}

export function mapEngineTypeToServer(value: EngineTypeForm): EngineType {
  return value === "diesel" ? 2 : 1;
}

export function mapColorToServer(value: string): CarColor {
  switch (value) {
    case "white":
      return 1;
    case "black":
      return 2;
    case "silver":
      return 3;
    case "gray":
      return 4;
    case "red":
      return 5;
    case "blue":
      return 6;
    case "green":
      return 7;
    case "yellow":
      return 8;
    case "brown":
      return 9;
    case "beige":
      return 10;
    case "gold":
      return 11;
    case "orange":
      return 12;
    case "purple":
      return 13;
    case "pink":
      return 14;
    case "lightBlue":
      return 15;
    default:
      return 99;
  }
}
