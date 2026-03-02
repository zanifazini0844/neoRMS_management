// src/pages/login/ManagementLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../../../pages/login_registration/AuthCard";
import AuthForm from "../../../pages/login_registration/AuthForm";
import { loginManagement } from "@/services/loginApi";
import { fetchAndStoreUserRestaurant } from "@/services/staffapi";
import { fetchOwnerRestaurants } from "@/services/restaurant/restaurantApi";

export default function ManagementLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    setError("");

    try {
      const { accessToken, user } = await loginManagement({ email, password });

      console.log('[Login] Login successful!');
      console.log('[Login] Access Token:', accessToken);
      console.log('[Login] User object:', user);

      // Save to localStorage
      localStorage.setItem("authToken", accessToken);
      localStorage.setItem("authRole", user.role);

      const role = String(user.role).toLowerCase();
      localStorage.setItem("role", role);

      if (user?.fullName || user?.name) {
        localStorage.setItem("userName", user.fullName || user.name);
      }

      console.log('[Login] Stored authToken:', localStorage.getItem("authToken"));
      console.log('[Login] Stored role:', localStorage.getItem("role"));

      // Store tenant and restaurant IDs from login response
      if (user?.tenantId) {
        localStorage.setItem("tenantId", user.tenantId);
        console.log('[Login] Stored tenantId from user.tenantId:', user.tenantId);
      }
      if (user?.restaurantId) {
        localStorage.setItem("restaurantId", user.restaurantId);
        console.log('[Login] Stored restaurantId from user.restaurantId:', user.restaurantId);
      }
      
      // Also try alternate field names that might be returned
      if (user?.restaurant?.id) {
        localStorage.setItem("restaurantId", user.restaurant.id);
        console.log('[Login] Stored restaurantId from user.restaurant.id:', user.restaurant.id);
      }
      if (user?.restaurant?.tenantId) {
        localStorage.setItem("tenantId", user.restaurant.tenantId);
        console.log('[Login] Stored tenantId from user.restaurant.tenantId:', user.restaurant.tenantId);
      }

      console.log('[Login] Current localStorage:', {
        authToken: localStorage.getItem("authToken") ? 'SET' : 'NOT SET',
        role: localStorage.getItem("role"),
        restaurantId: localStorage.getItem("restaurantId"),
        tenantId: localStorage.getItem("tenantId"),
      });

      // =========================
      // ROLE BASED REDIRECTION
      // =========================

      if (role === "owner") {
        console.log('[Login] Owner login - fetching owned restaurants');
        // fetch list of restaurants owned by this user and cache them
        try {
          const owned = await fetchOwnerRestaurants();
          console.log('[Login] Owned restaurants raw:', owned);
          // normalize each entry similarly to RestaurantList
          const normalize = (r) => {
            if (!r || typeof r !== 'object') return r;
            const id = r.id || r._id || r.restaurantId || r.restaurant_id || r.restaurant?.id;
            const tenant = r.tenantId || r.tenant_id || r.restaurant?.tenantId;
            return { ...r, id, tenantId: tenant };
          };
          const normOwned = Array.isArray(owned) ? owned.map(normalize) : owned ? normalize(owned) : [];
          console.log('[Login] Owned restaurants normalized:', normOwned);
          localStorage.setItem('ownedRestaurants', JSON.stringify(normOwned));

          if (Array.isArray(normOwned) && normOwned.length > 0) {
            const first = normOwned[0];
            localStorage.setItem('restaurantId', first.id);
            if (first.tenantId) {
              localStorage.setItem('tenantId', first.tenantId);
            }
            console.log('[Login] Default restaurantId set to first owned:', first.id);
          }
        } catch (err) {
          console.warn('[Login] Failed to fetch owner restaurants', err);
        }

        console.log('[Login] Redirecting to owner restaurants page');
        navigate("/owner/restaurants", { replace: true });
      } 
      
      else if (role === "manager") {
        console.log('[Login] Manager detected, fetching restaurant info');
        // For managers, fetch and store their assigned restaurant
        const restaurantId = await fetchAndStoreUserRestaurant();
        console.log('[Login] After fetchAndStoreUserRestaurant, restaurantId:', restaurantId);
        console.log('[Login] localStorage restaurantId:', localStorage.getItem("restaurantId"));
        navigate("/admin", { replace: true });
      } 
      
      else {
        console.log('[Login] Staff/Other role detected, fetching restaurant info');
        // For other staff, also fetch their restaurant assignment
        const restaurantId = await fetchAndStoreUserRestaurant();
        console.log('[Login] After fetchAndStoreUserRestaurant, restaurantId:', restaurantId);
        console.log('[Login] localStorage restaurantId:', localStorage.getItem("restaurantId"));
        navigate("/", { replace: true });
      }

    } catch (e) {
      console.error('[Login] Login error:', e);
      setError(e?.response?.data?.message || e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to manage your restaurant operations."
    >
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
              onClick={() => navigate("/auth/sign-up")}
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