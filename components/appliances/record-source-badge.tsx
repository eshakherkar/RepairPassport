import { PenLine, Sparkles, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RecordSource } from "@/lib/types";

/** Shows where a repair record's details came from. */
export function RecordSourceBadge({ source }: { source: RecordSource }) {
  switch (source) {
    case "needs-review":
      return (
        <Badge tone="warning">
          <TriangleAlert className="size-3.5" aria-hidden="true" />
          Read by AI, needs review
        </Badge>
      );
    case "ai-extracted":
      return (
        <Badge tone="success">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Read by AI
        </Badge>
      );
    case "manual":
      return (
        <Badge>
          <PenLine className="size-3.5" aria-hidden="true" />
          Owner-entered
        </Badge>
      );
  }
}
