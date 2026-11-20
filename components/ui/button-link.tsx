import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonClassName, type ButtonSize, type ButtonVariant } from "./button-styles";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/**
 * A link that looks like a button. Use it for navigation actions such as
 * "Add appliance". (Use a real <button> for actions that don't change page.)
 */
export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClassName(variant, size, className)} {...props} />
  );
}
