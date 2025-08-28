import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// --- التعديل 1: استيراد HashRouter بدلاً من BrowserRouter ---
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

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
import IntroVideo from "./components/IntroVideo";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import AdminAdsPage from "./pages/AdminAdsPage";

const queryClient = new QueryClient();

const AppWrapper = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<LayoutRoute />}>
        <Route path="/" element={<HomePage />} />
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
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// --- التعديل 2: تم حذف مكون NotificationSetup ودالة urlBase64ToUint8Array بالكامل ---
// لم نعد بحاجة إليهما لأنهما خاصان بالويب فقط.

const App = () => {
  const [introVideoFinished, setIntroVideoFinished] = useState(false);
  const handleVideoEnd = () => setIntroVideoFinished(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* --- التعديل 3: استخدام HashRouter --- */}
        <HashRouter>
          <AuthProvider>
            {/* تشغيل الفيديو أول مرة */}
            {!introVideoFinished && <IntroVideo onVideoEnd={handleVideoEnd} />}
            {introVideoFinished && (
                // --- التعديل 4: تم حذف استدعاء <NotificationSetup /> ---
                <AppWrapper />
            )}
          </AuthProvider>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
