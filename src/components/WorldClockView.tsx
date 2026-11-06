import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  Clock, 
  Search, 
  Star, 
  MapPin, 
  Calendar, 
  Compass, 
  Moon, 
  Sun,
  ArrowUpDown
} from 'lucide-react';
import { WORLD_CITIES, getCityTimeDetails, FormattedCityTime } from '../data/worldTime';
import { WorldCityTime } from '../types/quran';

export const WorldClockView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [is24Hour, setIs24Hour] = useState(false);
  const [favoriteCityIds, setFavoriteCityIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('itm_fav_cities');
    return saved ? JSON.parse(saved) : ['makkah', 'madinah', 'jerusalem', 'cairo'];
  });
  const [filterMode, setFilterMode] = useState<'all' | 'favorites'>('all');
  const [tick, setTick] = useState(0);

  // Update every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFavorite = (cityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteCityIds(prev => {
      const updated = prev.includes(cityId)
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId];
      localStorage.setItem('itm_fav_cities', JSON.stringify(updated));
      return updated;
    });
  };

  const filteredCities = WORLD_CITIES.filter(city => {
    const isFav = favoriteCityIds.includes(city.id);
    if (filterMode === 'favorites' && !isFav) return false;

    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      city.cityNameAr.includes(q) ||
      city.cityNameEn.toLowerCase().includes(q) ||
      city.countryAr.includes(q) ||
      city.countryEn.toLowerCase().includes(q)
    );
  });

  // Local user time details
  const localDetails = getCityTimeDetails(Intl.DateTimeFormat().resolvedOptions().timeZone, is24Hour);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Header Banner */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
              <Globe2 className="w-4 h-4" />
              <span>نظام التوقيت العالمي الموحد</span>
              <span>·</span>
              <span>تحديث حي كل ثانية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">
              ساعات عواصم ومدن العالم
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              تعرّف على التوقيت الحالي، التاريخ الميلادي والهجري، وفروق التوقيت بين سائر المدن العالمية
            </p>
          </div>

          {/* Local User Current Time Highlight Badge */}
          <div className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-2xl p-4 min-w-[240px] text-center shadow-xs">
            <span className="text-[11px] text-stone-400 font-medium">توقيت جهازك المحلي</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-mono tabular-nums my-0.5">
              {is24Hour ? localDetails.time24 : localDetails.time12}:
              <span className="text-emerald-700 dark:text-emerald-400 text-xl sm:text-2xl">{localDetails.seconds}</span>
              {!is24Hour && <span className="text-xs font-sans text-stone-400 ml-1 font-normal">{localDetails.period}</span>}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
              {localDetails.hijriDate}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls Toolbar */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث عن اسم المدينة أو الدولة (مثل مكة، القاهرة، لندن، طوكيو)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filters & 12h/24h Switch */}
          <div className="flex items-center gap-2">
            {/* Favorites Toggle */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-medium">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterMode === 'all'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
                }`}
              >
                جميع المدن ({WORLD_CITIES.length})
              </button>
              <button
                onClick={() => setFilterMode('favorites')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  filterMode === 'favorites'
                    ? 'bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>المفضلة ({favoriteCityIds.length})</span>
              </button>
            </div>

            {/* 12h / 24h Toggle */}
            <button
              onClick={() => setIs24Hour(prev => !prev)}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{is24Hour ? 'نظام 24 ساعة' : 'نظام 12 ساعة'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* World Cities Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCities.map(city => {
          const details = getCityTimeDetails(city.timezone, is24Hour);
          const isFav = favoriteCityIds.includes(city.id);
          const isSacredCity = city.id === 'makkah' || city.id === 'madinah' || city.id === 'jerusalem';

          return (
            <div
              key={city.id}
              className={`bg-white dark:bg-stone-900 border rounded-3xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between space-y-4 ${
                isSacredCity
                  ? 'border-emerald-200 dark:border-emerald-800/60 ring-1 ring-emerald-500/20'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
              }`}
            >
              {/* City Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base text-stone-900 dark:text-stone-100">
                      {city.cityNameAr}
                    </span>
                    {isSacredCity && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium">
                        مقدسة
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    {city.countryAr} · <span className="font-sans">{city.cityNameEn}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => toggleFavorite(city.id, e)}
                  className={`p-2 rounded-xl transition-colors ${
                    isFav
                      ? 'text-amber-500'
                      : 'text-stone-300 dark:text-stone-600 hover:text-amber-500'
                  }`}
                  title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                >
                  <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Big Time Display */}
              <div className="py-2 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-100 dark:border-stone-800/60">
                <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 font-mono tabular-nums tracking-tight">
                  {is24Hour ? details.time24 : details.time12}
                  <span className="text-emerald-600 dark:text-emerald-400 text-2xl font-bold">:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-2xl sm:text-3xl">{details.seconds}</span>
                  {!is24Hour && (
                    <span className="text-xs font-sans text-stone-400 ml-1.5 font-semibold">
                      {details.period}
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mt-1">
                  {details.timeDiffText}
                </div>
              </div>

              {/* Dates & Footer info */}
              <div className="text-xs text-stone-500 dark:text-stone-400 space-y-1 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">التاريخ الميلادي:</span>
                  <span className="font-medium text-stone-700 dark:text-stone-300">{details.gregorianDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">التاريخ الهجري:</span>
                  <span className="font-medium text-emerald-800 dark:text-emerald-400">{details.hijriDate}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
