import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const {user}=useAuth();
  return <div className="form-page"><div className="page-heading"><div><span className="page-eyebrow">ACCOUNT</span><h1>My Profile</h1><p>Your StudentMart account information.</p></div></div><section className="profile-card"><div className="profile-cover"><div className="profile-avatar-large">{user?.name?.[0]?.toUpperCase()}</div><div><h2>{user?.name}</h2><span>{user?.role?.toUpperCase()}</span></div></div><div className="profile-form-grid"><div className="form-field"><label>Name</label><input value={user?.name||""} readOnly/></div><div className="form-field"><label>Email</label><input value={user?.email||""} readOnly/></div><div className="form-field"><label>Account role</label><input value={user?.role||""} readOnly/></div></div><p className="auth-subtitle">Profile editing can be added after account update and email verification workflows are configured.</p></section></div>;
}