import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import AuthCard from "../../../pages/login_registration/AuthCard";
import AuthForm from "../../../pages/login_registration/AuthForm";

export default function ManagementLogin() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login/management", { email, password });
      console.log("Login successful:", response);

      const { accessToken, user } = response.data?.data ?? {};

      if (!accessToken || !user?.role) throw new Error("Invalid response from server");

      localStorage.setItem("authToken", accessToken);
      localStorage.setItem("authRole", user.role);
      localStorage.setItem("role", String(user.role).toLowerCase());
      if (user?.fullName || user?.name) {
        localStorage.setItem("userName", user.fullName || user.name);
      }

      navigate("/admin", { replace: true });
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" description="Sign in to manage your restaurant operations.">
      <AuthForm
        type="login"
        onSubmit={handleLogin}
        loading={loading}
        error={error}
        submitLabel="Sign in"
        footer={
          <span>
            New owner?{" "}
            <button
              className="text-red-500 hover:underline"
              onClick={() => navigate('/auth/sign-up')}
            >
              Create an owner account
            </button>
          </span>
        }
      />

      <p className="mt-4 text-xs text-neutral-400">
        Only the restaurant owner can self-register. Managers and staff should use their assigned credentials.
      </p>
    </AuthCard>
  );
}