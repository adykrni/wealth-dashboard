'use client';

import { useState } from 'react';
import { ChevronDown, Search, ArrowLeftRight, MessageSquare, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import CreatePortfolioModal from '@/components/modals/CreatePortfolioModal';

export type NavPage =
  | 'home'
  | 'markets'
  | 'news-insights'
  | 'holdings'
  | 'reports'
  | 'transactions';

const PRIMARY_NAV: { icon: string; label: string; id: NavPage }[] = [
  { icon: '/icons/nav-home.svg',         label: 'Home',            id: 'home' },
  { icon: '/icons/nav-markets.svg',      label: 'Markets',         id: 'markets' },
  { icon: '/icons/nav-news.svg',         label: 'News & Insights', id: 'news-insights' },
  { icon: '/icons/portfolio-folder.svg', label: 'Holdings',        id: 'holdings' },
  { icon: '/icons/nav-reports.svg',      label: 'Reports',         id: 'reports' },
  { icon: '/icons/nav-transactions.svg', label: 'Transactions',    id: 'transactions' },
];

const BADGE_NAV = [
  { icon: '/icons/nav-notifications.svg', label: 'Notifications', badge: '17+' },
  { icon: '/icons/nav-messages.svg',      label: 'Messages',      badge: '4 new' },
];

interface Props {
  activePage: NavPage;
  onPageChange: (page: NavPage) => void;
  onOpenSearch: () => void;
}

export default function Sidebar({ activePage, onPageChange, onOpenSearch }: Props) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <aside className="w-[211px] h-screen bg-[#f9fbfd] flex flex-col shrink-0">
        <div className="flex-1 overflow-y-auto px-[10px] flex flex-col gap-[9px] pt-[10px] pb-[9px]">

          {/* User profile */}
          <div className="flex items-center justify-between px-[8px] py-[4px] rounded-[10px] shrink-0 w-full">
            <div className="flex items-center gap-[6px]">
              <div className="w-[24px] h-[24px] rounded-full shrink-0 overflow-hidden">
                <img src="/avatar-nick.png" alt="Nick Thomas" className="w-full h-full object-cover" />
              </div>
              <span className="text-[12px] text-[#171717] leading-[1.4] whitespace-nowrap">Nick Thomas</span>
            </div>
            <ChevronDown size={14} className="text-[#646c79] shrink-0" strokeWidth={1.5} />
          </div>

          {/* Primary nav */}
          <nav className="flex flex-col gap-[2px]">
            {PRIMARY_NAV.map(({ icon, label, id }) => (
              <button
                key={id}
                onClick={() => onPageChange(id)}
                className={cn(
                  'flex items-center gap-[8px] px-[8px] py-[6px] rounded-[4px] w-full text-left transition-colors',
                  activePage === id
                    ? 'bg-[#eef2f5] text-[#07132a]'
                    : 'text-[#3c4556] hover:bg-[#eef2f5] hover:text-[#07132a]'
                )}
              >
                <img src={icon} alt={label} className="size-[14px] shrink-0" />
                <span className="text-[12px] leading-[1.3]">{label}</span>
              </button>
            ))}

            {/* Badge nav */}
            {BADGE_NAV.map(({ icon, label, badge }) => (
              <button
                key={label}
                className="flex items-center justify-between px-[8px] py-[6px] rounded-[4px] w-full text-left text-[#3c4556] hover:bg-[#eef2f5] hover:text-[#07132a] transition-colors"
              >
                <div className="flex items-center gap-[8px]">
                  <img src={icon} alt={label} className="size-[14px] shrink-0" />
                  <span className="text-[12px] leading-[1.3]">{label}</span>
                </div>
                <span className="text-[12px] text-[#646c79]">{badge}</span>
              </button>
            ))}
          </nav>

          {/* Divider */}
          <div className="h-px bg-[#dfe3e9] shrink-0" />

          {/* Quick Actions */}
          <div className="flex flex-col gap-[2px]">
            <div className="px-[8px] py-[5px]">
              <span className="text-[11px] text-[#9ca3af] leading-none uppercase tracking-[0.06em] font-medium">
                Quick actions
              </span>
            </div>

            <button
              onClick={onOpenSearch}
              className="flex items-center justify-between gap-[6px] px-[8px] py-[6px] rounded-[6px] w-full text-left text-[#3c4556] hover:bg-[#eef2f5] hover:text-[#07132a] transition-colors group"
            >
              <div className="flex items-center gap-[6px]">
                <Search size={13} className="shrink-0" strokeWidth={1.75} />
                <span className="text-[12px] leading-[1.4]">Search</span>
              </div>
              <kbd className="text-[9px] text-[#b0b7c3] border border-[#e5e7eb] rounded-[3px] px-[4px] py-[1px] font-mono leading-none shrink-0 group-hover:border-[#d1d5db]">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-[6px] px-[8px] py-[6px] rounded-[6px] w-full text-left text-[#3c4556] hover:bg-[#eef2f5] hover:text-[#07132a] transition-colors"
            >
              <img src="/icons/action-new-portfolio.svg" alt="" className="size-[13px] shrink-0" />
              <span className="text-[12px] leading-[1.4]">New portfolio</span>
            </button>

            <button className="flex items-center gap-[6px] px-[8px] py-[6px] rounded-[6px] w-full text-left text-[#3c4556] hover:bg-[#eef2f5] hover:text-[#07132a] transition-colors">
              <ArrowLeftRight size={13} className="shrink-0" strokeWidth={1.75} />
              <span className="text-[12px] leading-[1.4]">Transfer funds</span>
            </button>

            <button className="flex items-center gap-[6px] px-[8px] py-[6px] rounded-[6px] w-full text-left text-[#3c4556] hover:bg-[#eef2f5] hover:text-[#07132a] transition-colors">
              <MessageSquare size={13} className="shrink-0" strokeWidth={1.75} />
              <span className="text-[12px] leading-[1.4]">Contact RM</span>
            </button>

            <button className="flex items-center gap-[6px] px-[8px] py-[6px] rounded-[6px] w-full text-left text-[#3c4556] hover:bg-[#eef2f5] hover:text-[#07132a] transition-colors">
              <FileText size={13} className="shrink-0" strokeWidth={1.75} />
              <span className="text-[12px] leading-[1.4]">Generate report</span>
            </button>
          </div>

        </div>
      </aside>

      <CreatePortfolioModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
