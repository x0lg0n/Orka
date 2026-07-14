export type Status = "success" | "warning" | "danger" | "info" | "neutral";

export function StatusPill({ status, label }: { status: Status; label: string }) {
  return <span className={`status-pill status-${status}`}>{label}</span>;
}
