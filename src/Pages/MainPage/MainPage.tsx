import { useEffect, useState, type FC } from "react";
import Header from "../../Components/Header/HeaderComponent";
import type { MainPageProps } from "../../types/mainPage";
import { regionService, type Region } from "../../Services/regionService";
import { brandService } from "../../Services/brandService";
import { carAdService, type CarAdDetails } from "../../Services/carAdService";
import "./MainPage.css";

const MainPage: FC<MainPageProps> = ({ onCreateAdClick }) => {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [brands, setBrands] = useState<string[]>([]);
  const [ads, setAds] = useState<CarAdDetails[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingAds, setIsLoadingAds] = useState(false);
  const [adsError, setAdsError] = useState<string | null>(null);
  const [regionsError, setRegionsError] = useState<string | null>(null);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [showAllBrands, setShowAllBrands] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadRegions = async () => {
      try {
        const list = await regionService.getAllRegions();
        if (!isMounted) return;
        setRegions(list);
      } catch (error) {
        if (!isMounted) return;
        setRegionsError("Не удалось загрузить список регионов.");
        console.error("Ошибка при загрузке регионов на главной странице:", error);
      }
    };
    const loadBrands = async () => {
      try {
        const list = await brandService.getAllBrands();
        if (!isMounted) return;
        setBrands(list);
      } catch (error) {
        if (!isMounted) return;
        setBrandsError("Не удалось загрузить список марок.");
        console.error("Ошибка при загрузке марок на главной странице:", error);
      }
    };

    void loadRegions();
    void loadBrands();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadAds = async (pageToLoad: number, regionId: string) => {
    setIsLoadingAds(true);
    setAdsError(null);

    try {
      const response = await carAdService.getAds(
        pageToLoad,
        2,
        regionId && regionId.trim().length > 0 ? regionId : null,
      );
      setAds((prev) => (pageToLoad === 1 ? response.items : [...prev, ...response.items]));
      setPage(response.page);
      setHasNextPage(response.hasNext);
    } catch (error) {
      setAdsError("Не удалось загрузить объявления.");
      console.error("Ошибка при загрузке объявлений:", error);
    } finally {
      setIsLoadingAds(false);
    }
  };

  useEffect(() => {
    setAds([]);
    setPage(1);
    setHasNextPage(false);
    void loadAds(1, selectedRegionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegionId]);

  const filteredAds =
    selectedBrand === null
      ? ads
      : ads.filter((ad) => ad.brand === selectedBrand);

  const visibleBrands = showAllBrands ? brands : brands.slice(0, 10);

  return (
    <div className="main-page">
      <Header
        onCreateAdClick={onCreateAdClick}
        regions={regions}
        regionId={selectedRegionId}
        onRegionChange={(value) => setSelectedRegionId(value)}
      />

      <main className="main-page-content">
        <section className="main-page-header">
          <h1 className="main-page-title">Поиск авто по маркам</h1>

          <div className="brand-filter">
            <button
              type="button"
              className={`brand-filter-button${selectedBrand === null ? " brand-filter-button--active" : ""}`}
              onClick={() => setSelectedBrand(null)}
            >
              Все марки
            </button>
            {visibleBrands.map((brand) => (
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
            {brands.length > 10 && (
              <button
                type="button"
                className="brand-filter-button"
                onClick={() => setShowAllBrands((current) => !current)}
              >
                {showAllBrands ? "Свернуть марки" : "Показать все марки"}
              </button>
            )}
          </div>

          {brandsError && <p className="ads-error">{brandsError}</p>}
        </section>

        <section className="ads-section">
          <div className="ads-list">
            {filteredAds.map((ad) => (
              <article key={ad.id} className="ad-card">
                <div className="ad-card-main">
                  <div className="ad-card-info">
                    <h2 className="ad-card-title">
                      {ad.brand} {ad.model}
                    </h2>
                    <p className="ad-card-price">
                      {ad.price.toLocaleString("ru-RU")} ₽
                    </p>
                    <div className="ad-card-meta">
                      <span className="ad-card-meta-item">
                        Пробег: {ad.mileage.toLocaleString("ru-RU")} км
                      </span>
                      
                       <div className="ad-card-meta-section">
                          <span className="ad-card-meta-item">
                            Руль: {ad.steeringWheelSide === 1 ? "левый" : "правый"}
                          </span>
                        
                        {ad.ownersCount > 0 && (
                          <span className="ad-card-meta-item">
                            Владельцев: {ad.ownersCount}
                          </span>
                        )}
                        </div> 
                    </div>
                   
                        {ad.hasDocumentIssues && (<p className="ad-card-issues">• Проблемы с документами</p>)}
                        {ad.needsRepair && (<p className="ad-card-issues">• Требуется ремонт</p>)}
                    
                    
                     <p className="ad-card-region">
                      {ad.region}
                      {ad.city ? `, ${ad.city}` : ""}
                    </p>
                  </div>
                  <div className="ad-card-photo-wrapper">
                    {ad.linkedPhoto ? (
                      <img
                        src={ad.linkedPhoto}
                        alt={`${ad.brand} ${ad.model}`}
                        className="ad-card-photo"
                      />
                    ) : (
                      <div className="ad-card-photo-placeholder">Без фото</div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {adsError && <p className="ads-error">{adsError}</p>}

          {isLoadingAds && ads.length === 0 && <p className="ads-loading">Загрузка объявлений...</p>}

          {hasNextPage && (
            <div className="ads-more-wrapper">
              <button
                type="button"
                className="ads-more-button"
                onClick={() => {
                  if (!isLoadingAds) {
                    void loadAds(page + 1, selectedRegionId);
                  }
                }}
                disabled={isLoadingAds}
              >
                {isLoadingAds ? "Загрузка..." : "Показать больше"}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MainPage;

