import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function ProtectedRoute({ children }) {
  const [state, setState] = useState({ loading: true, user: null, hasProfile: false });
  const location = useLocation();

  useEffect(() => {
    async function check() {
      try {
        const user = await base44.auth.me();
        if (!user) {
          setState({ loading: false, user: null, hasProfile: false });
          return;
        }
        const profiles = await base44.entities.BabyProfile.list(null, 1);
        setState({ loading: false, user, hasProfile: profiles.length > 0 });
      } catch {
        setState({ loading: false, user: null, hasProfile: false });
      }
    }
    check();
  }, []);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!state.user) {
    return <Navigate to="/login" replace />;
  }

  // If no profile and not already on /setup, redirect to setup
  if (!state.hasProfile && location.pathname !== "/setup") {
    return <Navigate to="/setup" replace />;
  }

  return children;
}
