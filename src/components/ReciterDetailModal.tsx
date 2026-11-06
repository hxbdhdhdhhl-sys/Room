import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Download, 
  Share2, 
  Star, 
  Search, 
  Check, 
  X, 
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Volume2
} from 'lucide-react';
import { Reciter, DownloadedItem } from '../types/quran';
import { SURAHS_META } from '../data/quranMeta';
import { getSurahApproxSizeMb } from '../data/reciters';
import { ReciterAvatar } from './ReciterAvatar';

interface ReciterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reciter: Reciter;
  isPlaying: boolean;
  audioState?: 'idle' | 'loading' | 'playing' | 'paused' | 'error';
  audioErrorMsg?: string | null;
  onRetryAudio?: () => void;
  currentPlayingSurah: number;
  onPlaySurah: (surahNumber: number) => void;
  onPause: () => void;
  onResume: () => void;
  isFavorite: boolean;
  onToggleFavorite: (reciterId: string) => void;
  downloadedList: DownloadedItem[];
  onStartDownload: (surahNumber: number, reciter: Reciter) => void;
  onDeleteDownload: (downloadId: string) => void;
}

export const ReciterDetailModal: React.FC<ReciterDetailModalProps> = ({
  isOpen,
  onClose,
  reciter,
  isPlaying,
  audioState = 'idle',
  audioErrorMsg,
  onRetryAudio,
  currentPlayingSurah,
  onPlaySurah,
  onPause,
  onResume,
  isFavorite,
  onToggleFavorite,
  downloadedList,
  onStartDownload,
  onDeleteDownload
}) => {
  const [searchSurah, setSearchSurah] = useState('');
  const [activeTab, setActiveTab] = useState<'surahs' | 'bio'>('surahs');

  // Support Android hardware back button and browser navigation
  useEffect(() => {
    if (!isOpen) return;

    // Push history entry for this modal
    const modalTag = `reciter_${reciter.id}`;
    window.history.pushState({ modalOpen: modalTag }, '');

    const handlePopState = (e: PopStateEvent) => {
      // Hardware back button or browser back triggered
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, reciter.id, onClose]);

  if (!isOpen) return null;

  const handleBackNavigation = () => {
    if (window.history.state?.modalOpen) {
      window.history.back();
    } else {
      onClose();
    }
  };

  const filteredSurahs = SURAHS_META.filter(s => {
    const q = searchSurah.trim().toLowerCase();
    if (!q) return true;
    return s.name.includes(q) || s.englishName.toLowerCase().includes(q) || s.number.toString() === q;
  });

  const handleShareReciter = () => {
    const text = `استمع إلى تلاوات الشيخ ${reciter.name} (${reciter.riwayah}) عبر تطبيق «اطمئنان القرآن».`;
    if (navigator.share) {
      navigator.share({ title: reciter.name, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('تم نسخ رابط مشاركة القارئ!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-3xl shadow-2xl text-right animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={`صفحة الشيخ ${reciter.name}`}
      >
        
        {/* Top Header with Prominent Back & Exit Controls */}
        <div className="bg-stone-900 border-b border-stone-800 px-4 py-2.5 flex items-center justify-between text-white shrink-0">
          {/* Prominent Back Button (العودة إلى مكتبة القراء) */}
          <button
            onClick={handleBackNavigation}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-emerald-600/80 text-stone-100 hover:text-white transition-all text-xs sm:text-sm font-bold group shadow-xs active:scale-95"
            title="الرجوع إلى قائمة جميع القراء"
          >
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            <span>العودة إلى مكتبة القراء</span>
          </button>

          {/* Right Actions: Favorite, Share, and Clear Close Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(reciter.id)}
              className={`p-2 rounded-xl transition-colors ${
                isFavorite ? 'text-amber-400 bg-white/10' : 'text-stone-300 hover:text-amber-400 hover:bg-white/10'
              }`}
              title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShareReciter}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
              title="مشاركة صفحة القارئ"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={handleBackNavigation}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 border border-transparent transition-all text-xs font-semibold"
              title="إغلاق النافذة"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">إغلاق</span>
            </button>
          </div>
        </div>

        {/* Modal Top Hero Profile */}
        <div className="relative bg-gradient-to-l from-emerald-950 via-emerald-900 to-stone-900 text-white p-5 sm:p-6 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Authentic Photo Avatar with Emblem fallback */}
              <ReciterAvatar
                name={reciter.name}
                photoUrl={reciter.photoUrl}
                size="lg"
                badge={true}
              />

              {/* Bio Highlights */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    الشيخ {reciter.name}
                  </h2>
                </div>
                <div className="text-xs text-emerald-300 font-medium">
                  {reciter.riwayah}
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300 pt-0.5">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-emerald-200 font-mono">
                    {reciter.audioQuality}
                  </span>
                  <span>·</span>
                  <span>{reciter.availableSurahsCount} سورة متوفرة</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs inside Modal */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('surahs')}
              className={`px-3.5 py-1.5 rounded-xl transition-colors ${
                activeTab === 'surahs'
                  ? 'bg-white text-emerald-950 font-bold shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              التلاوات والسور المتاحة ({reciter.availableSurahsCount})
            </button>
            <button
              onClick={() => setActiveTab('bio')}
              className={`px-3.5 py-1.5 rounded-xl transition-colors ${
                activeTab === 'bio'
                  ? 'bg-white text-emerald-950 font-bold shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              نبذة وسيرة الشيخ
            </button>
          </div>
        </div>

        {/* Global Error Banner if current reciter has audio error */}
        {audioState === 'error' && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2.5 flex items-center justify-between gap-3 text-red-700 dark:text-red-400 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{audioErrorMsg || 'تعذر بدء تشغيل التلاوة. يرجى التحقق من اتصالك بالإنترنت.'}</span>
            </div>
            {onRetryAudio && (
              <button
                onClick={onRetryAudio}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                <span>إعادة المحاولة</span>
              </button>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Biography Tab */}
          {activeTab === 'bio' && (
            <div className="space-y-4">
              <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-5 border border-stone-100 dark:border-stone-800 text-stone-800 dark:text-stone-200 leading-relaxed text-sm sm:text-base space-y-3">
                <h3 className="font-bold text-lg text-emerald-800 dark:text-emerald-400">
                  نبذة تعريفية عن فضيلة الشيخ {reciter.name}
                </h3>
                <p className="text-justify leading-loose">
                  {reciter.bio}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800">
                  <span className="text-stone-400 block mb-0.5">الرواية المسجلة</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">{reciter.riwayah}</span>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800">
                  <span className="text-stone-400 block mb-0.5">جودة التسجيل الصوتي</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{reciter.audioQuality} High-Bitrate</span>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800 col-span-2 sm:col-span-1">
                  <span className="text-stone-400 block mb-0.5">حالة المصحف</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">مصحف مرتل كامل ومدقق</span>
                </div>
              </div>
            </div>
          )}

          {/* Surahs Playlist Tab */}
          {activeTab === 'surahs' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ابحث عن سورة لتشغيلها بصوت الشيخ..."
                  value={searchSurah}
                  onChange={(e) => setSearchSurah(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Surahs Table */}
              <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-[460px] overflow-y-auto pr-1">
                {filteredSurahs.map(surah => {
                  const isCurrentTarget = currentPlayingSurah === surah.number;
                  const isThisPlaying = isPlaying && isCurrentTarget;
                  const isThisLoading = audioState === 'loading' && isCurrentTarget;
                  const isThisError = audioState === 'error' && isCurrentTarget;

                  const downloadId = `${reciter.id}_${surah.number}`;
                  const downloadItem = downloadedList.find(d => d.id === downloadId);
                  const isDownloaded = downloadItem?.status === 'completed';
                  const isDownloading = downloadItem?.status === 'downloading';
                  const approxMb = getSurahApproxSizeMb(surah.numberOfAyahs);

                  return (
                    <div
                      key={surah.number}
                      className={`py-3 px-3 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 rounded-2xl transition-colors cursor-pointer group ${
                        isThisPlaying ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/20' : ''
                      }`}
                      onClick={() => {
                        if (isThisLoading) return;
                        if (isThisPlaying) {
                          onPause();
                        } else if (isCurrentTarget && audioState === 'paused') {
                          onResume();
                        } else {
                          onPlaySurah(surah.number);
                        }
                      }}
                    >
                      {/* Left Details */}
                      <div className="flex items-center gap-3">
                        <button
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            isThisPlaying
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isThisLoading
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : isThisError
                              ? 'bg-red-100 dark:bg-red-950/60 text-red-600'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-emerald-50 group-hover:text-emerald-700'
                          }`}
                        >
                          {isThisLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          ) : isThisPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : isThisError ? (
                            <RefreshCw className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 fill-current mr-0.5" />
                          )}
                        </button>

                        <div>
                          <div className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <span>سورة {surah.name}</span>
                            <span className="text-[10px] text-stone-400 font-normal">
                              ({surah.englishName})
                            </span>
                            {isThisLoading && (
                              <span className="text-[10px] text-emerald-600 font-semibold animate-pulse">
                                جاري التحميل...
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                            <span>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                            <span>·</span>
                            <span>{surah.numberOfAyahs} آية</span>
                            <span>·</span>
                            <span>الجزء {surah.juz}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Download, File Size */}
                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[11px] text-stone-400 font-mono hidden sm:inline">
                          {approxMb} MB
                        </span>

                        {/* Download button */}
                        {isDownloaded ? (
                          <button
                            onClick={() => onDeleteDownload(downloadId)}
                            className="p-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl hover:text-red-500 hover:bg-red-50 transition-colors text-xs flex items-center gap-1 font-medium"
                            title="محفوظة في جهازك، اضغط للحذف"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span className="text-[11px]">محملة</span>
                          </button>
                        ) : isDownloading ? (
                          <div className="flex items-center gap-1 text-xs text-emerald-700">
                            <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[10px] font-mono">{downloadItem?.progress || 45}%</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => onStartDownload(surah.number, reciter)}
                            className="p-2 text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
                            title={`تحميل سورة ${surah.name} (${approxMb} MB) للاستماع دون إنترنت`}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
