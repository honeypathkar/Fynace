"use client";

import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import FeaturesSection from "@/components/landing/FeaturesSection";
import InteractiveDemo from "@/components/landing/InteractiveDemo";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";
import EarlyAccessModal from "@/components/landing/EarlyAccessModal";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="bg-[var(--bg)] text-[var(--text)] antialiased selection:bg-[var(--secondary)]/40">
      <Navbar onGetStarted={openModal} />

      <main>
        <Hero onCtaClick={openModal} />
        <FeaturesSection />
        <InteractiveDemo />
        <HowItWorks />
        <Testimonials />

        <section className="px-5 py-24 sm:px-6">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-[var(--line)] bg-gradient-to-br from-[var(--secondary)]/16 via-[var(--panel)] to-[var(--secondary)]/10 p-8 text-center sm:p-12">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
              Make every rupee work harder with Fynace.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--text-muted)] sm:text-base">
              Join early users building cleaner finance habits with automation, live insights,
              and premium product quality.
            </p>
            <Button
              size="xl"
              onClick={openModal}
              className="mt-7 bg-[var(--text)] text-white hover:opacity-90 dark:bg-white dark:text-black"
            >
              Get Started
            </Button>
          </div>
        </section>
      </main>

      <Footer />

      <EarlyAccessModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
