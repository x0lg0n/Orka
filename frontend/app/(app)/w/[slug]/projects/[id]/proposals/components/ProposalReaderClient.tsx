"use client";
import dynamic from "next/dynamic";

// BlockNote calls `window` during hook init — must be loaded client-side only.
// `ssr: false` is only valid inside a Client Component (not a Server Component),
// so this thin wrapper owns the dynamic import.
const ProposalReader = dynamic(
  () => import("./ProposalReader").then((m) => m.ProposalReader),
  { ssr: false }
);

export { ProposalReader as ProposalReaderClient };
