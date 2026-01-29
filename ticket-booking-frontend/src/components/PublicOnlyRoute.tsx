import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function PublicOnlyRoute() {
  const { isAuthenticated } = useAuthStore();

  // If user is already logged in, do not let them see Login/Register.
  // Redirect them to Home (or Dashboard) instead.
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, let them proceed to the Login/Register page
  return <Outlet />;
}