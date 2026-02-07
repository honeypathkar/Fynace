"use client";

import Image from "next/image";

export default function PrivacyPolicy() {
  return (
    <div>
      <div
        style={{
          background: "var(--surface)",
          padding: "20px",
          // borderRadius: "24px",
        }}
      >
        <h1 style={{ marginBottom: "16px" }}>Privacy Policy</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
          Effective Date: February 1, 2026
        </p>

        <section style={{ marginBottom: "32px" }}>
          <p>
            Fynace (“we”, “our”, “us”) respects your privacy and is committed to
            protecting your personal information. This Privacy Policy explains
            how we collect, use, store, and protect your data when you use the
            Fynace mobile application.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "16px",
              color: "var(--text-main)",
            }}
          >
            1. Information We Collect
          </h2>
          <p>
            We collect only the data required to provide core app functionality.
          </p>

          <div style={{ marginTop: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>
              a. Personal Information
            </h3>
            <ul style={{ color: "var(--text-muted)", paddingLeft: "20px" }}>
              <li>Name</li>
              <li>Email address (via Google Sign-In)</li>
            </ul>
          </div>

          <div style={{ marginTop: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>
              b. Authentication Data
            </h3>
            <ul style={{ color: "var(--text-muted)", paddingLeft: "20px" }}>
              <li>OTP (for email verification)</li>
              <li>Google Sign-In credentials (name & email only)</li>
            </ul>
          </div>

          <div style={{ marginTop: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>
              c. Financial & App Usage Data
            </h3>
            <ul style={{ color: "var(--text-muted)", paddingLeft: "20px" }}>
              <li>Expense details (amount, category, date, notes)</li>
              <li>Bank names (stored locally on device only)</li>
              <li>Upcoming expenses & runway alerts</li>
              <li>Monthly and category-wise expense data (used for charts)</li>
            </ul>
          </div>

          <div style={{ marginTop: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>
              d. SMS Access (Optional & On-Device Processing)
            </h3>
            <ul style={{ color: "var(--text-muted)", paddingLeft: "20px" }}>
              <li>
                <strong>On-Device Processing:</strong> All SMS scanning and
                parsing happens entirely on your device. We do not upload,
                store, or process your SMS messages on our servers.
              </li>
              <li>
                <strong>Transactional Focus:</strong> We only look for
                bank-related or financial transaction messages to help you track
                expenses.
              </li>
              <li>
                <strong>User Control:</strong> The app only fetches transaction
                details when you explicitly trigger the "Scan" feature, and
                nothing is saved to your account until you confirm it.
              </li>
              <li>
                <strong>Privacy:</strong> We strictly ignore personal
                conversations, OTPs (unless for login), and unrelated messages.
              </li>
            </ul>
          </div>

          <div style={{ marginTop: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>
              e. Device Features
            </h3>
            <ul style={{ color: "var(--text-muted)", paddingLeft: "20px" }}>
              <li>Biometric authentication (fingerprint/face unlock)</li>
              <li>Camera access (for QR code scanning)</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "16px",
              color: "var(--text-main)",
            }}
          >
            2. How We Use Your Information
          </h2>
          <p style={{ color: "var(--text-muted)" }}>Your data is used to:</p>
          <ul
            style={{
              color: "var(--text-muted)",
              paddingLeft: "20px",
              marginTop: "8px",
            }}
          >
            <li>Create and manage your account</li>
            <li>Track expenses and generate analytics</li>
            <li>Show monthly and category-wise charts</li>
            <li>Enable QR code scanning for UPI payments</li>
            <li>Detect transactions from selected bank SMS</li>
            <li>Secure the app using biometric lock</li>
            <li>Send alerts for upcoming expenses and runway warnings</li>
          </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "16px",
              color: "var(--text-main)",
            }}
          >
            3. Data Storage & Security
          </h2>
          <ul style={{ color: "var(--text-muted)", paddingLeft: "20px" }}>
            <li>
              All user data is securely stored using industry-standard security
              measures
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
              <strong>Bank Info:</strong> Any bank names associated with your
              expenses are stored in your device's local storage (e.g.,
              SharedPreferences/UserDefaults) and are not synced to our servers.
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "16px",
              color: "var(--text-main)",
            }}
          >
            4. Permissions We Request
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Fynace requests permissions only when required, including SMS access
            (bank messages only), Camera (QR scanning), Biometric
            authentication, and Internet access. You can revoke permissions
            anytime from your device settings.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "16px",
              color: "var(--text-main)",
            }}
          >
            5. Third-Party Services
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            We may use trusted third-party services like Google Sign-In and App
            analytics. These services follow their own privacy policies.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "16px",
              color: "var(--text-main)",
            }}
          >
            6. Data Retention
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Your data remains stored as long as your account is active. You may
            request account deletion at any time, upon which all personal data
            will be permanently removed.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "16px",
              color: "var(--text-main)",
            }}
          >
            7. Contact Us
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            For privacy concerns or data deletion requests:
          </p>
          <p style={{ marginTop: "8px" }}>
            <a
              href="mailto:support@fynace.in"
              style={{ color: "var(--primary)" }}
            >
              📧 support@fynace.in
            </a>
          </p>
        </section>

        <footer
          style={{
            borderTop: "1px solid var(--glass-border)",
            paddingTop: "24px",
            marginTop: "48px",
            color: "var(--text-muted)",
            fontSize: "0.9rem",
          }}
        >
          <p>© 2026 Fynace. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
