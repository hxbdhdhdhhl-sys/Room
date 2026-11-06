import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Check, 
  Sparkles, 
  X, 
  Palette, 
  ShieldCheck, 
  Clock, 
  Flame, 
  Volume2, 
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { VipState } from '../types/quran';

interface VipModalProps {
  isOpen: boolean;
  onClose: () => void;
  vipState: VipState;
  onUpdateVipState: (state: VipState) => void;
}

export const VIP_THEMES = [
  { id: 'default', name: 'الافتراضي الهادئ', desc: 'الرمادي الدافئ والزمرد الطبيعي', previewColor: '#059669' },
  { id: 'emerald_gold', name: 'الزمردي الملكي المذهب', desc: 'أخضر ملكي ولمسات ذهبية فاخرة', previewColor: '#d97706' },
  { id: 'kaaba_silk', name: 'كسوة الكعبة المشرفة', desc: 'أسود مهيب مع تطريزات ذهبية مستوحاة من الحرم', previewColor: '#b45309' },
  { id: 'pearl_white', name: 'اللؤلؤي الناصع', desc: 'أبيض لؤلؤي مريح مع فضي هادئ', previewColor: '#64748b' },
  { id: 'royal_sapphire', name: 'الياقوت الأزرق الملكي', desc: 'أزرق سماوي عميق للسكينة الليلية', previewColor: '#2563eb' },
  { id: 'dark_onyx', name: 'العقيق الداكن الفاخر', desc: 'أسود عميق OLED موفر للطاقة', previewColor: '#18181b' }
] as const;

export const VipModal: React.FC<VipModalProps> = ({
  isOpen,
  onClose,
  vipState,
  onUpdateVipState
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Android Hardware Back button support
  useEffect(() => {
    if (!isOpen) return;
    window.history.pushState({ modalOpen: 'vip_modal' }, '');
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleActivateTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const clean = promoCode.trim().toUpperCase();

    try {
      // First attempt server-side verification at /api/vip/verify
      const res = await fetch('/api/vip/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onUpdateVipState({
          ...vipState,
          isVip: true,
          trialExpiresAt: data.expiryDate
        });
        setSuccessMessage(data.message || 'تم تفعيل تجربة VIP لمدة 3 أيام بنجاح!');
        setLoading(false);
        return;
      } else {
        setErrorMessage(data.message || 'رمز التفعيل غير صالح.');
      }
    } catch {
      // Client-side fallback if offline
      if (clean === 'LOP') {
        const expiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        onUpdateVipState({
          ...vipState,
          isVip: true,
          trialExpiresAt: expiry
        });
        setSuccessMessage('تم تفعيل تجربة VIP لمدة 3 أيام بنجاح!');
      } else {
        setErrorMessage('رمز التفعيل غير صحيح، يرجى كتابة الرمز LOP لتفعيل التجربة.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTheme = (themeId: typeof VIP_THEMES[number]['id']) => {
    if (!vipState.isVip) {
      setErrorMessage('يجب تفعيل عضوية VIP لاختيار الثيمات الحصرية.');
      return;
    }
    onUpdateVipState({
      ...vipState,
      activeTheme: themeId
    });
  };

  const isExpired = vipState.trialExpiresAt ? new Date(vipState.trialExpiresAt).getTime() < Date.now() : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl text-right animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 flex items-center justify-center shadow-md">
              <Crown className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-50">
                  عضوية اطمئنان VIP
                </h2>
                {vipState.isVip && !isExpired && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold">
                    نشط
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                تجربة قرآنية فاخرة مع مزايا وثيمات حصرية لا محدودة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VIP Status or Activation Box */}
        {vipState.isVip && !isExpired ? (
          <div className="bg-gradient-to-l from-amber-950/40 via-stone-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-4 text-center space-y-1">
            <div className="text-amber-400 font-bold text-sm flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>أنت الآن في تجربة VIP المفعلة</span>
            </div>
            <div className="text-xs text-stone-300">
              تنتهي التجربة في:{' '}
              <span className="font-bold text-white tabular-nums">
                {new Date(vipState.trialExpiresAt!).toLocaleDateString('ar-SA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleActivateTrial} className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>تفعيل تجربة VIP لمدة 3 أيام</span>
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                استخدم الرمز: LOP
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="أدخل رمز التفعيل LOP..."
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 uppercase font-mono font-bold"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs sm:text-sm rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-xs disabled:opacity-50"
              >
                {loading ? 'جاري التحقق...' : 'تفعيل'}
              </button>
            </div>

            {errorMessage && (
              <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                {successMessage}
              </div>
            )}
          </form>
        )}

        {/* Exclusive VIP Themes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-500" />
              <span>الثيمات والمظاهر الحصرية (VIP Themes)</span>
            </h3>
            <span className="text-[11px] text-stone-400">
              {vipState.isVip ? 'مفتوحة لك بالكامل' : 'تتطلب عضوية VIP'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {VIP_THEMES.map(theme => {
              const isSelected = vipState.activeTheme === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-500 ring-1 ring-amber-500'
                      : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: theme.previewColor }}
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {theme.name}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {theme.desc}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* VIP Benefits List */}
        <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="text-xs font-bold text-stone-900 dark:text-stone-100 mb-2">
            مزايا باقة اطمئنان VIP:
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 dark:text-stone-400">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>تحميل التلاوات بجودة فائقة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>تنبؤات دقيقة لموعد الختمة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>قوائم تشغيل صوتية غير محدودة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>مزامنة سحابية متقدمة</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium rounded-xl text-xs transition-colors"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};
