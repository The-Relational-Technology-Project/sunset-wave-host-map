// Pure duplicate detection + merge planning for host signups (steward-reviewed).
export type DupHost = {
  id: string; created_at: string; name: string; contact: string; stretch_text: string; block_id: string | null;
  cohosts: { name: string; contact: string }[]; wants_microgrant: boolean; can_give: boolean; sheltered: boolean;
  merged_into?: string | null;
};

export function contactParts(contact: string): string[] {
  return contact.split(/\s*[;,/|]\s*|\s+(?:or|and|\/)\s+/i).map((s) => s.trim()).filter(Boolean);
}
export function contactKey(part: string) {
  const p = part.trim().toLowerCase();
  if (p.includes("@")) return p;
  const digits = p.replace(/\D/g, "");
  return digits.length >= 7 ? digits.slice(-10) : p;
}
const nameKey = (n: string) => n.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const stretchKey = (s: string) => s.normalize("NFKC").toLowerCase()
  .replace(/(\d+)\s*(st|nd|rd|th)\b/g, "$1").replace(/\b(avenue|ave|street|st|between|and|&)\b/g, " ")
  .replace(/[^\p{L}\p{N}]+/gu, " ").trim().split(" ").sort().join(" ");

function namesSimilar(a: string, b: string) {
  const x = nameKey(a), y = nameKey(b);
  if (!x || !y) return false;
  return x === y || x.startsWith(y + " ") || y.startsWith(x + " ");
}
function sameContact(a: DupHost, b: DupHost) {
  const keys = new Set(contactParts(a.contact).map(contactKey));
  return contactParts(b.contact).some((p) => keys.has(contactKey(p)));
}
function sameLocation(a: DupHost, b: DupHost) {
  return (a.block_id && a.block_id === b.block_id) || stretchKey(a.stretch_text) === stretchKey(b.stretch_text);
}

/** Obvious duplicates: shared contact method, or similar name at the same location. */
export function isDuplicate(a: DupHost, b: DupHost) {
  return sameContact(a, b) || (namesSimilar(a.name, b.name) && Boolean(sameLocation(a, b)));
}

export function duplicateGroups<T extends DupHost>(hosts: T[]): T[][] {
  const active = hosts.filter((h) => !h.merged_into);
  const seen = new Set<string>();
  const groups: T[][] = [];
  for (const h of active) {
    if (seen.has(h.id)) continue;
    const group = [h]; seen.add(h.id);
    for (let i = 0; i < group.length; i++) for (const o of active) {
      if (!seen.has(o.id) && isDuplicate(group[i]!, o)) { group.push(o); seen.add(o.id); }
    }
    if (group.length > 1) groups.push(group.sort((a, b) => b.created_at.localeCompare(a.created_at)));
  }
  return groups;
}

/** Keeper = latest signup (its location wins). Longest name, every distinct contact method, all co-hosts. */
export function mergePlan<T extends DupHost>(group: T[]) {
  const sorted = [...group].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const keeper = sorted[0]!;
  const name = sorted.map((h) => h.name.trim()).reduce((a, b) => (b.length > a.length ? b : a));
  const contacts: string[] = []; const keys = new Set<string>();
  for (const h of sorted) for (const p of contactParts(h.contact)) {
    const k = contactKey(p); if (!keys.has(k)) { keys.add(k); contacts.push(p); }
  }
  const cohostKeys = new Set<string>();
  const cohosts = sorted.flatMap((h) => h.cohosts ?? []).filter((c) => {
    const k = nameKey(c.name) + "|" + contactKey(c.contact || "");
    if (cohostKeys.has(k)) return false; cohostKeys.add(k); return true;
  }).slice(0, 3);
  return {
    keeperId: keeper.id,
    duplicateIds: sorted.slice(1).map((h) => h.id),
    update: {
      name: name.slice(0, 100), contact: contacts.join("; ").slice(0, 200), cohosts,
      block_id: keeper.block_id ?? sorted.find((h) => h.block_id)?.block_id ?? null,
      wants_microgrant: sorted.some((h) => h.wants_microgrant),
      can_give: sorted.some((h) => h.can_give),
      sheltered: sorted.some((h) => h.sheltered),
    },
  };
}
