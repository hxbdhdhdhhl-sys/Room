export interface CityCoords {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export const POPULAR_CITIES: CityCoords[] = [
  { name: 'مكة المكرمة', country: 'السعودية', lat: 21.4225, lng: 39.8262 },
  { name: 'المدينة المنورة', country: 'السعودية', lat: 24.4672, lng: 39.6111 },
  { name: 'الرياض', country: 'السعودية', lat: 24.7136, lng: 46.6753 },
  { name: 'القاهرة', country: 'مصر', lat: 30.0444, lng: 31.2357 },
  { name: 'القدس الشريف', country: 'فلسطين', lat: 31.7683, lng: 35.2137 },
  { name: 'دبي', country: 'الإمارات', lat: 25.2048, lng: 55.2708 },
  { name: 'عَمّان', country: 'الأردن', lat: 31.9454, lng: 35.9284 },
  { name: 'الدوحة', country: 'قطر', lat: 25.2854, lng: 51.5310 },
  { name: 'الكويت', country: 'الكويت', lat: 29.3759, lng: 47.9774 },
  { name: 'إسطنبول', country: 'تركيا', lat: 41.0082, lng: 28.9784 },
  { name: 'الرباط', country: 'المغرب', lat: 34.0209, lng: -6.8416 }
];

// Calculate Qibla angle from user coordinates
export function calculateQiblaBearing(latitude: number, longitude: number): number {
  const meccaLat = 21.4225 * (Math.PI / 180);
  const meccaLng = 39.8262 * (Math.PI / 180);
  const userLat = latitude * (Math.PI / 180);
  const userLng = longitude * (Math.PI / 180);

  const y = Math.sin(meccaLng - userLng);
  const x = Math.cos(userLat) * Math.tan(meccaLat) - Math.sin(userLat) * Math.cos(meccaLng - userLng);
  let qibla = Math.atan2(y, x) * (180 / Math.PI);
  return (qibla + 360) % 360;
}

// Prayer times calculation based on astronomical formulas
export function getPrayerTimesForDate(date: Date, city: CityCoords) {
  // Approximate standard calculation suitable for client display
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const B = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eqtime = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * (Math.PI / 180));

  // Solar noon
  const timezoneOffsetHours = -date.getTimezoneOffset() / 60;
  const solarNoon = 12 + timezoneOffsetHours - city.lng / 15 - eqtime / 60;

  const latRad = city.lat * (Math.PI / 180);
  const decRad = declination * (Math.PI / 180);

  // Hour angles
  const getHourAngle = (angle: number) => {
    const val = (Math.sin(angle * (Math.PI / 180)) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
    if (val > 1 || val < -1) return 0;
    return Math.acos(val) * (180 / Math.PI) / 15;
  };

  const fajrHA = getHourAngle(-18);
  const sunriseHA = getHourAngle(-0.833);
  const asrHA = Math.atan2(1, 1 + Math.tan(Math.abs(city.lat - declination) * (Math.PI / 180))) * (180 / Math.PI) / 15;
  const ishaHA = getHourAngle(-17);

  const formatTime = (hoursFraction: number) => {
    let normalized = (hoursFraction + 24) % 24;
    const h = Math.floor(normalized);
    const m = Math.floor((normalized - h) * 60);
    const period = h >= 12 ? 'م' : 'ص';
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const fajrHours = solarNoon - fajrHA;
  const sunriseHours = solarNoon - sunriseHA;
  const dhuhrHours = solarNoon + 0.05; // slightly after zenith
  const asrHours = solarNoon + asrHA;
  const maghribHours = solarNoon + sunriseHA;
  const ishaHours = solarNoon + ishaHA;

  return [
    { id: 'fajr', name: 'الفجر', time: formatTime(fajrHours), decimal: fajrHours },
    { id: 'sunrise', name: 'الشروق', time: formatTime(sunriseHours), decimal: sunriseHours },
    { id: 'dhuhr', name: 'الظهر', time: formatTime(dhuhrHours), decimal: dhuhrHours },
    { id: 'asr', name: 'العصر', time: formatTime(asrHours), decimal: asrHours },
    { id: 'maghrib', name: 'المغرب', time: formatTime(maghribHours), decimal: maghribHours },
    { id: 'isha', name: 'العشاء', time: formatTime(ishaHours), decimal: ishaHours }
  ];
}

export function getNextPrayer(prayers: { id: string; name: string; time: string; decimal: number }[]) {
  const now = new Date();
  const currentHours = now.getHours() + now.getMinutes() / 60;
  
  for (const prayer of prayers) {
    if (prayer.decimal > currentHours) {
      return prayer;
    }
  }
  // If past Isha, next is Fajr tomorrow
  return prayers[0];
}
