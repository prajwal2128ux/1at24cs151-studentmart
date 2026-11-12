import "./style/App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Register from "./components/Register";
import Login from "./components/login";
import CustomerDashboard from "./components/CustomerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function AuthPage() {
  return (
    <main className="studentmart-page">
      <section className="welcome-panel">
        <div className="welcome-content">
          <h1>
            Student<span>Mart.</span>
          </h1>

          <p className="welcome-tagline">
            Your campus. Your community. Your marketplace.
          </p>

          <div className="welcome-illustration">
            <div className="circle circle-one"></div>
            <div className="circle circle-two"></div>

            <div className="market-card">
              <div className="market-icon">🛍️</div>
              <h2>Everything students need.</h2>

              <p>
                Buy, sell, and discover amazing deals on campus.
              </p>

              <div className="market-tags">
                <span>📚 Books</span>
                <span>💻 Gadgets</span>
                <span>🎒 Essentials</span>
              </div>
            </div>
          </div>

          <div className="welcome-bottom">
            <span className="online-dot"></span>
            Made for students, by students.
          </div>
        </div>
      </section>

      <section className="forms-panel">
        <div className="forms-heading">
          <span className="eyebrow">
            WELCOME TO STUDENTMART
          </span>

          <h2>Get started today.</h2>

          <p>
            Create an account or sign in to continue.
          </p>
        </div>

        <div className="forms-grid">
          <div className="form-card">
            <Register />
          </div>

          <div className="form-card">
            <Login />
          </div>
        </div>

        <p className="page-footer">
          © {new Date().getFullYear()} StudentMart · Your campus marketplace
        </p>
      </section>
    </main>
  );
}

function RoleBasedRedirect() {
  const token = localStorage.getItem("studentmartToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let user = null;
  try {
    const raw = localStorage.getItem("studentmartUser");
    user = raw ? JSON.parse(raw) : null;
  } catch {
    user = null;
  }

  return user?.role === "admin" ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/customer/dashboard" replace />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public authentication page */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />

        {/* Customer Dashboard Routes */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/*"
          element={<Navigate to="/customer/dashboard" replace />}
        />

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        {/* Legacy & Shortcut Routes */}
        <Route path="/dashboard" element={<RoleBasedRedirect />} />
        <Route path="/profile" element={<RoleBasedRedirect />} />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
