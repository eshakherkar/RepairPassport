"use client";

import { Printer } from "lucide-react";
import { buttonClassName } from "@/components/ui/button-styles";

/** Opens the browser's print dialog (print or save as PDF). */
export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClassName("primary")}>
      <Printer className="size-4" aria-hidden="true" />
      Print passport
    </button>
  );
}
