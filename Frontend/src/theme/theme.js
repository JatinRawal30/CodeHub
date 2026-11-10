import { useSyncExternalStore } from "react";
import { readStorage, writeStorage } from "../utils/storage";

// index.html applies the stored theme before React loads; keep the key in sync with it
const STORAGE_KEY = "codehub-theme";
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

const listeners = new Set();

function storedTheme() {
  const value = readStorage(STORAGE_KEY);
  return value === "light" || value === "dark" ? value : null;
}

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

// until the user picks one, follow the OS setting live
systemDark.addEventListener("change", (e) => {
  if (!storedTheme()) applyTheme(e.matches ? "dark" : "light");
});

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme);
  return { theme, setTheme, toggleTheme };
}
