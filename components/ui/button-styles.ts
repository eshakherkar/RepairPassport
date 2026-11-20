/**
 * Shared button styles, used by both <ButtonLink> (navigation) and plain
 * <button> elements (actions such as "Try again"), so they look identical.
 */

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-background hover:bg-brand-hover",
  secondary: "border border-border bg-background hover:bg-surface",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = "",
) {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim();
}
