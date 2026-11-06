import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  Compass, 
  Volume2, 
  Check, 
  Play, 
  Pause, 
  Sparkles, 
  Settings,
  Bell
} from 'lucide-react';
import { POPULAR_CITIES, calculateQiblaBearing, getPrayerTimesForDate, getNextPrayer, CityCoords } from '../data/prayers';
import { WORLD_CITIES } from '../data/worldTime';

interface GlobalPrayerTimesViewProps {
  onPlayAdhan?: (audioUrl: string) => void;
}

export const ADHAN_SOUNDS = [
  { id: 'makkah', name: 'أذان الحرم المكي الشريف', audioUrl: 'https://cdn.aladhan.com/audio/adhans/makkah.mp3' },
  { id: 'madinah', name: 'أذان المسجد النبوي الشريف', audioUrl: 'https://cdn.aladhan.com/audio/adhans/madina.mp3' },
  { id: 'aqsa', name: 'أذان المسجد الأقصى المبارك', audioUrl: 'https://cdn.aladhan.com/audio/adhans/al-aqsa.mp3' },
  { id: 'egypt', name: 'أذان مصر وصوت القراء', audioUrl: 'https://cdn.aladhan.com/audio/adhans/egypt.mp3' }
];

export const CALCULATION_METHODS = [
  { id: 'umm_alqura', name: 'أم القرى - المملكة العربية السعودية' },
  { id: 'mwl', name: 'رابطة العالم الإسلامي (MWL)' },
  { id: 'egypt', name: 'الهيئة المصرية العامة للمساحة' },
  { id: 'isna', name: 'الجمعية الإسلامية بأمريكا الشمالية (ISNA)' },
  { id: 'turkey', name: 'رئاسة الشؤون الدينية بتركيا (Diyanet)' }
];

