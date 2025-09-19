import React, { memo, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Siren, ArrowLeft, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

// ✨ 1. استيراد المكونات اللازمة
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ✨ 2. تعريف النوع الصحيح للبيانات التي ستصل للمكون
type ServiceWithProfile = Tables<'services'> & {
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  } | null;
};

// ✨ 3. تحديث الخصائص لتكون أبسط وتقبل كائن service
interface ServiceCardProps {
  service: ServiceWithProfile;
}

// ✨ 4. إضافة دالة مساعدة للحصول على الأحرف الأولى
const getInitials = (name: string | null | undefined) => {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
};

// مكون عرض الصور يبقى كما هو
const AutoCarousel = ({ images, title }: { images: string[]; title: string; }) => {
  // ... (لا تغيير هنا في مكون عرض الصور)
};

const OptimizedServiceCard = memo(({ service }: ServiceCardProps) => {
  // ✨ 5. استخلاص البيانات من كائن service
  const { id, title, description, category, location, created_at, is_urgent, image_urls, profiles } = service;
  const timeAgo = formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: ar });
  const provider = profiles; // هذا هو صاحب الخدمة

  return (
    <div className="block rounded-lg overflow-hidden card-hover h-full">
      <div className="dark-card transition-all duration-300 flex flex-col h-full">
        <AutoCarousel images={image_urls || []} title={title || ''} />
        <div className="p-4 flex flex-col flex-grow">

          {/* ✨ 6. إضافة قسم معلومات مقدم الخدمة الجديد */}
          {provider && (
            <Link to={`/provider/${provider.id}`} className="flex items-center gap-3 mb-4 group">
              <Avatar userId={provider.id} className="h-10 w-10">
                <AvatarImage src={provider.avatar_url || '/placeholder.svg'} />
                <AvatarFallback>{getInitials(provider.full_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white group-hover:underline truncate">
                  {provider.full_name}
                </p>
                {provider.is_verified && <BadgeCheck className="w-4 h-4 text-sky-500 inline-block" />}
              </div>
            </Link>
          )}

          <div className="flex justify-between items-start mb-2">
            <Link to={`/service/${id}`} className="flex-1">
              <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">{title}</h3>
            </Link>
            {is_urgent && <Badge className="bg-destructive text-destructive-foreground animate-pulse flex items-center gap-1 px-2 py-1 ms-2 shrink-0 rounded-full text-xs">
                <Siren className="w-3 h-3" />
                عاجل
              </Badge>}
          </div>
          
          <p className="mb-4 leading-relaxed text-sm line-clamp-2 text-neutral-300">
            {description}
          </p>
          
          <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="font-bold text-sm">{location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
            </div>
          </div>

          <div className="flex-grow" />
          
          <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/20">
            <Badge variant="secondary" className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs">
              {category}
            </Badge>
            <Link to={`/service/${id}`} className="flex items-center gap-1 text-sm text-primary font-semibold">
              تفقد الخدمة
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

OptimizedServiceCard.displayName = 'OptimizedServiceCard';
export default OptimizedServiceCard;
