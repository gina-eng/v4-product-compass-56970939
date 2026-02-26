import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

const routeMap: Record<string, string> = {
  "/": "Home",
  "/portfolio-produtos": "Portfólio de Produtos",
  "/stack-digital": "Stack Digital",
  "/stack-digital/plataforma": "Detalhes da Plataforma",
  "/stack-digital/quadrante-gartner": "Quadrante Gartner",
  "/admin": "Área Administrativa",
  "/sistemas": "Sistemas Operacionais",
  "/materiais-apoio": "Artefatos",
  "/produto": "Produto",
};

export const Breadcrumbs = ({ customItems }: { customItems?: BreadcrumbItem[] }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const items: BreadcrumbItem[] = customItems || [
    { label: "Home", href: "/" },
    ...pathSegments.map((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const isLast = index === pathSegments.length - 1;
      
      return {
        label: routeMap[path] || segment,
        href: isLast ? undefined : path,
        current: isLast
      };
    })
  ];

  if (items.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground animate-fade-in">
      <Home className="h-4 w-4" />
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          {item.href ? (
            <Link 
              to={item.href}
              className="hover:text-foreground transition-colors story-link"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};
