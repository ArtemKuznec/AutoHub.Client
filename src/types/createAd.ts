export type SteeringPosition = "left" | "right" | "";
export type BodyType = "sedan" | "hatchback" | "suv" | "wagon" | "";
export type EngineType = "diesel" | "petrol" | "";

export type CreateAdFormState = {
  vin: string;
  sts: string;
  brand: string;
  model: string;
  steering: SteeringPosition;
  bodyType: BodyType;
  generation: string;
  engineVolume: string;
  engineType: EngineType;
  hasGbo: boolean;
  color: string;
  colorDetails: string;
  price: string;
  ownersCount: string;
  mileage: string;
  hasDocProblems: boolean;
  needsRepair: boolean;
  region: string;
  city: string;
  phone: string;
  photos: File[];
};

export type CreateAdFormErrors = Partial<Record<keyof CreateAdFormState, string>>;

export type CreateAdPageProps = {
  onCreateAdClick?: () => void;
  onGoHomeClick?: () => void;
};

export type ColorPreset = {
  value: string;
  label: string;
  cssColor: string;
};
