import { WorldCityTime } from '../types/quran';

export const WORLD_CITIES: WorldCityTime[] = [
  { id: 'makkah', cityNameAr: 'مكة المكرمة', cityNameEn: 'Makkah', countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', timezone: 'Asia/Riyadh', lat: 21.4225, lng: 39.8262, isPopular: true },
  { id: 'madinah', cityNameAr: 'المدينة المنورة', cityNameEn: 'Madinah', countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', timezone: 'Asia/Riyadh', lat: 24.4672, lng: 39.6111, isPopular: true },
  { id: 'jerusalem', cityNameAr: 'القدس الشريف', cityNameEn: 'Jerusalem', countryAr: 'فلسطين', countryEn: 'Palestine', timezone: 'Asia/Jerusalem', lat: 31.7683, lng: 35.2137, isPopular: true },
  { id: 'cairo', cityNameAr: 'القاهرة', cityNameEn: 'Cairo', countryAr: 'مصر', countryEn: 'Egypt', timezone: 'Africa/Cairo', lat: 30.0444, lng: 31.2357, isPopular: true },
  { id: 'riyadh', cityNameAr: 'الرياض', cityNameEn: 'Riyadh', countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', timezone: 'Asia/Riyadh', lat: 24.7136, lng: 46.6753, isPopular: true },
  { id: 'dubai', cityNameAr: 'دبي', cityNameEn: 'Dubai', countryAr: 'الإمارات العربية المتحدة', countryEn: 'UAE', timezone: 'Asia/Dubai', lat: 25.2048, lng: 55.2708, isPopular: true },
  { id: 'doha', cityNameAr: 'الدوحة', cityNameEn: 'Doha', countryAr: 'قطر', countryEn: 'Qatar', timezone: 'Asia/Qatar', lat: 25.2854, lng: 51.5310, isPopular: true },
  { id: 'kuwait', cityNameAr: 'الكويت', cityNameEn: 'Kuwait City', countryAr: 'الكويت', countryEn: 'Kuwait', timezone: 'Asia/Kuwait', lat: 29.3759, lng: 47.9774, isPopular: true },
  { id: 'muscat', cityNameAr: 'مسقط', cityNameEn: 'Muscat', countryAr: 'سلطنة عُمان', countryEn: 'Oman', timezone: 'Asia/Muscat', lat: 23.5880, lng: 58.3829, isPopular: true },
  { id: 'manama', cityNameAr: 'المنامة', cityNameEn: 'Manama', countryAr: 'البحرين', countryEn: 'Bahrain', timezone: 'Asia/Bahrain', lat: 26.2285, lng: 50.5860, isPopular: true },
  { id: 'amman', cityNameAr: 'عَمّان', cityNameEn: 'Amman', countryAr: 'الأردن', countryEn: 'Jordan', timezone: 'Asia/Amman', lat: 31.9454, lng: 35.9284, isPopular: true },
  { id: 'beirut', cityNameAr: 'بيروت', cityNameEn: 'Beirut', countryAr: 'لبنان', countryEn: 'Lebanon', timezone: 'Asia/Beirut', lat: 33.8938, lng: 35.5018, isPopular: true },
  { id: 'damascus', cityNameAr: 'دمشق', cityNameEn: 'Damascus', countryAr: 'سوريا', countryEn: 'Syria', timezone: 'Asia/Damascus', lat: 33.5138, lng: 36.2765, isPopular: true },
  { id: 'baghdad', cityNameAr: 'بغداد', cityNameEn: 'Baghdad', countryAr: 'العراق', countryEn: 'Iraq', timezone: 'Asia/Baghdad', lat: 33.3152, lng: 44.3661, isPopular: true },
  { id: 'sanaa', cityNameAr: 'صنعاء', cityNameEn: 'Sanaa', countryAr: 'اليمن', countryEn: 'Yemen', timezone: 'Asia/Aden', lat: 15.3694, lng: 44.1910, isPopular: true },
  { id: 'tripoli', cityNameAr: 'طرابلس', cityNameEn: 'Tripoli', countryAr: 'ليبيا', countryEn: 'Libya', timezone: 'Africa/Tripoli', lat: 32.8872, lng: 13.1913, isPopular: true },
  { id: 'tunis', cityNameAr: 'تونس', cityNameEn: 'Tunis', countryAr: 'تونس', countryEn: 'Tunisia', timezone: 'Africa/Tunis', lat: 36.8065, lng: 10.1815, isPopular: true },
  { id: 'algiers', cityNameAr: 'الجزائر', cityNameEn: 'Algiers', countryAr: 'الجزائر', countryEn: 'Algeria', timezone: 'Africa/Algiers', lat: 36.7538, lng: 3.0588, isPopular: true },
  { id: 'rabat', cityNameAr: 'الرباط', cityNameEn: 'Rabat', countryAr: 'المغرب', countryEn: 'Morocco', timezone: 'Africa/Casablanca', lat: 34.0209, lng: -6.8416, isPopular: true },
  { id: 'khartoum', cityNameAr: 'الخرطوم', cityNameEn: 'Khartoum', countryAr: 'السودان', countryEn: 'Sudan', timezone: 'Africa/Khartoum', lat: 15.5007, lng: 32.5599, isPopular: true },
  { id: 'istanbul', cityNameAr: 'إسطنبول', cityNameEn: 'Istanbul', countryAr: 'تركيا', countryEn: 'Turkey', timezone: 'Europe/Istanbul', lat: 41.0082, lng: 28.9784, isPopular: true },
  { id: 'kuala_lumpur', cityNameAr: 'كوالالمبور', cityNameEn: 'Kuala Lumpur', countryAr: 'ماليزيا', countryEn: 'Malaysia', timezone: 'Asia/Kuala_Lumpur', lat: 3.1390, lng: 101.6869, isPopular: true },
  { id: 'jakarta', cityNameAr: 'جاكرتا', cityNameEn: 'Jakarta', countryAr: 'إندونيسيا', countryEn: 'Indonesia', timezone: 'Asia/Jakarta', lat: -6.2088, lng: 106.8456, isPopular: true },
  { id: 'london', cityNameAr: 'لندن', cityNameEn: 'London', countryAr: 'المملكة المتحدة', countryEn: 'United Kingdom', timezone: 'Europe/London', lat: 51.5074, lng: -0.1278, isPopular: true },
  { id: 'paris', cityNameAr: 'باريس', cityNameEn: 'Paris', countryAr: 'فرنسا', countryEn: 'France', timezone: 'Europe/Paris', lat: 48.8566, lng: 2.3522, isPopular: true },
  { id: 'berlin', cityNameAr: 'برلين', cityNameEn: 'Berlin', countryAr: 'ألمانيا', countryEn: 'Germany', timezone: 'Europe/Berlin', lat: 52.5200, lng: 13.4050, isPopular: true },
  { id: 'new_york', cityNameAr: 'نيويورك', cityNameEn: 'New York', countryAr: 'الولايات المتحدة', countryEn: 'United States', timezone: 'America/New_York', lat: 40.7128, lng: -74.0060, isPopular: true },
  { id: 'chicago', cityNameAr: 'شيكاغو', cityNameEn: 'Chicago', countryAr: 'الولايات المتحدة', countryEn: 'United States', timezone: 'America/Chicago', lat: 41.8781, lng: -87.6298, isPopular: true },
  { id: 'los_angeles', cityNameAr: 'لوس أنجلوس', cityNameEn: 'Los Angeles', countryAr: 'الولايات المتحدة', countryEn: 'United States', timezone: 'America/Los_Angeles', lat: 34.0522, lng: -118.2437, isPopular: true },
  { id: 'toronto', cityNameAr: 'تورونتو', cityNameEn: 'Toronto', countryAr: 'كندا', countryEn: 'Canada', timezone: 'America/Toronto', lat: 43.6532, lng: -79.3832, isPopular: true },
  { id: 'tokyo', cityNameAr: 'طوكيو', cityNameEn: 'Tokyo', countryAr: 'اليابان', countryEn: 'Japan', timezone: 'Asia/Tokyo', lat: 35.6762, lng: 139.6503, isPopular: true },
  { id: 'sydney', cityNameAr: 'سيدني', cityNameEn: 'Sydney', countryAr: 'أستراليا', countryEn: 'Australia', timezone: 'Australia/Sydney', lat: -33.8688, lng: 151.2093, isPopular: true }
];

export interface FormattedCityTime {
  time12: string;
  time24: string;
  seconds: string;
  period: string;
  gregorianDate: string;
  hijriDate: string;
  timeDiffText: string;
}

export function getCityTimeDetails(timezone: string, is24Hour: boolean = false): FormattedCityTime {
  const now = new Date();
  
  // Format local string in target timezone
  const timeFormatter12 = new Intl.DateTimeFormat('ar-SA', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const timeFormatter24 = new Intl.DateTimeFormat('ar-SA', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const secFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    second: '2-digit'
  });

  const gregorianFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
    timeZone: timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
    timeZone: timezone,
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calculate time difference between user local time and target timezone
  let timeDiffText = 'نفس توقيتك';
  try {
    const targetDateStr = now.toLocaleString('en-US', { timeZone: timezone });
    const targetDate = new Date(targetDateStr);
    const diffHours = Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours > 0) {
      timeDiffText = `+${diffHours} س عن توقيتك`;
    } else if (diffHours < 0) {
      timeDiffText = `${diffHours} س عن توقيتك`;
    }
  } catch {
    // fallback
  }

  const parts = timeFormatter12.formatToParts(now);
  const period = parts.find(p => p.type === 'dayPeriod')?.value || (now.getHours() >= 12 ? 'م' : 'ص');

  return {
    time12: timeFormatter12.format(now).replace(/[ص|م]/g, '').trim(),
    time24: timeFormatter24.format(now),
    seconds: secFormatter.format(now),
    period: period,
    gregorianDate: gregorianFormatter.format(now),
    hijriDate: hijriFormatter.format(now),
    timeDiffText
  };
}
