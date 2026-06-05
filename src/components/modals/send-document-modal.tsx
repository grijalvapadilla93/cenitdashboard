"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  clientEmail: string;
  onSuccess?: () => void;
}

export default function SendDocumentModal({ open, onOpenChange, documentId, clientEmail, onSuccess }: Props) {
  const { updateDocument } = useStore();
  const [email, setEmail] = useState(clientEmail);

  const handleSend = () => {
    if (!email.trim()) return;
    updateDocument(documentId, { sentTo: email, sentAt: new Date().toISOString().split("T")[0] });
    setEmail(clientEmail);
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-headline-md font-headline-md">Send Document</DialogTitle>
          <DialogDescription>Choose who to send this document to.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-label-sm font-label-sm text-primary">Send To (Email)</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="client@company.com" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-6">Cancel</Button>
            <Button onClick={handleSend} disabled={!email.trim()} className="rounded-full px-6 bg-primary text-on-primary">Send</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
