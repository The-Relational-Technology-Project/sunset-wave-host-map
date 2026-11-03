type MapHost = { name: string; block_id: string | null; merged_into?: string | null };

export function stewardMapNames(hosts: MapHost[]): Record<string, string[]> {
  const names: Record<string, string[]> = {};
  for (const host of hosts) {
    if (!host.block_id || host.merged_into) continue;
    const firstName = host.name.trim().split(/\s+/)[0];
    if (!firstName) continue;
    (names[host.block_id] ??= []).push(firstName);
  }
  return names;
}