export type CarAd = {
  id: number;
  brand: string;
  model: string;
  price: string;
  region: string;
};

export type MainPageProps = {
  onCreateAdClick?: () => void;
};
