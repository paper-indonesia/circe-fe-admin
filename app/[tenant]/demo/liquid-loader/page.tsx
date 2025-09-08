"use client"

import LiquidLoading from "@/components/ui/liquid-loader";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LiquidLoaderDemo() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Liquid Loader Demo</h1>
          <p className="text-muted-foreground">Beautiful animated liquid loading effect</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Default Liquid Loader</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[300px] w-full items-center justify-center rounded-lg border bg-background">
              <LiquidLoading />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dark Background</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[300px] w-full items-center justify-center rounded-lg border bg-slate-900">
              <LiquidLoading />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Light Background</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[300px] w-full items-center justify-center rounded-lg border bg-white">
              <LiquidLoading />
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}