import { Suspense } from "react";
import { DashboardStats } from "./dashboard-stats";
import { DashboardRecentOrders } from "./dashboard-recent-orders";
import { DashboardSalesChart } from "./dashboard-sales-chart";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function StatsLoading() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-16" />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function ChartLoading() {
  return (
    <section className="mb-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-10 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[220px] w-full" />
        </CardContent>
      </Card>
    </section>
  );
}

function OrdersLoading() {
  return (
    <section>
      <Skeleton className="h-7 w-48 mb-3 mt-5" />
      <Card>
        <div className="p-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full mb-3" />
          ))}
        </div>
      </Card>
    </section>
  );
}

export default function AdminDashboard() {
  return (
    <div>
      {/* Page Header */}
      <header className="flex flex-wrap justify-between gap-3 items-center mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black leading-tight tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-base">
            Here&apos;s a summary of your store&apos;s performance.
          </p>
        </div>
        <Link href="/admin/products">
          <Button className="font-bold">
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </Link>
      </header>

      {/* Stats Grid */}
      <Suspense fallback={<StatsLoading />}>
        <DashboardStats />
      </Suspense>

      {/* Sales Chart */}
      <Suspense fallback={<ChartLoading />}>
        <DashboardSalesChart />
      </Suspense>

      {/* Recent Orders Table */}
      <Suspense fallback={<OrdersLoading />}>
        <DashboardRecentOrders />
      </Suspense>
    </div>
  );
}
