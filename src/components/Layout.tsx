import { ReactNode } from "react";
import { Header } from "@/components/Header";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export const Layout = ({ 
  children, 
  showHeader = true
}: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header />}
      <main className={`container mx-auto px-4 py-8 ${showHeader ? 'pt-24' : ''}`}>
        {children}
      </main>
    </div>
  );
};