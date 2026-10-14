'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Check, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type InstructionType = 'rebalance' | 'reduce' | 'trim' | 'add-funds' | 'change-mandate';

const LABELS: Record<InstructionType, string> = {
  rebalance: 'Rebalance Portfolio',
  reduce: 'Reduce Exposure',
  trim: 'Trim Position',
  'add-funds': 'Add Funds',
  'change-mandate': 'Change Mandate',
};

const PLACEHOLDERS: Record<InstructionType, (ticker?: string) => string> = {
  rebalance: () => 'e.g. Please rebalance the portfolio back to target weights. Equity allocation has drifted significantly.',
  reduce: () => 'e.g. I\'d like to reduce overall equity exposure by 10pp. Please move the difference into IG fixed income.',
  trim: (t) => t ? `e.g. Please trim the ${t} position by 20%. I want to lock in some of the gains from this year.` : 'e.g. Please trim this position and use proceeds to reduce cash drag.',
  'add-funds': () => 'e.g. I\'d like to add $500,000 to this portfolio from my Cash Management account.',
  'change-mandate': () => 'e.g. I\'d like to discuss reducing the risk mandate from Moderate to Conservative given current market conditions.',
};

export interface InstructionContext {
  type: InstructionType;
  ticker?: string;
}

interface Props {
  context: InstructionContext;
  rmName: string;
  onClose: () => void;
}

