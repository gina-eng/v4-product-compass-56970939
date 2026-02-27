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
import topLogo from "@/assets/group-289027.svg";
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
      <div className="login-page__mesh" aria-hidden="true" />
      <main className="login-page__content">
        <img src={topLogo} alt="Product Marketing" className="login-page__top-logo" />
        <div className="login-page__shell">
          <section className="login-page__brand-panel">
            <h1 className="login-page__brand-title">
              Apenas <span>resultado</span> importa.
            </h1>
            <p className="login-page__brand-description">
              O portfólio de Produtos e Serviços da V4 Company
            </p>
          </section>

          <Card className="login-page__card">
            <CardHeader className="items-center space-y-2 pb-4 text-center">
              <CardTitle className="login-page__card-title">Acesso Restrito</CardTitle>
              <CardDescription className="login-page__card-description">
                Faça login com sua conta <strong>@{ALLOWED_EMAIL_DOMAIN}</strong> para acessar o
                portfólio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <Button
                className="login-page__cta w-full"
                onClick={handleSignIn}
                disabled={isSigningIn || isLoadingSession}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {isSigningIn ? "Redirecionando..." : "Entrar com Google"}
              </Button>

              {import.meta.env.DEV && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[#d8d3d7] bg-white text-[#1d2330] hover:bg-[#f4f4f6]"
                  onClick={handleLocalPreview}
                  disabled={isLoadingSession}
                >
                  Entrar em modo pré-visualização local
                </Button>
              )}

              {isLoadingSession && (
                <p className="login-page__session-status">Verificando sessão...</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Login;
