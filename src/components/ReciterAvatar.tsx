import React, { useState } from 'react';
import { ShieldCheck, User } from 'lucide-react';

interface ReciterAvatarProps {
  name: string;
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  badge?: boolean;
}

export const ReciterAvatar: React.FC<ReciterAvatarProps> = ({
  name,
  photoUrl,
  size = 'md',
  className = '',
  badge = true
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Size variations
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs rounded-xl',
    md: 'w-14 h-14 text-base rounded-2xl',
    lg: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl rounded-2xl',
    xl: 'w-28 h-28 text-3xl rounded-3xl'
  }[size];

  // Derive elegant monogram and arabic styling
  const initial = name ? name.replace('الشيخ', '').trim().charAt(0) : 'ق';

  return (
    <div className={`relative shrink-0 overflow-hidden border border-amber-500/30 shadow-md bg-stone-900 flex items-center justify-center select-none ${sizeClasses} ${className}`}>
      
      {/* Authentic Portrait Image */}
      {photoUrl && !imageError && (
        <img
          src={photoUrl}
          alt={`صورة الشيخ ${name}`}
          loading="lazy"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          referrerPolicy="no-referrer"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}

      {/* Ornate Golden Islamic Emblem Fallback (when image loading or not available) */}
      {(!photoUrl || imageError || !imageLoaded) && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950 via-stone-900 to-amber-950 text-amber-300 font-bold p-1 text-center ${
          photoUrl && !imageError && !imageLoaded ? 'opacity-90' : 'opacity-100'
        }`}>
          {/* Subtle Islamic geometric star pattern background */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:8px_8px]" />
          
          <span className="relative z-10 font-serif drop-shadow-md">
            {initial}
          </span>
          {size !== 'sm' && (
            <span className="relative z-10 text-[9px] text-amber-400/80 font-normal truncate max-w-[90%] mt-0.5">
              مصحف مرتل
            </span>
          )}
        </div>
      )}

      {/* Verified Authentic Reciter Badge */}
      {badge && (
        <div 
          className="absolute bottom-1 left-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-sm border border-emerald-400/40 z-20 pointer-events-none"
          title="تسجيل وتلاوة موثقة ومدققة"
        >
          <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </div>
      )}
    </div>
  );
};
