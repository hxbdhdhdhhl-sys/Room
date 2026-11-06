import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Moon, 
  Sun, 
  Bookmark as BookmarkIcon, 
  Volume2, 
  Award,
  Sparkles,
  Search,
  Globe2,
  Crown,
  Languages,
  Clock,
  Compass
} from 'lucide-react';
import { NavTab, BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { QuranReader } from './components/QuranReader';
import { SurahList } from './components/SurahList';
import { KhatmahTracker } from './components/KhatmahTracker';
import { RecitationsView } from './components/RecitationsView';
import { ProfileView } from './components/ProfileView';
import { AudioBar } from './components/AudioBar';
import { IslamicToolsView } from './components/IslamicToolsView';
import { WorldClockView } from './components/WorldClockView';
import { HadithView } from './components/HadithView';
import { GlobalPrayerTimesView } from './components/GlobalPrayerTimesView';
import { VipModal } from './components/VipModal';
import { KhatmahRecord, Bookmark, Reciter, DownloadedItem, VipState } from './types/quran';
import { SURAHS_META } from './data/quranMeta';
import { RECITERS, getSurahAudioUrl, getSurahAudioCandidates, getAyahAudioUrl, getSurahApproxSizeMb } from './data/reciters';

// Default initial Khatmah data (inspiring state showing progress)
const INITIAL_KHATMAH: KhatmahRecord = {
  id: 'khatmah_1',
  title: 'ختمة التدبر والاطمئنان',
  targetDays: 30,
  startDate: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
  targetEndDate: new Date(Date.now() + 18 * 24 * 3600 * 1000).toISOString(),
  completedPages: 246, // ~ 12.2 Juz
  totalPages: 604,
  dailyGoalPages: 20,
  completedJuz: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  history: [
    { date: 'السبت', pagesRead: 20, cumulativePages: 166 },
    { date: 'الأحد', pagesRead: 22, cumulativePages: 188 },
    { date: 'الإثنين', pagesRead: 18, cumulativePages: 206 },
    { date: 'الثلاثاء', pagesRead: 20, cumulativePages: 226 },
    { date: 'الأربعاء', pagesRead: 20, cumulativePages: 246 }
  ]
};

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [quranSubView, setQuranSubView] = useState<'reader' | 'index'>('index');

  // Language & Direction
  const [language, setLanguage] = useState<'ar' | 'en'>(() => {
    return (localStorage.getItem('itm_lang') as 'ar' | 'en') || 'ar';
  });

  // Reading state
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const saved = localStorage.getItem('itm_current_page');
    return saved ? Number(saved) : 1;
  });

  const [currentSurahNumber, setCurrentSurahNumber] = useState<number>(() => {
    const saved = localStorage.getItem('itm_current_surah');
    return saved ? Number(saved) : 1;
  });

  // Khatmah state
  const [khatmah, setKhatmah] = useState<KhatmahRecord>(() => {
    const saved = localStorage.getItem('itm_khatmah');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Ignore parse error
      }
    }
    return INITIAL_KHATMAH;
  });

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('itm_bookmarks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Ignore
      }
    }
    return [
      { id: '1-1', surahNumber: 1, surahName: 'الفاتحة', verseNumber: 1, page: 1, timestamp: Date.now() - 3600000 },
      { id: '2-255', surahNumber: 2, surahName: 'البقرة', verseNumber: 255, page: 42, timestamp: Date.now() - 7200000 }
    ];
  });

  // Downloads state
  const [downloadedList, setDownloadedList] = useState<DownloadedItem[]>(() => {
    const saved = localStorage.getItem('itm_downloads');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'mossad_1',
        reciterId: 'mossad',
        reciterName: 'عبد الرحمن بن مسعد',
        surahNumber: 1,
        surahName: 'الفاتحة',
        audioUrl: getSurahAudioUrl('https://server16.mp3quran.net/mossad/', 1),
        sizeMb: 1.4,
        downloadedAt: Date.now(),
        status: 'completed',
        progress: 100
      },
      {
        id: 'mossad_112',
        reciterId: 'mossad',
        reciterName: 'عبد الرحمن بن مسعد',
        surahNumber: 112,
        surahName: 'الإخلاص',
        audioUrl: getSurahAudioUrl('https://server16.mp3quran.net/mossad/', 112),
        sizeMb: 1.2,
        downloadedAt: Date.now(),
        status: 'completed',
        progress: 100
      }
    ];
  });

  // VIP State
  const [vipState, setVipState] = useState<VipState>(() => {
    const saved = localStorage.getItem('itm_vip');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      isVip: false,
      trialExpiresAt: null,
      activeTheme: 'default'
    };
  });
  const [showVipModal, setShowVipModal] = useState<boolean>(false);

  // Theme
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('itm_theme');
    if (saved) return saved === 'dark';
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Audio Playback
  const [currentReciter, setCurrentReciter] = useState<Reciter>(() => {
    const saved = localStorage.getItem('itm_last_reciter');
    if (saved) {
      const found = RECITERS.find(r => r.id === saved);
      if (found) return found;
    }
    return RECITERS[0]; // Sheikh Abdulrahman Bin Mosaad by default
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle');
  const [audioErrorMsg, setAudioErrorMsg] = useState<string | null>(null);
  const [playingSurah, setPlayingSurah] = useState<number>(1);
  const [activePlayingAyah, setActivePlayingAyah] = useState<{ surah: number; ayah: number } | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [audioVisible, setAudioVisible] = useState<boolean>(false);

  // Favorite Reciters state shared with player
  const [favoriteReciterIds, setFavoriteReciterIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('itm_fav_reciters');
    return saved ? JSON.parse(saved) : ['mossad', 'alafasy', 'maher', 'minshawi'];
  });

  const handleToggleFavoriteReciter = (reciterId: string) => {
    setFavoriteReciterIds(prev => {
      const updated = prev.includes(reciterId)
        ? prev.filter(id => id !== reciterId)
        : [...prev, reciterId];
      localStorage.setItem('itm_fav_reciters', JSON.stringify(updated));
      return updated;
    });
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentCandidatesRef = useRef<string[]>([]);
  const currentCandidateIdxRef = useRef<number>(0);

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('itm_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('itm_theme', 'light');
    }
  }, [isDarkMode]);

  // Sync Language & RTL/LTR
  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('itm_lang', language);
  }, [language]);

  // Persist VIP
  const handleUpdateVipState = (updated: VipState) => {
    setVipState(updated);
    localStorage.setItem('itm_vip', JSON.stringify(updated));
  };

  // Persist Khatmah
  const handleUpdateKhatmah = (updated: KhatmahRecord) => {
    setKhatmah(updated);
    localStorage.setItem('itm_khatmah', JSON.stringify(updated));
  };

  // Persist Page & Surah
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    localStorage.setItem('itm_current_page', page.toString());
  };

  const handleSurahChange = (surahNum: number) => {
    setCurrentSurahNumber(surahNum);
    localStorage.setItem('itm_current_surah', surahNum.toString());
  };

  // Toggle Bookmark
  const handleToggleBookmark = (bm: Bookmark) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.surahNumber === bm.surahNumber && b.verseNumber === bm.verseNumber);
      let updated: Bookmark[];
      if (exists) {
        updated = prev.filter(b => !(b.surahNumber === bm.surahNumber && b.verseNumber === bm.verseNumber));
      } else {
        updated = [bm, ...prev];
      }
      localStorage.setItem('itm_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveBookmark = (id: string) => {
    setBookmarks(prev => {
      const updated = prev.filter(b => b.id !== id);
      localStorage.setItem('itm_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  // Select Reciter with persistence
  const handleSelectReciter = (reciter: Reciter) => {
    setCurrentReciter(reciter);
    localStorage.setItem('itm_last_reciter', reciter.id);
  };

  // Multi-Candidate Audio Fallback Engine
  const tryPlayCandidate = (index: number) => {
    const candidates = currentCandidatesRef.current;
    if (!candidates || index >= candidates.length) {
      setIsPlaying(false);
      setAudioState('error');
      setAudioErrorMsg('تعذر تشغيل التسجيل الصوتي. يرجى التحقق من اتصالك بالإنترنت أو الضغط على إعادة المحاولة.');
      return;
    }

    currentCandidateIdxRef.current = index;
    const targetUrl = candidates[index];
    if (audioRef.current) {
      setAudioState('loading');
      setAudioErrorMsg(null);
      audioRef.current.src = targetUrl;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.load();
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAudioState('playing');
            setAudioErrorMsg(null);
          })
          .catch((err) => {
            if (err?.name === 'AbortError') return;
            console.warn('Playback error on candidate:', index, err);
            tryPlayCandidate(index + 1);
          });
      }
    }
  };

  // Audio Handlers
  const handlePlaySurahAudio = (surahNumber: number, reciterOverride?: Reciter) => {
    const reciterToUse = reciterOverride || currentReciter;
    setPlayingSurah(surahNumber);
    setActivePlayingAyah(null);
    setAudioVisible(true);
    setAudioErrorMsg(null);

    const candidates = getSurahAudioCandidates(reciterToUse, surahNumber);
    currentCandidatesRef.current = candidates;
    currentCandidateIdxRef.current = 0;
    tryPlayCandidate(0);

    // MediaSession lock-screen / Bluetooth controls
    if ('mediaSession' in navigator) {
      const meta = SURAHS_META.find(s => s.number === surahNumber);
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `سورة ${meta?.name || ''}`,
        artist: `الشيخ ${reciterToUse.name}`,
        album: 'اطمئنان القرآن الكريم',
        artwork: [
          { src: reciterToUse.photoUrl, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => handleResumeAudio());
      navigator.mediaSession.setActionHandler('pause', () => handlePauseAudio());
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (surahNumber > 1) handlePlaySurahAudio(surahNumber - 1);
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (surahNumber < 114) handlePlaySurahAudio(surahNumber + 1);
      });
    }
  };

  const handlePlayAyahAudio = (surahNumber: number, ayahNumber: number) => {
    setPlayingSurah(surahNumber);
    setActivePlayingAyah({ surah: surahNumber, ayah: ayahNumber });
    setAudioVisible(true);
    setAudioErrorMsg(null);
    setAudioState('loading');

    const url = getAyahAudioUrl(currentReciter.everyAyahFolder, surahNumber, ayahNumber);
    currentCandidatesRef.current = [url];
    currentCandidateIdxRef.current = 0;

    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.load();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setAudioState('playing');
        setAudioErrorMsg(null);
      }).catch(err => {
        if (err?.name === 'AbortError') return;
        console.warn('Ayah playback error', err);
        setAudioState('error');
        setAudioErrorMsg('تعذر تشغيل الآية. يرجى إعادة المحاولة.');
      });
    }
  };

  const handlePauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (audioState !== 'error') {
        setAudioState('paused');
      }
    }
  };

  const handleResumeAudio = () => {
    if (audioState === 'error' || !audioRef.current?.src) {
      handlePlaySurahAudio(playingSurah);
      return;
    }
    if (audioRef.current) {
      setAudioState('loading');
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setAudioState('playing');
      }).catch(() => {
        tryPlayCandidate(currentCandidateIdxRef.current + 1);
      });
    }
  };

  const handleSeek = (percent: number) => {
    if (audioRef.current && audioDuration > 0) {
      const newTime = (percent / 100) * audioDuration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setAudioProgress(percent);
    }
  };

  const handleChangePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Downloads handling
  const handleStartDownload = (surahNumber: number, reciter: Reciter) => {
    const surah = SURAHS_META.find(s => s.number === surahNumber);
    const downloadId = `${reciter.id}_${surahNumber}`;
    const size = getSurahApproxSizeMb(surah?.numberOfAyahs || 10);

    const newItem: DownloadedItem = {
      id: downloadId,
      reciterId: reciter.id,
      reciterName: reciter.name,
      surahNumber,
      surahName: surah?.name || `سورة ${surahNumber}`,
      audioUrl: getSurahAudioUrl(reciter.serverUrl, surahNumber),
      sizeMb: size,
      downloadedAt: Date.now(),
      status: 'downloading',
      progress: 25
    };

    setDownloadedList(prev => [newItem, ...prev.filter(d => d.id !== downloadId)]);

    // Simulate steady network download progress
    setTimeout(() => {
      setDownloadedList(prev => prev.map(d => d.id === downloadId ? { ...d, progress: 65 } : d));
    }, 400);

    setTimeout(() => {
      setDownloadedList(prev => {
        const updated = prev.map(d => d.id === downloadId ? { ...d, progress: 100, status: 'completed' as const } : d);
        localStorage.setItem('itm_downloads', JSON.stringify(updated));
        return updated;
      });
    }, 900);
  };

  const handleDeleteDownload = (downloadId: string) => {
    setDownloadedList(prev => {
      const updated = prev.filter(d => d.id !== downloadId);
      localStorage.setItem('itm_downloads', JSON.stringify(updated));
      return updated;
    });
  };

  // Jump from anywhere to Quran Page
  const handleJumpToQuranPage = (page: number) => {
    handlePageChange(page);
    const surahForPage = SURAHS_META.find(s => page >= s.startPage && page <= s.endPage);
    if (surahForPage) {
      handleSurahChange(surahForPage.number);
    }
    setQuranSubView('reader');
    setActiveTab('quran');
  };

  // Continuous playback when audio finishes
  const handleAudioTrackEnded = () => {
    setIsPlaying(false);
    setActivePlayingAyah(null);

    // If surah ended, advance to next surah automatically
    if (playingSurah < 114) {
      handlePlaySurahAudio(playingSurah + 1);
    }
  };

  return (
    <div className={`min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200 ${
      vipState.isVip && vipState.activeTheme === 'kaaba_silk' ? 'theme-kaaba' : ''
    }`}>
      
      {/* Central Unified Audio Element (Uninterrupted across tab switches) */}
      <audio
        ref={audioRef}
        onLoadStart={() => setAudioState('loading')}
        onWaiting={() => setAudioState('loading')}
        onCanPlay={() => {
          if (audioState === 'loading') {
            setAudioState(isPlaying ? 'playing' : 'paused');
          }
        }}
        onPlaying={() => {
          setIsPlaying(true);
          setAudioState('playing');
          setAudioErrorMsg(null);
        }}
        onPause={() => {
          setIsPlaying(false);
          if (audioState !== 'error') {
            setAudioState('paused');
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const dur = audioRef.current.duration || 0;
            setCurrentTime(current);
            setAudioDuration(dur);
            if (dur > 0) {
              setAudioProgress((current / dur) * 100);
            }
          }
        }}
        onEnded={handleAudioTrackEnded}
        onError={() => {
          console.warn('Audio tag onError fired, advancing candidate from idx:', currentCandidateIdxRef.current);
          tryPlayCandidate(currentCandidateIdxRef.current + 1);
        }}
      />

      {/* Top Bar Contract (3 zones separated by gap-8: Brand wordmark, Nav Links, 1 Primary Action) */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-16">
          
          {/* Zone 1: Single text element Brand Wordmark */}
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 text-right focus:outline-hidden"
          >
            <span className="font-bold text-lg sm:text-xl tracking-tight text-emerald-800 dark:text-emerald-400 whitespace-nowrap shrink-0">
              اطمئنان القرآن
            </span>
            {vipState.isVip && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold shrink-0">
                VIP
              </span>
            )}
          </button>

          {/* Zone 2: Clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-5 text-xs lg:text-sm font-medium text-stone-600 dark:text-stone-300">
            <button
              onClick={() => {
                setActiveTab('quran');
                setQuranSubView('reader');
              }}
              className={`hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'quran' ? 'text-emerald-800 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              المصحف
            </button>

            <button
              onClick={() => setActiveTab('wird')}
              className={`hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'wird' ? 'text-emerald-800 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              الورد والختمة
            </button>

            <button
              onClick={() => setActiveTab('recitations')}
              className={`hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'recitations' ? 'text-emerald-800 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              مكتبة القراء
            </button>

            <button
              onClick={() => setActiveTab('world_clock')}
              className={`hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'world_clock' ? 'text-emerald-800 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              التوقيت العالمي
            </button>

            <button
              onClick={() => setActiveTab('hadiths')}
              className={`hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'hadiths' ? 'text-emerald-800 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              الأحاديث النبوية
            </button>

            <button
              onClick={() => setActiveTab('prayers')}
              className={`hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'prayers' ? 'text-emerald-800 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              مواقيت الصلاة
            </button>
          </nav>

          {/* Zone 3: 1 Primary CTA / Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* VIP Trial trigger */}
            <button
              onClick={() => setShowVipModal(true)}
              className="p-2 rounded-xl text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
              title="عضوية وتجربة VIP (رمز LOP)"
            >
              <Crown className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(prev => prev === 'ar' ? 'en' : 'ar')}
              className="px-2 py-1 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
              title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setIsDarkMode(prev => !prev)}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title={isDarkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>

            {/* Quick Continue Read Button */}
            <button
              onClick={() => handleJumpToQuranPage(currentPage)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>متابعة القراءة</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Rendered by Tab */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            lastReadPage={currentPage}
            lastReadSurah={currentSurahNumber}
            khatmah={khatmah}
            onNavigateToTab={setActiveTab}
            onNavigateToPage={handleJumpToQuranPage}
            onPlaySurah={handlePlaySurahAudio}
            onOpenVipModal={() => setShowVipModal(true)}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'quran' && (
          <div className="space-y-4">
            {/* Sub-view toggle between Mushaf Reader & Surah Index */}
            <div className="max-w-4xl mx-auto px-4 pt-4 flex items-center justify-between">
              <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setQuranSubView('reader')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    quranSubView === 'reader'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
                  }`}
                >
                  المصحف الشريف
                </button>
                <button
                  onClick={() => setQuranSubView('index')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    quranSubView === 'index'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
                  }`}
                >
                  فهرس السور والأجزاء
                </button>
              </div>

              <div className="text-xs text-stone-400">
                صفحة {currentPage} من 604
              </div>
            </div>

            {quranSubView === 'reader' ? (
              <QuranReader
                currentPage={currentPage}
                currentSurahNumber={currentSurahNumber}
                onPageChange={handlePageChange}
                onSurahChange={handleSurahChange}
                bookmarks={bookmarks}
                onToggleBookmark={handleToggleBookmark}
                activePlayingAyah={activePlayingAyah}
                isPlaying={isPlaying}
                onPlayAyahAudio={handlePlayAyahAudio}
                onPauseAudio={handlePauseAudio}
              />
            ) : (
              <SurahList
                onSelectSurah={(surahNum, page) => {
                  handleSurahChange(surahNum);
                  handlePageChange(page);
                  setQuranSubView('reader');
                }}
                bookmarks={bookmarks}
                onPlaySurah={handlePlaySurahAudio}
                currentPlayingSurah={playingSurah}
                isPlaying={isPlaying}
              />
            )}
          </div>
        )}

        {/* Tab 3: الورد والختمة with RECHARTS Visualizations */}
        {activeTab === 'wird' && (
          <KhatmahTracker
            khatmah={khatmah}
            onUpdateKhatmah={handleUpdateKhatmah}
            onNavigateToPage={handleJumpToQuranPage}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Tab 4: التلاوات والمكتبة الشاملة */}
        {activeTab === 'recitations' && (
          <RecitationsView
            currentReciter={currentReciter}
            onSelectReciter={handleSelectReciter}
            currentSurahNumber={playingSurah}
            isPlaying={isPlaying}
            audioState={audioState}
            audioErrorMsg={audioErrorMsg}
            onRetryAudio={() => handlePlaySurahAudio(playingSurah)}
            onPlaySurah={handlePlaySurahAudio}
            onPause={handlePauseAudio}
            onResume={handleResumeAudio}
            audioProgress={audioProgress}
            audioDuration={audioDuration}
            currentTime={currentTime}
            onSeek={handleSeek}
            playbackRate={playbackRate}
            onChangePlaybackRate={handleChangePlaybackRate}
            downloadedList={downloadedList}
            onStartDownload={handleStartDownload}
            onDeleteDownload={handleDeleteDownload}
            onNavigateToQuranPage={handleJumpToQuranPage}
          />
        )}

        {/* Tab: التوقيت العالمي */}
        {activeTab === 'world_clock' && (
          <WorldClockView />
        )}

        {/* Tab: الأحاديث النبوية */}
        {activeTab === 'hadiths' && (
          <HadithView />
        )}

        {/* Tab: مواقيت الصلاة العالمية */}
        {activeTab === 'prayers' && (
          <GlobalPrayerTimesView />
        )}

        {/* Tab 5: حسابي / الأدوات الإسلامية والإعدادات */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="max-w-4xl mx-auto px-4 pt-2">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setActiveTab('world_clock')}
                  className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:border-emerald-500 shadow-xs"
                >
                  <Globe2 className="w-4 h-4 text-emerald-600" />
                  <span>التوقيت العالمي</span>
                </button>

                <button
                  onClick={() => setActiveTab('hadiths')}
                  className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:border-emerald-500 shadow-xs"
                >
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>الأحاديث النبوية</span>
                </button>

                <button
                  onClick={() => setShowVipModal(true)}
                  className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold shadow-xs hover:from-amber-400 hover:to-amber-500"
                >
                  <Crown className="w-4 h-4" />
                  <span>عضوية VIP</span>
                </button>
              </div>
            </div>

            <IslamicToolsView />
            
            <ProfileView
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
              khatmah={khatmah}
              bookmarks={bookmarks}
              onNavigateToPage={handleJumpToQuranPage}
              onRemoveBookmark={handleRemoveBookmark}
            />
          </div>
        )}
      </main>

      {/* Floating Audio Bar if track loaded */}
      {audioVisible && (
        <AudioBar
          surahNumber={playingSurah}
          reciter={currentReciter}
          isPlaying={isPlaying}
          audioState={audioState}
          audioErrorMsg={audioErrorMsg}
          onRetryAudio={() => handlePlaySurahAudio(playingSurah)}
          onTogglePlay={() => {
            if (isPlaying) handlePauseAudio();
            else handleResumeAudio();
          }}
          onPrevSurah={() => {
            if (playingSurah > 1) handlePlaySurahAudio(playingSurah - 1);
          }}
          onNextSurah={() => {
            if (playingSurah < 114) handlePlaySurahAudio(playingSurah + 1);
          }}
          onSeek={handleSeek}
          onClose={() => {
            handlePauseAudio();
            setAudioVisible(false);
          }}
          audioProgress={audioProgress}
          audioDuration={audioDuration}
          currentTime={currentTime}
          playbackRate={playbackRate}
          onChangePlaybackRate={handleChangePlaybackRate}
          onOpenRecitations={() => setActiveTab('recitations')}
          onOpenReciterDetail={() => setActiveTab('recitations')}
          isFavorite={favoriteReciterIds.includes(currentReciter.id)}
          onToggleFavorite={handleToggleFavoriteReciter}
        />
      )}

      {/* Fixed Bottom Navigation (5 Tabs) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* VIP Modal */}
      <VipModal
        isOpen={showVipModal}
        onClose={() => setShowVipModal(false)}
        vipState={vipState}
        onUpdateVipState={handleUpdateVipState}
      />
    </div>
  );
}
