import { useState } from "react";
import "./App.css";
import MainPage from "./Pages/MainPage/MainPage";
import CreateAdPage from "./Pages/CreateAdPage/CreateAdPage";

type Page = "main" | "createAd";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("main");

  const handleGoToCreateAd = () => setCurrentPage("createAd");
  const handleGoToMain = () => setCurrentPage("main");

  return (
    <>
      {currentPage === "main" && <MainPage onCreateAdClick={handleGoToCreateAd} />}
      {currentPage === "createAd" && (
        <CreateAdPage onCreateAdClick={handleGoToCreateAd} onGoHomeClick={handleGoToMain} />
      )}
    </>
  );
}

export default App;

