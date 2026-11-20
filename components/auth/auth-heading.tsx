/** Title and short description at the top of each sign-in/sign-up card. */
export function AuthHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-pretty text-muted">{description}</p>
    </div>
  );
}

/** Grey placeholder for a form while its page reads the URL. */
export function AuthFormSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <div className="grid gap-4 motion-safe:animate-pulse" aria-hidden="true">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="grid gap-1.5">
          <div className="h-4 w-20 rounded bg-border" />
          <div className="h-10 rounded-lg bg-border" />
        </div>
      ))}
      <div className="h-10 rounded-lg bg-border" />
    </div>
  );
}
