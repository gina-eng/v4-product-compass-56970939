import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro no acesso",
        description: "Não foi possível iniciar o login com Google.",
      });
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/1b339cbf-3c2c-4b0c-b79f-33785805f729.png" 
              alt="V4 Company Logo" 
              className="h-16 w-auto"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-heading-h2 font-semibold text-foreground">
              Portfólio de Produtos e Serviços V4
            </h1>
            <p className="text-body text-muted-foreground">
              Use sua conta @v4company.com para acessar
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="w-full shadow-lg border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Button 
                onClick={handleGoogleSignIn}
                className="w-full h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecionando...
                  </>
                ) : (
                  <>
                    <span className="mr-2">G</span>
                    Entrar com conta V4
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-body-small text-muted-foreground space-y-1">
          <p>Desenvolvido pelo time de PE&G</p>
          <p>Proprietário - Rafael Corazza</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;