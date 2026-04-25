"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Connect Accounts",
    description: "Securely link your cards and bank accounts in minutes.",
  },
  {
    number: "02",
    title: "Auto Classify",
    description: "Fynace organizes transactions and subscriptions automatically.",
  },
  {
    number: "03",
    title: "Get Insights",
    description: "Receive smart nudges, trend reports, and optimization tips.",
  },
  {
    number: "04",
    title: "Stay On Budget",
    description: "Use rules and alerts to keep your monthly plan on track.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
            How Fynace works
          </h2>
          <p className="mt-3 text-sm text-[var(--text-muted)] sm:text-base">
            A focused workflow designed for speed, clarity, and better daily decisions.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5"
            >
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--soft)] text-sm font-semibold text-[var(--secondary)]">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
