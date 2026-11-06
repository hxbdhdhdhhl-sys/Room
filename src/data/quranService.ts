import { Ayah, SurahMeta } from '../types/quran';
import { SURAHS_META } from './quranMeta';

// In-memory cache for loaded surahs
const surahsCache: Record<number, Ayah[]> = {};

// Core Surahs bundled directly for instant offline access and immediate rendering
export const BUNDLED_SURAHS: Record<number, Ayah[]> = {
  1: [
    { number: 1, surahNumber: 1, numberInSurah: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", page: 1, juz: 1, tafseer: "أبدأ قراءتي مستعينا باسم الله، وهو الاسم الأعظم، الموصوف بصفات الجلال والكمال." },
    { number: 2, surahNumber: 1, numberInSurah: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", page: 1, juz: 1, tafseer: "الثناء الكامل والشكر الخالص لله وحده، مالك الخلق والمدبر لأمورهم جميعاً." },
    { number: 3, surahNumber: 1, numberInSurah: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ", page: 1, juz: 1, tafseer: "ذو الرحمة الواسعة التي وسعت كل شيء، والرحيم بالمؤمنين خصوصاً." },
    { number: 4, surahNumber: 1, numberInSurah: 4, text: "مَالِكِ يَوْمِ الدِّينِ", page: 1, juz: 1, tafseer: "المتصرف الأوحد في يوم القيامة والجزاء والحساب." },
    { number: 5, surahNumber: 1, numberInSurah: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", page: 1, juz: 1, tafseer: "نخصك وحدك بالعبادة، ونطلب منك وحدك العون في جميع شؤوننا." },
    { number: 6, surahNumber: 1, numberInSurah: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", page: 1, juz: 1, tafseer: "وفقنا وأرشدنا وثبتنا على الطريق الواضح المستقيم وهو دين الإسلام." },
    { number: 7, surahNumber: 1, numberInSurah: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", page: 1, juz: 1, tafseer: "طريق النبيين والصديقين والشهداء والصالحين، غير طريق المغضوب عليهم والضالين." }
  ],
  112: [
    { number: 6222, surahNumber: 112, numberInSurah: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ", page: 604, juz: 30, tafseer: "قل أيها الرسول: الله هو المنفرد بالألوهية والربوبية والأسماء والصفات، لا شريك له." },
    { number: 6223, surahNumber: 112, numberInSurah: 2, text: "اللَّهُ الصَّمَدُ", page: 604, juz: 30, tafseer: "الذي يقصده جميع الخلائق في حوائجهم ورغائبهم لكمال صفاته وغناه عن خلقه." },
    { number: 6224, surahNumber: 112, numberInSurah: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", page: 604, juz: 30, tafseer: "تنزه سبحانه عن الولد والوالد والكفء والمثيل." },
    { number: 6225, surahNumber: 112, numberInSurah: 4, text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", page: 604, juz: 30, tafseer: "وليس له مكافئ ولا مماثل ولا نظير في ذاته ولا في أسمائه وصفاته." }
  ],
  113: [
    { number: 6226, surahNumber: 113, numberInSurah: 1, text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", page: 604, juz: 30, tafseer: "قل: أعتصم وألتجئ برب الصبح وفالقه." },
    { number: 6227, surahNumber: 113, numberInSurah: 2, text: "مِن شَرِّ مَا خَلَقَ", page: 604, juz: 30, tafseer: "من شر كل مخلوق فيه شر من الإنس والجن والحيوان." },
    { number: 6228, surahNumber: 113, numberInSurah: 3, text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", page: 604, juz: 30, tafseer: "ومن شر الليل المظلم إذا دخل واشتد ظلامه، لما ينتشر فيه من الشرور." },
    { number: 6229, surahNumber: 113, numberInSurah: 4, text: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", page: 604, juz: 30, tafseer: "ومن شر الساحرات اللاتي يعقدن الخيوط وينفثن فيها بالسحر." },
    { number: 6230, surahNumber: 113, numberInSurah: 5, text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", page: 604, juz: 30, tafseer: "ومن شر الحاسد إذا أظهر حسده وتمنى زوال النعمة عن غيره." }
  ],
  114: [
    { number: 6231, surahNumber: 114, numberInSurah: 1, text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", page: 604, juz: 30, tafseer: "قل: ألتجئ وأعتصم برب الناس وخالقهم ومدبر أمورهم." },
    { number: 6232, surahNumber: 114, numberInSurah: 2, text: "مَلِكِ النَّاسِ", page: 604, juz: 30, tafseer: "ملك جميع الناس الحاكم فيهم بما يشاء." },
    { number: 6233, surahNumber: 114, numberInSurah: 3, text: "إِلَٰهِ النَّاسِ", page: 604, juz: 30, tafseer: "معبود الناس الحق الذي لا معبود سواه." },
    { number: 6234, surahNumber: 114, numberInSurah: 4, text: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", page: 604, juz: 30, tafseer: "من شر الشيطان الذي يوسوس في الصدور ويخنس ويختفي عند ذكر الله." },
    { number: 6235, surahNumber: 114, numberInSurah: 5, text: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", page: 604, juz: 30, tafseer: "الذي يبث الشر والشكوك والأوهام في قلوب الناس." },
    { number: 6236, surahNumber: 114, numberInSurah: 6, text: "مِنَ الْجِنَّةِ وَالنَّاسِ", page: 604, juz: 30, tafseer: "من شياطين الإنس والجن على السواء." }
  ],
  108: [
    { number: 6205, surahNumber: 108, numberInSurah: 1, text: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", page: 602, juz: 30, tafseer: "إنا أعطيناك أيها النبي الخير الكثير في الدنيا والآخرة ومنه نهر الكوثر في الجنة." },
    { number: 6206, surahNumber: 108, numberInSurah: 2, text: "فَصَلِّ لِرَبِّكَ وَانْحَرْ", page: 602, juz: 30, tafseer: "فأخلص لربك صلاتك كلها، واذبح ذبيحتك له وحده." },
    { number: 6207, surahNumber: 108, numberInSurah: 3, text: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ", page: 602, juz: 30, tafseer: "إن مبغضك وكارهك هو المنقطع عن كل خير المغمور في الدنيا والآخرة." }
  ],
  103: [
    { number: 6177, surahNumber: 103, numberInSurah: 1, text: "وَالْعَصْرِ", page: 601, juz: 30, tafseer: "أقسم الله بالدهر والزمان لما فيه من العبر والمواعظ." },
    { number: 6178, surahNumber: 103, numberInSurah: 2, text: "إِنَّ الْإِنسَانَ لَفِي خُسْرٍ", page: 601, juz: 30, tafseer: "إن كل إنسان في خسارة ونقصان وهلاك في مسعاه." },
    { number: 6179, surahNumber: 103, numberInSurah: 3, text: "إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ", page: 601, juz: 30, tafseer: "إلا الذين جمعوا بين الإيمان والعمل الصالح وتواصوا بالثبات على الحق والصبر عليه." }
  ],
  67: [
    { number: 5242, surahNumber: 67, numberInSurah: 1, text: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", page: 562, juz: 29, tafseer: "تعاظم وكثر خير الله الذي بيده تصريف الملك والسلطان وهو القادر على كل شيء." },
    { number: 5243, surahNumber: 67, numberInSurah: 2, text: "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا وَهُوَ الْعَزِيزُ الْغَفُورُ", page: 562, juz: 29, tafseer: "الذي أوجد الموت والحياة ليختبركم أيكم أصلح عملاً وأخلصه لله." },
    { number: 5244, surahNumber: 67, numberInSurah: 3, text: "الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ", page: 562, juz: 29, tafseer: "خلق سبع سماوات بعضها فوق بعض في غاية الإحكام والإتقان دون نقص أو خلل." }
  ],
  36: [
    { number: 3706, surahNumber: 36, numberInSurah: 1, text: "يس", page: 440, juz: 22, tafseer: "حروف مقطعة للتحدي والإعجاز." },
    { number: 3707, surahNumber: 36, numberInSurah: 2, text: "وَالْقُرْآنِ الْحَكِيمِ", page: 440, juz: 22, tafseer: "قسم بالقرآن المحكم في نظمه وأحكامه وهدايته." },
    { number: 3708, surahNumber: 36, numberInSurah: 3, text: "إِنَّكَ لَمِنَ الْمُرْسَلِينَ", page: 440, juz: 22, tafseer: "إنك يا محمد لمن الرسل الموحى إليهم لهداية البشر." },
    { number: 3709, surahNumber: 36, numberInSurah: 4, text: "عَلَىٰ صِرَاطٍ مُّسْتَقِيمٍ", page: 440, juz: 22, tafseer: "على طريق مستقيم واضح لا اعوجاج فيه." },
    { number: 3710, surahNumber: 36, numberInSurah: 5, text: "تَنزِيلَ الْعَزِيزِ الرَّحِيمِ", page: 440, juz: 22, tafseer: "تنزيل من الله العزيز القوي الرحيم بعباده." }
  ]
};

// Seed bundled surahs into cache
Object.entries(BUNDLED_SURAHS).forEach(([numStr, ayahs]) => {
  surahsCache[Number(numStr)] = ayahs;
});

// Fetch Surah verses from API with local cache
export async function fetchSurahAyahs(surahNumber: number): Promise<Ayah[]> {
  // Check local cache
  if (surahsCache[surahNumber] && surahsCache[surahNumber].length > 0) {
    return surahsCache[surahNumber];
  }

  // Check localStorage for offline persistence
  const storageKey = `itm_surah_${surahNumber}`;
  const localSaved = localStorage.getItem(storageKey);
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      surahsCache[surahNumber] = parsed;
      return parsed;
    } catch {
      // Ignore parse error
    }
  }

  try {
    // AlQuran Cloud public verified endpoint (Uthmani + Tafseer Muyassar)
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,ar.muyassar`);
    if (!res.ok) throw new Error('Failed to fetch from Quran API');
    
    const data = await res.json();
    if (data.code === 200 && data.data && data.data.length >= 2) {
      const uthmaniEdition = data.data[0];
      const tafseerEdition = data.data[1];
      
      const meta = SURAHS_META.find(s => s.number === surahNumber);
      const startPage = meta ? meta.startPage : 1;
      const endPage = meta ? meta.endPage : startPage;
      const totalAyahs = uthmaniEdition.ayahs.length;

      const ayahs: Ayah[] = uthmaniEdition.ayahs.map((a: any, idx: number) => {
        const tafseerText = tafseerEdition?.ayahs[idx]?.text || '';
        // Approximate page number if not in API response
        const calculatedPage = a.page || Math.min(endPage, startPage + Math.floor((idx / Math.max(1, totalAyahs)) * (endPage - startPage + 1)));

        return {
          number: a.number,
          surahNumber: surahNumber,
          numberInSurah: a.numberInSurah,
          text: a.text,
          page: calculatedPage,
          juz: a.juz || meta?.juz || 1,
          hizbQuarter: a.hizbQuarter,
          tafseer: tafseerText
        };
      });

      surahsCache[surahNumber] = ayahs;
      try {
        localStorage.setItem(storageKey, JSON.stringify(ayahs));
      } catch {
        // Storage might be full, safe to ignore
      }
      return ayahs;
    }
  } catch (err) {
    console.warn(`Could not fetch online surah ${surahNumber}, falling back to generator/bundled.`, err);
  }

  // Fallback: Generate structured placeholders with meta if completely offline
  const meta = SURAHS_META.find(s => s.number === surahNumber);
  if (meta) {
    const fallbackAyahs: Ayah[] = Array.from({ length: meta.numberOfAyahs }, (_, i) => ({
      number: (surahNumber * 1000) + (i + 1),
      surahNumber: surahNumber,
      numberInSurah: i + 1,
      text: i === 0 && surahNumber !== 1 && surahNumber !== 9
        ? `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ - آية ${i + 1} من سورة ${meta.name}`
        : `آية ${i + 1} من سورة ${meta.name} المباركة.`,
      page: meta.startPage + Math.floor((i / meta.numberOfAyahs) * (meta.endPage - meta.startPage + 1)),
      juz: meta.juz,
      tafseer: `تفسير الآية الكريمة رقم ${i + 1} من سورة ${meta.name}.`
    }));
    surahsCache[surahNumber] = fallbackAyahs;
    return fallbackAyahs;
  }

  return [];
}

// Search Quran Surahs and Ayahs
export function searchSurahs(query: string): SurahMeta[] {
  const cleanQuery = query.trim().replace(/[ً-ْ]/g, '');
  if (!cleanQuery) return SURAHS_META;

  return SURAHS_META.filter(s => {
    const cleanName = s.name.replace(/[ً-ْ]/g, '');
    const cleanEn = s.englishName.toLowerCase();
    const queryLower = cleanQuery.toLowerCase();
    return cleanName.includes(cleanQuery) || 
           cleanEn.includes(queryLower) || 
           s.number.toString() === cleanQuery;
  });
}
