"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Upload, CheckCircle, FileText } from "lucide-react";
import { cities } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { createApplicationMe } from "@/lib/api";

interface ApplyDialogProps {
  jobTitle: string;
  jobId: string;
  fullWidth?: boolean;
}

export function ApplyDialog({ jobTitle, jobId, fullWidth }: ApplyDialogProps) {
  const { isLoggedIn, userType, user, getAuthHeaders, updateUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [city, setCity] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setFileName(f ? f.name : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isLoggedIn || userType !== "user" || !user?.id) {
      setError("Debes iniciar sesión como candidato para postularte.");
      return;
    }
    if (!city) {
      setError("Selecciona tu ciudad.");
      return;
    }
    if (!file) {
      setError("Selecciona tu CV (PDF, DOC o DOCX).");
      return;
    }
    setSending(true);
    try {
      const headers = getAuthHeaders();
      await createApplicationMe(
        headers,
        { jobId, userCity: city, message: messageRef.current?.value?.trim() || undefined },
        file
      );
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar postulación.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setFileName(null);
      setFile(null);
      setCity("");
      setError(null);
      setSending(false);
      if (fileRef.current) fileRef.current.value = "";
      if (messageRef.current) messageRef.current.value = "";
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={fullWidth ? "w-full" : ""}>
          <Send className="mr-2 h-4 w-4" />
          Postularme
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">¡Postulación Enviada!</h3>
            <p className="mt-2 text-muted-foreground">
              Tu postulación para {jobTitle} ha sido enviada correctamente.
              La empresa se pondrá en contacto contigo.
            </p>
            <Button onClick={handleClose} className="mt-6">
              Cerrar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Postularme a este empleo</DialogTitle>
              <DialogDescription>
                Envía tu CV para postularte a: <strong>{jobTitle}</strong>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userCity">Tu ciudad *</Label>
                <select
                  id="userCity"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                >
                  <option value="">Seleccionar ciudad</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cv">Curriculum Vitae (PDF, DOC o DOCX) *</Label>
                <div className="relative">
                  <input
                    id="cv"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    required
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileRef}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => fileRef.current?.click()}
                  >
                    {fileName ? (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        {fileName}
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Seleccionar archivo (PDF/DOC/DOCX)
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensaje (opcional)</Label>
                <Textarea
                  id="message"
                  ref={messageRef}
                  placeholder="Cuéntale a la empresa por qué eres el candidato ideal..."
                  rows={4}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!fileName || sending}>
                  <Send className="mr-2 h-4 w-4" />
                  {sending ? "Enviando..." : "Enviar Postulación"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
