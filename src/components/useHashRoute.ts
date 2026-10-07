import { useSyncExternalStore } from "react";

export type Route =
  "home" | "create" | "understanding" | "diagnosis" | "proposal" | "action" | "feedback" | "update";

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getSnapshot(): Route {
  const path = window.location.hash.replace(/^#\/?/, "");
  if (
    path === "create" ||
    path === "understanding" ||
    path === "diagnosis" ||
    path === "action" || path === "proposal" || path === "feedback" || path === "update"
  )
    return path;
  return "home";
}

export function useHashRoute(): Route {
  return useSyncExternalStore(subscribe, getSnapshot, () => "home");
}
