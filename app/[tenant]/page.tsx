import { redirect } from "next/navigation"

export default function HomePage({
  params
}: {
  params: { tenant: string }
}) {
  redirect(`/${params.tenant}/dashboard`)
}
