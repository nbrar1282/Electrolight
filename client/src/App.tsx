import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Home from "@/pages/home";
import Products from "@/pages/products";
import Projects from "@/pages/projects";
import ProductDetail from "@/pages/product-detail";
import ProjectDetail from "@/pages/project-detail";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/projects" component={Projects} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/project/:id" component={ProjectDetail} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="electrolight-ui-theme">
      <QueryClientProvider client={queryClient}>
        <FavoritesProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </FavoritesProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
