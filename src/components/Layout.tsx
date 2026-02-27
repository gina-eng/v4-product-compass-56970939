import { ComponentType, ReactNode, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BookMarked,
  Cog,
  Home,
  Menu,
  Network,
  Package,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/product-compass-logo.svg";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

interface NavigationItem {
  title: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
  notify?: boolean;
  children?: {
    title: string;
    url: string;
    category?: "all" | "destrava_receita" | "saber" | "ter" | "executar" | "potencializar";
  }[];
}

const navigationGroups: { label: string; items: NavigationItem[] }[] = [
  {
    label: "Principal",
    items: [
      {
        title: "Visão Geral",
        url: "/",
        icon: Home,
        children: [{ title: "Definição de TIER e WTP", url: "/visao-geral/definicao-tier-wtp" }],
      },
      {
        title: "Portfólio de Produtos",
        url: "/portfolio-produtos",
        icon: Package,
        children: [
          {
            title: "DESTRAVA RECEITA",
            url: "/portfolio-produtos?categoria=destrava_receita",
            category: "destrava_receita",
          },
          { title: "SABER", url: "/portfolio-produtos?categoria=saber", category: "saber" },
          { title: "TER", url: "/portfolio-produtos?categoria=ter", category: "ter" },
          { title: "EXECUTAR", url: "/portfolio-produtos?categoria=executar", category: "executar" },
          { title: "POTERNCIALIZAR", url: "/portfolio-produtos?categoria=potencializar", category: "potencializar" },
        ],
      },
      { title: "Stack Digital", url: "/stack-digital", icon: Network },
      { title: "Sistemas Operacionais", url: "/sistemas", icon: Cog },
      { title: "Artefatos", url: "/materiais-apoio", icon: BookMarked },
    ],
  },
];

const resolveActiveArea = (pathname: string) => {
  if (pathname.startsWith("/visao-geral/definicao-tier-wtp")) return "Definição de TIER e WTP";
  if (pathname.startsWith("/produto/")) return "Detalhes do Produto";
  if (pathname.startsWith("/stack-digital/plataforma/")) return "Detalhes da Plataforma";
  if (pathname.startsWith("/stack-digital/quadrante-gartner")) return "Quadrante Gartner";
  if (pathname.startsWith("/portfolio-produtos")) return "Portfólio de Produtos";
  if (pathname.startsWith("/stack-digital")) return "Stack Digital";
  if (pathname.startsWith("/admin")) return "Área Administrativa";
  if (pathname.startsWith("/sistemas")) return "Sistemas Operacionais";
  if (pathname.startsWith("/materiais-apoio")) return "Artefatos";
  return "Visão Geral";
};

const AppNavigation = ({
  pathname,
  search,
  onNavigate,
}: {
  pathname: string;
  search: string;
  onNavigate?: () => void;
}) => {
  const activeArea = useMemo(() => resolveActiveArea(pathname), [pathname]);
  const currentPortfolioFilter = useMemo(() => {
    const rawFilter = new URLSearchParams(search).get("categoria")?.toLowerCase() || "all";
    return ["all", "destrava_receita", "saber", "ter", "executar", "potencializar"].includes(rawFilter)
      ? rawFilter
      : "all";
  }, [search]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-6 rounded-xl px-2 py-2">
        <NavLink to="/" onClick={onNavigate} aria-label="Ir para Visão Geral" className="inline-flex">
          <img src={logo} alt="Product Compass" className="h-9 w-auto" />
        </NavLink>
      </div>

      {navigationGroups.map((group) => (
        <section key={group.label} className="mb-5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/90">
            {group.label}
          </p>
          <nav className="space-y-1">
            {group.items.map((item) => {
              const hasActiveChild = Boolean(
                item.children?.some((child) => {
                  if (child.category) {
                    return (
                      pathname.startsWith("/portfolio-produtos") &&
                      currentPortfolioFilter === child.category
                    );
                  }
                  return pathname === child.url || pathname.startsWith(`${child.url}/`);
                }),
              );
              const isActive =
                item.url === "/" ? pathname === "/" || hasActiveChild : pathname.startsWith(item.url) || hasActiveChild;

              return (
                <div key={item.title}>
                  <NavLink
                    to={item.url}
                    onClick={onNavigate}
                    className={[
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.10)]"
                        : "text-muted-foreground hover:bg-white/75 hover:text-foreground",
                    ].join(" ")}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                    {item.notify && <span className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                  </NavLink>

                  {isActive && item.children && (
                    <div className="mt-1 space-y-1 pl-10 pr-2">
                      {item.children.map((child) => {
                        const childIsActive = child.category
                          ? pathname.startsWith("/portfolio-produtos") &&
                            currentPortfolioFilter === child.category
                          : pathname === child.url || pathname.startsWith(`${child.url}/`);

                        return (
                          <NavLink
                            key={child.title}
                            to={child.url}
                            onClick={onNavigate}
                            className={[
                              "block rounded-lg px-3 py-1.5 text-xs font-semibold tracking-[0.02em] transition-all duration-200",
                              childIsActive
                                ? "bg-white text-primary shadow-[0_1px_2px_rgba(15,23,42,0.10)]"
                                : "text-muted-foreground hover:bg-white/70 hover:text-foreground",
                            ].join(" ")}
                          >
                            {child.title}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </section>
      ))}

      <div className="mt-auto rounded-xl border border-border/70 bg-white p-3 shadow-[0_14px_24px_-22px_rgba(15,23,42,0.55)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Contexto Ativo
        </p>
        <p className="mt-2 text-sm font-semibold text-foreground">{activeArea}</p>
        <Badge
          variant="secondary"
          className="mt-3 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/10"
        >
          Navegação principal
        </Badge>
      </div>
    </div>
  );
};

export const Layout = ({ children, showHeader = true }: LayoutProps) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!showHeader) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
        <main className="mx-auto w-full max-w-[1240px]">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-[272px] shrink-0 border-r border-sidebar-border bg-sidebar px-4 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:self-start lg:overflow-y-auto">
          <AppNavigation pathname={location.pathname} search={location.search} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center">
              <NavLink to="/" aria-label="Ir para Visão Geral" onClick={() => setMobileOpen(false)}>
                <img src={logo} alt="Product Compass" className="h-8 w-auto" />
              </NavLink>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen((state) => !state)}
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </header>

          {mobileOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/35 lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <aside
                className="h-full w-[288px] border-r border-sidebar-border bg-sidebar p-4"
                onClick={(event) => event.stopPropagation()}
              >
                <AppNavigation
                  pathname={location.pathname}
                  search={location.search}
                  onNavigate={() => setMobileOpen(false)}
                />
              </aside>
            </div>
          )}

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <div className="mx-auto w-full max-w-[1240px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};
