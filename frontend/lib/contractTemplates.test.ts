// frontend/lib/contractTemplates.test.ts
import { describe, it, expect } from "vitest";
import { PROPOSAL_TEMPLATE, buildContractTemplate } from "./contractTemplates";

describe("PROPOSAL_TEMPLATE", () => {
  it("has 8 top-level sections", () => {
    const headings = PROPOSAL_TEMPLATE.filter((b) => b.type === "heading");
    expect(headings.length).toBe(8);
  });

  it("first heading is Executive Summary", () => {
    const first = PROPOSAL_TEMPLATE.find((b) => b.type === "heading");
    const text = (first?.content as Array<{ text: string }>)?.[0]?.text ?? "";
    expect(text).toBe("Executive Summary");
  });
});

describe("buildContractTemplate", () => {
  const data = {
    projectName: "ACME Website",
    orgName: "Studio One",
    clientName: "ACME Corp",
    amount: "5000",
    asset: "USDC",
    deliverables: ["Landing page", "Admin dashboard"],
    milestoneCount: 3,
    today: "2026-07-21",
  };

  it("returns an array of blocks", () => {
    const blocks = buildContractTemplate(data);
    expect(Array.isArray(blocks)).toBe(true);
    expect(blocks.length).toBeGreaterThan(5);
  });

  it("includes project name in heading text", () => {
    const blocks = buildContractTemplate(data);
    const allText = blocks
      .map((b) =>
        (b.content as Array<{ text?: string }>)
          ?.map((c) => c.text ?? "")
          .join("") ?? ""
      )
      .join(" ");
    expect(allText).toContain("ACME Website");
  });

  it("includes each deliverable as a bullet block", () => {
    const blocks = buildContractTemplate(data);
    const bullets = blocks.filter((b) => b.type === "bulletListItem");
    const texts = bullets.map(
      (b) =>
        (b.content as Array<{ text?: string }>)
          ?.map((c) => c.text ?? "")
          .join("") ?? ""
    );
    expect(texts).toContain("Landing page");
    expect(texts).toContain("Admin dashboard");
  });

  it("includes amount and asset in a paragraph", () => {
    const blocks = buildContractTemplate(data);
    const allText = blocks
      .map((b) =>
        (b.content as Array<{ text?: string }>)
          ?.map((c) => c.text ?? "")
          .join("") ?? ""
      )
      .join(" ");
    expect(allText).toContain("5000");
    expect(allText).toContain("USDC");
  });
});
