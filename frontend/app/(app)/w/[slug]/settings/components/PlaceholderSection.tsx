"use client";

interface PlaceholderSectionProps {
  title: string;
  description: string;
}

export default function PlaceholderSection({ title, description }: PlaceholderSectionProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-6 flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-400">Coming soon</p>
      </div>
    </div>
  );
}
