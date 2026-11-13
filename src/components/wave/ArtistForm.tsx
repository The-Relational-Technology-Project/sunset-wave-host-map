import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Plus, Upload, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { artistSchema, artistFormFields, ARTIST_MIMES, MAX_ADDITIONAL_ARTIST_LINKS, validArtistFiles } from "@/lib/artist-schema";
import { submitArtist } from "@/lib/artist.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WaveHand } from "./WaveHand";

export function ArtistForm() {
  const { t, lang } = useLang();
  const copy = t.artists;
  const send = useServerFn(submitArtist);
  const picker = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [extraLinks, setExtraLinks] = useState<number[]>([]);
  const nextLinkId = useRef(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  if (done) return <div role="status" className="flex items-start gap-3 border-y-2 border-ink/20 py-8"><Check className="mt-1 h-6 w-6 shrink-0 text-ocean" /><p>{copy.success}</p></div>;
  return <form className="space-y-6 border-t-2 border-ink/20 pt-8 text-base" onSubmit={async e => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    form.set("language", lang);
    const parsed = artistSchema.safeParse(artistFormFields(form));
    if (!parsed.success) { setError(copy.invalid); return; }
    if (!validArtistFiles(files)) { setError(copy.fileError); return; }
    files.forEach(file => form.append("files", file));
    setBusy(true); setError("");
    try { await send({ data: form }); setDone(true); }
    catch { setError(copy.error); }
    finally { setBusy(false); }
  }}>
    <div className="space-y-2"><Label htmlFor="artist-name">{copy.name} <span aria-hidden="true" className="text-destructive">*</span></Label><Input id="artist-name" name="name" autoComplete="name" required maxLength={100} disabled={busy} className="h-12 bg-card text-base" /></div>
    <div className="space-y-2"><Label htmlFor="artist-contact">{copy.contact} <span aria-hidden="true" className="text-destructive">*</span></Label><Input id="artist-contact" name="contact" required minLength={3} maxLength={200} disabled={busy} aria-describedby="artist-contact-hint" className="h-12 bg-card text-base" /><p id="artist-contact-hint" className="text-sm text-muted-foreground">{copy.contactHint}</p></div>
    <div className="space-y-2"><Label htmlFor="artist-note">{copy.note}</Label><p id="artist-note-hint" className="text-sm text-muted-foreground">{copy.noteHint}</p><Textarea id="artist-note" name="note" maxLength={1000} rows={3} disabled={busy} aria-describedby="artist-note-hint" className="bg-card text-base" /></div>
    <fieldset className="min-w-0 space-y-4 border-t border-ink/20 pt-5">
      <legend className="px-2 font-semibold text-ocean">{copy.work}</legend>
      <p className="text-sm text-muted-foreground">{copy.workHint}</p>
      <p className="text-sm font-medium text-ocean">{copy.workSampleNote}</p>
      <div className="space-y-2"><Label htmlFor="artist-link">{copy.link}</Label><Input id="artist-link" name="workLink" type="url" placeholder="https://" maxLength={2000} disabled={busy} className="h-12 bg-card text-base" /></div>
       {extraLinks.map((id, i) => <div key={id} className="space-y-2">
         <Label htmlFor={`artist-link-${id}`}>{copy.link} {i + 2}</Label>
         <div className="flex min-w-0 items-center gap-2">
           <Input id={`artist-link-${id}`} name="additionalWorkLinks" type="url" placeholder="https://" maxLength={2000} disabled={busy} className="h-12 min-w-0 flex-1 bg-card text-base" />
           <Button type="button" size="icon" variant="ghost" title={copy.removeLink} aria-label={`${copy.removeLink} ${i + 2}`} disabled={busy} onClick={() => setExtraLinks(links => links.filter(linkId => linkId !== id))}><X className="h-4 w-4" /></Button>
         </div>
       </div>)}
       <Button type="button" variant="ghost" disabled={busy || extraLinks.length >= MAX_ADDITIONAL_ARTIST_LINKS} onClick={() => { const id = nextLinkId.current++; setExtraLinks(links => [...links, id]); }} className="h-auto min-h-12 max-w-full whitespace-normal"><Plus className="h-4 w-4 shrink-0" />{copy.addLink}</Button>
      <div className="space-y-2">
        <input ref={picker} type="file" multiple accept={ARTIST_MIMES.join(",")} aria-label={copy.upload} className="hidden" onChange={e => {
          const next = [...files, ...Array.from(e.target.files ?? [])];
          if (!validArtistFiles(next)) setError(copy.fileError);
          else { setFiles(next); setError(""); }
          e.target.value = "";
        }} />
        <Button type="button" variant="posterAlt" disabled={busy || files.length >= 4} onClick={() => picker.current?.click()} className="h-auto min-h-12 max-w-full whitespace-normal"><Upload className="h-4 w-4 shrink-0" />{copy.upload}</Button>
        <p className="text-xs text-muted-foreground">{copy.fileHint}</p>
        {files.length > 0 && <ul className="divide-y divide-border">{files.map((file, i) => <li key={`${file.name}-${i}`} className="flex min-w-0 items-center gap-2 py-2"><span className="min-w-0 flex-1 break-all text-sm">{file.name}</span><Button type="button" size="icon" variant="ghost" title={copy.remove} aria-label={`${copy.remove}: ${file.name}`} disabled={busy} onClick={() => setFiles(files.filter((_, j) => j !== i))}><X className="h-4 w-4" /></Button></li>)}</ul>}
      </div>
    </fieldset>
    <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true"><input name="website" type="text" tabIndex={-1} autoComplete="off" maxLength={500} disabled={busy} /></div>
    <p className="text-sm text-muted-foreground">{copy.privacy}</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" variant="poster" disabled={busy} className="h-auto min-h-14 w-full whitespace-normal"><WaveHand className="h-6 w-6 shrink-0" />{busy ? t.host.sending : copy.submit}</Button>
  </form>;
}