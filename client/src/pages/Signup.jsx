import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Auth.css";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", formData);

      setSuccess(response.data.message || "Account created successfully!");

      setFormData({
        name: "",
        email: "",
        password: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-brand">
          <div className="auth-logo">AI</div>
          <span>AI Chat</span>
        </div>

        {/* Title */}
        <h1 className="auth-title" style={{ color: "whitesmoke" }}>
          Create Account
        </h1>

        <p className="auth-subtitle" style={{ color: "whitesmoke" }}>
          Create your account to start using AI Chat
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="auth-field">
            <label htmlFor="name">Name</label>

            <input
              id="name"
              className="auth-input"
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={50}
            />
          </div>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              className="auth-input"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="password">Password</label>

            <div className="password-wrapper">
              <input
                id="password"
                className="auth-input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
              />

              <button
                type="button"
                className="password-toggle"
                style={{ color: "black" }}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <small className="password-hint">
              Password must be at least 6 characters.
            </small>
          </div>

          {/* Error */}
          {error && <div className="auth-error">{error}</div>}

          {/* Success */}
          {success && <div className="auth-success">{success}</div>}

          {/* Button */}
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
