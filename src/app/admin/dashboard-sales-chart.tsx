import { TrendingUp, TrendingDown, LineChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats, getSalesChartData } from "@/lib/queries/dashboard";
import { SalesChartClient } from "./sales-chart-client";

export async function DashboardSalesChart({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const [stats, chartData] = await Promise.all([
    getDashboardStats(searchParams),
    getSalesChartData(searchParams),
  ]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Sales Trends
          </CardTitle>
          <div className="flex items-end gap-3">
            <p className="text-[32px] font-bold">
              Rs. {stats.monthRevenue.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={`text-base font-medium pb-1 flex items-center gap-1 ${stats.monthRevenueChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
              {stats.monthRevenueChange >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {stats.monthRevenueChange >= 0 ? '+' : ''}{stats.monthRevenueChange.toFixed(1)}% vs previous
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-1 flex-col pt-4">
          <SalesChartClient data={chartData} />
        </div>
      </CardContent>
    </Card>
  );
}
