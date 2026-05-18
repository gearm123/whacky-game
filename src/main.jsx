import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { initAnalytics } from "./analytics";
import "./styles.css";

initAnalytics();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    registerSW({
      immediate: true,
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
