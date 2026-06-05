"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore, type Document } from "@/lib/store";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onSuccess?: () => void;
}

export default function CreateContractModal({ open, onOpenChange, clientId, onSuccess }: Props) {
  const { addDocument } = useStore();
  const [mode, setMode] = useState<"create" | "upload">("create");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [fileData, setFileData] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }
    setFileName(file.name);
    setFileSize(`${(file.size / 1024 / 1024).toFixed(1)} MB`);
    const reader = new FileReader();
    reader.onload = () => setFileData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const docData: Omit<Document, "id" | "uploadedAt"> = {
      clientId,
      name,
      type: "contract",
      ...(mode === "create"
        ? { content }
        : { fileData, fileName, fileSize }),
    };
    addDocument(docData);
    setName(""); setContent(""); setFileData(""); setFileName(""); setFileSize("");
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-headline-md font-headline-md">Create Contract</DialogTitle>
          <DialogDescription>Create a new contract document for this client.</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mb-4">
          <Button type="button" variant={mode === "create" ? "default" : "outline"} onClick={() => setMode("create")} className={`rounded-full ${mode === "create" ? "bg-primary text-on-primary" : ""}`}>Create in App</Button>
          <Button type="button" variant={mode === "upload" ? "default" : "outline"} onClick={() => setMode("upload")} className={`rounded-full ${mode === "upload" ? "bg-primary text-on-primary" : ""}`}>Upload PDF</Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-label-sm font-label-sm text-primary">Document Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Master Service Agreement" required className="h-12 rounded-xl bg-surface-container-low border-transparent" />
          </div>

          {mode === "create" ? (
            <div className="space-y-2">
              <Label className="text-label-sm font-label-sm text-primary">Contract Content</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write the contract terms..." rows={12} className="rounded-xl bg-surface-container-low border-transparent font-mono text-sm" />
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-label-sm font-label-sm text-primary">PDF File</Label>
              <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileChange} className="block w-full text-label-sm font-label-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-label-sm file:font-label-sm file:bg-primary file:text-on-primary hover:file:bg-primary-container cursor-pointer" />
              {fileName && (
                <p className="text-label-sm font-label-sm text-secondary mt-1">{fileName} ({fileSize})</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-6">Cancel</Button>
            <Button type="submit" className="rounded-full px-6 bg-primary text-on-primary">Create Contract</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
