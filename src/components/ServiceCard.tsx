import React from "react";
import { Link } from "react-router-dom";
// ✨ 1. استيراد المكونات والأنواع اللازمة
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tables } from "@/integrations/supabase/types";

// ✨ 2. تحديث النوع ليشمل بيانات صاحب الخدمة (profile)
type ServiceWithProfile = Tables<'services'> & {
  profiles: Tables<'profiles'> | null;
};

interface ServiceCardProps {
  service: ServiceWithProfile;
}

// ✨ 3. دالة مساعدة للحصول على الأحرف الأولى من الاسم
const getInitials = (name: string | null | undefined) => {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
};


const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  // استخلاص بيانات مقدم الخدمة لتسهيل الاستخدام
  const provider = service.profiles;

  return (
    // ✨ 4. تحسين تصميم البطاقة واستخدام النمط الداكن
    <div className="dark-card rounded-lg overflow-hidden flex flex-col h-full shadow-lg border border-white/10 transition-transform hover:scale-[1.02]">
      
      {/* عرض صورة الخدمة الرئيسية */}
      <Link to={`/service/${service.id}`} className="block">
        <img
          // نعرض أول صورة فقط في البطاقة المصغرة
          src={service.image_urls?.[0] || '/placeholder.svg'} 
          alt={service.title || "صورة الخدمة"}
          className="w-full h-48 object-cover"
        />
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        
        {/* ✨ 5. إضافة قسم معلومات مقدم الخدمة الجديد */}
        {provider && (
          <Link to={`/provider/${provider.id}`} className="flex items-center gap-3 mb-4 group">
            <Avatar userId={provider.id} className="h-10 w-10">
              <AvatarImage src={provider.avatar_url || '/placeholder.svg'} />
              <AvatarFallback>{getInitials(provider.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm text-white group-hover:underline">
                {provider.full_name}
              </p>
            </div>
          </Link>
        )}
        
        {/* تفاصيل الخدمة */}
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
          {service.title}
        </h3>
        <p className="text-sm text-slate-400 line-clamp-3 flex-grow">
          {service.description}
        </p>

        <div className="mt-4 pt-4 border-t border-white/20">
          <Link to={`/service/${service.id}`} className="text-primary font-semibold text-sm hover:underline">
            عرض التفاصيل →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
