import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import App from "./App";
import PageContentProvider from "./components/PageContentProvider";
import "./index.css";
import "./public-polish.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user"><PageContentProvider><App /></PageContentProvider></MotionConfig>
    </BrowserRouter>
  </StrictMode>
);
