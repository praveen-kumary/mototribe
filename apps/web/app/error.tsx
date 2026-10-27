"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Caught by Next.js Error Boundary:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10">
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h2>
        <p className="text-muted text-sm mb-4">
          {isDev
            ? "Please copy this error message and send it to the AI so it can fix the issue."
            : "An unexpected error occurred. Please try again or contact support if the issue persists."}
        </p>
        {isDev && (
          <div className="bg-black/50 p-4 rounded-xl text-left overflow-auto max-h-[300px]">
            <pre className="text-red-400 text-xs whitespace-pre-wrap font-mono">
              {error.name}: {error.message}
              {"\n\n"}
              {error.stack}
            </pre>
          </div>
        )}
        {!isDev && (
          <p className="text-xs text-muted font-mono">
            Error ID: {error.digest || "unknown"}
          </p>
        )}
        <button
          onClick={() => reset()}
          className="mt-6 px-6 py-2 bg-red-500 hover:bg-red-600 text-foreground rounded-lg font-bold transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
