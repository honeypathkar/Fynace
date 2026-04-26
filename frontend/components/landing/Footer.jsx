"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { GithubLogo, InstagramLogo, TwitterLogo } from "@phosphor-icons/react";

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const logoSrc = mounted && resolvedTheme === "dark" ? "/images/logo.png?v=2" : "/images/light.png?v=2";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="border-t border-[var(--line)] py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center">
              <div className="relative h-10 w-32 overflow-hidden rounded-lg">
                <Image
                  src={logoSrc}
                  alt="Fynace logo"
                  fill
                  className="object-contain"
                  sizes="128px"
                />
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--text-muted)]">
              Modern personal finance with clear insights, calm UI, and smart automation.
            </p>
            <div className="mt-5 flex items-center gap-4 text-[var(--text-muted)]">
              <Link href="https://github.com/honeypathkar" className="transition-colors hover:text-[var(--text)]" target="_blank"><GithubLogo size={20} weight="fill" /></Link>
              <Link href="https://www.instagram.com/fynace.in/" className="transition-colors hover:text-[var(--text)]" target="_blank"><InstagramLogo size={20} weight="fill" /></Link>
              {/* <Link href="#" className="transition-colors hover:text-[var(--text)]"><TwitterLogo size={20} weight="fill" /></Link> */}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Product</h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li><Link href="#features" className="hover:text-[var(--text)]">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-[var(--text)]">How it works</Link></li>
              <li><Link href="#testimonials" className="hover:text-[var(--text)]">Testimonials</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Company</h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li><Link href="/privacy-policy" className="hover:text-[var(--text)]">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-[var(--text)]">Terms & Conditions</Link></li>
              <li><Link href="mailto:honeypatkar70@gmail.com" target="_blank" className="hover:text-[var(--text)]">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--line)] pt-6">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} Fynace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
