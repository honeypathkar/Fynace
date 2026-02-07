"use client";

import Image from "next/image";
import Link from "next/link";

export default function TermsAndConditions() {
  return (
    <div
      className="container"
      style={{ paddingTop: "120px", paddingBottom: "80px", maxWidth: "800px" }}
    >
      <div
        style={{
          background: "var(--surface)",
          padding: "48px",
          borderRadius: "24px",
          border: "1px solid var(--glass-border)",
        }}
      >
        <h1 style={{ marginBottom: "16px" }}>Terms & Conditions</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
          Effective Date: February 1, 2026
        </p>

        <section style={{ marginBottom: "32px" }}>
          <p>By using Fynace, you agree to the following Terms & Conditions.</p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "16px",
              color: "var(--text-main)",
            }}
          >
            1. Use of the App
          </h2>
          <p style={{ color: "var(--text-muted)" }}>Fynace allows users to:</p>
          <ul
            style={{
              color: "var(--text-muted)",
              paddingLeft: "20px",
              marginTop: "8px",
            }}
          >
            <li>Create an account</li>
            <li>Track and manage expenses</li>
            <li>View analytics and charts</li>
            <li>Scan QR codes for payments</li>
            <li>Receive alerts for upcoming expenses</li>
          </ul>
          <p style={{ marginTop: "16px" }}>
            You agree to use the app only for lawful and personal financial
            management purposes.
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
            2. User Responsibilities
          </h2>
          <p style={{ color: "var(--text-muted)" }}>You are responsible for:</p>
          <ul
            style={{
              color: "var(--text-muted)",
              paddingLeft: "20px",
              marginTop: "8px",
            }}
          >
            <li>Maintaining the confidentiality of your account</li>
            <li>Ensuring the accuracy of expense data you enter</li>
            <li>Any activity performed through your account</li>
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
            3. Payments & Transactions
          </h2>
          <ul style={{ color: "var(--text-muted)", paddingLeft: "20px" }}>
            <li>Fynace does not process payments directly</li>
            <li>QR scanning redirects to third-party UPI apps</li>
            <li>We are not responsible for failed or incorrect payments</li>
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
            4. Data Accuracy
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Expense insights and analytics are based on user-provided data and
            selected SMS messages. We do not guarantee 100% accuracy of
            financial insights.
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
            5. Account Termination
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            We reserve the right to suspend or terminate accounts violating
            these terms. You may delete your account at any time.
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
            6. Limitation of Liability
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Fynace is provided “as is”. We are not liable for financial losses,
            data inaccuracies, or app downtime.
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
            7. Intellectual Property
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            All content, branding, and features of Fynace are the intellectual
            property of the app owner.
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
            8. Contact Information
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            For support or legal queries:
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
