import { CircleCheck, TriangleAlert } from "lucide-react";

/** A message at the top of an auth form: an error, or a friendly notice. */
export function FormMessage({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  const isError = tone === "error";
  const Icon = isError ? TriangleAlert : CircleCheck;
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          : "border-transparent bg-brand-soft text-brand"
      }`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
