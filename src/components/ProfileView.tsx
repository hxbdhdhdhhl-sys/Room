import React from 'react';
import { 
  User, 
  Moon, 
  Sun, 
  Bookmark, 
  Award, 
  Flame, 
  BookOpen, 
  Bell, 
  Share2, 
  Info, 
  Check, 
  Clock,
  Sparkles,
  Heart
} from 'lucide-react';
import { Bookmark as BookmarkType, KhatmahRecord } from '../types/quran';

interface ProfileViewProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  khatmah: KhatmahRecord;
  bookmarks: BookmarkType[];
  onNavigateToPage: (page: number) => void;
  onRemoveBookmark: (id: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  isDarkMode,
  onToggleDarkMode,
  khatmah,
  bookmarks,
  onNavigateToPage,
  onRemoveBookmark
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-2xl border border-emerald-200 dark:border-emerald-800 shadow-xs">
          <User className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            قارئ القرآن الكريم
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ» · جعلنا الله وإياكم من أهل القرآن وخاصته
          </p>
        </div>
      </div>

      {/* Lifetime Reading Achievements Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-center">
          <div className="text-xs text-stone-400 mb-1">الصفحات المنجزة</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {khatmah.completedPages}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">صفحة مباركة</div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-center">
          <div className="text-xs text-stone-400 mb-1">الأجزاء المكتملة</div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            {khatmah.completedJuz.length}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">من 30 جزء</div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-center">
          <div className="text-xs text-stone-400 mb-1">أيام الالتزام</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums flex items-center justify-center gap-1">
            <Flame className="w-5 h-5 fill-current" />
            <span>{Math.max(1, khatmah.history?.length || 1)}</span>
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">أيام متتالية</div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-center">
          <div className="text-xs text-stone-400 mb-1">العلامات المرجعية</div>
          <div className="text-2xl font-bold text-teal-700 dark:text-teal-400 tabular-nums">
            {bookmarks.length}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">مواضع محفوظة</div>
        </div>
      </div>

      {/* Preferences & Settings */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
          تفضيلات التطبيق والقراءة
        </h3>

        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {/* Dark / Light Mode Switch */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  المظهر (الوضع الداكن والنهاري)
                </div>
                <div className="text-xs text-stone-400">
                  {isDarkMode ? 'الوضع الليلي مفعّل لراحة العين أثناء القراءة ليلاً' : 'الوضع النهاري الدافئ مفعّل'}
                </div>
              </div>
            </div>

            <button
              onClick={onToggleDarkMode}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                isDarkMode ? 'bg-emerald-600' : 'bg-stone-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                isDarkMode ? '-translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Daily Reminder Simulation */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  تذكير الورد اليومي
                </div>
                <div className="text-xs text-stone-400">
                  تنبيه هادئ بعد صلاة الفجر وصلاة العشاء لقراءة وردك
                </div>
              </div>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
              مفعّل تلقائياً
            </span>
          </div>

          {/* Offline Mushaf status */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  المصحف دون إنترنت (Offline)
                </div>
                <div className="text-xs text-stone-400">
                  يتم حفظ السور والصفحات المقروءة تلقائياً في ذاكرة الجهاز المحلية
                </div>
              </div>
            </div>

            <span className="text-xs text-stone-400 flex items-center gap-1">
              <Check className="w-4 h-4 text-emerald-600" />
              جاهز
            </span>
          </div>
        </div>
      </div>

      {/* Bookmarks Manager */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
          العلامات المرجعية المحفوظة ({bookmarks.length})
        </h3>

        {bookmarks.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs">
            لا توجد علامات مرجعية محفوظة حالياً.
          </div>
        ) : (
          <div className="space-y-2">
            {bookmarks.map(b => (
              <div
                key={b.id}
                className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                    سورة {b.surahName} : آية {b.verseNumber}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    صفحة {b.page} · {new Date(b.timestamp).toLocaleDateString('ar-SA')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateToPage(b.page)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[11px] font-medium"
                  >
                    انتقال
                  </button>
                  <button
                    onClick={() => onRemoveBookmark(b.id)}
                    className="text-stone-400 hover:text-red-500 text-xs px-2"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* About App & Inspiration */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
          اطمئنان القرآن
        </h4>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
          تطبيق إسلامي راقٍ مستوحى من تجربة وبساطة تطبيق وحي (Wahy)، مصمم ليوفر للمسلم بيئة هادئة خالية من المشتتات لتدبر كتاب الله، مع تتبع بياني متطور لإنجاز الختمات وأذكار اليوم والليلة.
        </p>
        <div className="text-[10px] text-stone-400 pt-2">
          الإصدار 2.4.0 · صدقة جارية لكل قارئ ومستمع
        </div>
      </div>
    </div>
  );
};
