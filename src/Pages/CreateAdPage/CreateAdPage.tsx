import { useEffect, useRef, useState, type FC, type ChangeEvent, type FormEvent } from "react";
import { carAdService, type CreateAdRequest } from "../../Services/carAdService";
import { regionService } from "../../Services/regionService";
import { brandService } from "../../Services/brandService";
import Header from "../../Components/Header/HeaderComponent";
import type {
  CreateAdFormErrors,
  CreateAdFormState,
  CreateAdPageProps,
  SteeringPosition,
  EngineType,
} from "../../types/createAd";
import { CREATE_AD_INITIAL_STATE, COLOR_PRESETS } from "../../constants/createAd";
import { formatPhone } from "../../utils/formatPhone";
import {
  mapSteeringToServer,
  mapBodyTypeToServer,
  mapEngineTypeToServer,
  mapColorToServer,
} from "../../utils/createAdMappers";
import "./CreateAdPage.css";

const CreateAdPage: FC<CreateAdPageProps> = ({ onCreateAdClick }) => {
  const [form, setForm] = useState<CreateAdFormState>(CREATE_AD_INITIAL_STATE);
  const [errors, setErrors] = useState<CreateAdFormErrors>({});
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [regions, setRegions] = useState<string[]>([]);
  const [regionsError, setRegionsError] = useState<string | null>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [openedPhotoIndex, setOpenedPhotoIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (form.photos.length === 0) {
      setPhotoUrls([]);
      return;
    }
    const urls = form.photos.map((file) => URL.createObjectURL(file));
    setPhotoUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [form.photos]);

  const handleChange =
    (field: keyof CreateAdFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = event.target;

      if (target instanceof HTMLInputElement && target.type === "checkbox") {
        setForm((prev) => ({
          ...prev,
          [field]: target.checked,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          [field]: target.value,
        }));
      }
    };

  const handleSteeringChange = (value: SteeringPosition) => {
    setForm((prev) => ({ ...prev, steering: value }));
  };

  const handleEngineTypeChange = (value: EngineType) => {
    setForm((prev) => ({ ...prev, engineType: value }));
  };

  const handleColorSelect = (value: string) => {
    setForm((prev) => ({ ...prev, color: value }));
  };

  const handlePhotosChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setForm((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newFiles],
    }));
    event.target.value = "";
  };

  const handleAddPhotosClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = (index: number) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
    setOpenedPhotoIndex((prev) => {
      if (prev === null) return null;
      if (prev === index) return null;
      return prev > index ? prev - 1 : prev;
    });
  };

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
        console.error("Ошибка при загрузке регионов:", error);
      }
    };

    const loadBrands = async () => {
      try {
        const list = await brandService.getAllBrands();
        if (!isMounted) return;
        setBrands(list);
      } catch (error) {
        if (!isMounted) return;
        setBrandsError("Не удалось загрузить список брендов.");
        console.error("Ошибка при загрузке брендов:", error);
      }
    };

    loadRegions();
    loadBrands();

    return () => {
      isMounted = false;
    };
  }, []);

  const validate = (): boolean => {
    const newErrors: CreateAdFormErrors = {};

    if (!form.vin.trim()) newErrors.vin = "Укажите VIN или номер кузова.";
    if (!form.model.trim()) newErrors.model = "Укажите модель автомобиля.";
    if (!form.steering) newErrors.steering = "Выберите расположение руля.";
    if (!form.bodyType) newErrors.bodyType = "Выберите тип кузова.";

    if (!form.engineVolume.trim()) {
      newErrors.engineVolume = "Укажите объем двигателя.";
    } else {
      const normolizedVolume = Number(form.engineVolume.replace(",", "."));
      if (Number.isNaN(normolizedVolume) || normolizedVolume <= 0) {
        newErrors.engineVolume = "Введите корректный объем двигателя.";
      }
    }

    if (!form.engineType) newErrors.engineType = "Выберите тип двигателя.";

    if (!form.color) newErrors.color = "Выберите цвет автомобиля.";

    if (!form.ownersCount.trim()) {
      newErrors.ownersCount = "Укажите количество владельцев.";
    } else {
      const owners = Number(form.ownersCount);
      if (!Number.isInteger(owners) || owners <= 0) {
        newErrors.ownersCount = "Количество владельцев должно быть положительным целым числом.";
      }
    }

    if (!form.mileage.trim()) {
      newErrors.mileage = "Укажите пробег.";
    } else {
      const mileage = Number(form.mileage);
      if (!Number.isFinite(mileage) || mileage < 0) {
        newErrors.mileage = "Пробег должен быть неотрицательным числом.";
      }
    }

    if (!form.city.trim()) newErrors.city = "Укажите город продажи.";

    const trimmedBrand = form.brand.trim();
    if (!trimmedBrand) {
      newErrors.brand = "Укажите марку автомобиля.";
    } else if (
      brands.length > 0 &&
      !brands.some((brand) => brand.toLowerCase() === trimmedBrand.toLowerCase())
    ) {
      newErrors.brand = "Выберите марку из списка.";
    }

    const trimmedRegion = form.region.trim();
    if (!trimmedRegion) {
      newErrors.region = "не указан регион";
    } else if (
      regions.length > 0 &&
      !regions.some((region) => region.toLowerCase() === trimmedRegion.toLowerCase())
    ) {
      newErrors.region = "Выберите регион из списка.";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Укажите номер телефона.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmittedSuccessfully(false);
    setSubmitError(null);

    if (!validate()) return;

    const body: CreateAdRequest = {
      VinOrBodyNumber: form.vin.trim(),
      StsNumber: form.sts.trim() || null,
      Brand: { id: "", name: form.brand.trim() },
      Model: form.model.trim(),
      SteeringWheelSide: mapSteeringToServer(form.steering),
      BodyType: mapBodyTypeToServer(form.bodyType),
      Generation: form.generation.trim() || null,
      EngineVolume: Number(form.engineVolume.replace(",", ".")),
      EngineType: mapEngineTypeToServer(form.engineType),
      HasGBO: form.hasGbo,
      Color: mapColorToServer(form.color),
      ColorDescription: form.colorDetails.trim() || null,
      OwnersCount: Number(form.ownersCount),
      Mileage: Number(form.mileage),
      HasDocumentIssues: form.hasDocProblems,
      NeedsRepair: form.needsRepair,
      Region: { id: "", name: form.region.trim() },
      City: form.city.trim(),
      PhoneNumber: form.phone.trim(),
    };

    try {
      await carAdService.createAd(body, form.photos);
      setSubmittedSuccessfully(true);
      setForm(CREATE_AD_INITIAL_STATE);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Ошибка при создании объявления.",
      );
      console.error("Ошибка при создании объявления:", error);
    }
  };

  return (
    <div className="create-ad-page">
      <Header onCreateAdClick={onCreateAdClick} />

      <main className="create-ad-main">
        <h1 className="create-ad-title">Создание объявления о продаже авто</h1>

        <form className="create-ad-form" onSubmit={handleSubmit} noValidate>
          <section className="form-block">
            <h2 className="form-block-title">Идентификация автомобиля</h2>

            <div className="form-field">
              <label className="form-label">
                VIN или номер кузова <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.vin ? "form-input--error" : ""}`}
                placeholder="Например, XTA210990Y1234567"
                value={form.vin}
                onChange={handleChange("vin")}
              />
              {errors.vin && <p className="form-error">{errors.vin}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">СТС (свидетельство о регистрации ТС)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Серия и номер СТС"
                value={form.sts}
                onChange={handleChange("sts")}
              />
            </div>
          </section>

          <section className="form-block">
            <h2 className="form-block-title">Основные характеристики</h2>

            <div className="form-grid two-columns">
              <div className="form-field">
                <label className="form-label">
                  Марка <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.brand ? "form-input--error" : ""}`}
                  placeholder="Начните вводить марку"
                  value={form.brand}
                  onChange={handleChange("brand")}
                  list="brand-suggestions"
                />
                <datalist id="brand-suggestions">
                  {brands.map((brand) => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
                {errors.brand && <p className="form-error">{errors.brand}</p>}
                {brandsError && <p className="form-error">{brandsError}</p>}
              </div>

              <div className="form-field">
                <label className="form-label">
                  Модель <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.model ? "form-input--error" : ""}`}
                  placeholder="Например, Vesta"
                  value={form.model}
                  onChange={handleChange("model")}
                />
                {errors.model && <p className="form-error">{errors.model}</p>}
              </div>
            </div>

            <div className="form-grid two-columns">
              <div className="form-field">
                <label className="form-label">
                  Расположение руля <span className="required">*</span>
                </label>
                <div className="toggle-group">
                  <button
                    type="button"
                    className={`toggle-button ${
                      form.steering === "left" ? "toggle-button--active" : ""
                    }`}
                    onClick={() => handleSteeringChange("left")}
                  >
                    Левый
                  </button>
                  <button
                    type="button"
                    className={`toggle-button ${
                      form.steering === "right" ? "toggle-button--active" : ""
                    }`}
                    onClick={() => handleSteeringChange("right")}
                  >
                    Правый
                  </button>
                </div>
                {errors.steering && <p className="form-error">{errors.steering}</p>}
              </div>

              <div className="form-field">
                <label className="form-label">
                  Тип кузова <span className="required">*</span>
                </label>
                <select
                  className={`form-select ${errors.bodyType ? "form-input--error" : ""}`}
                  value={form.bodyType}
                  onChange={handleChange("bodyType")}
                >
                  <option value="">Выберите тип кузова</option>
                  <option value="sedan">Седан</option>
                  <option value="hatchback">Хэтчбек</option>
                  <option value="suv">Внедорожник</option>
                  <option value="wagon">Универсал</option>
                </select>
                {errors.bodyType && <p className="form-error">{errors.bodyType}</p>}
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Поколение</label>
              <input
                type="text"
                className="form-input"
                placeholder="I, II, III или год начала выпуска"
                value={form.generation}
                onChange={handleChange("generation")}
              />
            </div>
          </section>

          <section className="form-block">
            <h2 className="form-block-title">Силовой агрегат</h2>

            <div className="form-grid two-columns">
              <div className="form-field">
                <label className="form-label">
                  Объем двигателя, л <span className="required">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className={`form-input ${errors.engineVolume ? "form-input--error" : ""}`}
                  placeholder="Например, 1.6"
                  value={form.engineVolume}
                  onChange={handleChange("engineVolume")}
                />
                {errors.engineVolume && <p className="form-error">{errors.engineVolume}</p>}
              </div>

              <div className="form-field">
                <label className="form-label">
                  Тип двигателя <span className="required">*</span>
                </label>
                <div className="toggle-group">
                  <button
                    type="button"
                    className={`toggle-button ${
                      form.engineType === "petrol" ? "toggle-button--active" : ""
                    }`}
                    onClick={() => handleEngineTypeChange("petrol")}
                  >
                    Бензин
                  </button>
                  <button
                    type="button"
                    className={`toggle-button ${
                      form.engineType === "diesel" ? "toggle-button--active" : ""
                    }`}
                    onClick={() => handleEngineTypeChange("diesel")}
                  >
                    Дизель
                  </button>
                </div>
                {errors.engineType && <p className="form-error">{errors.engineType}</p>}
              </div>
            </div>

            <div className="form-field form-field--checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.hasGbo}
                  onChange={handleChange("hasGbo")}
                />
                <span>Есть ГБО (газобаллонное оборудование)</span>
              </label>
            </div>
          </section>

          <section className="form-block">
            <h2 className="form-block-title">Внешний вид и состояние</h2>

            <div className="form-field">
              <label className="form-label">
                Цвет <span className="required">*</span>
              </label>
              <div className="color-picker">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`color-dot ${
                      form.color === color.value ? "color-dot--selected" : ""
                    }`}
                    style={{ backgroundColor: color.cssColor }}
                    onClick={() => handleColorSelect(color.value)}
                    aria-label={color.label}
                    title={color.label}
                  />
                ))}
              </div>
              {form.color && (
                <p className="color-hint">
                  Выбранный цвет:{" "}
                  {COLOR_PRESETS.find((c) => c.value === form.color)?.label ?? form.color}
                </p>
              )}
              {errors.color && <p className="form-error">{errors.color}</p>}

            </div>

            <div className="form-grid two-columns">
              <div className="form-field">
                <label className="form-label">
                  Количество владельцев <span className="required">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className={`form-input ${errors.ownersCount ? "form-input--error" : ""}`}
                  placeholder="Например, 1"
                  value={form.ownersCount}
                  onChange={handleChange("ownersCount")}
                />
                {errors.ownersCount && <p className="form-error">{errors.ownersCount}</p>}
              </div>

              <div className="form-field">
                <label className="form-label">
                  Пробег, км <span className="required">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className={`form-input ${errors.mileage ? "form-input--error" : ""}`}
                  placeholder="Например, 125000"
                  value={form.mileage}
                  onChange={handleChange("mileage")}
                />
                {errors.mileage && <p className="form-error">{errors.mileage}</p>}
              </div>
            </div>
          </section>

          <section className="form-block">
            <h2 className="form-block-title">Юридическая информация и контакты</h2>

            <div className="form-field form-field--checkbox-group">
              <label className="form-label">Статус документов и авто</label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.hasDocProblems}
                  onChange={handleChange("hasDocProblems")}
                />
                <span>Документы с проблемами или отсутствуют</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.needsRepair}
                  onChange={handleChange("needsRepair")}
                />
                <span>Требуется ремонт или не на ходу</span>
              </label>
            </div>

            <div className="form-grid two-columns">
              <div className="form-field">
                <label className="form-label">
                  Город продажи <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.city ? "form-input--error" : ""}`}
                  placeholder="Например, Омск"
                  value={form.city}
                  onChange={handleChange("city")}
                />
                {errors.city && <p className="form-error">{errors.city}</p>}
              </div>

              <div className="form-field">
                <label className="form-label">
                  Регион продажи <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.region ? "form-input--error" : ""}`}
                  placeholder="Начните вводить регион"
                  value={form.region}
                  onChange={handleChange("region")}
                  list="region-suggestions"
                />
                <datalist id="region-suggestions">
                  {regions.map((region) => (
                    <option key={region} value={region} />
                  ))}
                </datalist>
                {errors.region && <p className="form-error">{errors.region}</p>}
                {regionsError && <p className="form-error">{regionsError}</p>}
              </div>

              <div className="form-field">
                <label className="form-label">
                  Телефон <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  className={`form-input ${errors.phone ? "form-input--error" : ""}`}
                  placeholder="+7 (___) ___-__-__"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: formatPhone(event.target.value) }))
                  }
                />
                {errors.phone && <p className="form-error">{errors.phone}</p>}
              </div>
            </div>
          </section>

          <section className="form-block">
            <h2 className="form-block-title">Фотографии</h2>
            <div className="form-field">
              <label className="form-label">Добавьте фотографии автомобиля</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotosChange}
                className="form-file-input form-file-input--hidden"
                aria-label="Выберите фотографии"
              />
              <button
                type="button"
                className="form-file-button"
                onClick={handleAddPhotosClick}
              >
                Выбрать фотографии
              </button>
              {form.photos.length > 0 && (
                <div className="photos-thumbnails">
                  {form.photos.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="photos-thumbnail-wrap">
                      <button
                        type="button"
                        className="photos-thumbnail-remove"
                        onClick={() => handleRemovePhoto(index)}
                        aria-label="Удалить фото"
                      >
                        ×
                      </button>
                      <button
                        type="button"
                        className="photos-thumbnail"
                        onClick={() => setOpenedPhotoIndex(index)}
                      >
                        {photoUrls[index] ? (
                          <img
                            src={photoUrls[index]}
                            alt={file.name}
                            className="photos-thumbnail-img"
                          />
                        ) : (
                          <span className="photos-thumbnail-placeholder">...</span>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            {openedPhotoIndex !== null && photoUrls[openedPhotoIndex] && (
              <div
                className="photos-modal-overlay"
                onClick={() => setOpenedPhotoIndex(null)}
                role="dialog"
                aria-modal="true"
                aria-label="Просмотр фото"
              >
                <button
                  type="button"
                  className="photos-modal-close"
                  onClick={() => setOpenedPhotoIndex(null)}
                  aria-label="Закрыть"
                >
                  ×
                </button>
                <img
                  src={photoUrls[openedPhotoIndex]}
                  alt={form.photos[openedPhotoIndex]?.name ?? "Фото"}
                  className="photos-modal-img"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            </div>
          </section>

          <div className="form-submit-wrapper">
            <button type="submit" className="submit-button">
              Создать объявление
            </button>
            {submittedSuccessfully && (
              <p className="submit-success">
                Объявление успешно создано.
              </p>
            )}
            {submitError && <p className="submit-error">{submitError}</p>}
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateAdPage;

