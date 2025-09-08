import type React from "react"
import { getTenantBySlug } from "@/lib/tenant"
import { getTenantServer } from "@/lib/tenant-server"
import { TenantProvider } from "@/lib/tenant-context"

export async function generateMetadata({
  params,
}: {
  params: { tenant: string }
}) {
  const tenant = getTenantBySlug(params.tenant) || await getTenantServer()
  
  return {
    title: tenant.metadata?.title || "Beauty Clinic Admin",
    description: tenant.metadata?.description || "Admin dashboard for beauty clinic management",
    icons: {
      icon: tenant.theme?.favicon || '/favicon.ico',
    },
  }
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tenant: string }
}) {
  const tenant = getTenantBySlug(params.tenant) || await getTenantServer()
  
  const tenantStyles = `
    :root {
      --tenant-primary: ${tenant.theme?.primaryColor || '#FF6B6B'};
      --tenant-secondary: ${tenant.theme?.secondaryColor || '#4ECDC4'};
    }
  `
  
  return (
    <TenantProvider tenantSlug={params.tenant}>
      <style dangerouslySetInnerHTML={{ __html: tenantStyles }} />
      {children}
    </TenantProvider>
  )
}