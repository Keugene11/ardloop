"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg">
      <div className="text-center animate-slide-up">
        <h1 className="text-[42px] font-extrabold tracking-tight text-text">
          Oops
        </h1>
        <p className="text-[15px] text-text-muted mt-2 mb-8">
          Something went wrong. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-block bg-[#1a1a1a] text-white px-8 py-3.5 rounded-2xl font-semibold press text-[15px]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
