import type { ReactNode, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  /** Helpful text under the field. */
  hint?: ReactNode;
  /** Shown in red under the field; also marks the field as invalid. */
  error?: string;
  children: ReactNode;
};

/**
 * A labelled drop-down list, styled to match <TextField>.
 * The error and hint are linked to the select (aria-describedby), so screen
 * readers read them when the field is focused.
 */
export function SelectField({
  id,
  label,
  hint,
  error,
  className = "",
  children,
  ...selectProps
}: SelectFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid content-start gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-10 w-full appearance-none rounded-lg border bg-background pr-9 pl-3 text-sm outline-none transition-colors focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30 ${
            error ? "border-red-600 dark:border-red-400" : "border-border"
          } ${className}`}
          {...selectProps}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p id={errorId} className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
      {hint && (
        <div id={hintId} className="text-sm text-muted">
          {hint}
        </div>
      )}
    </div>
  );
}
