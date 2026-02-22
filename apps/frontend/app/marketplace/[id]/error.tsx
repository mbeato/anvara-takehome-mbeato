'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ad Slot Details</h1>
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="mb-2 text-lg font-semibold text-red-700">Something went wrong</h2>
        <p className="mb-4 text-sm text-red-600">
          {error.message || 'Failed to load ad slot details. Please try again.'}
        </p>
        <button
          onClick={() => reset()}
          className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
