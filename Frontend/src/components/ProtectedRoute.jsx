import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

// Usage:
// <Route element={<ProtectedRoute allowedRoles={[1]} />}> ... </Route>
// Roles mapping example: 1=Admin, 2=Manager, 3=Employee

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;
    if (!allowedRoles.includes(userRole)) {
      // Redirect to role-appropriate dashboard if role mismatch
      if (userRole === 1) return <Navigate to="/admin/dashboard" replace />;
      if (userRole === 2) return <Navigate to="/manager/dashboard" replace />;
      return <Navigate to="/employee/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
