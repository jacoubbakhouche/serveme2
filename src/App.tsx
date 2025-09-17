import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// --- Import all your pages ---
import LayoutRoute from "./components/LayoutRoute";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import TermsPage from "./pages/TermsPage";
import ProfilePage from "./pages/ProfilePage";
import ProvidersPage from "./pages/ProvidersPage";
import MessagesPage from "./pages/MessagesPage";
import ChatPage from "./pages/ChatPage";
import AddServicePage from "./pages/AddServicePage";
import ProviderPublicProfilePage from "./pages/ProviderPublicProfilePage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import AdminPage from "./pages/AdminPage";
import AdminChatPage from "./pages/AdminChatPage";
import AdminAdsPage from "./pages/AdminAdsPage";
import NotificationsPage from "./pages/NotificationsPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// This component contains all the routing logic
const AppRoutes = () => {
  // It gets the user object AND a loading state from the context
  const { user, isLoading } = useAuth();

  // ✨ KEY FIX: It shows a loading message until the auth check is complete
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* This is the main route. It now works correctly because it only runs AFTER isLoading is false.
        - If the user object exists, it redirects to the dashboard.
        - If the user object is null, it redirects to the login page.
      */}
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} 
      />

      {/* Public routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/complete-profile" element={<CompleteProfilePage />} />

      {/* Protected routes (require login) */}
      <Route element={<LayoutRoute />}>
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/providers" element={<ProvidersPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/add-service" element={<AddServicePage />} />
        <Route path="/provider/:id" element={<ProviderPublicProfilePage />} />
        <Route path="/service/:id" element={<ServiceDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/chat" element={<AdminChatPage />} />
        <Route path="/admin/ads" element={<AdminAdsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
      </Route>

      {/* 404 Not Found page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
