"use client";

import { useState } from "react";
import { CheckCircle, Sparkle, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export default function EarlyAccessModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/landing/early-access`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          setFormData({ name: "", email: "", message: "" });
        }, 3000);
      } else {
        const data = await res.json();
        alert(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] grid place-items-center bg-black/55 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-8"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg border border-[var(--line)] bg-[var(--soft)] p-1.5 text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              aria-label="Close modal"
              type="button"
            >
              <X size={16} />
            </button>

            {submitted ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--secondary)]/20">
                  <CheckCircle size={30} weight="fill" className="text-[var(--secondary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text)]">You're in.</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  We will send updates to {formData.email}.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--soft)] px-2.5 py-1 text-xs text-[var(--text-muted)]">
                    <Sparkle size={12} /> Early access
                  </p>
                  <h3 className="text-2xl font-semibold text-[var(--text)]">Join Fynace early</h3>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    Get priority access to premium budgeting and subscription tools.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Full name"
                    />
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email address"
                    />
                  </div>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="What finance problem do you want to solve?"
                    className="min-h-28 w-full rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none transition-colors focus:border-[var(--secondary)]/50"
                  />
                  <Button disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Submitting..." : "Get Early Access"}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
