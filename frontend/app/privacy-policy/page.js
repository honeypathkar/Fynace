"use client";

import Link from "next/link";
import Image from "next/image";

export default function PrivacyPolicy() {
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
            Privacy Policy
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
              Fynace ("we", "our", "us") respects your privacy and is committed
              to protecting your personal information. This Privacy Policy
              explains how we collect, use, store, and protect your data when
              you use the Fynace mobile application.
            </p>
          </PolicySection>

          <PolicySection title="1. Information We Collect">
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              We collect only the data required to provide core app
              functionality.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <InfoBlock
                label="Personal Information"
                items={["Name", "Email address (via Google Sign-In or OTP)"]}
              />
              <InfoBlock
                label="Financial & App Usage Data"
                items={[
                  "Expense details (amount, category, date, notes)",
                  "Monthly and category-wise expense data (used for charts)",
                  "Budget limits and spending progress",
                ]}
              />
              <InfoBlock
                label="Device Features"
                items={[
                  "Biometric authentication (fingerprint/face unlock)",
                  "Camera access (for QR code scanning)",
                  "Firebase Cloud Messaging token (for push notifications)",
                ]}
              />
            </div>
          </PolicySection>

          <PolicySection title="2. How We Use Your Information">
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
              Your data is used to:
            </p>
            <ul
              style={{
                color: "var(--text-muted)",
                paddingLeft: "20px",
                lineHeight: 2,
              }}
            >
              <li>Create and manage your account</li>
              <li>Track expenses and generate analytics</li>
              <li>Show monthly and category-wise charts</li>
              <li>
                Send intelligent budget threshold alerts (at 50%, 70%, 80%, 90%,
                and 100% of your limit)
              </li>
              <li>
                Send daily reminders, monthly summaries, and smart insights via
                push notifications
              </li>
              <li>Secure the app using biometric lock</li>
              <li>Enable QR code scanning for UPI payments</li>
            </ul>
          </PolicySection>

          <PolicySection title="3. Smart Budget Alert System">
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              Fynace includes an intelligent budget monitoring system that
              notifies you when your spending reaches predefined thresholds
              within a category.
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <HighlightItem
                icon="🔔"
                text="Alerts are triggered at 50%, 70%, 80%, 90%, and 100% of your monthly budget limit."
              />
              <HighlightItem
                icon="🎯"
                text="Each threshold fires at most once per month per category — no duplicate notifications."
              />
              <HighlightItem
                icon="📈"
                text="Investment and savings categories display positive milestone alerts, not spending warnings."
              />
              <HighlightItem
                icon="🔒"
                text="Budget data is processed server-side and never shared with third parties."
              />
            </div>
          </PolicySection>

          <PolicySection title="4. Push Notifications">
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
              With your permission, we send push notifications for budget
              alerts, recurring transactions, daily reminders, and monthly
              summaries. You can disable any or all notification types at any
              time via the Tools & Settings screen in the app.
            </p>
            <p style={{ color: "var(--text-muted)" }}>
              We use Firebase Cloud Messaging (FCM) to deliver notifications.
              Your FCM token is stored securely on our servers tied to your
              device, and is only used to send you notifications you have opted
              into.
            </p>
          </PolicySection>

          <PolicySection title="5. Data Storage & Security">
            <ul
              style={{
                color: "var(--text-muted)",
                paddingLeft: "20px",
                lineHeight: 2,
              }}
            >
              <li>
                All user data is securely stored using industry-standard
                security measures
              </li>
              <li>Authentication data is encrypted</li>
              <li>
                Biometric data is never stored by Fynace — it is handled by your
                device only
              </li>
              <li>
                We do not sell or share your personal data with third parties
              </li>
              <li>
                Local data is synced to our secure cloud servers when you are
                online
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="6. Third-Party Services">
            <p style={{ color: "var(--text-muted)" }}>
              We use trusted third-party services including Google Sign-In,
              Firebase Cloud Messaging, and MongoDB Atlas. These services follow
              their own privacy policies and are used solely to operate core app
              functions.
            </p>
          </PolicySection>

          <PolicySection title="7. Permissions We Request">
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
              Fynace requests permissions only when required. All permissions
              are optional and can be revoked from your device settings at any
              time.
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <HighlightItem
                icon="📷"
                text="Camera — for QR code scanning (UPI payments)"
              />
              <HighlightItem
                icon="🔐"
                text="Biometrics — for app lock security"
              />
              <HighlightItem
                icon="🔔"
                text="Notifications — for budget alerts, reminders, and summaries"
              />
              <HighlightItem
                icon="🌐"
                text="Internet — for syncing data with our secure cloud"
              />
            </div>
          </PolicySection>

          <PolicySection title="8. Data Retention">
            <p style={{ color: "var(--text-muted)" }}>
              Your data remains stored as long as your account is active. You
              may request account deletion at any time by contacting support,
              upon which all personal data will be permanently removed from our
              servers within 30 days.
            </p>
          </PolicySection>

          <PolicySection title="9. Contact Us">
            <p style={{ color: "var(--text-muted)", marginBottom: "12px" }}>
              For privacy concerns or data deletion requests:
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
              href="/terms-and-conditions"
              style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}
            >
              Terms & Conditions
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
        background: "var(--card)",
        border: "1px solid var(--border)",
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

function InfoBlock({ label, items }) {
  return (
    <div
      style={{
        padding: "16px 20px",
        background: "var(--muted)",
        borderRadius: "12px",
        border: "1px solid var(--border)",
      }}
    >
      <p
        style={{
          fontSize: "0.8rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--primary)",
          marginBottom: "10px",
        }}
      >
        {label}
      </p>
      <ul
        style={{
          color: "var(--text-muted)",
          paddingLeft: "18px",
          lineHeight: 1.9,
        }}
      >
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
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
        background: "var(--muted)",
        borderRadius: "12px",
        border: "1px solid var(--border)",
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
