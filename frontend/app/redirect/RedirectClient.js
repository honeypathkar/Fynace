"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function RedirectClient() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const targetUrl = "https://play.google.com/store/apps/details?id=com.fynace.app";

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      window.location.href = targetUrl;
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const logoSrc = resolvedTheme === "dark" ? "/images/logo.png?v=2" : "/images/light.png?v=2";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6 text-center antialiased selection:bg-[var(--secondary)]/40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex w-full max-w-md flex-col items-center"
      >
        <div className="relative mb-12 h-10 w-36 overflow-hidden">
          <Image
            src={logoSrc}
            alt="Fynace logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="relative w-full rounded-[2.5rem] border border-[var(--line)] bg-[var(--panel)] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] sm:p-14 dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="mb-8 flex justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[var(--secondary)]"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border-[2px] border-transparent border-t-[var(--brand)] opacity-60"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="h-4 w-4 rounded-full bg-[var(--brand)] shadow-[0_0_20px_var(--brand)]"
              />
            </div>
          </div>

          <h1 className="mb-4 text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
            Redirecting...
          </h1>
          <p className="mb-10 text-balance text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            We're taking you to the Fynace Play Store page. Your journey to financial clarity starts here.
          </p>

          <Button
            asChild
            variant="outline"
            className="h-12 w-full rounded-2xl border-[var(--line)] bg-transparent text-sm font-medium transition-all hover:bg-[var(--secondary)]/10 hover:text-[var(--text)] active:scale-[0.98]"
          >
            <a href={targetUrl}>Click here if not redirected</a>
          </Button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="mt-12 text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]/50"
        >
          Fynace • Know Your Money
        </motion.p>
      </motion.div>

      <div className="pointer-events-none fixed -left-1/4 -top-1/4 -z-10 h-1/2 w-1/2 rounded-full bg-[var(--brand)]/5 blur-[120px]" />
      <div className="pointer-events-none fixed -bottom-1/4 -right-1/4 -z-10 h-1/2 w-1/2 rounded-full bg-[var(--secondary)]/5 blur-[120px]" />
    </div>
  );
}
