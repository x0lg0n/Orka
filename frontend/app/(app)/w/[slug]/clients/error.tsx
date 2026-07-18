"use client";

import { useEffect } from "react";

export default function ClientsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
      <p className="text-lg font-semibold text-red-700">
        Something went wrong loading clients.
      </p>
      <p className="text-sm text-red-500">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}
