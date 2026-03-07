import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import MainPage from "./Pages/MainPage/MainPage";
import CreateAdPage from "./Pages/CreateAdPage/CreateAdPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/main" replace />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/create-ad" element={<CreateAdPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
