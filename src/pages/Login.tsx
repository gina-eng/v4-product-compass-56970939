import { useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  ALLOWED_EMAIL_DOMAIN,
  enableLocalPreviewAuth,
  isAllowedV4Email,
} from "@/lib/auth";
import sideLogo from "@/assets/group-289027-login.svg";
import "./Login.css";

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

  const resolveOAuthRedirectTo = () => {
    const search = nextPath && nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : "";
    const envBaseUrl = import.meta.env.VITE_AUTH_REDIRECT_BASE_URL?.trim();

    if (envBaseUrl) {
      const base = new URL(envBaseUrl, window.location.origin);
      return `${base.origin}/login${search}`;
    }

    const current = new URL(window.location.href);
    const normalizedHost =
      current.hostname === "127.0.0.1" || current.hostname === "::1"
        ? "localhost"
        : current.hostname;

    return `${current.protocol}//${normalizedHost}${current.port ? `:${current.port}` : ""}/login${search}`;
  };

  const handleSignIn = async () => {
    setLoginError(null);
    setIsSigningIn(true);

    const redirectTo = resolveOAuthRedirectTo();

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

  const handleLocalPreview = () => {
    enableLocalPreviewAuth();
    setRedirectPath(nextPath);
  };

  if (redirectPath) {
    return <Navigate replace to={redirectPath} />;
  }

  return (
    <div className="login-page">
      <main className="login-page__content login-page__content--compact">
        <div className="login-page__left">
          <img src={sideLogo} alt="Product Marketing" className="login-page__side-logo" />
        </div>

        <Card className="login-page__card login-page__card--solo">
          <CardHeader className="login-page__card-header">
            <CardTitle className="login-page__card-title">Acesso Restrito</CardTitle>
            <CardDescription className="login-page__card-description">
              Faça login com sua conta <strong>@{ALLOWED_EMAIL_DOMAIN}</strong> para acessar o
              portfólio.
            </CardDescription>
          </CardHeader>
          <CardContent className="login-page__card-content">
            <div className="login-page__alerts">
              {reason === "expired" && (
                <p className="login-page__alert">
                  Sua sessão expirou após 6 horas. Faça login novamente para continuar.
                </p>
              )}

              {reason === "domain" && (
                <p className="login-page__alert">
                  Apenas usuários com e-mail @{ALLOWED_EMAIL_DOMAIN} podem entrar.
                </p>
              )}

              {loginError && <p className="login-page__alert">{loginError}</p>}
            </div>

            <div className="login-page__actions">
              <Button
                className="login-page__cta w-full"
                onClick={handleSignIn}
                disabled={isSigningIn || isLoadingSession}
              >
                <LogIn className="h-4 w-4" />
                {isSigningIn ? "Redirecionando..." : "Entrar com Google"}
              </Button>

              {import.meta.env.DEV && (
                <Button
                  type="button"
                  variant="outline"
                  className="login-page__preview-cta w-full"
                  onClick={handleLocalPreview}
                  disabled={isLoadingSession}
                >
                  Entrar em modo pré-visualização local
                </Button>
              )}
            </div>

            {isLoadingSession && <p className="login-page__session-status">Verificando sessão...</p>}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Login;
