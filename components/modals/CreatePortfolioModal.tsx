'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreatePortfolioModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold text-[#07132a]">
            New portfolio
          </DialogTitle>
        </DialogHeader>
        <p className="text-[14px] text-[#3c4556] leading-[1.5]">
          Full portfolio onboarding — including type, currency, and mandate
          selection — is outside the scope of this prototype. This flow will be
          implemented in a future iteration.
        </p>
        <DialogFooter className="gap-[8px]">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
