import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "./components/layout/auth-guard";
import { ErrorBoundary } from "./components/layout/error-boundary";
import { ThemeProvider } from "./hooks/use-theme";
import { Skeleton } from "./components/ui/skeleton";

const LoginPage = lazy(() =>
  import("./pages/login").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import("./pages/register").then((m) => ({ default: m.RegisterPage }))
);
const DashboardPage = lazy(() =>
  import("./pages/dashboard").then((m) => ({ default: m.DashboardPage }))
);
const SubcontractorDetailPage = lazy(() =>
  import("./pages/subcontractor-detail").then((m) => ({
    default: m.SubcontractorDetailPage,
  }))
);

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 w-full max-w-md px-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/dashboard"
                element={
                  <AuthGuard>
                    <DashboardPage />
                  </AuthGuard>
                }
              />
              <Route
                path="/subcontractors/:id"
                element={
                  <AuthGuard>
                    <SubcontractorDetailPage />
                  </AuthGuard>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
