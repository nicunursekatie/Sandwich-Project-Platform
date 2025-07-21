import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handlers to prevent unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.warn('[UnhandledRejection] Caught promise rejection:', event.reason);
  // Prevent the default handler from logging to console
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.warn('[Error] Caught error:', event.error);
});

createRoot(document.getElementById("root")!).render(<App />);
