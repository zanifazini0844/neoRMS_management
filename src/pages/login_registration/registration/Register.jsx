import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from "../../../pages/login_registration/AuthCard";
import AuthForm from "../../../pages/login_registration/AuthForm";
import { registerOwner } from "@/services/registerApi"; 

export default function OwnerRegister() {
  const navigate = useNavigate();

  const role = 'owner';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // guard in case the constant ever changes
  if (role !== 'owner') {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Only owners may register here.
      </div>
    );
  }

  const handleRegister = async ({ fullName, email, password }) => {
    setLoading(true);
    setError('');

    try {
      await registerOwner({ fullName, email, password });
      navigate('/login', { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to register. Please review your information and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create an Owner account"
      description="Register as the Owner to manage the restaurant system."
    >
      <AuthForm
        type="register"
        onSubmit={handleRegister}
        loading={loading}
        error={error}
        submitLabel="Create account"
        footer={
          <span>
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-red-500 hover:underline">
              Sign in
            </Link>
          </span>
        }
      />

      <p className="mt-4 text-xs text-neutral-400">
        Only the restaurant owner can self-register. Managers and other staff
        must be added by an owner after logging in.
      </p>
    </AuthCard>
  );
}