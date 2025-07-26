import type React from "react"
import { AdminLayout } from "@/components/admin-layout"
import { AdminProvider } from "@/lib/admin-context"

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminProvider>
  )
}
