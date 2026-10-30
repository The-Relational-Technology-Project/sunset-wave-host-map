import { describe, expect, it } from "vitest";
import { duplicateGroups, mergePlan, type DupHost } from "./host-duplicates";
import { hostEmail } from "./note-review";

const h = (p: Partial<DupHost>): DupHost => ({ id: "x", created_at: "2026-10-01", name: "A", contact: "a@x.com", stretch_text: "", block_id: null, cohosts: [], wants_microgrant: false, can_give: false, sheltered: false, ...p });

describe("host duplicates", () => {
  it("groups by shared contact and by similar name at the same location", () => {
    const g = duplicateGroups([
      h({ id: "1", name: "Renee", contact: "RENEE@x.com" }),
      h({ id: "2", name: "Renee K", contact: "renee@x.com" }),
      h({ id: "3", name: "Sam", contact: "415-555-1234", block_id: "b1" }),
      h({ id: "4", name: "sam", contact: "s@y.com", block_id: "b1" }),
      h({ id: "5", name: "Sam", contact: "other@y.com", block_id: "b9" }),
    ]);
    expect(g.map((x) => x.map((y) => y.id).sort())).toEqual([["1", "2"], ["3", "4"]]);
  });
  it("keeps the longest name, the latest location and every contact method", () => {
    const p = mergePlan([
      h({ id: "old", created_at: "2026-10-01", name: "Renee Kim", contact: "renee@x.com", block_id: "a" }),
      h({ id: "new", created_at: "2026-10-05", name: "Renee", contact: "Renee@x.com; (415) 555-1234", block_id: "b" }),
    ]);
    expect(p.keeperId).toBe("new");
    expect(p.duplicateIds).toEqual(["old"]);
    expect(p.update.name).toBe("Renee Kim");
    expect(p.update.block_id).toBe("b");
    expect(p.update.contact).toBe("Renee@x.com; (415) 555-1234");
  });
  it("still finds the email in a merged contact", () => {
    expect(hostEmail("(415) 555-1234; renee@x.com")).toBe("renee@x.com");
  });
});
