"use client";

import { motion } from "framer-motion";
import { Quotes } from "@phosphor-icons/react";

const testimonials = [
  {
    name: "Honey Pathkar",
    role: "Founder, Fynace",
    quote:
      "I built Fynace to make personal finance calm, private, and practical. Every feature is crafted to help people make better money decisions faster, with less stress and more confidence.",
    avatarImage:
      "https://res.cloudinary.com/dbfyjoiub/image/upload/v1771066355/20251116_214519_ncsapv.jpg",
    avatar: "HP",
  },
  {
    name: "Suryansh Patwa",
    role: "Student at IIT Madras",
    quote:
      "It’s the kind of app I never thought I needed. It helped me manage my budget and reduce unnecessary spending by a lot. Now I’m spending 40% less and actually saving money. Thanks, Fynace.",
    avatarImage:
      "https://res.cloudinary.com/dbfyjoiub/image/upload/v1777194390/portfolio/o1yq0zy8p1nzoiorzt3e.jpg",
    avatar: "SP",
  },
  {
    name: "Rohan Gupta",
    role: "Influencer",
    quote:
      "Budget automation removed manual tracking from my routine. I finally feel in control of my cash flow each month.",
    avatar: "RG",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
            Loved by finance-focused teams and creators.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="group rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 transition-colors"
            >
              <Quotes size={24} weight="fill" className="mb-4 text-[var(--secondary)]" />
              <p className="min-h-24 text-sm leading-relaxed text-[var(--text-muted)]">{t.quote}</p>
              <div className="mt-5 flex items-center gap-3">
                {t.avatarImage ? (
                  <img
                    src={t.avatarImage}
                    alt={t.name}
                    className="h-10 w-10 rounded-xl object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--secondary)] text-xs font-semibold text-black">
                    {t.avatar}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{t.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
