import React, { useState } from 'react';
import { Search, BookOpen, Bookmark, Star, Play, Sparkles } from 'lucide-react';
import { SurahMeta, Bookmark as BookmarkType } from '../types/quran';
import { SURAHS_META, JUZ_LIST } from '../data/quranMeta';

interface SurahListProps {
  onSelectSurah: (surahNumber: number, page: number) => void;
  bookmarks: BookmarkType[];
  onPlaySurah: (surahNumber: number) => void;
  currentPlayingSurah?: number;
  isPlaying?: boolean;
}

export const SurahList: React.FC<SurahListProps> = ({
  onSelectSurah,
  bookmarks,
  onPlaySurah,
  currentPlayingSurah,
  isPlaying
}) => {
  const [activeTab, setActiveTab] = useState<'surahs' | 'juz' | 'bookmarks' | 'favorites'>('surahs');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<number[]>([1, 18, 36, 55, 67, 112]); // Common favorites (Fatiha, Kahf, Yasin, Rahman, Mulk, Ikhlas)

  // Toggle favorite
  const toggleFavorite = (surahNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(surahNum) ? prev.filter(n => n !== surahNum) : [...prev, surahNum]
    );
  };

  // Filtered surahs
  const filteredSurahs = SURAHS_META.filter(s => {
    const cleanSearch = searchQuery.trim().toLowerCase();
    if (!cleanSearch) return true;
    return s.name.includes(cleanSearch) || 
           s.englishName.toLowerCase().includes(cleanSearch) || 
           s.number.toString() === cleanSearch;
  });

  // Filtered Juz
  const filteredJuz = JUZ_LIST.filter(j => {
    const cleanSearch = searchQuery.trim();
    if (!cleanSearch) return true;
    return j.name.includes(cleanSearch) || 
           j.startSurahName.includes(cleanSearch) || 
           j.number.toString() === cleanSearch;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Search & Tabs Header */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث عن سورة، جزء، أو رقم الصفحة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-medium overflow-x-auto">
            <button
              onClick={() => setActiveTab('surahs')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'surahs'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
              }`}
            >
              السور (114)
            </button>
            <button
              onClick={() => setActiveTab('juz')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'juz'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
              }`}
            >
              الأجزاء (30)
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'favorites'
                  ? 'bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
              }`}
            >
              المفضلة ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'bookmarks'
                  ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
              }`}
            >
              العلامات ({bookmarks.length})
            </button>
          </div>
        </div>
      </div>

      {/* Surahs View */}
      {activeTab === 'surahs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredSurahs.map(s => {
            const isFav = favorites.includes(s.number);
            const isPlayingThis = isPlaying && currentPlayingSurah === s.number;

            return (
              <div
                key={s.number}
                onClick={() => onSelectSurah(s.number, s.startPage)}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl p-4 transition-all flex items-center justify-between cursor-pointer group shadow-xs active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  {/* Surah Number Icon */}
                  <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/50 group-hover:text-emerald-700 transition-colors">
                    {s.number}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-stone-900 dark:text-stone-100">
                        سورة {s.name}
                      </span>
                      <span className="text-[10px] text-stone-400 font-sans">
                        {s.englishName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                      <span>{s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                      <span>·</span>
                      <span>{s.numberOfAyahs} آيات</span>
                      <span>·</span>
                      <span>الجزء {s.juz}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick Audio Play Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlaySurah(s.number);
                    }}
                    className={`p-2 rounded-xl transition-colors ${
                      isPlayingThis
                        ? 'bg-emerald-600 text-white'
                        : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                    title="استماع للسورة كاملة"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>

                  {/* Favorite star */}
                  <button
                    onClick={(e) => toggleFavorite(s.number, e)}
                    className={`p-2 rounded-xl transition-colors ${
                      isFav
                        ? 'text-amber-500'
                        : 'text-stone-300 dark:text-stone-600 hover:text-amber-500'
                    }`}
                    title="إضافة للمفضلة"
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>

                  <div className="text-left text-xs text-stone-400 font-medium pl-1">
                    ص {s.startPage}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Juz View */}
      {activeTab === 'juz' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredJuz.map(j => (
            <div
              key={j.number}
              onClick={() => onSelectSurah(j.startSurahNumber, j.startPage)}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500/50 rounded-2xl p-4 transition-all cursor-pointer flex flex-col justify-between shadow-xs active:scale-[0.99]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
                  الجزء {j.number}
                </span>
                <span className="text-xs text-stone-400">
                  ص {j.startPage} - {j.endPage}
                </span>
              </div>

              <div className="text-base font-bold text-stone-900 dark:text-stone-100 mb-1">
                ﴿ {j.name} ﴾
              </div>

              <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                <span>بداية من: سورة {j.startSurahName}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">اقرأ الآن</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Favorites View */}
      {activeTab === 'favorites' && (
        <div className="space-y-3">
          {favorites.length === 0 ? (
            <div className="text-center py-16 text-stone-400 space-y-2 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
              <Star className="w-8 h-8 mx-auto text-stone-300" />
              <div className="text-sm font-semibold">لا توجد سور في المفضلة حالياً</div>
              <div className="text-xs">اضغط على رمز النجمة بجانب أي سورة لإضافتها هنا للوصول السريع</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {favorites.map(num => {
                const s = SURAHS_META.find(x => x.number === num);
                if (!s) return null;
                return (
                  <div
                    key={s.number}
                    onClick={() => onSelectSurah(s.number, s.startPage)}
                    className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-emerald-500/50 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                        {s.number}
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 dark:text-stone-100">سورة {s.name}</div>
                        <div className="text-xs text-stone-400">صفحة {s.startPage} · الجزء {s.juz}</div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => toggleFavorite(s.number, e)}
                      className="text-amber-500 p-2"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Bookmarks View */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-3">
          {bookmarks.length === 0 ? (
            <div className="text-center py-16 text-stone-400 space-y-2 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
              <Bookmark className="w-8 h-8 mx-auto text-stone-300" />
              <div className="text-sm font-semibold">لم تقم بإضافة علامات مرجعية بعد</div>
              <div className="text-xs">أثناء قراءة أي سورة، اضغط على الآية ثم اختر «علامة» لحفظ موضعك هنا</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bookmarks.map(b => (
                <div
                  key={b.id}
                  onClick={() => onSelectSurah(b.surahNumber, b.page)}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-emerald-500/50 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                      <Bookmark className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100">
                        سورة {b.surahName} : آية {b.verseNumber}
                      </div>
                      <div className="text-xs text-stone-400">
                        صفحة {b.page} · {new Date(b.timestamp).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    متابعة
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
