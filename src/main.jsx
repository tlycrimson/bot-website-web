import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import RMPBotIcon from "./assets/RMP_Bot_icon.png?url";

// Set favicon at runtime so we're using the bundled asset (works in dev and prod)
(function setFavicon() {
  try {
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = RMPBotIcon;
    document.head.appendChild(link);
  } catch (e) {
    /* ignore */
  }
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
