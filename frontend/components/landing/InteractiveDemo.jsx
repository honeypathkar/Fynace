"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

export default function InteractiveDemo() {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartFill = useTransform(scrollYProgress, [0, 0.9], [20, 92]);
  const railX = useTransform(scrollYProgress, [0.02, 0.98], ["0%", "-130%"]);
  const themeFolder = mounted && resolvedTheme === "light" ? "light" : "dark";
  const imageList = Array.from({ length: 9 }, (_, index) => `/${themeFolder}/${index + 1}.jpeg`);

  return (
    <section ref={containerRef} className="relative h-[340vh]">
      <div className="sticky top-20 mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--panel)]/90 px-5 py-10 sm:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
            Interactive demo
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
            Scroll to simulate live app behavior.
          </h2>
          <p className="mt-3 text-sm text-[var(--text-muted)] sm:text-base">
            As you move, cards, trends, and spending signals animate to mimic the
            real Fynace product experience.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4 sm:p-6">
          <motion.div className="flex gap-4 pb-2" style={{ x: railX }}>
            {imageList.map((image, i) => (
              <motion.div
                key={`${themeFolder}-${image}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="w-[230px] shrink-0 sm:w-[260px]"
              >
                <Image
                  src={image}
                  alt={`Fynace screen ${i + 1}`}
                  width={520}
                  height={360}
                  sizes="(max-width: 640px) 230px, 260px"
                  quality={55}
                  loading="lazy"
                  unoptimized
                  className="h-auto w-full rounded-xl object-cover object-top"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4">
            <p className="text-xs text-[var(--text-muted)]">Monthly budget usage</p>
            <div className="mt-3 h-2 rounded-full bg-black/20">
              <motion.div
                style={{ width: chartFill }}
                className="h-full rounded-full bg-[var(--secondary)]"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4">
            <p className="text-xs text-[var(--text-muted)]">Current status</p>
            <p className="mt-3 text-sm font-medium text-[var(--text)]">
              3 subscriptions flagged, 2 savings boosts suggested.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
