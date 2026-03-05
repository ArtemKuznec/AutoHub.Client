import "./HeaderComponent.css";
import autoIcon from "../../assets/autobase-icon.png";

const HeaderComponent = () => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <img src={autoIcon} alt="AutoBase" />
          <p className="header-title">AutoBase</p>
        </div>

       
      </div>
    </header>
  );
};

export default HeaderComponent;