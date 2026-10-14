'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Tab } from '@/lib/types';
import { Info } from 'lucide-react';

const TABS: { id: Tab; label: string }[] = [
  { id: 'portfolios', label: 'Portfolios' },
  { id: 'cio-insights', label: 'CIO Insights' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'holdings', label: 'Holdings' },
  { id: 'liabilities', label: 'Liabilities' },
];

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  portfolioCount: number;
}

export default function TabBar({ activeTab, onTabChange, portfolioCount }: Props) {
  const [greeting, setGreeting] = useState('Good afternoon');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <div className="flex items-center justify-between px-[21px] pt-[16px] pb-[10px]">
      <div className="flex flex-col gap-[10px] flex-1">
        {/* Greeting */}
        <p className="text-[14px] text-[#00205b] leading-normal" style={{ fontFamily: "'DeutscheBankDisplay', sans-serif" }}>
          {greeting} Nick, here&apos;s your consolidated view across{' '}
          {portfolioCount} portfolios.
        </p>

        {/* Tab bar + USD disclaimer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[6px]">
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'px-[8px] py-[6px] rounded-[6px] text-[14px] leading-none transition-all',
                    isActive
                      ? 'bg-[#fafbfd] border border-[#506183] text-[#07132a] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)]'
                      : 'bg-[#f6f7fa] text-[#5d636e] hover:bg-[#eef2f5]'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-[2px] text-[#72757a]">
            <Info size={14} strokeWidth={1.5} />
            <span className="text-[10px] font-medium leading-[20px]">
              All values are in USD ($)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
