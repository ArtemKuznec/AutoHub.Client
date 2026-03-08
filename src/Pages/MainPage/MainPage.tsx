import { useState, type FC } from "react";
import Header from "../../Components/Header/HeaderComponent";
import type { MainPageProps } from "../../types/mainPage";
import { MAIN_PAGE_BRANDS, MAIN_PAGE_CAR_ADS } from "../../constants/mainPage";
import "./MainPage.css";

const MainPage: FC<MainPageProps> = ({ onCreateAdClick }) => {
  const [selectedBrand, setSelectedBrand] = useState<(typeof MAIN_PAGE_BRANDS)[number] | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  const filteredAds =
    selectedBrand === null
      ? MAIN_PAGE_CAR_ADS
      : MAIN_PAGE_CAR_ADS.filter((ad) => ad.brand === selectedBrand);

  const visibleAds = filteredAds.slice(0, visibleCount);
  const canShowMore = visibleCount < filteredAds.length;

  return (
    <div className="main-page">
      <Header onCreateAdClick={onCreateAdClick} />

      <main className="main-page-content">
        <section className="main-page-header">
          <h1 className="main-page-title">Поиск авто по маркам</h1>

          <div className="brand-filter">
            {MAIN_PAGE_BRANDS.map((brand) => (
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

