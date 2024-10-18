import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { message } from "antd";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [hasFocusedInitially, setHasFocusedInitially] = useState(false);

  useEffect(() => {
    const loginData = localStorage.getItem("login");
    const parsedLogin = loginData ? JSON.parse(loginData) : null;
    const token = parsedLogin?.token || "";

    if (token) {
      navigate("/dashboard");
    }
    if (titleInputRef.current && !hasFocusedInitially) {
      titleInputRef.current.focus();
      setHasFocusedInitially(true);
    }
  }, [navigate, hasFocusedInitially]);

  const handleLogin = (): void => {
    if (!email.trim() || !password.trim()) {
      message.info("Please enter your email and password.");
      setError(true);
      return;
    }
    login(email, password);
  };

  return (
    <div className="container">
      <div className="login-container">
        <h4 className="login-title">Login</h4>

        <form id="loginForm">
          <div className="input-container">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              ref={titleInputRef}
              required
            />
            <label className="label" htmlFor="email" id="label-email">
              <div className="text">Email</div>
            </label>
          </div>

          <div className="showErrors">
            {error && !email.trim() && (
              <span style={{ color: "red" }}>Please enter a valid email</span>
            )}
          </div>

          <div className="input-container">
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className="label" htmlFor="password" id="label-password">
              <div className="text">Password</div>
            </label>
          </div>

          <div className="showErrors">
            {error && !password.trim() && (
              <span style={{ color: "red" }}>
                Please enter a valid password
              </span>
            )}
          </div>

          <button type="button" className="login-btn" onClick={handleLogin}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
