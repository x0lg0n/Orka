function CircularProgress({ pct }: { pct: number }) {
  const radius = 44;
  const stroke = 6;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative flex h-[100px] w-[100px] items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="#f3f4f6"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="url(#storageGradient)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <defs>
          <linearGradient id="storageGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-gray-900">{pct}%</span>
        <span className="text-[10px] text-gray-400">Used</span>
      </div>
    </div>
  );
}

export function StorageOverview() {
  const usedGB = 6.8;
  const totalGB = 10;
  const availableGB = totalGB - usedGB;
  const pct = Math.round((usedGB / totalGB) * 100);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Storage Overview</h3>

      <div className="mt-3 flex justify-center">
        <CircularProgress pct={pct} />
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Used</span>
          <span className="font-medium text-gray-900">{usedGB} GB</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Total</span>
          <span className="font-medium text-gray-900">{totalGB} GB</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Available</span>
          <span className="font-medium text-emerald-600">
            {availableGB} GB
          </span>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#7c3aed] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        className="mt-3 flex w-full items-center justify-center rounded-lg border border-gray-200 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
      >
        Manage Storage
      </button>
    </div>
  );
}
