
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Login() {
  const navigate = useNavigate();

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
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password."
        );
      }

      if (!data.token) {
        throw new Error("The server did not return a login token.");
      }

      localStorage.setItem("studentmartToken", data.token);

      if (data.user) {
        localStorage.setItem(
          "studentmartUser",
          JSON.stringify(data.user)
        );
      }

      // Navigate to the dashboard after successful login
      navigate("/dashboard", { replace: true });
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

      <p className="auth-description">
        Welcome back. Sign in to your account.
      </p>

      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
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
          {loading ? "Logging in..." : "Login"}
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
