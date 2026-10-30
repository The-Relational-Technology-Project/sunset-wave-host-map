import { useMemo, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { getClaims } from "@/lib/wave.functions";
import { getFaq, type FaqItem } from "@/lib/site.functions";
import { approveNote, assignHostLocation, getStewardData, lockSteward, saveFaq, stewardStatus, unlockSteward, type HostRow } from "@/lib/steward.functions";
import { hostEmail } from "@/lib/note-review";
import { blockLabel, DICTS, LANGS, type Lang } from "@/lib/i18n";
import { HOSTING_LOCATIONS, LOCATION_BY_ID, resolveStretch } from "@/lib/hosting-locations";
import { BlockMap } from "@/components/wave/BlockMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Internal steward tool: English-only by design (not visitor-facing).
export const Route = createFileRoute("/steward")({
  head: () => ({
    meta: [
      { title: "Steward — The Sunset Wave" },
      { name: "description", content: "Private steward tools for The Sunset Wave organizers." },
      { property: "og:title", content: "Steward — The Sunset Wave" },
      { property: "og:description", content: "Private steward tools for The Sunset Wave organizers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: async () => {
    const { unlocked } = await stewardStatus();
    if (!unlocked) return { unlocked: false as const };
    const [data, claims, faq] = await Promise.all([getStewardData(), getClaims(), getFaq()]);
    return { unlocked: true as const, data, claims, faq };
  },
  errorComponent: ({ error }) => <div role="alert" className="p-8">{error instanceof Error ? error.message : String(error)}</div>,
  notFoundComponent: () => <div className="p-8">Not found.</div>,
  component: Steward,
});

function Steward() {
  const d = Route.useLoaderData();
  if (!d.unlocked) return <Unlock />;
  return <Dashboard data={d.data} claims={d.claims} faq={d.faq} />;
}

function Unlock() {
  const router = useRouter();
  const unlock = useServerFn(unlockSteward);
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <main className="grain flex min-h-screen items-center justify-center bg-sand px-5">
      <form
        className="w-full max-w-sm space-y-4 rounded-2xl border-2 border-ink bg-card p-8 shadow-[6px_6px_0_var(--color-ink)]"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const password = String(new FormData(e.currentTarget).get("password") ?? "");
          const r = await unlock({ data: { password } });
          setBusy(false);
          if (r.ok) await router.invalidate();
          else setErr(true);
        }}
      >
        <h1 className="poster-title text-4xl text-ink">Steward</h1>
        <Input name="password" type="password" autoComplete="current-password" placeholder="Password" required />
        {err && <p className="text-sm text-destructive">That password didn't work.</p>}
        <Button type="submit" variant="poster" className="w-full" disabled={busy}>Enter</Button>
      </form>
    </main>
  );
}

type Data = Awaited<ReturnType<typeof getStewardData>>;

function csv(rows: (string | number | boolean | null)[][]) {
  return rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
}
function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob(["\ufeff" + text], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function Dashboard({ data, claims, faq }: { data: Data; claims: Awaited<ReturnType<typeof getClaims>>; faq: Awaited<ReturnType<typeof getFaq>> }) {
  const router = useRouter();
  const lock = useServerFn(lockSteward);
  return (
    <main className="min-h-screen bg-sand">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="poster-title text-4xl text-ink md:text-5xl">Steward</h1>
          <Button variant="outline" onClick={async () => { await lock(); await router.invalidate(); }}>Lock</Button>
        </div>
        <Tabs defaultValue="hosts" className="mt-6">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="hosts">Hosts ({data.hosts.length})</TabsTrigger>
            <TabsTrigger value="notes">Notes ({data.notes.length})</TabsTrigger>
            <TabsTrigger value="contacts">Contact ({data.contacts.length})</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>
          <TabsContent value="hosts"><Hosts hosts={data.hosts} /></TabsContent>
          <TabsContent value="notes"><Notes notes={data.notes} hosts={data.hosts} /></TabsContent>
          <TabsContent value="contacts">
            <div className="overflow-x-auto rounded-lg border-2 border-ink bg-card">
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Organization</TableHead><TableHead>Message</TableHead><TableHead>Language</TableHead></TableRow></TableHeader>
                <TableBody>{data.contacts.map(c => <TableRow key={c.id}><TableCell className="whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</TableCell><TableCell>{c.name}</TableCell><TableCell>{c.email}</TableCell><TableCell>{c.organization}</TableCell><TableCell className="min-w-64 whitespace-pre-wrap">{c.message}</TableCell><TableCell>{c.language}</TableCell></TableRow>)}{!data.contacts.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No contact inquiries yet.</TableCell></TableRow>}</TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="map">
            <p className="mb-3 text-sm text-muted-foreground">{claims.hostCount} hosts · {Object.keys(claims.claimed).length} blocks claimed</p>
            <BlockMap claimed={claims.claimed} onPick={() => {}} />
          </TabsContent>
          <TabsContent value="traffic"><TrafficView t={data.traffic} /></TabsContent>
          <TabsContent value="faq"><FaqEditor faq={faq} /></TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function yn(b: boolean) { return b ? "Yes" : ""; }

function Hosts({ hosts }: { hosts: HostRow[] }) {
  const [q, setQ] = useState("");
  const [flag, setFlag] = useState<"all" | "microgrant" | "give" | "sheltered" | "cohosts" | "unmapped">("all");
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return hosts.filter((h) => {
      if (flag === "unmapped" && h.block_id) return false;
      if (flag === "microgrant" && !h.wants_microgrant) return false;
      if (flag === "give" && !h.can_give) return false;
      if (flag === "sheltered" && !h.sheltered) return false;
      if (flag === "cohosts" && !h.cohosts?.length) return false;
      if (!s) return true;
      return [h.name, h.contact, h.stretch_text, h.block_id ?? "", ...(h.cohosts ?? []).map((c) => `${c.name} ${c.contact}`)]
        .join(" ").toLowerCase().includes(s);
    });
  }, [hosts, q, flag]);
  const date = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const exportHosts = () => download("hosts.csv", csv([
    ["Signed up", "Name", "Contact", "Stretch", "Block id", "Co-hosts", "Wants support", "Can give", "Sheltered", "Language"],
    ...rows.map((h) => [h.created_at, h.name, h.contact, h.stretch_text, h.block_id, (h.cohosts ?? []).map((c) => `${c.name} (${c.contact})`).join("; "), yn(h.wants_microgrant), yn(h.can_give), yn(h.sheltered), h.language]),
  ]));
  const exportCohosts = () => download("cohosts.csv", csv([
    ["Co-host name", "Co-host contact", "Host", "Host contact", "Stretch"],
    ...rows.flatMap((h) => (h.cohosts ?? []).map((c) => [c.name, c.contact, h.name, h.contact, h.stretch_text])),
  ]));
  const exportEveryone = () => download("hosts-and-cohosts.csv", csv([
    ["Name", "Contact", "Role", "Stretch"],
    ...rows.flatMap((h) => [[h.name, h.contact, "Host", h.stretch_text], ...(h.cohosts ?? []).map((c) => [c.name, c.contact, `Co-host with ${h.name}`, h.stretch_text])]),
  ]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input className="max-w-xs bg-card" placeholder="Search name, contact, street…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="h-10 rounded-md border bg-card px-3 text-sm" value={flag} onChange={(e) => setFlag(e.target.value as typeof flag)}>
          <option value="all">All hosts</option>
          <option value="unmapped">Needs map location</option>
          <option value="cohosts">Has co-hosts</option>
          <option value="microgrant">Wants support</option>
          <option value="give">Can give</option>
          <option value="sheltered">Sheltered spot</option>
        </select>
        <span className="text-sm text-muted-foreground">{rows.length} shown</span>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={exportHosts}>Export hosts</Button>
          <Button size="sm" variant="outline" onClick={exportCohosts}>Export co-hosts</Button>
          <Button size="sm" variant="outline" onClick={exportEveryone}>Export everyone</Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border-2 border-ink bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead><TableHead>Name</TableHead><TableHead>Contact</TableHead><TableHead>Stretch / map location</TableHead>
              <TableHead>Co-hosts</TableHead><TableHead>Support</TableHead><TableHead>Give</TableHead><TableHead>Sheltered</TableHead><TableHead>Lang</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="whitespace-nowrap">{date(h.created_at)}</TableCell>
                <TableCell className="font-semibold">{h.name}</TableCell>
                <TableCell>{h.contact}</TableCell>
                <TableCell className="min-w-64"><p>{h.stretch_text}</p><HostLocationReview host={h} /></TableCell>
                <TableCell className="min-w-40">{(h.cohosts ?? []).map((c) => `${c.name}${c.contact ? ` (${c.contact})` : ""}`).join(", ")}</TableCell>
                <TableCell>{yn(h.wants_microgrant)}</TableCell>
                <TableCell>{yn(h.can_give)}</TableCell>
                <TableCell>{yn(h.sheltered)}</TableCell>
                <TableCell>{h.language}</TableCell>
              </TableRow>
            ))}
            {!rows.length && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">No hosts yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function HostLocationReview({ host }: { host: HostRow }) {
  const router = useRouter();
  const save = useServerFn(assignHostLocation);
  const match = useMemo(() => resolveStretch(host.stretch_text), [host.stretch_text]);
  const [id, setId] = useState(match.candidates[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const assigned = host.block_id ? LOCATION_BY_ID.get(host.block_id) : undefined;
  if (host.block_id) return <p className="mt-1 text-xs text-ocean">Mapped · {assigned ? blockLabel("en", assigned.avenue, assigned.north, assigned.south) : host.block_id}</p>;
  const options = HOSTING_LOCATIONS.filter((b) => b.id === id || blockLabel("en", b.avenue, b.north, b.south).toLowerCase().includes(search.toLowerCase()));
  return <div className="mt-2 space-y-2">
    <p className="text-xs text-destructive">{match.status === "outside" ? "Outside coverage / needs clarification" : "Needs location review"}</p>
    <Input aria-label={`Find location for ${host.name}`} placeholder="Search eligible street or avenue" value={search} onChange={(e) => setSearch(e.target.value)} />
    <select aria-label={`Location for ${host.name}`} className="h-10 w-full max-w-xs rounded-md border bg-card text-sm" value={id} onChange={(e) => setId(e.target.value)}>
      <option value="">Choose location</option>
      {options.map((b) => <option key={b.id} value={b.id}>{blockLabel("en", b.avenue, b.north, b.south)}</option>)}
    </select>
    <Button size="sm" variant="outline" disabled={!id || busy} onClick={async () => {
      if (!window.confirm(`Confirm map location for ${host.name}? Their original description will be preserved.`)) return;
      setBusy(true);
      try { await save({ data: { hostId: host.id, blockId: id } }); await router.invalidate(); }
      catch (error) { toast.error(error instanceof Error ? error.message : "Could not save location"); }
      finally { setBusy(false); }
    }}>Confirm location</Button>
  </div>;
}

function Notes({ notes, hosts }: { notes: Data["notes"]; hosts: HostRow[] }) {
  const router = useRouter();
  const approve = useServerFn(approveNote);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <Button size="sm" variant="outline" onClick={() => download("notes.csv", csv([["Sent", "Block id", "Name", "Contact", "Message", "Language"], ...notes.map((n) => [n.created_at, n.block_id, n.name, n.contact, n.message, n.language])]))}>Export notes</Button>
      <div className="overflow-x-auto rounded-xl border-2 border-ink bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Block</TableHead><TableHead>From</TableHead><TableHead>Contact</TableHead><TableHead>Message</TableHead><TableHead>Review</TableHead></TableRow></TableHeader>
          <TableBody>
            {notes.map((n) => (
              <TableRow key={n.id}>
                <TableCell className="whitespace-nowrap">{new Date(n.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{n.block_id}</TableCell><TableCell>{n.name}</TableCell><TableCell>{n.contact}</TableCell>
                <TableCell className="min-w-64">{n.message}</TableCell>
                <TableCell className="min-w-64 space-y-2">
                  <p className="text-sm font-semibold">{n.review_status === "sent" ? "Sent to host" : n.review_status === "suppressed" ? "Recipient blocked — contact manually" : n.review_status === "sending" ? "Sending / awaiting confirmation" : n.review_status === "failed" ? "Send not confirmed — retry after five minutes" : "Awaiting review"}</p>
                  {n.review_status !== "sent" && n.review_status !== "suppressed" && <>
                    <select aria-label={`Host recipient for ${n.name}`} className="h-10 w-full rounded-md border bg-card px-2 text-sm" value={n.reviewed_host_id ?? selected[n.id] ?? ""} disabled={Boolean(n.reviewed_host_id)} onChange={e => setSelected(s => ({ ...s, [n.id]: e.target.value }))}>
                      <option value="">Choose host to receive note</option>
                      {hosts.filter(h => h.block_id === n.block_id).map(h => <option key={h.id} value={h.id} disabled={!hostEmail(h.contact)}>{h.name} — {h.contact}{!hostEmail(h.contact) ? " (manual contact only)" : ""}</option>)}
                    </select>
                    {!hosts.some(h => h.block_id === n.block_id && hostEmail(h.contact)) && <p className="text-xs text-muted-foreground">No host email available. Pass this note along manually.</p>}
                    <Button size="sm" variant="poster" disabled={busy !== null || !(n.reviewed_host_id ?? selected[n.id])} onClick={async () => {
                      const hostId = n.reviewed_host_id ?? selected[n.id];
                      const host = hosts.find(h => h.id === hostId);
                      if (!hostId || !host) return;
                      if (!window.confirm(`Approve and email this note, including ${n.name}'s message and contact details, to ${host.name} (${host.contact})?`)) return;
                      setBusy(n.id);
                      try {
                        const result = await approve({ data: { noteId: n.id, hostId } });
                        if (result.status === "sent") toast.success("Note sent to host");
                        else toast.error("This recipient cannot receive app emails. Please contact them manually.");
                      } catch (e) { toast.error(e instanceof Error ? e.message : "Could not send note."); }
                      finally { setBusy(null); await router.invalidate(); }
                    }}>{busy === n.id ? "Sending…" : n.review_status === "pending" ? "Approve & send" : "Retry approved send"}</Button>
                  </>}
                </TableCell>
              </TableRow>
            ))}
            {!notes.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No notes yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TrafficView({ t }: { t: Data["traffic"] }) {
  const max = Math.max(1, ...t.daily.map((d) => d.visitors));
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border-2 border-ink bg-card p-5">
        <p className="text-sm text-muted-foreground">Past 7 days</p>
        <p className="mt-1 text-3xl font-bold text-ink">{t.visitors} visitors</p>
        <p className="text-sm text-muted-foreground">{t.views} page views</p>
        <div className="mt-5 flex h-32 items-end gap-2">
          {t.daily.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs">{d.visitors}</span>
              <div className="w-full rounded-t bg-primary" style={{ height: `${(d.visitors / max) * 90}px` }} />
              <span className="text-[10px] text-muted-foreground">{new Date(d.day + "T12:00").toLocaleDateString("en-US", { weekday: "short" })}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border-2 border-ink bg-card p-5">
        <p className="font-semibold text-ink">Where visitors came from</p>
        <ul className="mt-3 space-y-2">
          {t.sources.map((s) => (
            <li key={s.source} className="flex justify-between border-b border-ink/10 pb-1 text-sm"><span>{s.source}</span><span className="font-semibold">{s.visitors}</span></li>
          ))}
          {!t.sources.length && <li className="text-sm text-muted-foreground">No visits recorded yet.</li>}
        </ul>
      </div>
    </div>
  );
}

function FaqEditor({ faq }: { faq: Awaited<ReturnType<typeof getFaq>> }) {
  const router = useRouter();
  const save = useServerFn(saveFaq);
  const [lang, setLang] = useState<Lang>("en");
  const initial = (l: Lang): FaqItem[] => (faq[l] ?? DICTS[l].faq.items).map((i) => ({ ...i }));
  const [drafts, setDrafts] = useState<Record<Lang, FaqItem[]>>(() => ({ en: initial("en"), zh: initial("zh"), yue: initial("yue"), es: initial("es") }));
  const [busy, setBusy] = useState(false);
  const items = drafts[lang];
  const set = (next: FaqItem[]) => setDrafts((d) => ({ ...d, [lang]: next }));
  const update = (i: number, k: keyof FaqItem, v: string) => set(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= items.length) return;
    const n = [...items]; const a = n[i]!; n[i] = n[j]!; n[j] = a; set(n);
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {LANGS.map((l) => (
          <Button key={l.code} size="sm" variant={l.code === lang ? "default" : "outline"} onClick={() => setLang(l.code)}>{l.label}</Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Each language is saved separately. Edits show on the main site after saving.</p>
      {items.map((it, i) => (
        <div key={i} className="space-y-2 rounded-xl border-2 border-ink bg-card p-4">
          <Input value={it.q} onChange={(e) => update(i, "q", e.target.value)} className="font-semibold" />
          <Textarea value={it.a} onChange={(e) => update(i, "a", e.target.value)} rows={3} />
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => move(i, -1)}>Up</Button>
            <Button size="sm" variant="ghost" onClick={() => move(i, 1)}>Down</Button>
            <Button size="sm" variant="ghost" className="ml-auto text-destructive" onClick={() => set(items.filter((_, j) => j !== i))}>Remove</Button>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => set([...items, { q: "New question", a: "Answer" }])}>Add question</Button>
        <Button
          variant="poster" disabled={busy}
          onClick={async () => {
            const clean = items.filter((i) => i.q.trim() && i.a.trim());
            if (!clean.length) { toast.error("Add at least one question."); return; }
            setBusy(true);
            try { await save({ data: { language: lang, items: clean } }); toast.success("FAQ saved"); await router.invalidate(); }
            catch { toast.error("Couldn't save. Try again."); }
            finally { setBusy(false); }
          }}
        >Save {LANGS.find((l) => l.code === lang)?.label}</Button>
      </div>
    </div>
  );
}
