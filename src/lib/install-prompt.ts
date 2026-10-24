import { useSyncExternalStore } from "react";
interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
let pending: InstallPrompt | null = null;
const listeners = new Set<() => void>();
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  pending = event as InstallPrompt;
  listeners.forEach((listener) => listener());
});
window.addEventListener("appinstalled", () => {
  pending = null;
  listeners.forEach((listener) => listener());
});
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export function useInstallPrompt() {
  return useSyncExternalStore(subscribe, () => pending);
}
export async function promptInstall() {
  const event = pending;
  if (!event) return;
  try {
    await event.prompt();
    await event.userChoice;
  } finally {
    pending = null;
    listeners.forEach((listener) => listener());
  }
}
