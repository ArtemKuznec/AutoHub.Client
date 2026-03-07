import type { FC } from "react";
import "./HeaderComponent.css";
import autoIcon from "../../assets/autobase-icon.png";
import markerIcon from "../../assets/marker-icon.png";

type HeaderProps = {
  onCreateAdClick?: () => void;
};

const HeaderComponent: FC<HeaderProps> = ({ onCreateAdClick }) => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <img src={autoIcon} alt="AutoBase" />
          <p className="header-title">AutoBase</p>
        </div>

        <button className="header-region" type="button">
          <img src={markerIcon} alt="Регион" />
          <span>Омская область</span>
        </button>

        <nav className="header-options" aria-label="Категории объявлений">
          <button className="header-options_option" type="button">
            Автомобили
          </button>
          <button className="header-options_option" type="button">
            Мотоциклы
          </button>
        </nav>
      </div>

      <div className="header-right">
        <button className="header-login" type="button">
          Вход и регистрация
        </button>
        <button className="header-submit" type="button" onClick={onCreateAdClick}>
          Подать объявление
        </button>
      </div>
    </header>
  );
};

export default HeaderComponent;