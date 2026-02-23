'use client';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Something went wrong</h1>
          <p className="mb-4 text-sm text-gray-600">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={() => reset()}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
