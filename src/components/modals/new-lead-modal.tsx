"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useStore, type SocialLink } from "@/lib/store";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const platforms = ["instagram", "facebook", "twitter", "linkedin"] as const;

export default function NewLeadModal({ open, onOpenChange, onSuccess }: Props) {
  const { addLead } = useStore();
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");
  const [hasWebsite, setHasWebsite] = useState(false);
  const [website, setWebsite] = useState("");

  const addSocial = () => {
    setSocials((prev) => [...prev, { platform: "instagram", url: "" }]);
  };

  const updateSocial = (index: number, field: keyof SocialLink, value: string) => {
    setSocials((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const removeSocial = (index: number) => {
    setSocials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      businessName,
      phone,
      email,
      socials: socials.filter((s) => s.platform !== "none"),
      source,
      notes,
      website,
      hasWebsite,
    });
    setBusinessName(""); setPhone(""); setEmail(""); setSocials([]); setSource(""); setNotes(""); setHasWebsite(false); setWebsite("");
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-headline-md font-headline-md">Create New Lead</DialogTitle>
          <DialogDescription>Fill in the details to create a new lead.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-label-sm font-label-sm text-primary">Business Name</Label>
            <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Acme Corp" required className="h-12 rounded-xl bg-surface-container-low border-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-label-sm font-label-sm text-primary">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
            </div>
            <div className="space-y-2">
              <Label className="text-label-sm font-label-sm text-primary">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" type="email" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-label-sm font-label-sm text-primary">Social Media</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSocial} className="rounded-full text-xs">+ Add Social</Button>
            </div>
            {socials.map((social, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Select value={social.platform} onValueChange={(v) => updateSocial(i, "platform", v as SocialLink["platform"])}>
                  <SelectTrigger className="w-[140px] h-10 rounded-xl bg-surface-container-low border-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input value={social.url} onChange={(e) => updateSocial(i, "url", e.target.value)} placeholder="URL or @handle" className="flex-1 h-10 rounded-xl bg-surface-container-low border-transparent" />
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeSocial(i)} className="text-destructive mt-0.5">✕</Button>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label className="text-label-sm font-label-sm text-primary">Source</Label>
            <Select value={source} onValueChange={(v) => setSource(v || "")}>
              <SelectTrigger className="h-12 rounded-xl bg-surface-container-low border-transparent">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {["Website", "Referral", "LinkedIn", "Twitter", "Instagram", "Facebook", "Cold Call", "Event", "Other"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-label-sm font-label-sm text-primary">Website</Label>
            <div className="flex items-center gap-3 mb-2">
              <Switch checked={hasWebsite} onCheckedChange={setHasWebsite} />
              <span className="text-sm text-secondary">Has website</span>
            </div>
            {hasWebsite && (
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://company.com" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-label-sm font-label-sm text-primary">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes..." className="min-h-[80px] rounded-xl bg-surface-container-low border-transparent" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-6">Cancel</Button>
            <Button type="submit" className="rounded-full px-6 bg-primary text-on-primary">Create Lead</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
