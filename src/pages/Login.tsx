import { useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ALLOWED_EMAIL_DOMAIN, isAllowedV4Email } from "@/lib/auth";
import logo from "@/assets/product-compass-logo.svg";

const Login = () => {
  const [searchParams] = useSearchParams();
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const reason = searchParams.get("reason");
  const nextPath = useMemo(() => {
    const rawNext = searchParams.get("next") || "/";
    return rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!isMounted) return;

      const session = data.session;
      if (!session) {
        setIsLoadingSession(false);
        return;
      }

      if (!isAllowedV4Email(session.user.email)) {
        await supabase.auth.signOut();
        setIsLoadingSession(false);
        return;
      }

      setRedirectPath(nextPath);
      setIsLoadingSession(false);
    };

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, [nextPath]);

  const handleSignIn = async () => {
    setLoginError(null);
    setIsSigningIn(true);

    const search = nextPath && nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : "";
    const redirectTo = `${window.location.origin}/login${search}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          hd: ALLOWED_EMAIL_DOMAIN,
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setLoginError(error.message);
      setIsSigningIn(false);
    }
  };

  if (redirectPath) {
    return <Navigate replace to={redirectPath} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border/80 shadow-lg">
        <CardHeader className="space-y-4">
          <img src={logo} alt="Product Compass" className="h-10 w-auto" />
          <div className="space-y-1">
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Faça login com sua conta <strong>@{ALLOWED_EMAIL_DOMAIN}</strong> para acessar o portfólio.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {reason === "domain" && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Apenas usuários com e-mail @{ALLOWED_EMAIL_DOMAIN} podem entrar.
            </p>
          )}

          {loginError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {loginError}
            </p>
          )}

          <Button
            className="w-full"
            onClick={handleSignIn}
            disabled={isSigningIn || isLoadingSession}
          >
            <LogIn className="mr-2 h-4 w-4" />
            {isSigningIn ? "Redirecionando..." : "Entrar com Google"}
          </Button>

          {isLoadingSession && (
            <p className="text-center text-xs text-muted-foreground">Verificando sessão...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
