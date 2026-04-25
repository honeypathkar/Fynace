"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useTheme } from "next-themes";

function ThemeSync() {
  const searchParams = useSearchParams();
  const { setTheme } = useTheme();

  useEffect(() => {
    const themeParam = searchParams.get("theme");
    if (themeParam === "dark" || themeParam === "light") {
      setTheme(themeParam);
    }
  }, [searchParams, setTheme]);

  return null;
}

export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider {...props}>
      <React.Suspense fallback={null}>
        <ThemeSync />
      </React.Suspense>
      {children}
    </NextThemesProvider>
  );
}
