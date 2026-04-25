"use client";

import { motion } from "framer-motion";
import {
  ChartLineUp,
  Sparkle,
  ShieldCheck,
  BellRinging,
} from "@phosphor-icons/react";

const features = [
  {
    title: "Secure Login",
    description:
      "Sign in safely with Google and OTP, plus biometric lock for quick and secure access.",
    icon: ShieldCheck,
  },
  {
    title: "Privacy Mode",
    description:
      "Hide sensitive balances and personal finance details instantly whenever you need privacy.",
    icon: Sparkle,
  },
  {
    title: "Smart Alerts",
    description:
      "Get timely reminders for due dates, spending limits, subscriptions, and unusual activity.",
    icon: BellRinging,
  },
  {
    title: "Charts & Filters",
    description:
      "Analyze trends with clean charts and filter data by weekly, monthly, and yearly views.",
    icon: ChartLineUp,
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          className="mx-auto mb-12 max-w-3xl text-center sm:mb-14"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
            Scroll-based storytelling
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
            Built to remove friction from everyday finances.
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
                className="group rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--soft)]">
                  <Icon size={20} className="text-[var(--secondary)]" weight="duotone" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text)]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  {feature.description}
                </p>
                <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-3">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>Always on</span>
                    <span className="text-[var(--secondary)]">Smart sync</span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
