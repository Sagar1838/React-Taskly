import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import baseURL from "../config";
import { AuthContextType } from "../Types/Auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    try {
      const body = {
        email: email,
        password: password,
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const response = await axios.post(
        `${baseURL}api/users/login`,
        body,
        config
      );
      const { token, user } = response.data;
      localStorage.setItem("login", JSON.stringify({ token, user }));
      console.log("login data", response);

      setIsAuthenticated(true);
      message.success("Login Successful");
      window.location.reload();
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        message.error("Invalid email or password. Please try again.");
      } else {
        message.error("Something went wrong. Please try again.");
        console.error("Login Error:", error);
      }
      setIsAuthenticated(false);
      localStorage.removeItem("token");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    message.success("Logged out successfully.");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
