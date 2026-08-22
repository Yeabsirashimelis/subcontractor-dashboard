import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

const cycle: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  function next() {
    const idx = cycle.indexOf(theme);
    setTheme(cycle[(idx + 1) % cycle.length]);
  }

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const label =
    theme === "dark" ? "Dark" : theme === "light" ? "Light" : "System";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={next}
      title={`Theme: ${label}`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
