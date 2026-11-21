import React from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const admin = user?.role === "admin";

  return (
    <div className="form-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">ACCOUNT SETTINGS</span>
          <h1>My Profile</h1>
          <p>Verified campus membership and account credentials.</p>
        </div>
      </div>

      <section className="profile-card">
        <div className="profile-cover">
          <div className="profile-avatar-large">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h2>{user?.name || "Student"}</h2>
            <span>{admin ? "ADMINISTRATOR" : "STUDENT MEMBER"}</span>
          </div>
        </div>

        <div className="profile-form-grid">
          <div className="form-field">
            <label>Full Name</label>
            <input value={user?.name || ""} readOnly />
          </div>

          <div className="form-field">
            <label>Registered Email Address</label>
            <input value={user?.email || ""} readOnly />
          </div>

          <div className="form-field">
            <label>Account Permission Level</label>
            <input value={admin ? "System Administrator (Full Access)" : "Verified Student"} readOnly />
          </div>

          <div className="form-field">
            <label>Verification Status</label>
            <input value="Active • College Verified Member" readOnly />
          </div>
        </div>

        <div style={{
          marginTop: "24px",
          padding: "16px 20px",
          borderRadius: "12px",
          background: "var(--success-bg)",
          border: "1px solid var(--success-border)",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          color: "#166534",
          fontSize: "13px"
        }}>
          <ShieldCheck size={22} style={{ flexShrink: 0, color: "var(--success)" }} />
          <div>
            <strong style={{ display: "block", color: "var(--text-primary)", fontSize: "13.5px" }}>
              Campus Verified Account
            </strong>
            <p style={{ margin: "3px 0 0", color: "var(--text-secondary)", fontSize: "12px" }}>
              Your account is authenticated via secure session cookies. Purchases and listings are protected under StudentMart peer safety guidelines.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
