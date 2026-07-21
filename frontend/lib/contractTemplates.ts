// frontend/lib/contractTemplates.ts
// PartialBlock is the type BlockNote accepts for initialContent.
// We use a loose shape so this file has zero @blocknote imports
// (avoids SSR issues in test/server contexts).
export type PartialBlock = {
  type: string;
  props?: Record<string, unknown>;
  content?:
    | string
    | Array<{ type: string; text: string; styles?: Record<string, unknown> }>;
};

export type ContractTemplateData = {
  projectName: string;
  orgName: string;
  clientName: string;
  amount: string;
  asset: string;
  deliverables: string[];
  milestoneCount: number;
  today: string;
};

function heading(text: string, level: 1 | 2 | 3 = 2): PartialBlock {
  return {
    type: "heading",
    props: { level },
    content: [{ type: "text", text, styles: {} }],
  };
}

function para(text: string): PartialBlock {
  return {
    type: "paragraph",
    content: [{ type: "text", text, styles: {} }],
  };
}

function bullet(text: string): PartialBlock {
  return {
    type: "bulletListItem",
    content: [{ type: "text", text, styles: {} }],
  };
}

function emptyPara(): PartialBlock {
  return { type: "paragraph", content: "" };
}

// Static proposal template — 8 sections, all empty for user to fill.
export const PROPOSAL_TEMPLATE: PartialBlock[] = [
  heading("Executive Summary"),
  emptyPara(),
  heading("About Us"),
  emptyPara(),
  heading("Scope of Work"),
  emptyPara(),
  heading("Deliverables"),
  bullet(""),
  bullet(""),
  heading("Timeline & Milestones"),
  emptyPara(),
  heading("Investment"),
  emptyPara(),
  heading("Terms & Conditions"),
  emptyPara(),
  heading("Next Steps"),
  emptyPara(),
];

// Contract template — pre-filled with project data from proposal.
export function buildContractTemplate(data: ContractTemplateData): PartialBlock[] {
  const deliverableBullets: PartialBlock[] =
    data.deliverables.length > 0
      ? data.deliverables.map((d) => bullet(d))
      : [bullet("")];

  return [
    heading("Service Agreement", 1),
    para(`Date: ${data.today}`),
    para(`Project: ${data.projectName}`),
    emptyPara(),

    heading("1. Parties"),
    para(
      `This Service Agreement ("Agreement") is entered into as of ${data.today} between ` +
        `${data.orgName} ("Agency") and ${data.clientName} ("Client").`
    ),
    emptyPara(),

    heading("2. Scope of Services"),
    para("The Agency agrees to provide the following services:"),
    ...deliverableBullets,
    emptyPara(),

    heading("3. Project Timeline"),
    para(
      `This project is structured across ${data.milestoneCount} milestone(s). ` +
        `Specific dates and deadlines are outlined below:`
    ),
    emptyPara(),

    heading("4. Payment Terms"),
    para(
      `The total project value is ${data.amount} ${data.asset}. ` +
        `Payment schedule and method are as follows:`
    ),
    emptyPara(),

    heading("5. Intellectual Property"),
    para(
      "Upon receipt of full and final payment, the Agency assigns to the Client all rights, " +
        "title, and interest in the work product created specifically for this project. " +
        "The Agency retains ownership of any pre-existing tools, frameworks, or methodologies used."
    ),
    emptyPara(),

    heading("6. Confidentiality"),
    para(
      "Both parties agree to keep confidential all non-public information disclosed during " +
        "this engagement and to use such information solely for the purposes of this Agreement."
    ),
    emptyPara(),

    heading("7. Revisions & Approval"),
    para(
      "The Client is entitled to two (2) rounds of revisions per deliverable. " +
        "Additional revisions will be billed at the Agency's standard hourly rate."
    ),
    emptyPara(),

    heading("8. Termination"),
    para(
      "Either party may terminate this Agreement with fourteen (14) days written notice. " +
        "The Client shall pay for all work completed up to the termination date."
    ),
    emptyPara(),

    heading("9. Governing Law"),
    para(
      "This Agreement shall be governed by and construed in accordance with applicable law. " +
        "Any disputes shall be resolved through binding arbitration."
    ),
    emptyPara(),

    heading("10. Signatures"),
    para("By signing below, both parties agree to the terms of this Agreement."),
    emptyPara(),
    para(`Agency (${data.orgName}): ___________________________   Date: ____________`),
    para(`Client (${data.clientName}): ___________________________   Date: ____________`),
  ];
}
