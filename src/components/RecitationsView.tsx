import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  SkipForward, 
  SkipBack, 
  Repeat, 
  Search, 
  User, 
  Check, 
  Clock, 
  Sparkles,
  Download,
  Share2,
  Star,
  Trash2,
  Plus,
  Sliders,
  ListPlus,
  VolumeX,
  ArrowUpDown,
  BookOpen,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Reciter, SurahMeta, DownloadedItem, CustomPlaylist } from '../types/quran';
import { RECITERS, getSurahAudioUrl, getSurahApproxSizeMb } from '../data/reciters';
import { SURAHS_META } from '../data/quranMeta';
import { ReciterDetailModal } from './ReciterDetailModal';
import { ReciterAvatar } from './ReciterAvatar';

interface RecitationsViewProps {
  currentReciter: Reciter;
  onSelectReciter: (reciter: Reciter) => void;
  currentSurahNumber: number;
  isPlaying: boolean;
  audioState?: 'idle' | 'loading' | 'playing' | 'paused' | 'error';
  audioErrorMsg?: string | null;
  onRetryAudio?: () => void;
  onPlaySurah: (surahNumber: number) => void;
  onPause: () => void;
  onResume: () => void;
  audioProgress: number; // 0 to 100
  audioDuration: number; // seconds
  currentTime: number; // seconds
  onSeek: (percent: number) => void;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
  downloadedList: DownloadedItem[];
  onStartDownload: (surahNumber: number, reciter: Reciter) => void;
  onDeleteDownload: (downloadId: string) => void;
  onNavigateToQuranPage?: (page: number) => void;
}

