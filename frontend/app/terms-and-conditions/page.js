"use client";

import Link from "next/link";
import Image from "next/image";

export default function TermsAndConditions() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <div
        style={{
          background: "var(--glass)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--glass-border)",
          padding: "20px 0",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            width: "min(900px, 92%)",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontWeight: 700,
              fontSize: "1.2rem",
              letterSpacing: "-0.02em",
            }}
          >
            <Image
              src="/images/logo.png"
              alt="Fynace"
              width={32}
              height={32}
              style={{ borderRadius: "8px" }}
            />
            Fynace
          </Link>
          <Link
            href="/"
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          width: "min(900px, 92%)",
          margin: "0 auto",
          padding: "60px 0 100px",
        }}
      >
        {/* Hero */}
        <div style={{ marginBottom: "60px" }}>
          <span
            style={{
              display: "inline-flex",
              padding: "6px 14px",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: "100px",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--primary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "20px",
            }}
          >
            Legal
          </span>
          <h1
            style={{
              fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            Terms & Conditions
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
            Effective Date: February 1, 2026 · Last updated: March 2026
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {/* Intro */}
          <PolicySection>
            <p
              style={{
                color: "var(--text-muted)",
                lineHeight: 1.8,
                fontSize: "1.05rem",
              }}
            >
              By downloading, installing, or using Fynace, you agree to be bound
              by these Terms & Conditions. If you do not agree with any part of
              these terms, please do not use the application.
            </p>
          </PolicySection>

          <PolicySection title="1. Use of the App">
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
              Fynace allows users to:
            </p>
            <ul
              style={{
                color: "var(--text-muted)",
                paddingLeft: "20px",
                lineHeight: 2,
              }}
            >
              <li>Create and manage a personal finance account</li>
              <li>Track and manage expenses and income</li>
              <li>View analytics, charts, and spending breakdowns</li>
              <li>Scan QR codes for UPI payment reference</li>
              <li>Set monthly category budgets and receive threshold alerts</li>
              <li>Manage recurring transactions automatically</li>
              <li>Receive push notifications for financial insights</li>
            </ul>
            <p style={{ marginTop: "16px", color: "var(--text-muted)" }}>
              You agree to use the app only for lawful and personal financial
              management purposes.
            </p>
          </PolicySection>

          <PolicySection title="2. Budget Alerts & Notifications">
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              Fynace provides an intelligent budget monitoring system. By
              enabling budget alerts, you acknowledge:
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <HighlightItem
                icon="🔔"
                text="Alerts are sent when you reach 50%, 70%, 80%, 90%, and 100% of a category's monthly budget."
              />
              <HighlightItem
                icon="📈"
                text="Categories like Investments and Savings receive positive milestone alerts, not warnings."
              />
              <HighlightItem
                icon="✅"
                text="Each threshold sends at most one notification per month per category, preventing notification spam."
              />
              <HighlightItem
                icon="⚙️"
                text="You can customize or disable budget alerts anytime under Tools & Settings → Notifications."
              />
            </div>
          </PolicySection>

          <PolicySection title="3. User Responsibilities">
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
              You are responsible for:
            </p>
            <ul
              style={{
                color: "var(--text-muted)",
                paddingLeft: "20px",
                lineHeight: 2,
              }}
            >
              <li>
                Maintaining the confidentiality of your account credentials
              </li>
              <li>Ensuring the accuracy of expense data you enter</li>
              <li>Any activity performed through your account</li>
              <li>Reviewing all budget limits and notification settings</li>
            </ul>
          </PolicySection>

          <PolicySection title="4. Payments & Transactions">
            <ul
              style={{
                color: "var(--text-muted)",
                paddingLeft: "20px",
                lineHeight: 2,
              }}
            >
              <li>Fynace does not process payments directly</li>
              <li>QR scanning redirects to third-party UPI apps</li>
              <li>We are not responsible for failed or incorrect payments</li>
              <li>Expense data you enter is for tracking purposes only</li>
            </ul>
          </PolicySection>

          <PolicySection title="5. Push Notifications">
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
              By enabling notifications, you consent to receiving alerts for
              budget thresholds, recurring transactions, daily reminders, and
              monthly summaries. You may opt out at any time through the app
              settings or your device notification settings.
            </p>
            <p style={{ color: "var(--text-muted)" }}>
              Fynace uses Firebase Cloud Messaging (FCM) for delivery.
              Notification preferences are stored under your account and can be
              managed granularly.
            </p>
          </PolicySection>

          <PolicySection title="6. Account Termination">
            <p style={{ color: "var(--text-muted)" }}>
              We reserve the right to suspend or terminate accounts that violate
              these Terms. You may request account deletion at any time by
              contacting support. Upon deletion, all associated data will be
              permanently removed within 30 days.
            </p>
          </PolicySection>

          <PolicySection title="7. Limitation of Liability">
            <p style={{ color: "var(--text-muted)" }}>
              Fynace is provided "as is". We are not liable for financial
              losses, data inaccuracies, missed budget alerts due to device or
              connectivity issues, or app downtime. Budget alerts are
              informational only and do not constitute financial advice.
            </p>
          </PolicySection>

          <PolicySection title="8. Intellectual Property">
            <p style={{ color: "var(--text-muted)" }}>
              All content, branding, design, and features of Fynace are the
              intellectual property of the app owner. Unauthorized reproduction,
              distribution, or modification of any part of the app is
              prohibited.
            </p>
          </PolicySection>

          <PolicySection title="9. Contact Information">
            <p style={{ color: "var(--text-muted)", marginBottom: "12px" }}>
              For support, legal queries, or account deletion requests:
            </p>
            <a
              href="mailto:support@fynace.in"
              style={{ color: "var(--primary)", fontWeight: 600 }}
            >
              📧 support@fynace.in
            </a>
          </PolicySection>
        </div>

        <div
          style={{
            marginTop: "60px",
            paddingTop: "40px",
            borderTop: "1px solid var(--glass-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            © 2026 Fynace. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "24px" }}>
            <Link
              href="/privacy-policy"
              style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}
            >
              Privacy Policy
            </Link>
            <a
              href="mailto:support@fynace.in"
              style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function PolicySection({ title, children }) {
  return (
    <div
      style={{
        padding: "40px",
        borderRadius: "20px",
        background: "rgba(15,23,42,0.5)",
        border: "1px solid var(--glass-border)",
        marginBottom: "16px",
      }}
    >
      {title && (
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            marginBottom: "20px",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

function HighlightItem({ icon, text }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "14px",
        alignItems: "flex-start",
        padding: "14px 18px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
        border: "1px solid var(--glass-border)",
      }}
    >
      <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{icon}</span>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.95rem",
          lineHeight: 1.7,
        }}
      >
        {text}
      </p>
    </div>
  );
}
