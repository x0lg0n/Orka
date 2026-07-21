"use client";
import dynamic from "next/dynamic";

const ContractReader = dynamic(
  () => import("./ContractReader").then((m) => m.ContractReader),
  { ssr: false }
);

export { ContractReader as ContractReaderClient };
