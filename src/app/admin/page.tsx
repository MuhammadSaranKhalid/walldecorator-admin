import { Suspense } from "react";
import { DashboardStats } from "./dashboard-stats";
import { DashboardRecentOrders } from "./dashboard-recent-orders";
import { DashboardSalesChart } from "./dashboard-sales-chart";
import { DashboardDateFilter } from "./dashboard-date-filter";
import { DashboardInventoryAlerts } from "./dashboard-inventory-alerts";
import { DashboardTopProducts } from "./dashboard-top-products";
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
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-10 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

function OrdersLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
      </CardHeader>
      <CardContent>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full mb-3" />
        ))}
      </CardContent>
    </Card>
  );
}

function CardLoading() {
  return (
    <Card className="h-full min-h-[300px]">
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
      </CardHeader>
      <CardContent>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full mb-3" />
        ))}
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboard(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your store&apos;s performance.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <DashboardDateFilter />
          <Link href="/admin/products">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <Suspense fallback={<StatsLoading />}>
        <DashboardStats searchParams={searchParams} />
      </Suspense>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Sales Chart (Takes up more space) */}
        <div className="col-span-1 lg:col-span-4 self-start">
          <Suspense fallback={<ChartLoading />}>
            <DashboardSalesChart searchParams={searchParams} />
          </Suspense>
        </div>

        {/* Recent Orders (Takes up less space, side column) */}
        <div className="col-span-1 lg:col-span-3">
          <Suspense fallback={<OrdersLoading />}>
            <DashboardRecentOrders searchParams={searchParams} />
          </Suspense>
        </div>
      </div>

      {/* Secondary Insights Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<CardLoading />}>
          <DashboardInventoryAlerts />
        </Suspense>

        <Suspense fallback={<CardLoading />}>
          <DashboardTopProducts />
        </Suspense>
      </div>
    </div>
  );
}
