import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  X, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Star, 
  Maximize2, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  VolumeX
} from 'lucide-react';
import { SURAHS_META } from '../data/quranMeta';
import { Reciter } from '../types/quran';
import { ReciterAvatar } from './ReciterAvatar';

interface AudioBarProps {
  surahNumber: number;
  reciter: Reciter;
  isPlaying: boolean;
  audioState?: 'idle' | 'loading' | 'playing' | 'paused' | 'error';
  audioErrorMsg?: string | null;
  onRetryAudio?: () => void;
  onTogglePlay: () => void;
  onPrevSurah?: () => void;
  onNextSurah?: () => void;
  onSeek?: (percent: number) => void;
  onClose: () => void;
  audioProgress: number; // 0 to 100
  audioDuration?: number; // in seconds
  currentTime?: number; // in seconds
  playbackRate?: number;
  onChangePlaybackRate?: (rate: number) => void;
  onOpenRecitations: () => void;
  onOpenReciterDetail?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (reciterId: string) => void;
}

export const AudioBar: React.FC<AudioBarProps> = ({
  surahNumber,
  reciter,
  isPlaying,
  audioState = 'idle',
  audioErrorMsg,
  onRetryAudio,
  onTogglePlay,
  onPrevSurah,
  onNextSurah,
  onSeek,
  onClose,
  audioProgress,
  audioDuration = 0,
  currentTime = 0,
  playbackRate = 1,
  onChangePlaybackRate,
  onOpenRecitations,
  onOpenReciterDetail,
  isFavorite = false,
  onToggleFavorite
}) => {
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('all');
  const surah = SURAHS_META.find(s => s.number === surahNumber) || SURAHS_META[0];

  const formatDuration = (sec: number) => {
    if (isNaN(sec) || sec <= 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    onSeek(pct);
  };

  const isLoading = audioState === 'loading';
  const isError = audioState === 'error';

  return (
    <aside aria-label="مشغل التلاوة الصوتي" className="fixed bottom-16 sm:bottom-18 left-0 right-0 z-40 px-3 py-1 pointer-events-none transition-all">
      <div className="max-w-2xl mx-auto pointer-events-auto bg-stone-900/95 dark:bg-stone-950/95 text-white backdrop-blur-md border border-stone-800/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
        
        {/* Error notification bar if playback encountered an error */}
        {isError && (
          <div className="bg-red-950/90 border-b border-red-800/60 px-3 py-1.5 flex items-center justify-between text-xs text-red-200">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="truncate">{audioErrorMsg || 'تعذر تشغيل التلاوة. يرجى إعادة المحاولة.'}</span>
            </div>
            {onRetryAudio && (
              <button
                onClick={onRetryAudio}
                className="px-2 py-0.5 rounded-md bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] flex items-center gap-1 shrink-0 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>إعادة المحاولة</span>
              </button>
            )}
          </div>
        )}

        {/* Interactive Audio Scrubber Bar */}
        <div 
          onClick={handleSeekClick}
          className="w-full h-1.5 bg-stone-800 hover:h-2.5 transition-all cursor-pointer relative group"
          title="انقر للتقديم أو التأخير في التلاوة"
        >
          <div 
            className="h-full bg-emerald-500 group-hover:bg-emerald-400 rounded-r-full transition-all duration-100 relative"
            style={{ width: `${Math.min(100, Math.max(0, audioProgress))}%` }}
          >
            {/* Scrubber thumb handle on hover */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Player Controls & Info Area */}
        <div className="p-2 sm:p-2.5 flex items-center justify-between gap-3">
          
          {/* Reciter Avatar & Surah Information */}
          <div 
            onClick={onOpenReciterDetail || onOpenRecitations}
            className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer group"
            title="انقر لفتح صفحة الشيخ والتلاوات المتاحة"
          >
            {/* Reciter Photo with Emblem Fallback */}
            <ReciterAvatar
              name={reciter.name}
              photoUrl={reciter.photoUrl}
              size="sm"
              badge={false}
            />

            <div className="truncate text-right">
              <div className="text-xs sm:text-sm font-bold truncate flex items-center gap-1.5">
                <span className="text-white group-hover:text-emerald-400 transition-colors">
                  سورة {surah.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-emerald-300 font-mono hidden sm:inline">
                  {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                </span>
              </div>
              <div className="text-[11px] text-stone-300 dark:text-stone-400 truncate flex items-center gap-1 mt-0.5">
                <span>الشيخ {reciter.name}</span>
                <span>·</span>
                <span className="font-mono tabular-nums text-[10px] text-stone-400">
                  {formatDuration(currentTime)} / {formatDuration(audioDuration)}
                </span>
              </div>
            </div>
          </div>

          {/* Core Playback Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Previous Surah button */}
            {onPrevSurah && (
              <button
                onClick={onPrevSurah}
                disabled={surahNumber <= 1}
                className="p-1.5 text-stone-400 hover:text-white disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
                title="السورة السابقة"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}

            {/* Play / Pause / Loading button */}
            <button
              onClick={onTogglePlay}
              disabled={isLoading}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                isError
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              title={isPlaying ? 'إيقاف مؤقت' : 'متابعة التلاوة'}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current mr-0.5" />
              )}
            </button>

            {/* Next Surah button */}
            {onNextSurah && (
              <button
                onClick={onNextSurah}
                disabled={surahNumber >= 114}
                className="p-1.5 text-stone-400 hover:text-white disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
                title="السورة التالية"
              >
                <SkipBack className="w-4 h-4" />
              </button>
            )}

            {/* Favorite Reciter Toggle */}
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(reciter.id)}
                className={`p-1.5 rounded-lg transition-colors hidden sm:inline-flex ${
                  isFavorite ? 'text-amber-400' : 'text-stone-400 hover:text-amber-400'
                }`}
                title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}

            {/* Fullscreen Expand / Modal Opener */}
            <button
              onClick={onOpenReciterDetail || onOpenRecitations}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors"
              title="عرض صفحة القارئ الكاملة"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Close / Dismiss Bar */}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-red-400 rounded-lg transition-colors"
              title="إغلاق المشغل"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
