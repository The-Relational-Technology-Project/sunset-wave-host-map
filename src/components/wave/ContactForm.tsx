import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, Check } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { contactSchema } from "@/lib/contact-schema";
import { submitContact } from "@/lib/contact.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const { t, lang } = useLang();
  const send = useServerFn(submitContact);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  if (done) return <div role="status" className="flex items-start gap-3 border-y-2 border-ink/20 py-8"><Check className="mt-1 h-6 w-6 shrink-0 text-ocean" /><p>{t.contactForm.success}</p></div>;
  return (
    <form className="space-y-5 border-t-2 border-ink/20 pt-8" onSubmit={async e => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      const result = contactSchema.safeParse({ name: form.get("name"), email: form.get("email"), organization: form.get("organization"), message: form.get("message"), website: form.get("website"), language: lang });
      if (!result.success) { setError(t.contactForm.invalid); return; }
      setBusy(true); setError("");
      try { await send({ data: result.data }); setDone(true); }
      catch { setError(t.contactForm.error); }
      finally { setBusy(false); }
    }}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="contact-name">{t.contactForm.name} <span aria-hidden="true" className="text-destructive">*</span></Label><Input id="contact-name" name="name" autoComplete="name" required maxLength={100} className="bg-card" /></div>
        <div className="space-y-2"><Label htmlFor="contact-email">{t.contactForm.email} <span aria-hidden="true" className="text-destructive">*</span></Label><Input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={255} className="bg-card" /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="contact-organization">{t.contactForm.organization}</Label><Input id="contact-organization" name="organization" autoComplete="organization" maxLength={150} className="bg-card" /></div>
      <div className="space-y-2"><Label htmlFor="contact-message">{t.contactForm.message} <span aria-hidden="true" className="text-destructive">*</span></Label><Textarea id="contact-message" name="message" required maxLength={3000} rows={6} className="bg-card" /></div>
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" maxLength={500} /></div>
      <p className="text-sm text-muted-foreground">{t.contactForm.privacy}</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button variant="poster" type="submit" disabled={busy} className="h-auto min-h-12 whitespace-normal"><Send className="h-4 w-4 shrink-0" />{busy ? t.host.sending : t.contactForm.submit}</Button>
    </form>
  );
}