"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme: resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount detection
  React.useEffect(() => setMounted(true), []);

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
