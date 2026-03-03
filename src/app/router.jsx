import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../shared/adminlayout/AdminLayout';
import Dashboard from '../pages/dashboard/Dashboard';
import Orders from '../pages/orders/Orders';
import Menu from '../pages/menu/Menu';
import InventoryOverview from "../pages/inventory/inventoryoverview";
import InventoryList from "../pages/inventory/inventorylist";
import Staff from '../pages/staff/Staff';
import Analytics from '../pages/analytics/Analytics';
import Profile from '../pages/profile/Profile';
import RestaurantList from "../pages/restaurant/RestaurantList";
import Unauthorized from '../pages/auth/Unauthorized';
import { InventoryProvider } from '../pages/inventory/InventoryContext';
import { SearchProvider } from '../shared/search/SearchContext';
import SearchResults from '../shared/search/SearchResults';
import { authRoutes } from '../pages/login_registration/auth.routes';

function AppRouter() {
  return (
    <BrowserRouter>
      <SearchProvider>
        <Routes>
         {authRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/owner/restaurants"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <RestaurantList />
            </ProtectedRoute>
          }
        />
        {/* Protected admin area */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <InventoryProvider>
                <AdminLayout />
              </InventoryProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="menu" element={<Menu />} />
          <Route path="inventory">
          <Route index element={<InventoryOverview />} />
          <Route path="overview" element={<InventoryOverview />} />
          <Route path="list" element={<InventoryList />} />
          </Route>
          <Route path="staff" element={<Staff />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
          <Route path="search" element={<SearchResults />} />
        </Route>

        {/* Default: redirect root/unknown to login */}
        <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
        <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
      </Routes>
      </SearchProvider>
    </BrowserRouter>
  );
}

export default AppRouter;