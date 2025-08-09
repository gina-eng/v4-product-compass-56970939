import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!email.endsWith('@v4company.com')) {
        toast.error('Apenas emails do domínio @v4company.com são permitidos');
        return;
      }

      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password, fullName);

      if (error) {
        toast.error(error.message);
      } else if (!isLogin) {
        toast.success('Verifique seu email para confirmar a conta');
      }
    } catch (error) {
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-destructive rounded-full flex items-center justify-center">
            <span className="text-destructive-foreground font-bold text-xl">V4</span>
          </div>
          <div>
            <CardTitle className="text-2xl">Avaliação de Desempenho</CardTitle>
            <CardDescription>
              Use sua conta @v4company.com para acessar
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@v4company.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Aguarde...' : (isLogin ? 'Entrar com conta V4' : 'Criar conta')}
            </Button>
          </form>
          
          <Separator />
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            </p>
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="h-auto p-0 text-primary"
            >
              {isLogin ? 'Criar nova conta' : 'Fazer login'}
            </Button>
          </div>
          
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">
              Desenvolvido pelo time de PE&G
            </p>
            <p className="text-xs text-muted-foreground">
              Problemas de acesso? Rafael Corazza
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;