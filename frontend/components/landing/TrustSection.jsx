"use client";

import { motion } from "framer-motion";

const logos = [
  "Forbes",
  "Product Hunt",
  "YC Alumni",
  "Google Play",
  "App Store",
  "TechCrunch",
];

export default function TrustSection() {
  return (
    <section className="border-y border-[var(--line)] bg-[var(--soft)] py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <p className="mb-8 text-center text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
          Trusted by early adopters and builders
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {logos.map((logo, i) => (
            <motion.span
              key={logo}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 0.75, y: 0 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="select-none text-base font-medium text-[var(--text-muted)] sm:text-lg"
            >
              {logo}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
