import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
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
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      localStorage.setItem("token", response.data.token);

      navigate("/chat");
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Login failed. Please check your email and password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo / Brand */}
        <div className="auth-brand">
          <div className="auth-logo">AI</div>
          <span>AI Chat</span>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h1>Welcome Back</h1>
          <p>Login to continue to your AI Chat</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div className="auth-field">
            <div className="password-label-row">
              <label htmlFor="password">Password</label>
            </div>

            <div className="password-wrapper">
              <input
                id="password"
                className="auth-input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
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
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Signup */}
        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
