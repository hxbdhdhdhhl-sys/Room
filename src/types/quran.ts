export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
  startPage: number;
  endPage: number;
  juz: number;
}

export interface Ayah {
  number: number;
  surahNumber: number;
  numberInSurah: number;
  text: string;
  simpleText?: string;
  page: number;
  juz: number;
  hizbQuarter?: number;
  tafseer?: string;
  audio?: string;
  asbabAlNuzul?: string; // Reason for revelation
  wordsMeaning?: { word: string; meaning: string }[];
}

export interface Reciter {
  id: string;
  name: string;
  subname: string;
  serverUrl: string; // Base URL for audio
  everyAyahFolder: string;
  format: 'surah' | 'ayah';
  photoUrl: string;
  bio: string;
  riwayah: string;
  availableSurahsCount: number;
  audioQuality: '128kbps' | '192kbps' | 'High Quality';
  popular?: boolean;
}

export interface DownloadedItem {
  id: string; // reciterId_surahNumber
  reciterId: string;
  reciterName: string;
  surahNumber: number;
  surahName: string;
  audioUrl: string;
  sizeMb: number;
  downloadedAt: number;
  status: 'downloading' | 'completed' | 'paused';
  progress: number;
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  verseNumber: number;
  page: number;
  timestamp: number;
  note?: string;
}

export interface AyahNote {
  id: string;
  surahNumber: number;
  verseNumber: number;
  page: number;
  noteText: string;
  createdAt: number;
  updatedAt: number;
}

export interface CustomPlaylist {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  tracks: {
    surahNumber: number;
    reciterId: string;
  }[];
}

export interface KhatmahRecord {
  id: string;
  title: string;
  targetDays: number;
  startDate: string;
  targetEndDate: string;
  completedPages: number;
  totalPages: number; // 604
  dailyGoalPages: number;
  completedJuz: number[]; // 1 to 30
  history: {
    date: string;
    pagesRead: number;
    cumulativePages: number;
  }[];
}

export interface DhikrItem {
  id: string;
  text: string;
  count: number;
  currentCount: number;
  reward?: string;
  source?: string;
}

export interface PrayerTimeData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  hijriDate: string;
  gregorianDate: string;
  cityName: string;
}

export interface WorldCityTime {
  id: string;
  cityNameAr: string;
  cityNameEn: string;
  countryAr: string;
  countryEn: string;
  timezone: string;
  lat: number;
  lng: number;
  isPopular?: boolean;
}

export interface HadithItem {
  id: string;
  title: string;
  arabicText: string;
  source: string; // e.g. صحيح البخاري
  book: string;
  number?: string;
  narrator: string; // عن أبي هريرة رضي الله عنه
  grade: string; // صحيح / متفق عليه
  explanation: string;
  category: 'quran' | 'faith' | 'prayer' | 'manners' | 'patience' | 'parents' | 'dhikr';
  categoryLabelAr: string;
}

export interface VipState {
  isVip: boolean;
  trialExpiresAt: string | null;
  activeTheme: 'default' | 'emerald_gold' | 'kaaba_silk' | 'pearl_white' | 'royal_sapphire' | 'dark_onyx';
}
