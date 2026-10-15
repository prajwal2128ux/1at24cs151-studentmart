
import { useState } from "react";
import { API_BASE_URL } from "../config";

function Register() {
  const [form, setForm] = useState({
    usn: "",
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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

      setMessage(data.message || "Registration successful. You can log in now.");
      setMessageType("success");

      setForm({
        usn: "",
        name: "",
        email: "",
        password: "",
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
      <p className="auth-description">
        Create your StudentMart student account.
      </p>

      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="register-usn">Student USN</label>
          <input
            id="register-usn"
            name="usn"
            type="text"
            value={form.usn}
            onChange={handleChange}
            placeholder="Enter your USN"
            required
          />
        </div>

        <div>
          <label htmlFor="register-name">Name</label>
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
          <label htmlFor="register-email">Email</label>
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
          {loading ? "Registering..." : "Register"}
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
