import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/queries/dashboard";

export async function DashboardSalesChart() {
  const stats = await getDashboardStats();

  return (
    <section className="mb-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base font-medium text-muted-foreground">
              Sales Trends
            </CardTitle>
            <div className="flex items-end gap-3">
              <p className="text-[32px] font-bold">
                ${stats.monthRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className={`text-base font-medium pb-1 flex items-center gap-1 ${
                stats.monthRevenueChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="h-4 w-4" />
                {stats.monthRevenueChange >= 0 ? '+' : ''}{stats.monthRevenueChange.toFixed(1)}% this month
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[220px] flex-1 flex-col">
            <svg
              fill="none"
              height="100%"
              preserveAspectRatio="none"
              viewBox="-3 0 478 150"
              width="100%"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z"
                fill="url(#paint0_linear)"
              />
              <path
                d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                stroke="hsl(var(--primary))"
                strokeLinecap="round"
                strokeWidth="3"
              />
              <defs>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint0_linear"
                  x1="236"
                  x2="236"
                  y1="1"
                  y2="149"
                >
                  <stop stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                  <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
