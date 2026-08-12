/** The line itself. The hook that drives it lives in @/lib/useToast. */
export function Toast({ message }: { message: string | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-5"
    >
      {message && (
        <p className="animate-fade-up rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-paper shadow-lift">
          {message}
        </p>
      )}
    </div>
  );
}
