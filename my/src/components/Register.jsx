import { useState } from "react";
import { API_BASE_URL } from "../config";

function Register() {
  const [form, setForm] = useState({
    usn: "",
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleRoleChange(newRole) {
    setForm((prev) => ({
      ...prev,
      role: newRole,
    }));
    setMessage("");
  }

  async function handleRegister(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const contentType = response.headers.get("content-type");
      const data =
        contentType && contentType.includes("application/json")
          ? await response.json()
          : {};

      if (!response.ok) {
        throw new Error(data.message || "Registration failed. Server returned an error.");
      }

      const roleLabel = form.role === "admin" ? "Store Administrator" : "Student";
      setMessage(
        data.message || `Account created successfully as ${roleLabel}! You can now sign in using the Login form.`
      );
      setMessageType("success");

      setForm({
        usn: "",
        name: "",
        email: "",
        password: "",
        role: form.role,
      });
    } catch (error) {
      console.error("Registration error:", error);
      setMessage(
        error.message || "Unable to connect to the server."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Create Account</h2>

      {/* Role Toggle Switcher */}
      <div className="role-toggle-bar">
        <button
          type="button"
          className={`role-toggle-btn ${form.role === "customer" ? "active" : ""}`}
          onClick={() => handleRoleChange("customer")}
        >
          🎓 Student
        </button>
        <button
          type="button"
          className={`role-toggle-btn ${form.role === "admin" ? "active admin-active" : ""}`}
          onClick={() => handleRoleChange("admin")}
        >
          🛡️ Store Admin
        </button>
      </div>

      <p className="auth-description">
        {form.role === "admin"
          ? "Create an Administrator account to publish and manage campus products."
          : "Create a Student account to shop and trade campus items."}
      </p>

      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="register-usn">
            {form.role === "admin" ? "Admin ID / USN" : "Student USN"}
          </label>
          <input
            id="register-usn"
            name="usn"
            type="text"
            value={form.usn}
            onChange={handleChange}
            placeholder={form.role === "admin" ? "e.g. ADM001 or USN" : "Enter your USN"}
            required
          />
        </div>

        <div>
          <label htmlFor="register-name">Full Name</label>
          <input
            id="register-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </div>

        <div>
          <label htmlFor="register-email">Email Address</label>
          <input
            id="register-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            minLength={6}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading
            ? "Creating account..."
            : form.role === "admin"
            ? "Register as Administrator"
            : "Register as Student"}
        </button>
      </form>

      {message && (
        <p className={`auth-message ${messageType}`} role="status">
          {message}
        </p>
      )}
    </div>
  );
}

export default Register;
