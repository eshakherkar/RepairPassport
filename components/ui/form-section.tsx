import Link from "next/link";
import { useId, type ReactNode } from "react";
import { buttonClassName } from "./button-styles";
import { FormMessage } from "./form-message";

/** A group of related fields with a heading, laid out in two columns on wider screens. */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    // role="group" + aria-labelledby: screen readers announce the section
    // title when moving into its fields (like a <fieldset> and <legend>,
    // which can't be laid out in columns reliably).
    <div role="group" aria-labelledby={id} className="grid gap-5 md:grid-cols-3 md:gap-8">
      <div>
        <h2 id={id} className="font-semibold">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-pretty text-muted">{description}</p>}
      </div>
      <div className="grid content-start gap-4 sm:grid-cols-2 md:col-span-2">{children}</div>
    </div>
  );
}

/** Messages at the top of a form: a general error and/or how many answers need fixing. */
export function FormErrors({
  error,
  fieldErrorCount,
  thing,
}: {
  error?: string;
  fieldErrorCount: number;
  /** What's being saved, e.g. "the appliance". */
  thing: string;
}) {
  return (
    <>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      {fieldErrorCount > 0 && (
        <FormMessage tone="error">
          {fieldErrorCount === 1
            ? `One answer needs fixing before ${thing} can be saved.`
            : `${fieldErrorCount} answers need fixing before ${thing} can be saved.`}
        </FormMessage>
      )}
    </>
  );
}

/** The Cancel link and submit button at the bottom of a form. */
export function FormActions({
  cancelHref,
  submitLabel,
  pending,
}: {
  cancelHref: string;
  submitLabel: string;
  pending: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
      <Link href={cancelHref} className={buttonClassName("secondary")}>
        Cancel
      </Link>
      <button
        type="submit"
        disabled={pending}
        className={buttonClassName("primary", "md", "disabled:opacity-70")}
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}
