"use client";

import { Button } from "@/v2/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/v2/components/ui/dialog";
import { HEADING } from "../styles";

export default function FriendSwagModal({
  onClose,
  onBuy,
}: {
  onClose: () => void;
  onBuy: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-w-[460px] flex-col gap-5 p-6 sm:p-8">
        <div className="flex flex-col gap-2 pr-6">
          <DialogTitle className={`${HEADING} text-[clamp(24px,6vw,30px)]`}>
            Bring-a-friend reward
          </DialogTitle>
          <DialogDescription className="text-base text-cream/80">
            Everyone in a Family &amp; Friends pack will receive a special piece
            of friendship-themed swag.
          </DialogDescription>
        </div>
        <Button onClick={onBuy} className="h-12 w-full text-base">
          Get a Family &amp; Friends pack
        </Button>
        <p className="text-center text-sm text-cream/70">
          Already bought a ticket? Don&apos;t worry, we&apos;re adding a
          referral code you&apos;ll be able to use to invite friends to receive
          the bring-a-friend reward.
        </p>
      </DialogContent>
    </Dialog>
  );
}
