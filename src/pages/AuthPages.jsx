import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, BookOpen, Boxes, LockKeyhole, Mail, Package, ShieldCheck, ShoppingBag, Sparkles, Store, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function AuthShell({ mode, setMode, children }) {
  return <main className="auth-experience">
    <section className="auth-showcase">
      <div className="auth-showcase-top"><div className="auth-logo"><Store size={22}/></div><span>STUDENTMART</span><span className="auth-campus-tag">CAMPUS MARKETPLACE</span></div>
      <div className="auth-showcase-copy"><span className="auth-kicker"><Sparkles size={14}/> YOUR CAMPUS, YOUR MARKET</span><h1>Everything campus life needs. <em>In one place.</em></h1><p>Discover essentials, shop from your campus community and get what you need without the hassle.</p>
        <div className="auth-feature-list"><div><ShoppingBag/><span><b>Easy shopping</b><small>Find useful products in seconds</small></span></div><div><ShieldCheck/><span><b>One secure account</b><small>Role-based access for shoppers and admins</small></span></div><div><Boxes/><span><b>Order tracking</b><small>Follow your purchases from one place</small></span></div></div>
      </div>
      <div className="auth-showcase-bottom"><span>MADE FOR CAMPUS LIFE</span><span>01 — 03</span></div>
      <div className="auth-decoration auth-decoration-one"/><div className="auth-decoration auth-decoration-two"/>
    </section>
    <section className="auth-panel"><div className="auth-panel-inner">
      <div className="auth-mobile-brand"><div className="auth-logo"><Store size={20}/></div><b>StudentMart</b></div>
      <div className="auth-panel-heading"><span className="auth-kicker">{mode === "login" ? "WELCOME BACK" : "GET STARTED"}</span><h2>{mode === "login" ? "Sign in to your account" : "Create your account"}</h2><p>{mode === "login" ? "Access your marketplace and continue where you left off." : "Join the StudentMart campus community today."}</p></div>
      <div className="auth-mode-switch"><button type="button" className={mode === "login" ? "selected" : ""} onClick={() => setMode("login")}>Sign in</button><button type="button" className={mode === "register" ? "selected" : ""} onClick={() => setMode("register")}>Create account</button></div>
      {children}
      <div className="auth-security-note"><ShieldCheck size={15}/> Secure access · Admin and customer accounts use the same sign-in</div>
      <div className="auth-panel-footer">© {new Date().getFullYear()} StudentMart <span>•</span> Campus commerce, simplified</div>
    </div></section>
  </main>;
}

export function Login({ initialMode = "login" }) {
  const { login, register, user, authLoading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!authLoading && user) return <Navigate to={user.role === "admin" ? "/admin" : "/shop"} replace />;
  const update = e => setForm(current => ({ ...current, [e.target.name]: e.target.value }));
  const submit = async e => {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const logged = mode === "login" ? await login({ email: form.email, password: form.password }) : await register(form);
      navigate(logged.role === "admin" ? "/admin" : "/shop", { replace: true });
    } catch (err) { setError(err.response?.data?.message || (mode === "login" ? "Login failed." : "Registration failed.")); }
    finally { setBusy(false); }
  };
  return <AuthShell mode={mode} setMode={next => { setMode(next); setError(""); }}>
    <form className="auth-form auth-form-modern" onSubmit={submit}>
      {mode === "register" && <><label>Full name</label><div className="auth-input"><UserRound size={17}/><input name="name" placeholder="Enter your full name" value={form.name} onChange={update} required maxLength={80} autoComplete="name"/></div></>}
      <label>Email address</label><div className="auth-input"><Mail size={17}/><input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={update} required autoComplete="email"/></div>
      <div className="auth-label-row"><label>Password</label>{mode === "login" && <span>Use your registered password</span>}</div><div className="auth-input"><LockKeyhole size={17}/><input name="password" type="password" placeholder={mode === "register" ? "At least 8 characters" : "Enter your password"} minLength={mode === "register" ? 8 : undefined} value={form.password} onChange={update} required autoComplete={mode === "login" ? "current-password" : "new-password"}/></div>
      {mode === "register" && <small className="auth-hint">New registrations are customer accounts. Administrator access is assigned securely by the system.</small>}
      {error && <div className="form-error">{error}</div>}
      <button className="auth-submit" disabled={busy}>{busy ? "Please wait..." : mode === "login" ? "Sign in to StudentMart" : "Create my account"}<ArrowRight size={17}/></button>
    </form>
    <p className="auth-switch-modern">{mode === "login" ? "New to StudentMart?" : "Already have an account?"} <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Create an account" : "Sign in instead"}</button></p>
  </AuthShell>;
}

export function Register() { return <Login initialMode="register"/>; }