export default function InstructionModal({ context, rmName, onClose }: Props) {
  const [step, setStep] = useState<'form' | 'sending' | 'sent'>('form');
  const [type, setType] = useState<InstructionType>(context.type);
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState<'routine' | 'urgent'>('routine');
  const [visible, setVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (step === 'form') setTimeout(() => textareaRef.current?.focus(), 50);
  }, [step]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleSubmit = () => {
    if (!message.trim()) return;
    setStep('sending');
    setTimeout(() => setStep('sent'), 1200);
  };

  // Show trim type chip only when opened from a holding context
  const availableTypes = (Object.keys(LABELS) as InstructionType[]).filter(
    (t) => t !== 'trim' || !!context.ticker
  );

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ transition: 'opacity 200ms', opacity: visible ? 1 : 0 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(7,19,42,0.22)', backdropFilter: 'blur(2px)' }}
        onClick={step === 'sent' ? handleClose : undefined}
      />

      {/* Card */}
      <div
        className="relative bg-white rounded-[10px] w-[440px] max-h-[90%] flex flex-col overflow-hidden"
        style={{
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          transform: visible ? 'scale(1)' : 'scale(0.97)',
          transition: 'transform 200ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >

        {step === 'sent' ? (
          /* ── Sent state ─────────────────────────────────────── */
          <div className="flex flex-col items-center px-[32px] py-[40px] text-center">
            <div className="w-[44px] h-[44px] rounded-full bg-[#dcfce7] flex items-center justify-center mb-[16px]">
              <Check size={20} className="text-[#16a34a]" strokeWidth={2.5} />
            </div>
            <p className="text-[16px] text-[#07132a] font-semibold mb-[6px]">Instruction sent</p>
            <p className="text-[13px] text-[#6b7280] mb-[4px]">
              Your {LABELS[type].toLowerCase()} has been sent to {rmName}.
            </p>
            <p className="text-[11px] text-[#9ca3af] mb-[24px]">
              Typically responds within 2 hours during market hours.
            </p>
            {urgency === 'urgent' && (
              <div className="flex items-center gap-[7px] bg-[#fef3c7] border border-[#fde68a] rounded-[7px] px-[13px] py-[9px] mb-[24px] w-full">
                <AlertCircle size={13} className="text-[#d97706] shrink-0" />
                <span className="text-[11px] text-[#92400e] text-left">
                  Marked urgent — {rmName} has been notified via SMS.
                </span>
              </div>
            )}
            <button
              onClick={handleClose}
              className="w-full bg-[#f3f4f6] text-[#374151] text-[13px] font-medium py-[9px] rounded-[6px] hover:bg-[#e5e7eb] transition-colors"
            >
              Done
            </button>
          </div>

        ) : (
          /* ── Form ───────────────────────────────────────────── */
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-[20px] h-[48px] shrink-0 border-b border-[#f0f2f5]">
              <p className="text-[13px] text-[#07132a] font-medium">
                {context.ticker ? `Instruction on ${context.ticker}` : 'Portfolio instruction'}
              </p>
              <button
                onClick={handleClose}
                className="w-[24px] h-[24px] flex items-center justify-center rounded-[4px] text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors"
              >
                <X size={13} strokeWidth={1.75} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-[20px] py-[20px]">

              {/* Instruction type chips */}
              <div className="mb-[20px]">
                <p className="text-[10px] text-[#b0b7c3] uppercase tracking-[0.08em] font-medium mb-[8px]">
                  Instruction type
                </p>
                <div className="flex flex-wrap gap-[6px]">
                  {availableTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={cn(
                        'text-[11px] px-[10px] py-[5px] rounded-[5px] border transition-colors',
                        type === t
                          ? 'bg-[#00205b] text-white border-[#00205b]'
                          : 'bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#d1d5db] hover:text-[#374151]'
                      )}
                    >
                      {LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="mb-[20px]">
                <p className="text-[10px] text-[#b0b7c3] uppercase tracking-[0.08em] font-medium mb-[8px]">
                  Message to {rmName}
                </p>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={PLACEHOLDERS[type](context.ticker)}
                  rows={4}
                  className="w-full resize-none border border-[#e5e7eb] rounded-[6px] px-[12px] py-[10px] text-[12px] text-[#07132a] placeholder:text-[#d1d5db] focus:outline-none focus:border-[#00205b] transition-colors"
                />
                <p className="text-[10px] text-[#b0b7c3] mt-[4px]">
                  Sent as a secure message directly to your relationship manager.
                </p>
              </div>

              {/* Priority */}
              <div>
                <p className="text-[10px] text-[#b0b7c3] uppercase tracking-[0.08em] font-medium mb-[8px]">
                  Priority
                </p>
                <div className="flex rounded-[6px] border border-[#e5e7eb] overflow-hidden">
                  <button
                    onClick={() => setUrgency('routine')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-[5px] text-[11px] py-[8px] transition-colors',
                      urgency === 'routine'
                        ? 'bg-[#f3f4f6] text-[#07132a] font-medium'
                        : 'text-[#9ca3af] hover:text-[#6b7280]'
                    )}
                  >
                    <Clock size={11} />
                    Routine
                  </button>
                  <div className="w-px bg-[#e5e7eb]" />
                  <button
                    onClick={() => setUrgency('urgent')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-[5px] text-[11px] py-[8px] transition-colors',
                      urgency === 'urgent'
                        ? 'bg-[#fef3c7] text-[#92400e] font-medium'
                        : 'text-[#9ca3af] hover:text-[#6b7280]'
                    )}
                  >
                    <AlertCircle size={11} />
                    Urgent
                  </button>
                </div>
                {urgency === 'urgent' && (
                  <p className="text-[10px] text-[#d97706] mt-[5px]">
                    {rmName} will also be notified via SMS for urgent instructions.
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-[20px] py-[14px] border-t border-[#f0f2f5] flex gap-[8px]">
              <button
                onClick={handleClose}
                className="flex-1 text-[12px] text-[#6b7280] border border-[#e5e7eb] py-[8px] rounded-[6px] hover:bg-[#f8f9fb] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!message.trim() || step === 'sending'}
                className={cn(
                  'flex-[2_1_0%] text-[12px] font-medium py-[8px] rounded-[6px] transition-colors',
                  message.trim() && step !== 'sending'
                    ? 'bg-[#00205b] text-white hover:bg-[#001844]'
                    : 'bg-[#f3f4f6] text-[#b0b7c3] cursor-not-allowed'
                )}
              >
                {step === 'sending' ? 'Sending…' : `Send to ${rmName}`}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
