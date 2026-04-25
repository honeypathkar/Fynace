"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { List, X } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/landing/ThemeToggle";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How it works", href: "#how-it-works" },
  { name: "Testimonials", href: "#testimonials" },
];

export default function Navbar({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const logoSrc = mounted && resolvedTheme === "dark" ? "/images/logo.png?v=2" : "/images/light.png?v=2";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "py-3" : "py-5"
      )}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <nav
          className={cn(
            "flex items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-300",
            scrolled
              ? "border-[var(--line)] bg-[color:color-mix(in_oklab,var(--bg)_86%,transparent)] backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
              : "border-transparent bg-transparent"
          )}
        >
          <Link href="/" className="group flex items-center">
            <div className="relative h-10 w-32 overflow-hidden">
              <Image
                src={logoSrc}
                alt="Fynace logo"
                fill
                className="object-contain p-1"
                sizes="128px"
              />
            </div>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {/* <Button variant="ghost" size="sm" className="text-[var(--text-muted)] hover:text-[var(--text)]">
              Sign in
            </Button> */}
            <Button
              onClick={onGetStarted}
              size="sm"
              className="bg-[var(--secondary)] text-black hover:brightness-95"
            >
              Get Started
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-[var(--text)] md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
          </Button>
        </nav>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute left-0 right-0 top-full z-40 p-5 md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-2xl border border-[var(--line)] bg-[var(--panel)]/95 p-6 backdrop-blur-xl">
              <div className="mb-1">
                <ThemeToggle />
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                >
                  {link.name}
                </Link>
              ))}
              <Button
                onClick={() => {
                  onGetStarted();
                  setIsOpen(false);
                }}
                className="w-full"
              >
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
