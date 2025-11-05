 import React, { useState, forwardRef } from 'react'; // 1. تم استيراد useState و forwardRef
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, User, BadgeCheck } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';
import OnlineStatus from './OnlineStatus';

interface ProviderCardProps {
  provider: Tables<'profiles'>;
}

const getInitials = (name: string) => {
  if (!name || name === 'مستخدم جديد') return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-4 h-4 ${
        i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
      }`}
    />
  ));
};

// 2. تم تحويل المكون ليستخدم forwardRef
const ProviderCard = forwardRef<HTMLDivElement, ProviderCardProps>(({ provider }, ref) => {
  // 3. إضافة حالة الدوران والدوال اللازمة للتحريك
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const { width, height, left, top } = card.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const mouseX = x - width / 2;
    const mouseY = y - height / 2;
    const rotatePower = 15; // يمكنك تعديل هذا الرقم لزيادة أو تقليل قوة التأثير
    const rotateY = (mouseX / (width / 2)) * rotatePower;
    const rotateX = -(mouseY / (height / 2)) * rotatePower;
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const displayName = provider.full_name || 'مستخدم جديد';

  return (
    // 4. إضافة الحاوية ثلاثية الأبعاد (Wrapper) مع أحداث الماوس
    <div
      className="[perspective:1000px] h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={ref}
    >
      {/* 5. تطبيق التحريك مباشرة على مكون Card مع الحفاظ على تنسيقاتك الأصلية */}
      <Card
        className="dark-card card-hover h-full text-white"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: 'transform 0.1s linear',
        }}
      >
        {/* محتوى البطاقة الداخلي لم يتغير على الإطلاق */}
        <CardContent className="p-4 sm:p-5 h-full flex flex-col">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-white/20">
                <AvatarImage src={provider.avatar_url || undefined} alt={displayName} />
                <AvatarFallback className="bg-slate-800 text-white font-bold">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5">
                <OnlineStatus userId={provider.id} />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold truncate text-white">{displayName}</h3>
                {provider.is_verified && (
                  <BadgeCheck className="w-5 h-5 text-sky-400" />
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  {renderStars(Number(provider.rating) || 0)}
                </div>
                <span className="text-sm text-slate-400">
                  ({provider.review_count || 0} تقييم)
                </span>
              </div>
              
              <div className="flex items-center gap-1 mb-3 text-sm text-slate-400">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{provider.location || 'غير محدد'}</span>
              </div>
              
              <Badge variant="secondary" className="mb-3 bg-white/5 text-slate-300 w-fit">
                {provider.provider_category || 'غير محدد'}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 my-3">
            {provider.specialties?.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-transparent border-white/20 text-slate-300">
                {specialty}
              </Badge>
            ))}
          </div>

          {provider.description && (
            <p className="text-sm text-slate-300 mt-2 mb-4 line-clamp-2 leading-relaxed">
              {provider.description}
            </p>
          )}
          
          <div className="flex-grow" />

          <Link to={`/provider/${provider.id}`} className="w-full block mt-auto">
            <Button className="w-full btn-gradient" size="sm">
              <User className="w-4 h-4 ml-2" />
              عرض الملف الشخصي
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
});

ProviderCard.displayName = "ProviderCard"; // لإظهار اسم المكون بشكل صحيح في أدوات المطور

export default ProviderCard;
