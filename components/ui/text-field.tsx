import type { InputHTMLAttributes, ReactNode } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  /** Helpful text under the field, e.g. password rules. */
  hint?: ReactNode;
  /** Shown in red under the field; also marks the field as invalid. */
  error?: string;
  /** A small button inside the box, on the right (e.g. show password). */
  endAdornment?: ReactNode;
};

/**
 * A labelled text input with optional hint and error message.
 * The error and hint are linked to the input (aria-describedby), so screen
 * readers read them when the field is focused.
 */
export function TextField({
  id,
  label,
  hint,
  error,
  endAdornment,
  className = "",
  ...inputProps
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid content-start gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative grid">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30 ${
            error ? "border-red-600 dark:border-red-400" : "border-border"
          } ${endAdornment ? "pr-11" : ""} ${className}`}
          {...inputProps}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1">{endAdornment}</div>
        )}
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
