interface ReadingProgressProps {
  current: number;
  goal: number;
}

export function ReadingProgress({ current, goal }: ReadingProgressProps) {
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-label={`Reading progress: ${current} of ${goal} books`}
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Progress Text */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          {current} of {goal} books read
        </span>
        <span className="font-semibold text-teal-600">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}
