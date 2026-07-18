interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#11182d]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[#5f6b86]">{description}</p>
      </div>

      <div className="flex items-center justify-center rounded-xl border border-dashed border-[#e5e8f0] bg-white py-20">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-[#7c3aed]">
            Coming Soon
          </span>
          <p className="mt-3 text-sm text-[#5f6b86]">
            This page is under development.
          </p>
        </div>
      </div>
    </div>
  );
}
