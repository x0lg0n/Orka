// frontend/app/(app)/w/[slug]/projects/[id]/actions.proposal.test.ts
import { describe, it, expect, vi } from "vitest";

const mockCreateClient = vi.fn();
const mockGetActiveOrgId = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));
vi.mock("@/lib/stellar", () => ({
  orkaClient: vi.fn(),
}));
vi.mock("@/lib/proposalBlocks", () => ({
  blocksToMarkdown: () => "",
}));
vi.mock("@/lib/orka", () => ({
  getActiveOrgId: (...args: unknown[]) => mockGetActiveOrgId(...args),
}));

import { saveProposal } from "./actions";

describe("saveProposal", () => {
  it("inserts a proposal row + version 1 on first save", async () => {
    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() =>
            Promise.resolve({ data: null, error: null })
          ),
          single: vi.fn(() => Promise.resolve({ data: { id: "p1" }, error: null })),
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
            single: vi.fn(() => Promise.resolve({ data: { id: "p1" }, error: null })),
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { id: "p1" }, error: null })) })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      })),
      order: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
    }));
    const client = { from };
    mockCreateClient.mockResolvedValue(client);
    mockGetActiveOrgId.mockResolvedValue("org1");

    const res = await saveProposal({
      orgId: "org1",
      projectId: "proj1",
      title: "Proposal",
      blocks: [{ type: "paragraph", content: [{ type: "text", text: "hi" }] }],
      tags: ["client: Acme"],
    });
    expect(res.ok).toBe(true);
    expect(from).toHaveBeenCalledWith("project_proposals");
  });
});
