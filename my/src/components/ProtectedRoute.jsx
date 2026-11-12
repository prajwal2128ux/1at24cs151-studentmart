import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem("studentmartToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let user = null;
  try {
    const rawUser = localStorage.getItem("studentmartUser");
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch (err) {
    user = null;
  }

  const role = user?.role || "customer";

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Block customers from accessing admin routes
    if (role === "customer") {
      return <Navigate to="/customer/dashboard" replace />;
    }
    // Block admins from accessing customer routes
    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}

