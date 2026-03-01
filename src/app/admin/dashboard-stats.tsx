import { TrendingUp, TrendingDown, Banknote, CreditCard, ShoppingBag, Paintbrush } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/queries/dashboard";

export async function DashboardStats({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const stats = await getDashboardStats(searchParams);

  const statsData = [
    {
      title: "Total Revenue",
      value: `Rs. ${stats.totalRevenue.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: stats.monthRevenueChange,
      changeText: stats.monthRevenueChange.toFixed(1),
      trend: stats.monthRevenueChange >= 0 ? "up" : "down",
      icon: Banknote,
    },
    {
      title: "Sales this Month",
      value: `Rs. ${stats.monthRevenue.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: stats.monthRevenueChange,
      changeText: stats.monthRevenueChange.toFixed(1),
      trend: stats.monthRevenueChange >= 0 ? "up" : "down",
      icon: CreditCard,
    },
    {
      title: "New Orders",
      value: stats.newOrders.toString(),
      change: stats.newOrdersChange,
      changeText: stats.newOrdersChange.toFixed(1),
      trend: stats.newOrdersChange >= 0 ? "up" : "down",
      icon: ShoppingBag,
    },
    {
      title: "Pending Customizations",
      value: stats.pendingCustomizations.toString(),
      change: stats.pendingCustomizationsChange,
      changeText: stats.pendingCustomizationsChange.toFixed(1),
      trend: stats.pendingCustomizationsChange >= 0 ? "up" : "down",
      icon: Paintbrush,
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={`text-xs font-medium mt-1 flex items-center gap-1 ${stat.trend === "up" ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
                  }`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {stat.change >= 0 ? '+' : ''}{stat.changeText}% vs last period
              </p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
