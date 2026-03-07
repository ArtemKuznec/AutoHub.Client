import { useState, type FC } from "react";
import Header from "../../Components/Header/HeaderComponent";
import "./MainPage.css";

type CarAd = {
  id: number;
  brand: string;
  model: string;
  price: string;
  region: string;
};

type MainPageProps = {
  onCreateAdClick?: () => void;
};

const BRANDS = ["Lada", "BMW", "Mercedez"] as const;

const CAR_ADS: CarAd[] = [
  { id: 1, brand: "Lada", model: "Granta, 2020 г.", price: "650 000 ₽", region: "Омская область" },
  { id: 2, brand: "Lada", model: "Vesta, 2019 г.", price: "780 000 ₽", region: "Новосибирская область" },
  { id: 3, brand: "Lada", model: "XRAY, 2018 г.", price: "720 000 ₽", region: "Тюменская область" },
  { id: 4, brand: "BMW", model: "3 Series, 2017 г.", price: "1 650 000 ₽", region: "Москва" },
  { id: 5, brand: "BMW", model: "5 Series, 2016 г.", price: "1 950 000 ₽", region: "Санкт‑Петербург" },
  { id: 6, brand: "BMW", model: "X3, 2018 г.", price: "2 350 000 ₽", region: "Екатеринбург" },
  { id: 7, brand: "Mercedez", model: "C‑Class, 2016 г.", price: "1 980 000 ₽", region: "Казань" },
  { id: 8, brand: "Mercedez", model: "E‑Class, 2015 г.", price: "2 150 000 ₽", region: "Самара" },
  { id: 9, brand: "Mercedez", model: "GLA, 2019 г.", price: "2 450 000 ₽", region: "Ростов‑на‑Дону" },
  { id: 10, brand: "Lada", model: "Priora, 2013 г.", price: "430 000 ₽", region: "Омская область" },
  { id: 11, brand: "Lada", model: "Kalina, 2012 г.", price: "350 000 ₽", region: "Кемеровская область" },
  { id: 12, brand: "BMW", model: "X5, 2014 г.", price: "2 100 000 ₽", region: "Красноярский край" },
  { id: 13, brand: "BMW", model: "1 Series, 2015 г.", price: "1 150 000 ₽", region: "Новосибирская область" },
  { id: 14, brand: "Mercedez", model: "S‑Class, 2013 г.", price: "2 900 000 ₽", region: "Москва" },
  { id: 15, brand: "Mercedez", model: "CLA, 2017 г.", price: "2 050 000 ₽", region: "Казань" },
  { id: 16, brand: "Lada", model: "Niva Legend, 2021 г.", price: "890 000 ₽", region: "Пермский край" },
  { id: 17, brand: "Lada", model: "Granta, 2021 г.", price: "710 000 ₽", region: "Челябинская область" },
  { id: 18, brand: "BMW", model: "X1, 2019 г.", price: "2 000 000 ₽", region: "Санкт‑Петербург" },
  { id: 19, brand: "Mercedez", model: "GLC, 2018 г.", price: "2 600 000 ₽", region: "Екатеринбург" },
  { id: 20, brand: "Lada", model: "Vesta SW Cross, 2020 г.", price: "980 000 ₽", region: "Омская область" },
];

const MainPage: FC<MainPageProps> = ({ onCreateAdClick }) => {
  const [selectedBrand, setSelectedBrand] = useState<(typeof BRANDS)[number] | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  const filteredAds =
    selectedBrand === null ? CAR_ADS : CAR_ADS.filter((ad) => ad.brand === selectedBrand);

  const visibleAds = filteredAds.slice(0, visibleCount);
  const canShowMore = visibleCount < filteredAds.length;

  return (
    <div className="main-page">
      <Header onCreateAdClick={onCreateAdClick} />

      <main className="main-page-content">
        <section className="main-page-header">
          <h1 className="main-page-title">Поиск авто по маркам</h1>

          <div className="brand-filter">
            {BRANDS.map((brand) => (
              <button
                key={brand}
                type="button"
                className={`brand-filter-button${
                  selectedBrand === brand ? " brand-filter-button--active" : ""
                }`}
                onClick={() =>
                  setSelectedBrand((current) => (current === brand ? null : brand))
                }
              >
                {brand}
              </button>
            ))}
          </div>
        </section>

        <section className="ads-section">
          <div className="ads-list">
            {visibleAds.map((ad) => (
              <article key={ad.id} className="ad-card">
                <div className="ad-card-main">
                  <h2 className="ad-card-title">
                    {ad.brand} {ad.model}
                  </h2>
                  <p className="ad-card-price">{ad.price}</p>
                </div>
                <p className="ad-card-region">{ad.region}</p>
              </article>
            ))}
          </div>

          {canShowMore && (
            <div className="ads-more-wrapper">
              <button
                type="button"
                className="ads-more-button"
                onClick={() => setVisibleCount((count) => count + 10)}
              >
                Показать больше
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MainPage;

