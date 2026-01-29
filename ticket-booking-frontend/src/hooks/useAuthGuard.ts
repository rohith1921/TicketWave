import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export function useAuthGuard() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  function requireAuth(action: () => void) {
    if (!isAuthenticated) {
      navigate("/login"); // TEMP: modal later
      return;
    }
    action();
  }

  return { requireAuth };
}
