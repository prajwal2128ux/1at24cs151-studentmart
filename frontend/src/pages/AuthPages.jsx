import React, { useState, useEffect, useRef } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AppleNavbar from "../components/landing/AppleNavbar";
import "../styles/apple-landing.css";

function AuthShell({ mode, onSwitchMode, children }) {
  const navigate = useNavigate();

  const handleNavbarNavigate = (navId) => {
    if (navId === "home") {
      navigate("/");
      return;
    }
    if (navId === "login") {
      onSwitchMode("login");
      return;
    }
    if (navId === "about") {
      navigate("/#about");
      return;
    }
    if (navId === "contact") {
      navigate("/#contact");
      return;
    }
    if (navId === "support") {
      navigate("/#support");
    }
  };

  return (
    <div className="apple-auth-page-wrapper">
      <AppleNavbar activeNav="login" onNavigate={handleNavbarNavigate} />

      <main className="apple-auth-centered">
        <div className="apple-auth-container">
          <div className="apple-auth-top-bar">
            <Link to="/" className="apple-back-home-btn">
              <ArrowLeft size={15} />
              <span>Back to Home</span>
            </Link>
          </div>

          <div id="login-card" className="apple-auth-card apple-auth-card-centered">
            <div className="apple-auth-brand-mark">
              <Store size={22} />
            </div>

            <div className="apple-auth-header centered">
              <h1>
                {mode === "login" ? "Sign in to StudentMart" : "Create your StudentMart Account"}
              </h1>
              <p>
                {mode === "login"
                  ? "Use your registered student or admin email to continue."
                  : "One verified campus account for buying and tracking orders."}
              </p>
            </div>

            <div className="apple-pill-toggle">
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => onSwitchMode("login")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={mode === "register" ? "active" : ""}
                onClick={() => onSwitchMode("register")}
              >
                Create Account
              </button>
            </div>

            {children}

            <div className="apple-auth-badge-note">
              <ShieldCheck size={14} />
              <span>Protected campus session · Role-based access</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function Login({ initialMode = "login" }) {
  const { login, register, user, authLoading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const emailInputRef = useRef(null);

  useEffect(() => {
    setMode(initialMode);
    setError("");
  }, [initialMode]);

  if (!authLoading && user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/shop"} replace />;
  }

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    navigate(nextMode === "login" ? "/login" : "/register", { replace: true });
  };

  const update = (e) =>
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const logged =
        mode === "login"
          ? await login({ email: form.email, password: form.password })
          : await register(form);
      navigate(logged.role === "admin" ? "/admin" : "/shop", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (mode === "login"
            ? "Login failed. Check your email and password."
            : "Registration failed.")
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell mode={mode} onSwitchMode={switchMode}>
      <form onSubmit={submit}>
        {mode === "register" && (
          <div className="apple-form-group">
            <label htmlFor="reg-name">Full Name</label>
            <div className="apple-input-box">
              <UserRound size={16} />
              <input
                id="reg-name"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={update}
                required
                maxLength={80}
                autoComplete="name"
              />
            </div>
          </div>
        )}

        <div className="apple-form-group">
          <label htmlFor="auth-email">Email Address</label>
          <div className="apple-input-box">
            <Mail size={16} />
            <input
              ref={emailInputRef}
              id="auth-email"
              name="email"
              type="email"
              placeholder="name@campus.edu"
              value={form.email}
              onChange={update}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="apple-form-group">
          <label htmlFor="auth-pass">Password</label>
          <div className="apple-input-box">
            <LockKeyhole size={16} />
            <input
              id="auth-pass"
              name="password"
              type="password"
              placeholder={mode === "register" ? "At least 8 characters" : "Enter your password"}
              minLength={mode === "register" ? 8 : undefined}
              value={form.password}
              onChange={update}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>
        </div>

        {error && <div className="apple-auth-error">{error}</div>}

        <button className="apple-primary-btn" disabled={busy} type="submit">
          {busy
            ? "Please wait..."
            : mode === "login"
            ? "Sign in to StudentMart"
            : "Create my account"}
          <ArrowRight size={16} />
        </button>
      </form>

      <p className="apple-auth-switch">
        {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => switchMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Create yours now" : "Sign in instead"}
        </button>
      </p>
    </AuthShell>
  );
}

export function Register() {
  return <Login initialMode="register" />;
}
