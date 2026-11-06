import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { 
  BookOpen, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  Plus, 
  RotateCcw, 
  Award, 
  Flame, 
  Clock, 
  ArrowLeft,
  Sliders,
  Check
} from 'lucide-react';
import { KhatmahRecord } from '../types/quran';
import { JUZ_LIST } from '../data/quranMeta';

interface KhatmahTrackerProps {
  khatmah: KhatmahRecord;
  onUpdateKhatmah: (updated: KhatmahRecord) => void;
  onNavigateToPage: (page: number) => void;
  isDarkMode?: boolean;
}

export const KhatmahTracker: React.FC<KhatmahTrackerProps> = ({
  khatmah,
  onUpdateKhatmah,
  onNavigateToPage,
  isDarkMode = false
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [inputPage, setInputPage] = useState<number>(khatmah.completedPages);
  const [customDays, setCustomDays] = useState<number>(khatmah.targetDays);
  const [selectedJuzFilter, setSelectedJuzFilter] = useState<'all' | 'completed' | 'remaining'>('all');

  // Calculations
  const totalPages = 604;
  const completedPages = Math.min(totalPages, Math.max(0, khatmah.completedPages));
  const remainingPages = totalPages - completedPages;
  const percentage = Number(((completedPages / totalPages) * 100).toFixed(1));
  
  // Calculate Juz equivalents (approx 20 pages per Juz)
  const completedJuzCount = Number((completedPages / 20.13).toFixed(1));
  const remainingJuzCount = Number((Math.max(0, 30 - (completedPages / 20.13))).toFixed(1));

  // Daily required pace to finish on target
  const startDate = new Date(khatmah.startDate);
  const today = new Date();
  const daysPassed = Math.max(1, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
  const daysRemaining = Math.max(1, khatmah.targetDays - daysPassed);
  const requiredDailyPages = Math.max(1, Math.ceil(remainingPages / daysRemaining));

  // Current average pace
  const currentPace = (completedPages / daysPassed).toFixed(1);
  const estimatedDaysToFinish = Number(currentPace) > 0 ? Math.ceil(remainingPages / Number(currentPace)) : '--';

  // Pie Chart Data for Completion & Remaining
  const pieData = [
    { name: 'المنجز', value: completedPages, color: '#059669' }, // Emerald
    { name: 'المتبقي', value: remainingPages, color: isDarkMode ? '#292524' : '#e7e5e4' } // Stone
  ];

  // History data formatted for Recharts BarChart & AreaChart
  const historyData = useMemo(() => {
    if (khatmah.history && khatmah.history.length > 0) {
      return khatmah.history.slice(-7).map(item => ({
        date: item.date,
        pages: item.pagesRead,
        target: khatmah.dailyGoalPages
      }));
    }
    // Default 7 days representation
    const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    return days.map((day, idx) => ({
      date: day,
      pages: idx === 6 ? Math.min(20, completedPages % 20 || 18) : (idx % 2 === 0 ? 20 : 16),
      target: 20
    }));
  }, [khatmah.history, completedPages, khatmah.dailyGoalPages]);

  // Handle logging pages
  const handleSavePage = (newPageNumber: number) => {
    const clamped = Math.min(totalPages, Math.max(0, newPageNumber));
    const addedPages = Math.max(0, clamped - khatmah.completedPages);
    
    // Automatically calculate completed Juz
    const newCompletedJuz: number[] = [];
    JUZ_LIST.forEach(j => {
      if (clamped >= j.endPage) {
        newCompletedJuz.push(j.number);
      }
    });

    const todayStr = new Intl.DateTimeFormat('ar-SA', { weekday: 'short' }).format(new Date());
    const newHistory = [...(khatmah.history || [])];
    newHistory.push({
      date: todayStr,
      pagesRead: addedPages > 0 ? addedPages : 1,
      cumulativePages: clamped
    });

    onUpdateKhatmah({
      ...khatmah,
      completedPages: clamped,
      completedJuz: newCompletedJuz,
      history: newHistory.slice(-14)
    });

    setShowLogModal(false);
  };

  // Toggle single Juz manual mark
  const toggleJuz = (juzNumber: number) => {
    const isCompleted = khatmah.completedJuz.includes(juzNumber);
    let updatedList: number[];
    if (isCompleted) {
      updatedList = khatmah.completedJuz.filter(n => n !== juzNumber);
    } else {
      updatedList = [...khatmah.completedJuz, juzNumber];
    }
    
    // Also estimate page if marking latest
    const correspondingJuz = JUZ_LIST.find(j => j.number === juzNumber);
    const newPage = !isCompleted && correspondingJuz ? Math.max(khatmah.completedPages, correspondingJuz.endPage) : khatmah.completedPages;

    onUpdateKhatmah({
      ...khatmah,
      completedJuz: updatedList,
      completedPages: newPage
    });
  };

  // Update target plan
  const handleSaveTarget = () => {
    const dailyGoal = Math.ceil(totalPages / customDays);
    onUpdateKhatmah({
      ...khatmah,
      targetDays: customDays,
      dailyGoalPages: dailyGoal
    });
    setShowSettingsModal(false);
  };

  // Reset Khatmah
  const handleResetKhatmah = () => {
    if (window.confirm('هل تود حقاً بدء ختمة جديدة وتصفير التقدم الحالي؟')) {
      onUpdateKhatmah({
        ...khatmah,
        completedPages: 0,
        completedJuz: [],
        startDate: new Date().toISOString(),
        history: []
      });
      setShowSettingsModal(false);
    }
  };

  // Filtered Juz list
  const filteredJuzList = JUZ_LIST.filter(j => {
    const isDone = khatmah.completedJuz.includes(j.number) || completedPages >= j.endPage;
    if (selectedJuzFilter === 'completed') return isDone;
    if (selectedJuzFilter === 'remaining') return !isDone;
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Top Banner / Goal Header */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
              <Award className="w-4 h-4" />
              <span>{khatmah.title || 'ختمة التدبر والاطمئنان'}</span>
              <span>·</span>
              <span>هدف {khatmah.targetDays} يوماً</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">
              متابعة الختمة والورد القرآني
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾ · قراءة هادئة بتدبر ورسوم بيانية دقيقة لإنجازك
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setInputPage(khatmah.completedPages);
                setShowLogModal(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل قراءة</span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl transition-colors"
              title="إعدادات الختمة"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Completion Percentage */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 dark:text-stone-400 mb-1 font-medium">نسبة الإنجاز</div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {percentage}%
          </div>
          <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            من إجمالي المصحف الشريف
          </div>
        </div>

        {/* Metric 2: Remaining Juz */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 dark:text-stone-400 mb-1 font-medium">الأجزاء المتبقية</div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            {remainingJuzCount} <span className="text-sm font-normal text-stone-500 dark:text-stone-400">جزء</span>
          </div>
          <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            أكملت {completedJuzCount} من 30 جزء
          </div>
        </div>

        {/* Metric 3: Pages Status */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 dark:text-stone-400 mb-1 font-medium">الصفحات المقروءة</div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            {completedPages} <span className="text-sm font-normal text-stone-500 dark:text-stone-400">/ 604</span>
          </div>
          <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            متبقي {remainingPages} صفحة
          </div>
        </div>

        {/* Metric 4: Daily Goal Pace */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 dark:text-stone-400 mb-1 font-medium">الورد اليومي المطلوب</div>
          <div className="text-2xl sm:text-3xl font-bold text-teal-700 dark:text-teal-400 tabular-nums">
            {requiredDailyPages} <span className="text-sm font-normal text-stone-500 dark:text-stone-400">صفحة/يوم</span>
          </div>
          <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            المتبقي {daysRemaining} يوم في الختمة
          </div>
        </div>
      </div>

      {/* Main Visual Charts Section with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Recharts Donut & Completion Analytics */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              مؤشر التقدم في الختمة
            </h2>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              المصحف الشريف (604 صفحة)
            </span>
          </div>

          {/* Recharts Circular Gauge */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={98}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Statistics */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">الإنجاز الكلي</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-50 tabular-nums">
                {percentage}%
              </span>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <span>{remainingJuzCount} أجزاء متبقية</span>
              </div>
            </div>
          </div>

          {/* Legend and Action Link */}
          <div className="w-full space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
                <span>المنجز: {completedPages} صفحة ({completedJuzCount} جزء)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-stone-300 dark:bg-stone-700 inline-block" />
                <span>المتبقي: {remainingPages} صفحة</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateToPage(Math.min(totalPages, completedPages + 1))}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-medium transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>متابعة القراءة من صفحة {Math.min(totalPages, completedPages + 1)}</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Daily Activity & Reading History Recharts */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                  نشاط القراءة اليومية (الصفحات المقروءة)
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  مقارنة الصفحات المقروءة مع معدل الورد المستهدف ({khatmah.dailyGoalPages} صفحة/يوم)
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" /> المقروء
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-stone-300 dark:bg-stone-700" /> الهدف
                </span>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#292524' : '#f5f5f4'} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: isDarkMode ? '#a8a29e' : '#78716c', fontSize: 11 }}
                    axisLine={{ stroke: isDarkMode ? '#44403c' : '#e7e5e4' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: isDarkMode ? '#a8a29e' : '#78716c', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1c1917' : '#ffffff',
                      border: isDarkMode ? '1px solid #44403c' : '1px solid #e7e5e4',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: isDarkMode ? '#f5f5f4' : '#1c1917'
                    }}
                    formatter={(value: any, name: any) => [
                      `${value} صفحة`,
                      name === 'pages' ? 'الصفحات المقروءة' : 'الهدف'
                    ]}
                    labelFormatter={(label) => `يوم: ${label}`}
                  />
                  <Bar dataKey="pages" fill="#059669" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Motivational Insight Card */}
          <div className="mt-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                  متوسط وتيرتك الحالية: {currentPace} صفحة / يوم
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                  {estimatedDaysToFinish !== '--' 
                    ? `بهذه الوتيرة، يُتوقع إتمام الختمة المباركة خلال ${estimatedDaysToFinish} يوماً إن شاء الله.`
                    : 'استمر في القراءة بانتظام لتحقيق الختمة في موعدها.'
                  }
                </div>
              </div>
            </div>

            <div className="hidden sm:block text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
              {khatmah.completedJuz.length} من 30 جزء مكتمل
            </div>
          </div>
        </div>
      </div>

      {/* 30 Juz Visual Heatmap & Checklist */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              خريطة الأجزاء الثلاثين (فهرس الختمة)
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              تصفح الأجزاء المكتملة والمتبقية، اضغط على أي جزء لتحديث حالته أو الانتقال لقراءته مباشرة
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => setSelectedJuzFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedJuzFilter === 'all'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
              }`}
            >
              الكل (30)
            </button>
            <button
              onClick={() => setSelectedJuzFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedJuzFilter === 'completed'
                  ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
              }`}
            >
              المكتمل ({khatmah.completedJuz.length})
            </button>
            <button
              onClick={() => setSelectedJuzFilter('remaining')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedJuzFilter === 'remaining'
                  ? 'bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
              }`}
            >
              المتبقي ({30 - khatmah.completedJuz.length})
            </button>
          </div>
        </div>

        {/* 30 Juz Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
          {filteredJuzList.map(juz => {
            const isDone = khatmah.completedJuz.includes(juz.number) || completedPages >= juz.endPage;
            const isCurrent = !isDone && completedPages >= juz.startPage && completedPages < juz.endPage;

            return (
              <div
                key={juz.number}
                className={`relative rounded-2xl p-3 border transition-all text-right group ${
                  isDone
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                    : isCurrent
                    ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
                    : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    الجزء {juz.number}
                  </span>
                  
                  {/* Quick toggle button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleJuz(juz.number);
                    }}
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : 'border border-stone-300 dark:border-stone-600 text-transparent hover:border-emerald-500'
                    }`}
                    title={isDone ? 'إلغاء التحديد' : 'تحديد كمكتمل'}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>

                <div className="text-[11px] font-medium text-stone-700 dark:text-stone-300 truncate">
                  {juz.startSurahName}
                </div>
                
                <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                  ص {juz.startPage} - {juz.endPage}
                </div>

                {/* Jump to page in Quran */}
                <button
                  onClick={() => onNavigateToPage(juz.startPage)}
                  className="mt-2 text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>اقرأ الجزء</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Log Pages Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-xl text-right animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">
              تسجيل موضع القراءة الحالي
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
              أدخل رقم الصفحة التي وصلت إليها في المصحف لتحديث رسوم الختمة البيانية
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  رقم الصفحة الحالية (1 - 604)
                </label>
                <input
                  type="number"
                  min="1"
                  max="604"
                  value={inputPage}
                  onChange={(e) => setInputPage(Number(e.target.value))}
                  className="w-full text-center text-2xl font-bold p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Quick increment buttons */}
              <div className="flex items-center gap-2">
                {[1, 5, 10, 20].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => setInputPage(prev => Math.min(604, prev + inc))}
                    className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-medium transition-colors"
                  >
                    +{inc} ص
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300">
                بإتمام صفحة {inputPage}، تكون قد أنجزت {((inputPage / 604) * 100).toFixed(1)}% من الختمة المباركة.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSavePage(inputPage)}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl text-sm transition-colors shadow-xs"
                >
                  حفظ وتحديث
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium rounded-xl text-sm transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Khatmah Target & Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-xl text-right animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">
              إعدادات خطة الختمة
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
              خصص مدة الختمة والورد اليومي المناسب لك
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-2">
                  المدة المستهدفة للختمة
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 60, 90].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setCustomDays(days)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        customDays === days
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-emerald-500'
                      }`}
                    >
                      {days} يوماً
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/70 p-3 rounded-xl space-y-1">
                <div>الورد المطلوب يومياً: <span className="font-bold text-emerald-700 dark:text-emerald-400">{Math.ceil(604 / customDays)} صفحة</span> تقريباً.</div>
                <div>أي ما يعادل <span className="font-bold">{((604 / customDays) / 20).toFixed(1)} جزء</span> كل يوم.</div>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSaveTarget}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl text-sm transition-colors shadow-xs"
                >
                  حفظ الخطة
                </button>

                <button
                  type="button"
                  onClick={handleResetKhatmah}
                  className="w-full py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>بدء ختمة جديدة وتصفير السجل</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="w-full py-2 text-stone-500 dark:text-stone-400 text-xs hover:underline"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
