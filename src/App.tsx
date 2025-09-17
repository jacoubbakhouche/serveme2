import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// --- الخطوة 1: استيراد الصفحة الترحيبية الجديدة ---
import LandingPage from "./pages/LandingPage";

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
import CompleteProfilePage from "./pages/CompleteProfilePage";


const queryClient = new QueryClient();

const VAPID_PUBLIC_KEY =
  "BLkGz0mJpatxjHHUHfsHafwI6H8DqqVB6WQ6Bpy_GCNzl3o8Rw40jvRdlCcyifud2g-9jAdWO0PzFnyn8KFHQ2E";

// --- الخطوة 2: تحديث المسارات (Routes) ---
const AppWrapper = () => {
  return (
    <Routes>
      {/* المسارات العامة التي لا تتطلب تسجيل دخول */}
      <Route path="/" element={<LandingPage />} /> {/* ✨ الصفحة الترحيبية أصبحت هي الرئيسية */}
      <Route path="/auth" element={<AuthPage />} />

      {/* المسارات المحمية التي تتطلب تسجيل دخول */}
      <Route element={<LayoutRoute />}>
        <Route path="/dashboard" element={<HomePage />} /> {/* ✨ لوحة التحكم انتقلت إلى هنا */}
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
          <Route path="/complete-profile" element={<CompleteProfilePage />} />
       
        
      </Route>

      {/* صفحة الخطأ 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// لا حاجة لتغيير أي شيء هنا 👇
const NotificationSetup = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("🚫 المتصفح لا يدعم Push Notifications");
      return;
    }

    const registerPush = async () => {
      try {
        // تسجيل Service Worker مع إعادة المحاولة في حالة الفشل
        let registration;
        try {
          registration = await navigator.serviceWorker.register("/sw.js", {
            scope: '/',
            updateViaCache: 'none' // تأكد من عدم cache للتحديثات
          });
          console.log("✅ Service Worker مسجل:", registration);
          
          // انتظار حتى يصبح Service Worker جاهزاً
          if (registration.installing) {
            await new Promise<void>((resolve) => {
              registration.installing.addEventListener('statechange', () => {
                if (registration.installing.state === 'installed') {
                  resolve();
                }
              });
            });
          }
        } catch (swError) {
          console.error("❌ خطأ في تسجيل Service Worker:", swError);
          return;
        }

        // طلب إذن الإشعارات مع إعادة المحاولة
        let permission = Notification.permission;
        if (permission === "default") {
          permission = await Notification.requestPermission();
        }
        
        if (permission !== "granted") {
          console.log("🚫 المستخدم رفض الإشعارات، الحالة:", permission);
          return;
        }

        console.log("✅ تم منح إذن الإشعارات");

        // إنشاء أو استرجاع Push Subscription
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          console.log("📝 إنشاء push subscription جديد");
          try {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true, // الإشعارات مرئية للمستخدم دائماً
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });
          } catch (subscribeError) {
            console.error("❌ خطأ في إنشاء Push Subscription:", subscribeError);
            return;
          }
        } else {
          console.log("📩 استخدام push subscription موجود مسبقاً");
        }

        console.log("📩 Push Subscription:", subscription);

        // حفظ الاشتراك في Supabase إذا كان المستخدم متصلاً
        if (user && subscription) {
          try {
            console.log("💾 حفظ Push Subscription للمستخدم:", user.id);
            const { data, error } = await supabase.functions.invoke('save-subscription', {
              body: {
                user_id: user.id,
                subscription: subscription.toJSON(),
              },
            });

            if (error) {
              console.error("❌ خطأ في حفظ الاشتراك:", error);
              // إعادة المحاولة بعد 5 ثواني
              setTimeout(registerPush, 5000);
            } else {
              console.log("✅ تم حفظ الاشتراك في Supabase:", data);
              
              // اختبار إرسال إشعار تجريبي (اختياري)
              if (process.env.NODE_ENV === 'development') {
                setTimeout(async () => {
                  try {
                    await supabase.functions.invoke('send-push-notification', {
                      body: {
                        user_id: user.id,
                        title: "🎉 مرحباً!",
                        body: "تم تفعيل الإشعارات بنجاح، ستصلك الإشعارات حتى لو كان التطبيق مغلقاً!"
                      }
                    });
                  } catch (testError) {
                    console.log("تعذر إرسال إشعار تجريبي:", testError);
                  }
                }, 2000);
              }
            }
          } catch (saveError) {
            console.error("❌ خطأ في استدعاء دالة حفظ الاشتراك:", saveError);
          }
        }

        // الاستماع لرسائل من Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('📨 رسالة من Service Worker:', event.data);
          
          if (event.data?.type === 'PUSH_NOTIFICATION_RECEIVED') {
            // يمكن معالجة الإشعار في التطبيق إذا كان مفتوحاً
            console.log('🔔 تم استلام إشعار أثناء فتح التطبيق:', event.data.data);
          }
        });

        // مراقبة تحديثات Service Worker
        registration.addEventListener('updatefound', () => {
          console.log('🔄 تم العثور على تحديث للـ Service Worker');
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🆕 Service Worker جديد متاح، يتم التحديث...');
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          });
        });

      } catch (err) {
        console.error("❌ خطأ عام في إعداد الإشعارات:", err);
        // إعادة المحاولة بعد 10 ثواني
        setTimeout(registerPush, 10000);
      }
    };

    // بدء عملية التسجيل مع تأخير صغير
    const timeoutId = setTimeout(registerPush, 1000);
    
    // تنظيف المؤقت عند إلغاء التركيب
    return () => clearTimeout(timeoutId);
  }, [user]);

  // مراقبة تغييرات رؤية الصفحة لإعادة تنشيط الاشتراكات
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('👁️ التطبيق أصبح مرئياً، التحقق من صحة Push Subscription');
        // يمكن إضافة منطق للتحقق من صحة الاشتراك
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  return null;
};

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
  // لا يوجد أي شيء متعلق بالفيديو هنا الآن
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            {/* التطبيق يظهر مباشرة */}
            <NotificationSetup />
            <AppWrapper />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
