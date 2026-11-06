import React from 'react';
import { Home, BookOpen, Award, Volume2, LayoutGrid } from 'lucide-react';

export type NavTab = 
  | 'home' 
  | 'quran' 
  | 'wird' 
  | 'recitations' 
  | 'hadiths' 
  | 'world_clock' 
  | 'prayers' 
  | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'الرئيسية', icon: Home },
    { id: 'quran' as NavTab, label: 'القرآن', icon: BookOpen },
    { id: 'wird' as NavTab, label: 'الورد', icon: Award },
    { id: 'recitations' as NavTab, label: 'التلاوات', icon: Volume2 },
    { 
      id: 'profile' as NavTab, 
      label: 'المزيد', 
      icon: LayoutGrid,
      isActiveMatch: ['profile', 'hadiths', 'world_clock', 'prayers'].includes(activeTab)
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-t border-stone-200 dark:border-stone-800">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.isActiveMatch !== undefined ? tab.isActiveMatch : activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors rounded-xl ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-1 tracking-tight select-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
