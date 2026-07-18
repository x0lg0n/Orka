"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export function ThemeToggler(props: React.ComponentProps<typeof AnimatedThemeToggler>) {
  const { theme, setTheme } = useTheme();

  return (
    <AnimatedThemeToggler
      theme={theme as "light" | "dark"}
      onThemeChange={(next) => setTheme(next)}
      {...props}
    />
  );
}
