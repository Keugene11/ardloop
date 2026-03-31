import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg">
      <div className="text-center animate-slide-up">
        <h1 className="text-[42px] font-extrabold tracking-tight text-text">
          404
        </h1>
        <p className="text-[15px] text-text-muted mt-2 mb-8">
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#1a1a1a] text-white px-8 py-3.5 rounded-2xl font-semibold press text-[15px]"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
