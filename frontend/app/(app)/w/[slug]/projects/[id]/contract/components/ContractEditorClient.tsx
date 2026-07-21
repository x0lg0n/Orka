"use client";
import dynamic from "next/dynamic";

const ContractEditor = dynamic(
  () => import("./ContractEditor").then((m) => m.ContractEditor),
  { ssr: false }
);

export { ContractEditor as ContractEditorClient };
