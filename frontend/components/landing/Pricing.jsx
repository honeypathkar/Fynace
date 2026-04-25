"use client";

import { motion } from "framer-motion";
import { Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "₹0",
    description: "Great for getting started with tracking.",
    features: ["Basic expense tracking", "Monthly summary", "1 account connection"],
    cta: "Start for Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹199",
    description: "For power users who want automation and insights.",
    features: [
      "Auto-categorization",
      "Subscription monitoring",
      "Smart insights",
      "Unlimited accounts",
      "Priority support",
    ],
    cta: "Get Pro Access",
    highlight: true,
  },
  {
    name: "Teams",
    price: "₹499",
    description: "For shared budgeting and collaborative planning.",
    features: [
      "Everything in Pro",
      "Shared workspaces",
      "Role-based access",
      "Custom reports",
    ],
    cta: "Start Team Plan",
    highlight: false,
  },
];

export default function Pricing({ onPlanSelect }) {
  return (
    <section id="pricing" className="py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
            Pricing that scales with your financial goals.
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className={`rounded-2xl border p-6 ${
                plan.highlight
                  ? "border-cyan-300/50 bg-gradient-to-b from-cyan-500/10 to-violet-500/10"
                  : "border-[var(--line)] bg-[var(--panel)]"
              }`}
            >
              {plan.highlight && (
                <p className="mb-3 inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-2.5 py-1 text-xs text-cyan-200">
                  Most popular
                </p>
              )}
              <h3 className="text-lg font-semibold text-[var(--text)]">{plan.name}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{plan.description}</p>
              <div className="mt-5 flex items-end gap-1">
                <p className="text-4xl font-semibold tracking-tight text-[var(--text)]">{plan.price}</p>
                <p className="text-sm text-[var(--text-muted)]">/month</p>
              </div>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                    <Check size={14} className="mt-0.5 text-cyan-300" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={onPlanSelect}
                variant={plan.highlight ? "default" : "secondary"}
                className="mt-6 w-full"
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
