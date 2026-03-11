import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  getSessionRemainingMs,
  isAllowedAppEmail,
  isLocalPreviewAuthEnabled,
  shouldForceSessionReauth,
} from "@/lib/auth";

const ProtectedRoute = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authFailureReason, setAuthFailureReason] = useState<"access" | "expired" | null>(null);

  useEffect(() => {
    let isMounted = true;
    let logoutTimer: ReturnType<typeof setTimeout> | null = null;

    const clearLogoutTimer = () => {
      if (!logoutTimer) return;
      clearTimeout(logoutTimer);
      logoutTimer = null;
    };

    const forceSignOut = async (reason: "expired" | "access") => {
      clearLogoutTimer();
      if (!isMounted) return;

      setAuthFailureReason(reason);
      setIsAuthenticated(false);
      setIsLoading(false);
      await supabase.auth.signOut();
    };

    if (isLocalPreviewAuthEnabled()) {
      setIsAuthenticated(true);
      setIsLoading(false);
      setAuthFailureReason(null);
      return () => {
        isMounted = false;
        clearLogoutTimer();
      };
    }

    const syncSession = async (session: Session | null) => {
      clearLogoutTimer();
      if (!isMounted) return;

      if (!session) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const hasAccess = await isAllowedAppEmail(session.user.email);
      if (!hasAccess) {
        await forceSignOut("access");
        return;
      }

      if (shouldForceSessionReauth(session)) {
        await forceSignOut("expired");
        return;
      }

      const remainingMs = getSessionRemainingMs(session);
      logoutTimer = setTimeout(() => {
        void forceSignOut("expired");
      }, remainingMs);

      setAuthFailureReason(null);
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      await syncSession(data.session);
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session);
    });

    return () => {
      isMounted = false;
      clearLogoutTimer();
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Validando acesso...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const params = new URLSearchParams();
    const nextPath = `${location.pathname}${location.search}${location.hash}`;

    params.set("next", nextPath || "/");
    if (authFailureReason) {
      params.set("reason", authFailureReason);
    }

    return <Navigate replace to={`/login?${params.toString()}`} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
