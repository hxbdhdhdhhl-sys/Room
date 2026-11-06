import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Star, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Info, 
  Bookmark,
  Award
} from 'lucide-react';
import { PROPHETIC_HADITHS, HADITH_CATEGORIES } from '../data/hadiths';
import { HadithItem } from '../types/quran';

export const HadithView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [favoriteHadithIds, setFavoriteHadithIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('itm_fav_hadiths');
    return saved ? JSON.parse(saved) : ['h1', 'h2'];
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Hadith of the Day (deterministic based on day of month)
  const todayIndex = new Date().getDate() % PROPHETIC_HADITHS.length;
  const hadithOfTheDay = PROPHETIC_HADITHS[todayIndex];

  const toggleFavorite = (hadithId: string) => {
    setFavoriteHadithIds(prev => {
      const updated = prev.includes(hadithId)
        ? prev.filter(id => id !== hadithId)
        : [...prev, hadithId];
      localStorage.setItem('itm_fav_hadiths', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCopy = (hadith: HadithItem) => {
    const text = `${hadith.title}\n\n${hadith.arabicText}\n\nالمصدر: [${hadith.source} - ${hadith.book}]\nالدرجة: ${hadith.grade}\n\nالشرح: ${hadith.explanation}\n\nمن تطبيق اطمئنان القرآن`;
    navigator.clipboard.writeText(text);
    setCopiedId(hadith.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (hadith: HadithItem) => {
    const text = `${hadith.title}\n\n${hadith.arabicText}\n\nالمصدر: [${hadith.source}] - الدرجة: ${hadith.grade}\nالشرح: ${hadith.explanation}`;
    if (navigator.share) {
      navigator.share({
        title: hadith.title,
        text
      }).catch(() => {});
    } else {
      handleCopy(hadith);
    }
  };

  const filteredHadiths = PROPHETIC_HADITHS.filter(h => {
    if (showOnlyFavorites && !favoriteHadithIds.includes(h.id)) return false;
    if (selectedCategory !== 'all' && h.category !== selectedCategory) return false;

    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      h.title.includes(q) ||
      h.arabicText.includes(q) ||
      h.explanation.includes(q) ||
      h.narrator.includes(q) ||
      h.source.includes(q)
    );
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Header Banner */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
              <BookOpen className="w-4 h-4" />
              <span>مكتبة السنة النبوية المطهرة</span>
              <span>·</span>
              <span>أحاديث صحيحة موثقة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">
              رياض الأحاديث النبوية
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              مختارات من صحاح الأحاديث مع درجة التوثيق، اسم الكتاب، والشرح الميسر لتدبر هدي المصطفى ﷺ
            </p>
          </div>
        </div>
      </div>

      {/* Hadith of the Day Spotlight Card */}
      <div className="bg-gradient-to-l from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-emerald-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>حديث اليوم المبارك</span>
            </span>

            <span className="text-xs text-emerald-200">
              {hadithOfTheDay.source} · {hadithOfTheDay.grade}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {hadithOfTheDay.title}
          </h2>

          <div className="font-arabic text-base sm:text-lg text-emerald-50 leading-relaxed py-1 bg-white/5 p-4 rounded-2xl border border-white/10">
            {hadithOfTheDay.arabicText}
          </div>

          <div className="text-xs text-emerald-200/90 leading-relaxed pt-1">
            <span className="font-bold text-white">الشرح الميسر: </span>
            {hadithOfTheDay.explanation}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <span className="text-emerald-300">{hadithOfTheDay.narrator}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(hadithOfTheDay)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-1"
              >
                {copiedId === hadithOfTheDay.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === hadithOfTheDay.id ? 'تم النسخ' : 'نسخ'}</span>
              </button>

              <button
                onClick={() => handleShare(hadithOfTheDay)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="مشاركة"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث في متن الحديث، اسم الراوي، أو الموضوع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Favorites filter toggle */}
          <button
            onClick={() => setShowOnlyFavorites(prev => !prev)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
              showOnlyFavorites
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-current' : ''}`} />
            <span>المفضلة ({favoriteHadithIds.length})</span>
          </button>
        </div>

        {/* Categories Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {HADITH_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hadiths List Cards */}
      <div className="space-y-4">
        {filteredHadiths.map(hadith => {
          const isFav = favoriteHadithIds.includes(hadith.id);
          const isCopied = copiedId === hadith.id;

          return (
            <div
              key={hadith.id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs transition-all space-y-3 text-right"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-stone-900 dark:text-stone-100">
                      {hadith.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                      {hadith.grade}
                    </span>
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    {hadith.source} · {hadith.book} {hadith.number ? `· رقم ${hadith.number}` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFavorite(hadith.id)}
                    className={`p-2 rounded-xl transition-colors ${
                      isFav ? 'text-amber-500' : 'text-stone-300 dark:text-stone-600 hover:text-amber-500'
                    }`}
                    title={isFav ? 'إزالة من المفضلة' : 'حفظ بالمفضلة'}
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleCopy(hadith)}
                    className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl transition-colors"
                    title="نسخ الحديث"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleShare(hadith)}
                    className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl transition-colors"
                    title="مشاركة الحديث"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Hadith Text Box */}
              <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl font-arabic text-base sm:text-lg text-stone-900 dark:text-stone-100 leading-loose border border-stone-100 dark:border-stone-800">
                {hadith.arabicText}
              </div>

              {/* Explanation & Narrator */}
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl text-xs text-stone-700 dark:text-stone-300 leading-relaxed border border-emerald-100/50 dark:border-emerald-800/30">
                <span className="font-bold text-emerald-800 dark:text-emerald-400">الشرح الميسر: </span>
                {hadith.explanation}
              </div>

              {/* Footer Badge */}
              <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
                <span>راوي الحديث: {hadith.narrator}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800">
                  {hadith.categoryLabelAr}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
