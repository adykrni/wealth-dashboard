'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { portfolios } from '@/lib/data';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'new-portfolio',    label: 'New portfolio',              icon: '/icons/action-new-portfolio.svg' },
  { id: 'transfer',         label: 'Transfer funds',             icon: '/icons/action-payment.svg' },
  { id: 'contact-rm',       label: 'Contact relationship manager', icon: '/icons/nav-messages.svg' },
  { id: 'generate-report',  label: 'Generate performance report', icon: '/icons/nav-reports.svg' },
];

interface Props {
  onClose: () => void;
  onSelectPortfolio: (id: string) => void;
}

export default function CommandPalette({ onClose, onSelectPortfolio }: Props) {
  const [query, setQuery]           = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [visible, setVisible]       = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setVisible(true);
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const filteredActions = useMemo(() => {
    if (!query.trim()) return QUICK_ACTIONS;
    const q = query.toLowerCase();
    return QUICK_ACTIONS.filter(a => a.label.toLowerCase().includes(q));
  }, [query]);

  const filteredPortfolios = useMemo(() => {
    if (!query.trim()) return portfolios.slice(0, 6);
    const q = query.toLowerCase();
    return portfolios.filter(p => p.name.toLowerCase().includes(q));
  }, [query]);

  const totalItems = filteredActions.length + filteredPortfolios.length;

  useEffect(() => setSelectedIdx(0), [query]);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 180);
  }

  function activate(idx: number) {
    if (idx < filteredActions.length) {
      // placeholder — actions not yet wired
      return;
    }
    const p = filteredPortfolios[idx - filteredActions.length];
    if (p) {
      onSelectPortfolio(p.id);
      handleClose();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { handleClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, totalItems - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter') activate(selectedIdx);
  }

  const showEmpty = query.trim() && filteredActions.length === 0 && filteredPortfolios.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh]"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 180ms' }}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(7,19,42,0.28)', backdropFilter: 'blur(3px)' }}
      />

      {/* Card */}
      <div
        className="relative w-[560px] bg-white rounded-[12px] overflow-hidden flex flex-col"
        style={{
          boxShadow: '0 24px 64px rgba(0,0,0,0.20), 0 0 0 1px rgba(0,0,0,0.06)',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.97)',
          transition: 'transform 180ms cubic-bezier(0.16,1,0.3,1)',
          maxHeight: '70vh',
        }}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input row */}
        <div className="flex items-center gap-[10px] px-[16px] border-b border-[#f0f2f5] h-[54px] shrink-0">
          <Search size={16} className="text-[#9ca3af] shrink-0" strokeWidth={1.75} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search portfolios, holdings, actions…"
            className="flex-1 text-[14px] text-[#07132a] placeholder:text-[#c4cad4] outline-none bg-transparent"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="text-[#b0b7c3] hover:text-[#6b7280] transition-colors"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="text-[10px] text-[#b0b7c3] border border-[#e5e7eb] rounded-[4px] px-[5px] py-[2px] shrink-0 font-mono">
              esc
            </kbd>
          )}
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1">

          {showEmpty ? (
            <div className="flex flex-col items-center justify-center py-[48px]">
              <p className="text-[13px] text-[#9ca3af]">No results for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            <>
              {/* Quick actions */}
              {filteredActions.length > 0 && (
                <section>
                  <p className="text-[10px] text-[#b0b7c3] uppercase tracking-[0.08em] font-medium px-[16px] pt-[14px] pb-[5px]">
                    {query ? 'Actions' : 'Quick actions'}
                  </p>
                  {filteredActions.map((action, i) => (
                    <button
                      key={action.id}
                      className={cn(
                        'flex items-center gap-[10px] w-full px-[16px] py-[8px] text-left transition-colors',
                        selectedIdx === i ? 'bg-[#f3f5f8]' : 'hover:bg-[#f8f9fb]'
                      )}
                      onMouseEnter={() => setSelectedIdx(i)}
                      onClick={() => activate(i)}
                    >
                      <div className="w-[28px] h-[28px] rounded-[7px] bg-[#f3f4f6] flex items-center justify-center shrink-0">
                        <img src={action.icon} alt="" className="size-[13px]" />
                      </div>
                      <span className="text-[13px] text-[#374151] flex-1">{action.label}</span>
                      {selectedIdx === i && (
                        <ArrowRight size={12} className="text-[#b0b7c3] shrink-0" />
                      )}
                    </button>
                  ))}
                </section>
              )}

              {/* Portfolios */}
              {filteredPortfolios.length > 0 && (
                <section>
                  <p className="text-[10px] text-[#b0b7c3] uppercase tracking-[0.08em] font-medium px-[16px] pt-[14px] pb-[5px]">
                    Portfolios
                  </p>
                  {filteredPortfolios.map((p, i) => {
                    const idx = filteredActions.length + i;
                    const dayPos = (p.dayGain ?? 0) >= 0;
                    return (
                      <button
                        key={p.id}
                        className={cn(
                          'flex items-center gap-[10px] w-full px-[16px] py-[8px] text-left transition-colors',
                          selectedIdx === idx ? 'bg-[#f3f5f8]' : 'hover:bg-[#f8f9fb]'
                        )}
                        onMouseEnter={() => setSelectedIdx(idx)}
                        onClick={() => activate(idx)}
                      >
                        <div className="w-[28px] h-[28px] rounded-[7px] bg-[#eef2f5] flex items-center justify-center shrink-0">
                          <img src="/icons/portfolio-folder.svg" alt="" className="size-[13px]" />
                        </div>
                        <span className="text-[13px] text-[#07132a] flex-1 truncate">{p.name}</span>
                        <div className="text-right shrink-0 ml-[8px]">
                          <p className="text-[12px] text-[#07132a] tabular-nums leading-none">{formatNumber(p.value)}</p>
                          {p.dayGain !== null && (
                            <p
                              className="text-[10px] tabular-nums leading-none mt-[2px]"
                              style={{ color: dayPos ? '#16a34a' : '#dc2626' }}
                            >
                              {dayPos ? '+' : '−'}{Math.abs(p.dayGainPct ?? 0).toFixed(2)}%
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </section>
              )}
            </>
          )}
        </div>

        {/* Footer hints */}
        <div className="shrink-0 flex items-center gap-[16px] px-[16px] py-[10px] border-t border-[#f0f2f5]">
          {[
            { key: '↑↓', label: 'navigate' },
            { key: '↵', label: 'open' },
            { key: 'esc', label: 'close' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-[4px]">
              <kbd className="text-[10px] text-[#b0b7c3] border border-[#e5e7eb] rounded-[3px] px-[4px] py-[1px] font-mono leading-none">
                {key}
              </kbd>
              <span className="text-[10px] text-[#b0b7c3]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
