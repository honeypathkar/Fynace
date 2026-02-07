"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const featureList = [
  {
    title: "Secure Onboarding",
    description:
      "Multi-parameter login methods ensuring your financial data is protected from the very first tap.",
    img: "/images/2.jpeg",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Smart Capture Methods",
    description:
      "Multiple ways to capture your spending — from automated syncing to manual oversight.",
    img: "/images/7.jpeg",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    title: "Granular Controls",
    description:
      "Powerful filters and manual entry screens that give you absolute mastery over every transaction.",
    img: "/images/8.jpeg",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
  },
  {
    title: "Intelligent Insights",
    description:
      "Deep analytics that help you visualize your financial health with clarity and precision.",
    img: "/images/11.jpeg",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
];

const screenGallery = [
  { src: "/images/3.jpeg", alt: "Fynace Dashboard" },
  { src: "/images/4.jpeg", alt: "Expense Tracking" },
  { src: "/images/5.jpeg", alt: "User Profile" },
  { src: "/images/6.jpeg", alt: "Management Tools" },
  { src: "/images/9.jpeg", alt: "QR Scanning" },
  { src: "/images/10.jpeg", alt: "Secure Payment" },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const ctx = gsap.context(() => {
      gsap.from(".hero-text-animate", {
        opacity: 0,
        y: 60,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out",
      });

      gsap.from(".hero-visual-animate", {
        opacity: 0,
        scale: 0.9,
        duration: 1.5,
        ease: "expo.out",
        delay: 0.5,
      });

      gsap.utils.toArray(".feature-card").forEach((card) => {
        gsap.from(card, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        });
      });

      gsap.utils.toArray(".screen-item").forEach((item) => {
        gsap.from(item, {
          opacity: 0,
          scale: 0.95,
          duration: 0.6,
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
          },
        });
      });
    });

    return () => {
      ctx.revert();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleFormSubmit = async (e) => {
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
          setIsModalOpen(false);
          setSubmitted(false);
          setFormData({ name: "", email: "", message: "" });
        }, 3000);
      } else {
        const data = await res.json();
        alert(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to the server. Is the backend running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={`nav-wrapper ${scrolled ? "scrolled" : ""}`}>
        <header className="container nav">
          <div className="logo">
            <Image
              src="/images/logo.png"
              alt="Fynace"
              width={38}
              height={38}
              style={{ borderRadius: "8px" }}
            />
            <span>Fynace</span>
          </div>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#preview">Preview</a>
            <a href="#download">Early Access</a>
          </nav>
          <div className="nav-actions">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
              style={{ border: "none" }}
            >
              Get Early Access
            </button>
          </div>
          <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span
              style={{
                transform: isMenuOpen
                  ? "rotate(45deg) translate(5px, 6px)"
                  : "none",
              }}
            ></span>
            <span style={{ opacity: isMenuOpen ? 0 : 1 }}></span>
            <span
              style={{
                transform: isMenuOpen
                  ? "rotate(-45deg) translate(5px, -6px)"
                  : "none",
              }}
            ></span>
          </div>
        </header>
      </div>

      <div className={`mobile-nav ${isMenuOpen ? "open" : ""}`}>
        <a href="#features" onClick={() => setIsMenuOpen(false)}>
          Features
        </a>
        <a href="#preview" onClick={() => setIsMenuOpen(false)}>
          Preview
        </a>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setIsMenuOpen(false);
          }}
          className="btn btn-primary"
        >
          Get Early Access
        </button>
      </div>

      <main>
        {/* Hero Section */}
        <section className="container hero-section">
          <div className="hero-content">
            <span className="badge hero-text-animate">
              Smart money companion
            </span>
            <h1 className="hero-text-animate">
              Track every rupee, protect every insight.
            </h1>
            <p className="hero-text-animate">
              Fynace is a secure finance tracker that unifies expenses, income,
              and automated reminders in a calm, privacy-first experience
              designed for modern life.
            </p>
            <div className="btn-group hero-text-animate">
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary"
                style={{ border: "none" }}
              >
                Get Early Access for Android
              </button>
              <a href="#features" className="btn btn-secondary">
                View Features
              </a>
            </div>
          </div>
          <div className="hero-visual hero-visual-animate">
            <div className="hero-glow"></div>
            <div className="hero-image-container">
              <Image
                src="/images/logo.png"
                alt="Fynace App Logo"
                width={700}
                height={800}
                className="hero-main-img"
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container">
          <div className="section-header">
            <span className="badge">Powerful Capabilities</span>
            <h2>Built around your habits.</h2>
            <p>
              Experience a finance tracker that adapts to your needs with
              cutting-edge technology and human-centric design.
            </p>
          </div>
          <div className="grid-features">
            {featureList.map((feature, i) => (
              <div key={i} className="feature-card">
                <div className="icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-image-wrapper">
                  <Image
                    src={feature.img}
                    alt={feature.title}
                    width={400}
                    height={320}
                    priority={i === 0}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Screen Preview Slider */}
        <section id="preview" className="container">
          <div className="section-header">
            <span className="badge">Interface Preview</span>
            <h2>Calm Visuals, Powerful Control.</h2>
            <p>
              Swipe through the experience of Fynace and see how simplicity
              meets power.
            </p>
          </div>
          <div className="screens-slider">
            {screenGallery.map((screen, i) => (
              <div key={i} className="screen-item">
                <Image
                  src={screen.src}
                  alt={screen.alt}
                  width={300}
                  height={600}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section id="download" className="container">
          <div
            className="feature-card"
            style={{
              textAlign: "center",
              padding: "60px 40px",
              background:
                "linear-gradient(135deg, var(--surface) 0%, #030712 100%)",
            }}
          >
            <span className="badge">Ready to Start?</span>
            <h2 style={{ fontSize: "3rem", marginBottom: "20px" }}>
              Keep your finances on autopilot.
            </h2>
            <p style={{ maxWidth: "600px", margin: "0 auto 32px" }}>
              Join thousands of users who have transformed their relationship
              with money using Fynace. Secure, private, and effortless.
            </p>
            <div className="btn-group" style={{ justifyContent: "center" }}>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary"
                style={{ border: "none" }}
              >
                Join the Early Access
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Modal / Form */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div
                  className="badge"
                  style={{
                    marginBottom: "16px",
                    color: "var(--success)",
                    border: "1px solid var(--success)",
                  }}
                >
                  Success
                </div>
                <h3 style={{ fontSize: "1.8rem", marginBottom: "12px" }}>
                  You're on the list!
                </h3>
                <p style={{ color: "var(--text-muted)" }}>
                  We'll reach out soon at {formData.email}
                </p>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>
                  Join Early Access
                </h3>
                <p
                  style={{
                    color: "var(--text-muted)",
                    marginBottom: "24px",
                    fontSize: "0.9rem",
                  }}
                >
                  Enter your details below and we'll send you an invite to the
                  beta.
                </p>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Message (Optional)</label>
                    <textarea
                      rows="3"
                      placeholder="Tell us why you're excited!"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{ width: "100%", border: "none" }}
                  >
                    {isSubmitting ? "Sending..." : "Submit Application"}
                  </button>
                </form>
              </>
            )}
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <footer>
        <div className="container">
          <div className="footer-content">
            <div>
              <div className="logo footer-logo">
                <Image
                  src="/images/logo.png"
                  alt="Fynace"
                  width={34}
                  height={34}
                  style={{ borderRadius: "6px" }}
                />
                <span>Fynace</span>
              </div>
              <p style={{ color: "var(--text-muted)", maxWidth: "300px" }}>
                The ultimate companion for your financial journey. Secure,
                private, and insightful.
              </p>
            </div>
            <div className="footer-links">
              <h4>Product</h4>
              <ul>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#preview">Preview</a>
                </li>
                <li>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "inherit",
                      padding: 0,
                      font: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    Early Access
                  </button>
                </li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Legal</h4>
              <ul>
                <li>
                  <a href="/privacy-policy">Privacy Policy</a>
                </li>
                <li>
                  <a href="/terms-and-conditions">Terms & Conditions</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              &copy; {new Date().getFullYear()} Fynace. All rights reserved.
            </p>
            <div style={{ display: "flex", gap: "24px" }}>
              <a href="mailto:support@fynace.in">Support</a>
              <a
                href="https://github.com/honeypathkar"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                href="https://instagram.com/honey.jsx"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
