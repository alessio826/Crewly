import { Switch, Route, Redirect } from "wouter";
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
import React from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
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
      <Route path="/" component={() => <PublicOnly component={Welcome} />} />
      <Route path="/login" component={() => <PublicOnly component={Login} />} />
      <Route path="/register" component={() => <PublicOnly component={Register} />} />
      <Route path="/feed" component={() => <Protected component={Feed} />} />
      <Route path="/search" component={() => <Protected component={Search} />} />
      <Route path="/profile/:username" component={() => <Protected component={Profile} />} />
      <Route path="/post/:id" component={() => <Protected component={PostDetail} />} />
      <Route path="/create" component={() => <Protected component={CreatePost} />} />
      <Route path="/story/create" component={() => <Protected component={StoryCreator} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
