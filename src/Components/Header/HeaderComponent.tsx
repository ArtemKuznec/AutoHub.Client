import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../Services/authService";
import type { Region } from "../../Services/regionService";
import "./HeaderComponent.css";
import autoIcon from "../../assets/autobase-icon.png";
import markerIcon from "../../assets/marker-icon.png";

type HeaderProps = {
  onCreateAdClick?: () => void;
  onCarAdsClick?: () => void;
  regions?: Region[];
  regionId?: string;
  onRegionChange?: (value: string) => void;
};

const HeaderComponent: FC<HeaderProps> = ({
  onCreateAdClick,
  onCarAdsClick: onCarsLinkClick,
  regions,
  regionId,
  onRegionChange,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, setAuthenticated } = useAuth();

  const handleCreateAdClick = () => {
    if (onCreateAdClick) {
      onCreateAdClick();
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/create-ad");
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      authService.logout();
      setAuthenticated(false);
      navigate("/main");
    } else {
      navigate("/login");
    }
  };

  const handleCarsPageClick = () => {
    if (onCarsLinkClick) {
      onCarsLinkClick();
      return;
    }

    navigate("/main");
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <img src={autoIcon} alt="AutoHub" />
          <p className="header-title">AutoHub</p>
        </div>

        <button className="header-region" type="button">
          <img src={markerIcon} alt="Регион" />
          {onRegionChange && regions && regions.length > 0 ? (
            <select
              className="header-region-select"
              value={regionId ?? ""}
              onChange={(event) => onRegionChange(event.target.value)}
            >
              <option value="">Все регионы</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          ) : (
            <span>Омская область</span>
          )}
        </button>

        <nav className="header-options" aria-label="Категории объявлений">
          <button className="header-options_option" type="button" onClick={handleCarsPageClick}>
            Автомобили
          </button>
         
        </nav>
      </div>

      <div className="header-right">
        <button className="header-login" type="button" onClick={handleAuthClick}>
          {isAuthenticated ? "Выйти" : "Вход и регистрация"}
        </button>
        <button className="header-submit" type="button" onClick={handleCreateAdClick}>
          Подать объявление
        </button>
      </div>
    </header>
  );
};

export default HeaderComponent;