export const RecitationsView: React.FC<RecitationsViewProps> = ({
  currentReciter,
  onSelectReciter,
  currentSurahNumber,
  isPlaying,
  audioState = 'idle',
  audioErrorMsg,
  onRetryAudio,
  onPlaySurah,
  onPause,
  onResume,
  audioProgress,
  audioDuration,
  currentTime,
  onSeek,
  playbackRate,
  onChangePlaybackRate,
  downloadedList,
  onStartDownload,
  onDeleteDownload,
  onNavigateToQuranPage
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'reciters' | 'downloads' | 'playlists'>('reciters');
  const [searchQuery, setSearchQuery] = useState('');
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'popular' | 'alpha'>('popular');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [selectedReciterModal, setSelectedReciterModal] = useState<Reciter | null>(null);

  // Favorites reciters
  const [favoriteReciterIds, setFavoriteReciterIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('itm_fav_reciters');
    return saved ? JSON.parse(saved) : ['mossad', 'alafasy', 'maher', 'minshawi'];
  });

  // Volume state
  const [volume, setVolume] = useState<number>(100);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Sleep Timer state
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [showSleepModal, setShowSleepModal] = useState(false);

  // Playlists
  const [playlists, setPlaylists] = useState<CustomPlaylist[]>(() => {
    const saved = localStorage.getItem('itm_playlists');
    return saved ? JSON.parse(saved) : [
      {
        id: 'pl_1',
        name: 'تلاوات الفجر والسكينة',
        description: 'سور وآيات هادئة تبدأ بها يومك باطمئنان',
        createdAt: Date.now(),
        tracks: [
          { surahNumber: 1, reciterId: 'mossad' },
          { surahNumber: 36, reciterId: 'alafasy' },
          { surahNumber: 55, reciterId: 'maher' }
        ]
      }
    ];
  });
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);

  const currentSurah = SURAHS_META.find(s => s.number === currentSurahNumber) || SURAHS_META[0];

  const formatDuration = (sec: number) => {
    if (isNaN(sec) || sec === 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFavoriteReciter = (reciterId: string) => {
    setFavoriteReciterIds(prev => {
      const updated = prev.includes(reciterId)
        ? prev.filter(id => id !== reciterId)
        : [...prev, reciterId];
      localStorage.setItem('itm_fav_reciters', JSON.stringify(updated));
      return updated;
    });
  };

  // Filter & Sort Reciters
  const displayedReciters = [...RECITERS]
    .filter(r => {
      if (filterFavorites && !favoriteReciterIds.includes(r.id)) return false;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        r.name.includes(q) ||
        r.subname.includes(q) ||
        r.riwayah.includes(q)
      );
    })
    .sort((a, b) => {
      if (sortOrder === 'alpha') {
        return a.name.localeCompare(b.name, 'ar');
      }
      return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
    });

  // Handle sleep timer countdown
  const setTimer = (mins: number | null) => {
    setSleepTimerMinutes(mins);
    setShowSleepModal(false);
    if (mins !== null) {
      setTimeout(() => {
        onPause();
        setSleepTimerMinutes(null);
      }, mins * 60 * 1000);
    }
  };

  // Create Playlist
  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const pl: CustomPlaylist = {
      id: `pl_${Date.now()}`,
      name: newPlaylistName.trim(),
      createdAt: Date.now(),
      tracks: [{ surahNumber: currentSurahNumber, reciterId: currentReciter.id }]
    };
    const updated = [pl, ...playlists];
    setPlaylists(updated);
    localStorage.setItem('itm_playlists', JSON.stringify(updated));
    setNewPlaylistName('');
    setShowCreatePlaylistModal(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6 pb-28">
      
      {/* Featured Master Audio Player Showcase Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        {audioState === 'error' && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex items-center justify-between gap-3 text-red-700 dark:text-red-400 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{audioErrorMsg || 'تعذر بدء تشغيل التلاوة. يرجى التحقق من اتصالك بالإنترنت.'}</span>
            </div>
            {onRetryAudio && (
              <button
                onClick={onRetryAudio}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs transition-colors shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة</span>
              </button>
            )}
          </div>
        )}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Reciter Avatar & Current Track Info */}
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div 
              onClick={() => setSelectedReciterModal(currentReciter)}
              className="cursor-pointer group"
              title="اضغط لعرض الملف الكامل وسيرة الشيخ"
            >
              <ReciterAvatar
                name={currentReciter.name}
                photoUrl={currentReciter.photoUrl}
                size="lg"
                badge={true}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedReciterModal(currentReciter)}
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                >
                  <User className="w-3 h-3 text-emerald-600" />
                  <span>الشيخ {currentReciter.name}</span>
                </button>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 font-mono">
                  {currentReciter.audioQuality}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                سورة {currentSurah.name}
              </h2>

              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                <span>{currentSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                <span>·</span>
                <span>{currentSurah.numberOfAyahs} آية</span>
                <span>·</span>
                <span>الجزء {currentSurah.juz}</span>
                {onNavigateToQuranPage && (
                  <button
                    onClick={() => onNavigateToQuranPage(currentSurah.startPage)}
                    className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 mr-2"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>مزامنة المصحف</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Controls Console */}
          <div className="w-full lg:w-96 flex flex-col items-center gap-3">
            {/* Scrubber Bar */}
            <div className="w-full space-y-1">
              <div 
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
                  onSeek(pct);
                }}
                className="w-full h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden cursor-pointer relative"
              >
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-100"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono tabular-nums">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(audioDuration)}</span>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex items-center gap-4">
              {/* Playback Speed */}
              <button
                onClick={() => {
                  const rates = [0.75, 1, 1.25, 1.5, 2];
                  const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
                  onChangePlaybackRate(rates[nextIdx]);
                }}
                className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition-colors"
                title="سرعة التلاوة"
              >
                {playbackRate}x
              </button>

              {/* Prev Surah */}
              <button
                onClick={() => {
                  if (currentSurahNumber > 1) onPlaySurah(currentSurahNumber - 1);
                }}
                className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 transition-colors"
                title="السورة السابقة"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Play / Pause Main */}
              <button
                onClick={() => {
                  if (audioState === 'loading') return;
                  if (audioState === 'error' && onRetryAudio) {
                    onRetryAudio();
                  } else if (isPlaying) {
                    onPause();
                  } else {
                    onResume();
                  }
                }}
                className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all text-white ${
                  audioState === 'error'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
                title={
                  audioState === 'loading'
                    ? 'جاري تجهيز الصوت...'
                    : audioState === 'error'
                    ? 'إعادة المحاولة'
                    : isPlaying
                    ? 'إيقاف مؤقت'
                    : 'تشغيل'
                }
              >
                {audioState === 'loading' ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : audioState === 'error' ? (
                  <RefreshCw className="w-6 h-6 text-white" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current mr-0.5" />
                )}
              </button>

              {/* Next Surah */}
              <button
                onClick={() => {
                  if (currentSurahNumber < 114) onPlaySurah(currentSurahNumber + 1);
                }}
                className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 transition-colors"
                title="السورة التالية"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Sleep Timer Trigger */}
              <button
                onClick={() => setShowSleepModal(true)}
                className={`p-2 rounded-xl transition-colors ${
                  sleepTimerMinutes !== null ? 'text-emerald-700 font-bold bg-emerald-50 dark:bg-emerald-950/50' : 'text-stone-400 hover:text-stone-700'
                }`}
                title={sleepTimerMinutes ? `المؤقت مفعّل: ${sleepTimerMinutes} دقيقة` : 'ضبط مؤقت النوم'}
              >
                <Clock className="w-4 h-4" />
              </button>

              {/* Repeat Mode */}
              <button
                onClick={() => {
                  setRepeatMode(prev => prev === 'off' ? 'one' : prev === 'one' ? 'all' : 'off');
                }}
                className={`p-2 rounded-xl transition-colors ${
                  repeatMode !== 'off' ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : 'text-stone-400'
                }`}
                title={`التكرار: ${repeatMode === 'off' ? 'معطل' : repeatMode === 'one' ? 'سورة واحدة' : 'تشغيل متتابع'}`}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (قراء القرآن، التلاوات المحملة، قوائم التشغيل) */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-3 shadow-xs">
        <div className="grid grid-cols-3 gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveMainTab('reciters')}
            className={`py-2.5 rounded-xl transition-all ${
              activeMainTab === 'reciters'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
            }`}
          >
            مكتبة القراء الموحدة ({RECITERS.length})
          </button>

          <button
            onClick={() => setActiveMainTab('downloads')}
            className={`py-2.5 rounded-xl transition-all ${
              activeMainTab === 'downloads'
                ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
            }`}
          >
            التلاوات المحملة ({downloadedList.length})
          </button>

          <button
            onClick={() => setActiveMainTab('playlists')}
            className={`py-2.5 rounded-xl transition-all ${
              activeMainTab === 'playlists'
                ? 'bg-white dark:bg-stone-700 text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
            }`}
          >
            قوائم التشغيل ({playlists.length})
          </button>
        </div>
      </div>

      {/* Tab 1: All Reciters Catalog */}
      {activeMainTab === 'reciters' && (
        <div className="space-y-4">
          {/* Search, Sort & Favorites Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث عن قارئ بالاسم (مثال: عبد الرحمن بن مسعد، العفاسي، السديس، المنشاوي)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Favorites toggle */}
              <button
                onClick={() => setFilterFavorites(prev => !prev)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                  filterFavorites
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-current' : ''}`} />
                <span>المفضلة ({favoriteReciterIds.length})</span>
              </button>

              {/* Sort Order */}
              <button
                onClick={() => setSortOrder(prev => prev === 'popular' ? 'alpha' : 'popular')}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>{sortOrder === 'popular' ? 'الأكثر استماعاً' : 'ترتيب أبجدي'}</span>
              </button>
            </div>
          </div>

          {/* Unified Reciters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {displayedReciters.map(reciter => {
              const isSelected = reciter.id === currentReciter.id;
              const isFav = favoriteReciterIds.includes(reciter.id);

              return (
                <div
                  key={reciter.id}
                  onClick={() => setSelectedReciterModal(reciter)}
                  className={`bg-white dark:bg-stone-900 border rounded-3xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-right group ${
                    isSelected
                      ? 'border-emerald-500 dark:border-emerald-500 ring-1 ring-emerald-500/30'
                      : 'border-stone-200 dark:border-stone-800 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Authentic Photo Avatar */}
                    <ReciterAvatar
                      name={reciter.name}
                      photoUrl={reciter.photoUrl}
                      size="md"
                      badge={false}
                    />

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                          {reciter.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        {reciter.riwayah}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        {reciter.availableSurahsCount} سورة · {reciter.audioQuality}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {/* Favorite star */}
                    <button
                      onClick={() => toggleFavoriteReciter(reciter.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        isFav ? 'text-amber-500' : 'text-stone-300 dark:text-stone-600 hover:text-amber-500'
                      }`}
                      title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    {/* Quick Select Reciter */}
                    <button
                      onClick={() => {
                        onSelectReciter(reciter);
                        onPlaySurah(currentSurahNumber);
                      }}
                      className={`p-2 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 hover:text-emerald-600'
                      }`}
                      title="تشغيل بصوت هذا القارئ"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Downloaded Tracks Manager */}
      {activeMainTab === 'downloads' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                التلاوات المحملة للاستماع دون اتصال
              </h3>
              <p className="text-xs text-stone-400">
                يمكنك الاستماع لجميع هذه السور حتى في حال انقطاع شبكة الإنترنت
              </p>
            </div>

            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              {downloadedList.length} سورة جاهزة
            </span>
          </div>

          {downloadedList.length === 0 ? (
            <div className="text-center py-16 text-stone-400 space-y-2">
              <Download className="w-10 h-10 mx-auto text-stone-300" />
              <div className="text-sm font-semibold">لا توجد سور محملة حالياً</div>
              <div className="text-xs">
                اضغط على زر التحميل بجانب أي سورة من قائمة تلاوات المشايخ لحفظها في جهازك.
              </div>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {downloadedList.map(item => (
                <div
                  key={item.id}
                  className="py-3 px-2 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/40 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onPlaySurah(item.surahNumber)}
                      className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs"
                    >
                      <Play className="w-4 h-4 fill-current mr-0.5" />
                    </button>

                    <div>
                      <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        سورة {item.surahName}
                      </div>
                      <div className="text-xs text-stone-400">
                        بصوت الشيخ {item.reciterName} · <span className="font-mono">{item.sizeMb} MB</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeleteDownload(item.id)}
                      className="p-2 text-stone-400 hover:text-red-500 rounded-xl transition-colors"
                      title="حذف من الجهاز لتوفير المساحة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Custom Playlists */}
      {activeMainTab === 'playlists' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                قوائم التشغيل الخاصة
              </h3>
              <p className="text-xs text-stone-400">
                خصص تلاواتك المفضلة وسور الصباح والمساء في قوائم مستقلة
              </p>
            </div>

            <button
              onClick={() => setShowCreatePlaylistModal(true)}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إنشاء قائمة جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {playlists.map(pl => (
              <div
                key={pl.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-2 text-right"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {pl.name}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    {pl.tracks.length} تلاوة
                  </span>
                </div>

                {pl.description && (
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {pl.description}
                  </p>
                )}

                <div className="pt-2 border-t border-stone-200 dark:border-stone-700/60 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (pl.tracks.length > 0) {
                        onPlaySurah(pl.tracks[0].surahNumber);
                      }
                    }}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>تشغيل القائمة</span>
                  </button>

                  <span className="text-[10px] text-stone-400">
                    {new Date(pl.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reciter Detail Profile Modal */}
      {selectedReciterModal && (
        <ReciterDetailModal
          isOpen={true}
          onClose={() => setSelectedReciterModal(null)}
          reciter={selectedReciterModal}
          isPlaying={isPlaying}
          audioState={audioState}
          audioErrorMsg={audioErrorMsg}
          onRetryAudio={onRetryAudio}
          currentPlayingSurah={currentSurahNumber}
          onPlaySurah={(surahNum) => {
            onSelectReciter(selectedReciterModal);
            onPlaySurah(surahNum);
          }}
          onPause={onPause}
          onResume={onResume}
          isFavorite={favoriteReciterIds.includes(selectedReciterModal.id)}
          onToggleFavorite={toggleFavoriteReciter}
          downloadedList={downloadedList}
          onStartDownload={onStartDownload}
          onDeleteDownload={onDeleteDownload}
        />
      )}

      {/* Sleep Timer Modal */}
      {showSleepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-sm shadow-xl text-right animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              مؤقت إيقاف التلاوة (Sleep Timer)
            </h3>
            <p className="text-xs text-stone-400">
              اختر المدة التي يتوقف بعدها المشغل تلقائياً أثناء نومك
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[15, 30, 45, 60].map(mins => (
                <button
                  key={mins}
                  onClick={() => setTimer(mins)}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs transition-colors ${
                    sleepTimerMinutes === mins
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-emerald-500'
                  }`}
                >
                  {mins} دقيقة
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
              {sleepTimerMinutes !== null && (
                <button
                  onClick={() => setTimer(null)}
                  className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold"
                >
                  إلغاء المؤقت
                </button>
              )}
              <button
                onClick={() => setShowSleepModal(false)}
                className="flex-1 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form onSubmit={handleCreatePlaylist} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-sm shadow-xl text-right animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              إنشاء قائمة تشغيل جديدة
            </h3>

            <input
              type="text"
              placeholder="اسم القائمة (مثل: تلاوات النوم، سورة البقرة)..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl text-xs shadow-xs"
              >
                إنشاء القائمة
              </button>
              <button
                type="button"
                onClick={() => setShowCreatePlaylistModal(false)}
                className="py-2 px-4 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
