"use client"

import GradientLoading from "@/components/gradient-loading";

export default function DotLoaderDemo() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center rounded-lg border bg-background p-4">
      <GradientLoading />
    </div>
  );
}