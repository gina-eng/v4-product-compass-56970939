import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  customBreadcrumbs?: Array<{ label: string; href?: string; current?: boolean }>;
}

export const Layout = ({ 
  children, 
  showSidebar = true,
  customBreadcrumbs 
}: LayoutProps) => {
  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Header com trigger da sidebar e breadcrumbs */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
            <div className="flex h-14 items-center gap-4 px-4">
              <SidebarTrigger className="hover-scale" />
              
              <div className="flex-1">
                <Breadcrumbs customItems={customBreadcrumbs} />
              </div>
            </div>
          </header>

          {/* Conteúdo principal */}
          <div className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};