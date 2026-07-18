"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme, forcedTheme } = useTheme();

  const mounted = forcedTheme !== undefined || resolvedTheme !== undefined;
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle light and dark theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}>
      {mounted && isDark ?
        <Sun className="size-4" />
      : <Moon className="size-4" />}
    </Button>
  );
}
