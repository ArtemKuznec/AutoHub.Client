import { useEffect, useState, type FC } from "react";
import Header from "../../Components/Header/HeaderComponent";
import { carAdService, type CarAdDetails } from "../../Services/carAdService";
import "./MyAdsPage.css";

type StatusFilter = "all" | "active" | "inactive" | "sold" | "underReview" | "rejected";

const statusMap: { key: StatusFilter; label: string; value: number | null }[] = [
  { key: "all", label: "Все", value: null },
  { key: "active", label: "Активно", value: 1 },
  { key: "inactive", label: "Неактивно", value: 2 },
  { key: "sold", label: "Продано", value: 3 },
  { key: "underReview", label: "На модерации", value: 4 },
  { key: "rejected", label: "Отклонено", value: 5 },
];

const MyAdsPage: FC = () => {
  const [ads, setAds] = useState<CarAdDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await carAdService.getUserAds();
        if (!isMounted) return;
        setAds(items);
      } catch (e) {
        if (!isMounted) return;
        setError(e instanceof Error ? e.message : "Не удалось загрузить ваши объявления.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Удалить это объявление?");
    if (!confirmed) return;

    try {
      await carAdService.deleteAd(id);
      setAds((prev) => prev.filter((ad) => ad.id !== id));
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "Не удалось удалить объявление. Попробуйте позже.",
      );
    }
  };

  const currentStatusValue =
    statusMap.find((s) => s.key === statusFilter)?.value ?? null;

  const filteredAds =
    currentStatusValue == null
      ? ads
      : ads.filter((ad) => Number(ad.status) === currentStatusValue);

  return (
    <div className="my-ads-page">
      <Header />

      <main className="my-ads-main">
        <h1 className="my-ads-title">Мои объявления</h1>

        <div className="my-ads-layout">
          <aside className="my-ads-sidebar">
            <ul className="my-ads-status-list">
              {statusMap.map((status) => (
                <li key={status.key}>
                  <button
                    type="button"
                    className={`my-ads-status-button${
                      statusFilter === status.key ? " my-ads-status-button--active" : ""
                    }`}
                    onClick={() => setStatusFilter(status.key)}
                  >
                    {status.label}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="my-ads-content">
            {isLoading && <p className="my-ads-message">Загрузка объявлений...</p>}
            {error && <p className="my-ads-message my-ads-message--error">{error}</p>}

            {!isLoading && !error && filteredAds.length === 0 && (
              <p className="my-ads-message">У вас пока нет объявлений.</p>
            )}

            <div className="my-ads-list">
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
                      <p className="ad-card-region">
                        {ad.region}
                        {ad.city ? `, ${ad.city}` : ""}
                      </p>
                      <div className="ad-card-meta">
                        <span className="ad-card-meta-item">
                          Пробег: {ad.mileage.toLocaleString("ru-RU")} км
                        </span>
                        {ad.steeringWheelSide && (
                          <span className="ad-card-meta-item">
                            Руль: {ad.steeringWheelSide === 1 ? "левый" : "правый"}
                          </span>
                        )}
                        {ad.ownersCount > 0 && (
                          <span className="ad-card-meta-item">
                            Владельцев: {ad.ownersCount}
                          </span>
                        )}
                      </div>
                      {(ad.hasDocumentIssues || ad.needsRepair) && (
                        <p className="ad-card-issues">
                          {[
                            ad.hasDocumentIssues ? "Проблемы с документами" : null,
                            ad.needsRepair ? "Требуется ремонт" : null,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      )}
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
                  <div className="my-ads-card-footer">
                    <span className="my-ads-status-badge">
                      {
                        statusMap.find((s) => s.value === Number(ad.status))?.label ??
                        "Неизвестно"
                      }
                    </span>
                    <button
                      type="button"
                      className="my-ads-delete-button"
                      onClick={() => handleDelete(ad.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MyAdsPage;

