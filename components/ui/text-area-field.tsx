import type { ReactNode, TextareaHTMLAttributes } from "react";

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  /** Helpful text under the field. */
  hint?: ReactNode;
  /** Shown in red under the field; also marks the field as invalid. */
  error?: string;
};

/**
 * A labelled multi-line text box, styled to match <TextField>.
 * The error and hint are linked to it (aria-describedby), so screen
 * readers read them when the field is focused.
 */
export function TextAreaField({
  id,
  label,
  hint,
  error,
  className = "",
  ...textareaProps
}: TextAreaFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid content-start gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`min-h-24 rounded-lg border bg-background px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30 ${
          error ? "border-red-600 dark:border-red-400" : "border-border"
        } ${className}`}
        {...textareaProps}
      />
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
