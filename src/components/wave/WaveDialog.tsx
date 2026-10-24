import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { blockLabel, fill, joinNames, useLang } from "@/lib/i18n";
import type { Block } from "@/lib/blocks";
import { submitHost, submitNote } from "@/lib/wave.functions";
import { WaveHand } from "./WaveHand";

export type DialogState =
  | { mode: "closed" }
  | { mode: "block"; block: Block; names: string[] }
  | { mode: "host"; block: Block | null }
  | { mode: "note"; block: Block; names: string[] };

export function WaveDialog({ state, setState }: { state: DialogState; setState: (s: DialogState) => void }) {
  const open = state.mode !== "closed";
  return (
    <Dialog open={open} onOpenChange={(o) => !o && setState({ mode: "closed" })}>
      <DialogContent className="grain h-[100dvh] max-h-[100dvh] max-w-lg overflow-y-auto rounded-none border-2 border-ink bg-card sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:shadow-poster">
        {state.mode === "block" && <BlockInfo state={state} setState={setState} />}
        {state.mode === "host" && <HostForm block={state.block} onClose={() => setState({ mode: "closed" })} />}
        {state.mode === "note" && <NoteForm block={state.block} names={state.names} onClose={() => setState({ mode: "closed" })} />}
      </DialogContent>
    </Dialog>
  );
}

function BlockInfo({ state, setState }: { state: Extract<DialogState, { mode: "block" }>; setState: (s: DialogState) => void }) {
  const { t, lang } = useLang();
  const { block, names } = state;
  const claimed = names.length > 0;
  return (
    <div className="relative space-y-5 pt-6">
      <p className="font-hand text-2xl text-ocean">{blockLabel(lang, block.avenue, block.north, block.south)}</p>
      <DialogHeader>
        <DialogTitle className="poster-title text-4xl">
          {claimed ? fill(t.map.claimedTitle, { names: joinNames(lang, names) }) : t.map.openTitle}
        </DialogTitle>
        <DialogDescription className="text-base text-muted-foreground">{claimed ? t.map.claimedSub : t.map.openSub}</DialogDescription>
      </DialogHeader>
      {claimed && <WaveHand className="animate-wiggle mx-auto h-24 w-24" />}
      <div className="flex flex-col gap-3">
        {claimed ? (
          <>
            <Button variant="poster" size="xl" onClick={() => setState({ mode: "note", block, names })}>{t.map.sendNote}</Button>
            <Button variant="posterAlt" size="xl" onClick={() => setState({ mode: "host", block })}>{t.map.cohost}</Button>
          </>
        ) : (
          <Button variant="poster" size="xl" onClick={() => setState({ mode: "host", block })}>{t.map.take}</Button>
        )}
      </div>
    </div>
  );
}

