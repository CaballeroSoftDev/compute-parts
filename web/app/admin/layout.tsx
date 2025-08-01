import type React from "react"
import { AdminLayout } from "@/components/admin-layout"
import { AdminProvider } from "@/lib/admin-context"
import { AdminGuard } from "@/components/auth-guard"

export default function Layout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<AdminGuard>
			<AdminProvider>
				<AdminLayout>{children}</AdminLayout>
			</AdminProvider>
		</AdminGuard>
	)
}
