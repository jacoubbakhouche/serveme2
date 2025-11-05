// src/components/OptimizedServiceCard.tsx 

import React, { memo, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Siren, ArrowLeft, BadgeCheck, Eye, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';
import { useLanguage } from '@/contexts/LanguageContext';
interface ServiceCardProps extends Tables<'services'> {
  timeAgo: string;
  contactNumber?: string;
  is_verified: boolean;
}

// Auto-scrolling image carousel component
const AutoCarousel = ({
  images,
  title
}: {
  images: string[];
  title: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => prevIndex === images.length - 1 ? 0 : prevIndex + 1);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);
  const goToNext = () => {
    setCurrentIndex(prevIndex => prevIndex === images.length - 1 ? 0 : prevIndex + 1);
  };
  const goToPrev = () => {
    setCurrentIndex(prevIndex => prevIndex === 0 ? images.length - 1 : prevIndex - 1);
  };



  
  if (images.length === 0) {
     return null;
 <div className="w-full h-40 bg-muted flex items-center justify-center">
        <span className="text-muted-foreground text-sm">لا توجد صورة</span>
      </div>;
  }




  

  
  if (images.length === 1) {
    return <img src={images[0]} alt={title} className="w-full h-40 object-cover" loading="lazy" />;
  }
  return <div className="relative w-full h-40 overflow-hidden group">
      <div className="flex h-full">
        {images.map((image, index) => <div key={index} className="w-full h-full flex-shrink-0 absolute inset-0 transition-opacity duration-500" style={{
        opacity: index === currentIndex ? 1 : 0,
        zIndex: index === currentIndex ? 1 : 0
      }}>
            <img src={image} alt={`${title} - صورة ${index + 1}`} className="w-full h-full object-cover" loading="lazy" onError={e => {
          console.error('Failed to load image:', image);
          e.currentTarget.src = '/placeholder.svg';
        }} />
          </div>)}
      </div>
      
      {/* Navigation arrows */}
      <button onClick={e => {
      e.preventDefault();
      e.stopPropagation();
      goToPrev();
    }} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        ←
      </button>
      
      <button onClick={e => {
      e.preventDefault();
      e.stopPropagation();
      goToNext();
    }} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        →
      </button>
      
      {/* Dots indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
        {images.map((_, index) => <button key={index} onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex(index);
      }} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white shadow-lg' : 'bg-white/50'}`} />)}
      </div>
      
      {/* Image counter */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
        {currentIndex + 1}/{images.length}
      </div>
    </div>;
};

// Memoized component for better performance
const OptimizedServiceCard = memo(({
  id,
  title,
  description,
  category,
  location,
  timeAgo,
  is_urgent = false,
  contactNumber,
  image_urls,
  user_id,
  is_verified,
  view_count
}: ServiceCardProps) => {
  const { t } = useLanguage();
  
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}/service/${id}`;
    const shareData = {
      title: title,
      text: `${description || ''}\n\n📍 ${location}`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success(t('share.success'));
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(t('share.linkCopied'));
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  return <Link to={`/service/${id}`} className="block rounded-lg overflow-hidden card-hover h-full">
      <div className="dark-card transition-all duration-300 flex flex-col h-full">
        <AutoCarousel images={image_urls || []} title={title} />
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 flex-1">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              {is_verified && <BadgeCheck className="w-5 h-5 text-sky-500" />} {/* ✨ التعديل هنا */}
            </div>
            {is_urgent && <Badge className="bg-destructive text-destructive-foreground animate-pulse flex items-center gap-1 px-3 py-1 ms-2 shrink-0 rounded-full">
                <Siren className="w-4 h-4" />
                {t('service.urgent')}
              </Badge>}
          </div>
          
          <p className="mb-4 leading-relaxed text-sm line-clamp-2 font-bold text-neutral-300">
            {description}
          </p>
          
          <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="font-bold text-sm text-[#11f5f1]">{location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 bg-[#00ee00]/0" />
              <span className="text-lime-500">{timeAgo}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span className="text-muted-foreground">{view_count || 0}</span>
            </div>
          </div>

          <div className="flex-grow" />
          
          <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/20">
            <Badge variant="secondary" className="bg-muted text-muted-foreground rounded-full px-4 py-2">
              {category}
            </Badge>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="مشاركة"
              >
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-1 text-sm text-primary font-semibold">
                  {t('service.checkService')}
                  <ArrowLeft className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>;
});
OptimizedServiceCard.displayName = 'OptimizedServiceCard';
export default OptimizedServiceCard;
