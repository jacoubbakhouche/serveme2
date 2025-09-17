import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// ✨ 1. استيراد "Navigate" للقيام بعملية التوجيه
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// --- استيراد الصفحات ---
import LayoutRoute from "./components/LayoutRoute";
import AddServicePage from "./pages/AddServicePage";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import HomePage from "./pages/HomePage";
import MessagesPage from "./pages/MessagesPage";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import ProviderPublicProfilePage from "./pages/ProviderPublicProfilePage";
import ProvidersPage from "./pages/ProvidersPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import AdminPage from "./pages/AdminPage";
import AdminChatPage from "./pages/AdminChatPage";
import NotificationsPage from "./pages/NotificationsPage";
import TermsPage from "./pages/TermsPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import AdminAdsPage from "./pages/AdminAdsPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";


const queryClient = new QueryClient();

// ✨ 2. إنشاء مكون جديد لتنظيم المسارات والتحقق من المستخدم
const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  // عرض شاشة تحميل بسيطة بينما يتم التحقق من حالة المستخدم
  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <Routes>
      {/* المنطق الجديد:
        - إذا كان المستخدم مسجلاً، أي طلب للصفحة الرئيسية "/" سيتم تحويله إلى "/dashboard".
        - إذا لم يكن مسجلاً، أي طلب للصفحة الرئيسية "/" سيتم تحويله إلى "/auth".
      */}
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} 
      />

      {/* المسارات العامة التي لا تتطلب تسجيل دخول */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/complete-profile" element={<CompleteProfilePage />} />

      {/* المسارات المحمية التي تتطلب تسجيل دخول */}
      <Route element={<LayoutRoute />}>
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/providers" element={<ProvidersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
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

      {/* صفحة الخطأ 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};


const App = () => {
  // ✨ 3. تبسيط مكون App الرئيسي
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            {/* استدعاء المكون الجديد الذي يحتوي على كل المسارات */}
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
