import React from 'react';
import { 
  BookOpen, 
  Award, 
  Flame, 
  Sun, 
  Moon, 
  Compass, 
  Clock, 
  Volume2, 
  ArrowLeft, 
  Sparkles, 
  Play,
  HeartHandshake,
  Globe2,
  Crown,
  Share2
} from 'lucide-react';
import { KhatmahRecord, SurahMeta } from '../types/quran';
import { SURAHS_META } from '../data/quranMeta';
import { POPULAR_CITIES, getPrayerTimesForDate, getNextPrayer } from '../data/prayers';
import { PROPHETIC_HADITHS } from '../data/hadiths';
import { NavTab } from './BottomNav';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface HomeViewProps {
  lastReadPage: number;
  lastReadSurah: number;
  khatmah: KhatmahRecord;
  onNavigateToTab: (tab: NavTab) => void;
  onNavigateToPage: (page: number) => void;
  onPlaySurah: (surahNumber: number) => void;
  onOpenVipModal: () => void;
  isDarkMode?: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  lastReadPage,
  lastReadSurah,
  khatmah,
  onNavigateToTab,
  onNavigateToPage,
  onPlaySurah,
  onOpenVipModal,
  isDarkMode = false
}) => {
  const surahMeta = SURAHS_META.find(s => s.number === lastReadSurah) || SURAHS_META[0];
  const prayerTimes = getPrayerTimesForDate(new Date(), POPULAR_CITIES[0]);
  const nextPrayer = getNextPrayer(prayerTimes);

  const totalPages = 604;
  const completed = khatmah.completedPages;
  const percentage = Number(((completed / totalPages) * 100).toFixed(1));
  const remainingJuz = Number((Math.max(0, 30 - (completed / 20.13))).toFixed(1));

  const pieData = [
    { name: 'المنجز', value: completed, color: '#059669' },
    { name: 'المتبقي', value: totalPages - completed, color: isDarkMode ? '#292524' : '#e7e5e4' }
  ];

  const todayHadith = PROPHETIC_HADITHS[new Date().getDate() % PROPHETIC_HADITHS.length];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Welcome & Spiritual Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>اطمئنان القرآن 1.4</span>
            <span>·</span>
            <span>ألا بذكر الله تطمئن القلوب</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 tracking-tight mt-1">
            السلام عليكم ورحمة الله وبركاته
          </h1>
        </div>

        {/* VIP & Next Prayer Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVipModal}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-xs shadow-xs hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            <Crown className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>عضوية VIP</span>
          </button>

          <div 
            onClick={() => onNavigateToTab('prayers')}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-xs cursor-pointer hover:border-emerald-500/50 transition-colors"
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <div className="text-right">
              <div className="text-[10px] text-stone-400">الصلاة القادمة</div>
              <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                {nextPrayer.name} {nextPrayer.time}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Hero: Continue Reading Card */}
      <div className="bg-gradient-to-l from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-emerald-200 font-medium">
              آخر موضع قراءة محفوظ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold">
              سورة {surahMeta.name}
            </h2>
            <p className="text-xs text-emerald-100/80">
              صفحة {lastReadPage} من 604 · الجزء {surahMeta.juz}
            </p>
          </div>

          <button
            onClick={() => {
              onNavigateToPage(lastReadPage);
              onNavigateToTab('quran');
            }}
            className="flex items-center gap-2 bg-white text-emerald-900 hover:bg-emerald-50 px-5 py-3 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>متابعة القراءة</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Khatmah Progress Spotlight with Recharts Donut */}
      <div 
        onClick={() => onNavigateToTab('wird')}
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500/50 rounded-3xl p-6 shadow-xs cursor-pointer transition-all active:scale-[0.99] group"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-right flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <Award className="w-4 h-4" />
              <span>الختمة الحالية</span>
              <span>·</span>
              <span className="text-stone-400">{khatmah.title || 'ختمة التدبر والاطمئنان'}</span>
            </div>

            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              متبقي {remainingJuz} جزء لإتمام الختمة
            </h3>
            
            <p className="text-xs text-stone-500 dark:text-stone-400">
              أنجزت {completed} صفحة ({percentage}%) من المصحف الشريف. اضغط لعرض الرسوم البيانية المفصلة وتفاصيل الأجزاء.
            </p>

            <div className="pt-2 flex items-center justify-center sm:justify-start gap-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <span>عرض تحليلات الختمة ⟵</span>
            </div>
          </div>

          {/* Mini Recharts Donut */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={50}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`home-pie-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Apps Shortcuts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateToTab('recitations')}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500/50 p-4 rounded-3xl flex flex-col items-center justify-center text-center space-y-2 transition-all active:scale-95 shadow-xs"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">مكتبة القراء</span>
            <span className="text-[10px] text-stone-400">بما فيهم عبد الرحمن بن مسعد</span>
          </div>
        </button>

        <button
          onClick={() => onNavigateToTab('world_clock')}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500/50 p-4 rounded-3xl flex flex-col items-center justify-center text-center space-y-2 transition-all active:scale-95 shadow-xs"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">التوقيت العالمي</span>
            <span className="text-[10px] text-stone-400">ساعات مدن وعواصم العالم</span>
          </div>
        </button>

        <button
          onClick={() => onNavigateToTab('hadiths')}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500/50 p-4 rounded-3xl flex flex-col items-center justify-center text-center space-y-2 transition-all active:scale-95 shadow-xs"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">الأحاديث النبوية</span>
            <span className="text-[10px] text-stone-400">صحيحة مع التوثيق والشرح</span>
          </div>
        </button>

        <button
          onClick={() => onNavigateToTab('prayers')}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500/50 p-4 rounded-3xl flex flex-col items-center justify-center text-center space-y-2 transition-all active:scale-95 shadow-xs"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">مواقيت الصلاة</span>
            <span className="text-[10px] text-stone-400">والأذان وبوصلة القبلة</span>
          </div>
        </button>
      </div>

      {/* Prophetic Hadith of the Day Card */}
      <div 
        onClick={() => onNavigateToTab('hadiths')}
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs cursor-pointer hover:border-emerald-500/50 transition-all space-y-2 text-right"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>حديث اليوم النبوي</span>
          </span>
          <span className="text-[10px] text-stone-400">{todayHadith.source}</span>
        </div>

        <div className="font-arabic text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-relaxed">
          {todayHadith.arabicText}
        </div>

        <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
          {todayHadith.explanation}
        </div>
      </div>

      {/* Ayah of Tranquility & Contemplation */}
      <div className="bg-parchment border border-stone-200 dark:border-stone-800 rounded-3xl p-6 text-center space-y-3 shadow-xs">
        <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
          نفحة سكينة وطمأنينة
        </span>
        <div className="font-uthmanic text-xl sm:text-2xl text-stone-900 dark:text-stone-100 leading-relaxed max-w-2xl mx-auto">
          ﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾
        </div>
        <div className="text-xs text-stone-400">
          [ سورة الرعد : الآية 28 ]
        </div>
      </div>
    </div>
  );
};
