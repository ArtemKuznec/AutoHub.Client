import { useState, type FC, type ChangeEvent, type FormEvent } from "react";
import {
  carAdService,
  type BodyType as BodyTypeServer,
  type CarColor as CarColorServer,
  type CreateAdRequest,
  type EngineType as EngineTypeServer,
  type SteeringWheelSide as SteeringWheelSideServer,
} from "../../Services/carAdService";
import Header from "../../Components/Header/HeaderComponent";
import "./CreateAdPage.css";

type SteeringPosition = "left" | "right" | "";
type BodyType = "sedan" | "hatchback" | "suv" | "wagon" | "";
type EngineType = "diesel" | "petrol" | "";

type CreateAdFormState = {
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
  ownersCount: string;
  mileage: string;
  hasDocProblems: boolean;
  needsRepair: boolean;
  city: string;
  phone: string;
  photos: File[];
};

type CreateAdFormErrors = Partial<Record<keyof CreateAdFormState, string>>;

type CreateAdPageProps = {
  onCreateAdClick?: () => void;
  onGoHomeClick?: () => void;
};

const INITIAL_STATE: CreateAdFormState = {
  vin: "",
  sts: "",
  brand: "",
  model: "",
  steering: "",
  bodyType: "",
  generation: "",
  engineVolume: "",
  engineType: "",
  hasGbo: false,
  color: "",
  colorDetails: "",
  ownersCount: "",
  mileage: "",
  hasDocProblems: false,
  needsRepair: false,
  city: "",
  phone: "",
  photos: [],
};

const COLOR_PRESETS: { value: string; label: string; cssColor: string }[] = [
  { value: "red", label: "Красный", cssColor: "#ef4444" },
  { value: "blue", label: "Синий", cssColor: "#3b82f6" },
  { value: "black", label: "Черный", cssColor: "#111827" },
  { value: "white", label: "Белый", cssColor: "#f9fafb" },
  { value: "silver", label: "Серебристый", cssColor: "#d1d5db" },
  { value: "gray", label: "Серый", cssColor: "#6b7280" },
];

const formatPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, "");

  let value = "+7";
  let index = 0;

  if (digits.startsWith("7")) {
    index = 1;
  } else if (digits.startsWith("8")) {
    index = 1;
  }

  const rest = digits.slice(index);

  if (rest.length > 0) {
    value += " (" + rest.slice(0, 3);
  }
  if (rest.length >= 3) {
    value += ") ";
  }
  if (rest.length > 3) {
    value += rest.slice(3, 6);
  }
  if (rest.length >= 6) {
    value += "-" + rest.slice(6, 8);
  }
  if (rest.length >= 8) {
    value += "-" + rest.slice(8, 10);
  }

  return value;
};

const CreateAdPage: FC<CreateAdPageProps> = ({ onCreateAdClick }) => {
  const [form, setForm] = useState<CreateAdFormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<CreateAdFormErrors>({});
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    if (!files) return;

    setForm((prev) => ({
      ...prev,
      photos: Array.from(files),
    }));
  };

  const validate = (): boolean => {
    const newErrors: CreateAdFormErrors = {};

    if (!form.vin.trim()) newErrors.vin = "Укажите VIN или номер кузова.";
    if (!form.brand.trim()) newErrors.brand = "Укажите марку автомобиля.";
    if (!form.model.trim()) newErrors.model = "Укажите модель автомобиля.";
    if (!form.steering) newErrors.steering = "Выберите расположение руля.";
    if (!form.bodyType) newErrors.bodyType = "Выберите тип кузова.";

    if (!form.engineVolume.trim()) {
      newErrors.engineVolume = "Укажите объем двигателя.";
    } else {
      const volume = Number(form.engineVolume.replace(",", "."));
      if (Number.isNaN(volume) || volume <= 0) {
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

    const mapSteeringToServer = (value: SteeringPosition): SteeringWheelSideServer => {
      return value === "left" ? 1 : 2;
    };

    const mapBodyTypeToServer = (value: BodyType): BodyTypeServer => {
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
    };

    const mapEngineTypeToServer = (value: EngineType): EngineTypeServer => {
      return value === "diesel" ? 2 : 1;
    };

    const mapColorToServer = (value: string): CarColorServer => {
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
        default:
          return 99;
      }
    };

    const body: CreateAdRequest = {
      VinOrBodyNumber: form.vin.trim(),
      StsNumber: form.sts.trim() || null,
      Make: form.brand.trim(),
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
      City: form.city.trim(),
      PhoneNumber: form.phone.trim(),
    };

    try {
      await carAdService.createAd(body);
      setSubmittedSuccessfully(true);
      setForm(INITIAL_STATE);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Ошибка при создании объявления.",
      );
      // eslint-disable-next-line no-console
      console.error("Ошибка при создании объявления:", error);
    }
  };

  return (
    <div className="create-ad-page">
      <Header onCreateAdClick={onCreateAdClick} />

      <main className="create-ad-main">
        <h1 className="create-ad-title">Создание объявления о продаже авто</h1>

        <form className="create-ad-form" onSubmit={handleSubmit} noValidate>
          {/* Блок 1: Идентификация автомобиля */}
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

          {/* Блок 2: Основные характеристики */}
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
                  placeholder="Например, Lada"
                  value={form.brand}
                  onChange={handleChange("brand")}
                />
                {errors.brand && <p className="form-error">{errors.brand}</p>}
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

          {/* Блок 3: Силовой агрегат */}
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

          {/* Блок 4: Внешний вид и состояние */}
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
                  />
                ))}
              </div>
              {errors.color && <p className="form-error">{errors.color}</p>}

              <input
                type="text"
                className="form-input form-input--inline"
                placeholder="Уточните оттенок, например: темно-синий металлик"
                value={form.colorDetails}
                onChange={handleChange("colorDetails")}
              />
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

          {/* Блок 5: Юридическая информация и контакты */}
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
                  list="city-suggestions"
                />
                <datalist id="city-suggestions">
                  <option value="Москва" />
                  <option value="Санкт-Петербург" />
                  <option value="Новосибирск" />
                  <option value="Екатеринбург" />
                  <option value="Омск" />
                  <option value="Казань" />
                </datalist>
                {errors.city && <p className="form-error">{errors.city}</p>}
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

          {/* Блок 6: Медиа */}
          <section className="form-block">
            <h2 className="form-block-title">Фотографии</h2>
            <div className="form-field">
              <label className="form-label">Добавьте фотографии автомобиля</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotosChange}
                className="form-file-input"
              />
              {form.photos.length > 0 && (
                <ul className="photos-preview-list">
                  {form.photos.map((file) => (
                    <li key={file.name} className="photos-preview-item">
                      {file.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <div className="form-submit-wrapper">
            <button type="submit" className="submit-button">
              Создать объявление
            </button>
            {submittedSuccessfully && (
              <p className="submit-success">
                Объявление успешно создано (демо). Данные отправлены в консоль.
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

