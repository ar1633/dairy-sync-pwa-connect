import { useEffect, useState, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

// Lazy load components to avoid loading issues
const LoginForm = lazy(() => import("@/components/auth/LoginForm"));
const Dashboard = lazy(() => import("@/components/dashboard/Dashboard"));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
  </div>
);

const Index = () => {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">🥛</span>
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Krishi DairySync
          </h1>
          <p className="text-green-600 mb-6">Rural Dairy Management System</p>
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        {!user ? <LoginForm /> : <Dashboard />}
      </Suspense>
    </>
  );
};

export default Index;
