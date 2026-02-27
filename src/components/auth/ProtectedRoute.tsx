import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAllowedV4Email, isLocalPreviewAuthEnabled } from "@/lib/auth";

const ProtectedRoute = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDomainDenied, setIsDomainDenied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (isLocalPreviewAuthEnabled()) {
      setIsAuthenticated(true);
      setIsLoading(false);
      setIsDomainDenied(false);
      return () => {
        isMounted = false;
      };
    }

    const syncSession = async (session: Session | null) => {
      if (!isMounted) return;

      if (!session) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      if (!isAllowedV4Email(session.user.email)) {
        setIsDomainDenied(true);
        setIsAuthenticated(false);
        setIsLoading(false);
        await supabase.auth.signOut();
        return;
      }

      setIsDomainDenied(false);
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
    if (isDomainDenied) {
      params.set("reason", "domain");
    }

    return <Navigate replace to={`/login?${params.toString()}`} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
