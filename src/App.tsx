import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Tariffs from "./pages/Tariffs";
import TariffyIzMoskvy from "./pages/TariffyIzMoskvy";
import Moving from "./pages/Moving";
import PereezdIz from "./pages/PereezdIz";
import Fleet from "./pages/Fleet";
import Contacts from "./pages/Contacts";
import Thanks from "./pages/Thanks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tarify" element={<Tariffs />} />
          <Route path="/tarify-iz-moskvy" element={<TariffyIzMoskvy />} />
          <Route path="/pereezd" element={<Moving />} />
          <Route path="/pereezd-iz" element={<PereezdIz />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/thanks" element={<Thanks />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
