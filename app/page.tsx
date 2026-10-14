'use client';

import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import Sidebar, { NavPage } from '@/components/layout/Sidebar';
import PortfolioSummaryBand from '@/components/dashboard/PortfolioSummaryBand';
import PortfoliosTab from '@/components/portfolios/PortfoliosTab';
import PortfolioDetail from '@/components/portfolios/PortfolioDetail';
import PlaceholderTab from '@/components/tabs/PlaceholderTab';
import CommandPalette from '@/components/search/CommandPalette';
import { portfolios } from '@/lib/data';

export default function DashboardPage() {
  const [activePage, setActivePage]                = useState<NavPage>('home');
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen]   = useState(false);

  const selectedPortfolio = selectedPortfolioId
    ? portfolios.find(p => p.id === selectedPortfolioId) ?? null
    : null;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(v => !v);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function handlePageChange(page: NavPage) {
    setActivePage(page);
    setSelectedPortfolioId(null);
  }

  function handleSelectPortfolio(id: string) {
    setSelectedPortfolioId(id);
    setActivePage('home');
  }

  return (
    <div className="flex h-screen bg-[#f9fbfd] overflow-hidden">
      <Sidebar
        activePage={activePage}
        onPageChange={handlePageChange}
        onOpenSearch={() => setCommandPaletteOpen(true)}
      />

      {/* Main area */}
      <div className="flex-1 p-[10px] pl-0 min-w-0">
        <div className="bg-white border border-[#dfe3e9] rounded-[10px] h-full overflow-hidden flex flex-col relative">

          {activePage === 'home' ? (
            selectedPortfolio ? (
              <PortfolioDetail
                portfolio={selectedPortfolio}
                onBack={() => setSelectedPortfolioId(null)}
                onSwitch={setSelectedPortfolioId}
              />
            ) : (
              <>
                {/* Greeting + currency notice */}
                <div className="flex items-center justify-between px-[24px] pt-[18px] pb-[14px] shrink-0">
                  <p className="text-[16px] text-[#07132a] leading-none" style={{ fontFamily: 'DeutscheBankDisplay, serif' }}>
                    Good morning Nick, here is your consolidated view across {portfolios.length} portfolios.
                  </p>
                  <div className="flex items-center gap-[5px] shrink-0 ml-[16px]">
                    <Info size={12} className="text-[#b0b7c3]" strokeWidth={1.75} />
                    <p className="text-[11px] text-[#9ca3af] leading-none whitespace-nowrap">All values in USD</p>
                  </div>
                </div>
                <div className="h-px bg-[#dfe3e9] shrink-0" />
                <PortfolioSummaryBand />
                <div className="flex-1 min-h-0 flex flex-col">
                  <PortfoliosTab onSelectPortfolio={setSelectedPortfolioId} />
                </div>
              </>
            )
          ) : activePage === 'markets' ? (
            <PlaceholderTab label="Markets" subtitle="Watchlist lives here" />
          ) : activePage === 'news-insights' ? (
            <PlaceholderTab label="News & Insights" />
          ) : activePage === 'holdings' ? (
            <PlaceholderTab label="Holdings" subtitle="Liabilities lives here" />
          ) : activePage === 'reports' ? (
            <PlaceholderTab label="Reports" />
          ) : activePage === 'transactions' ? (
            <PlaceholderTab label="Transactions" />
          ) : null}

        </div>
      </div>

      {commandPaletteOpen && (
        <CommandPalette
          onClose={() => setCommandPaletteOpen(false)}
          onSelectPortfolio={handleSelectPortfolio}
        />
      )}
    </div>
  );
}
