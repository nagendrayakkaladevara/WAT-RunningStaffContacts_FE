import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
function initialTheme() {
  try {
    return localStorage.getItem("theme") === "dark";
  } catch {
    return false;
  }
}
document.documentElement.classList.toggle("dark", initialTheme());
export function ThemeToggle() {
  const [dark, setDark] = useState(initialTheme);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* Keep working without storage. */
    }
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-11"
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      onClick={toggle}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}
