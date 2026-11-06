import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  BookMarked, 
  Bed, 
  Compass, 
  Clock, 
  RotateCcw, 
  Check, 
  Volume2, 
  Share2, 
  Copy, 
  Sparkles,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { ATHKAR_CATEGORIES, TASBEEH_PRESETS } from '../data/athkar';
import { POPULAR_CITIES, getPrayerTimesForDate, getNextPrayer, calculateQiblaBearing } from '../data/prayers';
import { DhikrItem } from '../types/quran';

export const IslamicToolsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'athkar' | 'tasbeeh' | 'prayers'>('athkar');
  
  // Athkar state
  const [selectedAthkarCategory, setSelectedAthkarCategory] = useState<string>('morning');
  const [athkarProgress, setAthkarProgress] = useState<Record<string, number>>({});

  // Tasbeeh state
  const [tasbeehCount, setTasbeehCount] = useState<number>(0);
  const [totalTasbeehSession, setTotalTasbeehSession] = useState<number>(0);
  const [selectedTasbeehPreset, setSelectedTasbeehPreset] = useState(TASBEEH_PRESETS[0]);

  // Prayer state
  const [selectedCity, setSelectedCity] = useState(POPULAR_CITIES[0]); // Makkah
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const prayerTimes = getPrayerTimesForDate(currentTime, selectedCity);
  const nextPrayer = getNextPrayer(prayerTimes);
  const qiblaAngle = calculateQiblaBearing(selectedCity.lat, selectedCity.lng);

  // Athkar interaction
  const currentCategoryData = ATHKAR_CATEGORIES.find(c => c.id === selectedAthkarCategory) || ATHKAR_CATEGORIES[0];

  const handleIncrementDhikr = (item: DhikrItem) => {
    const current = athkarProgress[item.id] || 0;
    if (current < item.count) {
      // Haptic feedback if supported
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
      setAthkarProgress(prev => ({
        ...prev,
        [item.id]: current + 1
      }));
    }
  };

  const handleResetCategoryAthkar = () => {
    const cleared: Record<string, number> = { ...athkarProgress };
    currentCategoryData.items.forEach(i => {
      cleared[i.id] = 0;
    });
    setAthkarProgress(cleared);
  };

  // Tasbeeh interaction
  const handleTasbeehTap = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
    const newCount = tasbeehCount + 1;
    setTotalTasbeehSession(prev => prev + 1);

    if (newCount >= selectedTasbeehPreset.target) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 60, 40]);
      }
      setTasbeehCount(0);
    } else {
      setTasbeehCount(newCount);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Top Main Navigation Tabs */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-3 shadow-xs">
        <div className="grid grid-cols-3 gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('athkar')}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === 'athkar'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
            }`}
          >
            الأذكار والأدعية
          </button>

          <button
            onClick={() => setActiveTab('tasbeeh')}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === 'tasbeeh'
                ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
            }`}
          >
            المسبحة الإلكترونية
          </button>

          <button
            onClick={() => setActiveTab('prayers')}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === 'prayers'
                ? 'bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-xs'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
            }`}
          >
            مواقيت الصلاة والقبلة
          </button>
        </div>
      </div>

      {/* 1. Athkar Section */}
      {activeTab === 'athkar' && (
        <div className="space-y-4">
          {/* Sub Categories Tabs */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-2">
              {ATHKAR_CATEGORIES.map(cat => {
                const isSelected = selectedAthkarCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedAthkarCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                    }`}
                  >
                    {cat.id === 'morning' && <Sun className="w-3.5 h-3.5" />}
                    {cat.id === 'evening' && <Moon className="w-3.5 h-3.5" />}
                    {cat.id === 'after_prayer' && <BookMarked className="w-3.5 h-3.5" />}
                    {cat.id === 'sleep' && <Bed className="w-3.5 h-3.5" />}
                    <span>{cat.title}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleResetCategoryAthkar}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
              title="إعادة ضبط العدادات"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Athkar Cards List */}
          <div className="space-y-3">
            {currentCategoryData.items.map(item => {
              const current = athkarProgress[item.id] || 0;
              const isCompleted = current >= item.count;
              const remaining = Math.max(0, item.count - current);

              return (
                <div
                  key={item.id}
                  onClick={() => handleIncrementDhikr(item)}
                  className={`bg-white dark:bg-stone-900 border rounded-2xl p-5 shadow-xs transition-all cursor-pointer text-right select-none active:scale-[0.99] ${
                    isCompleted
                      ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : 'border-stone-200 dark:border-stone-800 hover:border-emerald-500/40'
                  }`}
                >
                  {/* Arabic Dhikr text */}
                  <div className="font-arabic text-base sm:text-lg text-stone-900 dark:text-stone-100 leading-relaxed mb-3">
                    {item.text}
                  </div>

                  {/* Metadata and Counter Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800/80">
                    <div className="text-xs text-stone-500 dark:text-stone-400 space-y-0.5">
                      {item.reward && <div className="text-emerald-700 dark:text-emerald-400 font-medium">✨ {item.reward}</div>}
                      {item.source && <div className="text-stone-400 text-[11px]">{item.source}</div>}
                    </div>

                    {/* Counter Button */}
                    <div className="flex items-center gap-2">
                      <button
                        className={`min-w-16 h-10 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all tabular-nums ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>تم</span>
                          </>
                        ) : (
                          <span>{current} / {item.count}</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Digital Tasbeeh Section */}
      {activeTab === 'tasbeeh' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col items-center justify-center space-y-8 text-center">
          
          {/* Preset Selector */}
          <div className="w-full max-w-md space-y-2">
            <span className="text-xs text-stone-400">اختر الذكر المفضل</span>
            <div className="grid grid-cols-2 gap-2">
              {TASBEEH_PRESETS.slice(0, 4).map(preset => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setSelectedTasbeehPreset(preset);
                    setTasbeehCount(0);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all truncate ${
                    selectedTasbeehPreset.name === preset.name
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Current Preset Banner */}
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
              {selectedTasbeehPreset.name}
            </h3>
            <p className="text-xs text-stone-400">
              الهدف المستهدف: {selectedTasbeehPreset.target} تسبيحة
            </p>
          </div>

          {/* Big Interactive Tasbeeh Circular Tap Button */}
          <div className="relative">
            <button
              onClick={handleTasbeehTap}
              className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-800 dark:to-stone-900 border-4 border-emerald-600/30 dark:border-emerald-500/30 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all focus:outline-hidden select-none group"
            >
              <span className="text-xs text-stone-400 group-hover:text-emerald-600 transition-colors mb-1">
                اضغط للتسبيح
              </span>
              <span className="text-5xl sm:text-6xl font-extrabold text-emerald-800 dark:text-emerald-400 tabular-nums">
                {tasbeehCount}
              </span>
              <span className="text-xs text-stone-400 mt-2">
                من {selectedTasbeehPreset.target}
              </span>
            </button>
          </div>

          {/* Session Stats and Reset */}
          <div className="flex items-center gap-6 text-xs text-stone-500">
            <div>
              <span>مجموع التسبيحات في هذه الجلسة: </span>
              <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums">{totalTasbeehSession}</span>
            </div>

            <button
              onClick={() => setTasbeehCount(0)}
              className="flex items-center gap-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تصفير العداد</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Prayer Times & Qibla Compass */}
      {activeTab === 'prayers' && (
        <div className="space-y-6">
          {/* City Selector & Next Prayer Banner */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <select
                  value={selectedCity.name}
                  onChange={(e) => {
                    const found = POPULAR_CITIES.find(c => c.name === e.target.value);
                    if (found) setSelectedCity(found);
                  }}
                  className="text-sm font-bold bg-transparent text-stone-900 dark:text-stone-100 focus:outline-hidden cursor-pointer"
                >
                  {POPULAR_CITIES.map(c => (
                    <option key={c.name} value={c.name} className="dark:bg-stone-900">
                      {c.name} ({c.country})
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-stone-400">
                مواقيت الصلاة بحساب أم القرى والإحداثيات الجغرافية المعتمدة
              </div>
            </div>

            {/* Next Prayer Highlight Card */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-center min-w-48">
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">الصلاة القادمة</span>
              <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-0.5">
                صلاة {nextPrayer.name}
              </div>
              <div className="text-sm font-mono font-semibold text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
                {nextPrayer.time}
              </div>
            </div>
          </div>

          {/* Prayers 5 times Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {prayerTimes.map(p => {
              const isNext = p.id === nextPrayer.id;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    isNext
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div className={`text-xs font-semibold mb-1 ${isNext ? 'text-emerald-100' : 'text-stone-500 dark:text-stone-400'}`}>
                    {p.name}
                  </div>
                  <div className={`text-lg font-bold font-mono tabular-nums ${isNext ? 'text-white' : 'text-stone-900 dark:text-stone-100'}`}>
                    {p.time}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Qibla Direction Compass Card */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-right">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <Compass className="w-4 h-4" />
                <span>اتجاه القبلة الشريفة</span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                الكعبة المشرفة من {selectedCity.name}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
                زاوية القبلة: <span className="font-bold text-stone-800 dark:text-stone-200 tabular-nums">{qiblaAngle.toFixed(1)}°</span> بالنسبة للشمال الحقيقي.
              </p>
            </div>

            {/* Compass Dial Indicator */}
            <div className="relative w-36 h-36 rounded-full border-2 border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-center bg-stone-50 dark:bg-stone-800/50">
              <span className="absolute top-1 text-[10px] font-bold text-stone-400">N</span>
              <span className="absolute bottom-1 text-[10px] font-bold text-stone-400">S</span>
              <span className="absolute right-2 text-[10px] font-bold text-stone-400">E</span>
              <span className="absolute left-2 text-[10px] font-bold text-stone-400">W</span>

              {/* Kaaba pointer needle */}
              <div 
                className="w-1 h-20 bg-gradient-to-t from-transparent via-emerald-600 to-emerald-600 rounded-full transition-transform duration-500"
                style={{ transform: `rotate(${qiblaAngle}deg)` }}
              />
              <div className="absolute w-3 h-3 rounded-full bg-emerald-700 border-2 border-white dark:border-stone-900" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
