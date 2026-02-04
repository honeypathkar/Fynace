"use client";

import Image from "next/image";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const featureList = [
  {
    title: "Smart expense capture",
    description: "Add expenses manually, via SMS, or by scanning QR receipts in seconds.",
  },
  {
    title: "Visual insights",
    description: "See your spending categories with charts that keep you on budget.",
  },
  {
    title: "Privacy mode",
    description: "Lock sensitive data and keep totals hidden with a single tap.",
  },
  {
    title: "Automated reminders",
    description: "Stay ahead of bills and milestones with real-time notifications.",
  },
];

const screens = [
  {
    src: "/images/hero-card.svg",
    alt: "Overview dashboard",
  },
  {
    src: "/images/screen-expense.svg",
    alt: "Add expense screen",
  },
  {
    src: "/images/screen-expenses.svg",
    alt: "Expenses list screen",
  },
  {
    src: "/images/screen-tools.svg",
    alt: "Tools and settings screen",
  },
  {
    src: "/images/screen-profile.svg",
    alt: "Profile screen",
  },
];

const steps = [
  {
    title: "Connect your sources",
    body: "Import SMS alerts, scan QR codes, or add entries manually — you decide.",
  },
  {
    title: "Track in real time",
    body: "Monthly snapshots show cash flow, remaining budgets, and trends.",
  },
  {
    title: "Stay in control",
    body: "Privacy mode hides balances while insights keep you confident.",
  },
];

export default function Home() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".hero-animate", {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });

      gsap.utils.toArray(".feature-card").forEach((card) => {
        gsap.from(card, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        });
      });

      gsap.utils.toArray(".gallery img").forEach((item) => {
        gsap.from(item, {
          opacity: 0,
          scale: 0.96,
          duration: 0.7,
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

  return (
    <main>
      <header className="container nav">
        <div className="hero-animate" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image src="/images/logo.svg" alt="Fynace logo" width={42} height={42} />
          <span style={{ fontWeight: 700, fontSize: 18 }}>Fynace</span>
        </div>
        <nav className="nav-links hero-animate">
          <a href="#features">Features</a>
          <a href="#screens">Screens</a>
          <a href="#workflow">Workflow</a>
          <a href="#privacy">Privacy</a>
        </nav>
        <a className="button secondary hero-animate" href="#get-started">Get the app</a>
      </header>

      <section className="container hero">
        <div>
          <span className="badge hero-animate">Smart money companion</span>
          <h1 className="hero-animate">Track every rupee, protect every insight.</h1>
          <p className="hero-animate">
            Fynace is a secure finance tracker that unifies expenses, income, and automated reminders in a calm,
            privacy-first experience.
          </p>
          <div className="hero-actions hero-animate">
            <a className="button primary" href="#get-started">Download for iOS</a>
            <a className="button secondary" href="#get-started">Download for Android</a>
          </div>
          <div className="stats hero-animate">
            <div className="stat">
              <strong>3-sec</strong>
              <p style={{ color: "var(--muted)", fontSize: 13 }}>Quick add</p>
            </div>
            <div className="stat">
              <strong>100% private</strong>
              <p style={{ color: "var(--muted)", fontSize: 13 }}>Biometric lock</p>
            </div>
            <div className="stat">
              <strong>Daily alerts</strong>
              <p style={{ color: "var(--muted)", fontSize: 13 }}>On-budget tips</p>
            </div>
          </div>
        </div>
        <div className="card hero-animate" style={{ display: "grid", placeItems: "center" }}>
          <Image src="/images/hero-card.svg" alt="Fynace dashboard" width={420} height={680} />
        </div>
      </section>

      <section id="features" className="container">
        <div className="section-heading">
          <span className="badge">Why Fynace</span>
          <h2>Built around your daily habits.</h2>
          <p>
            Inspired by the Fynace app experience, the landing page keeps the same deep navy palette, soft glass
            cards, and the Bricolage Grotesque typeface.
          </p>
        </div>
        <div className="features">
          {featureList.map((feature) => (
            <div key={feature.title} className="feature-card">
              <span style={{ color: "var(--accent-soft)", fontWeight: 600 }}>●</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="screens" className="container">
        <div className="section-heading">
          <span className="badge">Interface preview</span>
          <h2>Calm visuals, powerful control.</h2>
          <p>These screens capture the Fynace design language: soft gradients, focused content, and clear actions.</p>
        </div>
        <div className="gallery">
          {screens.map((screen) => (
            <Image key={screen.src} src={screen.src} alt={screen.alt} width={320} height={540} />
          ))}
        </div>
      </section>

      <section id="workflow" className="container">
        <div className="section-heading">
          <span className="badge">How it works</span>
          <h2>From capture to clarity in three steps.</h2>
          <p>GSAP-powered transitions keep the story smooth as users scroll through your app's workflow.</p>
        </div>
        <div className="timeline">
          {steps.map((step, index) => (
            <div key={step.title} className="timeline-step">
              <span style={{ color: "var(--accent-soft)", fontWeight: 600 }}>0{index + 1}</span>
              <h3 style={{ margin: "12px 0 8px" }}>{step.title}</h3>
              <p style={{ color: "var(--muted)" }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="get-started" className="container">
        <div className="cta">
          <div>
            <span className="badge">Ready to start?</span>
            <h2>Keep your finances on autopilot.</h2>
            <p style={{ color: "var(--muted)", marginTop: 12 }}>
              Download Fynace and experience effortless tracking, privacy-first insights, and beautiful reporting.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <a className="button primary" href="#">Get the early access build</a>
            <a className="button secondary" href="#privacy">Review privacy details</a>
          </div>
        </div>
      </section>

      <footer id="privacy" className="container footer">
        <strong>Fynace</strong>
        <p>Secure finance tracking built for clarity.</p>
        <div className="footer-links">
          <a href={`${backendUrl}/privacy-policy`} target="_blank" rel="noreferrer">
            Privacy Policy
          </a>
          <a href={`${backendUrl}/terms-and-conditions`} target="_blank" rel="noreferrer">
            Terms & Conditions
          </a>
          <a href="mailto:hello@fynace.app">Contact</a>
        </div>
      </footer>
    </main>
  );
}
