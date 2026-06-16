"use client";

import { useRef, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

type Theme = "light" | "dark";

function getStoredTheme(): Theme {
  if (typeof document === "undefined") {
    return "dark";
  }

  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("themechange", onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("themechange", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function ThemeToggle() {
  const t = useTranslations("nav");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const theme = useSyncExternalStore(subscribe, getStoredTheme, () => "dark");

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const updateTheme = () => {
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem("theme", nextTheme);
      window.dispatchEvent(new Event("themechange"));
    };

    if (!("startViewTransition" in document) || reduceMotion) {
      updateTheme();
      return;
    }

    const transition = document.startViewTransition(updateTheme);
    const rect = buttonRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 420,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className="nav-control"
      aria-label={t("themeToggle")}
      onClick={toggleTheme}
    >
      <span aria-hidden="true">{theme === "dark" ? "○" : "●"}</span>
    </button>
  );
}
