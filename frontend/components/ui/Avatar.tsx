export function Avatar({ name, className = "" }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className={`grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange to-violet text-sm font-extrabold text-white ${className}`}>
      {initials}
    </div>
  );
}
