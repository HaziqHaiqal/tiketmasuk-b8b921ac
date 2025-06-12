
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import TicketDetails from "@/pages/TicketDetails";
import PaymentDetails from "@/pages/PaymentDetails";
import EventDetailsTabbed from "@/pages/EventDetailsTabbed";
import EventCart from "@/pages/EventCart";
import CompletePurchase from "@/pages/CompletePurchase";
import OrderSummary from "@/pages/OrderSummary";
import { AuthProvider } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {navItems.map(({ to, page }) => (
              <Route key={to} path={to} element={page} />
            ))}
            <Route path="/event/:id" element={<EventDetailsTabbed />} />
            <Route path="/event/:id/cart" element={<EventCart />} />
            <Route path="/event/:id/complete-purchase" element={<CompletePurchase />} />
            <Route path="/event/:id/order-summary" element={<OrderSummary />} />
            <Route path="/event/:id/tickets" element={<TicketDetails />} />
            <Route path="/event/:id/payment" element={<PaymentDetails />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
