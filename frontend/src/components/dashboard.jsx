import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(savedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">

      <nav className="navbar">

        <h2>User Authentication</h2>

        <div>

          <button
            onClick={() => navigate("/profile")}
            style={{ background: "#2563eb" }}
          >
            Profile
          </button>

          <button onClick={handleLogout}>
            Logout
          </button>

        </div>

      </nav>


      <main className="dashboard-content">

        <h1>
          Welcome, {user.name}! 👋
        </h1>

        <p>
          You have successfully logged in to your account.
        </p>


        <div className="user-card">

          <h3>
            User Information
          </h3>

          <p>
            <strong>Name:</strong> {user.name}
          </p>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Account Status:</strong>{" "}
            <span className="active-status">
              {user.isActive ? "Active" : "Inactive"}
            </span>
          </p>

        </div>


        <div className="user-card">

          <h3>
            Quick Actions
          </h3>

          <p>
            Manage your personal information,
            education details and security settings
            from your profile.
          </p>

          <button
            className="profile-button"
            onClick={() => navigate("/profile")}
          >
            Manage My Profile
          </button>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;