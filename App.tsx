import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/Welcome";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Feed from "@/pages/Feed";
import Search from "@/pages/Search";
import Profile from "@/pages/Profile";
import PostDetail from "@/pages/PostDetail";
import CreatePost from "@/pages/CreatePost";
import StoryCreator from "@/pages/StoryCreator";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Protected({ component: C }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect to="/" />;
  return <C />;
}

function PublicOnly({ component: C }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Redirect to="/feed" />;
  return <C />;
}

function Router() {
  return (
    <Switch>
      <Route path="/"            component={() => <PublicOnly component={Welcome} />} />
      
