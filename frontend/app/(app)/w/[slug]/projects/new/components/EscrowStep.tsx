export function EscrowStep() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">
        4. Escrow & Launch
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Fund escrow and launch the project
      </p>

      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-2xl">
          🚀
        </div>
        <p className="mt-4 text-sm font-medium text-gray-600">
          Escrow & Launch
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Escrow amount, wallet connection, and launch settings will be configured here.
        </p>
      </div>
    </div>
  );
}
