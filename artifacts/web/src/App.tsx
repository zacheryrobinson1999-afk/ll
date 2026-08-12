import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Layout } from '@/components/layout';
import FleetPage from '@/pages/fleet';
import DocsPage from '@/pages/docs';
import ToolsPage from '@/pages/tools';
import MaintenancePage from '@/pages/maintenance';
import HomePage from '@/pages/home';
import LoginPage from '@/pages/login';
import AdminPage from '@/pages/admin';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();
  useEffect(() => {
    if (!loading && !user && location !== '/login') setLocation('/login');
    if (!loading && user && location === '/login') setLocation('/');
    if (!loading && user?.role !== 'admin' && location === '/admin') setLocation('/');
  }, [loading, user, location, setLocation]);
  if (loading) return <div className="dark flex min-h-[100dvh] items-center justify-center bg-background text-primary">Loading CraneHub…</div>;
  if (location === '/login') return <LoginPage />;
  if (!user) return null;
  if (location === '/admin' && user.role !== 'admin') return null;
  return (
    <RoutedErrorBoundary>
      <Layout>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/fleet" component={FleetPage} />
          <Route path="/tools" component={ToolsPage} />
          <Route path="/docs" component={DocsPage} />
          <Route path="/maintenance" component={MaintenancePage} />
          <Route path="/maintenance/:manufacturer" component={MaintenancePage} />
          <Route path="/maintenance/:manufacturer/:craneId" component={MaintenancePage} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthProvider><Router /></AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
