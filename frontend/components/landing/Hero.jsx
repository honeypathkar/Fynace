"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "@phosphor-icons/react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function Hero({ onCtaClick }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const previewSrc = mounted && resolvedTheme === "dark" ? "/images/logo.png?v=3" : "/images/light.png?v=3";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_50%_at_50%_0%,var(--secondary),transparent_70%)] opacity-20" />
      <div className="pointer-events-none absolute -left-24 top-32 -z-10 h-72 w-72 rounded-full bg-[var(--secondary)]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 top-56 -z-10 h-72 w-72 rounded-full bg-[var(--secondary)]/20 blur-3xl" />

      <div className="mx-auto grid max-w-7xl gap-16 px-5 pb-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-5 inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--soft)] px-3 py-1 text-xs tracking-wide text-[var(--text-muted)]"
          >
            Smart money management for modern life
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-balance text-4xl font-semibold leading-tight tracking-tight text-[var(--text)] sm:text-5xl lg:text-6xl"
          >
            One place to track expenses, subscriptions, and smarter money moves.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 max-w-xl text-base text-[var(--text-muted)] sm:text-lg"
          >
            Fynace gives you instant clarity on where money goes, what to optimize, and
            how to stay on budget without manual stress.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button
              size="xl"
              onClick={onCtaClick}
              className="bg-[#a9a9f7] text-black hover:bg-[#9b9bf2] dark:bg-[#d3d3ff] dark:text-black dark:hover:bg-[#c5c5ff]"
            >
              Get Started
              <ArrowRight size={16} className="ml-2" />
            </Button>
            <Button size="xl" variant="secondary" onClick={onCtaClick}>
              <Play size={16} className="mr-2" />
              Watch Demo
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto aspect-square w-full max-w-[460px]"
        >
          <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.2rem] bg-[radial-gradient(circle_at_center,var(--secondary),transparent_65%)] opacity-35 blur-2xl" />
          <Image
            src={previewSrc}
            alt="Fynace logo preview"
            fill
            className="object-contain"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