function Field({ id, label, error, children, hint }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-semibold">{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

function Success({ title, body, onClose }: { title: string; body: string; onClose: () => void }) {
  const { t } = useLang();
  return (
    <div className="space-y-5 py-10 text-center">
      <WaveHand className="animate-wave-pop mx-auto h-28 w-28" />
      <DialogTitle className="poster-title text-4xl">{title}</DialogTitle>
      <DialogDescription className="text-base">{body}</DialogDescription>
      <Button variant="poster" size="xl" onClick={onClose}>{t.host.close}</Button>
    </div>
  );
}

const inputCls = "h-12 border-2 border-ink/30 bg-background text-base focus-visible:border-ink";

function HostForm({ block, onClose }: { block: Block | null; onClose: () => void }) {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const send = useServerFn(submitHost);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [stretch, setStretch] = useState("");
  const [cohosts, setCohosts] = useState<{ name: string; contact: string }[]>([]);
  const [grant, setGrant] = useState(false);
  const [give, setGive] = useState(false);
  const [hp, setHp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (block) setStretch(blockLabel("en", block.avenue, block.north, block.south));
  }, [block]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t.host.errName;
    if (contact.trim().length < 3) errs.contact = t.host.errContact;
    if (stretch.trim().length < 2) errs.stretch = t.host.errStretch;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await send({
        data: {
          blockId: block?.id ?? null,
          stretch,
          name,
          contact,
          cohosts: cohosts.filter((c) => c.name.trim()),
          wantsMicrogrant: grant,
          canGive: give,
          language: lang,
          ...(hp ? { website: hp } : {}),
        },
      });
      await qc.invalidateQueries({ queryKey: ["claims"] });
      setDone(true);
    } catch {
      setErrors({ form: t.host.errGeneric });
    } finally {
      setBusy(false);
    }
  }

  if (done) return <Success title={t.host.okTitle} body={t.host.okBody} onClose={onClose} />;

  return (
    <form onSubmit={onSubmit} className="space-y-5 pt-6" noValidate>
      <DialogHeader>
        <DialogTitle className="poster-title text-5xl">{t.host.title}</DialogTitle>
        <DialogDescription className="text-base">{t.host.sub}</DialogDescription>
      </DialogHeader>
      <Field id="h-name" label={t.host.name} error={errors.name}>
        <Input id="h-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className={inputCls} />
      </Field>
      <Field id="h-contact" label={t.host.contact} error={errors.contact}>
        <Input id="h-contact" autoComplete="email" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={200} className={inputCls} />
      </Field>
      <Field id="h-stretch" label={t.host.stretch} error={errors.stretch} hint={t.host.stretchHint}>
        <Input id="h-stretch" value={stretch} placeholder={t.host.stretchPh} onChange={(e) => setStretch(e.target.value)} maxLength={200} className={inputCls} />
      </Field>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">{t.host.cohosts}</legend>
        {cohosts.map((c, i) => (
          <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-xl border border-ink/20 p-3">
            <div className="min-w-0 space-y-2">
              <Input aria-label={t.host.cohostName} placeholder={t.host.cohostName} value={c.name} maxLength={100}
                onChange={(e) => setCohosts(cohosts.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className={inputCls} />
              <Input aria-label={t.host.cohostContact} placeholder={t.host.cohostContact} value={c.contact} maxLength={200}
                onChange={(e) => setCohosts(cohosts.map((x, j) => (j === i ? { ...x, contact: e.target.value } : x)))} className={inputCls} />
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setCohosts(cohosts.filter((_, j) => j !== i))}>{t.host.remove}</Button>
          </div>
        ))}
        {cohosts.length < 3 && (
          <Button type="button" variant="posterAlt" size="sm" className="h-10 px-4" onClick={() => setCohosts([...cohosts, { name: "", contact: "" }])}>
            + {t.host.addCohost}
          </Button>
        )}
      </fieldset>

      <div className="space-y-3 rounded-xl bg-muted p-4">
        <label className="flex items-start gap-3 text-sm">
          <Checkbox checked={grant} onCheckedChange={(v) => setGrant(v === true)} className="mt-0.5" />
          <span>{t.host.microgrant}</span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <Checkbox checked={give} onCheckedChange={(v) => setGive(v === true)} className="mt-0.5" />
          <span>{t.host.give}</span>
        </label>
      </div>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />
      {errors.form && <p className="text-sm font-medium text-destructive">{errors.form}</p>}
      <Button type="submit" variant="poster" size="xl" className="w-full" disabled={busy}>
        <WaveHand className="h-7 w-7" /> {busy ? t.host.sending : t.host.submit}
      </Button>
    </form>
  );
}

function NoteForm({ block, names, onClose }: { block: Block; names: string[]; onClose: () => void }) {
  const { t, lang } = useLang();
  const send = useServerFn(submitNote);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t.host.errName;
    if (contact.trim().length < 3) errs.contact = t.host.errContact;
    if (!message.trim()) errs.message = t.note.errMessage;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await send({ data: { blockId: block.id, name, contact, message, language: lang, ...(hp ? { website: hp } : {}) } });
      setDone(true);
    } catch {
      setErrors({ form: t.host.errGeneric });
    } finally {
      setBusy(false);
    }
  }

  if (done) return <Success title={t.note.okTitle} body={t.note.okBody} onClose={onClose} />;

  return (
    <form onSubmit={onSubmit} className="space-y-5 pt-6" noValidate>
      <p className="font-hand text-2xl text-ocean">
        {blockLabel(lang, block.avenue, block.north, block.south)} · {joinNames(lang, names)}
      </p>
      <DialogHeader>
        <DialogTitle className="poster-title text-4xl">{t.note.title}</DialogTitle>
        <DialogDescription className="text-base">{t.note.sub}</DialogDescription>
      </DialogHeader>
      <Field id="n-name" label={t.note.name} error={errors.name}>
        <Input id="n-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className={inputCls} />
      </Field>
      <Field id="n-contact" label={t.note.contact} error={errors.contact}>
        <Input id="n-contact" autoComplete="email" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={200} className={inputCls} />
      </Field>
      <Field id="n-msg" label={t.note.message} error={errors.message}>
        <Textarea id="n-msg" rows={4} value={message} placeholder={t.note.messagePh} onChange={(e) => setMessage(e.target.value)} maxLength={1500} className="border-2 border-ink/30 bg-background text-base" />
      </Field>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />
      {errors.form && <p className="text-sm font-medium text-destructive">{errors.form}</p>}
      <Button type="submit" variant="poster" size="xl" className="w-full" disabled={busy}>
        {busy ? t.host.sending : t.note.submit}
      </Button>
    </form>
  );
}
