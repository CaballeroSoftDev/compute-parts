import { Badge } from "@/components/ui/badge"
import { STATUS_COLORS } from "@/lib/constants"

interface StatusBadgeProps {
  status: keyof typeof STATUS_COLORS
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge className={STATUS_COLORS[status]}>{status}</Badge>
}
