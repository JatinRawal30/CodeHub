import { useSyncExternalStore } from "react";
import { writeStorage } from "../utils/storage";

// index.html applies the stored theme before React loads; keep the key in sync with it
const STORAGE_KEY = "codehub-theme";
const listeners = new Set();

export function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  const root = document.documentElement;
  // skip transitions for one frame so the whole page swaps at once
  root.classList.add("theme-switching");
  root.setAttribute("data-theme", theme);
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
  listeners.forEach((listener) => listener());
}

export function setTheme(theme) {
  writeStorage(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme);
  return { theme, setTheme, toggleTheme };
}
