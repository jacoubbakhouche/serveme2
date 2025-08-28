import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

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
// أضف هذا السطر في بداية الملف
import AdminAdsPage from "./pages/AdminAdsPage";
const queryClient = new QueryClient();

// مفتاح VAPID (اللي عندك في السؤال)
const VAPID_PUBLIC_KEY =
  "BLkGz0mJpatxjHHUHfsHafwI6H8DqqVB6WQ6Bpy_GCNzl3o8Rw40jvRdlCcyifud2g-9jAdWO0PzFnyn8KFHQ2E";

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
        // أضف هذا السطر بعد السطر 51
<Route path="/admin/ads" element={<AdminAdsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
     
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// 👇 هذي هي الإضافة
const NotificationSetup = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("🚫 المتصفح لا يدعم Push Notifications");
      return;
    }

    const registerPush = async () => {
      try {
        // 1. تسجيل Service Worker
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("✅ Service Worker مسجل:", registration);

        // 2. طلب إذن الإشعارات
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("🚫 المستخدم رفض الإشعارات");
          return;
        }

        // 3. إنشاء اشتراك Push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        console.log("📩 تم إنشاء الاشتراك:", subscription);

        // 4. إرسال الاشتراك إلى Supabase Edge Function
        if (user) {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-subscription`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                // 👇 لو عندك access_token من Supabase auth
                Authorization: `Bearer ${user?.access_token}`,
              },
              body: JSON.stringify({
                user_id: user.id,
                subscription,
              }),
            }
          );
          console.log("✅ تم حفظ الاشتراك في Supabase");
        }
      } catch (err) {
        console.error("❌ خطأ في إعداد الإشعارات:", err);
      }
    };

    registerPush();
  }, [user]);

  return null;
};

// Utility لتحويل المفتاح
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const App = () => {
  const [introVideoFinished, setIntroVideoFinished] = useState(false);
  const handleVideoEnd = () => setIntroVideoFinished(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            {/* تشغيل الفيديو أول مرة */}
            {!introVideoFinished && <IntroVideo onVideoEnd={handleVideoEnd} />}
            {introVideoFinished && (
              <>
                <NotificationSetup /> {/* 👈 هنا تفعيل Push */}
                <AppWrapper />
              </>
            )}
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
