export default function QuoteBlock({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-10 border-l-4 border-violet/30 py-2 pl-6">
      <p className="text-lead font-bold italic leading-7 text-night/70">
        &ldquo;{children}&rdquo;
      </p>
    </blockquote>
  );
}
