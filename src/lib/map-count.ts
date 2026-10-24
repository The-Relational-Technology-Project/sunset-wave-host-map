// Hosts trigger the milestone; the map count still represents claimed blocks.
export function shouldShowMapCount(hostCount: number): boolean {
  return hostCount >= 20;
}