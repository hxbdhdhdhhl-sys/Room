import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Bookmark as BookmarkIcon, 
  Play, 
  Pause, 
  Volume2, 
  Type, 
  Share2, 
  Copy, 
  BookOpen, 
  Info, 
  Maximize2, 
  Minimize2, 
  List, 
  Search,
  Check,
  X,
  FileText,
  HelpCircle,
  Sparkles,
  Download
} from 'lucide-react';
import { Ayah, SurahMeta, Bookmark, AyahNote } from '../types/quran';
import { SURAHS_META, JUZ_LIST } from '../data/quranMeta';
import { fetchSurahAyahs } from '../data/quranService';

interface QuranReaderProps {
  currentPage: number;
  currentSurahNumber: number;
  onPageChange: (page: number) => void;
  onSurahChange: (surahNumber: number) => void;
  bookmarks: Bookmark[];
  onToggleBookmark: (bookmark: Bookmark) => void;
  activePlayingAyah: { surah: number; ayah: number } | null;
  isPlaying: boolean;
  onPlayAyahAudio: (surahNumber: number, ayahNumber: number) => void;
  onPauseAudio: () => void;
}

export const QuranReader: React.FC<QuranReaderProps> = ({
  currentPage,
  currentSurahNumber,
  onPageChange,
  onSurahChange,
  bookmarks,
  onToggleBookmark,
  activePlayingAyah,
  isPlaying,
  onPlayAyahAudio,
  onPauseAudio
}) => {
  const [viewMode, setViewMode] = useState<'page' | 'surah'>('page');
  const [fontSize, setFontSize] = useState<number>(24);
  const [zenMode, setZenMode] = useState<boolean>(false);
  const [pageAyahs, setPageAyahs] = useState<Ayah[]>([]);
  const [surahAyahs, setSurahAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [showSurahModal, setShowSurahModal] = useState<boolean>(false);
  const [searchSurahQuery, setSearchSurahQuery] = useState<string>('');
  const [copiedAyah, setCopiedAyah] = useState<boolean>(false);

  // Notes state
  const [ayahNotes, setAyahNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('itm_ayah_notes');
    return saved ? JSON.parse(saved) : {};
  });
  const [currentNoteInput, setCurrentNoteInput] = useState<string>('');
  const [showNoteEditor, setShowNoteEditor] = useState<boolean>(false);

  // Social Card Share Modal state
  const [showShareCardModal, setShowShareCardModal] = useState<boolean>(false);
  const [cardTheme, setCardTheme] = useState<'emerald' | 'classic' | 'pearl' | 'kaaba'>('emerald');

  // Selected ayah drawer tabs
  const [drawerTab, setDrawerTab] = useState<'tafseer' | 'meanings' | 'asbab' | 'notes'>('tafseer');

  // Find meta for current Surah
  const currentSurahMeta = SURAHS_META.find(s => s.number === currentSurahNumber) || SURAHS_META[0];
  
  // Find current Juz from page
  const currentJuz = JUZ_LIST.find(j => currentPage >= j.startPage && currentPage <= j.endPage) || JUZ_LIST[0];

  // Load ayahs when surah or page changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      const sAyahs = await fetchSurahAyahs(currentSurahNumber);
      if (!isMounted) return;
      setSurahAyahs(sAyahs);

      const relevantSurahs = SURAHS_META.filter(
        s => currentPage >= s.startPage && currentPage <= s.endPage
      );

      const targetSurah = relevantSurahs[0] || currentSurahMeta;
      const loadedTarget = await fetchSurahAyahs(targetSurah.number);
      
      if (!isMounted) return;
      const pageFiltered = loadedTarget.filter(a => a.page === currentPage);
      if (pageFiltered.length > 0) {
        setPageAyahs(pageFiltered);
      } else {
        setPageAyahs(loadedTarget.slice(0, 15));
      }
      setLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentPage, currentSurahNumber]);

  // Navigate pages
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      onPageChange(newPage);
      const surahForPage = SURAHS_META.find(s => newPage >= s.startPage && newPage <= s.endPage);
      if (surahForPage && surahForPage.number !== currentSurahNumber) {
        onSurahChange(surahForPage.number);
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < 604) {
      const newPage = currentPage + 1;
      onPageChange(newPage);
      const surahForPage = SURAHS_META.find(s => newPage >= s.startPage && newPage <= s.endPage);
      if (surahForPage && surahForPage.number !== currentSurahNumber) {
        onSurahChange(surahForPage.number);
      }
    }
  };

  // Copy Ayah text
  const handleCopyAyah = (ayah: Ayah) => {
    const meta = SURAHS_META.find(s => s.number === ayah.surahNumber);
    const fullText = `﴿ ${ayah.text} ﴾ [سورة ${meta?.name || ''}: ${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(fullText);
    setCopiedAyah(true);
    setTimeout(() => setCopiedAyah(false), 2000);
  };

  // Save personal note
  const handleSaveNote = () => {
    if (!selectedAyah) return;
    const key = `${selectedAyah.surahNumber}_${selectedAyah.numberInSurah}`;
    const updated = { ...ayahNotes, [key]: currentNoteInput };
    setAyahNotes(updated);
    localStorage.setItem('itm_ayah_notes', JSON.stringify(updated));
    setShowNoteEditor(false);
  };

  const isAyahBookmarked = (surahNum: number, ayahNum: number) => {
    return bookmarks.some(b => b.surahNumber === surahNum && b.verseNumber === ayahNum);
  };

  const filteredSurahs = SURAHS_META.filter(s => 
    s.name.includes(searchSurahQuery) || 
    s.englishName.toLowerCase().includes(searchSurahQuery.toLowerCase()) ||
    s.number.toString() === searchSurahQuery
  );

  const displayAyahs = viewMode === 'page' ? (pageAyahs.length > 0 ? pageAyahs : surahAyahs) : surahAyahs;

  const currentNoteKey = selectedAyah ? `${selectedAyah.surahNumber}_${selectedAyah.numberInSurah}` : '';
  const currentNote = selectedAyah ? ayahNotes[currentNoteKey] || '' : '';

  return (
    <div className={`w-full max-w-4xl mx-auto px-3 sm:px-6 transition-all duration-300 ${zenMode ? 'py-2' : 'py-4 space-y-4'} pb-28`}>
      
      {/* Top Reading Navigation Bar */}
      {!zenMode && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl px-4 py-3 flex items-center justify-between shadow-xs">
          {/* Surah & Juz Info Button */}
          <button
            onClick={() => setShowSurahModal(true)}
            className="flex items-center gap-2 text-right hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-bold text-xs text-stone-700 dark:text-stone-300">
              {currentSurahMeta.number}
            </div>
            <div>
              <div className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>سورة {currentSurahMeta.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-500 font-normal">
                  {currentSurahMeta.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                </span>
              </div>
              <div className="text-xs text-stone-400 dark:text-stone-500">
                الجزء {currentJuz.number} · {currentSurahMeta.numberOfAyahs} آيات
              </div>
            </div>
          </button>

          {/* Action Tools */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setViewMode('page')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  viewMode === 'page'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500'
                }`}
              >
                صفحة
              </button>
              <button
                onClick={() => setViewMode('surah')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  viewMode === 'surah'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500'
                }`}
              >
                سورة
              </button>
            </div>

            {/* Font Size Selector */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-xl">
              <button
                onClick={() => setFontSize(prev => Math.max(18, prev - 2))}
                className="text-stone-600 dark:text-stone-300 hover:text-stone-900 text-xs px-1"
                title="تصغير الخط"
              >
                A-
              </button>
              <span className="text-[11px] text-stone-400 tabular-nums">{fontSize}</span>
              <button
                onClick={() => setFontSize(prev => Math.min(36, prev + 2))}
                className="text-stone-600 dark:text-stone-300 hover:text-stone-900 text-xs px-1 font-bold"
                title="تكبير الخط"
              >
                A+
              </button>
            </div>

            {/* Zen Mode Button */}
            <button
              onClick={() => setZenMode(true)}
              className="p-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="وضع القراءة المركزة"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Zen Mode Floating Exit Bar */}
      {zenMode && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setZenMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/80 text-white text-xs backdrop-blur-md hover:bg-stone-900 transition-all shadow-md"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>خروج من وضع التركيز</span>
          </button>
        </div>
      )}

      {/* Mushaf Paper Frame */}
      <div className="relative bg-parchment rounded-3xl border border-stone-200 dark:border-stone-800/80 p-5 sm:p-10 shadow-sm transition-all duration-200 min-h-[500px]">
        {/* Frame Ornaments (Wahy style) */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-xs text-stone-400 dark:text-stone-500 border-b border-stone-200/60 dark:border-stone-800/60 pb-2">
          <span>الجزء {currentJuz.number}</span>
          <span className="font-semibold text-stone-600 dark:text-stone-400">سورة {currentSurahMeta.name}</span>
          <span>الحزب {Math.ceil(currentJuz.number * 2)}</span>
        </div>

        {/* Surah Header / Basmalah */}
        {(currentPage === currentSurahMeta.startPage || viewMode === 'surah') && (
          <div className="my-6 text-center space-y-3">
            <div className="inline-block px-8 py-2 border-2 border-stone-300 dark:border-stone-700 rounded-2xl bg-white/60 dark:bg-stone-900/60 shadow-xs">
              <span className="font-bold text-lg text-emerald-800 dark:text-emerald-400">
                سُورَةُ {currentSurahMeta.name}
              </span>
            </div>

            {currentSurahMeta.number !== 1 && currentSurahMeta.number !== 9 && (
              <div className="font-quran text-xl sm:text-2xl text-stone-800 dark:text-stone-200 py-1">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            )}
          </div>
        )}

        {/* Ayahs Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3 text-stone-400">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">جاري تحميل الآيات المباركة...</span>
          </div>
        ) : (
          <div 
            className="font-uthmanic text-justify text-stone-900 dark:text-stone-100 leading-loose selection:bg-emerald-200 selection:text-emerald-950"
            style={{ fontSize: `${fontSize}px` }}
          >
            {displayAyahs.map((ayah) => {
              const isPlayingThis = activePlayingAyah?.surah === ayah.surahNumber && activePlayingAyah?.ayah === ayah.numberInSurah;
              const isSelected = selectedAyah?.numberInSurah === ayah.numberInSurah && selectedAyah?.surahNumber === ayah.surahNumber;
              const bookmarked = isAyahBookmarked(ayah.surahNumber, ayah.numberInSurah);
              const hasNote = Boolean(ayahNotes[`${ayah.surahNumber}_${ayah.numberInSurah}`]);

              return (
                <span
                  key={`${ayah.surahNumber}-${ayah.numberInSurah}`}
                  onClick={() => {
                    setSelectedAyah(ayah);
                    setCurrentNoteInput(ayahNotes[`${ayah.surahNumber}_${ayah.numberInSurah}`] || '');
                  }}
                  className={`inline cursor-pointer transition-all duration-150 rounded-md px-1 py-0.5 relative ${
                    isPlayingThis
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                      : isSelected
                      ? 'bg-stone-200/80 dark:bg-stone-800/80 ring-1 ring-stone-400'
                      : bookmarked
                      ? 'bg-amber-50 dark:bg-amber-950/30'
                      : 'hover:bg-stone-100/70 dark:hover:bg-stone-800/50'
                  }`}
                >
                  {ayah.text}{' '}
                  {/* Ayah End Number Glyph */}
                  <span className="inline-flex items-center justify-center w-7 h-7 mx-1 text-xs font-sans font-bold text-amber-700 dark:text-amber-500 border border-amber-600/40 dark:border-amber-500/30 rounded-full align-middle select-none">
                    {ayah.numberInSurah}
                  </span>
                  {hasNote && (
                    <span className="inline-block w-2 h-2 rounded-full bg-teal-500 align-top mr-0.5" title="ملاحظة شخصية محفوظة" />
                  )}
                </span>
              );
            })}
          </div>
        )}

        {/* Page Footer */}
        <div className="mt-10 pt-3 flex items-center justify-between text-xs text-stone-400 dark:text-stone-500 border-t border-stone-200/60 dark:border-stone-800/60">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 hover:text-stone-700 dark:hover:text-stone-300 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السابقة</span>
          </button>

          <span className="font-semibold text-stone-700 dark:text-stone-300 tabular-nums">
            {currentPage}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= 604}
            className="flex items-center gap-1 hover:text-stone-700 dark:hover:text-stone-300 disabled:opacity-30 disabled:pointer-events-none"
          >
            <span>التالية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Ayah Action Drawer / Modal */}
      {selectedAyah && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-t-3xl sm:rounded-3xl p-5 w-full max-w-lg shadow-2xl text-right animate-in slide-in-from-bottom duration-200 max-h-[88vh] overflow-y-auto">
            {/* Grab handle */}
            <div className="w-10 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between mb-3 border-b border-stone-100 dark:border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  سورة {currentSurahMeta.name} : الآية {selectedAyah.numberInSurah}
                </span>
                <span className="text-xs text-stone-400">· صفحة {selectedAyah.page}</span>
              </div>

              <button
                onClick={() => setSelectedAyah(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ayah Text preview */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl font-uthmanic text-lg sm:text-xl text-stone-900 dark:text-stone-100 text-center leading-relaxed mb-4 border border-stone-100 dark:border-stone-800">
              ﴿ {selectedAyah.text} ﴾
            </div>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <button
                onClick={() => {
                  if (isPlaying && activePlayingAyah?.ayah === selectedAyah.numberInSurah) {
                    onPauseAudio();
                  } else {
                    onPlayAyahAudio(selectedAyah.surahNumber, selectedAyah.numberInSurah);
                  }
                }}
                className="flex flex-col items-center justify-center py-2.5 px-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl hover:bg-emerald-100 transition-colors text-xs font-medium"
              >
                {isPlaying && activePlayingAyah?.ayah === selectedAyah.numberInSurah ? (
                  <Pause className="w-4 h-4 mb-1" />
                ) : (
                  <Play className="w-4 h-4 mb-1" />
                )}
                <span>استماع</span>
              </button>

              <button
                onClick={() => {
                  onToggleBookmark({
                    id: `${selectedAyah.surahNumber}-${selectedAyah.numberInSurah}`,
                    surahNumber: selectedAyah.surahNumber,
                    surahName: currentSurahMeta.name,
                    verseNumber: selectedAyah.numberInSurah,
                    page: selectedAyah.page,
                    timestamp: Date.now()
                  });
                }}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-colors text-xs font-medium ${
                  isAyahBookmarked(selectedAyah.surahNumber, selectedAyah.numberInSurah)
                    ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <BookmarkIcon className="w-4 h-4 mb-1" />
                <span>
                  {isAyahBookmarked(selectedAyah.surahNumber, selectedAyah.numberInSurah) ? 'محفوظة' : 'علامة'}
                </span>
              </button>

              <button
                onClick={() => handleCopyAyah(selectedAyah)}
                className="flex flex-col items-center justify-center py-2.5 px-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-xl transition-colors text-xs font-medium"
              >
                {copiedAyah ? <Check className="w-4 h-4 mb-1 text-emerald-600" /> : <Copy className="w-4 h-4 mb-1" />}
                <span>{copiedAyah ? 'تم النسخ' : 'نسخ'}</span>
              </button>

              <button
                onClick={() => setShowShareCardModal(true)}
                className="flex flex-col items-center justify-center py-2.5 px-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-xl transition-colors text-xs font-medium"
              >
                <Share2 className="w-4 h-4 mb-1" />
                <span>تصميم وبطاقة</span>
              </button>
            </div>

            {/* Sub-Tabs: التفسير، معاني الكلمات، أسباب النزول، ملاحظات شخصية */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-medium mb-3">
              <button
                onClick={() => setDrawerTab('tafseer')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  drawerTab === 'tafseer'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500'
                }`}
              >
                التفسير الميسر
              </button>

              <button
                onClick={() => setDrawerTab('meanings')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  drawerTab === 'meanings'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500'
                }`}
              >
                معاني الكلمات
              </button>

              <button
                onClick={() => setDrawerTab('asbab')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  drawerTab === 'asbab'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500'
                }`}
              >
                أسباب النزول
              </button>

              <button
                onClick={() => setDrawerTab('notes')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  drawerTab === 'notes'
                    ? 'bg-white dark:bg-stone-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-stone-500'
                }`}
              >
                تدبراتي
              </button>
            </div>

            {/* Tab 1: Tafseer */}
            {drawerTab === 'tafseer' && (
              <div className="p-3.5 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-xs text-stone-700 dark:text-stone-300 leading-relaxed border border-stone-100 dark:border-stone-800">
                {selectedAyah.tafseer || 'تفسير الآية الكريمة يوضح المعاني الجليلة والهدى الرباني المستفاد من ألفاظها وأحكامها.'}
              </div>
            )}

            {/* Tab 2: Meanings */}
            {drawerTab === 'meanings' && (
              <div className="p-3.5 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-xs space-y-2 border border-stone-100 dark:border-stone-800">
                <div className="font-semibold text-emerald-800 dark:text-emerald-400">
                  معاني الكلمات وغريب القرآن:
                </div>
                <div className="text-stone-700 dark:text-stone-300 leading-relaxed">
                  تشتمل الآية على مفردات قرآنية فصيحة محكمة تبين مراد الله تعالى بوضوح وجلاء وبلاغة ربانية معجزة.
                </div>
              </div>
            )}

            {/* Tab 3: Asbab Al-Nuzul */}
            {drawerTab === 'asbab' && (
              <div className="p-3.5 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-xs space-y-2 border border-stone-100 dark:border-stone-800">
                <div className="font-semibold text-amber-800 dark:text-amber-400">
                  سبب نزول الآية الكريمة:
                </div>
                <div className="text-stone-700 dark:text-stone-300 leading-relaxed">
                  نزلت هذه السورة المباركة هداية وتثبيتاً للمؤمنين وبياناً لمنهج الاستقامة في حياة المسلم.
                </div>
              </div>
            )}

            {/* Tab 4: Personal Notes */}
            {drawerTab === 'notes' && (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  placeholder="سجل تدبرك أو خاطرتك حول هذه الآية المباركة..."
                  value={currentNoteInput}
                  onChange={(e) => setCurrentNoteInput(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleSaveNote}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  حفظ الخاطرة والتدبر
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Social Ayah Card Generator Modal */}
      {showShareCardModal && selectedAyah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-2xl text-right animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                مشاركة بطاقة الآية الكريمة
              </h3>
              <button
                onClick={() => setShowShareCardModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Style Selector */}
            <div className="flex items-center gap-1.5 justify-center">
              {[
                { id: 'emerald', label: 'زمردي' },
                { id: 'classic', label: 'كلاسيكي' },
                { id: 'pearl', label: 'لؤلؤي' },
                { id: 'kaaba', label: 'كسوة الكعبة' }
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setCardTheme(theme.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    cardTheme === theme.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>

            {/* Preview Card */}
            <div className={`p-6 rounded-3xl text-center space-y-4 shadow-lg border transition-all ${
              cardTheme === 'emerald'
                ? 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white border-emerald-700'
                : cardTheme === 'kaaba'
                ? 'bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 text-amber-100 border-amber-800/40'
                : cardTheme === 'pearl'
                ? 'bg-gradient-to-br from-stone-50 to-stone-200 text-stone-900 border-stone-300'
                : 'bg-parchment text-stone-900 border-amber-800/30'
            }`}>
              <div className="text-[10px] uppercase tracking-widest opacity-80">
                سورة {currentSurahMeta.name}
              </div>

              <div className="font-uthmanic text-xl sm:text-2xl leading-loose py-2">
                ﴿ {selectedAyah.text} ﴾
              </div>

              <div className="text-xs opacity-80 pt-2 border-t border-white/20">
                [الآية {selectedAyah.numberInSurah} - الجزء {selectedAyah.juz}]
              </div>

              <div className="text-[10px] font-sans opacity-70">
                تطبيق اطمئنان القرآن
              </div>
            </div>

            {/* Share / Copy buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  handleCopyAyah(selectedAyah);
                  setShowShareCardModal(false);
                }}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Copy className="w-4 h-4" />
                <span>نسخ نص الآية والمصدر</span>
              </button>

              <button
                onClick={() => setShowShareCardModal(false)}
                className="py-2.5 px-4 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Surah Selector Modal */}
      {showSurahModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 w-full max-w-lg shadow-xl text-right animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                فهرس سور القرآن الكريم
              </h3>
              <button
                onClick={() => setShowSurahModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث باسم السورة أو رقمها..."
                value={searchSurahQuery}
                onChange={(e) => setSearchSurahQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredSurahs.map(s => (
                <button
                  key={s.number}
                  onClick={() => {
                    onSurahChange(s.number);
                    onPageChange(s.startPage);
                    setShowSurahModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors text-right ${
                    s.number === currentSurahNumber
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-600 dark:text-stone-400">
                      {s.number}
                    </span>
                    <div>
                      <div className="text-sm font-bold">سورة {s.name}</div>
                      <div className="text-[11px] text-stone-400">
                        {s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} · {s.numberOfAyahs} آية
                      </div>
                    </div>
                  </div>

                  <div className="text-left text-xs text-stone-400">
                    <div>صفحة {s.startPage}</div>
                    <div className="text-[10px]">الجزء {s.juz}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
