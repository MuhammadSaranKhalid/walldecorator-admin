import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/queries/dashboard";

export async function DashboardStats() {
  const stats = await getDashboardStats();

  const statsData = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: stats.monthRevenueChange,
      changeText: stats.monthRevenueChange.toFixed(1),
      trend: stats.monthRevenueChange >= 0 ? "up" : "down",
    },
    {
      title: "Sales this Month",
      value: `$${stats.monthRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: stats.monthRevenueChange,
      changeText: stats.monthRevenueChange.toFixed(1),
      trend: stats.monthRevenueChange >= 0 ? "up" : "down",
    },
    {
      title: "New Orders",
      value: stats.newOrders.toString(),
      change: stats.newOrdersChange,
      changeText: stats.newOrdersChange.toFixed(1),
      trend: stats.newOrdersChange >= 0 ? "up" : "down",
    },
    {
      title: "Pending Customizations",
      value: stats.pendingCustomizations.toString(),
      change: stats.pendingCustomizationsChange,
      changeText: stats.pendingCustomizationsChange.toFixed(1),
      trend: stats.pendingCustomizationsChange >= 0 ? "up" : "down",
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statsData.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
            <p
              className={`text-sm font-medium mt-1 flex items-center gap-1 ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {stat.trend === "up" ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {stat.change >= 0 ? '+' : ''}{stat.changeText}%
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