export const GlobalPrayerTimesView: React.FC<GlobalPrayerTimesViewProps> = () => {
  const [selectedCity, setSelectedCity] = useState<CityCoords>(POPULAR_CITIES[0]); // Makkah
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedMethod, setSelectedMethod] = useState(CALCULATION_METHODS[0].id);
  const [selectedAdhan, setSelectedAdhan] = useState(ADHAN_SOUNDS[0]);
  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false);
  const [adhanNotificationEnabled, setAdhanNotificationEnabled] = useState(true);
  const [activeAdhanAudio, setActiveAdhanAudio] = useState<HTMLAudioElement | null>(null);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const prayerTimes = getPrayerTimesForDate(currentTime, selectedCity);
  const nextPrayer = getNextPrayer(prayerTimes);
  const qiblaAngle = calculateQiblaBearing(selectedCity.lat, selectedCity.lng);

  // Toggle Adhan Audio preview
  const handleTogglePlayAdhan = (adhan: typeof ADHAN_SOUNDS[0]) => {
    if (activeAdhanAudio && isPlayingAdhan) {
      activeAdhanAudio.pause();
      setIsPlayingAdhan(false);
      return;
    }

    const audio = new Audio(adhan.audioUrl);
    audio.play().then(() => {
      setActiveAdhanAudio(audio);
      setIsPlayingAdhan(true);
      setSelectedAdhan(adhan);
    }).catch(err => {
      console.warn('Adhan audio play error', err);
    });

    audio.onended = () => {
      setIsPlayingAdhan(false);
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Top Banner & City Selector */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
            <Clock className="w-4 h-4" />
            <span>مواقيت الصلاة المعتمدة عالمياً</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            مواقيت الصلاة في {selectedCity.name}
          </h2>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span>{selectedCity.country}</span>
            <span>·</span>
            <span>طريقة الحساب: {CALCULATION_METHODS.find(m => m.id === selectedMethod)?.name}</span>
          </div>
        </div>

        {/* City Picker Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <MapPin className="w-4 h-4 text-emerald-600 absolute right-3 top-3 pointer-events-none" />
            <select
              value={selectedCity.name}
              onChange={(e) => {
                const found = POPULAR_CITIES.find(c => c.name === e.target.value);
                if (found) setSelectedCity(found);
              }}
              className="w-full md:w-60 pr-9 pl-3 py-2 text-xs sm:text-sm font-semibold rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {POPULAR_CITIES.map(c => (
                <option key={c.name} value={c.name} className="dark:bg-stone-900">
                  {c.name} ({c.country})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Next Prayer Spotlight Card */}
      <div className="bg-gradient-to-l from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-right">
          <span className="text-xs font-medium text-emerald-300">
            الصلاة القادمة بإذن الله تعالى
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-white">
            صلاة {nextPrayer.name}
          </div>
          <div className="text-xs text-emerald-200/90 font-mono">
            موعد الأذان: <span className="font-bold text-white text-base">{nextPrayer.time}</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center min-w-48 border border-white/10">
          <span className="text-xs text-emerald-200 font-medium">الوقت الحالي بالثواني</span>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-white my-1">
            {currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-[11px] text-emerald-200">
            ﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا ﴾
          </div>
        </div>
      </div>

      {/* 5 Prayers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {prayerTimes.map(p => {
          const isNext = p.id === nextPrayer.id;
          return (
            <div
              key={p.id}
              className={`p-4 rounded-3xl border text-center transition-all ${
                isNext
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/40'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
              }`}
            >
              <div className={`text-xs font-semibold mb-1 ${isNext ? 'text-emerald-100' : 'text-stone-500 dark:text-stone-400'}`}>
                {p.name}
              </div>
              <div className={`text-xl font-bold font-mono tabular-nums ${isNext ? 'text-white' : 'text-stone-900 dark:text-stone-100'}`}>
                {p.time}
              </div>
            </div>
          );
        })}
      </div>

      {/* Adhan Sounds & Qibla Compass Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Adhan Audio Selector */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                أصوات الأذان وتنبيهات الصلاة
              </h3>
            </div>
            
            <button
              onClick={() => setAdhanNotificationEnabled(prev => !prev)}
              className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${
                adhanNotificationEnabled
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-stone-100 text-stone-500'
              }`}
            >
              {adhanNotificationEnabled ? 'التنبيه مفعّل' : 'صامت'}
            </button>
          </div>

          <div className="space-y-2">
            {ADHAN_SOUNDS.map(adhan => {
              const isSelected = selectedAdhan.id === adhan.id;
              const isPlayingThis = isPlayingAdhan && isSelected;

              return (
                <div
                  key={adhan.id}
                  onClick={() => handleTogglePlayAdhan(adhan)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/20'
                      : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isPlayingThis ? 'bg-emerald-600 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                    }`}>
                      {isPlayingThis ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current mr-0.5" />}
                    </button>
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {adhan.name}
                    </span>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Qibla Direction Compass */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              اتجاه القبلة نحو الكعبة المشرفة
            </h3>
          </div>

          <div className="flex items-center justify-around py-2">
            {/* Dial */}
            <div className="relative w-36 h-36 rounded-full border-2 border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-center bg-stone-50 dark:bg-stone-800/50 shadow-inner">
              <span className="absolute top-1 text-[10px] font-bold text-stone-400">N</span>
              <span className="absolute bottom-1 text-[10px] font-bold text-stone-400">S</span>
              <span className="absolute right-2 text-[10px] font-bold text-stone-400">E</span>
              <span className="absolute left-2 text-[10px] font-bold text-stone-400">W</span>

              {/* Kaaba pointer needle */}
              <div 
                className="w-1.5 h-22 bg-gradient-to-t from-transparent via-emerald-600 to-emerald-600 rounded-full transition-transform duration-700"
                style={{ transform: `rotate(${qiblaAngle}deg)` }}
              />
              <div className="absolute w-4 h-4 rounded-full bg-emerald-700 border-2 border-white dark:border-stone-900" />
            </div>

            <div className="text-right space-y-1">
              <div className="text-xs text-stone-400">زاوية القبلة الدقيقة</div>
              <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-mono tabular-nums">
                {qiblaAngle.toFixed(1)}°
              </div>
              <div className="text-[11px] text-stone-500">
                من الشمال الحقيقي في {selectedCity.name}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-stone-400 text-center">
            وجه الهاتف أفقياً ليتطابق المؤشر الأخضر مع اتجاه الكعبة الشريفة
          </div>
        </div>
      </div>
    </div>
  );
};
