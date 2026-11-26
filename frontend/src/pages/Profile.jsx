import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  KeyRound,
  Pencil,
  Save,
  ShieldCheck,
  Trash2,
  X,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../api";

function resolveAvatarUrl(avatar) {
  if (!avatar || typeof avatar !== "string") return "";
  if (avatar.startsWith("data:") || avatar.startsWith("http") || avatar.startsWith("blob:")) {
    return avatar;
  }
  return `${API_BASE}/${avatar.replace(/^\/+/, "")}`;
}

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const admin = user?.role === "admin";
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    campusAddress: "",
    bio: ""
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwStatus, setPwStatus] = useState(null);

  const syncFormFromUser = () => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      department: user?.department || "",
      campusAddress: user?.campusAddress || "",
      bio: user?.bio || ""
    });
    setAvatarFile(null);
    setAvatarPreview(resolveAvatarUrl(user?.avatar));
    setRemoveAvatar(false);
  };

  useEffect(() => {
    syncFormFromUser();
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const startEditing = () => {
    syncFormFromUser();
    setStatus(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    syncFormFromUser();
    setStatus(null);
    setEditing(false);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setStatus({ type: "error", message: "Profile picture must be JPG, PNG, or WEBP." });
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: "error", message: "Profile picture must be 5 MB or smaller." });
      e.target.value = "";
      return;
    }
    setStatus(null);
    setAvatarFile(file);
    setRemoveAvatar(false);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setRemoveAvatar(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateProfile = () => {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim().toLowerCase();
    const trimmedPhone = form.phone.trim();

    if (!trimmedName || trimmedName.length > 80) {
      return "Full name is required (maximum 80 characters).";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return "Please enter a valid email address.";
    }
    if (trimmedPhone && !/^[+\d\s()-]{7,20}$/.test(trimmedPhone)) {
      return "Please enter a valid phone number (7 to 20 digits).";
    }
    if (form.department.trim().length > 100) {
      return "Department / office title must be 100 characters or fewer.";
    }
    if (!admin && form.campusAddress.trim().length > 200) {
      return "Campus hostel / address must be 200 characters or fewer.";
    }
    if (form.bio.trim().length > 240) {
      return "Bio must be 240 characters or fewer.";
    }
    return "";
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setStatus(null);

    const validationError = validateProfile();
    if (validationError) {
      setStatus({ type: "error", message: validationError });
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("email", form.email.trim().toLowerCase());
    fd.append("phone", form.phone.trim());
    fd.append("department", form.department.trim());
    if (!admin) {
      fd.append("campusAddress", form.campusAddress.trim());
    }
    fd.append("bio", form.bio.trim());
    if (avatarFile) {
      fd.append("avatar", avatarFile);
    } else if (removeAvatar) {
      fd.append("removeAvatar", "true");
    }

    setSaving(true);
    try {
      const res = await updateProfile(fd);
      setEditing(false);
      setStatus({
        type: "success",
        message: res?.message || "Profile updated successfully."
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Unable to update profile."
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwStatus(null);

    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwStatus({ type: "error", message: "Complete all password fields." });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwStatus({ type: "error", message: "New password must contain at least 8 characters." });
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwStatus({ type: "error", message: "New password and confirmation do not match." });
      return;
    }
    if (pwForm.currentPassword === pwForm.newPassword) {
      setPwStatus({ type: "error", message: "New password must differ from your current password." });
      return;
    }

    setPwBusy(true);
    try {
      const res = await changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordOpen(false);
      setPwStatus({
        type: "success",
        message: res?.message || "Password updated successfully."
      });
    } catch (err) {
      setPwStatus({
        type: "error",
        message: err.response?.data?.message || "Unable to update password."
      });
    } finally {
      setPwBusy(false);
    }
  };

  const displayedAvatar = editing ? avatarPreview : resolveAvatarUrl(user?.avatar);

  return (
    <div className="form-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">ACCOUNT SETTINGS</span>
          <h1>{admin ? "Admin Profile" : "My Profile"}</h1>
          <p>
            {admin
              ? "Manage your administrator account details and credentials."
              : "View and update your verified campus account details."}
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            className="primary-action"
            onClick={startEditing}
          >
            <Pencil size={15} />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {status && (
        <div
          className={`profile-status-alert ${status.type}`}
          role={status.type === "error" ? "alert" : "status"}
        >
          {status.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{status.message}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <section className="profile-card">
        <div className="profile-cover profile-cover-split">
          <div className="profile-cover-identity">
            <div className="profile-avatar-large">
              {displayedAvatar ? (
                <img src={displayedAvatar} alt={user?.name || "Profile"} className="avatar-img-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <div>
              <h2>{user?.name || (admin ? "Administrator" : "Student")}</h2>
              <div className="profile-meta-pills">
                <span>{admin ? "ADMINISTRATOR" : "STUDENT MEMBER"}</span>
                {user?.email && <small>{user.email}</small>}
              </div>
            </div>
          </div>

          {editing && (
            <div className="profile-avatar-controls">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarSelect}
                style={{ display: "none" }}
                aria-label="Upload profile picture"
              />
              <button
                type="button"
                className="profile-photo-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={14} />
                <span>{displayedAvatar ? "Change Photo" : "Upload Photo"}</span>
              </button>
              {displayedAvatar && (
                <button
                  type="button"
                  className="profile-photo-remove-btn"
                  onClick={handleRemovePhoto}
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSaveProfile} noValidate>
          <div className="profile-form-grid">
            <div className="form-field">
              <label htmlFor="prof-name">Full Name</label>
              <input
                id="prof-name"
                name="name"
                value={form.name}
                onChange={handleFieldChange}
                readOnly={!editing}
                placeholder="Enter your full name"
                maxLength={80}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="prof-email">Email Address</label>
              <input
                id="prof-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleFieldChange}
                readOnly={!editing}
                placeholder="name@campus.edu"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="prof-phone">Phone Number</label>
              <input
                id="prof-phone"
                name="phone"
                value={form.phone}
                onChange={handleFieldChange}
                readOnly={!editing}
                placeholder={editing ? "e.g. +91 9876543210" : "Not provided"}
                maxLength={20}
              />
            </div>

            <div className="form-field">
              <label htmlFor="prof-dept">
                {admin ? "Office / Department" : "Department / Course"}
              </label>
              <input
                id="prof-dept"
                name="department"
                value={form.department}
                onChange={handleFieldChange}
                readOnly={!editing}
                placeholder={editing ? (admin ? "e.g. Store Operations" : "e.g. Computer Science & Engg.") : "Not provided"}
                maxLength={100}
              />
            </div>

            {!admin && (
              <div className="form-field full-width">
                <label htmlFor="prof-address">Campus Hostel / Delivery Address</label>
                <input
                  id="prof-address"
                  name="campusAddress"
                  value={form.campusAddress}
                  onChange={handleFieldChange}
                  readOnly={!editing}
                  placeholder={editing ? "e.g. Hostel Block B, Room 304" : "Not provided"}
                  maxLength={200}
                />
              </div>
            )}

            <div className="form-field full-width">
              <label htmlFor="prof-bio">Bio / Notes</label>
              <textarea
                id="prof-bio"
                name="bio"
                rows={3}
                value={form.bio}
                onChange={handleFieldChange}
                readOnly={!editing}
                placeholder={editing ? "Short description about your campus role or pickup preferences" : "No bio added yet."}
                maxLength={240}
              />
            </div>

            <div className="form-field">
              <label>Account Role</label>
              <input
                value={admin ? "System Administrator (Protected)" : "Verified Student"}
                readOnly
                className="readonly-locked-input"
              />
            </div>

            <div className="form-field">
              <label>Verification Status</label>
              <input
                value="Active · Campus Verified Session"
                readOnly
                className="readonly-locked-input"
              />
            </div>
          </div>

          {editing && (
            <div className="profile-form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={cancelEditing}
                disabled={saving}
              >
                <X size={15} />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                className="save-product-button"
                disabled={saving}
              >
                <Save size={15} />
                <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
              </button>
            </div>
          )}
        </form>

        <div className="profile-security-banner">
          <ShieldCheck size={20} />
          <div>
            <strong>Campus Verified Account</strong>
            <p>
              Your profile edits are stored securely in MongoDB and remain synced across sessions. Role permissions are enforced server-side.
            </p>
          </div>
        </div>
      </section>

      {/* Separate Password Security Card */}
      <section className="profile-card" style={{ marginTop: "20px" }}>
        <div className="profile-password-head">
          <div>
            <h3>Password &amp; Account Security</h3>
            <p>Update your account password separately to keep your session secure.</p>
          </div>
          {!passwordOpen && (
            <button
              type="button"
              className="back-button"
              onClick={() => {
                setPwStatus(null);
                setPasswordOpen(true);
              }}
            >
              <KeyRound size={15} />
              <span>Change Password</span>
            </button>
          )}
        </div>

        {pwStatus && (
          <div
            className={`profile-status-alert ${pwStatus.type}`}
            style={{ marginTop: "14px", marginBottom: passwordOpen ? "14px" : "0" }}
            role={pwStatus.type === "error" ? "alert" : "status"}
          >
            {pwStatus.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{pwStatus.message}</span>
          </div>
        )}

        {passwordOpen && (
          <form onSubmit={handlePasswordSubmit} className="profile-password-form">
            <div className="profile-form-grid">
              <div className="form-field full-width">
                <label htmlFor="pw-current">Current Password</label>
                <input
                  id="pw-current"
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="form-field">
                <label htmlFor="pw-new">New Password</label>
                <input
                  id="pw-new"
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="form-field">
                <label htmlFor="pw-confirm">Confirm New Password</label>
                <input
                  id="pw-confirm"
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="profile-form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setPasswordOpen(false);
                  setPwStatus(null);
                  setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }}
                disabled={pwBusy}
              >
                <X size={15} />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                className="save-product-button"
                disabled={pwBusy}
              >
                <KeyRound size={15} />
                <span>{pwBusy ? "Updating Password..." : "Update Password"}</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
