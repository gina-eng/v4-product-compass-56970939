import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import ProductDetails from "./pages/ProductDetails";
import SupportMaterials from "./pages/SupportMaterials";
import ProductPortfolioPage from "./pages/ProductPortfolioPage";
import Systems from "./pages/Systems";
import PlatformPortfolioPage from "./pages/PlatformPortfolioPage";
import PlatformDetails from "./pages/PlatformDetails";
import PlatformGartnerQuadrantPage from "./pages/PlatformGartnerQuadrantPage";
import TierWtpDefinition from "./pages/TierWtpDefinition";
import Login from "./pages/Login";
import AllowedLoginUsers from "./pages/AllowedLoginUsers";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const LegacyPlatformDetailsRedirect = () => {
  const { slug } = useParams();
  return <Navigate replace to={`/stack-digital/plataforma/${slug || ""}`} />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/definicao-tier-wtp" element={<TierWtpDefinition />} />
              <Route
                path="/visao-geral/definicao-tier-wtp"
                element={<Navigate replace to="/definicao-tier-wtp" />}
              />
              <Route path="/portfolio-produtos" element={<ProductPortfolioPage />} />
              <Route path="/stack-digital" element={<PlatformPortfolioPage />} />
              <Route path="/stack-digital/quadrante-gartner" element={<PlatformGartnerQuadrantPage />} />
              <Route path="/stack-digital/plataforma/:slug" element={<PlatformDetails />} />
              <Route path="/portfolio-plataformas" element={<Navigate replace to="/stack-digital" />} />
              <Route
                path="/portfolio-plataformas/quadrante-gartner"
                element={<Navigate replace to="/stack-digital/quadrante-gartner" />}
              />
              <Route path="/plataforma/:slug" element={<LegacyPlatformDetailsRedirect />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/usuarios-liberados" element={<AllowedLoginUsers />} />
              <Route path="/sistemas" element={<Systems />} />
              <Route path="/produto/:slug" element={<ProductDetails />} />
              <Route path="/materiais-apoio" element={<SupportMaterials />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
