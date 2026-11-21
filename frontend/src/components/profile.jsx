import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    phone: "",
    address: "",
    bio: "",
    college: "",
    course: "",
    dateOfBirth: "",
    linkedin: "",
    github: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setUser(data.user);

      setForm({
        phone: data.user.phone || "",
        address: data.user.address || "",
        bio: data.user.bio || "",
        college: data.user.college || "",
        course: data.user.course || "",
        dateOfBirth: data.user.dateOfBirth
          ? data.user.dateOfBirth.substring(0, 10)
          : "",
        linkedin: data.user.linkedin || "",
        github: data.user.github || "",
      });

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
  name: user.name,
  email: user.email,
  ...form
}),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setUser(data.user);

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setMessage("Profile updated successfully!");

    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(passwordForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setMessage("Password changed successfully!");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
      });

    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  if (!user) {
    return (
      <div className="loading">
        Loading profile...
      </div>
    );
  }

  const filledFields = [
    user.name,
    user.email,
    form.phone,
    form.address,
    form.bio,
    form.college,
    form.course,
    form.dateOfBirth,
    form.linkedin,
    form.github,
  ].filter(Boolean).length;

  const profileCompletion = Math.round(
    (filledFields / 10) * 100
  );

  return (
    <div className="dashboard">

      <nav className="navbar">

        <h2>User Authentication</h2>

        <div>

          <button
            onClick={() => navigate("/dashboard")}
            style={{ background: "#2563eb" }}
          >
            Dashboard
          </button>

          <button onClick={handleLogout}>
            Logout
          </button>

        </div>

      </nav>


      <div className="profile-content">

        <h1>My Profile</h1>

        <p className="profile-subtitle">
          Manage your account information
        </p>


        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}


        <div className="profile-completion">

          <div className="completion-header">

            <strong>
              Profile Completion
            </strong>

            <span>
              {profileCompletion}%
            </span>

          </div>

          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width: `${profileCompletion}%`,
              }}
            ></div>

          </div>

        </div>


        {/* PERSONAL INFORMATION */}

        <div className="profile-card">

          <h2>
            👤 Personal Information
          </h2>

          <form onSubmit={handleSave}>

            <label>Name</label>

            <input
              type="text"
              value={user.name}
              disabled
            />


            <label>Email</label>

            <input
              type="email"
              value={user.email}
              disabled
            />


            <label>Phone</label>

            <input
              type="text"
              name="phone"
              placeholder="Enter 10-digit phone number"
              value={form.phone}
              onChange={handleChange}
            />


            <label>Address</label>

            <textarea
              name="address"
              placeholder="Enter your address"
              value={form.address}
              onChange={handleChange}
              rows="3"
            />


            <label>Bio</label>

            <textarea
              name="bio"
              placeholder="Tell us about yourself"
              value={form.bio}
              onChange={handleChange}
              rows="4"
            />


            <button
              type="submit"
              className="profile-button"
            >
              Save Personal Information
            </button>

          </form>

        </div>


        {/* EDUCATION */}

        <div className="profile-card">

          <h2>
            🎓 Education
          </h2>

          <form onSubmit={handleSave}>

            <label>College</label>

            <input
              type="text"
              name="college"
              placeholder="Enter your college"
              value={form.college}
              onChange={handleChange}
            />


            <label>Course</label>

            <input
              type="text"
              name="course"
              placeholder="Example: B.E. Computer Science"
              value={form.course}
              onChange={handleChange}
            />


            <label>Date of Birth</label>

            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
            />


            <button
              type="submit"
              className="profile-button"
            >
              Save Education
            </button>

          </form>

        </div>


        {/* SOCIAL LINKS */}

        <div className="profile-card">

          <h2>
            🔗 Social Links
          </h2>

          <form onSubmit={handleSave}>

            <label>LinkedIn</label>

            <input
              type="url"
              name="linkedin"
              placeholder="https://linkedin.com/in/yourname"
              value={form.linkedin}
              onChange={handleChange}
            />


            <label>GitHub</label>

            <input
              type="url"
              name="github"
              placeholder="https://github.com/yourname"
              value={form.github}
              onChange={handleChange}
            />


            <button
              type="submit"
              className="profile-button"
            >
              Save Social Links
            </button>

          </form>

        </div>


        {/* SECURITY */}

        <div className="profile-card">

          <h2>
            🔐 Security
          </h2>

          <form onSubmit={handlePasswordChange}>

            <label>
              Current Password
            </label>

            <input
              type="password"
              placeholder="Enter current password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
            />


            <label>
              New Password
            </label>

            <input
              type="password"
              placeholder="Enter new password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
            />


            <button
              type="submit"
              className="profile-button"
            >
              Change Password
            </button>

          </form>

        </div>


        {/* ACCOUNT INFORMATION */}

        <div className="profile-card">

          <h2>
            ⚙️ Account Information
          </h2>

          <div className="profile-row">

            <strong>
              Status:
            </strong>

            <span className="active-status">
              {user.isActive
                ? "Active"
                : "Inactive"}
            </span>

          </div>


          <div className="profile-row">

            <strong>
              Account Created:
            </strong>

            <span>
              {new Date(
                user.createdAt
              ).toLocaleDateString()}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;