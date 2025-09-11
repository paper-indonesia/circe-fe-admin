import dynamic from "next/dynamic"

// Dynamically import the client component
const LandingPageClient = dynamic(() => import("./landing-page"), {
  ssr: false,
})

export default function LandingPage() {
  return <LandingPageClient />
}