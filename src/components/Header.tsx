import { Building2, Settings, Home, Menu, FileText, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-header-bg text-header-foreground py-6 px-4 shadow-sm">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo à esquerda */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/e952505a-6ba3-468e-a269-0a74e7fbdd8e.png" 
              alt="Logo" 
              className="h-12"
            />
          </div>
          
          {/* Navegação à direita */}
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-header-foreground hover:bg-white/10">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-header-foreground hover:bg-white/10">
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/materiais-apoio" className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Materiais de Apoio
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="flex items-center text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
export { Header };