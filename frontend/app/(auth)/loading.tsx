export default function AuthLoading() {
  return (
    <section aria-busy="true" aria-label="Checking your session">
      <span className="sr-only">Checking your session</span>
      <div className="animate-pulse">
        <div className="h-10 w-56 rounded-md bg-muted" />
        <div className="mt-4 h-5 w-full max-w-sm rounded-md bg-muted" />
        <div className="mt-2 h-5 w-4/5 rounded-md bg-muted" />

        <div className="mt-9 rounded-lg border bg-white p-1">
          <div className="h-10 rounded-md bg-muted" />
        </div>
        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-12 rounded-lg border bg-white" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-12 rounded-lg border bg-white" />
          </div>
          <div className="h-12 rounded-lg bg-violet/20" />
        </div>
      </div>
    </section>
  );
}
