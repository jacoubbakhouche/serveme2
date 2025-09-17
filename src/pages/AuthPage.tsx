// src/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// تعريف شكل البيانات التي سيوفرها الـ context
interface AuthContextType {
  user: User | null;
  isLoading: boolean; // حالة التحميل مهمة جداً لحل مشكلة توجيه المسارات
  // يمكنك إضافة isAdmin هنا إذا كنت تحتاجه في أماكن أخرى
  // isAdmin: boolean; 
}

// إنشاء الـ context بقيم أولية
// نبدأ بـ isLoading = true لنمنع اتخاذ أي قرار قبل التحقق من المستخدم
const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

// إنشاء المكون المزوّد (Provider) الذي سيغلف التطبيق
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // يبدأ دائماً بحالة التحميل

  useEffect(() => {
    // التحقق من الجلسة الحالية عند تحميل التطبيق لأول مرة
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (e) {
        console.error("Error getting initial session:", e);
        setUser(null);
      } finally {
        // أهم خطوة: بعد التحقق الأولي، نوقف حالة التحميل
        setIsLoading(false);
      }
    };

    getInitialSession();

    // نستمع لأي تغييرات مستقبلية في حالة تسجيل الدخول (مثل تسجيل الدخول أو الخروج)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // نتأكد من إيقاف التحميل هنا أيضاً
      if (isLoading) {
        setIsLoading(false);
      }
    });

    // دالة التنظيف: إلغاء الاشتراك عند إغلاق التطبيق لتجنب استهلاك الموارد
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // القيمة التي سيتم توفيرها لجميع المكونات داخل التطبيق
  const value = {
    user,
    isLoading,
  };

  // إذا كان التطبيق لا يزال في مرحلة التحقق الأولي، يمكنك عرض شاشة تحميل عامة هنا
  // هذا اختياري ولكنه يحسن التجربة
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>جاري التحميل...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// إنشاء "خطاف" (Hook) مخصص لتسهيل استخدام الـ context في أي مكان
export const useAuth = () => {
  return useContext(AuthContext);
};
