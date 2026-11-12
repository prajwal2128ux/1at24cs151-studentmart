import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
            role,
          }),
        }
      );

      const contentType = response.headers.get("content-type");
      const data =
        contentType && contentType.includes("application/json")
          ? await response.json()
          : {};

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password."
        );
      }

      if (!data.token) {
        throw new Error("The server did not return a login token.");
      }

      // Determine the resolved role
      const effectiveRole =
        role === "admin" || data.user?.role === "admin"
          ? "admin"
          : "customer";

      // Save token and user object with the active role
      localStorage.setItem("studentmartToken", data.token);

      const userObject = {
        ...(data.user || {}),
        role: effectiveRole,
      };
      localStorage.setItem("studentmartUser", JSON.stringify(userObject));

      // Redirect immediately to the chosen dashboard
      if (effectiveRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/customer/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Login</h2>

      {/* Role Toggle Switcher */}
      <div className="role-toggle-bar">
        <button
          type="button"
          className={`role-toggle-btn ${role === "customer" ? "active" : ""}`}
          onClick={() => {
            setRole("customer");
            setMessage("");
          }}
        >
          🎓 Student
        </button>
        <button
          type="button"
          className={`role-toggle-btn ${role === "admin" ? "active admin-active" : ""}`}
          onClick={() => {
            setRole("admin");
            setMessage("");
          }}
        >
          🛡️ Store Admin
        </button>
      </div>

      <p className="auth-description">
        {role === "admin"
          ? "Sign in as Administrator to manage campus store items and inventory."
          : "Welcome back. Sign in to browse and buy products."}
      </p>

      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="login-email">
            {role === "admin" ? "Admin Email" : "Email Address"}
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={
              role === "admin" ? "admin@studentmart.com" : "Enter your email"
            }
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading
            ? "Signing in..."
            : role === "admin"
            ? "Login to Admin Dashboard"
            : "Login to Student Store"}
        </button>
      </form>

      {message && (
        <p className="auth-message error" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}

export default Login;
