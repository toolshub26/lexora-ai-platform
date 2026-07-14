"use client";

type ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  console.error(error);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-center text-gray-600">
        An unexpected error occurred.
      </p>

      <button
        onClick={reset}
        className="rounded-md bg-black px-4 py-2 text-white"
      >
        Try again
      </button>
    </main>
  );
}
